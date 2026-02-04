import '@testing-library/jest-native/extend-expect';

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
