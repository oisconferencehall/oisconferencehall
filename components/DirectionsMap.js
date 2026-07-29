'use client';
import { useEffect, useRef, useState, useCallback } from 'react';
import { Navigation, Car, Footprints, MapPin, Clock, Route, Loader2, AlertCircle, X } from 'lucide-react';
import { useApp } from '@/context/AppContext';

const SCHOOL_LAT = 39.6697673;
const SCHOOL_LNG = 66.9681312;
const SCHOOL_NAME = 'Oxford International School';

const LEAFLET_CSS = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
const LEAFLET_JS = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';

function loadResource(type, src) {
  return new Promise((resolve, reject) => {
    if (type === 'css') {
      if (document.querySelector(`link[href="${src}"]`)) return resolve();
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = src;
      link.onload = resolve;
      link.onerror = reject;
      document.head.appendChild(link);
    } else {
      if (window.L) return resolve();
      if (document.querySelector(`script[src="${src}"]`)) {
        const check = setInterval(() => {
          if (window.L) { clearInterval(check); resolve(); }
        }, 50);
        return;
      }
      const script = document.createElement('script');
      script.src = src;
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    }
  });
}

export default function DirectionsMap() {
  const { t, lang } = useApp();
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const routeLayerRef = useRef(null);
  const userMarkerRef = useRef(null);

  const [leafletReady, setLeafletReady] = useState(false);
  const [mode, setMode] = useState('driving');
  const [routeInfo, setRouteInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [directionsActive, setDirectionsActive] = useState(false);
  const userCoordsRef = useRef(null);

  const labels = t.contactsSection || {};

  // Load Leaflet
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        await loadResource('css', LEAFLET_CSS);
        await loadResource('js', LEAFLET_JS);
        if (!cancelled) setLeafletReady(true);
      } catch {
        if (!cancelled) setError(labels.locationError || 'Failed to load map');
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // Initialize map
  useEffect(() => {
    if (!leafletReady || !mapContainerRef.current || mapRef.current) return;
    const L = window.L;

    const map = L.map(mapContainerRef.current, {
      center: [SCHOOL_LAT, SCHOOL_LNG],
      zoom: 16,
      zoomControl: false,
      attributionControl: true,
    });

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(map);

    // School marker
    const schoolIcon = L.divIcon({
      className: 'school-marker-icon',
      html: `<div style="
        width: 44px; height: 44px; border-radius: 50%;
        background: linear-gradient(135deg, #FFDD00, #f59e0b);
        border: 3px solid #fff;
        box-shadow: 0 4px 14px rgba(255, 221, 0, 0.5), 0 0 0 4px rgba(255, 221, 0, 0.2);
        display: flex; align-items: center; justify-content: center;
        font-size: 20px; color: #000; font-weight: 900;
      ">🏫</div>`,
      iconSize: [44, 44],
      iconAnchor: [22, 22],
      popupAnchor: [0, -26],
    });

    L.marker([SCHOOL_LAT, SCHOOL_LNG], { icon: schoolIcon })
      .addTo(map)
      .bindPopup(`<div style="font-weight:700; font-size:14px; text-align:center; padding:4px 8px;">${SCHOOL_NAME}</div>`, {
        closeButton: false,
        className: 'school-popup',
      })
      .openPopup();

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [leafletReady]);

  // Fetch route from OSRM
  const fetchRoute = useCallback(async (userLat, userLng, travelMode) => {
    const profile = travelMode === 'walking' ? 'foot' : 'car';
    const url = `https://router.project-osrm.org/route/v1/${profile}/${userLng},${userLat};${SCHOOL_LNG},${SCHOOL_LAT}?overview=full&geometries=geojson&steps=true`;

    const res = await fetch(url);
    if (!res.ok) throw new Error('Routing failed');
    const data = await res.json();

    if (!data.routes || data.routes.length === 0) throw new Error('No route found');
    return data.routes[0];
  }, []);

  // Draw route on map
  const drawRoute = useCallback((route, userLat, userLng) => {
    const L = window.L;
    const map = mapRef.current;
    if (!map || !L) return;

    // Clear previous route & user marker
    if (routeLayerRef.current) {
      map.removeLayer(routeLayerRef.current);
    }
    if (userMarkerRef.current) {
      map.removeLayer(userMarkerRef.current);
    }

    // User marker (blue dot)
    const userIcon = L.divIcon({
      className: 'user-marker-icon',
      html: `<div style="
        width: 20px; height: 20px; border-radius: 50%;
        background: #3b82f6;
        border: 3px solid #fff;
        box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.3), 0 2px 8px rgba(0,0,0,0.2);
      "></div>`,
      iconSize: [20, 20],
      iconAnchor: [10, 10],
    });
    userMarkerRef.current = L.marker([userLat, userLng], { icon: userIcon }).addTo(map);

    // Route polyline
    const coords = route.geometry.coordinates.map(c => [c[1], c[0]]);
    routeLayerRef.current = L.polyline(coords, {
      color: '#3b82f6',
      weight: 5,
      opacity: 0.85,
      smoothFactor: 1.5,
      lineCap: 'round',
      lineJoin: 'round',
    }).addTo(map);

    // Fit bounds
    const bounds = L.latLngBounds([
      [userLat, userLng],
      [SCHOOL_LAT, SCHOOL_LNG],
    ]);
    map.fitBounds(bounds.pad(0.15), { animate: true, duration: 0.8 });

    // Distance & duration
    const distKm = (route.distance / 1000).toFixed(1);
    const durMin = Math.ceil(route.duration / 60);

    setRouteInfo({ distance: distKm, duration: durMin });
  }, []);

  // Get Directions handler
  const handleGetDirections = useCallback(async (travelMode) => {
    if (!navigator.geolocation) {
      setError(labels.locationError || 'Geolocation is not supported');
      return;
    }

    setLoading(true);
    setError(null);
    setRouteInfo(null);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude, longitude } = pos.coords;
          userCoordsRef.current = { latitude, longitude };
          const usedMode = travelMode || mode;
          const route = await fetchRoute(latitude, longitude, usedMode);
          drawRoute(route, latitude, longitude);
          setDirectionsActive(true);
        } catch (err) {
          setError(labels.locationError || 'Could not calculate route');
        } finally {
          setLoading(false);
        }
      },
      () => {
        setError(labels.locationError || 'Could not get your location');
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, [mode, fetchRoute, drawRoute, labels]);

  // Switch mode recalculates if directions are active
  const handleModeSwitch = useCallback(async (newMode) => {
    setMode(newMode);
    if (directionsActive && userCoordsRef.current) {
      setLoading(true);
      setError(null);
      try {
        const { latitude, longitude } = userCoordsRef.current;
        const route = await fetchRoute(latitude, longitude, newMode);
        drawRoute(route, latitude, longitude);
      } catch {
        setError(labels.locationError || 'Could not calculate route');
      } finally {
        setLoading(false);
      }
    }
  }, [directionsActive, fetchRoute, drawRoute, labels]);

  // Clear route
  const handleClear = useCallback(() => {
    const map = mapRef.current;
    if (routeLayerRef.current) map?.removeLayer(routeLayerRef.current);
    if (userMarkerRef.current) map?.removeLayer(userMarkerRef.current);
    routeLayerRef.current = null;
    userMarkerRef.current = null;
    userCoordsRef.current = null;
    setRouteInfo(null);
    setDirectionsActive(false);
    setError(null);
    map?.setView([SCHOOL_LAT, SCHOOL_LNG], 16, { animate: true });
  }, []);

  const formatDuration = (min) => {
    if (min < 60) return `${min} ${labels.minutes || 'min'}`;
    const h = Math.floor(min / 60);
    const m = min % 60;
    return m > 0 ? `${h}h ${m} ${labels.minutes || 'min'}` : `${h}h`;
  };

  return (
    <div className="directions-map-wrapper">
      {/* Map container */}
      <div
        ref={mapContainerRef}
        className="directions-map-container"
      />

      {/* Controls overlay */}
      <div className="directions-controls">
        {/* Mode toggle */}
        <div className="directions-mode-toggle">
          <button
            className={`directions-mode-btn ${mode === 'driving' ? 'active' : ''}`}
            onClick={() => handleModeSwitch('driving')}
            title={labels.driving || 'Driving'}
          >
            <Car size={16} />
            <span>{labels.driving || 'Driving'}</span>
          </button>
          <button
            className={`directions-mode-btn ${mode === 'walking' ? 'active' : ''}`}
            onClick={() => handleModeSwitch('walking')}
            title={labels.walking || 'Walking'}
          >
            <Footprints size={16} />
            <span>{labels.walking || 'Walking'}</span>
          </button>
        </div>

        {/* Get directions / Clear button */}
        {!directionsActive ? (
          <button
            className="directions-get-btn"
            onClick={() => handleGetDirections()}
            disabled={loading || !leafletReady}
          >
            {loading ? (
              <>
                <Loader2 size={18} className="directions-spin" />
                <span>{labels.locating || 'Locating...'}</span>
              </>
            ) : (
              <>
                <Navigation size={18} />
                <span>{labels.getDirections || 'Get Directions'}</span>
              </>
            )}
          </button>
        ) : (
          <button
            className="directions-clear-btn"
            onClick={handleClear}
          >
            <X size={16} />
            <span>{labels.clearRoute || 'Clear'}</span>
          </button>
        )}
      </div>

      {/* Route info badge */}
      {routeInfo && (
        <div className="directions-info-badge">
          <div className="directions-info-item">
            <Route size={15} />
            <span>{routeInfo.distance} {labels.km || 'km'}</span>
          </div>
          <div className="directions-info-divider" />
          <div className="directions-info-item">
            <Clock size={15} />
            <span>{formatDuration(routeInfo.duration)}</span>
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="directions-error">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
