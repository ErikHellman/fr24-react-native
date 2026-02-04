import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { AirportEntry } from '../../types/airport';
import { colors, borderRadius, spacing } from '../../constants/theme';

export type SelectedAirportProps = {
  airport: AirportEntry;
  onClose: () => void;
};

export const SelectedAirport: React.FC<SelectedAirportProps> = ({ airport, onClose }) => {
  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <View style={styles.meta}>
          <Text style={styles.title}>{airport.name}</Text>
          <Text style={styles.subtitle}>
            {airport.city}, {airport.country}
          </Text>
        </View>
        <View style={styles.codes}>
          <Text style={styles.code}>{airport.iata}</Text>
          <Text style={styles.codeMuted}>{airport.icao}</Text>
        </View>
        <Pressable testID="close-button" onPress={onClose} hitSlop={8}>
          <Text style={styles.close}>X</Text>
        </Pressable>
      </View>
    </View>
  );
};

export type NoResultsProps = {
  onClose: () => void;
};

export const NoResults: React.FC<NoResultsProps> = ({ onClose }) => {
  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <Text style={styles.noResultsText}>No airports found.</Text>
        <Pressable testID="no-results-close-button" onPress={onClose} hitSlop={8}>
          <Text style={styles.close}>X</Text>
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: spacing.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.backgroundTranslucent,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.borderSubtle,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.lg,
  },
  meta: {
    flex: 1,
    gap: spacing.xs,
  },
  codes: {
    alignItems: 'flex-end',
  },
  title: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '700',
  },
  subtitle: {
    color: colors.whiteFaded,
    fontSize: 11,
  },
  code: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '700',
  },
  codeMuted: {
    color: colors.whiteSubtle,
    fontSize: 10,
    fontWeight: '600',
  },
  close: {
    color: 'rgba(255, 255, 255, 0.75)',
    fontSize: 12,
    fontWeight: '700',
  },
  noResultsText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '600',
  },
});
