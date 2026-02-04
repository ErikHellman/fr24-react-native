import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { SearchBar } from './SearchBar';

describe('SearchBar', () => {
  it('renders with placeholder text', () => {
    const { getByPlaceholderText } = render(
      <SearchBar value="" onChangeText={jest.fn()} />
    );

    expect(
      getByPlaceholderText('Search flights, callsign, airport...')
    ).toBeTruthy();
  });

  it('renders with custom placeholder', () => {
    const { getByPlaceholderText } = render(
      <SearchBar value="" onChangeText={jest.fn()} placeholder="Custom placeholder" />
    );

    expect(getByPlaceholderText('Custom placeholder')).toBeTruthy();
  });

  it('displays current value', () => {
    const { getByDisplayValue } = render(
      <SearchBar value="SFO" onChangeText={jest.fn()} />
    );

    expect(getByDisplayValue('SFO')).toBeTruthy();
  });

  it('calls onChangeText when typing', () => {
    const onChangeText = jest.fn();
    const { getByTestId } = render(
      <SearchBar value="" onChangeText={onChangeText} />
    );

    fireEvent.changeText(getByTestId('search-input'), 'LAX');

    expect(onChangeText).toHaveBeenCalledWith('LAX');
  });

  it('updates displayed value when prop changes', () => {
    const { getByDisplayValue, rerender } = render(
      <SearchBar value="SFO" onChangeText={jest.fn()} />
    );

    expect(getByDisplayValue('SFO')).toBeTruthy();

    rerender(<SearchBar value="JFK" onChangeText={jest.fn()} />);

    expect(getByDisplayValue('JFK')).toBeTruthy();
  });
});
