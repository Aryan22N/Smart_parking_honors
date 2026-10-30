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
import { Icon } from '../components/Icon';
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
        `Vehicle: ${estimation.vehicleNumber}\n• Duration: ${estimation.durationFormatted}\n• Chargeable Blocks: ${estimation.billableBlocks} (${estimation.ratePerBlockInr} INR/block)\n• Estimated Fee: ${formatCurrency(estimation.estimatedFee)}`
      );
    } catch (err: any) {
      Alert.alert('Recalculation Failed', err.message || 'Could not recalculate fare.');
    } finally {
      setRecalculatingId(null);
    }
  };

  const handleCheckoutPrompt = (session: ParkingSession) => {
    Alert.alert(
      `Check Out Vehicle`,
      `Vehicle: ${session.vehicleNumber}\nBay: ${session.slotNumber}\nRunning Fee: ${formatCurrency(session.totalFee)}\n\nSelect checkout settlement:`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Checkout (Pay Later)',
          style: 'default',
          onPress: () => performCheckout(session.id, false),
        },
        {
          text: 'Checkout & Pay Now',
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
        <Text style={styles.loadingText}>Loading active sessions...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header
        title="Active Sessions"
        subtitle={`${sessions.length} vehicles currently parked in bays`}
        badge="MONITORING"
        rightActionText="Sync"
        onRightAction={fetchActiveSessions}
      />

      {/* Summary Telemetry Strip */}
      <View style={styles.summaryStrip}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>PARKED VEHICLES</Text>
          <Text style={styles.summaryValue}>{sessions.length} Active</Text>
        </View>

        <View style={styles.summaryDivider} />

        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>ESTIMATED ACCRUED FEES</Text>
          <Text style={[styles.summaryValue, { color: COLORS.primaryDark }]}>
            {formatCurrency(totalRunningAccrued)}
          </Text>
        </View>
      </View>

      {/* Search Filter Bar */}
      {sessions.length > 0 && (
        <View style={styles.searchBarBox}>
          <View style={styles.searchInputWrapper}>
            <Icon name="search" size={14} color={COLORS.textMuted} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search by license plate or bay (e.g. MH12, A-01)..."
              placeholderTextColor={COLORS.textMuted}
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoCapitalize="characters"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Icon name="close" size={10} color={COLORS.textSlate} />
              </TouchableOpacity>
            )}
          </View>
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
            iconName="active"
            title={sessions.length === 0 ? 'No Active Sessions' : 'No Matching Vehicles'}
            description={
              sessions.length === 0
                ? 'All parking bays are vacant. Check in a vehicle from the entry gate to track duration here.'
                : `No active sessions match "${searchQuery}". Reset search to see all active parked vehicles.`
            }
            actionLabel={sessions.length === 0 ? '+ Register Vehicle Check-In' : 'Clear Filter'}
            onAction={sessions.length === 0 ? onNavigateToBook : () => setSearchQuery('')}
          />
        ) : (
          filteredSessions.map((session) => {
            const isRecalculating = recalculatingId === session.id;
            const isCheckingOut = checkingOutId === session.id;

            return (
              <View key={session.id} style={styles.sessionCard}>
                {/* Header Row */}
                <View style={styles.cardHeader}>
                  <View style={styles.bayBadge}>
                    <Text style={styles.bayBadgeLabel}>BAY</Text>
                    <Text style={styles.bayBadgeValue}>{session.slotNumber}</Text>
                  </View>

                  <View style={styles.vehicleInfo}>
                    <Text style={styles.plateText}>{session.vehicleNumber}</Text>
                    <Text style={styles.entryTimeText}>
                      Parked at {formatTimeOnly(session.entryTime)}
                    </Text>
                  </View>

                  <View style={styles.feeCallout}>
                    <Text style={styles.feeCalloutLabel}>ESTIMATED</Text>
                    <Text style={styles.feeCalloutValue}>{formatCurrency(session.totalFee)}</Text>
                  </View>
                </View>

                {/* Metrics Details */}
                <View style={styles.metricsBox}>
                  <View style={styles.metricItem}>
                    <Text style={styles.metricLabel}>ELAPSED TIME</Text>
                    <Text style={styles.metricValue}>{session.durationFormatted}</Text>
                  </View>

                  <View style={styles.metricItem}>
                    <Text style={styles.metricLabel}>TARIFF POLICY</Text>
                    <Text style={styles.metricValue}>₹50 / 3h block</Text>
                  </View>

                  <View style={styles.metricItem}>
                    <Text style={styles.metricLabel}>STATUS</Text>
                    <View style={styles.statusPill}>
                      <View style={styles.statusDot} />
                      <Text style={styles.statusPillText}>IN PROGRESS</Text>
                    </View>
                  </View>
                </View>

                {/* Actions Row */}
                <View style={styles.cardActions}>
                  <TouchableOpacity
                    style={styles.recalcBtn}
                    onPress={() => handleRecalculateFare(session.id)}
                    disabled={isRecalculating || isCheckingOut}
                    activeOpacity={0.8}
                  >
                    {isRecalculating ? (
                      <ActivityIndicator size="small" color={COLORS.primary} />
                    ) : (
                      <View style={styles.btnRow}>
                        <Icon name="refresh" size={12} color={COLORS.primaryDark} />
                        <Text style={styles.recalcBtnText}>Recalculate</Text>
                      </View>
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
                      <View style={styles.btnRow}>
                        <Text style={styles.checkoutBtnText}>Checkout Bay</Text>
                        <Icon name="arrow-right" size={12} color="#FFFFFF" />
                      </View>
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
    backgroundColor: COLORS.canvasBg,
  },
  center: {
    flex: 1,
    backgroundColor: COLORS.canvasBg,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 14,
    fontSize: 13,
    color: COLORS.textMuted,
    fontWeight: '600',
  },
  summaryStrip: {
    flexDirection: 'row',
    backgroundColor: COLORS.cardSurface,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    alignItems: 'center',
  },
  summaryItem: {
    flex: 1,
  },
  summaryDivider: {
    width: 1,
    height: 24,
    backgroundColor: COLORS.border,
    marginHorizontal: 16,
  },
  summaryLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.textMuted,
    letterSpacing: 0.5,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '900',
    color: COLORS.textDark,
    marginTop: 2,
  },
  searchBarBox: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  searchInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.cardSurface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 12,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 8,
    fontSize: 13,
    color: COLORS.textDark,
    fontWeight: '600',
  },
  clearBtn: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  clearBtnText: {
    color: COLORS.textSlate,
    fontSize: 10,
    fontWeight: '800',
  },
  content: {
    padding: 16,
    paddingBottom: 36,
  },
  sessionCard: {
    backgroundColor: COLORS.cardSurface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 16,
    marginBottom: 12,
    shadowColor: COLORS.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  bayBadge: {
    backgroundColor: COLORS.primarySubtle,
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 8,
    alignItems: 'center',
    marginRight: 10,
  },
  bayBadgeLabel: {
    fontSize: 8,
    fontWeight: '800',
    color: COLORS.primaryDark,
  },
  bayBadgeValue: {
    fontSize: 13,
    fontWeight: '900',
    color: COLORS.primaryDark,
  },
  vehicleInfo: {
    flex: 1,
  },
  plateText: {
    fontSize: 16,
    fontWeight: '900',
    color: COLORS.textDark,
    letterSpacing: 0.5,
  },
  entryTimeText: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  feeCallout: {
    alignItems: 'flex-end',
  },
  feeCalloutLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: COLORS.primary,
    letterSpacing: 0.5,
  },
  feeCalloutValue: {
    fontSize: 17,
    fontWeight: '900',
    color: COLORS.primaryDark,
    marginTop: 1,
  },
  metricsBox: {
    flexDirection: 'row',
    backgroundColor: COLORS.cardSurfaceAlt,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 10,
    marginBottom: 12,
  },
  metricItem: {
    flex: 1,
  },
  metricLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: COLORS.textMuted,
    letterSpacing: 0.4,
  },
  metricValue: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.textDark,
    marginTop: 2,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.warning,
  },
  statusPillText: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.warningText,
  },
  cardActions: {
    flexDirection: 'row',
    gap: 10,
  },
  recalcBtn: {
    flex: 1,
    backgroundColor: COLORS.cardSurfaceAlt,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  recalcBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.primaryDark,
  },
  checkoutBtn: {
    flex: 1.5,
    backgroundColor: COLORS.primary,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 3,
  },
  checkoutBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
});
