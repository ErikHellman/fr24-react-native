import React from 'react';
import { TouchableOpacity } from '@gorhom/bottom-sheet';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { borderRadius } from '../../constants/theme';

export type SheetHandleProps = {
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
};

export const SheetHandle: React.FC<SheetHandleProps> = ({ onPress, style }) => {
  return (
    <TouchableOpacity
      testID="sheet-handle"
      style={[styles.wrap, style]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel="Change flight details sheet size"
      accessibilityHint="Double tap to expand or collapse the sheet"
    >
      <View style={styles.handle} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    paddingBottom: 10,
  },
  handle: {
    alignSelf: 'center',
    width: 48,
    height: 5,
    borderRadius: borderRadius.full,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    marginBottom: 12,
  },
});
