"use client";
import React, { useState, useEffect } from 'react';
import AsyncSelect from 'react-select/async'; // OpenStreetMap se data fetch karne ke liye
import Select from 'react-select';
import styles from '../../style/home.module.css';

const FilterHome = ({ onFilterChange }) => {
  const [city, setCity] = useState();
  const [area, setArea] = useState();
  const [state, setState] = useState();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // 1. Nominatim API se City/Area search karne ka function
  const loadLocationOptions = async (inputValue) => {
    if (!inputValue || inputValue.length < 3) return [];

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${inputValue}&limit=5`
      );
      const data = await response.json();

      return data.map((item) => {
        const mainName = item.display_name.split(',')[0].trim();
        const city = item.address?.city || item.address?.town || item.address?.village || "";
        const state = item.address?.state || "";

        let subName = city || state || "";

        // Avoid duplicating name if it matches
        if (subName && mainName.toLowerCase() === subName.toLowerCase()) {
          subName = "";
        }

        // Construct label
        let label = mainName;
        if (subName && !label.includes(subName)) {
          label += `, ${subName}`;
        }

        // Remove trailing comma if any
        label = label.replace(/,\s*$/, "");

        return {
          label: label,
          value: item.display_name,
          lat: item.lat,
          lon: item.lon
        };
      });
    } catch (error) {
      console.error("Error fetching locations:", error);
      return [];
    }
  };

  const handleFilterUpdate = (type, selected) => {
    // Helper to clean trailing commas from label
    const clean = (opt) => {
      if (!opt || !opt.label) return opt;
      return { ...opt, label: opt.label.replace(/,\s*$/, "") };
    };

    const cleanSelected = clean(selected);

    if (type === 'city') setCity(cleanSelected);
    if (type === 'area') setArea(cleanSelected);
    if (type === 'state') setState(cleanSelected);

    if (onFilterChange) {
      onFilterChange({
        city: type === 'city' ? cleanSelected?.label : city?.label,
        area: type === 'area' ? cleanSelected?.label : area?.label,
        state: type === 'state' ? cleanSelected?.label : state?.label
      });
    }
  };

  // Custom Dark Styles
  const customStyles = {
    control: (base) => ({
      ...base,
      background: 'transparent',
      border: 'none',
      minWidth: '180px',
      color: 'white',
      cursor: 'text'
    }),
    singleValue: (base) => ({ ...base, color: 'white' }),
    input: (base) => ({ ...base, color: 'white' }),
    menu: (base) => ({ ...base, background: '#1a1a1a', zIndex: 9999 }),

  };

  if (!mounted) return null;

  return (
    <div className={styles.filters}>
      <span>ACTIVE FILTERS</span>

      {/* Dynamic Area Search */}
      <div className={styles.selectChip}>
        <AsyncSelect
          cacheOptions
          loadOptions={loadLocationOptions}
          value={area}
          onChange={(opt) => handleFilterUpdate('area', opt)}
          styles={customStyles}
          placeholder="Search Area..."
        />
      </div>

      {/* Dynamic City Search */}
      <div className={styles.selectChip}>
        <AsyncSelect
          cacheOptions
          loadOptions={loadLocationOptions}
          defaultOptions
          value={city}
          onChange={(opt) => handleFilterUpdate('city', opt)}
          styles={customStyles}
          placeholder="Search City..."
        />
      </div>


      <div className={styles.selectChip}>
        <AsyncSelect
          cacheOptions
          loadOptions={loadLocationOptions}
          value={state}
          onChange={(opt) => handleFilterUpdate('state', opt)}
          styles={customStyles}
          placeholder="Search State..."
        />
      </div>

      <span
        className={styles.resetAll}
        onClick={() => {
          setCity({ value: 'All', label: 'All' });
          setArea({ value: 'All', label: 'All' });
          setState({ value: 'All', label: 'All' });
        }}
        style={{ cursor: 'pointer' }}
      >
        Reset All
      </span>
    </div>
  );
};

export default FilterHome;