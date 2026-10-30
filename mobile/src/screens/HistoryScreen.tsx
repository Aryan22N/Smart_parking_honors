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
      Alert.alert('Invoice Fetch Error', err.message || 'Failed to fetch invoice.');
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
              <Text style={styles.sessionId}>Audit ID: #{item.id}</Text>
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
            <Text style={[styles.timeVal, { color: COLORS.cyanLight }]}>
              {item.durationFormatted}
            </Text>
          </View>
        </View>

        {/* Footer with Final Charge & Invoice Action */}
        <View style={styles.cardFooter}>
          <View>
            <Text style={styles.feeLabel}>SETTLED AMOUNT</Text>
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
        badge="ARCHIVE"
        rightActionText="Sync ⟳"
        onRightAction={() => fetchHistory(0, false)}
      />

      {/* Search Input Filter */}
      {history.length > 0 && (
        <View style={styles.searchBarContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search history by plate, bay, or session ID..."
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
          <Text style={styles.loadingText}>Retrieving audit records...</Text>
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
              title={history.length === 0 ? 'No Completed Sessions Yet' : 'No Matching Records'}
              description={
                history.length === 0
                  ? 'There are no completed parking sessions in the facility database. Check out an active session to see records logged here.'
                  : `No historical checkouts match "${searchQuery}". Clear your search query to see all records.`
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
    backgroundColor: COLORS.bgPrimary,
  },
  center: {
    flex: 1,
    backgroundColor: COLORS.bgPrimary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 14,
    fontSize: 13,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  searchBarContainer: {
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
  listContent: {
    padding: 16,
    paddingBottom: 40,
  },
  card: {
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
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  bayBadge: {
    backgroundColor: COLORS.cardBgElevated,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  bayBadgeLabel: {
    fontSize: 8,
    fontWeight: '800',
    color: COLORS.textMuted,
  },
  bayBadgeValue: {
    fontSize: 13,
    fontWeight: '900',
    color: COLORS.cyanLight,
  },
  plateNumber: {
    fontSize: 15,
    fontWeight: '900',
    color: COLORS.textPrimary,
    letterSpacing: 0.5,
  },
  sessionId: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  paymentBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 10,
    borderWidth: 1,
    gap: 6,
  },
  paymentDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  paymentBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  timelineBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 10,
    gap: 4,
    marginBottom: 12,
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
    color: COLORS.textSecondary,
    fontWeight: '700',
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
    fontWeight: '800',
    color: COLORS.textMuted,
    letterSpacing: 0.6,
  },
  feeAmount: {
    fontSize: 18,
    fontWeight: '900',
    color: COLORS.available,
    marginTop: 1,
  },
  invoiceBtn: {
    backgroundColor: COLORS.cardBgElevated,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  invoiceBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  loadingMoreBox: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 14,
  },
  loadingMoreText: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
});
