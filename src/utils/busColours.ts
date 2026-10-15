// Okabe-Ito colours: distinguishable with the common kinds of colour blindness. The trip list also names each
// bus, so colour is never the only thing telling the buses apart.
const COLOURS = ['#0072B2', '#D55E00', '#009E73', '#CC79A7', '#E69F00', '#56B4E9'];

export const busColour = (index: number) => COLOURS[index % COLOURS.length];
