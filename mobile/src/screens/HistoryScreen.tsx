import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
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
import { formatCurrency, formatDateTime } from '../utils/formatting';

export const HistoryScreen: React.FC = () => {
  const [history, setHistory] = useState<ParkingSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
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

  const filteredHistory = history.filter((item) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.trim().toLowerCase();
    return (
      item.vehicleNumber.toLowerCase().includes(q) ||
      item.slotNumber.toLowerCase().includes(q) ||
      item.id.toString().includes(q)
    );
  });

  const renderItem = ({ item }: { item: ParkingSession }) => {
    const isPaid = item.paymentStatus === 'PAID';

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.cardHeaderLeft}>
            <View style={styles.bayBadge}>
              <Text style={styles.bayBadgeLabel}>BAY</Text>
              <Text style={styles.bayBadgeValue}>{item.slotNumber}</Text>
            </View>

            <View>
              <Text style={styles.plateNumber}>{item.vehicleNumber}</Text>
              <Text style={styles.sessionId}>Session ID: #{item.id}</Text>
            </View>
          </View>

          <View
            style={[
              styles.paymentBadge,
              {
                backgroundColor: isPaid ? COLORS.availableBg : COLORS.warningBg,
                borderColor: isPaid ? COLORS.availableBorder : COLORS.warningBorder,
              },
            ]}
          >
            <View
              style={[
                styles.paymentDot,
                { backgroundColor: isPaid ? COLORS.available : COLORS.warning },
              ]}
            />
            <Text
              style={[
                styles.paymentBadgeText,
                { color: isPaid ? COLORS.availableText : COLORS.warningText },
              ]}
            >
              {item.paymentStatus}
            </Text>
          </View>
        </View>

        {/* Timeline Details */}
        <View style={styles.timelineBox}>
          <View style={styles.timeRow}>
            <Text style={styles.timeLabel}>Check-In:</Text>
            <Text style={styles.timeVal}>{formatDateTime(item.entryTime)}</Text>
          </View>
          <View style={styles.timeRow}>
            <Text style={styles.timeLabel}>Check-Out:</Text>
            <Text style={styles.timeVal}>{formatDateTime(item.exitTime)}</Text>
          </View>
          <View style={styles.timeRow}>
            <Text style={styles.timeLabel}>Duration:</Text>
            <Text style={[styles.timeVal, { color: COLORS.primaryDark, fontWeight: '800' }]}>
              {item.durationFormatted}
            </Text>
          </View>
        </View>

        {/* Footer with Final Charge & Invoice Action */}
        <View style={styles.cardFooter}>
          <View>
            <Text style={styles.feeLabel}>FINAL AMOUNT</Text>
            <Text style={styles.feeAmount}>{formatCurrency(item.totalFee)}</Text>
          </View>

          <TouchableOpacity
            style={styles.invoiceBtn}
            onPress={() => handleViewInvoice(item.id)}
            activeOpacity={0.8}
          >
            <Text style={styles.invoiceBtnText}>View Receipt 📄</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Header
        title="Session Ledger"
        subtitle="Audited history of completed checkouts and billing invoices"
        badge="LEDGER"
        rightActionText="Sync ⟳"
        onRightAction={() => fetchHistory(0, false)}
      />

      {/* Search Input Filter */}
      {history.length > 0 && (
        <View style={styles.searchBarContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search by license plate, bay, or ID..."
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

      {loading && history.length === 0 ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Retrieving session ledger...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredHistory}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />
          }
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.3}
          ListEmptyComponent={
            <EmptyState
              icon="📜"
              title={history.length === 0 ? 'No Historical Records' : 'No Matching Sessions'}
              description={
                history.length === 0
                  ? 'There are no completed parking sessions in the facility database yet. Checked out vehicles will appear here.'
                  : `No past checkouts match "${searchQuery}". Clear your search query to see all records.`
              }
              actionLabel={history.length > 0 ? 'Clear Search' : undefined}
              onAction={history.length > 0 ? () => setSearchQuery('') : undefined}
            />
          }
          ListFooterComponent={
            loadingMore ? (
              <View style={styles.loadingMoreBox}>
                <ActivityIndicator color={COLORS.primary} size="small" />
                <Text style={styles.loadingMoreText}>Loading more records...</Text>
              </View>
            ) : undefined
          }
        />
      )}

      {/* Invoice Modal for Past Sessions */}
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
    backgroundColor: COLORS.canvasBg,
  },
  center: {
    flex: 1,
    backgroundColor: COLORS.canvasBg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 14,
    fontSize: 13,
    color: COLORS.textMuted,
    fontWeight: '600',
  },
  searchBarContainer: {
    paddingHorizontal: 16,
    paddingTop: 12,
    position: 'relative',
  },
  searchInput: {
    backgroundColor: COLORS.cardSurface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 14,
    paddingVertical: 9,
    fontSize: 13,
    color: COLORS.textDark,
    fontWeight: '600',
  },
  clearSearchBtn: {
    position: 'absolute',
    right: 26,
    top: 20,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  clearSearchText: {
    color: COLORS.textSlate,
    fontSize: 10,
    fontWeight: '800',
  },
  listContent: {
    padding: 16,
    paddingBottom: 36,
  },
  card: {
    backgroundColor: COLORS.cardSurface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 14,
    marginBottom: 10,
    shadowColor: COLORS.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  cardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  bayBadge: {
    backgroundColor: COLORS.primarySubtle,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignItems: 'center',
  },
  bayBadgeLabel: {
    fontSize: 8,
    fontWeight: '800',
    color: COLORS.primaryDark,
  },
  bayBadgeValue: {
    fontSize: 12,
    fontWeight: '900',
    color: COLORS.primaryDark,
  },
  plateNumber: {
    fontSize: 15,
    fontWeight: '900',
    color: COLORS.textDark,
    letterSpacing: 0.5,
  },
  sessionId: {
    fontSize: 10,
    color: COLORS.textMuted,
    marginTop: 1,
  },
  paymentBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    gap: 4,
  },
  paymentDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
  paymentBadgeText: {
    fontSize: 10,
    fontWeight: '800',
  },
  timelineBox: {
    backgroundColor: COLORS.cardSurfaceAlt,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 10,
    gap: 3,
    marginBottom: 10,
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  timeLabel: {
    fontSize: 11,
    color: COLORS.textMuted,
    fontWeight: '600',
  },
  timeVal: {
    fontSize: 11,
    color: COLORS.textSlate,
    fontWeight: '600',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: 8,
  },
  feeLabel: {
    fontSize: 8,
    fontWeight: '800',
    color: COLORS.textMuted,
    letterSpacing: 0.5,
  },
  feeAmount: {
    fontSize: 16,
    fontWeight: '900',
    color: COLORS.primaryDark,
    marginTop: 1,
  },
  invoiceBtn: {
    backgroundColor: COLORS.cardSurfaceAlt,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  invoiceBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  loadingMoreBox: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
  },
  loadingMoreText: {
    fontSize: 11,
    color: COLORS.textMuted,
    fontWeight: '600',
  },
});
