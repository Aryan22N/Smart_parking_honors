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
    paddingHorizontal: 8,
    paddingVertical: 3.5,
    borderRadius: 7,
    borderWidth: 1,
    alignSelf: 'flex-start',
    gap: 5,
  },
  badgeSm: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 5,
    gap: 4,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  text: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
  textSm: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
});
