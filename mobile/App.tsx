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

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [slotToBook, setSlotToBook] = useState<ParkingSlot | null>(null);

  const handleSelectSlotToBook = (slot: ParkingSlot) => {
    setSlotToBook(slot);
    setActiveTab('entry');
  };

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
      <View style={styles.contentContainer}>{renderScreen()}</View>

      {/* Modern Sleek Bottom Navigation Bar */}
      <View style={styles.bottomNav}>
        <TouchableOpacity
          style={[styles.navItem, activeTab === 'dashboard' && styles.navItemActive]}
          onPress={() => setActiveTab('dashboard')}
        >
          <Text style={[styles.navIcon, activeTab === 'dashboard' && styles.navIconActive]}>
            📊
          </Text>
          <Text style={[styles.navLabel, activeTab === 'dashboard' && styles.navLabelActive]}>
            Home
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.navItem, activeTab === 'slots' && styles.navItemActive]}
          onPress={() => setActiveTab('slots')}
        >
          <Text style={[styles.navIcon, activeTab === 'slots' && styles.navIconActive]}>
            🅿️
          </Text>
          <Text style={[styles.navLabel, activeTab === 'slots' && styles.navLabelActive]}>
            Slots
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.navItem, activeTab === 'entry' && styles.navItemActive]}
          onPress={() => setActiveTab('entry')}
        >
          <Text style={[styles.navIcon, activeTab === 'entry' && styles.navIconActive]}>
            🚗
          </Text>
          <Text style={[styles.navLabel, activeTab === 'entry' && styles.navLabelActive]}>
            Entry
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.navItem, activeTab === 'active' && styles.navItemActive]}
          onPress={() => setActiveTab('active')}
        >
          <Text style={[styles.navIcon, activeTab === 'active' && styles.navIconActive]}>
            ⏱️
          </Text>
          <Text style={[styles.navLabel, activeTab === 'active' && styles.navLabelActive]}>
            Active
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.navItem, activeTab === 'history' && styles.navItemActive]}
          onPress={() => setActiveTab('history')}
        >
          <Text style={[styles.navIcon, activeTab === 'history' && styles.navIconActive]}>
            📜
          </Text>
          <Text style={[styles.navLabel, activeTab === 'history' && styles.navLabelActive]}>
            History
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.navItem, activeTab === 'revenue' && styles.navItemActive]}
          onPress={() => setActiveTab('revenue')}
        >
          <Text style={[styles.navIcon, activeTab === 'revenue' && styles.navIconActive]}>
            💰
          </Text>
          <Text style={[styles.navLabel, activeTab === 'revenue' && styles.navLabelActive]}>
            Revenue
          </Text>
        </TouchableOpacity>
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
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: COLORS.cardBg,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingVertical: 8,
    paddingBottom: Platform.OS === 'ios' ? 20 : 8,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
  },
  navItemActive: {
    transform: [{ scale: 1.05 }],
  },
  navIcon: {
    fontSize: 18,
    opacity: 0.6,
  },
  navIconActive: {
    opacity: 1,
  },
  navLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: COLORS.textMuted,
    marginTop: 2,
  },
  navLabelActive: {
    color: COLORS.primaryLight,
    fontWeight: '800',
  },
});
