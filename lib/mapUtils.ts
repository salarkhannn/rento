// Utility to check if maps are available and handle gracefully
export const checkMapsAvailability = (): { mapsAvailable: boolean; MapView: any; Marker: any } => {
  try {
    const MapsModule = require("react-native-maps");
    return {
      mapsAvailable: true,
      MapView: MapsModule.default,
      Marker: MapsModule.Marker,
    };
  } catch (error) {
    console.warn("React Native Maps not available:", error);
    return {
      mapsAvailable: false,
      MapView: null,
      Marker: null,
    };
  }
};

export const DEFAULT_REGION = {
  latitude: 37.7749,  // San Francisco
  longitude: -122.4194,
  latitudeDelta: 0.01,
  longitudeDelta: 0.01,
};
