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

type TabType = 'dashboard' | 'slots' | 'entry' | 'active' | 'history' | 'revenue';

interface NavItemConfig {
  id: TabType;
  label: string;
  icon: string;
  badge?: string;
}

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [slotToBook, setSlotToBook] = useState<ParkingSlot | null>(null);

  const handleSelectSlotToBook = (slot: ParkingSlot) => {
    setSlotToBook(slot);
    setActiveTab('entry');
  };

  const navItems: NavItemConfig[] = [
    { id: 'dashboard', label: 'Hub', icon: '📊' },
    { id: 'slots', label: 'Bays', icon: '🅿' },
    { id: 'entry', label: 'Check-In', icon: '⚡' },
    { id: 'active', label: 'Active', icon: '⏱️' },
    { id: 'history', label: 'Ledger', icon: '📜' },
    { id: 'revenue', label: 'Revenue', icon: '💎' },
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
      
      {/* Active Screen View */}
      <View style={styles.contentContainer}>{renderScreen()}</View>

      {/* Floating Modern Dock Navigation Bar */}
      <View style={styles.dockWrapper}>
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
                <View style={[styles.iconWrapper, isActive && styles.iconWrapperActive]}>
                  <Text style={[styles.navIcon, isActive && styles.navIconActive]}>
                    {item.icon}
                  </Text>
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
    backgroundColor: COLORS.bgPrimary,
    paddingTop: Platform.OS === 'android' ? 24 : 0,
  },
  contentContainer: {
    flex: 1,
  },
  dockWrapper: {
    backgroundColor: COLORS.bgPrimary,
    paddingHorizontal: 12,
    paddingBottom: Platform.OS === 'ios' ? 14 : 8,
    paddingTop: 4,
  },
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: COLORS.cardBg,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    paddingVertical: 6,
    paddingHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 8,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
    borderRadius: 14,
  },
  navItemActive: {
    backgroundColor: 'rgba(99, 102, 241, 0.12)',
  },
  iconWrapper: {
    width: 32,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
  },
  iconWrapperActive: {
    backgroundColor: 'rgba(99, 102, 241, 0.22)',
  },
  navIcon: {
    fontSize: 16,
    opacity: 0.6,
  },
  navIconActive: {
    opacity: 1,
  },
  navLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.textMuted,
    marginTop: 2,
    letterSpacing: 0.2,
  },
  navLabelActive: {
    color: COLORS.primaryLight,
    fontWeight: '800',
  },
});
