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
  
  const statusColor = isHigh ? COLORS.occupied : isMedium ? COLORS.warning : COLORS.available;
  const statusBg = isHigh ? COLORS.occupiedBg : isMedium ? COLORS.warningBg : COLORS.availableBg;
  const statusText = isHigh ? 'CRITICAL / CONGESTED' : isMedium ? 'MODERATE CAPACITY' : 'OPTIMAL / FREE FLOW';

  return (
    <View style={styles.card}>
      {/* Top Deck Title & Status Pill */}
      <View style={styles.headerRow}>
        <View style={styles.headerLeft}>
          <Text style={styles.metaLabel}>FACILITY OCCUPANCY</Text>
          <Text style={styles.mainStatus}>
            {available > 0 ? `${available} Bays Ready to Park` : 'Facility Fully Occupied'}
          </Text>
        </View>

        <View style={[styles.statusTag, { backgroundColor: statusBg, borderColor: statusColor }]}>
          <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
          <Text style={[styles.statusTagText, { color: statusColor }]}>{statusText}</Text>
        </View>
      </View>

      {/* Hero Metric Row */}
      <View style={styles.metricRow}>
        <View style={styles.metricLeft}>
          <Text style={[styles.bigPercent, { color: statusColor }]}>
            {percentClamped.toFixed(1)}%
          </Text>
          <Text style={styles.percentSub}>Active bay utilization rate</Text>
        </View>

        <View style={styles.metricRight}>
          <View style={styles.ratioPill}>
            <Text style={styles.ratioValue}>
              <Text style={{ color: COLORS.occupiedText, fontWeight: '900' }}>{occupied}</Text>
              <Text style={{ color: COLORS.textMuted }}> / </Text>
              <Text style={{ color: COLORS.textPrimary }}>{total}</Text>
            </Text>
            <Text style={styles.ratioLabel}>Bays in use</Text>
          </View>
        </View>
      </View>

      {/* Segmented Progress Track */}
      <View style={styles.trackContainer}>
        <View style={styles.trackBackground}>
          <View
            style={[
              styles.trackFill,
              { width: `${percentClamped}%`, backgroundColor: statusColor },
            ]}
          />
        </View>
        {/* Notches for 25%, 50%, 75% */}
        <View style={[styles.notch, { left: '25%' }]} />
        <View style={[styles.notch, { left: '50%' }]} />
        <View style={[styles.notch, { left: '75%' }]} />
      </View>

      {/* Telemetry Legend Pills */}
      <View style={styles.legendGrid}>
        <View style={styles.legendCard}>
          <View style={[styles.legendIndicator, { backgroundColor: COLORS.available }]} />
          <View>
            <Text style={styles.legendNumber}>{available}</Text>
            <Text style={styles.legendLabel}>Available</Text>
          </View>
        </View>

        <View style={styles.legendCard}>
          <View style={[styles.legendIndicator, { backgroundColor: COLORS.occupied }]} />
          <View>
            <Text style={styles.legendNumber}>{occupied}</Text>
            <Text style={styles.legendLabel}>Occupied</Text>
          </View>
        </View>

        <View style={styles.legendCard}>
          <View style={[styles.legendIndicator, { backgroundColor: COLORS.primaryLight }]} />
          <View>
            <Text style={styles.legendNumber}>{total}</Text>
            <Text style={styles.legendLabel}>Total Bays</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 4,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  headerLeft: {
    flex: 1,
  },
  metaLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.primaryLight,
    letterSpacing: 1,
    marginBottom: 3,
  },
  mainStatus: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  statusTag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    gap: 6,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusTagText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  metricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 14,
  },
  metricLeft: {
    flexDirection: 'column',
  },
  bigPercent: {
    fontSize: 36,
    fontWeight: '900',
    letterSpacing: -1,
    lineHeight: 40,
  },
  percentSub: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  metricRight: {
    alignItems: 'flex-end',
  },
  ratioPill: {
    backgroundColor: COLORS.cardBgElevated,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  ratioValue: {
    fontSize: 16,
    fontWeight: '800',
  },
  ratioLabel: {
    fontSize: 10,
    color: COLORS.textMuted,
    fontWeight: '600',
    marginTop: 1,
  },
  trackContainer: {
    position: 'relative',
    height: 12,
    marginBottom: 16,
    justifyContent: 'center',
  },
  trackBackground: {
    height: 10,
    backgroundColor: COLORS.inputBg,
    borderRadius: 6,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  trackFill: {
    height: '100%',
    borderRadius: 6,
  },
  notch: {
    position: 'absolute',
    top: 1,
    width: 2,
    height: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    zIndex: 2,
  },
  legendGrid: {
    flexDirection: 'row',
    gap: 10,
  },
  legendCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 8,
  },
  legendIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendNumber: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  legendLabel: {
    fontSize: 10,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
});
