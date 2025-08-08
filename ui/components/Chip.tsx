import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  ViewStyle,
  TextStyle,
  ImageStyle,
} from 'react-native';

export type ChipState = 'active' | 'default' | 'disabled' | 'focused' | 'hover' | 'pressed';

interface ChipProps {
  state?: ChipState;
  outline?: boolean;
  leadingIcon?: boolean;
  trailingIcon?: boolean;
  text?: string;
  leadingIconSource?: any | React.ReactNode;
  trailingIconSource?: any | React.ReactNode;
  onPress?: () => void;
  onPressIn?: () => void;
  onPressOut?: () => void;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

const Chip: React.FC<ChipProps> = ({
  state = 'default',
  outline = false,
  leadingIcon = false,
  trailingIcon = false,
  text = 'Text String',
  leadingIconSource,
  trailingIconSource,
  onPress,
  onPressIn,
  onPressOut,
  disabled = false,
  style,
  textStyle,
}) => {
  const [currentState, setCurrentState] = useState<ChipState>(state);

  useEffect(() => {
    setCurrentState(state);
  }, [state]);

  const handlePressIn = () => {
    if (!disabled && state === 'default') {
      setCurrentState('pressed');
    }
    onPressIn?.();
  };

  const handlePressOut = () => {
    if (!disabled && state === 'default') {
      setCurrentState('default');
    }
    onPressOut?.();
  };

  const handlePress = () => {
    if (!disabled) {
      onPress?.();
    }
  };

  const getContainerStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      height: 28,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 4,
      paddingLeft: leadingIcon ? 4 : 12,
      paddingRight: trailingIcon ? 12 : 12,
      borderRadius: 20,
      gap: 8,
    };

    // Dynamic width based on content
    let minWidth = 60;
    if (leadingIcon) minWidth += 24;
    if (trailingIcon) minWidth += 17;
    baseStyle.minWidth = minWidth;

    const effectiveState = disabled ? 'disabled' : currentState;

    // Background colors
    switch (effectiveState) {
      case 'active':
        if (outline) {
          baseStyle.backgroundColor = 'rgba(55, 112, 255, 0.2)';
          baseStyle.borderWidth = 1;
          baseStyle.borderColor = '#3770FF';
        } else {
          baseStyle.backgroundColor = 'rgba(55, 112, 255, 0.3)';
        }
        break;
      case 'pressed':
        baseStyle.backgroundColor = '#D1D1D6';
        if (outline) {
          baseStyle.borderWidth = 1;
          baseStyle.borderColor = '#C7C7CC';
        }
        // Add shadow for pressed state
        baseStyle.shadowColor = '#000';
        baseStyle.shadowOffset = { width: 0, height: 1 };
        baseStyle.shadowOpacity = 0.1;
        baseStyle.shadowRadius = 16;
        baseStyle.elevation = 8;
        break;
      case 'focused':
        baseStyle.backgroundColor = '#D1D1D6';
        if (outline) {
          baseStyle.borderWidth = 1;
          baseStyle.borderColor = '#C7C7CC';
        }
        break;
      case 'hover':
        baseStyle.backgroundColor = outline ? 'transparent' : '#E5E5EA';
        if (outline) {
          baseStyle.borderWidth = 1;
          baseStyle.borderColor = '#E5E5EA';
        }
        break;
      case 'disabled':
        baseStyle.backgroundColor = outline ? 'transparent' : '#F2F2F7';
        baseStyle.opacity = 0.5;
        if (outline) {
          baseStyle.borderWidth = 1;
          baseStyle.borderColor = '#E5E5EA';
        }
        break;
      default: // default state
        baseStyle.backgroundColor = outline ? 'transparent' : '#E5E5EA';
        if (outline) {
          baseStyle.borderWidth = 1;
          baseStyle.borderColor = '#E5E5EA';
        }
        break;
    }

    return { ...baseStyle, ...style };
  };

  const getTextStyle = (): TextStyle => {
    const baseTextStyle: TextStyle = {
      fontSize: 12,
      fontFamily: 'SF Pro',
      fontWeight: '400',
    };

    const effectiveState = disabled ? 'disabled' : currentState;

    switch (effectiveState) {
      case 'active':
        baseTextStyle.color = '#3770FF';
        break;
      case 'disabled':
        baseTextStyle.color = 'rgba(60, 60, 67, 0.3)';
        break;
      default:
        baseTextStyle.color = 'rgba(60, 60, 67, 0.6)';
        break;
    }

    return { ...baseTextStyle, ...textStyle };
  };

  const getIconOpacity = (): number => {
    return disabled ? 0.5 : 1;
  };

  return (
    <TouchableOpacity
      style={getContainerStyle()}
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
      activeOpacity={0.8}
    >
      {leadingIcon && (
        <View style={styles.leadingIconContainer}>
          {React.isValidElement(leadingIconSource) ? (
            leadingIconSource
          ) : (
            <Image
              source={leadingIconSource || { uri: 'https://picsum.photos/20/20' }}
              style={[styles.leadingIcon, { opacity: getIconOpacity() }]}
            />
          )}
        </View>
      )}
      
      <Text style={getTextStyle()}>{text}</Text>
      
      {trailingIcon && (
        <View style={styles.trailingIconContainer}>
          {React.isValidElement(trailingIconSource) ? (
            trailingIconSource
          ) : (
            <Image
              source={trailingIconSource || { uri: 'https://picsum.photos/id/13/13' }}
              style={[styles.trailingIcon, { opacity: getIconOpacity() }]}
            />
          )}
        </View>
      )}
    </TouchableOpacity>
  );
};

// Preset component variations for common use cases
export const DefaultChip: React.FC<Omit<ChipProps, 'state' | 'outline'>> = (props) => (
  <Chip {...props} state="default" outline={false} />
);

export const ActiveChip: React.FC<Omit<ChipProps, 'state' | 'outline'>> = (props) => (
  <Chip {...props} state="active" outline={false} />
);

export const OutlinedChip: React.FC<Omit<ChipProps, 'outline'>> = (props) => (
  <Chip {...props} outline={true} />
);

export const IconChip: React.FC<Omit<ChipProps, 'leadingIcon' | 'trailingIcon'>> = (props) => (
  <Chip {...props} leadingIcon={true} trailingIcon={true} />
);

const styles = StyleSheet.create({
  leadingIconContainer: {
    width: 20,
    height: 20,
    borderRadius: 10,
    overflow: 'hidden',
  },
  leadingIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
  },
  trailingIconContainer: {
    width: 13,
    height: 13,
  },
  trailingIcon: {
    width: 13,
    height: 13,
  },
});

export default Chip;