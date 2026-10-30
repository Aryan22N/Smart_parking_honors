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
          accent: COLORS.primaryLight,
          border: 'rgba(99, 102, 241, 0.3)',
          badgeBg: 'rgba(99, 102, 241, 0.12)',
          defaultIcon: '⚡',
        };
      case 'available':
        return {
          accent: COLORS.available,
          border: 'rgba(16, 185, 129, 0.3)',
          badgeBg: COLORS.availableBg,
          defaultIcon: '✓',
        };
      case 'occupied':
        return {
          accent: COLORS.occupied,
          border: 'rgba(244, 63, 94, 0.3)',
          badgeBg: COLORS.occupiedBg,
          defaultIcon: '🚗',
        };
      case 'warning':
        return {
          accent: COLORS.warning,
          border: 'rgba(245, 158, 11, 0.3)',
          badgeBg: COLORS.warningBg,
          defaultIcon: '⚠️',
        };
      default:
        return {
          accent: COLORS.cyanLight,
          border: COLORS.border,
          badgeBg: 'rgba(255, 255, 255, 0.05)',
          defaultIcon: '📊',
        };
    }
  };

  const theme = getTheme();

  return (
    <View style={[styles.card, { borderColor: theme.border }]}>
      <View style={styles.headerRow}>
        <Text style={styles.label}>{label}</Text>
        <View style={[styles.iconContainer, { backgroundColor: theme.badgeBg }]}>
          <Text style={styles.iconText}>{icon || theme.defaultIcon}</Text>
        </View>
      </View>
      <Text style={[styles.value, { color: theme.accent }]}>{value}</Text>
      {subValue ? <Text style={styles.subValue}>{subValue}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minWidth: 100,
    backgroundColor: COLORS.cardBg,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
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
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    flex: 1,
  },
  iconContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
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
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 4,
    fontWeight: '500',
  },
});
