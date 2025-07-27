import React, { useState } from 'react';

const CityManager = ({ cities, onAdd, onUpdate, onSelect, selectedCity }) => {
  const [form, setForm] = useState({ name: '', description: '' });
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(false);

  // When a city is selected for edit
  React.useEffect(() => {
    if (selectedCity) {
      setForm({ name: selectedCity.name, description: selectedCity.description });
      setEditMode(true);
    } else {
      setForm({ name: '', description: '' });
      setEditMode(false);
    }
  }, [selectedCity]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editMode) {
        await onUpdate(selectedCity.id, form);
      } else {
        await onAdd(form);
      }
      setForm({ name: '', description: '' });
      setEditMode(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="city-manager">
      <form onSubmit={handleSubmit} className="travel-form">
        <h3>{editMode ? 'Edit City' : 'Add City'}</h3>
        <input type="text" placeholder="City Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
        <textarea placeholder="Description" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} required />
        <button type="submit" disabled={loading}>{loading ? (editMode ? 'Updating...' : 'Adding...') : (editMode ? 'Update City' : 'Add City')}</button>
        {editMode && (
          <button
            type="button"
            className="cancel-btn"
            style={{ marginLeft: 8, background: '#eee', color: '#333', border: '1px solid #bbb', borderRadius: 4, padding: '6px 16px', cursor: 'pointer', fontWeight: 500 }}
            onClick={() => { setEditMode(false); setForm({ name: '', description: '' }); onSelect(null); }}
          >
            Cancel
          </button>
        )}
      </form>
      <h3>Cities</h3>
      <ul>
        {cities.map(city => (
          <li key={city.id}>
            <button onClick={() => onSelect(city)}>{city.name}</button>
          </li>
        ))}
      </ul>
      {selectedCity && (
        <div className="city-details">
          <h4>City Details</h4>
          <p><strong>Name:</strong> {selectedCity.name}</p>
          <p><strong>Description:</strong> {selectedCity.description}</p>
        </div>
      )}
    </div>
  );
};

export default CityManager;
