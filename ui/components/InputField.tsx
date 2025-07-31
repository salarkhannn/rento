import React, { useState, forwardRef } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  Image, 
  StyleSheet, 
  ViewStyle, 
  TextStyle,
  TextInputProps,
  NativeSyntheticEvent,
  TextInputFocusEventData
} from 'react-native';

interface CustomTextInputProps extends Omit<TextInputProps, 'style' | 'onChangeText'> {
  title?: string;
  placeholder?: string;
  value?: string;
  onChangeText?: (text: string) => void;
  leftIcon?: string | React.ReactNode;
  helperText?: string;
  errorMessage?: string;
  disabled?: boolean;
  style?: ViewStyle;
  containerStyle?: ViewStyle;
  inputStyle?: TextStyle;
  titleStyle?: TextStyle;
  helperTextStyle?: TextStyle;
  showCursor?: boolean;
  onFocus?: (e: NativeSyntheticEvent<TextInputFocusEventData>) => void;
  onBlur?: (e: NativeSyntheticEvent<TextInputFocusEventData>) => void;
}

const CustomTextInput = forwardRef<TextInput, CustomTextInputProps>(({
  title,
  placeholder = "Placeholder",
  value = "",
  onChangeText,
  leftIcon,
  helperText,
  errorMessage,
  disabled = false,
  style,
  containerStyle,
  inputStyle,
  titleStyle,
  helperTextStyle,
  showCursor = true,
  autoFocus = false,
  secureTextEntry = false,
  keyboardType = "default",
  maxLength,
  multiline = false,
  numberOfLines = 1,
  onFocus,
  onBlur,
  testID,
  ...props
}, ref) => {
  const [isFocused, setIsFocused] = useState<boolean>(false);
  const [internalValue, setInternalValue] = useState<string>(value);

  const hasError: boolean = Boolean(errorMessage);
  const hasValue: boolean = Boolean(internalValue);
  const isActive: boolean = isFocused || hasValue;

  const handleFocus = (e: NativeSyntheticEvent<TextInputFocusEventData>): void => {
    setIsFocused(true);
    onFocus?.(e);
  };

  const handleBlur = (e: NativeSyntheticEvent<TextInputFocusEventData>): void => {
    setIsFocused(false);
    onBlur?.(e);
  };

  const handleChangeText = (text: string): void => {
    setInternalValue(text);
    onChangeText?.(text);
  };

  const getBorderColor = (): string => {
    if (hasError) return '#FF3B30';
    if (isFocused) return '#000000';
    return 'rgba(60,60,67,0.6)';
  };

  const getTextColor = (): string => {
    if (hasError) return '#FF3B30';
    if (hasValue) return '#000000';
    return 'rgba(60,60,67,0.6)';
  };

  const getHelperTextColor = (): string => {
    return hasError ? '#FF3B30' : 'rgba(60,60,67,0.6)';
  };

  const displayText: string | undefined = hasError ? errorMessage : helperText;

  return (
    <View style={[styles.container, containerStyle]} testID={testID}>
      {title && (
        <Text style={[styles.title, titleStyle]}>{title}</Text>
      )}
      
      <View style={[
        styles.inputContainer,
        { borderColor: getBorderColor() },
        disabled && styles.disabled,
        style
      ]}>
        {leftIcon && (
          <View style={styles.iconContainer}>
            {typeof leftIcon === 'string' ? (
              <Image source={{ uri: leftIcon }} style={styles.icon} />
            ) : (
              leftIcon
            )}
          </View>
        )}
        
        <TextInput
          ref={ref}
          style={[
            styles.input,
            { color: getTextColor() },
            inputStyle
          ]}
          value={internalValue}
          onChangeText={handleChangeText}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          placeholderTextColor="rgba(60,60,67,0.6)"
          editable={!disabled}
          autoFocus={autoFocus}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          maxLength={maxLength}
          multiline={multiline}
          numberOfLines={numberOfLines}
          cursorColor={showCursor ? '#3770FF' : 'transparent'}
          selectionColor="#3770FF"
          {...props}
        />
      </View>

      {displayText && displayText.length > 0 && (
        <Text style={[
            styles.helperText,
            { color: getHelperTextColor() },
            helperTextStyle
            ]}>
            {displayText}
        </Text>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    minHeight: 85,
    gap: 4,
  },
  title: {
    color: '#000000',
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
    backgroundColor: '#F7F7F7',
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

CustomTextInput.displayName = 'CustomTextInput';

export default CustomTextInput;