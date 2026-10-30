import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS } from '../constants/colors';
import { Icon } from './Icon';

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
            <Text style={styles.brandTagline}>SMART PARKING PLATFORM</Text>
          </View>
        </View>

        {rightActionText && onRightAction && (
          <TouchableOpacity style={styles.actionBtn} onPress={onRightAction} activeOpacity={0.75}>
            <Icon name="refresh" size={12} color={COLORS.primaryLight} />
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
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  brandGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  brandLogo: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandLogoText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  titleLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  brandName: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.3,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.25)',
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
    fontWeight: '700',
    color: COLORS.primaryLight,
    letterSpacing: 0.5,
  },
  brandTagline: {
    fontSize: 8,
    fontWeight: '700',
    color: COLORS.textSubtle,
    letterSpacing: 0.8,
    marginTop: 1,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  actionBtnText: {
    color: COLORS.primaryLight,
    fontSize: 11,
    fontWeight: '600',
  },
  pageTitleContainer: {
    marginTop: 2,
  },
  pageTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.4,
  },
  pageSubtitle: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 2,
    lineHeight: 16,
  },
});
