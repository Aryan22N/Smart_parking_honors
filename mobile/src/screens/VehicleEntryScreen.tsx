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
import { Icon } from '../components/Icon';
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
      // Silently catch
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
      Alert.alert('Validation Notice', 'Please enter a vehicle registration number to proceed.');
      return;
    }

    const cleanReg = trimmed.replace(/[\s\-]+/g, '').toUpperCase();
    const indianRegex = /^([A-Z]{2}[0-9]{1,2}[A-Z]{0,3}[0-9]{4}|[0-9]{2}BH[0-9]{4}[A-Z]{1,2})$/;
    if (!indianRegex.test(cleanReg)) {
      Alert.alert(
        'Invalid Vehicle Format',
        'Please enter a valid vehicle registration number.\n\nAccepted Formats:\n• MH12AB1234 (Standard State)\n• KA 01 MJ 8888\n• DL-03-C-5555\n• 22BH1234AA (BH Series)'
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
      Alert.alert('Registration Error', err.message || 'Failed to check in vehicle.');
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
        subtitle="Register incoming vehicle and allocate parking bay"
        badge="GATE 1"
      />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Registration Success Pass */}
        {confirmedSession && (
          <View style={styles.successPassCard}>
            <View style={styles.passHeader}>
              <View style={styles.passBadge}>
                <Text style={styles.passBadgeText}>ENTRY PASS ISSUED</Text>
              </View>
              <View style={styles.passStatusTag}>
                <View style={styles.passStatusDot} />
                <Text style={styles.passStatusText}>BAY LOCKED</Text>
              </View>
            </View>

            <View style={styles.passBody}>
              <View>
                <Text style={styles.passLabel}>VEHICLE REGISTRATION</Text>
                <Text style={styles.passPlate}>{confirmedSession.vehicleNumber}</Text>
                <Text style={styles.passTime}>
                  Entry: {formatDateTime(confirmedSession.entryTime)}
                </Text>
              </View>

              <View style={styles.passBayBox}>
                <Text style={styles.passBayLabel}>BAY</Text>
                <Text style={styles.passBayValue}>{confirmedSession.slotNumber}</Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.passActionBtn}
              onPress={handleCloseConfirmation}
              activeOpacity={0.85}
            >
              <Text style={styles.passActionBtnText}>Track in Active Sessions →</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Real-Time Indian License Plate Preview */}
        <View style={styles.platePreviewSection}>
          <Text style={styles.sectionHeader}>LICENSE PLATE PREVIEW (HSRP)</Text>
          <View style={styles.plateContainer}>
            <View style={styles.plateBlueStrip}>
              <Text style={styles.plateInd}>IND</Text>
              <View style={styles.plateChakra} />
            </View>
            <View style={styles.plateNumberBox}>
              <Text
                style={[
                  styles.plateNumberText,
                  !vehicleNumber.trim() && styles.platePlaceholderText,
                ]}
              >
                {cleanDisplayPlate}
              </Text>
            </View>
            <View style={styles.plateSecurityBadge}>
              <Icon name="check" size={10} color={COLORS.primaryDark} />
            </View>
          </View>

          {/* Quick Preset Samples */}
          <View style={styles.presetsRow}>
            <Text style={styles.presetsLabel}>Quick Presets:</Text>
            {['MH12AB1234', 'KA01MJ8888', 'DL03CA5555', '22BH1234AA'].map((sample) => (
              <TouchableOpacity
                key={sample}
                style={[
                  styles.presetChip,
                  vehicleNumber === sample && styles.presetChipActive,
                ]}
                onPress={() => handleQuickPlateSelect(sample)}
                activeOpacity={0.75}
              >
                <Text
                  style={[
                    styles.presetChipText,
                    vehicleNumber === sample && styles.presetChipTextActive,
                  ]}
                >
                  {sample}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Registration Form Card */}
        <View style={styles.formCard}>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>
              Vehicle Registration Number <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={styles.textInput}
              placeholder="e.g. MH12AB1234 or KA01MJ8888"
              placeholderTextColor={COLORS.textMuted}
              value={vehicleNumber}
              onChangeText={handleVehicleChange}
              autoCapitalize="characters"
              autoCorrect={false}
              editable={!submitting}
            />
            <Text style={styles.inputHint}>
              Supports standard Indian state registration formats and BH series.
            </Text>
          </View>

          {/* Bay Selection Options */}
          <View style={styles.inputGroup}>
            <View style={styles.slotChoiceHeader}>
              <Text style={styles.inputLabel}>Bay Allocation Strategy</Text>
              <TouchableOpacity onPress={loadAvailableSlots} disabled={loadingSlots}>
                <Text style={styles.refreshText}>
                  {loadingSlots ? 'Updating...' : 'Refresh Bays'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Strategy 1: Automatic AI Assign */}
            <TouchableOpacity
              style={[
                styles.strategyOption,
                selectedSlotId === null && styles.strategyOptionSelected,
              ]}
              onPress={() => setSelectedSlotId(null)}
              activeOpacity={0.8}
            >
              <View
                style={[
                  styles.radioDot,
                  selectedSlotId === null && styles.radioDotActive,
                ]}
              />
              <View style={styles.strategyTexts}>
                <View style={styles.strategyTitleRow}>
                  <Text style={styles.strategyTitle}>Automatic Optimal Assignment</Text>
                  <View style={styles.recommendedPill}>
                    <Text style={styles.recommendedPillText}>RECOMMENDED</Text>
                  </View>
                </View>
                <Text style={styles.strategySub}>
                  ParkEase assigns the closest vacant bay to the entry gate
                </Text>
              </View>
            </TouchableOpacity>

            {/* Strategy 2: Manual Selection from Grid */}
            <Text style={styles.subLabel}>Or select an available bay manually:</Text>

            {loadingSlots ? (
              <ActivityIndicator color={COLORS.primary} style={{ marginVertical: 10 }} />
            ) : availableSlots.length === 0 ? (
              <View style={styles.noSlotsWarningBox}>
                <Text style={styles.noSlotsWarningText}>All bays are currently occupied!</Text>
              </View>
            ) : (
              <View style={styles.baysWrap}>
                {availableSlots.map((slot) => {
                  const isSelected = selectedSlotId === slot.id;
                  return (
                    <TouchableOpacity
                      key={slot.id}
                      style={[
                        styles.baySelectChip,
                        isSelected && styles.baySelectChipSelected,
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
                          styles.baySelectChipText,
                          isSelected && styles.baySelectChipTextSelected,
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

          {/* Fixed Tariff Policy Note */}
          <View style={styles.tariffCard}>
            <View style={styles.tariffIconBox}>
              <Icon name="alert" size={12} color={COLORS.primaryDark} />
            </View>
            <View style={styles.tariffTexts}>
              <Text style={styles.tariffTitle}>Standard Tariff: ₹50 / 3-Hour Block</Text>
              <Text style={styles.tariffSub}>
                Fee is calculated in 3-hour increments rounded up upon checkout.
              </Text>
            </View>
          </View>

          {/* Submit Action Button */}
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
                <Text style={styles.submitBtnText}>Allocating Bay & Check-In...</Text>
              </View>
            ) : (
              <Text style={styles.submitBtnText}>Check In Vehicle & Allocate Bay</Text>
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
    backgroundColor: COLORS.canvasBg,
  },
  content: {
    padding: 16,
    paddingBottom: 36,
  },
  successPassCard: {
    backgroundColor: COLORS.cardSurface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.availableBorder,
    padding: 14,
    marginBottom: 14,
    shadowColor: COLORS.shadowColor,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  passHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  passBadge: {
    backgroundColor: COLORS.availableBg,
    paddingHorizontal: 7,
    paddingVertical: 2.5,
    borderRadius: 5,
  },
  passBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    color: COLORS.availableText,
    letterSpacing: 0.5,
  },
  passStatusTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  passStatusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.available,
  },
  passStatusText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.availableText,
  },
  passBody: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.cardSurfaceAlt,
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  passLabel: {
    fontSize: 8.5,
    fontWeight: '700',
    color: COLORS.textMuted,
    letterSpacing: 0.5,
  },
  passPlate: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.textDark,
    letterSpacing: 0.8,
    marginTop: 2,
  },
  passTime: {
    fontSize: 10.5,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  passBayBox: {
    backgroundColor: COLORS.primarySubtle,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    alignItems: 'center',
  },
  passBayLabel: {
    fontSize: 8,
    fontWeight: '800',
    color: COLORS.primaryDark,
  },
  passBayValue: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.primaryDark,
  },
  passActionBtn: {
    backgroundColor: COLORS.primary,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  passActionBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  platePreviewSection: {
    marginBottom: 12,
  },
  sectionHeader: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.textMuted,
    letterSpacing: 0.6,
    marginBottom: 6,
  },
  plateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#0F172A',
    paddingVertical: 7,
    paddingHorizontal: 10,
    shadowColor: COLORS.shadowColor,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  plateBlueStrip: {
    backgroundColor: '#1E3A8A',
    paddingVertical: 4,
    paddingHorizontal: 6,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  plateInd: {
    color: '#FFFFFF',
    fontSize: 8,
    fontWeight: '900',
  },
  plateChakra: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#60A5FA',
    marginTop: 1,
  },
  plateNumberBox: {
    flex: 1,
  },
  plateNumberText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: 1.5,
  },
  platePlaceholderText: {
    color: '#94A3B8',
    fontStyle: 'italic',
  },
  plateSecurityBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: COLORS.primarySubtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  presetsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 6,
    flexWrap: 'wrap',
  },
  presetsLabel: {
    fontSize: 10,
    color: COLORS.textMuted,
    fontWeight: '600',
  },
  presetChip: {
    backgroundColor: COLORS.cardSurface,
    paddingHorizontal: 8,
    paddingVertical: 3.5,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  presetChipActive: {
    backgroundColor: COLORS.primarySubtle,
    borderColor: COLORS.primary,
  },
  presetChipText: {
    fontSize: 10,
    color: COLORS.textSlate,
    fontWeight: '700',
  },
  presetChipTextActive: {
    color: COLORS.primaryDark,
  },
  formCard: {
    backgroundColor: COLORS.cardSurface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 14,
    shadowColor: COLORS.shadowColor,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  inputGroup: {
    marginBottom: 14,
  },
  inputLabel: {
    fontSize: 11.5,
    fontWeight: '700',
    color: COLORS.textDark,
    marginBottom: 5,
  },
  required: {
    color: COLORS.occupied,
  },
  textInput: {
    backgroundColor: COLORS.inputBg,
    borderWidth: 1.5,
    borderColor: COLORS.inputBorder,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 9,
    fontSize: 14,
    color: COLORS.textDark,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  inputHint: {
    fontSize: 10.5,
    color: COLORS.textMuted,
    marginTop: 4,
  },
  slotChoiceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  refreshText: {
    fontSize: 10.5,
    fontWeight: '600',
    color: COLORS.primary,
  },
  strategyOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.cardSurfaceAlt,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 10,
    marginBottom: 8,
    gap: 10,
  },
  strategyOptionSelected: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primarySubtle,
  },
  radioDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: COLORS.inputBorder,
  },
  radioDotActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary,
  },
  strategyTexts: {
    flex: 1,
  },
  strategyTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  strategyTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  recommendedPill: {
    backgroundColor: 'rgba(13, 148, 136, 0.18)',
    paddingHorizontal: 5,
    paddingVertical: 1.5,
    borderRadius: 4,
  },
  recommendedPillText: {
    fontSize: 7.5,
    fontWeight: '800',
    color: COLORS.primaryDark,
  },
  strategySub: {
    fontSize: 10,
    color: COLORS.textMuted,
    marginTop: 1,
  },
  subLabel: {
    fontSize: 10.5,
    color: COLORS.textMuted,
    fontWeight: '600',
    marginTop: 3,
    marginBottom: 6,
  },
  noSlotsWarningBox: {
    padding: 8,
    backgroundColor: COLORS.occupiedBg,
    borderRadius: 6,
  },
  noSlotsWarningText: {
    fontSize: 11,
    color: COLORS.occupiedText,
    fontWeight: '700',
    textAlign: 'center',
  },
  baysWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  baySelectChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.cardSurfaceAlt,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 7,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 4,
  },
  baySelectChipSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  bayDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
  baySelectChipText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textSlate,
  },
  baySelectChipTextSelected: {
    color: '#FFFFFF',
  },
  tariffCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.cardSurfaceAlt,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 10,
    alignItems: 'center',
    gap: 8,
    marginBottom: 14,
  },
  tariffIconBox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    backgroundColor: COLORS.primarySubtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tariffTexts: {
    flex: 1,
  },
  tariffTitle: {
    fontSize: 11.5,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  tariffSub: {
    fontSize: 10,
    color: COLORS.textMuted,
    marginTop: 1,
  },
  submitBtn: {
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 3,
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
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
});
