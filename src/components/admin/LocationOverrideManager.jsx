import { useState } from 'react';
import './ConfigEditor.css';
import { indianStates, stateCityData } from '../../data/locationData.js';

const LocationOverrideManager = ({
    overrides = {},
    activeLocation,
    onSelectLocation,
    onAddLocation,
    onRemoveLocation
}) => {
    const [selectedState, setSelectedState] = useState('');
    const [selectedCity, setSelectedCity] = useState('');
    const [showAdd, setShowAdd] = useState(false);

    const locations = Object.keys(overrides);

    const handleAdd = () => {
        const finalLoc = selectedCity || selectedState;
        if (finalLoc && !overrides[finalLoc]) {
            onAddLocation(finalLoc);
            setSelectedState('');
            setSelectedCity('');
            setShowAdd(false);
        }
    };

    const availableCities = selectedState ? (stateCityData[selectedState] || []) : [];

    return (
        <div className="location-manager-wrapper">
            <div className="location-tabs">
                <button
                    className={`location-tab ${activeLocation === null ? 'active' : ''}`}
                    onClick={() => onSelectLocation(null)}
                >
                    🌐 Global Default
                </button>

                {locations.map(loc => (
                    <div key={loc} className="location-tab-container">
                        <button
                            className={`location-tab ${activeLocation === loc ? 'active' : ''}`}
                            onClick={() => onSelectLocation(loc)}
                        >
                            📍 {loc}
                        </button>
                        <button
                            className="btn-remove-loc"
                            onClick={(e) => {
                                e.stopPropagation();
                                if (confirm(`Remove override for ${loc}?`)) onRemoveLocation(loc);
                            }}
                        >
                            ×
                        </button>
                    </div>
                ))}

                {!showAdd ? (
                    <button className="btn-add-loc" onClick={() => setShowAdd(true)}>
                        + Add State/City Override
                    </button>
                ) : (
                    <div className="add-loc-form-enhanced">
                        <div className="select-row">
                            <select
                                value={selectedState}
                                onChange={(e) => {
                                    setSelectedState(e.target.value);
                                    setSelectedCity('');
                                }}
                                className="config-input compact"
                            >
                                <option value="">Select State...</option>
                                {indianStates.map(state => (
                                    <option key={state} value={state}>{state}</option>
                                ))}
                            </select>

                            {availableCities.length > 0 && (
                                <select
                                    value={selectedCity}
                                    onChange={(e) => setSelectedCity(e.target.value)}
                                    className="config-input compact"
                                >
                                    <option value="">Select City (Optional)...</option>
                                    {availableCities.map(city => (
                                        <option key={city} value={city}>{city}</option>
                                    ))}
                                </select>
                            )}

                            <button className="btn-save-loc" onClick={handleAdd} disabled={!selectedState}>Add</button>
                            <button className="btn-cancel-loc" onClick={() => setShowAdd(false)}>Cancel</button>
                        </div>
                    </div>
                )}
            </div>

            {activeLocation && (
                <div className="active-location-badge">
                    You are currently editing specific rules for: <strong>{activeLocation}</strong>
                </div>
            )}
        </div>
    );
};

export default LocationOverrideManager;
