"use client";
import React, { useState } from 'react';
import AsyncSelect from 'react-select/async'; // OpenStreetMap se data fetch karne ke liye
import Select from 'react-select';
import styles from '../../style/home.module.css';

const FilterHome = ({ onFilterChange }) => {
  const [city, setCity] = useState();
  const [area, setArea] = useState();
  const [state, setState] = useState();

  // 1. Nominatim API se City/Area search karne ka function
  const loadLocationOptions = async (inputValue) => {
    if (!inputValue || inputValue.length < 3) return [];

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${inputValue}&limit=5`
      );
      const data = await response.json();

      return data.map((item) => ({
        label: item.display_name.split(',')[0] + ", " + (item.address?.city || item.address?.state || ""),
        value: item.display_name,
        lat: item.lat,
        lon: item.lon
      }));
    } catch (error) {
      console.error("Error fetching locations:", error);
      return [];
    }
  };



  const handleFilterUpdate = (type, selected) => {
    if (type === 'city') setCity(selected);
    if (type === 'area') setArea(selected);
    if (type === 'state') setState(selected);

    if (onFilterChange) {
      onFilterChange({
        city: type === 'city' ? selected?.label : city.label,
        area: type === 'area' ? selected?.label : area.label,
        state: type === 'state' ? selected?.label : state.label
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