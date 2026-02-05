import '@testing-library/jest-native/extend-expect';
import 'react-native-gesture-handler/jestSetup';

jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock');
  Reanimated.default.call = () => {};
  return Reanimated;
});

jest.mock('@gorhom/bottom-sheet', () => {
  const React = require('react');
  const { View, TouchableOpacity } = require('react-native');

  const BottomSheet = React.forwardRef(({ children, ...props }, ref) => (
    <View {...props}>{children}</View>
  ));

  const BottomSheetBackdrop = ({ children, ...props }) => (
    <View {...props}>{children}</View>
  );

  const BottomSheetView = ({ children, ...props }) => <View {...props}>{children}</View>;

  const BottomSheetScrollView = ({ children, ...props }) => (
    <View {...props}>{children}</View>
  );

  return {
    __esModule: true,
    default: BottomSheet,
    BottomSheetBackdrop,
    BottomSheetView,
    BottomSheetScrollView,
    TouchableOpacity,
  };
});

// Mock react-native-maps
jest.mock('react-native-maps', () => {
  const { View } = require('react-native');
  const MockMapView = (props) => {
    return <View testID="map-view" {...props} />;
  };
  MockMapView.Marker = (props) => <View testID="map-marker" {...props} />;
  MockMapView.PROVIDER_GOOGLE = 'google';
  return {
    __esModule: true,
    default: MockMapView,
    Marker: MockMapView.Marker,
    PROVIDER_GOOGLE: 'google',
  };
});

// Mock expo-status-bar
jest.mock('expo-status-bar', () => ({
  StatusBar: () => null,
}));

// Silence console.log in tests
global.console = {
  ...console,
  log: jest.fn(),
  warn: jest.fn(),
};
