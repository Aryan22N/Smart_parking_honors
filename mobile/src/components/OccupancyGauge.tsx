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
  const isHigh = percentClamped >= 85;
  const isMedium = percentClamped >= 60;

  const barColor = isHigh ? COLORS.occupied : isMedium ? COLORS.warning : COLORS.available;
  const statusLabel = isHigh ? 'Critical Occupancy' : isMedium ? 'Moderate Traffic' : 'Optimal Capacity';
  const statusBg = isHigh ? COLORS.occupiedBg : isMedium ? COLORS.warningBg : COLORS.availableBg;
  const statusText = isHigh ? COLORS.occupiedText : isMedium ? COLORS.warningText : COLORS.availableText;

  return (
    <View style={styles.card}>
      <View style={styles.topRow}>
        <View>
          <Text style={styles.metaTitle}>OCCUPANCY DYNAMICS</Text>
          <Text style={styles.mainTitle}>
            {available > 0 ? `${available} Bays Ready for Parking` : 'Facility is Currently Full'}
          </Text>
        </View>

        <View style={[styles.statusBadge, { backgroundColor: statusBg }]}>
          <View style={[styles.statusDot, { backgroundColor: barColor }]} />
          <Text style={[styles.statusBadgeText, { color: statusText }]}>{statusLabel}</Text>
        </View>
      </View>

      {/* Big Percent Indicator */}
      <View style={styles.metricRow}>
        <Text style={[styles.percentNumber, { color: barColor }]}>
          {percentClamped.toFixed(1)}%
        </Text>
        <View style={styles.capacityRatioPill}>
          <Text style={styles.capacityRatioText}>
            <Text style={{ fontWeight: '900', color: COLORS.textDark }}>{occupied}</Text>
            <Text style={{ color: COLORS.textMuted }}> of </Text>
            <Text style={{ fontWeight: '800', color: COLORS.textDark }}>{total} slots</Text>
          </Text>
        </View>
      </View>

      {/* Progress Track */}
      <View style={styles.progressBarWrapper}>
        <View style={styles.progressBarBg}>
          <View
            style={[
              styles.progressBarFill,
              { width: `${percentClamped}%`, backgroundColor: barColor },
            ]}
          />
        </View>
      </View>

      {/* Status Legend Row */}
      <View style={styles.legendRow}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: COLORS.available }]} />
          <Text style={styles.legendLabel}>Available: <Text style={styles.legendBold}>{available}</Text></Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: COLORS.occupied }]} />
          <Text style={styles.legendLabel}>Occupied: <Text style={styles.legendBold}>{occupied}</Text></Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: COLORS.textSlate }]} />
          <Text style={styles.legendLabel}>Capacity: <Text style={styles.legendBold}>{total}</Text></Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.cardSurface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 16,
    marginVertical: 8,
    shadowColor: COLORS.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  metaTitle: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.primary,
    letterSpacing: 0.8,
  },
  mainTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.textDark,
    marginTop: 2,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 5,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: '800',
  },
  metricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 12,
  },
  percentNumber: {
    fontSize: 32,
    fontWeight: '900',
    letterSpacing: -1,
    lineHeight: 36,
  },
  capacityRatioPill: {
    backgroundColor: COLORS.cardSurfaceAlt,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  capacityRatioText: {
    fontSize: 11,
  },
  progressBarWrapper: {
    marginBottom: 12,
  },
  progressBarBg: {
    height: 8,
    backgroundColor: '#E2E8F0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  legendRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: 10,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },
  legendLabel: {
    fontSize: 11,
    color: COLORS.textMuted,
  },
  legendBold: {
    fontWeight: '800',
    color: COLORS.textDark,
  },
});
