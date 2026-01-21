"use client";
import { useState, useEffect } from "react";
import { auth } from "../../../backend/firebase";
import { useRouter } from "next/navigation";
import Navbar from "../component/navbar"
import React from 'react';
import ReportList from "../reportlist/reportlist"
import Filter from "../component/filterhome"
import dynamic from 'next/dynamic';
const Googlemap = dynamic(
  () => import("../component/googlemap"),
  {
    ssr: false,
    loading: () => <div style={{ height: "70vh", background: "#1a1a1a" }}>Loading Map...</div>
  }
);
import styles from '../../style/home.module.css';
import {
  Bell, Maximize,
  Map as MapIcon, Sun
} from 'lucide-react';

const page = () => {
  const [mapCenter, setMapCenter] = useState([26.86, 75.78]);
  const [loading, setLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState("");




  const router = useRouter();

  const handleLocationSelect = (coords) => {
    setMapCenter([coords.lat, coords.lng]);
  };


  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (!user) {
        router.push("/");
      } else {
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);




  return (

    <div className={styles.container}>
      {/* Header */}
      <Navbar onLocationSelect={handleLocationSelect} />

      {/* Map Section */}
      <section className={styles.mapSection}>

        <Googlemap center={mapCenter} />

        <Maximize className={styles.fullscreenIcon} size={20} />
      </section>
      <Filter onFilterChange={(val) => setSelectedFilter(val)} />
      <div style={{ display: "flex", flexDirection: "column" }}>
        <h3 style={{ color: 'white', padding: '20px 20px 0 20px' }}>Live Incident Reports</h3>
        <div style={{ marginLeft: "0vw", width: "45vw", height: "80vh", overflowY: "auto", position: "relative", scrollbarWidth: "thin" }}>
          <ReportList selectedFilter={selectedFilter} />
        </div>
      </div>
    </div >

  );
};

export default page;