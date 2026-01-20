"use client";
import React from 'react';
import dynamic from 'next/dynamic';

const AsyncSelect = dynamic(() => import('react-select/async'), { ssr: false });

const Search = ({ onSelect }) => {

    const loadOptions = async (inputValue) => {
        if (!inputValue) return [];

        const response = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${inputValue}&limit=10`
        );
        const data = await response.json();

        return data.map((item) => ({
            label: item.display_name,
            value: { lat: parseFloat(item.lat), lng: parseFloat(item.lon) }
        }));
    };

    const customStyles = {
        control: (base) => ({
            ...base,
            background: '#1a1a1a',
            borderColor: '#333',
            borderRadius: '8px',
            minWidth: '30vw',
            zIndex: 1001
        }),
        singleValue: (base) => ({ ...base, color: 'white' }),
        input: (base) => ({ ...base, color: 'white' }),
        menu: (base) => ({ ...base, background: '#1a1a1a' }),
        option: (base, state) => ({
            ...base,
            backgroundColor: state.isFocused ? '#39FF14' : 'transparent',
            color: state.isFocused ? 'black' : 'white',
        })
    };

    return (
        <AsyncSelect
            cacheOptions
            loadOptions={loadOptions}
            defaultOptions
            placeholder="Type any city (e.g. Ajmer, Mumbai...)"
            onChange={(opt) => onSelect(opt.value)}
            styles={customStyles}
        />
    );
};

export default Search;