import React, { useState } from 'react';

const CityManagement = ({ cities, setCities }) => {
  const [newCityData, setNewCityData] = useState({ name: '', distance: '' });
  const [editingCity, setEditingCity] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingCityData, setEditingCityData] = useState({ name: '', distance: 0 });

  // Helper function to parse CSV string into an array of city names
  const csvToArray = (str, delimiter = ',') => {
    const headers = str.slice(0, str.indexOf('\n')).split(delimiter).map(h => h.trim());
    const rows = str.slice(str.indexOf('\n') + 1).split('\n').filter(row => row.trim() !== '');

    const arr = rows.map(function (row) {
      const values = row.split(delimiter).map(v => v.trim());
      const cityObject = {};
      headers.forEach((header, index) => {
        cityObject[header] = values[index];
      });
      // Assuming 'City' column exists for city name and 'Distance' for distance
      return { name: cityObject.City || '', distance: parseFloat(cityObject.Distance) || 0 };
    }).filter(city => city.name !== ''); // Filter out empty city names

    return arr;
  };

  // Helper function to convert an array of city names to CSV string
  const arrayToCsv = (data) => {
    if (!data || data.length === 0) return 'City,Distance\n';
    const header = 'City,Distance';
    const rows = data.map(city => `"${city.name.replace(/"/g, '""')}",${city.distance}`);
    return [header, ...rows].join('\n');
  };

  const handleAddCity = () => {
    if (newCityData.name.trim() === '') {
      setError('الرجاء إدخال اسم المدينة.');
      return;
    }
    if (isNaN(parseFloat(newCityData.distance)) || parseFloat(newCityData.distance) < 0) {
      setError('الرجاء إدخال مسافة صالحة (رقم موجب).');
      return;
    }

    // Check if city name already exists (case-insensitive)
    if (cities.some(city => city.name.toLowerCase() === newCityData.name.trim().toLowerCase())) {
      setError('هذه المدينة موجودة بالفعل.');
      return;
    }
    setCities(prevCities => [...prevCities, { name: newCityData.name.trim(), distance: parseFloat(newCityData.distance) || 0 }]);
    setNewCityData({ name: '', distance: '' });
    setError(null);
    setSuccess('تمت إضافة المدينة بنجاح');
    setTimeout(() => setSuccess(null), 3000);
  };

  const handleEditCity = (cityToEdit) => {
    setEditingCityData(cityToEdit);
    setShowEditModal(true);
  };

  const handleUpdateCity = () => {
    if (newCityData.name.trim() === '') {
      setError('الرجاء إدخال اسم المدينة.');
      return;
    }
    if (isNaN(parseFloat(newCityData.distance)) || parseFloat(newCityData.distance) < 0) {
      setError('الرجاء إدخال مسافة صالحة (رقم موجب).');
      return;
    }
    // Check for duplicate city name, excluding the city being edited
    if (cities.some(city => city.name.toLowerCase() === newCityData.name.trim().toLowerCase() && city.name !== editingCity)) {
      setError('هذه المدينة موجودة بالفعل.');
      return;
    }
    setCities(prevCities => 
      prevCities.map(city => 
        city.name === editingCity ? { ...city, name: newCityData.name.trim(), distance: parseFloat(newCityData.distance) || 0 } : city
      )
    );
    setNewCityData({ name: '', distance: '' });
    setEditingCity(null);
    setError(null);
    setSuccess('تم تحديث المدينة بنجاح');
    setTimeout(() => setSuccess(null), 3000);
  };

  const handleUpdateCityModal = () => {
    if (editingCityData.name.trim() === '') {
      setError('الرجاء إدخال اسم المدينة.');
      return;
    }
    if (isNaN(parseFloat(editingCityData.distance)) || parseFloat(editingCityData.distance) < 0) {
      setError('الرجاء إدخال مسافة صالحة (رقم موجب).');
      return;
    }
    if (cities.some(city => city.name.toLowerCase() === editingCityData.name.trim().toLowerCase() && city.name !== editingCityData.name)) {
      setError('هذه المدينة موجودة بالفعل.');
      return;
    }

    setCities(prevCities => 
      prevCities.map(city => 
        city.name === editingCityData.name ? { ...editingCityData, name: editingCityData.name.trim(), distance: parseFloat(editingCityData.distance) || 0 } : city
      )
    );
    setShowEditModal(false);
    setError(null);
    setSuccess('تم تحديث المدينة بنجاح');
    setTimeout(() => setSuccess(null), 3000);
  };

  const handleDeleteCity = (cityToDelete) => {
    if (window.confirm(`هل أنت متأكد من حذف المدينة: ${cityToDelete.name}؟`)) {
      setCities(prevCities => prevCities.filter(city => city.name !== cityToDelete.name));
      setSuccess('تم حذف المدينة بنجاح');
      setTimeout(() => setSuccess(null), 3000);
    }
  };

  const handleCancel = () => {
    setEditingCity(null);
    setNewCityData({ name: '', distance: '' });
    setError(null);
  };

  const handleImportCities = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (file.type !== 'text/csv') {
      setError('الرجاء اختيار ملف بصيغة CSV.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target.result;
        const importedCities = csvToArray(text);
        
        if (!Array.isArray(importedCities)) {
          throw new Error('الملف يجب أن يحتوي على قائمة مدن صحيحة.');
        }

        // التحقق من أن كل عنصر هو كائن مدينة صالح
        if (!importedCities.every(city => typeof city.name === 'string' && city.name.trim() !== '')) {
          throw new Error('جميع المدن يجب أن تحتوي على اسم غير فارغ.');
        }

        const newCities = importedCities.filter(city => 
          !cities.some(existingCity => 
            existingCity.name.toLowerCase() === city.name.toLowerCase()
          )
        );

        if (newCities.length === 0) {
          setError('لا توجد مدن جديدة للاستيراد أو أن جميعها موجودة بالفعل.');
          return;
        }

        setCities(prevCities => [...prevCities, ...newCities]);
        setSuccess(`تم استيراد ${newCities.length} مدينة بنجاح`);
        setTimeout(() => setSuccess(null), 3000);
      } catch (error) {
        setError('خطأ في استيراد الملف: ' + error.message);
      }
    };
    reader.readAsText(file);
  };

  const handleExportCities = () => {
    const csvContent = arrayToCsv(cities);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', 'cities.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDeleteAllCities = () => {
    if (window.confirm('هل أنت متأكد أنك تريد حذف جميع المدن؟ هذه العملية لا يمكن التراجع عنها.')) {
      setCities([]);
    }
  };

  return (
    <div className="city-management-container">
      <h2>إدارة المدن</h2>
      
      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}
      
      <div className="add-city-section">
        <div className="input-group">
          <label>اسم المدينة:</label>
          <input 
            type="text"
            value={newCityData.name}
            onChange={(e) => setNewCityData({ ...newCityData, name: e.target.value })}
            className="app-input"
            placeholder="أدخل اسم المدينة"
          />
        </div>
        <div className="input-group">
          <label>المسافة (كم):</label>
          <input 
            type="number"
            value={newCityData.distance}
            onChange={(e) => setNewCityData({ ...newCityData, distance: e.target.value })}
            className="app-input"
            placeholder="أدخل المسافة بالكيلومتر"
            min="0"
          />
        </div>
        <button onClick={handleAddCity} className="app-button">إضافة مدينة</button>
      </div>

      <div className="import-export-section">
        <div className="import-export-buttons-group">
          <label htmlFor="import-csv" className="app-button">
            استيراد المدن (CSV)
          </label>
          <input 
            type="file" 
            id="import-csv" 
            accept=".csv" 
            onChange={handleImportCities} 
            style={{ display: 'none' }}
          />
          <button onClick={handleExportCities} className="app-button">تصدير المدن (CSV)</button>
        </div>
        <div className="delete-all-cities-wrapper">
          <button onClick={handleDeleteAllCities} className="delete-all-button">
            حذف جميع المدن
          </button>
        </div>
      </div>
      
      <h2>المدن الحالية</h2>
      <div className="city-list-section">
        {cities.length === 0 ? (
          <p className="no-data-message">لا توجد مدن محفوظة حالياً.</p>
        ) : (
          <div className="city-grid">
            {cities.map(city => (
              <div key={city.name} className="city-card">
                <div className="city-card-details">
                  <h3>{city.name}</h3>
                  <p>المسافة: {city.distance} كم</p>
                </div>
                <div className="city-card-actions">
                  <button className="edit-button" onClick={() => handleEditCity(city)}>
                    تعديل
                  </button>
                  <button className="delete-button" onClick={() => handleDeleteCity(city)}>
                    حذف
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Edit City Modal */}
      {showEditModal && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <button className="close-modal-button" onClick={() => setShowEditModal(false)}>X</button>
            <h3>تعديل المدينة</h3>
            <div className="input-group">
              <label>اسم المدينة:</label>
              <input 
                type="text"
                value={editingCityData.name}
                onChange={(e) => setEditingCityData({ ...editingCityData, name: e.target.value })}
                className="app-input"
              />
            </div>
            <div className="input-group">
              <label>المسافة (كم):</label>
              <input 
                type="number"
                value={editingCityData.distance}
                onChange={(e) => setEditingCityData({ ...editingCityData, distance: e.target.value })}
                className="app-input"
                min="0"
              />
            </div>
            <div className="modal-actions">
              <button onClick={handleUpdateCityModal} className="app-button primary">تحديث</button>
              <button onClick={() => setShowEditModal(false)} className="app-button">إلغاء</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CityManagement; 