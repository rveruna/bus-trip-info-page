import { fireEvent, render, screen } from '@testing-library/react';
import { RoutePicker } from '../RoutePicker';
import { makePlace } from '../../../test/mockApi';

/** Chooses the option with this visible text, as a person would in the select. */
const selectOption = (select: HTMLElement, text: string) => {
  const option = Array.from((select as HTMLSelectElement).options).find((o) => o.text === text)!;
  fireEvent.change(select, { target: { value: option.value } });
};

const places = [makePlace(2, 'Edinburgh'), makePlace(1, 'Dundee'), makePlace(3, 'Aberdeen')];

const setup = (origin = 1, destination = 2) => {
  const handlers = { onOriginChange: jest.fn(), onDestinationChange: jest.fn(), onSwap: jest.fn() };
  render(<RoutePicker places={places} origin={origin} destination={destination} {...handlers} />);
  return handlers;
};

describe('RoutePicker', () => {
  it('lists the places alphabetically and selects the current ones', () => {
    setup();

    const options = Array.from((screen.getByLabelText('From') as HTMLSelectElement).options).map(
      (o) => o.text,
    );
    expect(options).toEqual(['Aberdeen', 'Dundee', 'Edinburgh']);
    expect((screen.getByLabelText('From') as HTMLSelectElement).value).toBe('1');
    expect((screen.getByLabelText('To') as HTMLSelectElement).value).toBe('2');
  });

  it('reports a newly chosen origin and destination as ids', async () => {
    const { onOriginChange, onDestinationChange } = setup();

    selectOption(screen.getByLabelText('From'), 'Aberdeen');
    selectOption(screen.getByLabelText('To'), 'Dundee');

    expect(onOriginChange).toHaveBeenCalledWith(3);
    expect(onDestinationChange).toHaveBeenCalledWith(1);
  });

  it('reports a swap', async () => {
    const { onSwap } = setup();

    fireEvent.click(screen.getByRole('button', { name: /swap/i }));

    expect(onSwap).toHaveBeenCalledTimes(1);
  });

  it('keeps a place from the address in the list even if the API does not offer it', () => {
    setup(999, 2);

    expect((screen.getByLabelText('From') as HTMLSelectElement).value).toBe('999');
  });

  it('does not reload the page when the form is submitted', () => {
    setup();

    const notPrevented = fireEvent.submit(screen.getByRole('form', { name: /choose a route/i }));

    expect(notPrevented).toBe(false);
  });
});
