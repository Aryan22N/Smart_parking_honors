import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { COLORS } from '../constants/colors';
import { Invoice } from '../types';
import { formatCurrency, formatDateTime } from '../utils/formatting';
import { sessionsApi } from '../api/endpoints';

interface InvoiceModalProps {
  visible: boolean;
  invoice: Invoice | null;
  onClose: () => void;
  onPaymentSuccess?: () => void;
}

export const InvoiceModal: React.FC<InvoiceModalProps> = ({
  visible,
  invoice,
  onClose,
  onPaymentSuccess,
}) => {
  const [updatingPayment, setUpdatingPayment] = useState(false);

  if (!invoice) return null;

  const isUnpaid = invoice.paymentStatus === 'UNPAID';

  const handleConfirmPayment = async () => {
    try {
      setUpdatingPayment(true);
      await sessionsApi.updatePayment(invoice.sessionId, { paymentStatus: 'PAID' });
      invoice.paymentStatus = 'PAID';
      Alert.alert(
        'Payment Settled',
        `Payment of ${formatCurrency(invoice.totalFee)} has been successfully verified & recorded.`
      );
      if (onPaymentSuccess) {
        onPaymentSuccess();
      }
    } catch (err: any) {
      Alert.alert('Payment Error', err.message || 'Failed to update payment status.');
    } finally {
      setUpdatingPayment(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modalCard}>
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollBody}>
            {/* Top Receipt Bar */}
            <View style={styles.receiptTop}>
              <View style={styles.brandBadge}>
                <View style={styles.brandIcon}>
                  <Text style={styles.brandIconText}>🅿</Text>
                </View>
                <View>
                  <Text style={styles.companyName}>SMART PARKING FACILITY</Text>
                  <Text style={styles.receiptType}>OFFICIAL PARKING TAX INVOICE</Text>
                </View>
              </View>

              <TouchableOpacity onPress={onClose} style={styles.closeBtn} activeOpacity={0.7}>
                <Text style={styles.closeBtnText}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* Invoice Ref & Status Stamp */}
            <View style={styles.refRow}>
              <View>
                <Text style={styles.refLabel}>INVOICE NUMBER</Text>
                <Text style={styles.refValue}>#{invoice.invoiceNumber}</Text>
              </View>

              <View
                style={[
                  styles.statusStamp,
                  {
                    backgroundColor: isUnpaid ? COLORS.warningBg : COLORS.availableBg,
                    borderColor: isUnpaid ? COLORS.warningBorder : COLORS.availableBorder,
                  },
                ]}
              >
                <View
                  style={[
                    styles.statusDot,
                    { backgroundColor: isUnpaid ? COLORS.warning : COLORS.available },
                  ]}
                />
                <Text
                  style={[
                    styles.statusStampText,
                    { color: isUnpaid ? COLORS.warningText : COLORS.availableText },
                  ]}
                >
                  {invoice.paymentStatus}
                </Text>
              </View>
            </View>

            {/* Vehicle Stencil Card */}
            <View style={styles.plateContainer}>
              <View style={styles.plateBlueStrip}>
                <Text style={styles.plateInd}>IND</Text>
                <View style={styles.plateHoloCircle} />
              </View>
              <View style={styles.plateNumberBox}>
                <Text style={styles.plateNumberText}>{invoice.vehicleNumber}</Text>
              </View>
              <View style={styles.plateSlotPill}>
                <Text style={styles.plateSlotLabel}>BAY</Text>
                <Text style={styles.plateSlotValue}>{invoice.slotNumber}</Text>
              </View>
            </View>

            {/* Perforated Dotted Divider */}
            <View style={styles.perforationRow}>
              <View style={styles.perforatedCutLeft} />
              <View style={styles.dottedLine} />
              <View style={styles.perforatedCutRight} />
            </View>

            {/* Session Timeline Details */}
            <View style={styles.timelineSection}>
              <Text style={styles.sectionHeader}>BILLING TIMELINE</Text>

              <View style={styles.timelineItem}>
                <View style={styles.timelineDot} />
                <View style={styles.timelineContent}>
                  <Text style={styles.timelineLabel}>Entry Check-In</Text>
                  <Text style={styles.timelineVal}>{formatDateTime(invoice.entryTime)}</Text>
                </View>
              </View>

              <View style={styles.timelineConnector} />

              <View style={styles.timelineItem}>
                <View style={[styles.timelineDot, { backgroundColor: COLORS.cyanLight }]} />
                <View style={styles.timelineContent}>
                  <Text style={styles.timelineLabel}>Exit Checkout</Text>
                  <Text style={styles.timelineVal}>{formatDateTime(invoice.exitTime)}</Text>
                </View>
              </View>

              <View style={styles.metricSummaryGrid}>
                <View style={styles.metricSummaryCard}>
                  <Text style={styles.summaryLabel}>Billed Duration</Text>
                  <Text style={styles.summaryVal}>{invoice.durationFormatted}</Text>
                  <Text style={styles.summarySub}>({invoice.durationSeconds}s elapsed)</Text>
                </View>

                <View style={styles.metricSummaryCard}>
                  <Text style={styles.summaryLabel}>Tariff Policy</Text>
                  <Text style={styles.summaryVal}>₹50 / Block</Text>
                  <Text style={styles.summarySub}>(3h block rounding)</Text>
                </View>
              </View>
            </View>

            {/* Total Fee Callout */}
            <View style={styles.amountBox}>
              <View style={styles.amountLeft}>
                <Text style={styles.amountSubtext}>FINAL AMOUNT CHARGED</Text>
                <Text style={styles.currencyNote}>Inclusive of all parking taxes</Text>
              </View>
              <Text style={styles.amountValue}>{formatCurrency(invoice.totalFee)}</Text>
            </View>

            {/* Action Buttons */}
            {isUnpaid && (
              <TouchableOpacity
                style={styles.payBtn}
                onPress={handleConfirmPayment}
                disabled={updatingPayment}
                activeOpacity={0.85}
              >
                {updatingPayment ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.payBtnText}>Verify & Settle Payment Now</Text>
                )}
              </TouchableOpacity>
            )}

            <TouchableOpacity style={styles.closeActionBtn} onPress={onClose} activeOpacity={0.8}>
              <Text style={styles.closeActionBtnText}>Close Receipt</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(5, 8, 16, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalCard: {
    width: '100%',
    maxWidth: 420,
    maxHeight: '90%',
    backgroundColor: COLORS.cardBg,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  scrollBody: {
    padding: 20,
  },
  receiptTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  brandBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  brandIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: 'rgba(99, 102, 241, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandIconText: {
    fontSize: 18,
  },
  companyName: {
    fontSize: 13,
    fontWeight: '900',
    color: COLORS.textPrimary,
    letterSpacing: 0.5,
  },
  receiptType: {
    fontSize: 10,
    color: COLORS.primaryLight,
    fontWeight: '700',
    marginTop: 2,
    letterSpacing: 0.5,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.cardBgElevated,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  closeBtnText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontWeight: '700',
  },
  refRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 16,
  },
  refLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.textMuted,
    letterSpacing: 0.8,
  },
  refValue: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginTop: 2,
  },
  statusStamp: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    borderWidth: 1,
    gap: 6,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusStampText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  plateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E2E8F0',
    paddingVertical: 6,
    paddingHorizontal: 8,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  plateBlueStrip: {
    backgroundColor: '#1E3A8A',
    paddingVertical: 4,
    paddingHorizontal: 6,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  plateInd: {
    color: '#FFFFFF',
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  plateHoloCircle: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#60A5FA',
    marginTop: 2,
  },
  plateNumberBox: {
    flex: 1,
  },
  plateNumberText: {
    fontSize: 17,
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: 1.5,
  },
  plateSlotPill: {
    backgroundColor: COLORS.cardBgElevated,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    alignItems: 'center',
  },
  plateSlotLabel: {
    fontSize: 8,
    fontWeight: '700',
    color: COLORS.primaryLight,
  },
  plateSlotValue: {
    fontSize: 12,
    fontWeight: '900',
    color: COLORS.textPrimary,
  },
  perforationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 14,
    position: 'relative',
  },
  perforatedCutLeft: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: COLORS.bgPrimary,
    marginLeft: -26,
  },
  dottedLine: {
    flex: 1,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
    borderStyle: 'dashed',
    marginHorizontal: 10,
  },
  perforatedCutRight: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: COLORS.bgPrimary,
    marginRight: -26,
  },
  timelineSection: {
    marginBottom: 16,
  },
  sectionHeader: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.textMuted,
    letterSpacing: 0.8,
    marginBottom: 12,
  },
  timelineItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  timelineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.available,
  },
  timelineConnector: {
    width: 2,
    height: 14,
    backgroundColor: COLORS.border,
    marginLeft: 3,
    marginVertical: 2,
  },
  timelineContent: {
    flex: 1,
  },
  timelineLabel: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  timelineVal: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginTop: 1,
  },
  metricSummaryGrid: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 14,
  },
  metricSummaryCard: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  summaryLabel: {
    fontSize: 10,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  summaryVal: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginTop: 3,
  },
  summarySub: {
    fontSize: 10,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  amountBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(99, 102, 241, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.25)',
    borderRadius: 16,
    padding: 14,
    marginBottom: 16,
  },
  amountLeft: {
    flex: 1,
  },
  amountSubtext: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.primaryLight,
    letterSpacing: 0.5,
  },
  currencyNote: {
    fontSize: 10,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  amountValue: {
    fontSize: 26,
    fontWeight: '900',
    color: COLORS.available,
    letterSpacing: -0.5,
  },
  payBtn: {
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    marginBottom: 10,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 4,
  },
  payBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  closeActionBtn: {
    backgroundColor: COLORS.cardBgElevated,
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  closeActionBtnText: {
    color: COLORS.textSecondary,
    fontSize: 13,
    fontWeight: '700',
  },
});
