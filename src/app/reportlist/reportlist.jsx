"use client";
import React, { useState, useEffect } from 'react';
import { MapPin, MoreVertical } from 'lucide-react';
import { collection, query, orderBy, onSnapshot, doc, updateDoc } from "firebase/firestore";
import { userDb } from "../../../backend/userfirebase";

const ReportCard = ({ report }) => {
    if (!report) return null;

    const handleStatusUpdate = async (e) => {
        const isChecked = e.target.checked;
        if (isChecked && report.id) {
            try {
                const reportRef = doc(userDb, "reports", report.id);
                await updateDoc(reportRef, {
                    status: "In Review"
                });
                alert("Status updated to In Review!");
            } catch (error) {
                console.error("Error updating status:", error);
                alert("Failed to update status.");
            }
        }
    };

    const formattedDate = report.createdAt?.toDate
        ? report.createdAt.toDate().toLocaleString()
        : "Recent";

    return (
        <div style={cardContainer}>
            {/* Left Side: Real Image from DB */}
            <div style={imageSection}>
                <div style={{
                    ...statusBadge,
                    background: report.status === "In Review" ? "#39FF14" : "#FF7A00",
                    color: report.status === "In Review" ? "black" : "white"
                }}>
                    {report.status?.toUpperCase() || "PENDING"}
                </div>

                {report.imageUrl ? (
                    <img
                        src={report.imageUrl}
                        alt="Garbage"
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                ) : (
                    <div style={{ color: '#666', fontSize: '12px' }}>No Image Available</div>
                )}
            </div>

            {/* Right Side: Details */}
            <div style={detailsSection}>
                <div style={headerRow}>
                    <h3 style={title}>{report.garbageType || "Waste Report"}</h3>
                    <span style={timeStamp}> {formattedDate}</span>
                </div>

                <div style={addressRow}>
                    <MapPin size={14} color="#39FF14" />
                    <span style={addressText}>{report.fullAddress || "Address not provided"}</span>
                </div>

                <div style={descriptionContainer}>
                    <label style={descLabel}>INCIDENT DESCRIPTION</label>
                    <div style={descBox}>
                        {report.description || "No description available."}
                    </div>
                </div>

                <div style={footerRow}>
                    <div style={toggleContainer}>
                        <label className="switch">
                            <input
                                type="checkbox"
                                onChange={handleStatusUpdate}
                                checked={report.status === "In Review"}
                                disabled={report.status === "In Review"}
                            />
                            <span className="slider round"></span>
                        </label>
                        <span style={toggleLabel}>
                            {report.status === "In Review" ? "Cleaning in Progress" : "Garbage Cleaned?"}
                        </span>
                    </div>
                    <MoreVertical size={20} color="#888" style={{ cursor: 'pointer' }} />
                </div>
            </div>

            <style jsx>{`
                .switch { position: relative; display: inline-block; width: 34px; height: 18px; }
                .switch input { opacity: 0; width: 0; height: 0; }
                .slider { position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: #333; transition: .4s; border-radius: 34px; }
                .slider:before { position: absolute; content: ""; height: 12px; width: 12px; left: 3px; bottom: 3px; background-color: white; transition: .4s; border-radius: 50%; }
                input:checked + .slider { background-color: #39FF14; }
                input:checked + .slider:before { transform: translateX(16px); }
                input:disabled + .slider { opacity: 0.5; cursor: not-allowed; }
            `}</style>
        </div>
    );
};

const ReportList = ({ selectedFilter }) => {
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const q = query(collection(userDb, "reports"), orderBy("createdAt", "desc"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const reportsData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setReports(reportsData);
            setLoading(false);
        }, (error) => {
            console.error("Error fetching reports:", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const filteredReports = reports.filter(report => {
        if (!selectedFilter) return true;

        if (typeof selectedFilter === 'object') {
            const { city, area, state } = selectedFilter;

            const normalize = (str) => str ? str.toLowerCase().replace(/,\s*$/, "").trim() : "";

            const matchesState = !state || state === 'All' || normalize(report.state) === normalize(state);
            const matchesCity = !city || city === 'All' || normalize(report.city) === normalize(city);

            // For Area, check if the fullAddress or area field matches
            const matchesArea = !area || area === 'All' ||
                normalize(report.fullAddress).includes(normalize(area)) ||
                normalize(report.area).includes(normalize(area));

            return matchesState && matchesCity && matchesArea;
        }

        if (typeof selectedFilter === 'string') {
            if (selectedFilter === "") return true;
            const filterLower = selectedFilter.toLowerCase();
            return (
                report.fullAddress?.toLowerCase().includes(filterLower) ||
                report.garbageType?.toLowerCase().includes(filterLower) ||
                report.description?.toLowerCase().includes(filterLower)
            );
        }

        return true;
    });

    if (loading) {
        return <div style={{ color: 'white', padding: '20px' }}>Loading reports...</div>;
    }

    if (filteredReports.length === 0) {
        return <div style={{ color: '#888', padding: '20px' }}>No reports found.</div>;
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            {filteredReports.map(report => (
                <ReportCard key={report.id} report={report} />
            ))}
        </div>
    );
};

const cardContainer = { display: 'flex', background: '#121417', borderRadius: '16px', overflow: 'hidden', border: '1px solid #2a2d32', width: '100%', maxWidth: '650px', color: 'white', marginBottom: '15px' };
const imageSection = { width: '35%', background: '#222', position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px' };
const statusBadge = { position: 'absolute', top: '15px', left: '15px', fontSize: '10px', fontWeight: 'bold', padding: '4px 10px', borderRadius: '4px', zIndex: 2 };
const detailsSection = { width: '65%', padding: '20px', display: 'flex', flexDirection: 'column' };
const headerRow = { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '5px' };
const title = { margin: 0, fontSize: '18px', fontWeight: 'bold' };
const timeStamp = { color: '#666', fontSize: '12px' };
const addressRow = { display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '15px' };
const addressText = { color: '#39FF14', fontSize: '13px' };
const descriptionContainer = { marginBottom: '20px' };
const descLabel = { display: 'block', fontSize: '10px', color: '#666', fontWeight: 'bold', marginBottom: '5px' };
const descBox = { background: 'rgba(255,255,255,0.03)', border: '1px solid #2a2d32', borderRadius: '8px', padding: '12px', fontSize: '13px', color: '#ccc', lineHeight: '1.4', minHeight: '60px' };
const footerRow = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', borderTop: '1px solid #2a2d32', paddingTop: '15px' };
const toggleContainer = { display: 'flex', alignItems: 'center', gap: '10px' };
const toggleLabel = { fontSize: '14px', color: '#eee' };

export default ReportList;