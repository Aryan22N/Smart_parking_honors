import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../constants/colors';

interface OccupancyGaugeProps {
  total: number;
  available: number;
  occupied: number;
  occupancyPercent: number;
}

export const OccupancyGauge: React.FC<OccupancyGaugeProps> = ({
  total,
  available,
  occupied,
  occupancyPercent,
}) => {
  const percentClamped = Math.min(100, Math.max(0, occupancyPercent));
  const isHigh = percentClamped >= 80;
  const barColor = isHigh ? COLORS.occupied : percentClamped >= 50 ? COLORS.warning : COLORS.available;

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.title}>Facility Occupancy</Text>
          <Text style={styles.subtitle}>
            {available} of {total} slots available
          </Text>
        </View>
        <View style={[styles.percentBadge, { borderColor: barColor }]}>
          <Text style={[styles.percentText, { color: barColor }]}>
            {percentClamped.toFixed(1)}%
          </Text>
        </View>
      </View>

      <View style={styles.barBackground}>
        <View
          style={[
            styles.barFill,
            { width: `${percentClamped}%`, backgroundColor: barColor },
          ]}
        />
      </View>

      <View style={styles.legendRow}>
        <View style={styles.legendItem}>
          <View style={[styles.dot, { backgroundColor: COLORS.available }]} />
          <Text style={styles.legendText}>Available: {available}</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.dot, { backgroundColor: COLORS.occupied }]} />
          <Text style={styles.legendText}>Occupied: {occupied}</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.dot, { backgroundColor: COLORS.textMuted }]} />
          <Text style={styles.legendText}>Total: {total}</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginVertical: 10,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  subtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  percentBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1.5,
    backgroundColor: COLORS.bgPrimary,
  },
  percentText: {
    fontSize: 15,
    fontWeight: '800',
  },
  barBackground: {
    height: 12,
    backgroundColor: COLORS.bgPrimary,
    borderRadius: 6,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 12,
  },
  barFill: {
    height: '100%',
    borderRadius: 6,
  },
  legendRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 4,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
});
