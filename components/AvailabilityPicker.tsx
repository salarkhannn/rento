import { useState } from "react";
import { Platform, StyleSheet, TouchableOpacity } from "react-native";
import DateTimePicker from '@react-native-community/datetimepicker';
import { Text, View } from "./Themed";

interface AvailabilityPickerProps {
    onDatesChange: (dates: {
        availableFrom: string | null;
        availableTo: string | null;
    }) => void;
    initialDates?: {
        availableFrom: string | null;
        availableTo: string | null;
    };
}

export function AvailabilityPicker({ onDatesChange, initialDates }: AvailabilityPickerProps) {
    const [availableFrom, setAvailableFrom] = useState<Date | null>(
        initialDates?.availableFrom ? new Date(initialDates.availableFrom) : null
    );
    const [availableTo, setAvailableTo] = useState<Date | null>(
        initialDates?.availableTo ? new Date(initialDates.availableTo) : null
    );
    const [showFromPicker, setShowFromPicker] = useState(false);
    const [showToPicker, setShowToPicker] = useState(false);
    const [alwaysAvailable, setAlwaysAvailable] = useState(
        !initialDates?.availableFrom && !initialDates?.availableTo
    );

    const formatDate = (date: Date | null): string => {
        if (!date) return '';
        return date.toISOString().split('T')[0];
    };

    const handleFromDateChange = (event: any, selectedDate?: Date) => {
        setShowFromPicker(Platform.OS === 'ios');

        if (selectedDate) {
            setAvailableFrom(selectedDate);

            // If 'to' date is before 'from' date, clear it
            if (availableTo && selectedDate > availableTo) {
                setAvailableTo(null);
                onDatesChange({
                    availableFrom: formatDate(selectedDate),
                    availableTo: null,
                });
            } else {
                onDatesChange({
                    availableFrom: formatDate(selectedDate),
                    availableTo: availableTo ? formatDate(availableTo) : null,
                });
            }
        }
    };

    const handleToDateChange = (event: any, selectedDate?: Date) => {
        setShowToPicker(Platform.OS === 'ios');

        if (selectedDate) {
            setAvailableTo(selectedDate);
            onDatesChange({
                availableFrom: availableFrom ? formatDate(availableFrom) : null,
                availableTo: formatDate(selectedDate),
            });
        }
    };

    const toggleAlwaysAvailable = () => {
        const newAlwaysAvailable = !alwaysAvailable;
        setAlwaysAvailable(newAlwaysAvailable);

        if (newAlwaysAvailable) {
            setAvailableFrom(null);
            setAvailableTo(null);
            onDatesChange({
                availableFrom: null,
                availableTo: null
            });
        }
    };

    const clearFromDate = () => {
        setAvailableFrom(null);
        onDatesChange({
            availableFrom: null,
            availableTo: availableTo ? formatDate(availableTo) : null,
        });
    };

    const clearToDate = () => {
        setAvailableTo(null);
        onDatesChange({
            availableFrom: availableFrom ? formatDate(availableFrom) : null,
            availableTo: null,
        });
    };

    return (
        <View style={styles.container}>
            <Text style={styles.label}>Availability Period</Text>

            <TouchableOpacity
                style={[
                    styles.alwaysAvailableButton,
                    { backgroundColor: alwaysAvailable ? '#4CAF50' : '#f0f0f0' }
                ]}
                onPress={toggleAlwaysAvailable}
            >
                <Text style={[
                    styles.alwaysAvailableText,
                    { color: alwaysAvailable ? '#fff' : '#666' }
                ]}>
                    {alwaysAvailable ? 'Always Available' : 'Set Availability Period'}
                </Text>
            </TouchableOpacity>

            {!alwaysAvailable && (
                <View style={styles.dateInputs}>
                    <View style={styles.dateRow}>
                        <View style={styles.dateInput}>
                            <Text style={styles.inputLabel}>
                                Available From:
                            </Text>
                            <TouchableOpacity
                                style={styles.dateButton}
                                onPress={() => setShowFromPicker(true)}
                            >
                                <Text style={[
                                    styles.dateButtonText,
                                    { color: availableFrom ? '#333' : '#999' }
                                ]}>
                                    {availableFrom ? formatDate(availableFrom) : 'Select start date'}
                                </Text>
                            </TouchableOpacity>

                            {availableFrom && (
                                <TouchableOpacity
                                    style={styles.clearButton}
                                    onPress={clearFromDate}
                                >
                                    <Text style={styles.clearButtonText}>Clear</Text>
                                </TouchableOpacity>
                            )}
                        </View>

                        <View style={styles.dateInput}>
                            <Text style={styles.inputLabel}>Available To:</Text>
                            <TouchableOpacity
                                style={[
                                    styles.dateButton,
                                    { opacity: !availableFrom ? 0.5 : 1 }
                                ]}
                                onPress={() => availableFrom && setShowToPicker(true)}
                                disabled={!availableFrom}
                            >
                                <Text style={[
                                    styles.dateButtonText,
                                    { color: availableTo ? '#333' : '#999' }
                                ]}>
                                    {availableTo ? formatDate(availableTo) : 'Select end date'}
                                </Text>
                            </TouchableOpacity>

                            {availableTo && (
                                <TouchableOpacity style={styles.clearButton} onPress={clearToDate}>
                                    <Text style={styles.clearButtonText}>Clear</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    </View>

                    {showFromPicker && (
                        <DateTimePicker
                            value={availableFrom || new Date()}
                            mode="date"
                            display="default"
                            minimumDate={new Date()}
                            onChange={handleFromDateChange}
                        />
                    )}

                    {showToPicker && (
                        <DateTimePicker
                            value={availableTo || (availableFrom ? new Date(availableFrom.getTime() + 24 * 60 * 60 * 1000) : new Date())}
                            mode="date"
                            display="default"
                            minimumDate={availableFrom || new Date()}
                            onChange={handleToDateChange}
                        />
                    )}
                </View>
            )}

            <Text style={styles.helpText}>
                {alwaysAvailable 
                ? 'Item will be marked as always available for rent'
                : 'Set specific dates when this item is available for rent'
                }
            </Text>
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
  alwaysAvailableButton: {
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
  },
  alwaysAvailableText: {
    fontSize: 16,
    fontWeight: '600',
  },
  dateInputs: {
    marginBottom: 12,
  },
  dateRow: {
    gap: 12,
  },
  dateInput: {
    marginBottom: 12,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
    color: '#333',
  },
  dateButton: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  dateButtonText: {
    fontSize: 16,
  },
  clearButton: {
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  clearButtonText: {
    fontSize: 12,
    color: '#FF5252',
    fontWeight: '600',
  },
  helpText: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
  },
});