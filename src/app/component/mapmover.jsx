import { useMap } from 'react-leaflet';
import { useEffect } from 'react';

export default function MapMover({ center }) {
    const map = useMap();

    useEffect(() => {
        if (center && Array.isArray(center) && center.length === 2) {
            map.flyTo(center, 16, {
                animate: true,
                duration: 1.5
            });
        }
    }, [center, map]); // Sirf center badalne par chalega

    return null;
}