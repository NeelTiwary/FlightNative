import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Linking,
  Alert,
  Dimensions,
  Modal,
  SafeAreaView,
  Animated
} from 'react-native';
import * as Location from 'expo-location';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import { BACKEND_URL } from '@env';

const { width, height } = Dimensions.get('window');

const ActivitiesScreen = () => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [location, setLocation] = useState(null);
  const [usingDefaultLocation, setUsingDefaultLocation] = useState(false);
  const [mapVisible, setMapVisible] = useState(false);
  const [mapReady, setMapReady] = useState(false);
  const mapRef = useRef(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Default coordinates for testing (Barcelona)
  const DEFAULT_COORDINATES = {
    latitude: 41.397158,
    longitude: 2.160873
  };

  useEffect(() => {
    if (mapVisible) {
      // Fade in the legend when map becomes visible
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();
    } else {
      fadeAnim.setValue(0);
      setMapReady(false);
    }
  }, [mapVisible]);

  const fetchActivities = async (coords, isRefreshing = false) => {
    try {
      const response = await fetch(
        `${BACKEND_URL}/activities?latitude=${coords.latitude}&longitude=${coords.longitude}&radius=1`
      );
      
      if (!response.ok) throw new Error('Failed to fetch activities');
      
      const data = await response.json();
      setActivities(data);
      setError(null);
      
      // If no activities found with user location, try default location
      if (data.length === 0 && !usingDefaultLocation) {
        setUsingDefaultLocation(true);
        fetchActivities(DEFAULT_COORDINATES, isRefreshing);
        return;
      }
    } catch (err) {
      setError(err.message);
      
      // If error occurs and we haven't tried default location yet
      if (!usingDefaultLocation) {
        setUsingDefaultLocation(true);
        fetchActivities(DEFAULT_COORDINATES, isRefreshing);
      } else {
        Alert.alert('Error', err.message);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchLocationAndActivities = async (isRefreshing = false) => {
    try {
      if (isRefreshing) setRefreshing(true);
      else setLoading(true);

      setUsingDefaultLocation(false);

      // Request location permission
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setError('Location permission denied');
        // Use default location if permission denied
        setUsingDefaultLocation(true);
        fetchActivities(DEFAULT_COORDINATES, isRefreshing);
        return;
      }

      // Get current location
      let location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High
      });
      setLocation(location.coords);
      
      // Fetch activities with user's location
      fetchActivities(location.coords, isRefreshing);
    } catch (err) {
      setError(err.message);
      // Use default location if getting location fails
      setUsingDefaultLocation(true);
      fetchActivities(DEFAULT_COORDINATES, isRefreshing);
    }
  };

  useEffect(() => {
    fetchLocationAndActivities();
  }, []);

  const handleRefresh = () => {
    fetchLocationAndActivities(true);
  };

  const handleBookNow = (bookingLink) => {
    Linking.openURL(bookingLink).catch(err => 
      Alert.alert('Error', 'Could not open booking link')
    );
  };

  const stripHtmlTags = (html) => {
    return html ? html.replace(/<[^>]*>/g, '') : 'No description available';
  };

  const getInitialRegion = () => {
    // Start with a wider view to ensure all markers are visible
    return {
      latitude: 41.397158,
      longitude: 2.160873,
      latitudeDelta: 0.2,
      longitudeDelta: 0.2,
    };
  };

  const focusOnLocation = (coords, zoomLevel = 0.01) => {
    if (mapRef.current && coords) {
      mapRef.current.animateToRegion({
        latitude: coords.latitude,
        longitude: coords.longitude,
        latitudeDelta: zoomLevel,
        longitudeDelta: zoomLevel,
      }, 1000);
    }
  };

  const focusOnUserLocation = () => {
    if (location) {
      focusOnLocation(location, 0.005);
    }
  };

  const focusOnActivities = () => {
    if (activities.length > 0) {
      // Calculate bounds to fit all activities
      const coordinates = activities.map(activity => ({
        latitude: parseFloat(activity.geoCode.latitude),
        longitude: parseFloat(activity.geoCode.longitude)
      }));
      
      // Add user location if available
      if (location) {
        coordinates.push({
          latitude: location.latitude,
          longitude: location.longitude
        });
      }
      
      // Fit map to all coordinates
      if (mapRef.current) {
        mapRef.current.fitToCoordinates(coordinates, {
          edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
          animated: true,
        });
      }
    }
  };

  const focusOnDefaultLocation = () => {
    focusOnLocation(DEFAULT_COORDINATES, 0.01);
  };

  const handleMapReady = () => {
    setMapReady(true);
    // Once the map is ready, adjust the view to show all markers
    setTimeout(() => {
      if (activities.length > 0 || location) {
        focusOnActivities();
      } else if (usingDefaultLocation) {
        focusOnDefaultLocation();
      }
    }, 500);
  };

  const renderActivityItem = ({ item }) => (
    <View style={styles.card}>
      {item.pictures && item.pictures.length > 0 && (
        <Image 
          source={{ uri: item.pictures[0] }} 
          style={styles.image}
          resizeMode="cover"
        />
      )}
      
      <View style={styles.content}>
        <Text style={styles.name}>{item.name}</Text>
        
        {item.shortDescription && (
          <Text style={styles.shortDescription}>{item.shortDescription}</Text>
        )}
        
        <Text style={styles.description} numberOfLines={3}>
          {stripHtmlTags(item.description)}
        </Text>
        
        <View style={styles.footer}>
          <View style={styles.priceContainer}>
            <Text style={styles.price}>
              {item.price.amount} {item.price.currencyCode}
            </Text>
          </View>
          
          <TouchableOpacity 
            style={styles.bookButton}
            onPress={() => handleBookNow(item.bookingLink)}
          >
            <Text style={styles.bookButtonText}>Book Now</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const renderMapModal = () => (
    <Modal
      visible={mapVisible}
      animationType="slide"
      onRequestClose={() => setMapVisible(false)}
    >
      <SafeAreaView style={styles.mapContainer}>
        <View style={styles.mapHeader}>
          <Text style={styles.mapTitle}>Activity Locations</Text>
          <TouchableOpacity 
            style={styles.closeButton}
            onPress={() => setMapVisible(false)}
          >
            <Ionicons name="close" size={24} color="#000" />
          </TouchableOpacity>
        </View>
        
        <MapView
          ref={mapRef}
          style={styles.map}
          provider={PROVIDER_GOOGLE}
          initialRegion={getInitialRegion()}
          showsUserLocation={true}
          showsMyLocationButton={true}
          showsCompass={true}
          toolbarEnabled={true}
          onMapReady={handleMapReady}
          onLayout={handleMapReady}
        >
          {/* User location marker */}
          {location && (
            <Marker
              coordinate={{
                latitude: location.latitude,
                longitude: location.longitude
              }}
              title="Your Location"
              description="You are here"
              onPress={() => focusOnUserLocation()}
            >
              <View style={styles.userMarker}>
                <Ionicons name="person" size={20} color="white" />
              </View>
            </Marker>
          )}
          
          {/* Activity markers */}
          {activities.map(activity => (
            <Marker
              key={activity.id}
              coordinate={{
                latitude: parseFloat(activity.geoCode.latitude),
                longitude: parseFloat(activity.geoCode.longitude)
              }}
              title={activity.name}
              description={activity.shortDescription || stripHtmlTags(activity.description).substring(0, 100)}
              onPress={() => focusOnLocation({
                latitude: parseFloat(activity.geoCode.latitude),
                longitude: parseFloat(activity.geoCode.longitude)
              }, 0.005)}
            >
              <View style={styles.activityMarker}>
                <Ionicons name="location" size={20} color="white" />
              </View>
            </Marker>
          ))}
          
          {/* Default location marker if using default */}
          {usingDefaultLocation && (
            <Marker
              coordinate={DEFAULT_COORDINATES}
              title="Default Location"
              description="Using default location for testing"
              onPress={() => focusOnDefaultLocation()}
            >
              <View style={styles.defaultMarker}>
                <Ionicons name="pin" size={20} color="white" />
              </View>
            </Marker>
          )}
        </MapView>
        
        <Animated.View style={[styles.mapLegend, { opacity: fadeAnim }]}>
          {location && (
            <TouchableOpacity 
              style={styles.legendItem} 
              onPress={focusOnUserLocation}
            >
              <View style={[styles.markerPreview, styles.userMarker]} />
              <Text style={styles.legendText}>Your Location</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity 
            style={styles.legendItem}
            onPress={focusOnActivities}
            disabled={activities.length === 0}
          >
            <View style={[styles.markerPreview, styles.activityMarker]} />
            <Text style={[styles.legendText, activities.length === 0 && styles.disabledText]}>
              Activities {activities.length > 0 && `(${activities.length})`}
            </Text>
          </TouchableOpacity>
          {usingDefaultLocation && (
            <TouchableOpacity 
              style={styles.legendItem}
              onPress={focusOnDefaultLocation}
            >
              <View style={[styles.markerPreview, styles.defaultMarker]} />
              <Text style={styles.legendText}>Default Location</Text>
            </TouchableOpacity>
          )}
        </Animated.View>
      </SafeAreaView>
    </Modal>
  );

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Finding activities near you...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Nearby Activities</Text>
        {location && (
          <Text style={styles.locationText}>
            Location: {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
            {usingDefaultLocation && ' (Using default location)'}
          </Text>
        )}
        {usingDefaultLocation && !location && (
          <Text style={styles.locationText}>
            Using default location for testing
          </Text>
        )}
      </View>

      <FlatList
        data={activities}
        renderItem={renderActivityItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={['#007AFF']}
          />
        }
        ListEmptyComponent={
          <View style={styles.centerContainer}>
            <Text style={styles.emptyText}>No activities found</Text>
            <TouchableOpacity 
              style={styles.retryButton}
              onPress={fetchLocationAndActivities}
            >
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        }
      />
      
      {/* Floating Action Button */}
      <TouchableOpacity 
        style={styles.fab}
        onPress={() => setMapVisible(true)}
      >
        <Ionicons name="map" size={24} color="white" />
      </TouchableOpacity>
      
      {renderMapModal()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  locationText: {
    color: '#666',
    fontSize: 12,
  },
  listContent: {
    padding: 16,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: 200,
  },
  content: {
    padding: 16,
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  shortDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    fontStyle: 'italic',
  },
  description: {
    fontSize: 14,
    color: '#333',
    marginBottom: 12,
    lineHeight: 20,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceContainer: {
    flex: 1,
  },
  price: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  bookButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  bookButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  errorText: {
    fontSize: 16,
    color: 'red',
    marginBottom: 16,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  retryButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  mapContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  mapHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  mapTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 4,
  },
  map: {
    flex: 1,
  },
  userMarker: {
    backgroundColor: '#007AFF',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 4,
  },
  activityMarker: {
    backgroundColor: '#FF9500',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 4,
  },
  defaultMarker: {
    backgroundColor: '#FF3B30',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 4,
  },
  mapLegend: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    backgroundColor: 'white',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 8,
    backgroundColor: '#f8f8f8',
  },
  markerPreview: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 8,
  },
  legendText: {
    fontSize: 12,
    color: '#333',
    fontWeight: '500',
  },
  disabledText: {
    color: '#999',
  },
});

export default ActivitiesScreen;