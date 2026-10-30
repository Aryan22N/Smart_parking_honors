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
import { InvoiceModal } from '../components/InvoiceModal';
import { EmptyState } from '../components/EmptyState';
import { sessionsApi } from '../api/endpoints';
import { ParkingSession, Invoice } from '../types';
import { formatCurrency, formatTimeOnly } from '../utils/formatting';

interface ActiveSessionsScreenProps {
  onNavigateToBook: () => void;
}

export const ActiveSessionsScreen: React.FC<ActiveSessionsScreenProps> = ({
  onNavigateToBook,
}) => {
  const [sessions, setSessions] = useState<ParkingSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [checkingOutId, setCheckingOutId] = useState<number | null>(null);
  const [recalculatingId, setRecalculatingId] = useState<number | null>(null);

  const [activeInvoice, setActiveInvoice] = useState<Invoice | null>(null);
  const [invoiceModalVisible, setInvoiceModalVisible] = useState(false);

  const fetchActiveSessions = useCallback(async () => {
    try {
      const data = await sessionsApi.getActive();
      setSessions(data);
    } catch (err: any) {
      Alert.alert('Session Error', err.message || 'Failed to fetch active parking sessions.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchActiveSessions();
  }, [fetchActiveSessions]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchActiveSessions();
  };

  const handleRecalculateFare = async (sessionId: number) => {
    try {
      setRecalculatingId(sessionId);
      const estimation = await sessionsApi.estimateFare(sessionId);
      setSessions((prev) =>
        prev.map((s) =>
          s.id === sessionId
            ? {
                ...s,
                totalFee: estimation.estimatedFee,
                durationFormatted: estimation.durationFormatted,
                durationSeconds: estimation.durationSeconds,
              }
            : s
        )
      );
      Alert.alert(
        'Fare Estimation Updated',
        `Vehicle: ${estimation.vehicleNumber}\n• Elapsed: ${estimation.durationFormatted}\n• Chargeable Blocks: ${estimation.billableBlocks} (${estimation.ratePerBlockInr} INR/block)\n• Estimated Fee: ${formatCurrency(estimation.estimatedFee)}`
      );
    } catch (err: any) {
      Alert.alert('Recalculation Failed', err.message || 'Could not recalculate fare.');
    } finally {
      setRecalculatingId(null);
    }
  };

  const handleCheckoutPrompt = (session: ParkingSession) => {
    Alert.alert(
      `Check Out Vehicle: ${session.vehicleNumber}`,
      `Allocated Bay: ${session.slotNumber}\nCurrent Estimated Fee: ${formatCurrency(session.totalFee)}\n\nSelect checkout settlement method:`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Checkout (Unpaid / Pay Later)',
          style: 'default',
          onPress: () => performCheckout(session.id, false),
        },
        {
          text: 'Checkout & Mark PAID',
          style: 'default',
          onPress: () => performCheckout(session.id, true),
        },
      ]
    );
  };

  const performCheckout = async (sessionId: number, markAsPaid: boolean) => {
    try {
      setCheckingOutId(sessionId);
      const invoice = await sessionsApi.checkout(sessionId, { markAsPaid });
      setActiveInvoice(invoice);
      setInvoiceModalVisible(true);
      fetchActiveSessions();
    } catch (err: any) {
      Alert.alert('Checkout Failed', err.message || 'Failed to check out vehicle.');
    } finally {
      setCheckingOutId(null);
    }
  };

  const filteredSessions = sessions.filter((s) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.trim().toLowerCase();
    return (
      s.vehicleNumber.toLowerCase().includes(q) ||
      s.slotNumber.toLowerCase().includes(q)
    );
  });

  const totalRunningAccrued = sessions.reduce((acc, curr) => acc + (curr.totalFee || 0), 0);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Polling active telemetry...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header
        title="Active Sessions"
        subtitle={`${sessions.length} vehicles currently parked in bays`}
        badge="MONITORING"
        rightActionText="Sync ⟳"
        onRightAction={fetchActiveSessions}
      />

      {/* Overview Accrued Metrics Strip */}
      <View style={styles.telemetryBar}>
        <View style={styles.telemetryItem}>
          <Text style={styles.telemetryLabel}>ACTIVE VEHICLES</Text>
          <Text style={styles.telemetryValue}>{sessions.length} Parked</Text>
        </View>

        <View style={styles.telemetryDivider} />

        <View style={styles.telemetryItem}>
          <Text style={styles.telemetryLabel}>RUNNING ESTIMATED CHARGES</Text>
          <Text style={[styles.telemetryValue, { color: COLORS.available }]}>
            {formatCurrency(totalRunningAccrued)}
          </Text>
        </View>
      </View>

      {/* Search Input Bar */}
      {sessions.length > 0 && (
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search by license plate or bay (e.g. MH12 or A-01)..."
            placeholderTextColor={COLORS.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCapitalize="characters"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearSearchBtn}>
              <Text style={styles.clearSearchText}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />
        }
        showsVerticalScrollIndicator={false}
      >
        {filteredSessions.length === 0 ? (
          <EmptyState
            icon="⏱️"
            title={sessions.length === 0 ? 'No Active Parking Sessions' : 'No Matching Vehicles'}
            description={
              sessions.length === 0
                ? 'All parking bays are currently vacant. Vehicles checked in will appear here with live duration tracking.'
                : `No active sessions match "${searchQuery}". Clear your search query to see all active sessions.`
            }
            actionLabel={sessions.length === 0 ? '+ Register Vehicle Check-In' : 'Clear Search Filter'}
            onAction={sessions.length === 0 ? onNavigateToBook : () => setSearchQuery('')}
          />
        ) : (
          filteredSessions.map((session) => {
            const isRecalculating = recalculatingId === session.id;
            const isCheckingOut = checkingOutId === session.id;

            return (
              <View key={session.id} style={styles.sessionCard}>
                {/* Header Row: Bay Badge, Plate Number, In-Time */}
                <View style={styles.cardHeader}>
                  <View style={styles.bayBadge}>
                    <Text style={styles.bayBadgeLabel}>BAY</Text>
                    <Text style={styles.bayBadgeNumber}>{session.slotNumber}</Text>
                  </View>

                  <View style={styles.vehicleDetails}>
                    <Text style={styles.plateNumber}>{session.vehicleNumber}</Text>
                    <Text style={styles.entryTime}>
                      Checked-in at {formatTimeOnly(session.entryTime)}
                    </Text>
                  </View>

                  <View style={styles.feeCallout}>
                    <Text style={styles.feeLabel}>ESTIMATED FARE</Text>
                    <Text style={styles.feeValue}>{formatCurrency(session.totalFee)}</Text>
                  </View>
                </View>

                {/* Metrics Breakdown Grid */}
                <View style={styles.metricsBox}>
                  <View style={styles.metricItem}>
                    <Text style={styles.metricLabel}>ELAPSED DURATION</Text>
                    <Text style={styles.metricVal}>{session.durationFormatted}</Text>
                  </View>

                  <View style={styles.metricItem}>
                    <Text style={styles.metricLabel}>TARIFF POLICY</Text>
                    <Text style={styles.metricVal}>₹50 / 3-hr block</Text>
                  </View>

                  <View style={styles.metricItem}>
                    <Text style={styles.metricLabel}>STATUS</Text>
                    <View style={styles.activePill}>
                      <View style={styles.activeDot} />
                      <Text style={styles.activePillText}>{session.status}</Text>
                    </View>
                  </View>
                </View>

                {/* Card Actions */}
                <View style={styles.cardActions}>
                  <TouchableOpacity
                    style={styles.recalcBtn}
                    onPress={() => handleRecalculateFare(session.id)}
                    disabled={isRecalculating || isCheckingOut}
                    activeOpacity={0.8}
                  >
                    {isRecalculating ? (
                      <ActivityIndicator size="small" color={COLORS.primaryLight} />
                    ) : (
                      <Text style={styles.recalcBtnText}>Refresh Fee ⟳</Text>
                    )}
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.checkoutBtn}
                    onPress={() => handleCheckoutPrompt(session)}
                    disabled={isCheckingOut || isRecalculating}
                    activeOpacity={0.85}
                  >
                    {isCheckingOut ? (
                      <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                      <Text style={styles.checkoutBtnText}>Check Out Vehicle →</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            );
          })
        )}
      </ScrollView>

      {/* Invoice Modal for Checkout Feedback */}
      <InvoiceModal
        visible={invoiceModalVisible}
        invoice={activeInvoice}
        onClose={() => setInvoiceModalVisible(false)}
        onPaymentSuccess={fetchActiveSessions}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bgPrimary,
  },
  center: {
    flex: 1,
    backgroundColor: COLORS.bgPrimary,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 14,
    fontSize: 13,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  telemetryBar: {
    flexDirection: 'row',
    backgroundColor: COLORS.cardBg,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    alignItems: 'center',
  },
  telemetryItem: {
    flex: 1,
  },
  telemetryDivider: {
    width: 1,
    height: 24,
    backgroundColor: COLORS.border,
    marginHorizontal: 16,
  },
  telemetryLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.textMuted,
    letterSpacing: 0.6,
  },
  telemetryValue: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginTop: 2,
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingTop: 12,
    position: 'relative',
  },
  searchInput: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 13,
    color: COLORS.textPrimary,
    fontWeight: '600',
  },
  clearSearchBtn: {
    position: 'absolute',
    right: 26,
    top: 20,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: COLORS.cardBgElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  clearSearchText: {
    color: COLORS.textSecondary,
    fontSize: 11,
    fontWeight: '800',
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  sessionCard: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  bayBadge: {
    backgroundColor: COLORS.cardBgElevated,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    marginRight: 12,
  },
  bayBadgeLabel: {
    fontSize: 8,
    fontWeight: '800',
    color: COLORS.textMuted,
  },
  bayBadgeNumber: {
    fontSize: 14,
    fontWeight: '900',
    color: COLORS.cyanLight,
  },
  vehicleDetails: {
    flex: 1,
  },
  plateNumber: {
    fontSize: 16,
    fontWeight: '900',
    color: COLORS.textPrimary,
    letterSpacing: 0.5,
  },
  entryTime: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  feeCallout: {
    alignItems: 'flex-end',
  },
  feeLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: COLORS.primaryLight,
    letterSpacing: 0.6,
  },
  feeValue: {
    fontSize: 18,
    fontWeight: '900',
    color: COLORS.available,
    marginTop: 1,
  },
  metricsBox: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 10,
    marginBottom: 14,
  },
  metricItem: {
    flex: 1,
  },
  metricLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: COLORS.textMuted,
    letterSpacing: 0.5,
  },
  metricVal: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginTop: 3,
  },
  activePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 3,
  },
  activeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.warning,
  },
  activePillText: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.warningText,
  },
  cardActions: {
    flexDirection: 'row',
    gap: 10,
  },
  recalcBtn: {
    flex: 1,
    backgroundColor: COLORS.cardBgElevated,
    paddingVertical: 11,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  recalcBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.cyanLight,
  },
  checkoutBtn: {
    flex: 1.5,
    backgroundColor: COLORS.primary,
    paddingVertical: 11,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 3,
  },
  checkoutBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
});
