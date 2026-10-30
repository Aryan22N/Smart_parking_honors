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
        <View style={styles.loadingSpinnerRing}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
        <Text style={styles.loadingTitle}>Connecting to Smart Parking Core</Text>
        <Text style={styles.loadingSub}>Synchronizing bay telemetry & session status...</Text>
      </View>
    );
  }

  const paidRatio = todayRevenue && todayRevenue.totalFinalizedCharges > 0
    ? Math.min(100, Math.round((todayRevenue.paidRevenue / todayRevenue.totalFinalizedCharges) * 100))
    : 0;

  return (
    <View style={styles.container}>
      <Header
        title="Command Hub"
        subtitle="Intelligent facility telemetry & live slot dispatch"
        badge="ONLINE"
        rightActionText="Sync ⟳"
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
          <View style={styles.errorBanner}>
            <View style={styles.errorIconCircle}>
              <Text style={styles.errorIcon}>⚠️</Text>
            </View>
            <View style={styles.errorContent}>
              <Text style={styles.errorTitle}>Telemetry Sync Warning</Text>
              <Text style={styles.errorText}>{error}</Text>
              <TouchableOpacity style={styles.retryBtn} onPress={fetchData} activeOpacity={0.8}>
                <Text style={styles.retryBtnText}>Retry Handshake</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Quick Action Launcher Card */}
        <View style={styles.actionHeroCard}>
          <View style={styles.actionHeroLeft}>
            <View style={styles.actionPill}>
              <Text style={styles.actionPillText}>FAST DISPATCH</Text>
            </View>
            <Text style={styles.actionHeroTitle}>Register Vehicle Check-In</Text>
            <Text style={styles.actionHeroSub}>
              {availability.availableSlots > 0
                ? `${availability.availableSlots} bays available for immediate assignment`
                : 'Facility currently full'}
            </Text>
          </View>
          <TouchableOpacity
            style={[
              styles.entryLaunchBtn,
              availability.availableSlots === 0 && styles.entryLaunchBtnDisabled,
            ]}
            onPress={onNavigateToBook}
            activeOpacity={0.85}
          >
            <Text style={styles.entryLaunchBtnText}>+ Check-In</Text>
          </TouchableOpacity>
        </View>

        {/* Real-Time Facility Occupancy Gauge */}
        <OccupancyGauge
          total={availability.totalSlots}
          available={availability.availableSlots}
          occupied={availability.occupiedSlots}
          occupancyPercent={availability.occupancyRatePercent}
        />

        {/* 3-Column Executive Metrics Grid */}
        <View style={styles.statsRow}>
          <StatCard
            label="Available"
            value={availability.availableSlots}
            variant="available"
            subValue="Immediate entry"
            icon="🅿"
          />
          <StatCard
            label="Occupied"
            value={availability.occupiedSlots}
            variant="occupied"
            subValue="Vehicles active"
            icon="🚗"
          />
          <StatCard
            label="Facility Bay"
            value={availability.totalSlots}
            variant="primary"
            subValue="Max bay capacity"
            icon="🏢"
          />
        </View>

        {/* Today's Revenue Intelligence Widget */}
        <TouchableOpacity
          style={styles.revenueWidget}
          onPress={onNavigateToRevenue}
          activeOpacity={0.88}
        >
          <View style={styles.revenueTopRow}>
            <View style={styles.revenueHeaderLeft}>
              <View style={styles.revenueMetaRow}>
                <Text style={styles.revenueLabel}>TODAY'S FINALIZED REVENUE</Text>
                <View style={styles.sessionsBadge}>
                  <Text style={styles.sessionsBadgeText}>
                    {todayRevenue?.completedSessionsCount ?? 0} Checkouts
                  </Text>
                </View>
              </View>
              <Text style={styles.revenueAmount}>
                {formatCurrency(todayRevenue?.totalFinalizedCharges ?? 0)}
              </Text>
            </View>

            <View style={styles.analyticsArrowBox}>
              <Text style={styles.analyticsArrowText}>Analytics →</Text>
            </View>
          </View>

          {/* Paid vs Outstanding Progress Bar */}
          <View style={styles.revenueProgressBarContainer}>
            <View style={styles.revenueProgressBarBg}>
              <View style={[styles.revenueProgressBarFill, { width: `${paidRatio}%` }]} />
            </View>
            <View style={styles.revenueProgressMeta}>
              <Text style={styles.paidRateText}>{paidRatio}% Collected</Text>
              <Text style={styles.currencyNotice}>Currency: {todayRevenue?.currency ?? 'INR'}</Text>
            </View>
          </View>

          <View style={styles.revenueSplitRow}>
            <View style={styles.splitBox}>
              <View style={[styles.splitIndicator, { backgroundColor: COLORS.available }]} />
              <View>
                <Text style={styles.splitLabel}>Paid Collections</Text>
                <Text style={[styles.splitAmount, { color: COLORS.availableText }]}>
                  {formatCurrency(todayRevenue?.paidRevenue ?? 0)}
                </Text>
              </View>
            </View>

            <View style={styles.splitBox}>
              <View style={[styles.splitIndicator, { backgroundColor: COLORS.warning }]} />
              <View>
                <Text style={styles.splitLabel}>Unpaid Outstanding</Text>
                <Text style={[styles.splitAmount, { color: COLORS.warningText }]}>
                  {formatCurrency(todayRevenue?.unpaidOutstandingAmount ?? 0)}
                </Text>
              </View>
            </View>
          </View>
        </TouchableOpacity>

        {/* Active Parking Sessions Feed */}
        <View style={styles.feedHeaderRow}>
          <View style={styles.feedTitleGroup}>
            <Text style={styles.feedTitle}>Active Parking Stream</Text>
            <View style={styles.feedBadge}>
              <Text style={styles.feedBadgeText}>{activeSessions.length} Parked</Text>
            </View>
          </View>

          <TouchableOpacity onPress={onNavigateToActive} activeOpacity={0.7}>
            <Text style={styles.seeAllText}>Manage All →</Text>
          </TouchableOpacity>
        </View>

        {activeSessions.length === 0 ? (
          <EmptyState
            icon="🅿"
            title="All Bays Are Vacant"
            description="There are no active parking sessions in progress. New vehicle check-ins will appear here in real time."
            actionLabel="+ Register Vehicle Check-In"
            onAction={onNavigateToBook}
          />
        ) : (
          activeSessions.slice(0, 3).map((session) => (
            <TouchableOpacity
              key={session.id}
              style={styles.sessionFeedCard}
              onPress={onNavigateToActive}
              activeOpacity={0.85}
            >
              <View style={styles.sessionCardTop}>
                <View style={styles.sessionLeftCol}>
                  <View style={styles.bayPill}>
                    <Text style={styles.bayPillLabel}>BAY</Text>
                    <Text style={styles.bayPillText}>{session.slotNumber}</Text>
                  </View>

                  <View style={styles.vehicleDetails}>
                    <Text style={styles.vehicleNumber}>{session.vehicleNumber}</Text>
                    <Text style={styles.entryTimeText}>
                      In at {formatTimeOnly(session.entryTime)}
                    </Text>
                  </View>
                </View>

                <View style={styles.sessionRightCol}>
                  <Text style={styles.feeEstimateValue}>{formatCurrency(session.totalFee)}</Text>
                  <Text style={styles.feeSub}>Current running fee</Text>
                </View>
              </View>

              <View style={styles.sessionCardBottom}>
                <View style={styles.elapsedBox}>
                  <Text style={styles.elapsedIcon}>⏱️</Text>
                  <Text style={styles.elapsedText}>{session.durationFormatted} elapsed</Text>
                </View>

                <View style={styles.checkoutHint}>
                  <Text style={styles.checkoutHintText}>Tap to checkout →</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))
        )}

        {/* Quick View Slots Grid Shortcut */}
        <TouchableOpacity style={styles.slotGridBanner} onPress={onNavigateToSlots} activeOpacity={0.85}>
          <View style={styles.slotGridIcon}>
            <Text style={styles.slotGridIconText}>🗺️</Text>
          </View>
          <View style={styles.slotGridInfo}>
            <Text style={styles.slotGridTitle}>Visual Parking Bay Map</Text>
            <Text style={styles.slotGridSub}>Explore all 20 bays with real-time status & floor layout</Text>
          </View>
          <Text style={styles.slotGridArrow}>→</Text>
        </TouchableOpacity>
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
    padding: 24,
  },
  loadingSpinnerRing: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.25)',
    marginBottom: 16,
  },
  loadingTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.textPrimary,
    letterSpacing: -0.3,
  },
  loadingSub: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 4,
    textAlign: 'center',
  },
  errorBanner: {
    flexDirection: 'row',
    backgroundColor: COLORS.occupiedBg,
    borderColor: COLORS.occupiedBorder,
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
    marginBottom: 14,
    gap: 12,
    alignItems: 'flex-start',
  },
  errorIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(244, 63, 94, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorIcon: {
    fontSize: 14,
  },
  errorContent: {
    flex: 1,
  },
  errorTitle: {
    color: COLORS.occupiedText,
    fontSize: 13,
    fontWeight: '800',
  },
  errorText: {
    color: COLORS.textPrimary,
    fontSize: 12,
    marginTop: 2,
    lineHeight: 16,
  },
  retryBtn: {
    backgroundColor: COLORS.cardBgElevated,
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginTop: 8,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  retryBtnText: {
    color: COLORS.textPrimary,
    fontSize: 11,
    fontWeight: '700',
  },
  actionHeroCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.3)',
    padding: 16,
    marginBottom: 10,
  },
  actionHeroLeft: {
    flex: 1,
    paddingRight: 10,
  },
  actionPill: {
    backgroundColor: 'rgba(99, 102, 241, 0.25)',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    marginBottom: 6,
  },
  actionPillText: {
    color: COLORS.primaryLight,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  actionHeroTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.textPrimary,
    letterSpacing: -0.3,
  },
  actionHeroSub: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  entryLaunchBtn: {
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 14,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 4,
  },
  entryLaunchBtnDisabled: {
    opacity: 0.5,
  },
  entryLaunchBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginVertical: 6,
  },
  revenueWidget: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 18,
    marginVertical: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  revenueTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  revenueHeaderLeft: {
    flex: 1,
  },
  revenueMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  revenueLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.primaryLight,
    letterSpacing: 0.8,
  },
  sessionsBadge: {
    backgroundColor: 'rgba(99, 102, 241, 0.15)',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  sessionsBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    color: COLORS.cyanLight,
  },
  revenueAmount: {
    fontSize: 28,
    fontWeight: '900',
    color: COLORS.available,
    letterSpacing: -0.5,
    marginTop: 3,
  },
  analyticsArrowBox: {
    backgroundColor: COLORS.cardBgElevated,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  analyticsArrowText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  revenueProgressBarContainer: {
    marginVertical: 12,
  },
  revenueProgressBarBg: {
    height: 6,
    backgroundColor: COLORS.inputBg,
    borderRadius: 3,
    overflow: 'hidden',
  },
  revenueProgressBarFill: {
    height: '100%',
    backgroundColor: COLORS.available,
    borderRadius: 3,
  },
  revenueProgressMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  paidRateText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.availableText,
  },
  currencyNotice: {
    fontSize: 10,
    color: COLORS.textMuted,
  },
  revenueSplitRow: {
    flexDirection: 'row',
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: 12,
  },
  splitBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  splitIndicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  splitLabel: {
    fontSize: 10,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  splitAmount: {
    fontSize: 13,
    fontWeight: '800',
    marginTop: 1,
  },
  feedHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 14,
    marginBottom: 10,
  },
  feedTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  feedTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.textPrimary,
    letterSpacing: -0.3,
  },
  feedBadge: {
    backgroundColor: COLORS.cardBgElevated,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  feedBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.primaryLight,
  },
  seeAllText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primaryLight,
  },
  sessionFeedCard: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 14,
    marginBottom: 10,
  },
  sessionCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sessionLeftCol: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  bayPill: {
    backgroundColor: COLORS.cardBgElevated,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  bayPillLabel: {
    fontSize: 8,
    fontWeight: '800',
    color: COLORS.textMuted,
  },
  bayPillText: {
    fontSize: 12,
    fontWeight: '900',
    color: COLORS.cyanLight,
  },
  vehicleDetails: {},
  vehicleNumber: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.textPrimary,
    letterSpacing: 0.5,
  },
  entryTimeText: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  sessionRightCol: {
    alignItems: 'flex-end',
  },
  feeEstimateValue: {
    fontSize: 16,
    fontWeight: '900',
    color: COLORS.available,
  },
  feeSub: {
    fontSize: 9,
    color: COLORS.textMuted,
    marginTop: 1,
  },
  sessionCardBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: 8,
  },
  elapsedBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  elapsedIcon: {
    fontSize: 11,
  },
  elapsedText: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  checkoutHint: {},
  checkoutHintText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.primaryLight,
  },
  slotGridBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginTop: 4,
    gap: 12,
  },
  slotGridIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: COLORS.cardBgElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  slotGridIconText: {
    fontSize: 18,
  },
  slotGridInfo: {
    flex: 1,
  },
  slotGridTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  slotGridSub: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  slotGridArrow: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.textMuted,
  },
});
