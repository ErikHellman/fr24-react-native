import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Animated, useWindowDimensions } from 'react-native';
import { FlightPositionFull } from '../types/flight';
import { animation } from '../constants/theme';

export type SheetState = 'collapsed' | 'half' | 'full';

export type UseBottomSheetReturn = {
  selectedFlight: FlightPositionFull | null;
  sheetState: SheetState;
  sheetTranslateY: Animated.Value;
  sheetFullHeight: number;
  sheetHalfHeight: number;
  sheetCollapsedHeight: number;
  setSelectedFlight: (flight: FlightPositionFull | null) => void;
  openSheet: () => void;
  expandSheetFull: () => void;
  collapseSheet: () => void;
  closeSheet: () => void;
  cycleSheetState: () => void;
};

const COLLAPSED_HEIGHT = 96;

export const useBottomSheet = (): UseBottomSheetReturn => {
  const [selectedFlight, setSelectedFlight] = useState<FlightPositionFull | null>(null);
  const [sheetState, setSheetState] = useState<SheetState>('collapsed');
  const { height: screenHeight } = useWindowDimensions();

  const sheetHalfHeight = useMemo(() => Math.round(screenHeight * 0.5), [screenHeight]);
  const sheetFullHeight = useMemo(() => Math.round(screenHeight * 0.92), [screenHeight]);
  const sheetCollapsedHeight = COLLAPSED_HEIGHT;

  const sheetTranslateY = useRef(new Animated.Value(screenHeight)).current;

  // Reset sheet position when flight is deselected
  useEffect(() => {
    if (!selectedFlight) {
      sheetTranslateY.setValue(sheetFullHeight);
    }
  }, [selectedFlight, sheetFullHeight, sheetTranslateY]);

  const animateSheetTo = useCallback(
    (state: SheetState) => {
      const visibleHeight =
        state === 'full'
          ? sheetFullHeight
          : state === 'half'
            ? sheetHalfHeight
            : sheetCollapsedHeight;

      Animated.timing(sheetTranslateY, {
        toValue: sheetFullHeight - visibleHeight,
        duration: animation.sheetDuration,
        useNativeDriver: true,
      }).start();
    },
    [sheetCollapsedHeight, sheetFullHeight, sheetHalfHeight, sheetTranslateY],
  );

  // Animate when state changes
  useEffect(() => {
    if (selectedFlight) {
      animateSheetTo(sheetState);
    }
  }, [animateSheetTo, selectedFlight, sheetState]);

  const openSheet = useCallback(() => {
    setSheetState('half');
  }, []);

  const expandSheetFull = useCallback(() => {
    setSheetState('full');
  }, []);

  const collapseSheet = useCallback(() => {
    setSheetState('collapsed');
  }, []);

  const closeSheet = useCallback(() => {
    Animated.timing(sheetTranslateY, {
      toValue: sheetFullHeight,
      duration: animation.closeDuration,
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (finished) {
        setSelectedFlight(null);
        setSheetState('collapsed');
      }
    });
  }, [sheetFullHeight, sheetTranslateY]);

  const cycleSheetState = useCallback(() => {
    if (sheetState === 'collapsed') {
      setSheetState('half');
    } else if (sheetState === 'half') {
      setSheetState('full');
    } else {
      setSheetState('collapsed');
    }
  }, [sheetState]);

  return {
    selectedFlight,
    sheetState,
    sheetTranslateY,
    sheetFullHeight,
    sheetHalfHeight,
    sheetCollapsedHeight,
    setSelectedFlight,
    openSheet,
    expandSheetFull,
    collapseSheet,
    closeSheet,
    cycleSheetState,
  };
};
