
import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, StyleSheet, TextInput, TouchableOpacity, Platform } from "react-native";
import { Text, View } from "./Themed";

// Conditional import for maps to prevent crashes if not properly configured
let MapView: any;
let Marker: any;

try {
    const MapsModule = require("react-native-maps");
    MapView = MapsModule.default;
    Marker = MapsModule.Marker;
} catch (error) {
    console.warn("React Native Maps not available:", error);
    MapView = null;
    Marker = null;
}

import * as Location from "expo-location";

interface PickupLocationInputProps {
    onLocationChange: (location: {
        latitude: number;
        longitude: number;
        address: string;
    }) => void;
    initialLocation?: {
        latitude: number;
        longitude: number;
        address: string;
    };
}

interface Region {
    latitude: number;
    longitude: number;
    latitudeDelta: number;
    longitudeDelta: number;
}

export function PickupLocationInput({ onLocationChange, initialLocation }: PickupLocationInputProps) {
    const [region, setRegion] = useState<Region>({
        latitude: 37.7749,
        longitude: -122.4194,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
    });
    const [markedCoordinate, setMarkedCoordinate] = useState({
        latitude: 37.7749,
        longitude: -122.4194,
    });
    const [address, setAddress] = useState<string | null>(null);
    const [manualAddress, setManualAddress] = useState<string>('');
    const [loading, setLoading] = useState(false);
    const [locationPermission, setLocationPermission] = useState<boolean>(false);
    const [useManualEntry, setUseManualEntry] = useState(!MapView); // Use manual entry if maps not available

    useEffect(() => {
        if (initialLocation) {
            const newRegion: Region = {
                latitude: initialLocation.latitude,
                longitude: initialLocation.longitude,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
            };
            setRegion(newRegion);
            setMarkedCoordinate({
                latitude: initialLocation.latitude,
                longitude: initialLocation.longitude,
            });
            setAddress(initialLocation.address);
            setManualAddress(initialLocation.address);
            setLoading(false);
        } else if (!useManualEntry) {
            getCurrentLocation();
        }
    }, [initialLocation, useManualEntry]);

    const getCurrentLocation = async () => {
        try {
            setLoading(true);
            const { status } = await Location.requestForegroundPermissionsAsync();

            if (status !== 'granted') {
                setLocationPermission(false);
                setUseManualEntry(true);
                Alert.alert(
                    'Permission Denied',
                    'Location permission is required to access your current location. You can manually enter the address instead.',
                );
                setLoading(false);
                return;
            }

            setLocationPermission(true);
            const location = await Location.getCurrentPositionAsync({
                accuracy: Location.Accuracy.Balanced,
            });
            const { latitude, longitude } = location.coords;

            const newRegion: Region = {
                latitude,
                longitude,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
            };

            setRegion(newRegion);
            setMarkedCoordinate({ latitude, longitude });

            // Get address from coordinates
            const addressResult = await reverseGeocode(latitude, longitude);
            setAddress(addressResult);
            setManualAddress(addressResult);

            onLocationChange({
                latitude,
                longitude,
                address: addressResult,
            });
        } catch (error) {
            console.error('Error getting current location:', error);
            setUseManualEntry(true);
            Alert.alert('Error', 'Unable to get current location. Please enter the address manually.');
        } finally {
            setLoading(false);
        }
    };

    const reverseGeocode = async (latitude: number, longitude: number): Promise<string> => {
        try {
            const result = await Location.reverseGeocodeAsync({ latitude, longitude });
            if (result.length > 0) {
                const location = result[0];
                // format as readable string
                const parts = [
                    location.streetNumber,
                    location.street,
                    location.city,
                    location.region,
                    location.country,
                ].filter(Boolean); // remove any undefined or null values

                return parts.join(', ') || `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
            } 
        } catch (error) {
            console.error('Error reverse geocoding:', error);
        }
        return `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`; // fallback to coordinates
    };

    const handleMapPress = async (event: any) => {
        const { latitude, longitude } = event.nativeEvent.coordinate;
        setMarkedCoordinate({ latitude, longitude });

        // Get address from coordinates
        const addressResult = await reverseGeocode(latitude, longitude);
        setAddress(addressResult);

        onLocationChange({
            latitude,
            longitude,
            address: addressResult,
        });
    };

    const handleAddressSubmit = async () => {
        if (!address?.trim()) return;

        try {
            setLoading(true);
            const result = await Location.geocodeAsync(address);
            if (result.length > 0) {
                const { latitude, longitude } = result[0];
                const newRegion: Region = {
                    latitude,
                    longitude,
                    latitudeDelta: 0.01,
                    longitudeDelta: 0.01,
                };

                setRegion(newRegion);
                setMarkedCoordinate({ latitude, longitude });

                onLocationChange({
                    latitude,
                    longitude,
                    address: address.trim(),
                });
            } else {
                // If geocoding fails but we have an address, use default coordinates
                onLocationChange({
                    latitude: 37.7749, // Default to San Francisco
                    longitude: -122.4194,
                    address: address.trim(),
                });
            }
        } catch (error) {
            console.error('Error geocoding address:', error);
            // Even if geocoding fails, allow manual address entry
            onLocationChange({
                latitude: 37.7749, // Default to San Francisco
                longitude: -122.4194,
                address: address.trim(),
            });
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#2f95dc" />
                <Text style={styles.loadingText}>Loading location...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Text style={styles.label}>Pickup Location</Text>

            <View style={styles.addressInputContainer}>
                <TextInput
                    style={styles.addressInput}
                    placeholder="Enter address or select on map"
                    value={address || ''}
                    onChangeText={setAddress}
                    onSubmitEditing={handleAddressSubmit}
                    returnKeyType="search"
                />
                <TouchableOpacity style={styles.searchButton} onPress={handleAddressSubmit}>
                    <Text style={styles.searchButtonText}>Search</Text>
                </TouchableOpacity>
            </View>

            {MapView && Marker ? (
                <MapView
                    style={styles.map}
                    region={region}
                    onRegionChangeComplete={setRegion}
                    onPress={handleMapPress}
                    showsUserLocation={locationPermission}
                    showsMyLocationButton={true}
                >
                    <Marker
                        coordinate={markedCoordinate}
                        title="Pickup Location"
                        description={address || 'No address selected'}
                        draggable
                        onDragEnd={handleMapPress}
                    />
                </MapView>
            ) : (
                <View style={styles.mapPlaceholder}>
                    <Text style={styles.mapPlaceholderText}>
                        📍 Map not available. Please enter address manually.
                    </Text>
                </View>
            )}

            {!locationPermission && (
                <TouchableOpacity style={styles.locationButton} onPress={getCurrentLocation}>
                    <Text style={styles.locationButtonText}>📍 Use Current Location</Text>
                </TouchableOpacity>
            )}
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        marginBottom: 20,
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 8,
    },
    loadingContainer: {
        height: 200,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
        borderRadius: 8,
    },
    loadingText: {
        marginTop: 10,
        color: '#666',
    },
    addressInputContainer: {
        flexDirection: 'row',
        marginBottom: 10,
    },
    addressInput: {
        flex: 1,
        backgroundColor: '#fff',
        padding: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#ddd',
        fontSize: 16,
    },
    searchButton: {
        backgroundColor: '#2f95dc',
        padding: 12,
        borderRadius: 8,
        marginLeft: 8,
        justifyContent: 'center',
        alignItems: 'center',
        minWidth: 44,
    },
    searchButtonText: {
        fontSize: 16,
    },
    map: {
        height: 200,
        borderRadius: 8,
        marginBottom: 10,
    },
    mapPlaceholder: {
        height: 200,
        borderRadius: 8,
        marginBottom: 10,
        backgroundColor: '#f0f0f0',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#ddd',
        borderStyle: 'dashed',
    },
    mapPlaceholderText: {
        color: '#666',
        fontSize: 14,
        textAlign: 'center',
        fontStyle: 'italic',
    },
    locationButton: {
        backgroundColor: '#4CAF50',
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    locationButtonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
    },
});