import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  TextInput,
  Text,
  Image,
  StyleSheet,
  TextInputProps,
  TouchableWithoutFeedback,
} from 'react-native';

export type SearchBarVariant = 'active' | 'default' | 'disabled' | 'textEntered' | 'typing';

interface SearchBarProps extends Omit<TextInputProps, 'style'> {
  variant?: SearchBarVariant;
  placeholder?: string;
  onChangeText?: (text: string) => void;
  value?: string;
  disabled?: boolean;
  iconSource?: any; // Image source for the search icon
}

const SearchBar: React.FC<SearchBarProps> = ({
  variant = 'default',
  placeholder = 'Search',
  onChangeText,
  value = '',
  disabled = false,
  iconSource,
  ...textInputProps
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [inputValue, setInputValue] = useState(value);
  const [showCursor, setShowCursor] = useState(true);
  const textInputRef = useRef<TextInput>(null);

  // Sync inputValue with value prop
  useEffect(() => {
    setInputValue(value);
  }, [value]);

  // Handle cursor blinking animation for typing state
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isFocused && inputValue.length > 0) {
      interval = setInterval(() => {
        setShowCursor(prev => !prev);
      }, 500);
    } else {
      setShowCursor(true);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isFocused, inputValue.length]);

  // Determine current variant based on state
  const getCurrentVariant = (): SearchBarVariant => {
    if (disabled) return 'disabled';
    // Only use explicit variant if it's not 'default'
    if (variant && variant !== 'default') return variant;
    // Auto-determine variant based on state
    if (isFocused && inputValue.length > 0) return 'typing';
    if (isFocused) return 'active';
    if (inputValue.length > 0) return 'textEntered';
    return 'default';
  };

  const currentVariant = getCurrentVariant();

  const handleChangeText = (text: string) => {
    setInputValue(text);
    onChangeText?.(text);
  };

  const handleFocus = (e: any) => {
    console.log('SearchBar focused');
    if (!disabled) {
      setIsFocused(true);
      // Call the original onFocus if provided
      if (textInputProps.onFocus) {
        textInputProps.onFocus(e);
      }
    }
  };

  const handleBlur = (e: any) => {
    console.log('SearchBar blurred');
    setIsFocused(false);
    setShowCursor(true); // Reset cursor visibility
    // Call the original onBlur if provided
    if (textInputProps.onBlur) {
      textInputProps.onBlur(e);
    }
  };

  const getContainerStyle = () => {
    const baseStyle = [styles.container];
    
    switch (currentVariant) {
      case 'active':
        return [...baseStyle, styles.activeContainer];
      case 'disabled':
        return [...baseStyle, styles.disabledContainer];
      case 'typing':
        return [...baseStyle, styles.typingContainer];
      case 'textEntered':
        return [...baseStyle, styles.textEnteredContainer];
      default:
        return [...baseStyle, styles.defaultContainer];
    }
  };

  const getTextStyle = () => {
    switch (currentVariant) {
      case 'active':
        return styles.activeText;
      case 'disabled':
        return styles.disabledText;
      case 'textEntered':
        return styles.textEnteredText;
      case 'typing':
        return styles.typingText;
      default:
        return styles.defaultText;
    }
  };

  const getPlaceholderColor = () => {
    switch (currentVariant) {
      case 'disabled':
        return 'rgba(60, 60, 67, 0.3)';
      case 'active':
        return 'rgba(60, 60, 67, 0.6)';
      default:
        return 'rgba(60, 60, 67, 0.6)';
    }
  };

  const handleContainerPress = () => {
    console.log('Container pressed, disabled:', disabled);
    if (!disabled && textInputRef.current) {
      console.log('Focusing TextInput');
      textInputRef.current.focus();
    }
  };

  return (
    <TouchableWithoutFeedback onPress={handleContainerPress}>
      <View style={getContainerStyle()}>
        <View style={styles.iconContainer}>
          {React.isValidElement(iconSource) ? (
            iconSource
          ) : (
            <Image 
              source={iconSource || { uri: 'https://picsum.photos/id/18/18' }} 
              style={styles.icon}
            />
          )}
        </View>
        <View style={styles.inputContainer}>
          <TextInput
            ref={textInputRef}
            style={[styles.textInput, getTextStyle()]}
            placeholder={placeholder}
            placeholderTextColor={getPlaceholderColor()}
            value={inputValue}
            onChangeText={handleChangeText}
            onFocus={handleFocus}
            onBlur={handleBlur}
            editable={!disabled}
            selectTextOnFocus={false}
            returnKeyType="search"
            clearButtonMode="never"
            autoCorrect={false}
            autoCapitalize="none"
            blurOnSubmit={false}
            {...textInputProps}
          />
          {currentVariant === 'active' && inputValue.length === 0 && (
            <Text style={styles.activeCursor}>|</Text>
          )}
          {currentVariant === 'typing' && inputValue.length > 0 && showCursor && (
            <Text style={styles.typingCursor}>|</Text>
          )}
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: 38,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 15,
    backgroundColor: '#F2F2F7',
    borderRadius: 25,
    borderWidth: 1,
    gap: 12,
  },
  defaultContainer: {
    borderColor: 'rgba(60, 60, 67, 0.6)',
  },
  activeContainer: {
    borderColor: '#3770FF',
    shadowColor: 'rgba(55, 112, 255, 0.3)',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 0,
  },
  disabledContainer: {
    borderColor: 'rgba(60, 60, 67, 0.3)',
  },
  textEnteredContainer: {
    borderColor: 'rgba(60, 60, 67, 0.6)',
  },
  typingContainer: {
    borderColor: '#3770FF',
    shadowColor: 'rgba(55, 112, 255, 0.3)',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 0,
  },
  iconContainer: {
    width: 18,
    height: 18,
  },
  icon: {
    width: 18,
    height: 18,
  },
  inputContainer: {
    flex: 1,
    position: 'relative',
    justifyContent: 'center',
  },
  textInput: {
    flex: 1,
    fontSize: 12,
    fontFamily: 'Inter',
    padding: 0,
    margin: 0,
    height: '100%',
    // Ensure the input is focusable
    minHeight: 18,
  },
  defaultText: {
    color: 'rgba(60, 60, 67, 0.6)',
  },
  activeText: {
    color: '#007AFF',
  },
  disabledText: {
    color: 'rgba(60, 60, 67, 0.3)',
  },
  textEnteredText: {
    color: '#000000',
  },
  typingText: {
    color: '#000000',
  },
  activeCursor: {
    position: 'absolute',
    left: 0,
    color: '#007AFF',
    fontSize: 12,
    fontFamily: 'Inter',
  },
  typingCursor: {
    position: 'absolute',
    right: -8,
    color: '#007AFF',
    fontSize: 12,
    fontFamily: 'Inter',
  },
});

export default SearchBar;