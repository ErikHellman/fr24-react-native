import React from 'react';
import { StyleSheet, TextInput } from 'react-native';
import { colors, borderRadius, spacing } from '../../constants/theme';

export type SearchBarProps = {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
};

export const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChangeText,
  placeholder = 'Search flights, callsign, airport...',
}) => {
  return (
    <TextInput
      testID="search-input"
      placeholder={placeholder}
      placeholderTextColor={colors.whiteFaded}
      style={styles.input}
      value={value}
      onChangeText={onChangeText}
    />
  );
};

const styles = StyleSheet.create({
  input: {
    height: 44,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.xl,
    color: colors.white,
    backgroundColor: colors.searchBackground,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
});
