import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { AirportEntry } from '../../types/airport';
import { colors, borderRadius, spacing } from '../../constants/theme';

export type SearchResultsProps = {
  airports: AirportEntry[];
  onSelect: (airport: AirportEntry) => void;
};

export const SearchResults: React.FC<SearchResultsProps> = ({ airports, onSelect }) => {
  if (airports.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      {airports.map((airport, index) => (
        <Pressable
          key={airport.iata}
          testID={`search-result-${airport.iata}`}
          style={[
            styles.item,
            index === airports.length - 1 ? styles.itemLast : null,
          ]}
          onPress={() => onSelect(airport)}
        >
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
        </Pressable>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: spacing.md,
    borderRadius: borderRadius.sm,
    overflow: 'hidden',
    backgroundColor: colors.backgroundTranslucent,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.borderSubtle,
  },
  item: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.borderSubtle,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.lg,
  },
  itemLast: {
    borderBottomWidth: 0,
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
});
