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
    setVehicleNumber(text.toUpperCase());
  };

  const handleQuickPlateSelect = (sample: string) => {
    setVehicleNumber(sample);
  };

  const handleSubmit = async () => {
    const trimmed = vehicleNumber.trim();
    if (!trimmed) {
      Alert.alert('Validation Error', 'Please enter a vehicle registration number.');
      return;
    }

    const cleanReg = trimmed.replace(/[\s\-]+/g, '').toUpperCase();
    const indianRegex = /^([A-Z]{2}[0-9]{1,2}[A-Z]{0,3}[0-9]{4}|[0-9]{2}BH[0-9]{4}[A-Z]{1,2})$/;
    if (!indianRegex.test(cleanReg)) {
      Alert.alert(
        'Invalid Vehicle Format',
        'Please enter a valid Indian vehicle registration number.\n\nExamples:\n• MH12AB1234\n• KA 01 MJ 9876\n• DL-02-C-5555\n• 22BH1234AA'
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

  const cleanDisplayPlate = vehicleNumber.trim() || 'MH 12 AB 1234';

  return (
    <View style={styles.container}>
      <Header
        title="Vehicle Check-In"
        subtitle="Automatic optical registration & optimal bay allocation"
        badge="ENTRY GATE"
      />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Entry Pass Confirmation Card */}
        {confirmedSession && (
          <View style={styles.confirmationCard}>
            <View style={styles.confirmationHeader}>
              <View style={styles.ticketBadge}>
                <Text style={styles.ticketBadgeText}>OFFICIAL ENTRY PASS</Text>
              </View>
              <View style={styles.successPill}>
                <View style={styles.successDot} />
                <Text style={styles.successPillText}>BAY ASSIGNED</Text>
              </View>
            </View>

            <View style={styles.passBody}>
              <View style={styles.passLeft}>
                <Text style={styles.passLabel}>VEHICLE PLATE</Text>
                <Text style={styles.passPlateText}>{confirmedSession.vehicleNumber}</Text>
                <Text style={styles.passTime}>
                  Check-in: {formatDateTime(confirmedSession.entryTime)}
                </Text>
              </View>

              <View style={styles.passRight}>
                <Text style={styles.passSlotLabel}>BAY CODE</Text>
                <View style={styles.passSlotCircle}>
                  <Text style={styles.passSlotText}>{confirmedSession.slotNumber}</Text>
                </View>
              </View>
            </View>

            <View style={styles.passTariffBox}>
              <Text style={styles.passTariffLabel}>BILLING POLICY</Text>
              <Text style={styles.passTariffText}>₹50 per started 3-hour block</Text>
            </View>

            <TouchableOpacity
              style={styles.dismissBtn}
              onPress={handleCloseConfirmation}
              activeOpacity={0.85}
            >
              <Text style={styles.dismissBtnText}>Track in Active Parking →</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Real-Time Indian License Plate Preview */}
        <View style={styles.platePreviewSection}>
          <Text style={styles.sectionMicroHeader}>REAL-TIME PLATE SIMULATION (HSRP)</Text>
          <View style={styles.plateContainer}>
            <View style={styles.plateBlueStrip}>
              <Text style={styles.plateInd}>IND</Text>
              <View style={styles.plateChakra} />
            </View>
            <View style={styles.plateNumberBox}>
              <Text
                style={[
                  styles.plateNumberText,
                  !vehicleNumber.trim() && styles.plateNumberPlaceholder,
                ]}
              >
                {cleanDisplayPlate}
              </Text>
            </View>
            <View style={styles.plateSecurityHolo}>
              <Text style={styles.plateSecurityText}>🔒</Text>
            </View>
          </View>

          {/* Quick Preset Samples for Testing */}
          <View style={styles.sampleChipsRow}>
            <Text style={styles.sampleChipsLabel}>Presets:</Text>
            {['MH12AB1234', 'KA01MJ8888', 'DL03CA5555', '22BH1234AA'].map((sample) => (
              <TouchableOpacity
                key={sample}
                style={styles.sampleChip}
                onPress={() => handleQuickPlateSelect(sample)}
                activeOpacity={0.7}
              >
                <Text style={styles.sampleChipText}>{sample}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Input Form Card */}
        <View style={styles.formCard}>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>
              Vehicle Registration Number <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={styles.textInput}
              placeholder="e.g. MH12AB1234 or 22BH1234AA"
              placeholderTextColor={COLORS.textMuted}
              value={vehicleNumber}
              onChangeText={handleVehicleChange}
              autoCapitalize="characters"
              autoCorrect={false}
              editable={!submitting}
            />
            <Text style={styles.inputHint}>
              Supports Indian MoRTH standard states (MH, KA, DL, etc.) and BH series.
            </Text>
          </View>

          {/* Bay Selection Preferences */}
          <View style={styles.inputGroup}>
            <View style={styles.slotChoiceHeader}>
              <Text style={styles.inputLabel}>Bay Allocation Mode</Text>
              <TouchableOpacity onPress={loadAvailableSlots} disabled={loadingSlots}>
                <Text style={styles.refreshSlotsText}>
                  {loadingSlots ? 'Refreshing...' : 'Refresh Bays ⟳'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Option A: Automatic AI Dispatch */}
            <TouchableOpacity
              style={[
                styles.slotOption,
                selectedSlotId === null && styles.slotOptionSelected,
              ]}
              onPress={() => setSelectedSlotId(null)}
              activeOpacity={0.8}
            >
              <View style={styles.slotOptionLeft}>
                <View
                  style={[
                    styles.radioCircle,
                    selectedSlotId === null && styles.radioCircleActive,
                  ]}
                />
                <View style={styles.slotOptionTexts}>
                  <View style={styles.optTitleRow}>
                    <Text style={styles.slotOptionTitle}>Smart Auto-Allocation</Text>
                    <View style={styles.recBadge}>
                      <Text style={styles.recBadgeText}>RECOMMENDED</Text>
                    </View>
                  </View>
                  <Text style={styles.slotOptionSub}>
                    Optimally assigns the closest vacant bay to entry gate
                  </Text>
                </View>
              </View>
            </TouchableOpacity>

            {/* Option B: Specific Bay Grid */}
            <Text style={styles.subHeader}>Or allocate a specific vacant bay:</Text>

            {loadingSlots ? (
              <ActivityIndicator color={COLORS.primary} style={{ marginVertical: 12 }} />
            ) : availableSlots.length === 0 ? (
              <View style={styles.noSlotsBanner}>
                <Text style={styles.noSlotsWarning}>All parking bays are currently occupied!</Text>
              </View>
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
                      activeOpacity={0.8}
                    >
                      <View
                        style={[
                          styles.bayDot,
                          { backgroundColor: isSelected ? '#FFFFFF' : COLORS.available },
                        ]}
                      />
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

          {/* Pricing Transparency Banner */}
          <View style={styles.pricingNotice}>
            <View style={styles.pricingIconBox}>
              <Text style={styles.pricingIcon}>ℹ️</Text>
            </View>
            <View style={styles.pricingInfo}>
              <Text style={styles.pricingTitle}>Fixed Tariff: ₹50 / 3-Hour Block</Text>
              <Text style={styles.pricingSub}>
                Rounded up to the nearest 3-hour increment upon vehicle exit.
              </Text>
            </View>
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            style={[
              styles.submitBtn,
              (submitting || availableSlots.length === 0) && styles.submitBtnDisabled,
            ]}
            onPress={handleSubmit}
            disabled={submitting || availableSlots.length === 0}
            activeOpacity={0.85}
          >
            {submitting ? (
              <View style={styles.submittingRow}>
                <ActivityIndicator color="#FFFFFF" size="small" />
                <Text style={styles.submitBtnText}>Allocating Bay & Registering...</Text>
              </View>
            ) : (
              <Text style={styles.submitBtnText}>Complete Check-In & Allocate Bay</Text>
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
    backgroundColor: 'rgba(16, 185, 129, 0.08)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
    padding: 18,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  confirmationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  ticketBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  ticketBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: COLORS.availableText,
    letterSpacing: 0.8,
  },
  successPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  successDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.available,
  },
  successPillText: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.availableText,
  },
  passBody: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  passLeft: {
    flex: 1,
  },
  passLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: COLORS.textMuted,
    letterSpacing: 0.6,
  },
  passPlateText: {
    fontSize: 18,
    fontWeight: '900',
    color: COLORS.textPrimary,
    letterSpacing: 1,
    marginTop: 2,
  },
  passTime: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  passRight: {
    alignItems: 'center',
  },
  passSlotLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: COLORS.textMuted,
    marginBottom: 4,
  },
  passSlotCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.cardBgElevated,
    borderWidth: 2,
    borderColor: COLORS.available,
    alignItems: 'center',
    justifyContent: 'center',
  },
  passSlotText: {
    fontSize: 14,
    fontWeight: '900',
    color: COLORS.availableText,
  },
  passTariffBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    paddingHorizontal: 4,
  },
  passTariffLabel: {
    fontSize: 10,
    color: COLORS.textMuted,
    fontWeight: '700',
  },
  passTariffText: {
    fontSize: 11,
    color: COLORS.primaryLight,
    fontWeight: '700',
  },
  dismissBtn: {
    backgroundColor: COLORS.available,
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 14,
  },
  dismissBtnText: {
    color: '#0A0F1D',
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 0.3,
  },
  platePreviewSection: {
    marginBottom: 16,
  },
  sectionMicroHeader: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.primaryLight,
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  plateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    borderWidth: 2.5,
    borderColor: '#CBD5E1',
    paddingVertical: 8,
    paddingHorizontal: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  plateBlueStrip: {
    backgroundColor: '#1E3A8A',
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  plateInd: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  plateChakra: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#60A5FA',
    marginTop: 2,
  },
  plateNumberBox: {
    flex: 1,
  },
  plateNumberText: {
    fontSize: 20,
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: 2,
  },
  plateNumberPlaceholder: {
    color: '#94A3B8',
    fontStyle: 'italic',
  },
  plateSecurityHolo: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  plateSecurityText: {
    fontSize: 11,
  },
  sampleChipsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
    flexWrap: 'wrap',
  },
  sampleChipsLabel: {
    fontSize: 11,
    color: COLORS.textMuted,
    fontWeight: '600',
  },
  sampleChip: {
    backgroundColor: COLORS.cardBgElevated,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  sampleChipText: {
    fontSize: 10,
    color: COLORS.cyanLight,
    fontWeight: '700',
  },
  formCard: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textSecondary,
    marginBottom: 6,
    letterSpacing: 0.3,
  },
  required: {
    color: COLORS.occupied,
  },
  textInput: {
    backgroundColor: COLORS.inputBg,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: COLORS.textPrimary,
    fontWeight: '700',
    letterSpacing: 1,
  },
  inputHint: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 6,
    lineHeight: 15,
  },
  slotChoiceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  refreshSlotsText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.primaryLight,
  },
  slotOption: {
    backgroundColor: COLORS.inputBg,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 12,
    marginBottom: 10,
  },
  slotOptionSelected: {
    borderColor: COLORS.primary,
    backgroundColor: 'rgba(99, 102, 241, 0.08)',
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
    borderColor: COLORS.textMuted,
  },
  radioCircleActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary,
  },
  slotOptionTexts: {
    flex: 1,
  },
  optTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  slotOptionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  recBadge: {
    backgroundColor: 'rgba(99, 102, 241, 0.2)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  recBadgeText: {
    fontSize: 8,
    fontWeight: '800',
    color: COLORS.primaryLight,
  },
  slotOptionSub: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  subHeader: {
    fontSize: 11,
    color: COLORS.textMuted,
    fontWeight: '600',
    marginTop: 4,
    marginBottom: 8,
  },
  noSlotsBanner: {
    padding: 10,
    backgroundColor: COLORS.occupiedBg,
    borderRadius: 10,
  },
  noSlotsWarning: {
    fontSize: 12,
    color: COLORS.occupiedText,
    fontWeight: '700',
    textAlign: 'center',
  },
  baysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  bayChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.inputBg,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 6,
  },
  bayChipSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  bayDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  bayChipText: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.textSecondary,
  },
  bayChipTextSelected: {
    color: '#FFFFFF',
  },
  pricingNotice: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
  },
  pricingIconBox: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.cardBgElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pricingIcon: {
    fontSize: 13,
  },
  pricingInfo: {
    flex: 1,
  },
  pricingTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  pricingSub: {
    fontSize: 10,
    color: COLORS.textSecondary,
    marginTop: 1,
  },
  submitBtn: {
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 4,
  },
  submitBtnDisabled: {
    opacity: 0.5,
  },
  submittingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
});
