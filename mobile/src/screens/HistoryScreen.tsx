import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
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
import { formatCurrency, formatDateTime } from '../utils/formatting';

export const HistoryScreen: React.FC = () => {
  const [history, setHistory] = useState<ParkingSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const [activeInvoice, setActiveInvoice] = useState<Invoice | null>(null);
  const [invoiceModalVisible, setInvoiceModalVisible] = useState(false);

  const fetchHistory = useCallback(async (pageToLoad = 0, append = false) => {
    try {
      if (pageToLoad === 0 && !append) {
        setLoading(true);
      }
      const data = await sessionsApi.getHistory(pageToLoad, 10, 'desc');

      if (append) {
        setHistory((prev) => [...prev, ...data.content]);
      } else {
        setHistory(data.content);
      }

      setPage(pageToLoad);
      setHasMore(!data.last && data.content.length > 0);
    } catch (err: any) {
      Alert.alert('History Error', err.message || 'Could not load parking history.');
    } finally {
      setLoading(false);
      setRefreshing(false);
      setLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    fetchHistory(0);
  }, [fetchHistory]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchHistory(0, false);
  };

  const handleLoadMore = () => {
    if (!hasMore || loadingMore || loading) return;
    setLoadingMore(true);
    fetchHistory(page + 1, true);
  };

  const handleViewInvoice = async (sessionId: number) => {
    try {
      const invoice = await sessionsApi.getInvoice(sessionId);
      setActiveInvoice(invoice);
      setInvoiceModalVisible(true);
    } catch (err: any) {
      Alert.alert('Invoice Error', err.message || 'Failed to fetch invoice.');
    }
  };

  const renderItem = ({ item }: { item: ParkingSession }) => {
    const isPaid = item.paymentStatus === 'PAID';

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.cardHeaderLeft}>
            <View style={styles.slotTag}>
              <Text style={styles.slotTagText}>{item.slotNumber}</Text>
            </View>
            <View>
              <Text style={styles.vehicleNumber}>{item.vehicleNumber}</Text>
              <Text style={styles.sessionDate}>ID: #{item.id}</Text>
            </View>
          </View>

          <View
            style={[
              styles.paymentBadge,
              {
                backgroundColor: isPaid ? COLORS.availableBg : COLORS.warningBg,
                borderColor: isPaid ? COLORS.available : COLORS.warning,
              },
            ]}
          >
            <Text
              style={[
                styles.paymentBadgeText,
                { color: isPaid ? COLORS.availableText : COLORS.warning },
              ]}
            >
              {item.paymentStatus}
            </Text>
          </View>
        </View>

        <View style={styles.timestampsBox}>
          <View style={styles.timeRow}>
            <Text style={styles.timeLabel}>Entry:</Text>
            <Text style={styles.timeVal}>{formatDateTime(item.entryTime)}</Text>
          </View>
          <View style={styles.timeRow}>
            <Text style={styles.timeLabel}>Exit:</Text>
            <Text style={styles.timeVal}>{formatDateTime(item.exitTime)}</Text>
          </View>
          <View style={styles.timeRow}>
            <Text style={styles.timeLabel}>Duration:</Text>
            <Text style={styles.timeVal}>{item.durationFormatted}</Text>
          </View>
        </View>

        <View style={styles.cardFooter}>
          <View>
            <Text style={styles.feeLabel}>FINAL CHARGE</Text>
            <Text style={styles.feeAmount}>{formatCurrency(item.totalFee)}</Text>
          </View>

          <TouchableOpacity
            style={styles.invoiceBtn}
            onPress={() => handleViewInvoice(item.id)}
          >
            <Text style={styles.invoiceBtnText}>View Invoice 📄</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Header
        title="Parking History"
        subtitle="Completed vehicle parking sessions & invoices"
      />

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading parking history...</Text>
        </View>
      ) : (
        <FlatList
          data={history}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />
          }
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            loadingMore ? (
              <ActivityIndicator color={COLORS.primary} style={{ marginVertical: 16 }} />
            ) : undefined
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyTitle}>No Parking History Yet</Text>
              <Text style={styles.emptyText}>
                Completed vehicle checkout sessions will appear here with invoices.
              </Text>
            </View>
          }
        />
      )}

      <InvoiceModal
        visible={invoiceModalVisible}
        invoice={activeInvoice}
        onClose={() => setInvoiceModalVisible(false)}
        onPaymentSuccess={() => fetchHistory(0, false)}
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    color: COLORS.textSecondary,
    fontSize: 14,
  },
  listContent: {
    padding: 16,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 16,
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  slotTag: {
    backgroundColor: COLORS.primaryDark,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  slotTagText: {
    color: COLORS.textPrimary,
    fontSize: 13,
    fontWeight: '800',
  },
  vehicleNumber: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  sessionDate: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  paymentBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
  },
  paymentBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  timestampsBox: {
    backgroundColor: COLORS.bgPrimary,
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 4,
    marginBottom: 12,
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  timeLabel: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
  timeVal: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: 10,
  },
  feeLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: COLORS.textMuted,
    letterSpacing: 0.5,
  },
  feeAmount: {
    fontSize: 18,
    fontWeight: '900',
    color: COLORS.available,
  },
  invoiceBtn: {
    backgroundColor: COLORS.cardBgElevated,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  invoiceBtnText: {
    color: COLORS.primaryLight,
    fontSize: 12,
    fontWeight: '700',
  },
  emptyContainer: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 16,
    padding: 30,
    alignItems: 'center',
    marginTop: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  emptyText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: 6,
  },
});
