import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { COLORS } from '../constants/colors';
import { Header } from '../components/Header';
import { InvoiceModal } from '../components/InvoiceModal';
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
  const [checkingOutId, setCheckingOutId] = useState<number | null>(null);
  const [recalculatingId, setRecalculatingId] = useState<number | null>(null);

  const [activeInvoice, setActiveInvoice] = useState<Invoice | null>(null);
  const [invoiceModalVisible, setInvoiceModalVisible] = useState(false);

  const fetchActiveSessions = useCallback(async () => {
    try {
      const data = await sessionsApi.getActive();
      setSessions(data);
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to fetch active parking sessions.');
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
      // Update local state with fresh estimate from server
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
        'Fare Updated',
        `Current estimate for vehicle ${estimation.vehicleNumber}:\n• Billed Duration: ${estimation.durationFormatted}\n• Chargeable Blocks: ${estimation.billableBlocks} (${estimation.ratePerBlockInr} INR/block)\n• Estimated Fee: ${formatCurrency(estimation.estimatedFee)}`
      );
    } catch (err: any) {
      Alert.alert('Recalculation Failed', err.message || 'Could not recalculate fare.');
    } finally {
      setRecalculatingId(null);
    }
  };

  const handleCheckoutPrompt = (session: ParkingSession) => {
    Alert.alert(
      'Confirm Vehicle Checkout',
      `Vehicle: ${session.vehicleNumber}\nSlot: ${session.slotNumber}\nCurrent Estimated Fee: ${formatCurrency(session.totalFee)}\n\nDo you want to check out this vehicle now?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Checkout (Unpaid)',
          style: 'default',
          onPress: () => performCheckout(session.id, false),
        },
        {
          text: 'Checkout & Pay Immediately',
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

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Fetching active sessions...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header
        title="Active Parking"
        subtitle={`${sessions.length} parked vehicles currently active`}
      />

      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
        showsVerticalScrollIndicator={false}
      >
        {sessions.length === 0 ? (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconBox}>
              <Text style={styles.emptyIcon}>🅿</Text>
            </View>
            <Text style={styles.emptyTitle}>No Active Sessions</Text>
            <Text style={styles.emptySubtitle}>
              There are currently no vehicles parked in the facility.
            </Text>
            <TouchableOpacity style={styles.bookShortcutBtn} onPress={onNavigateToBook}>
              <Text style={styles.bookShortcutBtnText}>+ Register Vehicle Entry</Text>
            </TouchableOpacity>
          </View>
        ) : (
          sessions.map((session) => {
            const isRecalculating = recalculatingId === session.id;
            const isCheckingOut = checkingOutId === session.id;

            return (
              <View key={session.id} style={styles.card}>
                {/* Card Top Row */}
                <View style={styles.cardHeader}>
                  <View style={styles.slotPill}>
                    <Text style={styles.slotPillText}>{session.slotNumber}</Text>
                  </View>

                  <View style={styles.vehicleInfo}>
                    <Text style={styles.vehicleNumber}>{session.vehicleNumber}</Text>
                    <Text style={styles.entryTime}>
                      Parked at {formatTimeOnly(session.entryTime)}
                    </Text>
                  </View>

                  <View style={styles.feeBox}>
                    <Text style={styles.feeLabel}>ESTIMATED FEE</Text>
                    <Text style={styles.feeValue}>{formatCurrency(session.totalFee)}</Text>
                  </View>
                </View>

                {/* Duration & Rule Info */}
                <View style={styles.metricsRow}>
                  <View style={styles.metricItem}>
                    <Text style={styles.metricLabel}>ELAPSED TIME</Text>
                    <Text style={styles.metricValue}>{session.durationFormatted}</Text>
                  </View>
                  <View style={styles.metricItem}>
                    <Text style={styles.metricLabel}>RATE POLICY</Text>
                    <Text style={styles.metricValue}>₹50 / started 3h</Text>
                  </View>
                  <View style={styles.metricItem}>
                    <Text style={styles.metricLabel}>STATUS</Text>
                    <Text style={[styles.metricValue, { color: COLORS.warning }]}>
                      {session.status}
                    </Text>
                  </View>
                </View>

                {/* Action Buttons */}
                <View style={styles.actionsRow}>
                  <TouchableOpacity
                    style={styles.recalcBtn}
                    onPress={() => handleRecalculateFare(session.id)}
                    disabled={isRecalculating || isCheckingOut}
                  >
                    {isRecalculating ? (
                      <ActivityIndicator size="small" color={COLORS.primary} />
                    ) : (
                      <Text style={styles.recalcBtnText}>Recalculate ⟳</Text>
                    )}
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.checkoutBtn}
                    onPress={() => handleCheckoutPrompt(session)}
                    disabled={isCheckingOut || isRecalculating}
                  >
                    {isCheckingOut ? (
                      <ActivityIndicator size="small" color={COLORS.bgPrimary} />
                    ) : (
                      <Text style={styles.checkoutBtnText}>Checkout Vehicle →</Text>
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
  },
  loadingText: {
    marginTop: 12,
    color: COLORS.textSecondary,
    fontSize: 14,
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 16,
    marginBottom: 14,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  slotPill: {
    backgroundColor: COLORS.primaryDark,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  slotPillText: {
    fontSize: 16,
    fontWeight: '900',
    color: COLORS.textPrimary,
  },
  vehicleInfo: {
    flex: 1,
    marginLeft: 12,
  },
  vehicleNumber: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  entryTime: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  feeBox: {
    alignItems: 'flex-end',
  },
  feeLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: COLORS.textMuted,
    letterSpacing: 0.5,
  },
  feeValue: {
    fontSize: 18,
    fontWeight: '900',
    color: COLORS.available,
  },
  metricsRow: {
    flexDirection: 'row',
    backgroundColor: COLORS.bgPrimary,
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  metricItem: {
    flex: 1,
  },
  metricLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.textMuted,
    marginBottom: 2,
  },
  metricValue: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  recalcBtn: {
    flex: 1,
    backgroundColor: COLORS.cardBgElevated,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  recalcBtnText: {
    color: COLORS.primary,
    fontSize: 13,
    fontWeight: '700',
  },
  checkoutBtn: {
    flex: 1.5,
    backgroundColor: COLORS.occupied,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkoutBtnText: {
    color: COLORS.textPrimary,
    fontSize: 13,
    fontWeight: '800',
  },
  emptyContainer: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 18,
    padding: 36,
    alignItems: 'center',
    marginTop: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  emptyIconBox: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.cardBgElevated,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyIcon: {
    fontSize: 28,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  emptySubtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: 6,
    marginBottom: 20,
  },
  bookShortcutBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
  },
  bookShortcutBtnText: {
    color: COLORS.bgPrimary,
    fontSize: 14,
    fontWeight: '800',
  },
});
