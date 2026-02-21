import { useState, useEffect } from 'react';
import { indianStates, stateCityData } from '../../data/locationData';
import './GlobalLocationSelector.css';

const GlobalLocationSelector = ({ activeLocation, onLocationChange }) => {
    const [selectedState, setSelectedState] = useState(activeLocation.state || '');
    const [selectedCity, setSelectedCity] = useState(activeLocation.city || '');

    // Synchronize local state with prop if prop changes externally
    useEffect(() => {
        setSelectedState(activeLocation.state || '');
        setSelectedCity(activeLocation.city || '');
    }, [activeLocation]);

    const handleStateChange = (e) => {
        const state = e.target.value;
        setSelectedState(state);
        setSelectedCity('');
        onLocationChange({ state, city: '' });
    };

    const handleCityChange = (e) => {
        const city = e.target.value;
        setSelectedCity(city);
        onLocationChange({ state: selectedState, city });
    };

    const handleReset = () => {
        setSelectedState('');
        setSelectedCity('');
        onLocationChange({ state: '', city: '' });
    };

    const cities = selectedState ? (stateCityData[selectedState] || []) : [];

    return (
        <div className="global-location-selector">
            <div className="selector-label">
                <span className="icon">📍</span>
                <span className="text">Admin Location Context:</span>
            </div>

            <div className="selector-controls">
                <select
                    value={selectedState}
                    onChange={handleStateChange}
                    className="location-dropdown"
                >
                    <option value="">Global Default</option>
                    {indianStates.map(state => (
                        <option key={state} value={state}>{state}</option>
                    ))}
                </select>

                {selectedState && (
                    <select
                        value={selectedCity}
                        onChange={handleCityChange}
                        className="location-dropdown"
                    >
                        <option value="">All Cities in {selectedState}</option>
                        {cities.map(city => (
                            <option key={city} value={city}>{city}</option>
                        ))}
                    </select>
                )}

                {(selectedState || selectedCity) && (
                    <button className="btn-reset-location" onClick={handleReset} title="Reset to Global Default">
                        ✕
                    </button>
                )}
            </div>

            <div className="selector-indicator">
                {selectedState ? (
                    <span className="status-badge active">
                        Editing for: <strong>{selectedCity || selectedState}</strong>
                    </span>
                ) : (
                    <span className="status-badge default">
                        Viewing <strong>Global Defaults</strong>
                    </span>
                )}
            </div>
        </div>
    );
};

export default GlobalLocationSelector;
