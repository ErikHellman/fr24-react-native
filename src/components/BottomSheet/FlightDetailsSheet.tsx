import React, { useCallback } from 'react';
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetBackdropProps,
  BottomSheetHandleProps,
  BottomSheetView,
} from '@gorhom/bottom-sheet';
import { StyleSheet, Text, View } from 'react-native';
import { FlightPositionFull } from '../../types/flight';
import { SheetState } from '../../hooks/useBottomSheet';
import { colors, sheetColors, borderRadius, spacing } from '../../constants/theme';
import { SheetHandle } from './SheetHandle';
import { FlightInfo } from './FlightInfo';

export type FlightDetailsSheetProps = {
  flight: FlightPositionFull;
  sheetState: SheetState;
  sheetIndex: number;
  snapPoints: Array<string | number>;
  onSheetChange: (index: number) => void;
  onSheetClose: () => void;
  onCycleState: () => void;
};

export const FlightDetailsSheet: React.FC<FlightDetailsSheetProps> = ({
  flight,
  sheetState,
  sheetIndex,
  snapPoints,
  onSheetChange,
  onSheetClose,
  onCycleState,
}) => {
  const title = flight.flight ?? flight.callsign ?? 'Flight Details';

  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop
        {...props}
        appearsOnIndex={1}
        disappearsOnIndex={0}
        pressBehavior="close"
        style={[props.style, styles.backdrop]}
        testID="sheet-backdrop"
      />
    ),
    []
  );

  const renderHandle = useCallback(
    (props: BottomSheetHandleProps) => (
      <SheetHandle onPress={onCycleState} style={props.style} />
    ),
    [onCycleState]
  );

  return (
    <BottomSheet
      index={sheetIndex}
      snapPoints={snapPoints}
      onChange={onSheetChange}
      onClose={onSheetClose}
      enablePanDownToClose
      backdropComponent={renderBackdrop}
      handleComponent={renderHandle}
      backgroundStyle={styles.sheet}
    >
      <BottomSheetView style={styles.content}>
        <View style={styles.header}>
          <Text
            style={styles.title}
            testID="sheet-title"
            accessibilityRole="header"
            accessibilityLabel="Flight details title"
          >
            {title}
          </Text>
        </View>
        <FlightInfo flight={flight} collapsed={sheetState === 'collapsed'} />
      </BottomSheetView>
    </BottomSheet>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    backgroundColor: colors.backdrop,
  },
  sheet: {
    backgroundColor: sheetColors.background,
    borderTopLeftRadius: borderRadius.lg,
    borderTopRightRadius: borderRadius.lg,
  },
  content: {
    flex: 1,
    paddingTop: spacing.md,
    paddingHorizontal: spacing.xxl,
    paddingBottom: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  title: {
    color: sheetColors.title,
    fontSize: 20,
    fontWeight: '700',
  },
});
