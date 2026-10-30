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
        `Allocate Bay ${slot.slotNumber}`,
        `Bay ${slot.slotNumber} is currently VACANT and available for assignment.\n\nProceed to vehicle check-in for this bay?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Allocate This Bay',
            style: 'default',
            onPress: () => onSelectSlotToBook(slot),
          },
        ]
      );
    } else {
      Alert.alert(
        `Bay ${slot.slotNumber} (OCCUPIED)`,
        `This parking bay is currently occupied by an active vehicle. To monitor or check out, navigate to the Active Parking tab.`,
        [{ text: 'Dismiss' }]
      );
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading parking bay topography...</Text>
      </View>
    );
  }

  const occupancyRatio = slots.length > 0 ? Math.round((occupiedCount / slots.length) * 100) : 0;

  return (
    <View style={styles.container}>
      <Header
        title="Parking Bays"
        subtitle={`${availableCount} Available • ${occupiedCount} Occupied`}
        badge="INVENTORY"
        rightActionText="Sync"
        onRightAction={fetchSlots}
      />

      {/* Facility Utilization Header Strip */}
      <View style={styles.utilizationStrip}>
        <View style={styles.utilizationHeader}>
          <Text style={styles.utilizationTitle}>BAY OCCUPANCY RATIO</Text>
          <Text style={styles.utilizationPercent}>{occupancyRatio}% In Use</Text>
        </View>
        <View style={styles.utilizationBarBg}>
          <View
            style={[
              styles.utilizationBarFill,
              {
                width: `${occupancyRatio}%`,
                backgroundColor: occupancyRatio >= 85 ? COLORS.occupied : COLORS.primary,
              },
            ]}
          />
        </View>
      </View>

      {/* Segmented Filter Control */}
      <View style={styles.filterBar}>
        <TouchableOpacity
          style={[styles.filterBtn, filter === 'ALL' && styles.filterBtnActive]}
          onPress={() => setFilter('ALL')}
          activeOpacity={0.8}
        >
          <Text style={[styles.filterText, filter === 'ALL' && styles.filterTextActive]}>
            All ({slots.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterBtn, filter === 'AVAILABLE' && styles.filterBtnActive]}
          onPress={() => setFilter('AVAILABLE')}
          activeOpacity={0.8}
        >
          <View style={[styles.filterDot, { backgroundColor: COLORS.available }]} />
          <Text style={[styles.filterText, filter === 'AVAILABLE' && styles.filterTextActive]}>
            Available ({availableCount})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterBtn, filter === 'OCCUPIED' && styles.filterBtnActive]}
          onPress={() => setFilter('OCCUPIED')}
          activeOpacity={0.8}
        >
          <View style={[styles.filterDot, { backgroundColor: COLORS.occupied }]} />
          <Text style={[styles.filterText, filter === 'OCCUPIED' && styles.filterTextActive]}>
            Occupied ({occupiedCount})
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.gridContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />
        }
        showsVerticalScrollIndicator={false}
      >
        {filteredSlots.length === 0 ? (
          <EmptyState
            iconName="bays"
            title="No Matching Bays"
            description={`No parking slots match the current filter "${filter}". Reset filter to view all slots.`}
            actionLabel="Show All Bays"
            onAction={() => setFilter('ALL')}
          />
        ) : (
          <View style={styles.grid}>
            {filteredSlots.map((slot) => {
              const isAvailable = slot.status === 'AVAILABLE';
              const isSelected = selectedSlot?.id === slot.id;

              return (
                <TouchableOpacity
                  key={slot.id}
                  style={[
                    styles.slotCard,
                    isAvailable ? styles.slotCardAvailable : styles.slotCardOccupied,
                    isSelected && styles.slotCardSelected,
                  ]}
                  onPress={() => handleSlotPress(slot)}
                  activeOpacity={0.85}
                >
                  {/* Floor Marking Accent Line */}
                  <View
                    style={[
                      styles.floorMarking,
                      { backgroundColor: isAvailable ? COLORS.available : COLORS.occupied },
                    ]}
                  />

                  <View style={styles.slotCardHeader}>
                    <View style={styles.bayBadge}>
                      <Text style={styles.bayBadgeText}>BAY</Text>
                    </View>
                    <SlotBadge status={slot.status} size="sm" />
                  </View>

                  <View style={styles.slotCenter}>
                    <Text
                      style={[
                        styles.slotNumber,
                        { color: isAvailable ? COLORS.textDark : COLORS.occupiedText },
                      ]}
                    >
                      {slot.slotNumber}
                    </Text>
                    <Text style={styles.slotType}>Standard Vehicle</Text>
                  </View>

                  <View style={styles.slotFooter}>
                    {isAvailable ? (
                      <View style={styles.bookPromptBox}>
                        <Text style={styles.bookPromptText}>Tap to Allocate →</Text>
                      </View>
                    ) : (
                      <View style={styles.occupiedTag}>
                        <Text style={styles.occupiedTagText}>Occupied</Text>
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
  utilizationStrip: {
    backgroundColor: COLORS.cardSurface,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  utilizationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  utilizationTitle: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.textMuted,
    letterSpacing: 0.6,
  },
  utilizationPercent: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.primaryDark,
  },
  utilizationBarBg: {
    height: 5,
    backgroundColor: '#E2E8F0',
    borderRadius: 3,
    overflow: 'hidden',
  },
  utilizationBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  filterBar: {
    flexDirection: 'row',
    backgroundColor: COLORS.canvasBg,
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
  },
  filterBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.cardSurface,
    paddingVertical: 7,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 5,
  },
  filterBtnActive: {
    backgroundColor: COLORS.primarySubtle,
    borderColor: COLORS.primary,
  },
  filterDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  filterText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textSlate,
  },
  filterTextActive: {
    color: COLORS.primaryDark,
    fontWeight: '700',
  },
  gridContainer: {
    padding: 16,
    paddingBottom: 36,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'space-between',
  },
  slotCard: {
    width: '48%',
    backgroundColor: COLORS.cardSurface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 12,
    position: 'relative',
    overflow: 'hidden',
    shadowColor: COLORS.shadowColor,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  slotCardAvailable: {
    backgroundColor: '#FFFFFF',
  },
  slotCardOccupied: {
    backgroundColor: '#FFF1F2',
    borderColor: '#FECDD3',
  },
  slotCardSelected: {
    borderColor: COLORS.primary,
    borderWidth: 2,
  },
  floorMarking: {
    position: 'absolute',
    top: 0,
    left: 10,
    right: 10,
    height: 3,
    borderBottomLeftRadius: 2,
    borderBottomRightRadius: 2,
  },
  slotCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
    paddingTop: 3,
  },
  bayBadge: {
    backgroundColor: COLORS.cardSurfaceAlt,
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 4,
  },
  bayBadgeText: {
    fontSize: 8,
    fontWeight: '700',
    color: COLORS.textMuted,
  },
  slotCenter: {
    alignItems: 'center',
    paddingVertical: 6,
  },
  slotNumber: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  slotType: {
    fontSize: 10,
    color: COLORS.textMuted,
    fontWeight: '500',
    marginTop: 1,
  },
  slotFooter: {
    marginTop: 6,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: 6,
  },
  bookPromptBox: {
    backgroundColor: COLORS.availableBg,
    paddingVertical: 3.5,
    borderRadius: 6,
    alignItems: 'center',
  },
  bookPromptText: {
    fontSize: 9.5,
    fontWeight: '700',
    color: COLORS.availableText,
  },
  occupiedTag: {
    backgroundColor: COLORS.occupiedBg,
    paddingVertical: 3.5,
    borderRadius: 6,
    alignItems: 'center',
  },
  occupiedTagText: {
    fontSize: 9.5,
    fontWeight: '700',
    color: COLORS.occupiedText,
  },
});
