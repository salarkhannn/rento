import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  ViewStyle, 
  TextStyle,
  Image
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import Colors from '@/constants/Colors';

interface DatePickerFieldProps {
  title?: string;
  placeholder?: string;
  value?: string;
  onDateChange: (date: string) => void;
  leftIcon?: string | React.ReactNode;
  helperText?: string;
  errorMessage?: string;
  disabled?: boolean;
  style?: ViewStyle;
  containerStyle?: ViewStyle;
  inputStyle?: TextStyle;
  titleStyle?: TextStyle;
  helperTextStyle?: TextStyle;
}

const DatePickerField: React.FC<DatePickerFieldProps> = ({
  title,
  placeholder = "Select a date",
  value = "",
  onDateChange,
  leftIcon,
  helperText,
  errorMessage,
  disabled = false,
  style,
  containerStyle,
  inputStyle,
  titleStyle,
  helperTextStyle,
  testID,
}) => {
  const [showDatePicker, setShowDatePicker] = useState<boolean>(false);

  const hasError: boolean = Boolean(errorMessage);
  const hasValue: boolean = Boolean(value);

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      onDateChange(selectedDate.toISOString().split('T')[0]);
    }
  };

  const getBorderColor = (): string => {
    if (hasError) return Colors.colors.red;
    return Colors.text.secondary;
  };

  const getTextColor = (): string => {
    if (hasError) return Colors.colors.red;
    if (hasValue) return Colors.text.primary;
    return Colors.text.secondary;
  };

  const getHelperTextColor = (): string => {
    return hasError ? Colors.colors.red : Colors.text.secondary;
  };

  const displayText: string | undefined = hasError ? errorMessage : helperText;

  return (
    <View style={[styles.container, containerStyle]} testID={testID}>
      {title && (
        <Text style={[styles.title, titleStyle]}>{title}</Text>
      )}
      
      <TouchableOpacity
        onPress={() => !disabled && setShowDatePicker(true)}
        style={[
          styles.inputContainer,
          { borderColor: getBorderColor() },
          disabled && styles.disabled,
          style
        ]}
        activeOpacity={0.7}
      >
        {leftIcon && (
          <View style={styles.iconContainer}>
            {typeof leftIcon === 'string' ? (
              <Image source={{ uri: leftIcon }} style={styles.icon} />
            ) : (
              leftIcon
            )}
          </View>
        )}
        
        <Text style={[styles.input, { color: getTextColor() }, inputStyle]}>
          {value || placeholder}
        </Text>
      </TouchableOpacity>

      {displayText && displayText.length > 0 && (
        <Text style={[
            styles.helperText,
            { color: getHelperTextColor() },
            helperTextStyle
            ]}>
            {displayText}
        </Text>
      )}

      {showDatePicker && (
        <DateTimePicker
          value={value ? new Date(value) : new Date()}
          mode="date"
          display="default"
          onChange={handleDateChange}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 4,
  },
  title: {
    color: Colors.text.primary,
    fontSize: 13,
    fontFamily: 'SF Pro',
    fontWeight: '400',
    marginBottom: 4,
  },
  inputContainer: {
    height: 41,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingRight: 13,
    backgroundColor: Colors.background.secondary,
    borderWidth: 0.7,
    borderRadius: 10,
    gap: 11,
  },
  disabled: {
    opacity: 0.6,
  },
  iconContainer: {
    width: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    width: 16,
    height: 16,
  },
  input: {
    flex: 1,
    fontSize: 15,
    fontFamily: 'SF Pro',
    fontWeight: '400',
    padding: 0,
    margin: 0,
  },
  helperText: {
    fontSize: 13,
    fontFamily: 'SF Pro',
    fontWeight: '400',
    marginTop: 0,
  },
});

export default DatePickerField;