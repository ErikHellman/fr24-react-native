import React from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { FlightPositionFull } from '../../types/flight';
import { SheetState } from '../../hooks/useBottomSheet';
import { colors, borderRadius, spacing } from '../../constants/theme';
import { SheetHandle } from './SheetHandle';
import { FlightInfo } from './FlightInfo';

export type FlightDetailsSheetProps = {
  flight: FlightPositionFull;
  sheetState: SheetState;
  sheetTranslateY: Animated.Value;
  sheetFullHeight: number;
  onCycleState: () => void;
  onExpand: () => void;
  onCollapse: () => void;
  onClose: () => void;
};

export const FlightDetailsSheet: React.FC<FlightDetailsSheetProps> = ({
  flight,
  sheetState,
  sheetTranslateY,
  sheetFullHeight,
  onCycleState,
  onExpand,
  onCollapse,
  onClose,
}) => {
  const title = flight.flight ?? flight.callsign ?? 'Flight Details';

  return (
    <>
      {sheetState !== 'collapsed' && (
        <Pressable
          testID="sheet-backdrop"
          style={styles.backdrop}
          onPress={onClose}
        />
      )}
      <Animated.View
        testID="flight-details-sheet"
        style={[
          styles.sheet,
          {
            height: sheetFullHeight,
            transform: [{ translateY: sheetTranslateY }],
          },
        ]}
      >
        <SheetHandle onPress={onCycleState} />
        <View style={styles.header}>
          <Text style={styles.title} testID="sheet-title">
            {title}
          </Text>
          <View style={styles.actions}>
            {sheetState !== 'full' ? (
              <Pressable testID="expand-button" onPress={onExpand} hitSlop={10}>
                <Text style={styles.action}>Expand</Text>
              </Pressable>
            ) : (
              <Pressable testID="collapse-button" onPress={onCollapse} hitSlop={10}>
                <Text style={styles.action}>Collapse</Text>
              </Pressable>
            )}
            <Pressable testID="close-button" onPress={onClose} hitSlop={10}>
              <Text style={styles.close}>Close</Text>
            </Pressable>
          </View>
        </View>
        <FlightInfo flight={flight} collapsed={sheetState === 'collapsed'} />
      </Animated.View>
    </>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.backdrop,
  },
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.background,
    borderTopLeftRadius: borderRadius.lg,
    borderTopRightRadius: borderRadius.lg,
    paddingTop: spacing.md,
    paddingHorizontal: spacing.xxl,
    paddingBottom: spacing.xxl,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
  },
  title: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '700',
  },
  action: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  close: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '600',
  },
});
