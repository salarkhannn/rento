import React from 'react';
import { 
  TouchableOpacity, 
  Text, 
  View, 
  Image, 
  StyleSheet, 
  ViewStyle, 
  TextStyle,
  GestureResponderEvent
} from 'react-native';

type ButtonSize = 'small' | 'medium' | 'large';
type ButtonVariant = 'filled' | 'tinted' | 'bordered' | 'plain';
type ButtonColor = 'colored' | 'bw';

interface CustomButtonProps {
  title: string;
  size?: ButtonSize;
  variant?: ButtonVariant;
  color?: ButtonColor;
  leftIcon?: string | React.ReactNode;
  rightIcon?: string | React.ReactNode;
  onPress?: (event: GestureResponderEvent) => void;
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  testID?: string;
  accessibilityLabel?: string;
}

const CustomButton: React.FC<CustomButtonProps> = ({
  title,
  size = 'medium',
  variant = 'filled',
  color = 'colored',
  leftIcon,
  rightIcon,
  onPress,
  disabled = false,
  loading = false,
  style,
  textStyle,
  testID,
  accessibilityLabel,
}) => {
  // Color definitions
  const colors = {
    colored: {
      primary: '#3770FF',
      primaryText: '#FFFFFF',
      tintedBg: 'rgba(55,112,255,0.2)',
      tintedText: '#3770FF',
    },
    bw: {
      primary: '#000000',
      primaryText: '#FFFFFF',
      tintedBg: 'rgba(0,0,0,0.1)',
      tintedText: '#000000',
    }
  };

  const currentColors = colors[color];

  // Size configurations
  const sizeConfig = {
    small: {
      width: 88,
      height: 38,
      paddingHorizontal: 10,
      paddingVertical: 10,
      gap: 5,
      borderRadius: 50,
      fontSize: 15,
      iconSize: 18,
    },
    medium: {
      width: 136,
      height: 41,
      paddingHorizontal: 32,
      paddingVertical: 11,
      gap: 7,
      borderRadius: 10,
      fontSize: 15,
      iconSize: 20,
    },
    large: {
      width: 160,
      height: 68,
      paddingHorizontal: 32,
      paddingVertical: 11,
      gap: 7,
      borderRadius: 10,
      fontSize: 15,
      iconSize: 22,
    }
  };

  const config = sizeConfig[size];

  // Get background color based on variant
  const getBackgroundColor = (): string => {
    if (disabled) return '#F0F0F0';
    
    switch (variant) {
      case 'filled':
        return currentColors.primary;
      case 'tinted':
        return currentColors.tintedBg;
      case 'bordered':
      case 'plain':
      default:
        return 'transparent';
    }
  };

  // Get text color based on variant
  const getTextColor = (): string => {
    if (disabled) return '#A0A0A0';
    
    switch (variant) {
      case 'filled':
        return currentColors.primaryText;
      case 'tinted':
      case 'bordered':
      case 'plain':
        return currentColors.tintedText;
      default:
        return currentColors.tintedText;
    }
  };

  // Get border style
  const getBorderStyle = (): ViewStyle => {
    if (variant === 'bordered' && !disabled) {
      return {
        borderWidth: 1,
        borderColor: currentColors.primary,
      };
    }
    return {};
  };

  // Render icon (image or custom component)
  const renderIcon = (icon: string | React.ReactNode, isLeft: boolean = true): React.ReactNode => {
    if (!icon) return null;

    if (typeof icon === 'string') {
      return (
        <Image 
          source={{ uri: icon }} 
          style={[
            styles.icon, 
            { 
              width: config.iconSize, 
              height: config.iconSize,
              tintColor: variant === 'filled' ? currentColors.primaryText : currentColors.tintedText
            }
          ]} 
        />
      );
    }

    return icon;
  };

  // Render placeholder icon for medium size (based on your examples)
  const renderPlaceholderIcon = (): React.ReactNode => {
    if (size !== 'medium') return null;
    
    const borderColor = variant === 'filled' ? currentColors.primaryText : currentColors.tintedText;
    
    return (
      <View style={[
        styles.placeholderIcon,
        { 
          width: config.iconSize, 
          height: config.iconSize,
          borderColor: borderColor,
          borderWidth: 2
        }
      ]} />
    );
  };

  const buttonStyle: ViewStyle = {
    width: config.width,
    height: config.height,
    paddingHorizontal: config.paddingHorizontal,
    paddingVertical: config.paddingVertical,
    backgroundColor: getBackgroundColor(),
    borderRadius: config.borderRadius,
    opacity: disabled ? 0.6 : 1,
    ...getBorderStyle(),
  };

  const buttonTextStyle: TextStyle = {
    color: getTextColor(),
    fontSize: config.fontSize,
    fontFamily: 'SF Pro',
    fontWeight: '400',
  };

  return (
    <TouchableOpacity
      style={[styles.button, buttonStyle, style]}
      onPress={onPress}
      disabled={disabled || loading}
      testID={testID}
      accessibilityLabel={accessibilityLabel || title}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
    >
      <View style={[styles.content, { gap: config.gap }]}>
        {leftIcon && renderIcon(leftIcon, true)}
        {!leftIcon && !rightIcon && renderPlaceholderIcon()}
        
        <Text style={[buttonTextStyle, textStyle]}>
          {loading ? 'Loading...' : title}
        </Text>
        
        {rightIcon && renderIcon(rightIcon, false)}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    resizeMode: 'contain',
  },
  placeholderIcon: {
    borderRadius: 0,
  },
});

export default CustomButton;