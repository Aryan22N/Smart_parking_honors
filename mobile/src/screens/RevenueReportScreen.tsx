import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { COLORS } from '../constants/colors';
import { Header } from '../components/Header';
import { EmptyState } from '../components/EmptyState';
import { Icon } from '../components/Icon';
import { reportsApi } from '../api/endpoints';
import { DailyRevenue } from '../types';
import { formatCurrency } from '../utils/formatting';

export const RevenueReportScreen: React.FC = () => {
  const getTodayIso = () => new Date().toISOString().split('T')[0];
  const getYesterdayIso = () => {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return d.toISOString().split('T')[0];
  };

  const [selectedDate, setSelectedDate] = useState<string>(getTodayIso());
  const [customInputDate, setCustomInputDate] = useState<string>(getTodayIso());
  const [revenue, setRevenue] = useState<DailyRevenue | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchRevenue = useCallback(async (date: string) => {
    try {
      setLoading(true);
      const data = await reportsApi.getDailyRevenue(date);
      setRevenue(data);
    } catch (err: any) {
      Alert.alert('Report Error', err.message || 'Could not fetch daily revenue.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchRevenue(selectedDate);
  }, [selectedDate, fetchRevenue]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchRevenue(selectedDate);
  };

  const handleApplyCustomDate = () => {
    const trimmed = customInputDate.trim();
    if (!/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
      Alert.alert('Invalid Date Format', 'Please enter date in YYYY-MM-DD format (e.g. 2026-10-30).');
      return;
    }
    setSelectedDate(trimmed);
  };

  const hasNoSessions = !revenue || revenue.completedSessionsCount === 0;

  const totalCharges = revenue?.totalFinalizedCharges ?? 0;
  const paidCharges = revenue?.paidRevenue ?? 0;
  const outstandingCharges = revenue?.unpaidOutstandingAmount ?? 0;
  const sessionCount = revenue?.completedSessionsCount ?? 0;

  const collectionRate = totalCharges > 0 ? Math.min(100, Math.round((paidCharges / totalCharges) * 100)) : 0;
  const avgTicketSize = sessionCount > 0 ? totalCharges / sessionCount : 0;

  return (
    <View style={styles.container}>
      <Header
        title="Revenue Intel"
        subtitle="Finalized collections, payment settlement & billing compliance"
        badge="AUDITED"
        rightActionText="Sync"
        onRightAction={() => fetchRevenue(selectedDate)}
      />

      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Date Selector Ribbon */}
        <View style={styles.dateSelectorContainer}>
          <View style={styles.quickDateRow}>
            <TouchableOpacity
              style={[styles.quickDateBtn, selectedDate === getTodayIso() && styles.quickDateBtnActive]}
              onPress={() => {
                const today = getTodayIso();
                setSelectedDate(today);
                setCustomInputDate(today);
              }}
              activeOpacity={0.8}
            >
              <Text style={[styles.quickDateText, selectedDate === getTodayIso() && styles.quickDateTextActive]}>
                Today
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.quickDateBtn, selectedDate === getYesterdayIso() && styles.quickDateBtnActive]}
              onPress={() => {
                const yest = getYesterdayIso();
                setSelectedDate(yest);
                setCustomInputDate(yest);
              }}
              activeOpacity={0.8}
            >
              <Text style={[styles.quickDateText, selectedDate === getYesterdayIso() && styles.quickDateTextActive]}>
                Yesterday
              </Text>
            </TouchableOpacity>
          </View>

          {/* Custom Date Input Bar */}
          <View style={styles.customDateBox}>
            <Icon name="clock" size={14} color={COLORS.textMuted} />
            <TextInput
              style={styles.textInput}
              value={customInputDate}
              onChangeText={setCustomInputDate}
              placeholder="YYYY-MM-DD"
              placeholderTextColor={COLORS.textMuted}
              maxLength={10}
            />
            <TouchableOpacity style={styles.applyBtn} onPress={handleApplyCustomDate} activeOpacity={0.8}>
              <Text style={styles.applyBtnText}>Load</Text>
            </TouchableOpacity>
          </View>
        </View>

        {loading ? (
          <View style={styles.centerCard}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.loadingText}>Compiling revenue records for {selectedDate}...</Text>
          </View>
        ) : hasNoSessions ? (
          <EmptyState
            iconName="revenue"
            title={`No Finalized Billings on ${selectedDate}`}
            description="Revenue calculations are compiled exclusively from completed vehicle checkouts. Active parking fees will appear here once vehicles exit."
            actionLabel="View Today's Report"
            onAction={() => {
              const today = getTodayIso();
              setSelectedDate(today);
              setCustomInputDate(today);
            }}
          />
        ) : (
          <View style={styles.reportSection}>
            {/* Hero Gross Collections Card */}
            <View style={styles.heroRevenueCard}>
              <View style={styles.heroTopRow}>
                <View>
                  <Text style={styles.heroLabel}>GROSS FINALIZED REVENUE</Text>
                  <Text style={styles.heroAmount}>{formatCurrency(totalCharges)}</Text>
                </View>
                <View style={styles.dateTag}>
                  <Text style={styles.dateTagText}>{selectedDate}</Text>
                </View>
              </View>

              {/* Collection Efficiency Gauge Bar */}
              <View style={styles.progressContainer}>
                <View style={styles.progressBarBg}>
                  <View style={[styles.progressBarFill, { width: `${collectionRate}%` }]} />
                </View>
                <View style={styles.progressLabels}>
                  <Text style={styles.progressRateText}>{collectionRate}% Collection Efficiency</Text>
                  <Text style={styles.progressCompletedText}>{sessionCount} Checkouts</Text>
                </View>
              </View>

              <View style={styles.heroFooter}>
                <Text style={styles.heroFooterText}>
                  Compiled from {sessionCount} completed vehicle {sessionCount === 1 ? 'exit' : 'exits'}
                </Text>
                <Text style={styles.heroCurrencyText}>Currency: {revenue?.currency ?? 'INR'}</Text>
              </View>
            </View>

            {/* Split Metrics: Paid vs Outstanding */}
            <View style={styles.splitRow}>
              <View style={styles.metricCard}>
                <View style={styles.metricCardHeader}>
                  <View style={[styles.statusDot, { backgroundColor: COLORS.available }]} />
                  <Text style={styles.metricCardLabel}>PAID SETTLEMENTS</Text>
                </View>
                <Text style={[styles.metricCardValue, { color: COLORS.availableText }]}>
                  {formatCurrency(paidCharges)}
                </Text>
                <Text style={styles.metricCardSub}>Verified payments</Text>
              </View>

              <View style={styles.metricCard}>
                <View style={styles.metricCardHeader}>
                  <View style={[styles.statusDot, { backgroundColor: COLORS.warning }]} />
                  <Text style={styles.metricCardLabel}>OUTSTANDING</Text>
                </View>
                <Text style={[styles.metricCardValue, { color: COLORS.warningText }]}>
                  {formatCurrency(outstandingCharges)}
                </Text>
                <Text style={styles.metricCardSub}>Pending settlement</Text>
              </View>
            </View>

            {/* Operational Unit Economics Deck */}
            <View style={styles.economicsCard}>
              <Text style={styles.economicsTitle}>UNIT ECONOMICS</Text>

              <View style={styles.economicsRow}>
                <View style={styles.econItem}>
                  <Text style={styles.econLabel}>Average Ticket Size</Text>
                  <Text style={styles.econVal}>{formatCurrency(avgTicketSize)}</Text>
                </View>
                <View style={styles.econDivider} />
                <View style={styles.econItem}>
                  <Text style={styles.econLabel}>Checkouts</Text>
                  <Text style={styles.econVal}>{sessionCount}</Text>
                </View>
                <View style={styles.econDivider} />
                <View style={styles.econItem}>
                  <Text style={styles.econLabel}>Collection Rate</Text>
                  <Text style={[styles.econVal, { color: COLORS.availableText }]}>{collectionRate}%</Text>
                </View>
              </View>
            </View>

            {/* Tariff Rules Compliance Card */}
            <View style={styles.policyCard}>
              <View style={styles.policyIconBox}>
                <Icon name="receipt" size={16} color={COLORS.primaryDark} />
              </View>
              <View style={styles.policyContent}>
                <Text style={styles.policyTitle}>Tariff Rules & Billing Logic</Text>
                <Text style={styles.policyText}>
                  • Base rate: ₹50.00 per started 3-hour block (10,800 seconds).{'\n'}
                  • Partial blocks are rounded up to the nearest full block upon exit.{'\n'}
                  • Revenue reflects finalized checkouts. Active parking fees are accrued live.
                </Text>
              </View>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.canvasBg,
  },
  content: {
    padding: 16,
    paddingBottom: 36,
  },
  dateSelectorContainer: {
    backgroundColor: COLORS.cardSurface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 14,
    marginBottom: 12,
    shadowColor: COLORS.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  quickDateRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 10,
  },
  quickDateBtn: {
    flex: 1,
    backgroundColor: COLORS.cardSurfaceAlt,
    paddingVertical: 8,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  quickDateBtnActive: {
    backgroundColor: COLORS.primarySubtle,
    borderColor: COLORS.primary,
  },
  quickDateText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textSlate,
  },
  quickDateTextActive: {
    color: COLORS.primaryDark,
    fontWeight: '800',
  },
  customDateBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: COLORS.inputBg,
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
    borderRadius: 10,
    paddingLeft: 10,
    paddingRight: 4,
    paddingVertical: 4,
  },
  textInput: {
    flex: 1,
    paddingVertical: 6,
    paddingHorizontal: 6,
    fontSize: 13,
    color: COLORS.textDark,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  applyBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  applyBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  centerCard: {
    backgroundColor: COLORS.cardSurface,
    borderRadius: 18,
    padding: 32,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    marginVertical: 12,
  },
  loadingText: {
    marginTop: 14,
    fontSize: 13,
    color: COLORS.textMuted,
    fontWeight: '600',
    textAlign: 'center',
  },
  reportSection: {
    gap: 12,
  },
  heroRevenueCard: {
    backgroundColor: COLORS.cardSurface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 16,
    shadowColor: COLORS.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  heroTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  heroLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.primary,
    letterSpacing: 0.6,
  },
  heroAmount: {
    fontSize: 30,
    fontWeight: '900',
    color: COLORS.primaryDark,
    letterSpacing: -0.5,
    marginTop: 3,
  },
  dateTag: {
    backgroundColor: COLORS.primarySubtle,
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: 6,
  },
  dateTagText: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.primaryDark,
  },
  progressContainer: {
    marginVertical: 12,
  },
  progressBarBg: {
    height: 7,
    backgroundColor: '#E2E8F0',
    borderRadius: 3.5,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 3.5,
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 5,
  },
  progressRateText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.primaryDark,
  },
  progressCompletedText: {
    fontSize: 11,
    color: COLORS.textMuted,
    fontWeight: '600',
  },
  heroFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: 10,
  },
  heroFooterText: {
    fontSize: 11,
    color: COLORS.textMuted,
  },
  heroCurrencyText: {
    fontSize: 11,
    color: COLORS.textMuted,
    fontWeight: '600',
  },
  splitRow: {
    flexDirection: 'row',
    gap: 12,
  },
  metricCard: {
    flex: 1,
    backgroundColor: COLORS.cardSurface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 14,
    shadowColor: COLORS.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  metricCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  metricCardLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.textMuted,
    letterSpacing: 0.5,
  },
  metricCardValue: {
    fontSize: 19,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  metricCardSub: {
    fontSize: 10,
    color: COLORS.textMuted,
    marginTop: 3,
  },
  economicsCard: {
    backgroundColor: COLORS.cardSurface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 14,
    shadowColor: COLORS.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  economicsTitle: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.primary,
    letterSpacing: 0.6,
    marginBottom: 10,
  },
  economicsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  econItem: {
    flex: 1,
    alignItems: 'center',
  },
  econDivider: {
    width: 1,
    height: 26,
    backgroundColor: COLORS.border,
  },
  econLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: COLORS.textMuted,
    textAlign: 'center',
    marginBottom: 3,
  },
  econVal: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.textDark,
  },
  policyCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.cardSurface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 14,
    gap: 10,
    alignItems: 'flex-start',
  },
  policyIconBox: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: COLORS.primarySubtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  policyIcon: {
    fontSize: 13,
  },
  policyContent: {
    flex: 1,
  },
  policyTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.textDark,
    marginBottom: 4,
  },
  policyText: {
    fontSize: 11,
    color: COLORS.textSlate,
    lineHeight: 16,
  },
});
