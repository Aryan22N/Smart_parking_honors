import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../constants/colors';
import { Icon, IconName } from './Icon';

interface StatCardProps {
  label: string;
  value: string | number;
  subValue?: string;
  variant?: 'primary' | 'available' | 'occupied' | 'warning' | 'default';
  iconName?: IconName;
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  subValue,
  variant = 'default',
  iconName,
}) => {
  const getTheme = (): { accent: string; badgeBg: string; defaultIcon: IconName } => {
    switch (variant) {
      case 'primary':
        return {
          accent: COLORS.primary,
          badgeBg: COLORS.primarySubtle,
          defaultIcon: 'bays',
        };
      case 'available':
        return {
          accent: COLORS.available,
          badgeBg: COLORS.availableBg,
          defaultIcon: 'check',
        };
      case 'occupied':
        return {
          accent: COLORS.occupied,
          badgeBg: COLORS.occupiedBg,
          defaultIcon: 'car',
        };
      case 'warning':
        return {
          accent: COLORS.warning,
          badgeBg: COLORS.warningBg,
          defaultIcon: 'alert',
        };
      default:
        return {
          accent: COLORS.textSlate,
          badgeBg: '#F1F5F9',
          defaultIcon: 'hub',
        };
    }
  };

  const theme = getTheme();
  const icon = iconName || theme.defaultIcon;

  return (
    <View style={styles.card}>
      <View style={[styles.topAccentBar, { backgroundColor: theme.accent }]} />
      <View style={styles.content}>
        <View style={styles.headerRow}>
          <Text style={styles.label} numberOfLines={1}>{label}</Text>
          <View style={[styles.iconBox, { backgroundColor: theme.badgeBg }]}>
            <Icon name={icon} size={11} color={theme.accent} />
          </View>
        </View>

        <Text style={[styles.value, { color: theme.accent }]}>{value}</Text>
        {subValue ? <Text style={styles.subValue} numberOfLines={1}>{subValue}</Text> : null}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minWidth: 100,
    backgroundColor: COLORS.cardSurface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
    shadowColor: COLORS.shadowColor,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    justifyContent: 'space-between',
  },
  topAccentBar: {
    height: 3,
    width: '100%',
  },
  content: {
    padding: 12,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  label: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    flex: 1,
    marginRight: 4,
  },
  iconBox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  value: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  subValue: {
    fontSize: 10,
    color: COLORS.textMuted,
    marginTop: 3,
    fontWeight: '500',
  },
});
