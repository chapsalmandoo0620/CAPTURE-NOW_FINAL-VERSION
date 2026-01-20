'use client';

import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';

const libraries: ("places")[] = ["places"];

interface MapViewProps {
    lat: number;
    lng: number;
}

export default function MapView({ lat, lng }: MapViewProps) {
    const { isLoaded } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
        libraries
    });

    if (!isLoaded) return <div className="w-full h-full bg-gray-900 animate-pulse" />;

    return (
        <GoogleMap
            mapContainerStyle={{ width: '100%', height: '100%' }}
            center={{ lat, lng }}
            zoom={15}
            options={{
                disableDefaultUI: true,
                zoomControl: true,
                styles: [
                    { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
                    { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
                    { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
                ]
            }}
        >
            <Marker position={{ lat, lng }} />
        </GoogleMap>
    );
}
