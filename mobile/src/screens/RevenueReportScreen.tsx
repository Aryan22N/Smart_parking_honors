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
      Alert.alert('Invalid Date Format', 'Please enter date in YYYY-MM-DD format (e.g. 2026-10-29).');
      return;
    }
    setSelectedDate(trimmed);
  };

  const hasNoSessions = !revenue || revenue.completedSessionsCount === 0;

  return (
    <View style={styles.container}>
      <Header
        title="Revenue Reports"
        subtitle="Aggregated finalized revenue, payments & outstanding charges"
      />

      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
        showsVerticalScrollIndicator={false}
      >
        {/* Date Selector Shortcuts */}
        <View style={styles.quickDateRow}>
          <TouchableOpacity
            style={[styles.quickDateBtn, selectedDate === getTodayIso() && styles.quickDateBtnActive]}
            onPress={() => {
              const today = getTodayIso();
              setSelectedDate(today);
              setCustomInputDate(today);
            }}
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
          >
            <Text style={[styles.quickDateText, selectedDate === getYesterdayIso() && styles.quickDateTextActive]}>
              Yesterday
            </Text>
          </TouchableOpacity>
        </View>

        {/* Custom Date Input */}
        <View style={styles.customDateBox}>
          <Text style={styles.inputLabel}>Reporting Date (YYYY-MM-DD):</Text>
          <View style={styles.customDateInputRow}>
            <TextInput
              style={styles.textInput}
              value={customInputDate}
              onChangeText={setCustomInputDate}
              placeholder="YYYY-MM-DD"
              placeholderTextColor={COLORS.textMuted}
              maxLength={10}
            />
            <TouchableOpacity style={styles.applyBtn} onPress={handleApplyCustomDate}>
              <Text style={styles.applyBtnText}>Load</Text>
            </TouchableOpacity>
          </View>
        </View>

        {loading ? (
          <View style={styles.centerCard}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.loadingText}>Generating revenue report for {selectedDate}...</Text>
          </View>
        ) : hasNoSessions ? (
          /* Empty / No Data State */
          <View style={styles.noDataCard}>
            <View style={styles.noDataIconBox}>
              <Text style={styles.noDataIcon}>📊</Text>
            </View>
            <Text style={styles.noDataTitle}>No Completed Sessions on {selectedDate}</Text>
            <Text style={styles.noDataText}>
              There are no finalized parking checkouts recorded for this date. Revenue is calculated
              exclusively from completed sessions, not active parking estimates.
            </Text>
          </View>
        ) : (
          /* Revenue Data Display */
          <View style={styles.reportContainer}>
            {/* Primary Total Finalized Revenue Card */}
            <View style={styles.primaryRevenueCard}>
              <Text style={styles.primaryCardLabel}>TOTAL FINALIZED CHARGES</Text>
              <Text style={styles.primaryCardAmount}>
                {formatCurrency(revenue.totalFinalizedCharges)}
              </Text>
              <View style={styles.primaryCardFooter}>
                <Text style={styles.primaryCardSessions}>
                  {revenue.completedSessionsCount} Completed Parking {revenue.completedSessionsCount === 1 ? 'Session' : 'Sessions'}
                </Text>
                <Text style={styles.primaryCardCurrency}>Currency: {revenue.currency}</Text>
              </View>
            </View>

            {/* Split Metrics: Paid vs Outstanding */}
            <View style={styles.splitRow}>
              <View style={[styles.splitCard, { borderColor: COLORS.available }]}>
                <Text style={styles.splitLabel}>PAID REVENUE</Text>
                <Text style={[styles.splitValue, { color: COLORS.available }]}>
                  {formatCurrency(revenue.paidRevenue)}
                </Text>
                <Text style={styles.splitSub}>Settled charges</Text>
              </View>

              <View style={[styles.splitCard, { borderColor: COLORS.warning }]}>
                <Text style={styles.splitLabel}>OUTSTANDING UNPAID</Text>
                <Text style={[styles.splitValue, { color: COLORS.warning }]}>
                  {formatCurrency(revenue.unpaidOutstandingAmount)}
                </Text>
                <Text style={styles.splitSub}>Pending payment</Text>
              </View>
            </View>

            {/* Accounting Notes Card */}
            <View style={styles.notesCard}>
              <Text style={styles.notesTitle}>Accounting & Billing Rules</Text>
              <Text style={styles.notesItem}>
                • Revenue metric adheres to finalized charges incurred upon vehicle exit.
              </Text>
              <Text style={styles.notesItem}>
                • Each started 3-hour period is charged at ₹50 (ceiling block rate).
              </Text>
              <Text style={styles.notesItem}>
                • Active parking sessions are excluded until vehicle checkout is complete.
              </Text>
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
  quickDateRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
  },
  quickDateBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: COLORS.cardBg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  quickDateBtnActive: {
    backgroundColor: COLORS.primaryDark,
    borderColor: COLORS.primary,
  },
  quickDateText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  quickDateTextActive: {
    color: COLORS.textPrimary,
  },
  customDateBox: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textSecondary,
    marginBottom: 8,
  },
  customDateInputRow: {
    flexDirection: 'row',
    gap: 10,
  },
  textInput: {
    flex: 1,
    backgroundColor: COLORS.inputBg,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: COLORS.textPrimary,
    fontSize: 14,
    fontWeight: '700',
  },
  applyBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  applyBtnText: {
    color: COLORS.bgPrimary,
    fontSize: 13,
    fontWeight: '800',
  },
  centerCard: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 16,
    padding: 30,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  loadingText: {
    marginTop: 12,
    color: COLORS.textSecondary,
    fontSize: 13,
  },
  noDataCard: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 16,
    padding: 30,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  noDataIconBox: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.cardBgElevated,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },
  noDataIcon: {
    fontSize: 26,
  },
  noDataTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.textPrimary,
    textAlign: 'center',
  },
  noDataText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 18,
  },
  reportContainer: {
    gap: 14,
  },
  primaryRevenueCard: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 18,
    padding: 20,
    borderWidth: 1.5,
    borderColor: COLORS.available,
  },
  primaryCardLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.textMuted,
    letterSpacing: 1,
  },
  primaryCardAmount: {
    fontSize: 32,
    fontWeight: '900',
    color: COLORS.available,
    marginVertical: 8,
  },
  primaryCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: 10,
  },
  primaryCardSessions: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  primaryCardCurrency: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  splitRow: {
    flexDirection: 'row',
    gap: 12,
  },
  splitCard: {
    flex: 1,
    backgroundColor: COLORS.cardBg,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
  },
  splitLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.textMuted,
    marginBottom: 4,
  },
  splitValue: {
    fontSize: 20,
    fontWeight: '900',
  },
  splitSub: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  notesCard: {
    backgroundColor: COLORS.bgPrimary,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  notesTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  notesItem: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 6,
    lineHeight: 18,
  },
});
