import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ImageSourcePropType,
} from 'react-native';
import Chip from './Chip';
import { PickupMethod } from '@/lib/supabase';
import { Ionicons } from '@expo/vector-icons';

interface CardProps {
  // Required props
  title: string;
  price?: string;

  // Configuration props
  cta?: boolean;
  hasImage?: boolean;
  orientation?: 'vertical' | 'horizontal';
  description?: boolean;
  topRightIconName?: keyof typeof Ionicons.glyphMap;
  isTopRightIconActive?: boolean;

  // Content props
  descriptionText?: string;
  imageSource?: ImageSourcePropType;
  location?: string;
  pickupMethod?: PickupMethod;
  ctaText?: string;

  // Callback props
  onPress?: () => void;
  onCtaPress?: () => void;
  onTopRightIconPress?: () => void;
}

const Card: React.FC<CardProps> = ({
  title,
  price,
  cta = false,
  hasImage = false,
  orientation = 'vertical',
  description = false,
  topRightIconName,
  isTopRightIconActive = false,
  descriptionText = '',
  imageSource,
  location = 'Islamabad, Pakistan',
  pickupMethod = 'renter_pickup',
  ctaText = 'View details',
  onPress,
  onCtaPress,
  onTopRightIconPress,
}) => {
  const isHorizontal = orientation === 'horizontal';

  // Dynamic styles based on orientation
  const containerStyle = [
    styles.container,
    isHorizontal ? styles.horizontalContainer : styles.verticalContainer,
  ];

  const imageStyle = [
    styles.image,
    isHorizontal ? styles.horizontalImage : styles.verticalImage,
  ];

  const contentStyle = [
    styles.content,
    isHorizontal && styles.horizontalContent,
  ];

  // Text sizes based on orientation
  const titleSize = isHorizontal ? 15 : 20;
  const priceSize = isHorizontal ? 8 : 12;
  const descSize = isHorizontal ? 11 : 12;
  const ctaSize = isHorizontal ? 11 : 15;

  // Padding for tags and CTA based on orientation
  const tagPadding = isHorizontal
    ? { paddingVertical: 2, paddingHorizontal: 7 }
    : { paddingVertical: 4, paddingHorizontal: 12 };

  const ctaPadding = isHorizontal
    ? { paddingHorizontal: 10, paddingVertical: 6 }
    : { paddingHorizontal: 10, paddingVertical: 10 };

  const renderTopRightIcon = () => {
    if (!topRightIconName) return null;

    return (
      <TouchableOpacity
        style={[
          styles.topRightIconContainer,
          isHorizontal && styles.topLeftIconContainer,
        ]}
        onPress={onTopRightIconPress}
        activeOpacity={0.7}
      >
        <Ionicons
          name={topRightIconName}
          size={24}
          color={isTopRightIconActive ? '#FF3B30' : '#000000'}
        />
      </TouchableOpacity>
    );
  };

  const renderImage = () => {
    if (!hasImage || !imageSource) return null;

    return (
      <Image
        source={imageSource}
        style={imageStyle}
        resizeMode="cover"
      />
    );
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <Text
        style={[styles.title, { fontSize: titleSize }]}
        numberOfLines={isHorizontal ? 2 : 1}
      >
        {title}
      </Text>
      {price && (
        <View style={[styles.priceContainer, tagPadding]}>
          <Text style={[styles.priceText, { fontSize: priceSize }]}>
            {price}
          </Text>
        </View>
      )}
    </View>
  );

  const renderDescription = () => {
    if (!description || !descriptionText) return null;

    return (
      <View style={styles.descriptionContainer}>
        <Text
          style={[styles.descriptionText, { fontSize: descSize }]}
          numberOfLines={isHorizontal ? 2 : 3}
        >
          {descriptionText}
        </Text>
      </View>
    );
  };

  const renderAdditionalInfo = () => (
    <View style={styles.additionalInfoContainer}>
      {location && <Chip text={location} />}
      {pickupMethod && <Chip text={pickupMethod.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())} />}
    </View>
  );

  const renderCTA = () => {
    if (!cta) return null;

    return (
      <TouchableOpacity
        style={[
          styles.ctaButton,
          ctaPadding,
          isHorizontal && styles.horizontalCta
        ]}
        onPress={onCtaPress}
        activeOpacity={0.8}
      >
        <Text style={[styles.ctaText, { fontSize: ctaSize }]}>
          {ctaText}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <TouchableOpacity
      style={containerStyle}
      onPress={onPress}
      activeOpacity={onPress ? 0.95 : 1}
    >
      {renderTopRightIcon()}
      {hasImage && renderImage()}

      <View style={contentStyle}>
        {renderHeader()}
        {renderDescription()}
        {renderAdditionalInfo()}
        {renderCTA()}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 21,
    overflow: 'hidden',
    elevation: 4,
  },
  verticalContainer: {
    width: 369,
    minHeight: 200, // Dynamic height based on content
  },
  horizontalContainer: {
    width: 369,
    height: 163,
    flexDirection: 'row',
  },
  topRightIconContainer: {
    position: 'absolute',
    top: 12,
    right: 12,
    zIndex: 1,
    padding: 6,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
  },
  topLeftIconContainer: {
    right: 'auto',
    left: 12,
  },
  image: {
    backgroundColor: '#F0F0F0',
  },
  verticalImage: {
    width: '100%',
    height: 200,
  },
  horizontalImage: {
    width: 163,
    height: '100%',
  },
  content: {
    padding: 12,
    gap: 9,
  },
  horizontalContent: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    flex: 1,
    color: '#000000',
    fontWeight: '600',
  },
  priceContainer: {
    backgroundColor: 'rgba(52, 199, 89, 0.2)',
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  priceText: {
    color: '#34C759',
  },
  descriptionContainer: {
    alignSelf: 'stretch',
  },
  descriptionText: {
    color: 'rgba(38, 60, 58, 0.61)',
    lineHeight: 16,
  },
  additionalInfoContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  ctaButton: {
    backgroundColor: '#3770FF',
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'stretch',
  },
  horizontalCta: {
    height: 26,
  },
  ctaText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
});

export default Card;
