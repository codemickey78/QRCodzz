import React from 'react';
import {
  DarkTheme,
  DefaultTheme,
  NavigationContainer,
  Theme as NavigationTheme,
} from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { HugeiconsIcon, IconSvgElement } from '@hugeicons/react-native';
import {
  ArrowLeft02Icon,
  AddSquareIcon,
  AiScanIcon,
  FolderLibraryIcon,
  Settings02Icon,
} from '@hugeicons/core-free-icons';

import { BatchGeneratorScreen } from '../../features/batchGenerator/screens/BatchGeneratorScreen';
import { BarcodePreviewScreen } from '../../features/barcodeGenerator/screens/BarcodePreviewScreen';
import { CreateHomeScreen } from '../../features/generator/screens/CreateHomeScreen';
import { GeneratorFormScreen } from '../../features/generator/screens/GeneratorFormScreen';
import { QRPreviewScreen } from '../../features/generator/screens/QRPreviewScreen';
import { CodeDetailsScreen } from '../../features/library/screens/CodeDetailsScreen';
import { CollectionDetailsScreen } from '../../features/library/screens/CollectionDetailsScreen';
import { FolderDetailsScreen } from '../../features/library/screens/FolderDetailsScreen';
import { LibraryHomeScreen } from '../../features/library/screens/LibraryHomeScreen';
import { QRStudioScreen } from '../../features/qrStudio/screens/QRStudioScreen';
import { CameraScannerScreen } from '../../features/scanner/screens/CameraScannerScreen';
import { ScanResultScreen } from '../../features/scanner/screens/ScanResultScreen';
import { ScanHomeScreen } from '../../features/scanner/screens/ScanHomeScreen';
import { AboutAppScreen } from '../../features/settings/screens/AboutAppScreen';
import { AppearanceScreen } from '../../features/settings/screens/AppearanceScreen';
import { DataManagementScreen } from '../../features/settings/screens/DataManagementScreen';
import { HelpSupportScreen } from '../../features/settings/screens/HelpSupportScreen';
import { PremiumScreen } from '../../features/settings/screens/PremiumScreen';
import { PrivacySecurityScreen } from '../../features/settings/screens/PrivacySecurityScreen';
import { ScannerSettingsScreen } from '../../features/settings/screens/ScannerSettingsScreen';
import { SettingsHomeScreen } from '../../features/settings/screens/SettingsHomeScreen';
import { useTheme } from '../../theme/useTheme';
import {
  CreateStackParamList,
  LibraryStackParamList,
  MainTabParamList,
  ScanStackParamList,
  SettingsStackParamList,
} from './navigationTypes';

const Tab = createBottomTabNavigator<MainTabParamList>();
const ScanStack = createNativeStackNavigator<ScanStackParamList>();
const CreateStack = createNativeStackNavigator<CreateStackParamList>();
const LibraryStack = createNativeStackNavigator<LibraryStackParamList>();
const SettingsStack = createNativeStackNavigator<SettingsStackParamList>();

const tabIcons: Record<keyof MainTabParamList, IconSvgElement> = {
  Scan: AiScanIcon,
  Create: AddSquareIcon,
  Library: FolderLibraryIcon,
  Settings: Settings02Icon,
};

type TabIconProps = {
  focused: boolean;
  name: keyof MainTabParamList;
};

function TabIcon({ focused, name }: TabIconProps) {
  const {theme} = useTheme();
  const color = focused ? theme.colors.primary : theme.colors.textSecondary;
  return (
    <View style={styles.tabPill}>
      <HugeiconsIcon
        color={color}
        icon={tabIcons[name]}
        size={focused ? 31 : 29}
        strokeWidth={focused ? 2.35 : 2.05}
      />
      <Text
        style={[
          styles.tabLabel,
          {fontFamily: focused ? theme.fonts.gb : theme.fonts.gr},
          {color},
        ]}>
        {name}
      </Text>
    </View>
  );
}

function ScanTabIcon({ focused }: { focused: boolean }) {
  return <TabIcon focused={focused} name="Scan" />;
}

function CreateTabIcon({ focused }: { focused: boolean }) {
  return <TabIcon focused={focused} name="Create" />;
}

function LibraryTabIcon({ focused }: { focused: boolean }) {
  return <TabIcon focused={focused} name="Library" />;
}

function SettingsTabIcon({ focused }: { focused: boolean }) {
  return <TabIcon focused={focused} name="Settings" />;
}

function useStackOptions(headerShown = true) {
  const {theme} = useTheme();

  return ({navigation}: {navigation: {goBack: () => void}}) => ({
    headerShown,
    headerBackTitleVisible: false,
    headerShadowVisible: false,
    headerLargeTitle: false,
    headerStyle: {
      backgroundColor: theme.colors.background,
    },
    headerTitleStyle: {
      color: theme.colors.textPrimary,
      fontFamily: theme.fonts.gb,
      fontSize: 18,
    },
    headerTintColor: theme.colors.textPrimary,
    headerLeft: ({canGoBack}: {canGoBack?: boolean}) =>
      canGoBack ? (
        <Pressable
          accessibilityLabel="Go back"
          accessibilityRole="button"
          onPress={navigation.goBack}
          style={({pressed}) => [
            styles.backButton,
            pressed ? {opacity: 0.72, transform: [{scale: 0.96}]} : null,
          ]}>
          <HugeiconsIcon
            color={theme.colors.textPrimary}
            icon={ArrowLeft02Icon}
            size={24}
            strokeWidth={2.2}
          />
        </Pressable>
      ) : null,
  });
}

function ScanStackNavigator() {
  const stackOptions = useStackOptions(false);
  return (
    <ScanStack.Navigator screenOptions={stackOptions}>
      <ScanStack.Screen
        name="ScanHome"
        component={ScanHomeScreen}
        options={{title: 'Scan'}}
      />
      <ScanStack.Screen
        name="CameraScanner"
        component={CameraScannerScreen}
        options={{title: 'Scan'}}
      />
      <ScanStack.Screen
        name="ScanResult"
        component={ScanResultScreen}
        options={{headerShown: true, title: 'Scan result'}}
      />
    </ScanStack.Navigator>
  );
}

function CreateStackNavigator() {
  const stackOptions = useStackOptions();
  return (
    <CreateStack.Navigator screenOptions={stackOptions}>
      <CreateStack.Screen
        name="CreateHome"
        component={CreateHomeScreen}
        options={{title: 'Create QR'}}
      />
      <CreateStack.Screen
        name="GeneratorForm"
        component={GeneratorFormScreen}
        options={{title: 'Generator'}}
      />
      <CreateStack.Screen
        name="QRPreview"
        component={QRPreviewScreen}
        options={{title: 'QR Preview'}}
      />
      <CreateStack.Screen
        name="BarcodePreview"
        component={BarcodePreviewScreen}
        options={{title: 'Barcode Preview'}}
      />
      <CreateStack.Screen
        name="QRStudio"
        component={QRStudioScreen}
        options={{title: 'Customize'}}
      />
      <CreateStack.Screen
        name="BatchGenerator"
        component={BatchGeneratorScreen}
        options={{title: 'Batch Generate'}}
      />
    </CreateStack.Navigator>
  );
}

function LibraryStackNavigator() {
  const stackOptions = useStackOptions();
  return (
    <LibraryStack.Navigator screenOptions={stackOptions}>
      <LibraryStack.Screen
        name="LibraryHome"
        component={LibraryHomeScreen}
        options={{title: 'History'}}
      />
      <LibraryStack.Screen
        name="CodeDetails"
        component={CodeDetailsScreen}
        options={{title: 'Code Details'}}
      />
      <LibraryStack.Screen
        name="CollectionDetails"
        component={CollectionDetailsScreen}
        options={{title: 'Collection'}}
      />
      <LibraryStack.Screen
        name="FolderDetails"
        component={FolderDetailsScreen}
        options={{title: 'Folder'}}
      />
    </LibraryStack.Navigator>
  );
}

function SettingsStackNavigator() {
  const stackOptions = useStackOptions();
  return (
    <SettingsStack.Navigator screenOptions={stackOptions}>
      <SettingsStack.Screen
        name="SettingsHome"
        component={SettingsHomeScreen}
        options={{title: 'Settings'}}
      />
      <SettingsStack.Screen
        name="ScannerSettings"
        component={ScannerSettingsScreen}
        options={{title: 'Scanner'}}
      />
      <SettingsStack.Screen
        name="Appearance"
        component={AppearanceScreen}
        options={{title: 'Appearance'}}
      />
      <SettingsStack.Screen
        name="Premium"
        component={PremiumScreen}
        options={{title: 'Rewarded access'}}
      />
      <SettingsStack.Screen
        name="AboutApp"
        component={AboutAppScreen}
        options={{title: 'About app'}}
      />
      <SettingsStack.Screen
        name="HelpSupport"
        component={HelpSupportScreen}
        options={{title: 'Help & support'}}
      />
      <SettingsStack.Screen
        name="DataManagement"
        component={DataManagementScreen}
        options={{title: 'Data'}}
      />
      <SettingsStack.Screen
        name="PrivacySecurity"
        component={PrivacySecurityScreen}
        options={{title: 'Privacy'}}
      />
    </SettingsStack.Navigator>
  );
}

export function RootNavigator() {
  const { isDark, theme } = useTheme();

  const navigationTheme: NavigationTheme = {
    ...(isDark ? DarkTheme : DefaultTheme),
    colors: {
      ...(isDark ? DarkTheme.colors : DefaultTheme.colors),
          background: theme.colors.background,
          border: theme.colors.border,
          card: theme.colors.surface,
          primary: theme.colors.primary,
          text: theme.colors.textPrimary,
        },
      };

  return (
    <NavigationContainer theme={navigationTheme}>
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarHideOnKeyboard: true,
          tabBarLabel: () => null,
          tabBarShowLabel: false,
          tabBarItemStyle: {
            alignItems: 'center',
            justifyContent: 'center',
            minWidth: 58,
          },
          tabBarStyle: {
            backgroundColor: theme.colors.surface,
            borderTopColor: theme.colors.border,
            borderTopWidth: StyleSheet.hairlineWidth,
            elevation: 12,
            height: 92,
            paddingBottom: 4,
            paddingHorizontal: 10,
            paddingTop: 18,
            shadowColor: theme.colors.black,
            shadowOffset: {height: -8, width: 0},
            shadowOpacity: 0.06,
            shadowRadius: 18,
          },
        }}
      >
        <Tab.Screen
          name="Scan"
          component={ScanStackNavigator}
          options={{ tabBarIcon: ScanTabIcon }}
        />
        <Tab.Screen
          name="Create"
          component={CreateStackNavigator}
          options={{ tabBarIcon: CreateTabIcon }}
        />
        <Tab.Screen
          name="Library"
          component={LibraryStackNavigator}
          options={{ tabBarIcon: LibraryTabIcon }}
        />
        <Tab.Screen
          name="Settings"
          component={SettingsStackNavigator}
          options={{ tabBarIcon: SettingsTabIcon }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  backButton: {
    alignItems: 'center',
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  tabPill: {
    alignItems: 'center',
    flexDirection: 'column',
    gap: 4,
    height: 66,
    justifyContent: 'flex-end',
    minWidth: 58,
  },
  tabLabel: {
    fontSize: 10,
    lineHeight: 13,
  },
});
