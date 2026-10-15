// Builds the app, serves it, and runs Lighthouse in real Chrome several times.
// Usage: node perf/lighthouse.mjs [--runs 3] [--min-quality 95] [--base /]
// --min-quality fails the run when the median accessibility, best-practices or SEO score is lower.
// The page loads live data from a public API, so performance is reported but not enforced.
import { spawn, spawnSync } from 'node:child_process';

const flag = (name, fallback) => {
  const i = process.argv.indexOf(`--${name}`);
  return i > -1 ? process.argv[i + 1] : fallback;
};
const runs = Number(flag('runs', 3));
const minQuality = flag('min-quality', undefined);
const base = flag('base', '/');
const APP = `http://localhost:4173${base}`;
const chrome =
  process.env.CHROME_PATH ??
  (process.platform === 'darwin'
    ? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
    : 'google-chrome');
const median = (xs) => [...xs].sort((a, b) => a - b)[Math.floor(xs.length / 2)];

const build = spawnSync('npm', ['run', 'build'], {
  env: { ...process.env, VITE_BASE: base },
  stdio: 'ignore',
});
if (build.status !== 0) throw new Error('build failed');
const preview = spawn('npx', ['vite', 'preview', '--port', '4173', '--strictPort'], {
  env: { ...process.env, VITE_BASE: base },
  stdio: 'ignore',
});
process.on('exit', () => preview.kill());

try {
  for (let i = 0; i < 80; i++) {
    try {
      await fetch(APP);
      break;
    } catch {
      await new Promise((r) => setTimeout(r, 250));
    }
  }
  const results = [];
  for (let i = 0; i < runs; i++) {
    const lh = spawnSync(
      'npx',
      [
        '-y',
        'lighthouse',
        APP,
        '--output=json',
        '--output-path=stdout',
        '--quiet',
        '--chrome-flags=--headless=new --no-sandbox',
      ],
      { env: { ...process.env, CHROME_PATH: chrome }, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 },
    );
    if (lh.status !== 0) throw new Error(`lighthouse failed: ${lh.stderr.slice(0, 300)}`);
    const c = JSON.parse(lh.stdout).categories;
    results.push({
      performance: Math.round(c.performance.score * 100),
      accessibility: Math.round(c.accessibility.score * 100),
      bestPractices: Math.round(c['best-practices'].score * 100),
      seo: Math.round(c.seo.score * 100),
    });
  }
  const med = Object.fromEntries(Object.keys(results[0]).map((k) => [k, median(results.map((r) => r[k]))]));
  console.log(`Median of ${runs} runs, mobile emulation:`);
  for (const [k, v] of Object.entries(med)) console.log(`  ${k.padEnd(14)} ${v}`);
  const weak = ['accessibility', 'bestPractices', 'seo'].filter(
    (k) => minQuality !== undefined && med[k] < Number(minQuality),
  );
  if (weak.length > 0) {
    console.error(`\n${weak.join(', ')} below the minimum of ${minQuality}.`);
    process.exitCode = 1;
  }
} finally {
  preview.kill();
}
