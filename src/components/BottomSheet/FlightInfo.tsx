import React, { useMemo } from 'react';
import { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { StyleSheet, Text, View } from 'react-native';
import { FlightPositionFull } from '../../types/flight';
import { borderRadius, colors, spacing } from '../../constants/theme';

export type FlightInfoProps = {
  flight: FlightPositionFull;
  collapsed?: boolean;
};

type FlightDetailRow = [string, string | number | null];
type FlightDetailSection = {
  title: string;
  items: FlightDetailRow[];
};

const formatValue = (value: string | number | null) => {
  if (value === null || value === undefined) {
    return '—';
  }

  return String(value);
};

const formatAccessibleValue = (value: string | number | null) => {
  if (value === null || value === undefined) {
    return 'Not available';
  }

  return String(value);
};

const getFlightSections = (flight: FlightPositionFull): FlightDetailSection[] => [
  {
    title: 'Identification',
    items: [
      ['FR24 ID', flight.fr24_id],
      ['Flight', flight.flight],
      ['Callsign', flight.callsign],
      ['Hex', flight.hex],
      ['Squawk', flight.squawk],
    ],
  },
  {
    title: 'Position',
    items: [
      ['Latitude', flight.lat],
      ['Longitude', flight.lon],
      ['Track', flight.track],
      ['Altitude (ft)', flight.alt],
      ['Ground Speed (kt)', flight.gspeed],
      ['Vertical Speed (fpm)', flight.vspeed],
    ],
  },
  {
    title: 'Route',
    items: [
      ['Origin IATA', flight.orig_iata],
      ['Origin ICAO', flight.orig_icao],
      ['Destination IATA', flight.dest_iata],
      ['Destination ICAO', flight.dest_icao],
      ['ETA', flight.eta],
    ],
  },
  {
    title: 'Aircraft',
    items: [
      ['Type', flight.type],
      ['Registration', flight.reg],
      ['Painted As', flight.painted_as],
      ['Operating As', flight.operating_as],
    ],
  },
  {
    title: 'Source',
    items: [
      ['Timestamp', flight.timestamp],
      ['Source', flight.source],
    ],
  },
];

const FlightDetailRow: React.FC<{ label: string; value: string | number | null }> = ({
  label,
  value,
}) => (
  <View style={styles.row} testID={`flight-detail-${label}`}>
    <Text style={styles.label} accessibilityLabel={`${label} label`}>
      {label}
    </Text>
    <Text
      style={styles.value}
      accessibilityLabel={`${label} value ${formatAccessibleValue(value)}`}
    >
      {formatValue(value)}
    </Text>
  </View>
);

export const FlightInfo: React.FC<FlightInfoProps> = ({ flight, collapsed = false }) => {
  const flightSections = useMemo(() => getFlightSections(flight), [flight]);

  if (collapsed) {
    const collapsedSection = flightSections.find(
      (section) => section.title === 'Identification'
    );
    const collapsedDetails =
      collapsedSection?.items.filter(
        ([label]) => label === 'FR24 ID' || label === 'Callsign'
      ) ?? [];

    return (
      <View style={styles.content}>
        <View style={styles.section}>
          <Text
            style={styles.sectionTitle}
            accessibilityRole="header"
            accessibilityLabel="Identification section header"
          >
            Identification
          </Text>
          {collapsedDetails.map(([label, value]) => (
            <FlightDetailRow key={label} label={label} value={value} />
          ))}
        </View>
      </View>
    );
  }

  return (
    <BottomSheetScrollView
      style={styles.scroll}
      contentContainerStyle={styles.content}
      accessibilityLabel="Flight details list"
    >
      {flightSections.map((section) => (
        <View key={section.title} style={styles.section}>
          <Text
            style={styles.sectionTitle}
            accessibilityRole="header"
            accessibilityLabel={`${section.title} section header`}
          >
            {section.title}
          </Text>
          {section.items.map(([label, value]) => (
            <FlightDetailRow key={label} label={label} value={value} />
          ))}
        </View>
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
  section: {
    backgroundColor: colors.searchBackground,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '700',
    marginBottom: spacing.sm,
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
    fontSize: 14,
  },
  value: {
    color: colors.white,
    fontSize: 15,
    maxWidth: '55%',
    textAlign: 'right',
  },
});
