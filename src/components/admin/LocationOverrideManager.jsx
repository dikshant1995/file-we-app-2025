import { useState } from 'react';
import './ConfigEditor.css';

const LocationOverrideManager = ({
    overrides = {},
    activeLocation,
    onSelectLocation,
    onAddLocation,
    onRemoveLocation
}) => {
    const [newLocation, setNewLocation] = useState('');
    const [showAdd, setShowAdd] = useState(false);

    const locations = Object.keys(overrides);

    const handleAdd = () => {
        if (newLocation && !overrides[newLocation]) {
            onAddLocation(newLocation);
            setNewLocation('');
            setShowAdd(false);
        }
    };

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
                        + Add State/City
                    </button>
                ) : (
                    <div className="add-loc-form">
                        <input
                            type="text"
                            value={newLocation}
                            onChange={(e) => setNewLocation(e.target.value)}
                            placeholder="e.g. Maharashtra or Mumbai"
                            className="config-input compact"
                            autoFocus
                        />
                        <button className="btn-save-loc" onClick={handleAdd}>Add</button>
                        <button className="btn-cancel-loc" onClick={() => setShowAdd(false)}>Cancel</button>
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
