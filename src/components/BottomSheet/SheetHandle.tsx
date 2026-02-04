import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { colors, borderRadius } from '../../constants/theme';

export type SheetHandleProps = {
  onPress: () => void;
};

export const SheetHandle: React.FC<SheetHandleProps> = ({ onPress }) => {
  return (
    <Pressable testID="sheet-handle" style={styles.wrap} onPress={onPress}>
      <View style={styles.handle} />
    </Pressable>
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
