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
      Alert.alert('Error', err.message || 'Could not fetch parking slots.');
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
        `Slot ${slot.slotNumber}`,
        `This slot is currently AVAILABLE. Would you like to book a vehicle into slot ${slot.slotNumber}?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Book This Slot',
            style: 'default',
            onPress: () => onSelectSlotToBook(slot),
          },
        ]
      );
    } else {
      Alert.alert(
        `Slot ${slot.slotNumber} (OCCUPIED)`,
        `This slot is currently occupied by an active parking session. View the Active Parking tab to monitor or checkout the vehicle.`,
        [{ text: 'OK' }]
      );
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading parking slots...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header
        title="Parking Slots"
        subtitle={`${availableCount} Available • ${occupiedCount} Occupied`}
      />

      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[styles.filterBtn, filter === 'ALL' && styles.filterBtnActive]}
          onPress={() => setFilter('ALL')}
        >
          <Text style={[styles.filterText, filter === 'ALL' && styles.filterTextActive]}>
            All ({slots.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterBtn, filter === 'AVAILABLE' && styles.filterBtnActive]}
          onPress={() => setFilter('AVAILABLE')}
        >
          <Text style={[styles.filterText, filter === 'AVAILABLE' && styles.filterTextActive]}>
            Available ({availableCount})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterBtn, filter === 'OCCUPIED' && styles.filterBtnActive]}
          onPress={() => setFilter('OCCUPIED')}
        >
          <Text style={[styles.filterText, filter === 'OCCUPIED' && styles.filterTextActive]}>
            Occupied ({occupiedCount})
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.gridContainer}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
        showsVerticalScrollIndicator={false}
      >
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
                activeOpacity={0.8}
              >
                <View style={styles.slotCardTop}>
                  <Text style={styles.slotNumber}>{slot.slotNumber}</Text>
                  <View
                    style={[
                      styles.indicatorDot,
                      { backgroundColor: isAvailable ? COLORS.available : COLORS.occupied },
                    ]}
                  />
                </View>

                <View style={styles.slotCardBottom}>
                  <SlotBadge status={slot.status} />
                  <Text style={styles.tapHint}>
                    {isAvailable ? 'Tap to book' : 'Occupied'}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {filteredSlots.length === 0 && (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No parking slots found matching the selected filter.</Text>
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
  },
  loadingText: {
    marginTop: 12,
    color: COLORS.textSecondary,
    fontSize: 14,
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
    backgroundColor: COLORS.bgPrimary,
  },
  filterBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: COLORS.cardBg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  filterBtnActive: {
    backgroundColor: COLORS.primaryDark,
    borderColor: COLORS.primary,
  },
  filterText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  filterTextActive: {
    color: COLORS.textPrimary,
  },
  gridContainer: {
    padding: 16,
    paddingBottom: 40,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  slotCard: {
    width: '48%',
    backgroundColor: COLORS.cardBg,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1.5,
    minHeight: 110,
    justifyContent: 'space-between',
  },
  slotCardAvailable: {
    borderColor: COLORS.border,
  },
  slotCardOccupied: {
    borderColor: 'rgba(239, 68, 68, 0.35)',
    backgroundColor: 'rgba(30, 41, 59, 0.75)',
  },
  slotCardSelected: {
    borderColor: COLORS.primary,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 8,
    elevation: 4,
  },
  slotCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  slotNumber: {
    fontSize: 18,
    fontWeight: '900',
    color: COLORS.textPrimary,
  },
  indicatorDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  slotCardBottom: {
    marginTop: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tapHint: {
    fontSize: 10,
    color: COLORS.textMuted,
    fontWeight: '600',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    color: COLORS.textSecondary,
    fontSize: 14,
  },
});
