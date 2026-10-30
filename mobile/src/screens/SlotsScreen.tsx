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
import { SlotBadge } from '../components/SlotBadge';
import { EmptyState } from '../components/EmptyState';
import { slotsApi } from '../api/endpoints';
import { ParkingSlot } from '../types';

interface SlotsScreenProps {
  onSelectSlotToBook: (slot: ParkingSlot) => void;
}

export const SlotsScreen: React.FC<SlotsScreenProps> = ({ onSelectSlotToBook }) => {
  const [slots, setSlots] = useState<ParkingSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<'ALL' | 'AVAILABLE' | 'OCCUPIED'>('ALL');
  const [selectedSlot, setSelectedSlot] = useState<ParkingSlot | null>(null);

  const fetchSlots = useCallback(async () => {
    try {
      const data = await slotsApi.getAll();
      setSlots(data);
    } catch (err: any) {
      Alert.alert('Slot Fetch Error', err.message || 'Could not fetch parking slots.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchSlots();
  }, [fetchSlots]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchSlots();
  };

  const filteredSlots = slots.filter((s) => {
    if (filter === 'AVAILABLE') return s.status === 'AVAILABLE';
    if (filter === 'OCCUPIED') return s.status === 'OCCUPIED';
    return true;
  });

  const availableCount = slots.filter((s) => s.status === 'AVAILABLE').length;
  const occupiedCount = slots.filter((s) => s.status === 'OCCUPIED').length;

  const handleSlotPress = (slot: ParkingSlot) => {
    setSelectedSlot(slot);
    if (slot.status === 'AVAILABLE') {
      Alert.alert(
        `Reserve Bay ${slot.slotNumber}`,
        `Bay ${slot.slotNumber} is currently VACANT and ready for parking.\n\nProceed to register vehicle check-in for this bay?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Allocate Bay Now',
            style: 'default',
            onPress: () => onSelectSlotToBook(slot),
          },
        ]
      );
    } else {
      Alert.alert(
        `Bay ${slot.slotNumber} (ACTIVE)`,
        `This bay is currently occupied by an active parking session. To inspect or complete checkout, view the Active Parking tab.`,
        [{ text: 'Dismiss' }]
      );
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Rendering parking bay topography...</Text>
      </View>
    );
  }

  const occupancyRatio = slots.length > 0 ? Math.round((occupiedCount / slots.length) * 100) : 0;

  return (
    <View style={styles.container}>
      <Header
        title="Bay Inventory"
        subtitle={`${availableCount} Available Bays • ${occupiedCount} In Use`}
        badge="REAL-TIME"
        rightActionText="Sync ⟳"
        onRightAction={fetchSlots}
      />

      {/* Top Occupancy Status Strip */}
      <View style={styles.capacityStrip}>
        <View style={styles.capacityHeader}>
          <Text style={styles.capacityTitle}>FACILITY UTILIZATION</Text>
          <Text style={styles.capacityRate}>{occupancyRatio}% Occupied</Text>
        </View>
        <View style={styles.capacityBarBg}>
          <View
            style={[
              styles.capacityBarFill,
              {
                width: `${occupancyRatio}%`,
                backgroundColor: occupancyRatio >= 85 ? COLORS.occupied : COLORS.available,
              },
            ]}
          />
        </View>
      </View>

      {/* Segmented Filter Control */}
      <View style={styles.filterBar}>
        <TouchableOpacity
          style={[styles.filterSegment, filter === 'ALL' && styles.filterSegmentActive]}
          onPress={() => setFilter('ALL')}
          activeOpacity={0.8}
        >
          <Text style={[styles.filterLabel, filter === 'ALL' && styles.filterLabelActive]}>
            All Bays ({slots.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterSegment, filter === 'AVAILABLE' && styles.filterSegmentActive]}
          onPress={() => setFilter('AVAILABLE')}
          activeOpacity={0.8}
        >
          <View style={[styles.filterDot, { backgroundColor: COLORS.available }]} />
          <Text style={[styles.filterLabel, filter === 'AVAILABLE' && styles.filterLabelActive]}>
            Open ({availableCount})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterSegment, filter === 'OCCUPIED' && styles.filterSegmentActive]}
          onPress={() => setFilter('OCCUPIED')}
          activeOpacity={0.8}
        >
          <View style={[styles.filterDot, { backgroundColor: COLORS.occupied }]} />
          <Text style={[styles.filterLabel, filter === 'OCCUPIED' && styles.filterLabelActive]}>
            Occupied ({occupiedCount})
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.gridScroll}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />
        }
        showsVerticalScrollIndicator={false}
      >
        {filteredSlots.length === 0 ? (
          <EmptyState
            icon="🅿"
            title="No Matching Bays"
            description={`No parking bays found matching the current filter "${filter}". Switch filters to view all bays.`}
            actionLabel="Show All Bays"
            onAction={() => setFilter('ALL')}
          />
        ) : (
          <View style={styles.bayGrid}>
            {filteredSlots.map((slot) => {
              const isAvailable = slot.status === 'AVAILABLE';
              const isSelected = selectedSlot?.id === slot.id;

              return (
                <TouchableOpacity
                  key={slot.id}
                  style={[
                    styles.bayCard,
                    isAvailable ? styles.bayCardAvailable : styles.bayCardOccupied,
                    isSelected && styles.bayCardSelected,
                  ]}
                  onPress={() => handleSlotPress(slot)}
                  activeOpacity={0.85}
                >
                  {/* Floor Marking Demarcation Lines */}
                  <View
                    style={[
                      styles.floorLineTop,
                      { backgroundColor: isAvailable ? COLORS.available : COLORS.occupied },
                    ]}
                  />

                  <View style={styles.bayHeader}>
                    <View style={styles.bayBadge}>
                      <Text style={styles.bayBadgeText}>BAY</Text>
                    </View>
                    <SlotBadge status={slot.status} size="sm" />
                  </View>

                  <View style={styles.bayCenter}>
                    <Text
                      style={[
                        styles.bayNumber,
                        { color: isAvailable ? COLORS.textPrimary : COLORS.occupiedText },
                      ]}
                    >
                      {slot.slotNumber}
                    </Text>
                    <Text style={styles.bayType}>Standard Bay</Text>
                  </View>

                  <View style={styles.bayFooter}>
                    {isAvailable ? (
                      <View style={styles.bookPromptPill}>
                        <Text style={styles.bookPromptText}>Tap to Allocate →</Text>
                      </View>
                    ) : (
                      <View style={styles.occupiedPill}>
                        <Text style={styles.occupiedPillText}>Vehicle Active</Text>
                      </View>
                    )}
                  </View>
                </TouchableOpacity>
              );
            })}
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
  capacityStrip: {
    backgroundColor: COLORS.cardBg,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  capacityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  capacityTitle: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.textMuted,
    letterSpacing: 0.8,
  },
  capacityRate: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.cyanLight,
  },
  capacityBarBg: {
    height: 6,
    backgroundColor: COLORS.inputBg,
    borderRadius: 3,
    overflow: 'hidden',
  },
  capacityBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  filterBar: {
    flexDirection: 'row',
    backgroundColor: COLORS.bgPrimary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
  },
  filterSegment: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.cardBg,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 6,
  },
  filterSegmentActive: {
    backgroundColor: 'rgba(99, 102, 241, 0.18)',
    borderColor: COLORS.primary,
  },
  filterDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  filterLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  filterLabelActive: {
    color: COLORS.primaryLight,
    fontWeight: '800',
  },
  gridScroll: {
    padding: 16,
    paddingBottom: 40,
  },
  bayGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'space-between',
  },
  bayCard: {
    width: '48%',
    backgroundColor: COLORS.cardBg,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 14,
    position: 'relative',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  bayCardAvailable: {
    backgroundColor: 'rgba(19, 29, 53, 0.95)',
  },
  bayCardOccupied: {
    backgroundColor: 'rgba(30, 20, 35, 0.95)',
    borderColor: 'rgba(244, 63, 94, 0.25)',
  },
  bayCardSelected: {
    borderColor: COLORS.primary,
    borderWidth: 2,
  },
  floorLineTop: {
    position: 'absolute',
    top: 0,
    left: 14,
    right: 14,
    height: 3,
    borderBottomLeftRadius: 2,
    borderBottomRightRadius: 2,
    opacity: 0.8,
  },
  bayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    paddingTop: 4,
  },
  bayBadge: {
    backgroundColor: COLORS.cardBgElevated,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  bayBadgeText: {
    fontSize: 8,
    fontWeight: '900',
    color: COLORS.textMuted,
  },
  bayCenter: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  bayNumber: {
    fontSize: 26,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  bayType: {
    fontSize: 10,
    color: COLORS.textMuted,
    fontWeight: '600',
    marginTop: 2,
  },
  bayFooter: {
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: 8,
  },
  bookPromptPill: {
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    paddingVertical: 4,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.25)',
  },
  bookPromptText: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.availableText,
  },
  occupiedPill: {
    backgroundColor: 'rgba(244, 63, 94, 0.1)',
    paddingVertical: 4,
    borderRadius: 8,
    alignItems: 'center',
  },
  occupiedPillText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.occupiedText,
  },
});
