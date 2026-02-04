import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { SheetHandle } from './SheetHandle';

describe('SheetHandle', () => {
  it('renders handle bar', () => {
    const { getByTestId } = render(<SheetHandle onPress={jest.fn()} />);

    expect(getByTestId('sheet-handle')).toBeTruthy();
  });

  it('calls onPress when tapped', () => {
    const onPress = jest.fn();
    const { getByTestId } = render(<SheetHandle onPress={onPress} />);

    fireEvent.press(getByTestId('sheet-handle'));

    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('calls onPress multiple times on multiple taps', () => {
    const onPress = jest.fn();
    const { getByTestId } = render(<SheetHandle onPress={onPress} />);

    fireEvent.press(getByTestId('sheet-handle'));
    fireEvent.press(getByTestId('sheet-handle'));
    fireEvent.press(getByTestId('sheet-handle'));

    expect(onPress).toHaveBeenCalledTimes(3);
  });
});
