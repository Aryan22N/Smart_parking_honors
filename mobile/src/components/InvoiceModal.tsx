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
      Alert.alert('Payment Recorded', 'Payment of ' + formatCurrency(invoice.totalFee) + ' has been marked as PAID.');
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
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modalCard}>
          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Header */}
            <View style={styles.header}>
              <View>
                <Text style={styles.companyTitle}>SMART PARKING FACILITY</Text>
                <Text style={styles.invoiceNumber}>Invoice #{invoice.invoiceNumber}</Text>
              </View>
              <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                <Text style={styles.closeBtnText}>✕</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.divider} />

            {/* Vehicle & Slot Highlight */}
            <View style={styles.highlightRow}>
              <View style={styles.highlightBox}>
                <Text style={styles.highlightLabel}>VEHICLE REGISTRATION</Text>
                <Text style={styles.highlightValue}>{invoice.vehicleNumber}</Text>
              </View>
              <View style={styles.highlightBox}>
                <Text style={styles.highlightLabel}>ASSIGNED SLOT</Text>
                <Text style={styles.highlightValue}>{invoice.slotNumber}</Text>
              </View>
            </View>

            {/* Timestamps & Duration */}
            <View style={styles.detailsSection}>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Entry Time</Text>
                <Text style={styles.detailValue}>{formatDateTime(invoice.entryTime)}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Exit Time</Text>
                <Text style={styles.detailValue}>{formatDateTime(invoice.exitTime)}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Billed Duration</Text>
                <Text style={[styles.detailValue, { color: COLORS.primaryLight }]}>
                  {invoice.durationFormatted} ({invoice.durationSeconds}s)
                </Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Pricing Policy</Text>
                <Text style={styles.detailValue}>₹50 / started 3-hr block</Text>
              </View>
            </View>

            <View style={styles.divider} />

            {/* Total Fee & Payment Status */}
            <View style={styles.totalSection}>
              <View>
                <Text style={styles.totalLabel}>TOTAL AMOUNT DUE</Text>
                <Text style={styles.totalValue}>{formatCurrency(invoice.totalFee)}</Text>
              </View>

              <View
                style={[
                  styles.statusBadge,
                  {
                    backgroundColor: isUnpaid ? COLORS.warningBg : COLORS.availableBg,
                    borderColor: isUnpaid ? COLORS.warning : COLORS.available,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.statusBadgeText,
                    { color: isUnpaid ? COLORS.warning : COLORS.availableText },
                  ]}
                >
                  {invoice.paymentStatus}
                </Text>
              </View>
            </View>

            {/* Action Buttons */}
            {isUnpaid && (
              <TouchableOpacity
                style={styles.payButton}
                onPress={handleConfirmPayment}
                disabled={updatingPayment}
              >
                {updatingPayment ? (
                  <ActivityIndicator color={COLORS.bgPrimary} />
                ) : (
                  <Text style={styles.payButtonText}>Simulate Payment Confirmation (Mark as PAID)</Text>
                )}
              </TouchableOpacity>
            )}

            <TouchableOpacity style={styles.doneButton} onPress={onClose}>
              <Text style={styles.doneButtonText}>Close Invoice</Text>
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
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalCard: {
    width: '100%',
    maxHeight: '90%',
    backgroundColor: COLORS.cardBg,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  companyTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.primary,
    letterSpacing: 1,
  },
  invoiceNumber: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginTop: 4,
  },
  closeBtn: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: COLORS.cardBgElevated,
  },
  closeBtnText: {
    color: COLORS.textSecondary,
    fontSize: 14,
    fontWeight: '700',
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 14,
  },
  highlightRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 14,
  },
  highlightBox: {
    flex: 1,
    backgroundColor: COLORS.bgPrimary,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  highlightLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.textMuted,
    marginBottom: 4,
  },
  highlightValue: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  detailsSection: {
    gap: 10,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  detailValue: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  totalSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.bgPrimary,
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 16,
  },
  totalLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  totalValue: {
    fontSize: 24,
    fontWeight: '900',
    color: COLORS.available,
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  payButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 10,
  },
  payButtonText: {
    color: COLORS.bgPrimary,
    fontSize: 14,
    fontWeight: '800',
  },
  doneButton: {
    backgroundColor: COLORS.cardBgElevated,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  doneButtonText: {
    color: COLORS.textPrimary,
    fontSize: 14,
    fontWeight: '700',
  },
});
