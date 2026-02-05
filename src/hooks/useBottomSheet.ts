import { useCallback, useEffect, useMemo, useState } from 'react';
import { FlightPositionFull } from '../types/flight';

export type SheetState = 'collapsed' | 'half' | 'full';

export type UseBottomSheetReturn = {
  selectedFlight: FlightPositionFull | null;
  sheetState: SheetState;
  sheetIndex: number;
  snapPoints: Array<string | number>;
  setSelectedFlight: (flight: FlightPositionFull | null) => void;
  openSheet: () => void;
  expandSheetFull: () => void;
  collapseSheet: () => void;
  closeSheet: () => void;
  cycleSheetState: () => void;
  handleSheetChange: (index: number) => void;
  handleSheetClose: () => void;
};

const COLLAPSED_HEIGHT = 96;
const HALF_SNAP = '50%';
const FULL_SNAP = '92%';

export const useBottomSheet = (): UseBottomSheetReturn => {
  const [selectedFlight, setSelectedFlight] = useState<FlightPositionFull | null>(null);
  const [sheetIndex, setSheetIndex] = useState(0);
  const [sheetState, setSheetState] = useState<SheetState>('collapsed');

  const snapPoints = useMemo<Array<string | number>>(
    () => [COLLAPSED_HEIGHT, HALF_SNAP, FULL_SNAP],
    []
  );

  useEffect(() => {
    if (!selectedFlight && sheetIndex !== 0) {
      setSheetIndex(0);
      setSheetState('collapsed');
    }
  }, [selectedFlight, sheetIndex]);

  const openSheet = useCallback(() => {
    setSheetIndex(1);
    setSheetState('half');
  }, []);

  const expandSheetFull = useCallback(() => {
    setSheetIndex(2);
    setSheetState('full');
  }, []);

  const collapseSheet = useCallback(() => {
    setSheetIndex(0);
    setSheetState('collapsed');
  }, []);

  const closeSheet = useCallback(() => {
    setSheetIndex(-1);
  }, []);

  const handleSheetChange = useCallback((index: number) => {
    setSheetIndex(index);
    if (index >= 0) {
      if (index === 0) {
        setSheetState('collapsed');
      } else if (index === 1) {
        setSheetState('half');
      } else {
        setSheetState('full');
      }
    }
  }, []);

  const handleSheetClose = useCallback(() => {
    setSelectedFlight(null);
    setSheetIndex(0);
    setSheetState('collapsed');
  }, []);

  const cycleSheetState = useCallback(() => {
    if (sheetState === 'collapsed') {
      setSheetIndex(1);
      setSheetState('half');
      return;
    }
    if (sheetState === 'half') {
      setSheetIndex(2);
      setSheetState('full');
      return;
    }
    setSheetIndex(0);
    setSheetState('collapsed');
  }, [sheetState]);

  return {
    selectedFlight,
    sheetIndex,
    snapPoints,
    sheetState,
    setSelectedFlight,
    openSheet,
    expandSheetFull,
    collapseSheet,
    closeSheet,
    cycleSheetState,
    handleSheetChange,
    handleSheetClose,
  };
};
