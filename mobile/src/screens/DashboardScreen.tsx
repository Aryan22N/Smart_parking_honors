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
import { EmptyState } from '../components/EmptyState';
import { Icon } from '../components/Icon';
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
        <Text style={styles.loadingTitle}>Connecting to ParkEase Core</Text>
        <Text style={styles.loadingSub}>Loading real-time bay telemetry...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header
        title="Dashboard"
        subtitle="Facility overview & real-time operations"
        badge="ONLINE"
        rightActionText="Sync"
        onRightAction={fetchData}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />
        }
        showsVerticalScrollIndicator={false}
      >
        {error && (
          <View style={styles.errorCard}>
            <View style={styles.errorIconBox}>
              <Icon name="alert" size={14} color={COLORS.occupiedText} />
            </View>
            <View style={styles.errorContent}>
              <Text style={styles.errorTitle}>Connection Notice</Text>
              <Text style={styles.errorText}>{error}</Text>
              <TouchableOpacity style={styles.retryBtn} onPress={fetchData} activeOpacity={0.8}>
                <Text style={styles.retryBtnText}>Retry Sync</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Quick Action Commands: Vehicle Entry & Checkout */}
        <View style={styles.quickActionDeck}>
          <TouchableOpacity
            style={styles.actionBtnEntry}
            onPress={onNavigateToBook}
            activeOpacity={0.85}
          >
            <View style={styles.actionIconCircle}>
              <Icon name="entry" size={16} color="#FFFFFF" />
            </View>
            <View style={styles.actionTexts}>
              <Text style={styles.actionPrimaryTitle}>Vehicle Entry</Text>
              <Text style={styles.actionPrimarySub}>Register & assign bay</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionBtnCheckout}
            onPress={onNavigateToActive}
            activeOpacity={0.85}
          >
            <View style={styles.actionIconCircleNavy}>
              <Icon name="clock" size={15} color="#FFFFFF" />
            </View>
            <View style={styles.actionTexts}>
              <Text style={styles.actionSecondaryTitle}>Checkout</Text>
              <Text style={styles.actionSecondarySub}>Exit & collect fee</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Occupancy Visualization */}
        <OccupancyGauge
          total={availability.totalSlots}
          available={availability.availableSlots}
          occupied={availability.occupiedSlots}
          occupancyPercent={availability.occupancyRatePercent}
        />

        {/* Balanced 2x2 Statistics Matrix */}
        <View style={styles.statsDeck}>
          <View style={styles.statsRow}>
            <StatCard
              label="Available Bays"
              value={availability.availableSlots}
              variant="available"
              subValue="Ready to park"
              iconName="check"
            />
            <StatCard
              label="Occupied Bays"
              value={availability.occupiedSlots}
              variant="occupied"
              subValue="Vehicles parked"
              iconName="car"
            />
          </View>

          <View style={styles.statsRow}>
            <StatCard
              label="Total Capacity"
              value={availability.totalSlots}
              variant="default"
              subValue="All facility bays"
              iconName="bays"
            />
            <TouchableOpacity
              style={styles.revenueStatCard}
              onPress={onNavigateToRevenue}
              activeOpacity={0.85}
            >
              <View style={styles.revenueAccentBar} />
              <View style={styles.revenueCardContent}>
                <View style={styles.revenueHeaderRow}>
                  <Text style={styles.revenueLabel}>TODAY'S REVENUE</Text>
                  <View style={styles.revenueIconBox}>
                    <Icon name="revenue" size={11} color={COLORS.primaryDark} />
                  </View>
                </View>
                <Text style={styles.revenueAmount}>
                  {formatCurrency(todayRevenue?.totalFinalizedCharges ?? 0)}
                </Text>
                <Text style={styles.revenueSub} numberOfLines={1}>
                  {todayRevenue?.completedSessionsCount ?? 0} Checkouts →
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Active Parking Sessions Feed */}
        <View style={styles.sectionHeaderRow}>
          <View style={styles.sectionTitleGroup}>
            <Text style={styles.sectionTitle}>Active Parking</Text>
            <View style={styles.countBadge}>
              <Text style={styles.countBadgeText}>{activeSessions.length} Vehicles</Text>
            </View>
          </View>

          <TouchableOpacity onPress={onNavigateToActive} activeOpacity={0.7}>
            <Text style={styles.seeAllText}>View All →</Text>
          </TouchableOpacity>
        </View>

        {activeSessions.length === 0 ? (
          <EmptyState
            iconName="bays"
            title="All Bays Vacant"
            description="There are currently no active parked vehicles in the facility. Check-in a vehicle to monitor duration."
            actionLabel="+ Register Vehicle Entry"
            onAction={onNavigateToBook}
          />
        ) : (
          activeSessions.slice(0, 3).map((session) => (
            <TouchableOpacity
              key={session.id}
              style={styles.sessionCard}
              onPress={onNavigateToActive}
              activeOpacity={0.85}
            >
              <View style={styles.sessionLeft}>
                <View style={styles.bayBadge}>
                  <Text style={styles.bayBadgeLabel}>BAY</Text>
                  <Text style={styles.bayBadgeNumber}>{session.slotNumber}</Text>
                </View>

                <View>
                  <Text style={styles.vehicleNumber}>{session.vehicleNumber}</Text>
                  <Text style={styles.entryTime}>
                    Checked-in at {formatTimeOnly(session.entryTime)}
                  </Text>
                </View>
              </View>

              <View style={styles.sessionRight}>
                <Text style={styles.durationBadge}>{session.durationFormatted}</Text>
                <Text style={styles.feeEstimate}>{formatCurrency(session.totalFee)}</Text>
              </View>
            </TouchableOpacity>
          ))
        )}

        {/* View All Slots Grid Shortcut */}
        <TouchableOpacity style={styles.slotsShortcutCard} onPress={onNavigateToSlots} activeOpacity={0.85}>
          <View style={styles.shortcutIconBox}>
            <Icon name="map" size={16} color={COLORS.primaryDark} />
          </View>
          <View style={styles.shortcutTexts}>
            <Text style={styles.shortcutTitle}>View Parking Bay Layout</Text>
            <Text style={styles.shortcutSub}>Visual grid of all {availability.totalSlots} parking bays</Text>
          </View>
          <Icon name="arrow-right" size={14} color={COLORS.textMuted} />
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.canvasBg,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 36,
  },
  centerContainer: {
    flex: 1,
    backgroundColor: COLORS.canvasBg,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  loadingTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textDark,
    marginTop: 14,
  },
  loadingSub: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 4,
  },
  errorCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.occupiedBg,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.occupiedBorder,
    padding: 12,
    marginBottom: 12,
    gap: 10,
    alignItems: 'center',
  },
  errorIconBox: {
    width: 26,
    height: 26,
    borderRadius: 6,
    backgroundColor: 'rgba(225, 29, 72, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorContent: {
    flex: 1,
  },
  errorTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.occupiedText,
  },
  errorText: {
    fontSize: 11,
    color: COLORS.textSlate,
    marginTop: 1,
  },
  retryBtn: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginTop: 6,
  },
  retryBtnText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.occupiedText,
  },
  quickActionDeck: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 6,
  },
  actionBtnEntry: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    borderRadius: 14,
    padding: 12,
    gap: 10,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 2,
  },
  actionBtnCheckout: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.navyHeader,
    borderRadius: 14,
    padding: 12,
    gap: 10,
    shadowColor: COLORS.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 2,
  },
  actionIconCircle: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionIconCircleNavy: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionTexts: {
    flex: 1,
  },
  actionPrimaryTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  actionPrimarySub: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 1,
  },
  actionSecondaryTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  actionSecondarySub: {
    fontSize: 10,
    color: '#94A3B8',
    marginTop: 1,
  },
  statsDeck: {
    gap: 10,
    marginVertical: 4,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  revenueStatCard: {
    flex: 1,
    minWidth: 100,
    backgroundColor: COLORS.cardSurface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
    shadowColor: COLORS.shadowColor,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    justifyContent: 'space-between',
  },
  revenueAccentBar: {
    height: 3,
    width: '100%',
    backgroundColor: COLORS.primary,
  },
  revenueCardContent: {
    padding: 12,
  },
  revenueHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  revenueLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.textMuted,
    letterSpacing: 0.5,
    flex: 1,
    marginRight: 4,
  },
  revenueIconBox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    backgroundColor: COLORS.primarySubtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  revenueAmount: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.primaryDark,
    letterSpacing: -0.5,
  },
  revenueSub: {
    fontSize: 10,
    color: COLORS.primary,
    fontWeight: '600',
    marginTop: 3,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 10,
  },
  sectionTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.textDark,
  },
  countBadge: {
    backgroundColor: COLORS.primarySubtle,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  countBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.primaryDark,
  },
  seeAllText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primary,
  },
  sessionCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.cardSurface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 12,
    marginBottom: 8,
    shadowColor: COLORS.shadowColor,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  sessionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  bayBadge: {
    backgroundColor: COLORS.primarySubtle,
    borderWidth: 1,
    borderColor: 'rgba(13, 148, 136, 0.2)',
    borderRadius: 8,
    paddingHorizontal: 7,
    paddingVertical: 3,
    alignItems: 'center',
  },
  bayBadgeLabel: {
    fontSize: 8,
    fontWeight: '800',
    color: COLORS.primaryDark,
  },
  bayBadgeNumber: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.primaryDark,
  },
  vehicleNumber: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textDark,
    letterSpacing: 0.3,
  },
  entryTime: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 1,
  },
  sessionRight: {
    alignItems: 'flex-end',
  },
  durationBadge: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.primary,
    backgroundColor: COLORS.primarySubtle,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 5,
  },
  feeEstimate: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.textDark,
    marginTop: 2,
  },
  slotsShortcutCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.cardSurface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 12,
    marginTop: 4,
    gap: 10,
  },
  shortcutIconBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: COLORS.primarySubtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shortcutTexts: {
    flex: 1,
  },
  shortcutTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  shortcutSub: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 1,
  },
});
