import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { COLORS } from '../constants/colors';

export type IconName =
  | 'hub'
  | 'bays'
  | 'entry'
  | 'active'
  | 'ledger'
  | 'revenue'
  | 'search'
  | 'check'
  | 'refresh'
  | 'close'
  | 'car'
  | 'clock'
  | 'receipt'
  | 'alert'
  | 'trending'
  | 'arrow-right'
  | 'map';

interface IconProps {
  name: IconName;
  size?: number;
  color?: string;
}

export const Icon: React.FC<IconProps> = ({ name, size = 18, color = COLORS.textSlate }) => {
  switch (name) {
    case 'hub':
      return (
        <View style={[styles.iconContainer, { width: size, height: size }]}>
          <View style={styles.hubGrid}>
            <View style={[styles.hubSquare, { backgroundColor: color, width: size * 0.42, height: size * 0.42 }]} />
            <View style={[styles.hubSquare, { backgroundColor: color, width: size * 0.42, height: size * 0.42, opacity: 0.6 }]} />
            <View style={[styles.hubSquare, { backgroundColor: color, width: size * 0.42, height: size * 0.42, opacity: 0.6 }]} />
            <View style={[styles.hubSquare, { backgroundColor: color, width: size * 0.42, height: size * 0.42 }]} />
          </View>
        </View>
      );

    case 'bays':
      return (
        <View style={[styles.iconContainer, { width: size, height: size }]}>
          <View style={[styles.bayOutline, { borderColor: color, width: size, height: size }]}>
            <Text style={[styles.bayText, { color, fontSize: size * 0.6 }]}>P</Text>
          </View>
        </View>
      );

    case 'entry':
      return (
        <View style={[styles.iconContainer, { width: size, height: size }]}>
          <View style={[styles.circleBadge, { borderColor: color, width: size, height: size }]}>
            <View style={[styles.plusHorizontal, { backgroundColor: color, width: size * 0.5, height: 2 }]} />
            <View style={[styles.plusVertical, { backgroundColor: color, height: size * 0.5, width: 2 }]} />
          </View>
        </View>
      );

    case 'active':
    case 'clock':
      return (
        <View style={[styles.iconContainer, { width: size, height: size }]}>
          <View style={[styles.circleBadge, { borderColor: color, width: size, height: size }]}>
            <View style={[styles.clockCenter, { backgroundColor: color }]} />
            <View style={[styles.clockMinute, { backgroundColor: color, height: size * 0.3 }]} />
            <View style={[styles.clockHour, { backgroundColor: color, width: size * 0.25 }]} />
          </View>
        </View>
      );

    case 'ledger':
    case 'receipt':
      return (
        <View style={[styles.iconContainer, { width: size, height: size }]}>
          <View style={[styles.docOutline, { borderColor: color, width: size * 0.82, height: size }]}>
            <View style={[styles.docLine, { backgroundColor: color, width: '60%' }]} />
            <View style={[styles.docLine, { backgroundColor: color, width: '75%' }]} />
            <View style={[styles.docLine, { backgroundColor: color, width: '50%' }]} />
          </View>
        </View>
      );

    case 'revenue':
    case 'trending':
      return (
        <View style={[styles.iconContainer, { width: size, height: size }]}>
          <View style={[styles.chartContainer, { width: size, height: size }]}>
            <View style={[styles.chartBar, { backgroundColor: color, height: size * 0.4, width: size * 0.2 }]} />
            <View style={[styles.chartBar, { backgroundColor: color, height: size * 0.7, width: size * 0.2 }]} />
            <View style={[styles.chartBar, { backgroundColor: color, height: size * 0.95, width: size * 0.2 }]} />
          </View>
        </View>
      );

    case 'check':
      return (
        <View style={[styles.iconContainer, { width: size, height: size }]}>
          <Text style={[styles.glyphText, { color, fontSize: size * 0.85 }]}>✓</Text>
        </View>
      );

    case 'close':
      return (
        <View style={[styles.iconContainer, { width: size, height: size }]}>
          <Text style={[styles.glyphText, { color, fontSize: size * 0.85 }]}>✕</Text>
        </View>
      );

    case 'search':
      return (
        <View style={[styles.iconContainer, { width: size, height: size }]}>
          <View style={[styles.searchCircle, { borderColor: color, width: size * 0.65, height: size * 0.65 }]} />
          <View style={[styles.searchHandle, { backgroundColor: color, width: size * 0.35 }]} />
        </View>
      );

    case 'car':
      return (
        <View style={[styles.iconContainer, { width: size, height: size }]}>
          <View style={[styles.carRoof, { borderColor: color, width: size * 0.6, height: size * 0.35 }]} />
          <View style={[styles.carBody, { backgroundColor: color, width: size * 0.9, height: size * 0.35 }]} />
        </View>
      );

    case 'alert':
      return (
        <View style={[styles.iconContainer, { width: size, height: size }]}>
          <Text style={[styles.glyphText, { color, fontSize: size * 0.85 }]}>!</Text>
        </View>
      );

    case 'refresh':
      return (
        <View style={[styles.iconContainer, { width: size, height: size }]}>
          <Text style={[styles.glyphText, { color, fontSize: size * 0.85 }]}>⟳</Text>
        </View>
      );

    case 'arrow-right':
      return (
        <View style={[styles.iconContainer, { width: size, height: size }]}>
          <Text style={[styles.glyphText, { color, fontSize: size * 0.85 }]}>→</Text>
        </View>
      );

    case 'map':
      return (
        <View style={[styles.iconContainer, { width: size, height: size }]}>
          <View style={[styles.mapOutline, { borderColor: color, width: size, height: size * 0.8 }]}>
            <View style={[styles.mapFold, { borderRightColor: color }]} />
            <View style={[styles.mapFold, { borderRightColor: color }]} />
          </View>
        </View>
      );

    default:
      return (
        <View style={[styles.iconContainer, { width: size, height: size }]}>
          <View style={[styles.circleBadge, { borderColor: color, width: size, height: size }]} />
        </View>
      );
  }
};

const styles = StyleSheet.create({
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  hubGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    alignContent: 'space-between',
    width: '100%',
    height: '100%',
  },
  hubSquare: {
    borderRadius: 2,
  },
  bayOutline: {
    borderWidth: 1.5,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bayText: {
    fontWeight: '900',
    textAlign: 'center',
  },
  circleBadge: {
    borderWidth: 1.5,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  plusHorizontal: {
    position: 'absolute',
    borderRadius: 1,
  },
  plusVertical: {
    position: 'absolute',
    borderRadius: 1,
  },
  clockCenter: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    position: 'absolute',
  },
  clockMinute: {
    width: 1.5,
    position: 'absolute',
    top: '20%',
    borderRadius: 1,
  },
  clockHour: {
    height: 1.5,
    position: 'absolute',
    right: '25%',
    borderRadius: 1,
  },
  docOutline: {
    borderWidth: 1.5,
    borderRadius: 3,
    padding: 2,
    justifyContent: 'space-around',
    alignItems: 'flex-start',
  },
  docLine: {
    height: 1.5,
    borderRadius: 1,
    marginVertical: 1,
  },
  chartContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingHorizontal: 1,
  },
  chartBar: {
    borderRadius: 1.5,
  },
  glyphText: {
    fontWeight: '900',
    textAlign: 'center',
  },
  searchCircle: {
    borderWidth: 1.5,
    borderRadius: 999,
    position: 'absolute',
    top: 1,
    left: 1,
  },
  searchHandle: {
    height: 1.5,
    position: 'absolute',
    bottom: 2,
    right: 0,
    transform: [{ rotate: '45deg' }],
    borderRadius: 1,
  },
  carRoof: {
    borderTopWidth: 1.5,
    borderLeftWidth: 1.5,
    borderRightWidth: 1.5,
    borderTopLeftRadius: 3,
    borderTopRightRadius: 3,
  },
  carBody: {
    borderRadius: 2,
    marginTop: 1,
  },
  mapOutline: {
    borderWidth: 1.5,
    borderRadius: 2,
    flexDirection: 'row',
  },
  mapFold: {
    flex: 1,
    borderRightWidth: 1,
  },
});
