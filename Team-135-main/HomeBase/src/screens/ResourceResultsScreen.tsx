import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { GISService } from '../services/GISService';
import { Resource } from '../types/api';

const { width, height } = Dimensions.get('window');

interface ResourceResultsScreenProps {
  userLocation: {
    latitude: number;
    longitude: number;
  };
  resourceType: 'shelter' | 'food' | 'medical' | 'hygiene' | 'other';
  onBack?: () => void;
  onTalkToSomeone?: (resource: Resource) => void;
}

export default function ResourceResultsScreen({
  userLocation,
  resourceType,
  onBack,
  onTalkToSomeone,
}: ResourceResultsScreenProps) {
  const [resources, setResources] = useState<Resource[]>([]);
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadResources();
  }, [resourceType, userLocation]);

  const loadResources = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log(`Loading ${resourceType} resources near`, userLocation);
      const results = await GISService.lookupResources(
        userLocation.latitude,
        userLocation.longitude,
        resourceType
      );
      setResources(results);
      if (results.length > 0) {
        setSelectedResource(results[0]);
      }
    } catch (err: any) {
      console.error('Failed to load resources:', err);
      setError(err.error || 'Failed to load resources. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getMarkerColor = (type: string) => {
    const lowerType = type.toLowerCase();
    if (lowerType.includes('shelter')) return '#8B5CF6'; // Purple
    if (lowerType.includes('food')) return '#EC4899'; // Pink
    if (lowerType.includes('medical') || lowerType.includes('health')) return '#3B82F6'; // Blue
    if (lowerType.includes('hygiene') || lowerType.includes('shower')) return '#10B981'; // Green
    return '#6B7280'; // Gray
  };

  const getTypeIcon = (type: string) => {
    const lowerType = type.toLowerCase();
    if (lowerType.includes('shelter')) return '🏠';
    if (lowerType.includes('food')) return '🍽️';
    if (lowerType.includes('medical') || lowerType.includes('health')) return '🏥';
    if (lowerType.includes('hygiene') || lowerType.includes('shower')) return '🚿';
    return '📍';
  };

  const getResourceTitle = () => {
    switch (resourceType) {
      case 'shelter': return 'Shelter';
      case 'food': return 'Food';
      case 'medical': return 'Medical';
      case 'hygiene': return 'Hygiene';
      default: return 'Basic Resources';
    }
  };

  const handleTalkToSomeone = () => {
    if (selectedResource && onTalkToSomeone) {
      onTalkToSomeone(selectedResource);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <LinearGradient colors={['#1F2937', '#111827']} style={styles.gradient}>
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text style={styles.loadingText}>Finding nearby resources...</Text>
        </LinearGradient>
      </View>
    );
  }

  if (resources.length === 0 && !loading) {
    return (
      <View style={styles.container}>
        <LinearGradient colors={['#1F2937', '#111827']} style={styles.gradient}>
          <Text style={styles.noResultsText}>
            {error || 'No resources found nearby'}
          </Text>
          <Text style={styles.noResultsSubtext}>
            Try adjusting your search or check back later
          </Text>
          {onBack && (
            <TouchableOpacity style={styles.backButton} onPress={onBack}>
              <Text style={styles.backButtonText}>← Go Back</Text>
            </TouchableOpacity>
          )}
        </LinearGradient>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient colors={['#1F2937', '#111827']} style={styles.header}>
        {onBack && (
          <TouchableOpacity style={styles.backBtn} onPress={onBack}>
            <Text style={styles.backBtnText}>←</Text>
          </TouchableOpacity>
        )}
        <Text style={styles.headerTitle}>{getResourceTitle()}</Text>
        <Text style={styles.headerSubtitle}>{resources.length} found nearby</Text>
      </LinearGradient>

      {/* Map */}
      <MapView
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        initialRegion={{
          latitude: userLocation.latitude,
          longitude: userLocation.longitude,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
        showsUserLocation
        showsMyLocationButton
      >
        {resources.map((resource, index) => (
          <Marker
            key={resource.name + index}
            coordinate={{
              latitude: resource.latitude,
              longitude: resource.longitude,
            }}
            pinColor={getMarkerColor(resource.type)}
            onPress={() => setSelectedResource(resource)}
          />
        ))}
      </MapView>

      {/* Selected Resource Card */}
      {selectedResource && (
        <View style={styles.cardContainer}>
          <LinearGradient
            colors={['rgba(31, 41, 55, 0.98)', 'rgba(17, 24, 39, 0.98)']}
            style={styles.card}
          >
            {/* Resource Header */}
            <View style={styles.cardHeader}>
              <View style={styles.cardTitleRow}>
                <Text style={styles.cardTitle}>{selectedResource.name || 'Resource'}</Text>
                {selectedResource.metadata?.pet_friendly && (
                  <View style={styles.petBadge}>
                    <Text style={styles.petBadgeText}>🐾 Pet-friendly</Text>
                  </View>
                )}
              </View>
              
              <View style={styles.statusRow}>
                <View style={styles.verifiedBadge}>
                  <Text style={styles.verifiedText}>✓ Verified Today</Text>
                </View>
                <Text style={styles.openStatus}>
                  {selectedResource.metadata?.status === 'Open' ? '🟢 Open' : '🔴 Closed'}
                  {selectedResource.metadata?.hours && ` until ${selectedResource.metadata.hours}`}
                </Text>
              </View>
            </View>

            {/* Distance */}
            <View style={styles.distanceContainer}>
              <Text style={styles.distanceText}>
                📍 Walk {(selectedResource.distanceMeters / 1609.34).toFixed(1)} miles
              </Text>
              <Text style={styles.addressText}>{selectedResource.address}</Text>
            </View>

            {/* Contact */}
            {selectedResource.metadata?.phone && (
              <TouchableOpacity style={styles.contactButton}>
                <Text style={styles.contactButtonText}>
                  📞 {selectedResource.metadata.phone}
                </Text>
              </TouchableOpacity>
            )}

            {/* Action Button */}
            <TouchableOpacity style={styles.actionButton} onPress={handleTalkToSomeone}>
              <LinearGradient
                colors={['#3B82F6', '#2563EB']}
                style={styles.actionButtonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Text style={styles.actionButtonIcon}>🎤</Text>
                <Text style={styles.actionButtonText}>Talk to someone</Text>
              </LinearGradient>
            </TouchableOpacity>

            {/* Other Resources List */}
            {resources.length > 1 && (
              <View style={styles.otherResourcesContainer}>
                <Text style={styles.otherResourcesTitle}>Other nearby options:</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {resources.slice(1, 4).map((resource, index) => (
                    <TouchableOpacity
                      key={resource.name + index}
                      style={styles.miniCard}
                      onPress={() => setSelectedResource(resource)}
                    >
                      <Text style={styles.miniCardIcon}>{getTypeIcon(resource.type)}</Text>
                      <Text style={styles.miniCardName} numberOfLines={2}>
                        {resource.name || 'Resource'}
                      </Text>
                      <Text style={styles.miniCardDistance}>
                        {(resource.distanceMeters / 1609.34).toFixed(1)} mi
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}
          </LinearGradient>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  gradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#fff',
    fontSize: 18,
    marginTop: 16,
    fontWeight: '600',
  },
  noResultsText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
    paddingHorizontal: 32,
  },
  noResultsSubtext: {
    color: '#9CA3AF',
    fontSize: 16,
    marginBottom: 24,
    textAlign: 'center',
    paddingHorizontal: 32,
  },
  backButton: {
    paddingHorizontal: 32,
    paddingVertical: 16,
    backgroundColor: '#3B82F6',
    borderRadius: 12,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  header: {
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    zIndex: 10,
  },
  backBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    marginBottom: 8,
  },
  backBtnText: {
    color: '#fff',
    fontSize: 28,
    fontWeight: '300',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 4,
  },
  headerSubtitle: {
    color: '#9CA3AF',
    fontSize: 16,
    fontWeight: '500',
  },
  map: {
    width: width,
    height: height * 0.45,
  },
  cardContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    maxHeight: height * 0.55,
  },
  card: {
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 10,
  },
  cardHeader: {
    marginBottom: 16,
  },
  cardTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  cardTitle: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '700',
    flex: 1,
    marginRight: 12,
  },
  petBadge: {
    backgroundColor: '#FCD34D',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  petBadgeText: {
    color: '#78350F',
    fontSize: 14,
    fontWeight: '700',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  verifiedBadge: {
    backgroundColor: '#10B981',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  verifiedText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  openStatus: {
    color: '#D1D5DB',
    fontSize: 14,
    fontWeight: '500',
  },
  distanceContainer: {
    marginBottom: 16,
  },
  distanceText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  addressText: {
    color: '#9CA3AF',
    fontSize: 14,
  },
  contactButton: {
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#3B82F6',
  },
  contactButtonText: {
    color: '#60A5FA',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  actionButton: {
    marginBottom: 20,
    borderRadius: 16,
    overflow: 'hidden',
  },
  actionButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    paddingHorizontal: 24,
    gap: 12,
  },
  actionButtonIcon: {
    fontSize: 24,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  otherResourcesContainer: {
    marginTop: 8,
  },
  otherResourcesTitle: {
    color: '#9CA3AF',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
  },
  miniCard: {
    backgroundColor: 'rgba(55, 65, 81, 0.8)',
    borderRadius: 16,
    padding: 16,
    marginRight: 12,
    width: 120,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(75, 85, 99, 0.5)',
  },
  miniCardIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  miniCardName: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 4,
  },
  miniCardDistance: {
    color: '#9CA3AF',
    fontSize: 12,
  },
});
