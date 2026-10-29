import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../constants/colors';
import { SlotStatus } from '../types';

interface SlotBadgeProps {
  status: SlotStatus;
}

export const SlotBadge: React.FC<SlotBadgeProps> = ({ status }) => {
  const isAvailable = status === 'AVAILABLE';

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: isAvailable ? COLORS.availableBg : COLORS.occupiedBg,
          borderColor: isAvailable ? COLORS.available : COLORS.occupied,
        },
      ]}
    >
      <Text
        style={[
          styles.text,
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
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});
