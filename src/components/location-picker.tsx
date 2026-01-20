'use client';

import { useState, useCallback, useRef } from 'react';
import { GoogleMap, useJsApiLoader, Marker, StandaloneSearchBox } from '@react-google-maps/api';
import { MapPin, Search } from 'lucide-react';

const libraries: ("places")[] = ["places"];

interface LocationPickerProps {
    onLocationSelect: (lat: number, lng: number, address?: string) => void;
    initialLat?: number;
    initialLng?: number;
}

export default function LocationPicker({ onLocationSelect, initialLat, initialLng }: LocationPickerProps) {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';

    const { isLoaded, loadError } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: apiKey,
        libraries
    });

    // Default to Seoul
    const [center, setCenter] = useState({
        lat: initialLat || 37.5665,
        lng: initialLng || 126.9780
    });

    const [marker, setMarker] = useState<{ lat: number, lng: number } | null>(
        initialLat && initialLng ? { lat: initialLat, lng: initialLng } : null
    );

    const [map, setMap] = useState<google.maps.Map | null>(null);
    const searchBoxRef = useRef<google.maps.places.SearchBox | null>(null);

    const onLoad = useCallback(function callback(map: google.maps.Map) {
        setMap(map);
    }, []);

    const onUnmount = useCallback(function callback(map: google.maps.Map) {
        setMap(null);
    }, []);

    const onMapClick = useCallback((e: google.maps.MapMouseEvent) => {
        if (e.latLng) {
            const lat = e.latLng.lat();
            const lng = e.latLng.lng();
            setMarker({ lat, lng });
            onLocationSelect(lat, lng);
        }
    }, [onLocationSelect]);

    const onPlacesChanged = () => {
        if (searchBoxRef.current) {
            const places = searchBoxRef.current.getPlaces();
            if (places && places.length > 0) {
                const place = places[0];
                if (place.geometry && place.geometry.location) {
                    const lat = place.geometry.location.lat();
                    const lng = place.geometry.location.lng();

                    setCenter({ lat, lng });
                    setMarker({ lat, lng });
                    onLocationSelect(lat, lng, place.name || place.formatted_address);

                    // Optional: Pan map
                    map?.panTo({ lat, lng });
                    map?.setZoom(15);
                }
            }
        }
    };

    const onLoadSearchBox = (ref: google.maps.places.SearchBox) => {
        searchBoxRef.current = ref;
    };

    if (!apiKey) {
        return <div className="w-full h-64 bg-gray-900 rounded-xl flex items-center justify-center text-red-500 text-sm p-4 text-center border border-red-900/50">
            Google Maps API Key Missing.<br />Please check .env.local
        </div>;
    }

    if (loadError) {
        return <div className="w-full h-64 bg-gray-900 rounded-xl flex items-center justify-center text-red-500 text-sm p-4 text-center border border-red-900/50">
            Map Load Error: {loadError.message}
        </div>;
    }

    if (!isLoaded) return <div className="w-full h-64 bg-gray-900 rounded-xl animate-pulse flex items-center justify-center text-gray-500">Loading Map...</div>;

    return (
        <div className="space-y-3">
            <div className="relative">
                <StandaloneSearchBox
                    onLoad={onLoadSearchBox}
                    onPlacesChanged={onPlacesChanged}
                >
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search location (e.g. Gangnam Station)"
                            className="w-full bg-gray-900 border border-gray-800 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:border-neon-green"
                        />
                        <Search className="absolute left-3 top-3.5 text-gray-500" size={18} />
                    </div>
                </StandaloneSearchBox>
            </div>

            <div className="w-full h-64 rounded-xl overflow-hidden border border-gray-800 relative">
                <GoogleMap
                    mapContainerStyle={{ width: '100%', height: '100%' }}
                    center={center}
                    zoom={13}
                    onLoad={onLoad}
                    onUnmount={onUnmount}
                    onClick={onMapClick}
                    options={{
                        disableDefaultUI: true,
                        zoomControl: true,
                        styles: [
                            { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
                            { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
                            { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
                            // Add more dark mode styles if needed
                        ]
                    }}
                >
                    {marker && <Marker position={marker} />}
                </GoogleMap>
                {!marker && (
                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/60 px-3 py-1 rounded-full text-xs text-white backdrop-blur-sm pointer-events-none">
                        Tap map to select
                    </div>
                )}
            </div>
            {marker && (
                <div className="text-xs text-neon-green flex items-center gap-1">
                    <MapPin size={12} /> Selected: {marker.lat.toFixed(4)}, {marker.lng.toFixed(4)}
                </div>
            )}
        </div>
    );
}
