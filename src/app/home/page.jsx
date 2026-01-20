"use client";
import { useState, useEffect } from "react";
import { auth } from "../../../backend/firebase";
import { useRouter } from "next/navigation";
import Navbar from "../component/navbar"
import React from 'react';
import Filter from "../component/filterhome"
import Googlemap from "../component/googlemap";
import dynamic from 'next/dynamic';
import styles from '../../style/home.module.css';
import {
  Bell, Maximize,
  Map as MapIcon, Sun
} from 'lucide-react';

const page = () => {
  const [mapCenter, setMapCenter] = useState([26.86, 75.78]);
  const [loading, setLoading] = useState(true);
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
      <Filter />

    </div>

  );
};

export default page;