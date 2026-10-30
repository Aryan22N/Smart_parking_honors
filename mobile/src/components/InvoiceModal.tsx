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
import { Icon } from './Icon';
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
        `Payment of ${formatCurrency(invoice.totalFee)} has been verified and recorded.`
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
            {/* Modal Header */}
            <View style={styles.receiptTop}>
              <View style={styles.brandGroup}>
                <View style={styles.brandIconBox}>
                  <Icon name="bays" size={16} color="#FFFFFF" />
                </View>
                <View>
                  <Text style={styles.companyName}>ParkEase Facility 1</Text>
                  <Text style={styles.receiptType}>PARKING TAX INVOICE</Text>
                </View>
              </View>

              <TouchableOpacity onPress={onClose} style={styles.closeBtn} activeOpacity={0.75} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Icon name="close" size={12} color={COLORS.textSlate} />
              </TouchableOpacity>
            </View>

            {/* Reference & Status */}
            <View style={styles.refRow}>
              <View>
                <Text style={styles.refLabel}>INVOICE REF</Text>
                <Text style={styles.refValue}>#{invoice.invoiceNumber}</Text>
              </View>

              <View
                style={[
                  styles.statusBadge,
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
                    styles.statusText,
                    { color: isUnpaid ? COLORS.warningText : COLORS.availableText },
                  ]}
                >
                  {invoice.paymentStatus}
                </Text>
              </View>
            </View>

            {/* Vehicle Stencil Card */}
            <View style={styles.vehiclePlateCard}>
              <View style={styles.plateBlueStrip}>
                <Text style={styles.plateInd}>IND</Text>
              </View>
              <View style={styles.plateNumberBox}>
                <Text style={styles.plateNumberText}>{invoice.vehicleNumber}</Text>
              </View>
              <View style={styles.slotTag}>
                <Text style={styles.slotTagLabel}>BAY</Text>
                <Text style={styles.slotTagValue}>{invoice.slotNumber}</Text>
              </View>
            </View>

            {/* Timeline Breakdown */}
            <View style={styles.timelineSection}>
              <Text style={styles.sectionTitle}>BILLING DETAILS</Text>

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Entry Check-In</Text>
                <Text style={styles.infoValue}>{formatDateTime(invoice.entryTime)}</Text>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Exit Checkout</Text>
                <Text style={styles.infoValue}>{formatDateTime(invoice.exitTime)}</Text>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Billed Duration</Text>
                <Text style={[styles.infoValue, { color: COLORS.primaryDark, fontWeight: '800' }]}>
                  {invoice.durationFormatted}
                </Text>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Tariff Rule</Text>
                <Text style={styles.infoValue}>₹50 / started 3h block</Text>
              </View>
            </View>

            {/* Amount Due Box */}
            <View style={styles.totalBox}>
              <View>
                <Text style={styles.totalLabel}>TOTAL AMOUNT DUE</Text>
                <Text style={styles.totalSub}>Taxes and tariffs included</Text>
              </View>
              <Text style={styles.totalValue}>{formatCurrency(invoice.totalFee)}</Text>
            </View>

            {/* Actions */}
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
                  <View style={styles.payBtnRow}>
                    <Icon name="check" size={14} color="#FFFFFF" />
                    <Text style={styles.payBtnText}>Verify & Mark as PAID</Text>
                  </View>
                )}
              </TouchableOpacity>
            )}

            <TouchableOpacity style={styles.closeActionBtn} onPress={onClose} activeOpacity={0.8}>
              <Text style={styles.closeActionBtnText}>Close Invoice</Text>
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
    backgroundColor: 'rgba(11, 19, 43, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalCard: {
    width: '100%',
    maxWidth: 400,
    maxHeight: '88%',
    backgroundColor: COLORS.cardSurface,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
    shadowColor: COLORS.shadowColor,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 16,
    elevation: 8,
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
  brandGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  brandIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandIconText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '900',
  },
  companyName: {
    fontSize: 14,
    fontWeight: '900',
    color: COLORS.textDark,
  },
  receiptType: {
    fontSize: 9,
    fontWeight: '800',
    color: COLORS.primary,
    letterSpacing: 0.6,
    marginTop: 1,
  },
  closeBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtnText: {
    fontSize: 12,
    color: COLORS.textSlate,
    fontWeight: '700',
  },
  refRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.cardSurfaceAlt,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 14,
  },
  refLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: COLORS.textMuted,
    letterSpacing: 0.6,
  },
  refValue: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.textDark,
    marginTop: 2,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    gap: 5,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '800',
  },
  vehiclePlateCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#CBD5E1',
    paddingVertical: 7,
    paddingHorizontal: 10,
    marginBottom: 16,
  },
  plateBlueStrip: {
    backgroundColor: '#1E3A8A',
    paddingVertical: 4,
    paddingHorizontal: 6,
    borderRadius: 4,
    marginRight: 8,
  },
  plateInd: {
    color: '#FFFFFF',
    fontSize: 8,
    fontWeight: '900',
  },
  plateNumberBox: {
    flex: 1,
  },
  plateNumberText: {
    fontSize: 16,
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: 1.2,
  },
  slotTag: {
    backgroundColor: COLORS.primarySubtle,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    alignItems: 'center',
  },
  slotTagLabel: {
    fontSize: 8,
    fontWeight: '800',
    color: COLORS.primaryDark,
  },
  slotTagValue: {
    fontSize: 12,
    fontWeight: '900',
    color: COLORS.primaryDark,
  },
  timelineSection: {
    backgroundColor: COLORS.cardSurfaceAlt,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 12,
    marginBottom: 14,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.textMuted,
    letterSpacing: 0.6,
    marginBottom: 2,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 11,
    color: COLORS.textMuted,
    fontWeight: '600',
  },
  infoValue: {
    fontSize: 11,
    color: COLORS.textDark,
    fontWeight: '700',
  },
  totalBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.primarySubtle,
    borderWidth: 1,
    borderColor: COLORS.primaryLight,
    borderRadius: 14,
    padding: 14,
    marginBottom: 14,
  },
  totalLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.primaryDark,
    letterSpacing: 0.4,
  },
  totalSub: {
    fontSize: 10,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  totalValue: {
    fontSize: 24,
    fontWeight: '900',
    color: COLORS.primaryDark,
  },
  payBtn: {
    backgroundColor: COLORS.primary,
    paddingVertical: 13,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 10,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 3,
  },
  payBtnRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  payBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  closeActionBtn: {
    backgroundColor: COLORS.cardSurfaceAlt,
    paddingVertical: 11,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  closeActionBtnText: {
    color: COLORS.textSlate,
    fontSize: 12,
    fontWeight: '700',
  },
});
