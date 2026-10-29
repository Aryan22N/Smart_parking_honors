import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../constants/colors';

interface StatCardProps {
  label: string;
  value: string | number;
  subValue?: string;
  variant?: 'primary' | 'available' | 'occupied' | 'warning' | 'default';
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  subValue,
  variant = 'default',
}) => {
  const getAccentColor = () => {
    switch (variant) {
      case 'primary':
        return COLORS.primary;
      case 'available':
        return COLORS.available;
      case 'occupied':
        return COLORS.occupied;
      case 'warning':
        return COLORS.warning;
      default:
        return COLORS.primaryLight;
    }
  };

  const accentColor = getAccentColor();

  return (
    <View style={styles.card}>
      <Text style={styles.label}>{label}</Text>
      <Text style={[styles.value, { color: accentColor }]}>{value}</Text>
      {subValue ? <Text style={styles.subValue}>{subValue}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minWidth: 100,
    backgroundColor: COLORS.cardBg,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  value: {
    fontSize: 20,
    fontWeight: '800',
  },
  subValue: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 4,
  },
});
