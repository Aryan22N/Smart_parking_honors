import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { COLORS } from '../constants/colors';
import { Header } from '../components/Header';
import { slotsApi, sessionsApi } from '../api/endpoints';
import { ParkingSlot, ParkingSession } from '../types';
import { formatDateTime } from '../utils/formatting';

interface VehicleEntryScreenProps {
  initialSlot?: ParkingSlot | null;
  onBookingSuccess: () => void;
  onClearInitialSlot?: () => void;
}

export const VehicleEntryScreen: React.FC<VehicleEntryScreenProps> = ({
  initialSlot,
  onBookingSuccess,
  onClearInitialSlot,
}) => {
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [availableSlots, setAvailableSlots] = useState<ParkingSlot[]>([]);
  const [selectedSlotId, setSelectedSlotId] = useState<number | null>(
    initialSlot ? initialSlot.id : null
  );
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [confirmedSession, setConfirmedSession] = useState<ParkingSession | null>(null);

  useEffect(() => {
    if (initialSlot) {
      setSelectedSlotId(initialSlot.id);
    }
  }, [initialSlot]);

  useEffect(() => {
    loadAvailableSlots();
  }, []);

  const loadAvailableSlots = async () => {
    try {
      setLoadingSlots(true);
      const data = await slotsApi.getAvailable();
      setAvailableSlots(data);
    } catch {
      // Silently catch or handle
    } finally {
      setLoadingSlots(false);
    }
  };

  const handleVehicleChange = (text: string) => {
    // Automatically uppercase and clean
    setVehicleNumber(text.toUpperCase());
  };

  const handleSubmit = async () => {
    const trimmed = vehicleNumber.trim();
    if (!trimmed) {
      Alert.alert('Validation Error', 'Please enter a vehicle registration number.');
      return;
    }

    // Quick regex validation check on client before submit
    const cleanReg = trimmed.replace(/[\s\-]+/g, '').toUpperCase();
    const indianRegex = /^([A-Z]{2}[0-9]{1,2}[A-Z]{0,3}[0-9]{4}|[0-9]{2}BH[0-9]{4}[A-Z]{1,2})$/;
    if (!indianRegex.test(cleanReg)) {
      Alert.alert(
        'Invalid Vehicle Format',
        'Please enter a valid Indian vehicle registration number.\n\nExamples:\n• KA01AB1234\n• MH 12 CD 3456\n• DL-01-A-1234\n• 22BH1234AA'
      );
      return;
    }

    try {
      setSubmitting(true);
      const session = await sessionsApi.entry({
        vehicleNumber: trimmed,
        slotId: selectedSlotId,
      });

      setConfirmedSession(session);
      setVehicleNumber('');
      setSelectedSlotId(null);
      if (onClearInitialSlot) onClearInitialSlot();
      loadAvailableSlots();
    } catch (err: any) {
      Alert.alert('Booking Error', err.message || 'Failed to book parking session.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCloseConfirmation = () => {
    setConfirmedSession(null);
    onBookingSuccess();
  };

  return (
    <View style={styles.container}>
      <Header
        title="Vehicle Entry"
        subtitle="Check-in a vehicle and allocate a parking bay"
      />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Booking Confirmation Card */}
        {confirmedSession && (
          <View style={styles.confirmationCard}>
            <View style={styles.confirmationHeader}>
              <View style={styles.successIconBox}>
                <Text style={styles.successIcon}>✓</Text>
              </View>
              <View>
                <Text style={styles.confirmationTitle}>Entry Registered Successfully!</Text>
                <Text style={styles.confirmationSubtitle}>
                  Session ID: #{confirmedSession.id}
                </Text>
              </View>
            </View>

            <View style={styles.confirmDetailsBox}>
              <View style={styles.confirmRow}>
                <Text style={styles.confirmLabel}>Vehicle Number</Text>
                <Text style={styles.confirmValue}>{confirmedSession.vehicleNumber}</Text>
              </View>
              <View style={styles.confirmRow}>
                <Text style={styles.confirmLabel}>Allocated Slot</Text>
                <Text style={[styles.confirmValue, { color: COLORS.available }]}>
                  {confirmedSession.slotNumber}
                </Text>
              </View>
              <View style={styles.confirmRow}>
                <Text style={styles.confirmLabel}>Entry Timestamp</Text>
                <Text style={styles.confirmValue}>{formatDateTime(confirmedSession.entryTime)}</Text>
              </View>
              <View style={styles.confirmRow}>
                <Text style={styles.confirmLabel}>Hourly Fee Policy</Text>
                <Text style={styles.confirmValue}>₹50 / started 3 hrs</Text>
              </View>
            </View>

            <TouchableOpacity style={styles.dismissBtn} onPress={handleCloseConfirmation}>
              <Text style={styles.dismissBtnText}>View in Active Parking</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Input Form Card */}
        <View style={styles.formCard}>
          <Text style={styles.formTitle}>Vehicle Information</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>
              Vehicle Registration Number <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={styles.textInput}
              placeholder="e.g. KA01AB1234 or MH 12 CD 3456"
              placeholderTextColor={COLORS.textMuted}
              value={vehicleNumber}
              onChangeText={handleVehicleChange}
              autoCapitalize="characters"
              autoCorrect={false}
              editable={!submitting}
            />
            <Text style={styles.inputHint}>
              Accepted Indian formats: standard states (KA, MH, DL, etc.) and BH series.
            </Text>
          </View>

          {/* Slot Allocation Preference */}
          <View style={styles.inputGroup}>
            <View style={styles.slotChoiceHeader}>
              <Text style={styles.inputLabel}>Parking Slot Allocation</Text>
              <TouchableOpacity onPress={loadAvailableSlots} disabled={loadingSlots}>
                <Text style={styles.refreshSlotsText}>
                  {loadingSlots ? 'Refreshing...' : 'Refresh Bays ⟳'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Auto-allocate vs Specific Selection */}
            <TouchableOpacity
              style={[
                styles.slotOption,
                selectedSlotId === null && styles.slotOptionSelected,
              ]}
              onPress={() => setSelectedSlotId(null)}
            >
              <View style={styles.slotOptionLeft}>
                <View
                  style={[
                    styles.radioCircle,
                    selectedSlotId === null && styles.radioCircleActive,
                  ]}
                />
                <View>
                  <Text style={styles.slotOptionTitle}>Automatic Allocation (Recommended)</Text>
                  <Text style={styles.slotOptionSub}>Backend automatically assigns the next optimal bay</Text>
                </View>
              </View>
            </TouchableOpacity>

            <Text style={styles.subHeader}>Or select a specific available bay:</Text>

            {loadingSlots ? (
              <ActivityIndicator color={COLORS.primary} style={{ marginVertical: 10 }} />
            ) : availableSlots.length === 0 ? (
              <Text style={styles.noSlotsWarning}>No slots are currently available!</Text>
            ) : (
              <View style={styles.baysGrid}>
                {availableSlots.map((slot) => {
                  const isSelected = selectedSlotId === slot.id;
                  return (
                    <TouchableOpacity
                      key={slot.id}
                      style={[
                        styles.bayChip,
                        isSelected && styles.bayChipSelected,
                      ]}
                      onPress={() => setSelectedSlotId(slot.id)}
                    >
                      <Text
                        style={[
                          styles.bayChipText,
                          isSelected && styles.bayChipTextSelected,
                        ]}
                      >
                        {slot.slotNumber}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            style={[styles.submitBtn, submitting && styles.submitBtnDisabled]}
            onPress={handleSubmit}
            disabled={submitting}
          >
            {submitting ? (
              <ActivityIndicator color={COLORS.bgPrimary} />
            ) : (
              <Text style={styles.submitBtnText}>Confirm Entry & Allocate Bay</Text>
            )}
          </TouchableOpacity>
        </View>
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
  confirmationCard: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: COLORS.available,
    padding: 18,
    marginBottom: 20,
  },
  confirmationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 14,
  },
  successIconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.availableBg,
    borderWidth: 1,
    borderColor: COLORS.available,
    justifyContent: 'center',
    alignItems: 'center',
  },
  successIcon: {
    color: COLORS.available,
    fontSize: 20,
    fontWeight: '900',
  },
  confirmationTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  confirmationSubtitle: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  confirmDetailsBox: {
    backgroundColor: COLORS.bgPrimary,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 8,
    marginBottom: 14,
  },
  confirmRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  confirmLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  confirmValue: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  dismissBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  dismissBtnText: {
    color: COLORS.bgPrimary,
    fontWeight: '800',
    fontSize: 14,
  },
  formCard: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 20,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  required: {
    color: COLORS.occupied,
  },
  textInput: {
    backgroundColor: COLORS.inputBg,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
    letterSpacing: 1,
  },
  inputHint: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 6,
  },
  slotChoiceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  refreshSlotsText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primary,
  },
  slotOption: {
    backgroundColor: COLORS.bgPrimary,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
  },
  slotOptionSelected: {
    borderColor: COLORS.primary,
    backgroundColor: 'rgba(56, 189, 248, 0.08)',
  },
  slotOptionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  radioCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: COLORS.borderLight,
  },
  radioCircleActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary,
  },
  slotOptionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  slotOptionSub: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  subHeader: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginTop: 6,
    marginBottom: 10,
  },
  noSlotsWarning: {
    color: COLORS.occupied,
    fontSize: 13,
    fontWeight: '700',
  },
  baysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  bayChip: {
    backgroundColor: COLORS.bgPrimary,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  bayChipSelected: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primaryDark,
  },
  bayChipText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  bayChipTextSelected: {
    color: COLORS.textPrimary,
  },
  submitBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 6,
  },
  submitBtnDisabled: {
    opacity: 0.6,
  },
  submitBtnText: {
    color: COLORS.bgPrimary,
    fontSize: 15,
    fontWeight: '800',
  },
});
