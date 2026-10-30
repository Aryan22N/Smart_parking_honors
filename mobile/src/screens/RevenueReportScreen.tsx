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
      Alert.alert('Financial Report Error', err.message || 'Could not fetch revenue metrics.');
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
        title="Financial Intel"
        subtitle="Finalized collections, payment settlement & billing compliance"
        badge="AUDITED"
        rightActionText="Sync ⟳"
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
            <TextInput
              style={styles.textInput}
              value={customInputDate}
              onChangeText={setCustomInputDate}
              placeholder="YYYY-MM-DD"
              placeholderTextColor={COLORS.textMuted}
              maxLength={10}
            />
            <TouchableOpacity style={styles.applyBtn} onPress={handleApplyCustomDate} activeOpacity={0.8}>
              <Text style={styles.applyBtnText}>Load Date</Text>
            </TouchableOpacity>
          </View>
        </View>

        {loading ? (
          <View style={styles.centerCard}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.loadingText}>Compiling audited revenue records for {selectedDate}...</Text>
          </View>
        ) : hasNoSessions ? (
          <EmptyState
            icon="📊"
            title={`No Finalized Billings on ${selectedDate}`}
            description="Revenue calculations are compiled exclusively from finalized vehicle checkouts. Active parking fees are reflected upon exit."
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
                  <Text style={styles.heroLabel}>GROSS FINALIZED CHARGES</Text>
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
                  <Text style={styles.progressRateText}>{collectionRate}% Settlement Efficiency</Text>
                  <Text style={styles.progressCompletedText}>{sessionCount} Checkouts</Text>
                </View>
              </View>

              <View style={styles.heroFooter}>
                <Text style={styles.heroFooterText}>
                  Aggregated from {sessionCount} completed vehicle {sessionCount === 1 ? 'exit' : 'exits'}
                </Text>
                <Text style={styles.heroCurrencyText}>Currency: {revenue?.currency ?? 'INR'}</Text>
              </View>
            </View>

            {/* Split Metrics: Paid vs Outstanding */}
            <View style={styles.splitRow}>
              <View style={styles.metricCard}>
                <View style={styles.metricCardHeader}>
                  <View style={[styles.statusDot, { backgroundColor: COLORS.available }]} />
                  <Text style={styles.metricCardLabel}>PAID REVENUE</Text>
                </View>
                <Text style={[styles.metricCardValue, { color: COLORS.available }]}>
                  {formatCurrency(paidCharges)}
                </Text>
                <Text style={styles.metricCardSub}>Successfully verified</Text>
              </View>

              <View style={styles.metricCard}>
                <View style={styles.metricCardHeader}>
                  <View style={[styles.statusDot, { backgroundColor: COLORS.warning }]} />
                  <Text style={styles.metricCardLabel}>OUTSTANDING</Text>
                </View>
                <Text style={[styles.metricCardValue, { color: COLORS.warning }]}>
                  {formatCurrency(outstandingCharges)}
                </Text>
                <Text style={styles.metricCardSub}>Pending collection</Text>
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
                  <Text style={styles.econLabel}>Completed Checkouts</Text>
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
                <Text style={styles.policyIcon}>📋</Text>
              </View>
              <View style={styles.policyContent}>
                <Text style={styles.policyTitle}>Tariff Policy Verification</Text>
                <Text style={styles.policyText}>
                  • Base rate: ₹50.00 per started 3-hour block (10,800 seconds).{'\n'}
                  • Rounding: Ceiling block round-up on partial block usage.{'\n'}
                  • Active sessions are billed in real time upon final checkout.
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
    backgroundColor: COLORS.bgPrimary,
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  dateSelectorContainer: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 14,
    marginBottom: 14,
  },
  quickDateRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 10,
  },
  quickDateBtn: {
    flex: 1,
    backgroundColor: COLORS.cardBgElevated,
    paddingVertical: 8,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  quickDateBtnActive: {
    backgroundColor: 'rgba(99, 102, 241, 0.2)',
    borderColor: COLORS.primary,
  },
  quickDateText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  quickDateTextActive: {
    color: COLORS.primaryLight,
    fontWeight: '800',
  },
  customDateBox: {
    flexDirection: 'row',
    gap: 8,
  },
  textInput: {
    flex: 1,
    backgroundColor: COLORS.inputBg,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 13,
    color: COLORS.textPrimary,
    fontWeight: '700',
    letterSpacing: 1,
  },
  applyBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  applyBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  centerCard: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    marginVertical: 12,
  },
  loadingText: {
    marginTop: 14,
    fontSize: 13,
    color: COLORS.textSecondary,
    fontWeight: '600',
    textAlign: 'center',
  },
  reportSection: {
    gap: 12,
  },
  heroRevenueCard: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 3,
  },
  heroTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  heroLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.primaryLight,
    letterSpacing: 0.8,
  },
  heroAmount: {
    fontSize: 32,
    fontWeight: '900',
    color: COLORS.available,
    letterSpacing: -0.5,
    marginTop: 4,
  },
  dateTag: {
    backgroundColor: COLORS.cardBgElevated,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  dateTagText: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.cyanLight,
  },
  progressContainer: {
    marginVertical: 14,
  },
  progressBarBg: {
    height: 8,
    backgroundColor: COLORS.inputBg,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: COLORS.available,
    borderRadius: 4,
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  progressRateText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.availableText,
  },
  progressCompletedText: {
    fontSize: 11,
    color: COLORS.textSecondary,
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
    backgroundColor: COLORS.cardBg,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 14,
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
    letterSpacing: 0.6,
  },
  metricCardValue: {
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  metricCardSub: {
    fontSize: 10,
    color: COLORS.textMuted,
    marginTop: 4,
  },
  economicsCard: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 16,
  },
  economicsTitle: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.primaryLight,
    letterSpacing: 0.8,
    marginBottom: 12,
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
    height: 28,
    backgroundColor: COLORS.border,
  },
  econLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: COLORS.textMuted,
    textAlign: 'center',
    marginBottom: 4,
  },
  econVal: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  policyCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 14,
    gap: 12,
    alignItems: 'flex-start',
  },
  policyIconBox: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: COLORS.cardBgElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  policyIcon: {
    fontSize: 14,
  },
  policyContent: {
    flex: 1,
  },
  policyTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  policyText: {
    fontSize: 11,
    color: COLORS.textSecondary,
    lineHeight: 16,
  },
});
