import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../constants/colors';

interface StatCardProps {
  label: string;
  value: string | number;
  subValue?: string;
  variant?: 'primary' | 'available' | 'occupied' | 'warning' | 'default';
  icon?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  subValue,
  variant = 'default',
  icon,
}) => {
  const getTheme = () => {
    switch (variant) {
      case 'primary':
        return {
          accent: COLORS.primary,
          badgeBg: COLORS.primarySubtle,
          badgeText: COLORS.primaryDark,
          defaultIcon: '🅿',
        };
      case 'available':
        return {
          accent: COLORS.available,
          badgeBg: COLORS.availableBg,
          badgeText: COLORS.availableText,
          defaultIcon: '✓',
        };
      case 'occupied':
        return {
          accent: COLORS.occupied,
          badgeBg: COLORS.occupiedBg,
          badgeText: COLORS.occupiedText,
          defaultIcon: '🚗',
        };
      case 'warning':
        return {
          accent: COLORS.warning,
          badgeBg: COLORS.warningBg,
          badgeText: COLORS.warningText,
          defaultIcon: '⚡',
        };
      default:
        return {
          accent: COLORS.textSlate,
          badgeBg: '#F1F5F9',
          badgeText: COLORS.textSlate,
          defaultIcon: '📊',
        };
    }
  };

  const theme = getTheme();

  return (
    <View style={styles.card}>
      <View style={[styles.topAccentBar, { backgroundColor: theme.accent }]} />
      <View style={styles.content}>
        <View style={styles.headerRow}>
          <Text style={styles.label}>{label}</Text>
          <View style={[styles.iconBox, { backgroundColor: theme.badgeBg }]}>
            <Text style={styles.iconText}>{icon || theme.defaultIcon}</Text>
          </View>
        </View>

        <Text style={[styles.value, { color: theme.accent }]}>{value}</Text>
        {subValue ? <Text style={styles.subValue}>{subValue}</Text> : null}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minWidth: 100,
    backgroundColor: COLORS.cardSurface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
    shadowColor: COLORS.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  topAccentBar: {
    height: 3,
    width: '100%',
  },
  content: {
    padding: 14,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    flex: 1,
  },
  iconBox: {
    width: 24,
    height: 24,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconText: {
    fontSize: 11,
  },
  value: {
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  subValue: {
    fontSize: 10,
    color: COLORS.textMuted,
    marginTop: 4,
    fontWeight: '600',
  },
});
