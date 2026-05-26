import 'leaflet/dist/leaflet.css';
import { MapPin } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';

interface MapPreviewProps {
    coordinates: string | null;
}

const markerIcon = L.icon({
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
});

export default function MapPreview({ coordinates }: MapPreviewProps) {
    if (!coordinates || coordinates === 'N/A' || coordinates.trim() === '') return null;

    const [latStr, lngStr] = coordinates.split(',').map(s => s.trim());
    const lat = parseFloat(latStr);
    const lng = parseFloat(lngStr);

    if (isNaN(lat) || isNaN(lng)) return null;

    return (
        <div className="w-full h-48 rounded-lg overflow-hidden border border-sidebar-border bg-neutral-200 shadow-sm">
            <MapContainer
                center={[lat, lng]}
                zoom={18}
                style={{ width: '100%', height: '100%' }}
                attributionControl={false}
            >
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    maxZoom={19}
                />
                <Marker position={[lat, lng]} icon={markerIcon}>
                    <Popup>
                        <div className="flex items-center gap-2 text-xs font-semibold">
                            <MapPin className="size-3 text-red-500" />
                            {lat.toFixed(6)}, {lng.toFixed(6)}
                        </div>
                    </Popup>
                </Marker>
            </MapContainer>
        </div>
    );
}
