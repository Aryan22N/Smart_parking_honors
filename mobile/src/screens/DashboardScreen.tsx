import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { COLORS } from '../constants/colors';
import { Header } from '../components/Header';
import { OccupancyGauge } from '../components/OccupancyGauge';
import { StatCard } from '../components/StatCard';
import { slotsApi, sessionsApi, reportsApi } from '../api/endpoints';
import { SlotAvailabilitySummary, ParkingSession, DailyRevenue } from '../types';
import { formatCurrency, formatTimeOnly } from '../utils/formatting';

interface DashboardScreenProps {
  onNavigateToBook: () => void;
  onNavigateToSlots: () => void;
  onNavigateToActive: () => void;
  onNavigateToRevenue: () => void;
}

export const DashboardScreen: React.FC<DashboardScreenProps> = ({
  onNavigateToBook,
  onNavigateToSlots,
  onNavigateToActive,
  onNavigateToRevenue,
}) => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [availability, setAvailability] = useState<SlotAvailabilitySummary>({
    totalSlots: 20,
    availableSlots: 20,
    occupiedSlots: 0,
    occupancyRatePercent: 0,
  });

  const [activeSessions, setActiveSessions] = useState<ParkingSession[]>([]);
  const [todayRevenue, setTodayRevenue] = useState<DailyRevenue | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setError(null);
      const [availRes, activeRes, revRes] = await Promise.all([
        slotsApi.getAvailability(),
        sessionsApi.getActive(),
        reportsApi.getDailyRevenue(),
      ]);

      setAvailability(availRes);
      setActiveSessions(activeRes);
      setTodayRevenue(revRes);
    } catch (err: any) {
      setError(err.message || 'Failed to connect to backend server.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Connecting to Smart Parking Server...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header
        title="Smart Parking"
        subtitle="Real-time facility management & analytics"
        badge="ONLINE"
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
        showsVerticalScrollIndicator={false}
      >
        {error && (
          <View style={styles.errorBanner}>
            <Text style={styles.errorTitle}>Connection Warning</Text>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryBtn} onPress={fetchData}>
              <Text style={styles.retryBtnText}>Retry Connection</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Occupancy Indicator */}
        <OccupancyGauge
          total={availability.totalSlots}
          available={availability.availableSlots}
          occupied={availability.occupiedSlots}
          occupancyPercent={availability.occupancyRatePercent}
        />

        {/* Quick Stats Grid */}
        <View style={styles.statsRow}>
          <StatCard
            label="Available"
            value={availability.availableSlots}
            variant="available"
            subValue="Ready to park"
          />
          <StatCard
            label="Occupied"
            value={availability.occupiedSlots}
            variant="occupied"
            subValue="Vehicles parked"
          />
          <StatCard
            label="Total Capacity"
            value={availability.totalSlots}
            variant="primary"
            subValue="All bays"
          />
        </View>

        {/* Today's Revenue Summary Card */}
        <TouchableOpacity style={styles.revenueCard} onPress={onNavigateToRevenue}>
          <View style={styles.revenueHeader}>
            <View>
              <Text style={styles.revenueLabel}>TODAY'S REVENUE</Text>
              <Text style={styles.revenueAmount}>
                {formatCurrency(todayRevenue?.totalFinalizedCharges ?? 0)}
              </Text>
            </View>
            <View style={styles.revenueBadge}>
              <Text style={styles.revenueBadgeText}>
                {todayRevenue?.completedSessionsCount ?? 0} Completed
              </Text>
            </View>
          </View>

          <View style={styles.revenueBreakdown}>
            <View style={styles.breakdownItem}>
              <Text style={styles.breakdownLabel}>Paid Revenue:</Text>
              <Text style={[styles.breakdownValue, { color: COLORS.available }]}>
                {formatCurrency(todayRevenue?.paidRevenue ?? 0)}
              </Text>
            </View>
            <View style={styles.breakdownItem}>
              <Text style={styles.breakdownLabel}>Outstanding Unpaid:</Text>
              <Text style={[styles.breakdownValue, { color: COLORS.warning }]}>
                {formatCurrency(todayRevenue?.unpaidOutstandingAmount ?? 0)}
              </Text>
            </View>
          </View>
        </TouchableOpacity>

        {/* Action Shortcuts */}
        <View style={styles.actionRow}>
          <TouchableOpacity style={styles.actionBtnPrimary} onPress={onNavigateToBook}>
            <Text style={styles.actionBtnPrimaryText}>+ Book Vehicle Entry</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtnSecondary} onPress={onNavigateToSlots}>
            <Text style={styles.actionBtnSecondaryText}>View Slot Grid</Text>
          </TouchableOpacity>
        </View>

        {/* Active Parking Sessions Preview */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Active Parking Sessions ({activeSessions.length})</Text>
          <TouchableOpacity onPress={onNavigateToActive}>
            <Text style={styles.seeAllText}>Manage All →</Text>
          </TouchableOpacity>
        </View>

        {activeSessions.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>No Active Parked Vehicles</Text>
            <Text style={styles.emptyText}>All parking slots are currently free and available.</Text>
          </View>
        ) : (
          activeSessions.slice(0, 3).map((session) => (
            <View key={session.id} style={styles.sessionCard}>
              <View style={styles.sessionLeft}>
                <View style={styles.slotTag}>
                  <Text style={styles.slotTagText}>{session.slotNumber}</Text>
                </View>
                <View>
                  <Text style={styles.vehicleText}>{session.vehicleNumber}</Text>
                  <Text style={styles.timeText}>Entered: {formatTimeOnly(session.entryTime)}</Text>
                </View>
              </View>

              <View style={styles.sessionRight}>
                <Text style={styles.durationText}>{session.durationFormatted}</Text>
                <Text style={styles.estFeeText}>{formatCurrency(session.totalFee)}</Text>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bgPrimary,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  centerContainer: {
    flex: 1,
    backgroundColor: COLORS.bgPrimary,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 14,
    fontSize: 14,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  errorBanner: {
    backgroundColor: COLORS.occupiedBg,
    borderColor: COLORS.occupied,
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    marginBottom: 14,
  },
  errorTitle: {
    color: COLORS.occupiedText,
    fontSize: 14,
    fontWeight: '800',
  },
  errorText: {
    color: COLORS.textPrimary,
    fontSize: 12,
    marginTop: 4,
  },
  retryBtn: {
    backgroundColor: COLORS.cardBgElevated,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  retryBtnText: {
    color: COLORS.textPrimary,
    fontSize: 12,
    fontWeight: '700',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginVertical: 10,
  },
  revenueCard: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 16,
    marginVertical: 10,
  },
  revenueHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  revenueLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textMuted,
    letterSpacing: 0.5,
  },
  revenueAmount: {
    fontSize: 24,
    fontWeight: '900',
    color: COLORS.available,
    marginTop: 2,
  },
  revenueBadge: {
    backgroundColor: COLORS.cardBgElevated,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  revenueBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.primaryLight,
  },
  revenueBreakdown: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: 10,
  },
  breakdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  breakdownLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  breakdownValue: {
    fontSize: 12,
    fontWeight: '700',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
    marginVertical: 12,
  },
  actionBtnPrimary: {
    flex: 1.2,
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionBtnPrimaryText: {
    color: COLORS.bgPrimary,
    fontSize: 14,
    fontWeight: '800',
  },
  actionBtnSecondary: {
    flex: 1,
    backgroundColor: COLORS.cardBgElevated,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  actionBtnSecondaryText: {
    color: COLORS.textPrimary,
    fontSize: 14,
    fontWeight: '700',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  seeAllText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.primary,
  },
  emptyCard: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 14,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  emptyTitle: {
    color: COLORS.textPrimary,
    fontSize: 14,
    fontWeight: '700',
  },
  emptyText: {
    color: COLORS.textSecondary,
    fontSize: 12,
    marginTop: 4,
    textAlign: 'center',
  },
  sessionCard: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sessionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  slotTag: {
    backgroundColor: COLORS.primaryDark,
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 8,
  },
  slotTagText: {
    color: COLORS.textPrimary,
    fontSize: 12,
    fontWeight: '800',
  },
  vehicleText: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  timeText: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  sessionRight: {
    alignItems: 'flex-end',
  },
  durationText: {
    fontSize: 11,
    color: COLORS.textSecondary,
  },
  estFeeText: {
    fontSize: 15,
    fontWeight: '900',
    color: COLORS.available,
    marginTop: 2,
  },
});
