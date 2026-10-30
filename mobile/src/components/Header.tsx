import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS } from '../constants/colors';

interface HeaderProps {
  title: string;
  subtitle?: string;
  badge?: string;
  rightActionText?: string;
  onRightAction?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  badge = 'ONLINE',
  rightActionText,
  onRightAction,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.brandRow}>
        <View style={styles.brandGroup}>
          <View style={styles.brandLogo}>
            <Text style={styles.brandLogoText}>P</Text>
          </View>
          <View>
            <View style={styles.titleLine}>
              <Text style={styles.brandName}>ParkEase</Text>
              <View style={styles.statusPill}>
                <View style={styles.statusDot} />
                <Text style={styles.statusText}>{badge}</Text>
              </View>
            </View>
            <Text style={styles.brandTagline}>SMART MANAGEMENT</Text>
          </View>
        </View>

        {rightActionText && onRightAction && (
          <TouchableOpacity style={styles.actionBtn} onPress={onRightAction} activeOpacity={0.75}>
            <Text style={styles.actionBtnText}>{rightActionText}</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.pageTitleContainer}>
        <Text style={styles.pageTitle}>{title}</Text>
        {subtitle ? <Text style={styles.pageSubtitle}>{subtitle}</Text> : null}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.navyHeader,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  brandGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  brandLogo: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 3,
  },
  brandLogoText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  titleLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  brandName: {
    fontSize: 16,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -0.3,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
    gap: 4,
  },
  statusDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: COLORS.availableBorder,
  },
  statusText: {
    fontSize: 9,
    fontWeight: '800',
    color: COLORS.primaryLight,
    letterSpacing: 0.5,
  },
  brandTagline: {
    fontSize: 8,
    fontWeight: '800',
    color: COLORS.textSubtle,
    letterSpacing: 0.8,
    marginTop: 1,
  },
  actionBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  actionBtnText: {
    color: COLORS.primaryLight,
    fontSize: 11,
    fontWeight: '700',
  },
  pageTitleContainer: {
    marginTop: 2,
  },
  pageTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  pageSubtitle: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 3,
    lineHeight: 16,
  },
});
