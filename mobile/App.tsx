import React, { useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Platform,
} from 'react-native';
import { COLORS } from './src/constants/colors';
import { ParkingSlot } from './src/types';
import { DashboardScreen } from './src/screens/DashboardScreen';
import { SlotsScreen } from './src/screens/SlotsScreen';
import { VehicleEntryScreen } from './src/screens/VehicleEntryScreen';
import { ActiveSessionsScreen } from './src/screens/ActiveSessionsScreen';
import { HistoryScreen } from './src/screens/HistoryScreen';
import { RevenueReportScreen } from './src/screens/RevenueReportScreen';

import { Icon, IconName } from './src/components/Icon';

type TabType = 'dashboard' | 'slots' | 'entry' | 'active' | 'history' | 'revenue';

interface NavItemConfig {
  id: TabType;
  label: string;
  icon: IconName;
}

export default function App() {
  const getInitialTab = (): TabType => {
    if (Platform.OS === 'web' && typeof window !== 'undefined' && window.location) {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get('tab') as TabType;
      if (tabParam && ['dashboard', 'slots', 'entry', 'active', 'history', 'revenue'].includes(tabParam)) {
        return tabParam;
      }
      const hashParam = window.location.hash.replace('#', '') as TabType;
      if (hashParam && ['dashboard', 'slots', 'entry', 'active', 'history', 'revenue'].includes(hashParam)) {
        return hashParam;
      }
    }
    return 'dashboard';
  };

  const [activeTab, setActiveTabState] = useState<TabType>(getInitialTab);
  const [slotToBook, setSlotToBook] = useState<ParkingSlot | null>(null);

  const setActiveTab = (tab: TabType) => {
    setActiveTabState(tab);
    if (Platform.OS === 'web' && typeof window !== 'undefined' && window.history) {
      const url = new URL(window.location.href);
      url.searchParams.set('tab', tab);
      window.history.replaceState({}, '', url.toString());
    }
  };

  const handleSelectSlotToBook = (slot: ParkingSlot) => {
    setSlotToBook(slot);
    setActiveTab('entry');
  };

  const navItems: NavItemConfig[] = [
    { id: 'dashboard', label: 'Hub', icon: 'hub' },
    { id: 'slots', label: 'Bays', icon: 'bays' },
    { id: 'entry', label: 'Check-In', icon: 'entry' },
    { id: 'active', label: 'Active', icon: 'active' },
    { id: 'history', label: 'Ledger', icon: 'ledger' },
    { id: 'revenue', label: 'Revenue', icon: 'revenue' },
  ];

  const renderScreen = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <DashboardScreen
            onNavigateToBook={() => setActiveTab('entry')}
            onNavigateToSlots={() => setActiveTab('slots')}
            onNavigateToActive={() => setActiveTab('active')}
            onNavigateToRevenue={() => setActiveTab('revenue')}
          />
        );
      case 'slots':
        return <SlotsScreen onSelectSlotToBook={handleSelectSlotToBook} />;
      case 'entry':
        return (
          <VehicleEntryScreen
            initialSlot={slotToBook}
            onBookingSuccess={() => {
              setSlotToBook(null);
              setActiveTab('active');
            }}
            onClearInitialSlot={() => setSlotToBook(null)}
          />
        );
      case 'active':
        return <ActiveSessionsScreen onNavigateToBook={() => setActiveTab('entry')} />;
      case 'history':
        return <HistoryScreen />;
      case 'revenue':
        return <RevenueReportScreen />;
      default:
        return (
          <DashboardScreen
            onNavigateToBook={() => setActiveTab('entry')}
            onNavigateToSlots={() => setActiveTab('slots')}
            onNavigateToActive={() => setActiveTab('active')}
            onNavigateToRevenue={() => setActiveTab('revenue')}
          />
        );
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" />

      {/* Screen View */}
      <View style={styles.contentContainer}>{renderScreen()}</View>

      {/* ParkEase Executive Bottom Navigation Bar */}
      <View style={styles.navWrapper}>
        <View style={styles.bottomNav}>
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <TouchableOpacity
                key={item.id}
                style={[styles.navItem, isActive && styles.navItemActive]}
                onPress={() => setActiveTab(item.id)}
                activeOpacity={0.8}
              >
                <View style={[styles.iconBox, isActive && styles.iconBoxActive]}>
                  <Icon
                    name={item.icon}
                    size={16}
                    color={isActive ? COLORS.primaryLight : '#94A3B8'}
                  />
                </View>
                <Text style={[styles.navLabel, isActive && styles.navLabelActive]}>
                  {item.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.navyHeader,
    paddingTop: Platform.OS === 'android' ? 24 : 0,
  },
  contentContainer: {
    flex: 1,
    backgroundColor: COLORS.canvasBg,
  },
  navWrapper: {
    backgroundColor: COLORS.navyHeader,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 8,
    paddingTop: 6,
    paddingBottom: Platform.OS === 'ios' ? 16 : 8,
  },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
    borderRadius: 12,
  },
  navItemActive: {
    backgroundColor: 'rgba(13, 148, 136, 0.18)',
  },
  iconBox: {
    width: 28,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 6,
  },
  iconBoxActive: {},
  navIcon: {
    fontSize: 15,
    opacity: 0.65,
  },
  navIconActive: {
    opacity: 1,
  },
  navLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#94A3B8',
    marginTop: 2,
    letterSpacing: 0.2,
  },
  navLabelActive: {
    color: COLORS.primaryLight,
    fontWeight: '800',
  },
});
