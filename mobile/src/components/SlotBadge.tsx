import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../constants/colors';
import { SlotStatus } from '../types';

interface SlotBadgeProps {
  status: SlotStatus;
  size?: 'sm' | 'md';
}

export const SlotBadge: React.FC<SlotBadgeProps> = ({ status, size = 'md' }) => {
  const isAvailable = status === 'AVAILABLE';

  return (
    <View
      style={[
        styles.badge,
        size === 'sm' && styles.badgeSm,
        {
          backgroundColor: isAvailable ? COLORS.availableBg : COLORS.occupiedBg,
          borderColor: isAvailable ? COLORS.availableBorder : COLORS.occupiedBorder,
        },
      ]}
    >
      <View
        style={[
          styles.dot,
          { backgroundColor: isAvailable ? COLORS.available : COLORS.occupied },
        ]}
      />
      <Text
        style={[
          styles.text,
          size === 'sm' && styles.textSm,
          { color: isAvailable ? COLORS.availableText : COLORS.occupiedText },
        ]}
      >
        {status}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    alignSelf: 'flex-start',
    gap: 6,
  },
  badgeSm: {
    paddingHorizontal: 7,
    paddingVertical: 2.5,
    borderRadius: 6,
    gap: 4,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  text: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  textSm: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
});
