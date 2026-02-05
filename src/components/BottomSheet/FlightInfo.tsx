import React, { useMemo } from 'react';
import { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { StyleSheet, Text, View } from 'react-native';
import { FlightPositionFull } from '../../types/flight';
import { colors, spacing } from '../../constants/theme';

export type FlightInfoProps = {
  flight: FlightPositionFull;
  collapsed?: boolean;
};

type FlightDetailRow = [string, string | number | null];

const getFlightDetails = (flight: FlightPositionFull): FlightDetailRow[] => {
  return [
    ['FR24 ID', flight.fr24_id],
    ['Flight', flight.flight],
    ['Callsign', flight.callsign],
    ['Latitude', flight.lat],
    ['Longitude', flight.lon],
    ['Track', flight.track],
    ['Altitude (ft)', flight.alt],
    ['Ground Speed (kt)', flight.gspeed],
    ['Vertical Speed (fpm)', flight.vspeed],
    ['Squawk', flight.squawk],
    ['Timestamp', flight.timestamp],
    ['Source', flight.source],
    ['Hex', flight.hex],
    ['Type', flight.type],
    ['Registration', flight.reg],
    ['Painted As', flight.painted_as],
    ['Operating As', flight.operating_as],
    ['Origin IATA', flight.orig_iata],
    ['Origin ICAO', flight.orig_icao],
    ['Destination IATA', flight.dest_iata],
    ['Destination ICAO', flight.dest_icao],
    ['ETA', flight.eta],
  ];
};

const FlightDetailRow: React.FC<{ label: string; value: string | number | null }> = ({
  label,
  value,
}) => (
  <View style={styles.row} testID={`flight-detail-${label}`}>
    <Text style={styles.label}>{label}</Text>
    <Text style={styles.value}>
      {value === null || value === undefined ? '—' : String(value)}
    </Text>
  </View>
);

export const FlightInfo: React.FC<FlightInfoProps> = ({ flight, collapsed = false }) => {
  const flightDetails = useMemo(() => getFlightDetails(flight), [flight]);

  if (collapsed) {
    const collapsedDetails = flightDetails.filter(
      ([label]) => label === 'FR24 ID' || label === 'Callsign'
    );

    return (
      <View style={styles.content}>
        {collapsedDetails.map(([label, value]) => (
          <FlightDetailRow key={label} label={label} value={value} />
        ))}
      </View>
    );
  }

  return (
    <BottomSheetScrollView style={styles.scroll} contentContainerStyle={styles.content}>
      {flightDetails.map(([label, value]) => (
        <FlightDetailRow key={label} label={label} value={value} />
      ))}
    </BottomSheetScrollView>
  );
};

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
  },
  content: {
    paddingBottom: spacing.lg,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.borderSubtle,
  },
  label: {
    color: colors.whiteMuted,
    fontSize: 12,
  },
  value: {
    color: colors.white,
    fontSize: 12,
    maxWidth: '55%',
    textAlign: 'right',
  },
});
