// Resource Card Component with Map Integration

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  useWindowDimensions,
  Animated,
} from 'react-native';
import MapView, { Marker, Region } from 'react-native-maps';
import { ResourceCardProps } from '../types/components';
import { UI_CONFIG, MAP_CONFIG, PERFORMANCE_CONFIG } from '../config/app.config';

export const ResourceCard: React.FC<ResourceCardProps> = ({
  resource,
  userLocation,
  onClose,
}) => {
  const { height: screenHeight } = useWindowDimensions();
  const [slideAnim] = useState(new Animated.Value(-500));

  // Slide-in animation
  useEffect(() => {
    if (PERFORMANCE_CONFIG.enableAnimations) {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: PERFORMANCE_CONFIG.animationDuration,
        useNativeDriver: true,
      }).start();
    } else {
      slideAnim.setValue(0);
    }
  }, []);

  // Calculate card height (40% of screen)
  const cardHeight = screenHeight * UI_CONFIG.resourceCardHeightPercent;
  const mapHeight = cardHeight * 0.6;
  const detailsHeight = cardHeight * 0.4;

  // Calculate map region to show both user and resource
  const getRegion = (): Region => {
    const midLat = (userLocation.latitude + resource.latitude) / 2;
    const midLng = (userLocation.longitude + resource.longitude) / 2;

    const latDelta = Math.abs(userLocation.latitude - resource.latitude) * 2.5;
    const lngDelta = Math.abs(userLocation.longitude - resource.longitude) * 2.5;

    return {
      latitude: midLat,
      longitude: midLng,
      latitudeDelta: Math.max(latDelta, 0.01),
      longitudeDelta: Math.max(lngDelta, 0.01),
    };
  };

  // Format distance for display
  const formatDistance = (meters: number): string => {
    if (meters < 1000) {
      return `${Math.round(meters)}m away`;
    }
    return `${(meters / 1000).toFixed(1)}km away`;
  };

  return (
    <Animated.View
      style={[
        styles.container,
        {
          height: cardHeight,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      {/* Map Section */}
      <View style={[styles.mapContainer, { height: mapHeight }]}>
        <MapView
          style={styles.map}
          initialRegion={getRegion()}
          pitchEnabled={false}
          rotateEnabled={false}
          scrollEnabled={true}
          zoomEnabled={true}
        >
          {/* User location marker */}
          <Marker
            coordinate={{
              latitude: userLocation.latitude,
              longitude: userLocation.longitude,
            }}
            title="You are here"
            pinColor="blue"
          />

          {/* Resource location marker */}
          <Marker
            coordinate={{
              latitude: resource.latitude,
              longitude: resource.longitude,
            }}
            title={resource.name}
            pinColor="red"
          />
        </MapView>
      </View>

      {/* Details Section */}
      <View style={[styles.detailsContainer, { height: detailsHeight }]}>
        <View style={styles.header}>
          <View style={styles.titleSection}>
            <Text style={styles.name} numberOfLines={1}>
              {resource.name}
            </Text>
            <Text style={styles.type}>{resource.type}</Text>
          </View>
          {onClose && (
            <TouchableOpacity
              style={styles.closeButton}
              onPress={onClose}
              accessibilityLabel="Close resource card"
              accessibilityRole="button"
            >
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          )}
        </View>

        <Text style={styles.distance}>
          {formatDistance(resource.distanceMeters)}
        </Text>

        <Text style={styles.address} numberOfLines={2}>
          {resource.address}
        </Text>

        {/* Display metadata if available */}
        {resource.metadata && Object.keys(resource.metadata).length > 0 && (
          <View style={styles.metadataContainer}>
            {Object.entries(resource.metadata).slice(0, 2).map(([key, value]) => (
              <Text key={key} style={styles.metadata} numberOfLines={1}>
                {key}: {String(value)}
              </Text>
            ))}
          </View>
        )}
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    marginBottom: 16,
  },
  mapContainer: {
    width: '100%',
    overflow: 'hidden',
  },
  map: {
    width: '100%',
    height: '100%',
  },
  detailsContainer: {
    padding: 16,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  titleSection: {
    flex: 1,
    marginRight: 12,
  },
  name: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  type: {
    fontSize: 14,
    color: '#6B7280',
    textTransform: 'capitalize',
  },
  distance: {
    fontSize: 16,
    fontWeight: '600',
    color: '#3B82F6',
    marginBottom: 8,
  },
  address: {
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 20,
    marginBottom: 8,
  },
  metadataContainer: {
    marginTop: 4,
  },
  metadata: {
    fontSize: 12,
    color: '#9CA3AF',
    marginBottom: 2,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    fontSize: 20,
    color: '#6B7280',
    fontWeight: '600',
  },
});
