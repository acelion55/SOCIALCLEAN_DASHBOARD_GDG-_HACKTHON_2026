"use client";
import { useEffect, useState } from 'react';
import { useMap, MapContainer, TileLayer, FeatureGroup, Marker, Popup, Polygon, LayersControl } from 'react-leaflet';
import { EditControl } from "react-leaflet-draw";
import { onAuthStateChanged } from 'firebase/auth';
import { deleteDoc, doc } from 'firebase/firestore';
import { collection, onSnapshot, query, where, addDoc } from 'firebase/firestore';
import 'leaflet/dist/leaflet.css';
import MapMover from "../component/mapmover"
import 'leaflet-draw/dist/leaflet.draw.css';
import { db, auth } from '../../../backend/firebase';
import { userDb } from '../../../backend/userfirebase';

const { BaseLayer, Overlay } = LayersControl;




export default function GoogleHybridMap({ center }) {

    const [assignedAreas, setAssignedAreas] = useState([]);
    const [reports, setReports] = useState([]);
    const [icon, setIcon] = useState(null);

    useEffect(() => {
        const L = require('leaflet');
        setIcon(new L.Icon({
            iconUrl: 'https://cdn-icons-png.flaticon.com/512/684/684908.png',
            iconSize: [38, 38], iconAnchor: [19, 38], popupAnchor: [0, -38]
        }));
    }, []);

    // 1. FETCH AREAS (Using the adminId from your screenshot)
    useEffect(() => {
        const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
            if (user) {

                const q = query(
                    collection(db, "assignedAreas"),
                    where("adminId", "==", user.uid)
                );

                const unsubscribeSnap = onSnapshot(q, (snapshot) => {
                    const areas = snapshot.docs.map(doc => ({
                        id: doc.id,
                        ...doc.data()
                    }));

                    setAssignedAreas(areas);
                });
                return () => unsubscribeSnap();
            }
        });
        return () => unsubscribeAuth();
    }, []);

    // 2. FETCH REPORTS (Using location.latitude from your screenshot)
    useEffect(() => {
        if (!userDb) return;
        const unsubscribe = onSnapshot(collection(userDb, "reports"), (snapshot) => {
            const extracted = snapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    // Screenshot mein latitude/longitude 'location' object ke andar hain
                    lat: data.location?.latitude,
                    lng: data.location?.longitude,
                    type: data.garbageType || "Report",
                };
            }).filter(p => p.lat && p.lng);
            setReports(extracted);
        });
        return () => unsubscribe();
    }, []);

    const _onCreate = async (e) => {
        const { layerType, layer } = e;
        const user = auth.currentUser;
        if (layerType === "polygon" && user) {
            const coords = layer.getLatLngs()[0].map(l => ({ lat: l.lat, lng: l.lng }));
            const name = prompt("Area Name:");
            const worker = prompt("Worker Name:");
            if (name && worker) {
                await addDoc(collection(db, "assignedAreas"), {
                    name, assignedTo: worker, points: coords,
                    adminId: user.uid, createdAt: new Date()
                });
                layer.remove();
            } else { layer.remove(); }
        }
    };

    if (typeof window === "undefined" || !icon) return null;


    const _onDeleted = async (e) => {
        const { layers } = e;
        layers.eachLayer(async (layer) => {
            const areaId = layer.options.id;

            if (areaId) {
                try {
                    await deleteDoc(doc(db, "assignedAreas", areaId));
                    alert("Area permanently deleted from database!");
                } catch (error) {
                    console.error("Error deleting area:", error);
                }
            }
        });
    };


    return (
        <div style={{ height: "70vh", width: "100%", borderRadius: "15px", overflow: "hidden" }}>
            <MapContainer center={center} zoom={18} style={{ height: "100%" }}>

                <MapMover center={center} />

                <LayersControl position="topright">
                    <BaseLayer name="Satellite View">
                        <TileLayer url="https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}" />
                    </BaseLayer>
                    <BaseLayer checked name="Street Map">
                        <TileLayer url="https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}" />
                    </BaseLayer>

                    <Overlay checked name="Reports">
                        <FeatureGroup>
                            {reports.map(r => (
                                <Marker key={r.id} position={[r.lat, r.lng]} icon={icon}>
                                    <Popup>{r.type}</Popup>
                                </Marker>
                            ))}
                        </FeatureGroup>
                    </Overlay>

                    <Overlay checked name="Areas">
                        <FeatureGroup>
                            <EditControl
                                position="topleft"
                                onCreated={_onCreate}
                                onDeleted={_onDeleted} // <--- Ye handler add karein
                                draw={{
                                    rectangle: false, circle: false, polyline: false, marker: false, circlemarker: false,
                                    polygon: { allowIntersection: false, shapeOptions: { color: "#39FF14" } }
                                }}
                                edit={{
                                    remove: true // Delete button enable rakhein
                                }}
                            />
                            {assignedAreas.map((area) => (
                                <Polygon
                                    key={area.id}
                                    positions={area.points.map(p => [p.lat, p.lng])}
                                    pathOptions={{ color: 'white', fillColor: '#39FF14', fillOpacity: 0.4 }}
                                    // FIX: eventHandlers ka use karke manual ID attach karein
                                    eventHandlers={{
                                        add: (e) => {
                                            e.target.options.id = area.id; // Leaflet layer object mein ID save kar rahe hain
                                        }
                                    }}
                                >
                                    <Popup><b>{area.name}</b><br />Worker: {area.assignedTo}</Popup>
                                </Polygon>
                            ))}
                        </FeatureGroup>
                    </Overlay>
                </LayersControl>
            </MapContainer>
        </div>
    );
}