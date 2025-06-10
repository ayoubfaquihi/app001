import React, { useState, useEffect } from 'react';
import './App.css';

const DriverManagement = ({ cities }) => {
  const [drivers, setDrivers] = useState(() => {
    const savedDrivers = localStorage.getItem('drivers');
    return savedDrivers ? JSON.parse(savedDrivers) : [];
  });

  const [showModal, setShowModal] = useState(false);
  const [editingDriver, setEditingDriver] = useState(null);
  const [showDriverDetailsModal, setShowDriverDetailsModal] = useState(false);
  const [selectedDriverDetails, setSelectedDriverDetails] = useState(null);
  const [filteredCities, setFilteredCities] = useState([]);
  const [showCitySuggestions, setShowCitySuggestions] = useState(false);
  const [searchCityQuery, setSearchCityQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    licenseNumber: '',
    city: '',
    status: 'active',
    imageUrl: '',
    grayCardNumber: '',
    nationalIdNumber: '',
    grayCardImage: '',
    nationalIdImage: '',
  });
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedImageTitle, setSelectedImageTitle] = useState('');

  useEffect(() => {
    localStorage.setItem('drivers', JSON.stringify(drivers));
  }, [drivers]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (name === 'city') {
      if (value.length > 0 && Array.isArray(cities)) {
        setFilteredCities(cities.filter(city =>
          city && city.name && city.name.toLowerCase().includes(value.toLowerCase())
        ));
        setShowCitySuggestions(true);
      } else {
        setFilteredCities([]);
        setShowCitySuggestions(false);
      }
    }
  };

  const handleCitySelect = (city) => {
    setFormData(prev => ({
      ...prev,
      city: city.name
    }));
    setShowCitySuggestions(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingDriver) {
      setDrivers(prev => prev.map(driver => 
        driver.id === editingDriver.id ? { ...formData, id: driver.id } : driver
      ));
    } else {
      setDrivers(prev => [...prev, { ...formData, id: Date.now() }]);
    }
    handleCloseModal();
  };

  const handleEdit = (driver) => {
    setEditingDriver(driver);
    setFormData(driver);
    setShowModal(true);
  };

  const handleDelete = (driverId) => {
    if (window.confirm('هل أنت متأكد من حذف هذا السائق؟')) {
      setDrivers(prev => prev.filter(driver => driver.id !== driverId));
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingDriver(null);
    setFormData({
      name: '',
      phone: '',
      licenseNumber: '',
      city: '',
      status: 'active',
      imageUrl: '',
      grayCardNumber: '',
      nationalIdNumber: '',
      grayCardImage: '',
      nationalIdImage: '',
    });
    setFilteredCities([]);
    setShowCitySuggestions(false);
  };

  const handleAddNew = () => {
    setEditingDriver(null);
    setFormData({
      name: '',
      phone: '',
      licenseNumber: '',
      city: '',
      status: 'active',
      imageUrl: '',
      grayCardNumber: '',
      nationalIdNumber: '',
      grayCardImage: '',
      nationalIdImage: '',
    });
    setShowModal(true);
  };

  const openDriverDetailsModal = (driver) => {
    setSelectedDriverDetails(driver);
    setShowDriverDetailsModal(true);
  };

  const closeDriverDetailsModal = () => {
    setShowDriverDetailsModal(false);
    setSelectedDriverDetails(null);
  };

  const handleImageUpload = (e, type) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({
          ...prev,
          [type]: reader.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageClick = (image, title) => {
    setSelectedImage(image);
    setSelectedImageTitle(title);
    setShowImageModal(true);
  };

  const handleCloseImageModal = () => {
    setShowImageModal(false);
    setSelectedImage(null);
    setSelectedImageTitle('');
  };

  const filteredDrivers = drivers.filter(driver => {
    const driverCity = driver.city ? String(driver.city) : ''; 
    const matchesCity = driverCity.toLowerCase().includes(searchCityQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || driver.status === statusFilter;
    return matchesCity && matchesStatus;
  });

  return (
    <div className="driver-management-container">
      <div className="section-header">
        <h1>إدارة السائقين</h1>
        <div className="driver-search-section">
          <input
            type="text"
            placeholder="البحث بالمدينة..."
            value={searchCityQuery}
            onChange={(e) => setSearchCityQuery(e.target.value)}
            className="driver-search-input"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="driver-status-filter"
          >
            <option value="all">جميع الحالات</option>
            <option value="active">نشط</option>
            <option value="inactive">غير نشط</option>
          </select>
          <button className="add-button" onClick={handleAddNew}>
            <i className="fas fa-plus"></i>
            إضافة سائق جديد
          </button>
        </div>
      </div>

      <div className="drivers-grid">
        {filteredDrivers.length === 0 ? (
          <p className="no-data-message">لا توجد سائقين مطابقين لمعايير البحث.</p>
        ) : (
          filteredDrivers.map(driver => (
            <div key={driver.id} className="driver-card">
              <div className="driver-status" data-status={driver.status}>
                {driver.status === 'active' ? 'نشط' : 'غير نشط'}
              </div>
              <div className="driver-info">
                <div className="driver-image-container">
                  {driver.imageUrl ? (
                    <img src={driver.imageUrl} alt={driver.name} className="driver-image" />
                  ) : (
                    <img src="https://via.placeholder.com/100" alt="Placeholder" className="driver-image" />
                  )}
                </div>
                <div className="driver-details">
                  <h3 className="driver-name">{driver.name}</h3>
                  <div className="driver-info-grid">
                    <div className="info-item">
                      <i className="fas fa-phone"></i>
                      <span>{driver.phone}</span>
                    </div>
                    <div className="info-item">
                      <i className="fas fa-id-card"></i>
                      <span>{driver.licenseNumber}</span>
                    </div>
                    <div className="info-item">
                      <i className="fas fa-map-marker-alt"></i>
                      <span>{driver.city}</span>
                    </div>
                    <div className="info-item">
                      <i className="fas fa-credit-card"></i>
                      <span>{driver.grayCardNumber || 'غير متوفر'}</span>
                    </div>
                    <div className="info-item">
                      <i className="fas fa-id-badge"></i>
                      <span>{driver.nationalIdNumber || 'غير متوفر'}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="driver-documents">
                {driver.grayCardImage && (
                  <div 
                    className="document-preview"
                    onClick={() => handleImageClick(driver.grayCardImage, 'البطاقة الرمادية')}
                  >
                    <i className="fas fa-eye document-icon"></i>
                    <span>البطاقة الرمادية</span>
                  </div>
                )}
                {driver.nationalIdImage && (
                  <div 
                    className="document-preview"
                    onClick={() => handleImageClick(driver.nationalIdImage, 'البطاقة الوطنية')}
                  >
                    <i className="fas fa-eye document-icon"></i>
                    <span>البطاقة الوطنية</span>
                  </div>
                )}
              </div>

              <div className="driver-actions">
                <button className="edit-button" onClick={() => handleEdit(driver)}>
                  <i className="fas fa-edit"></i>
                  تعديل
                </button>
                <button className="delete-button" onClick={() => handleDelete(driver.id)}>
                  <i className="fas fa-trash"></i>
                  حذف
                </button>
                <button className="app-button" onClick={() => openDriverDetailsModal(driver)}>
                  <i className="fas fa-info-circle"></i>
                  عرض التفاصيل
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3>{editingDriver ? 'تعديل بيانات السائق' : 'إضافة سائق جديد'}</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>اسم السائق</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="app-input"
                  required
                />
              </div>
              <div className="form-group">
                <label>رقم الهاتف</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="app-input"
                  required
                />
              </div>
              <div className="form-group">
                <label>رقم رخصة القيادة</label>
                <input
                  type="text"
                  name="licenseNumber"
                  value={formData.licenseNumber}
                  onChange={handleInputChange}
                  className="app-input"
                  required
                />
              </div>
              <div className="form-group" style={{ position: 'relative' }}>
                <label>المدينة</label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  className="app-input"
                  onFocus={() => setShowCitySuggestions(true)}
                  onBlur={() => setTimeout(() => setShowCitySuggestions(false), 100)}
                  autoComplete="off"
                  required
                />
                {showCitySuggestions && filteredCities.length > 0 && (
                  <ul className="suggestions-list">
                    {filteredCities.map(city => (
                      <li key={city.name} onMouseDown={() => handleCitySelect(city)}>
                        {city.name}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <div className="form-group">
                <label>الحالة</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="app-input"
                >
                  <option value="active">نشط</option>
                  <option value="inactive">غير نشط</option>
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="imageUrl">رابط الصورة (URL):</label>
                <input
                  type="text"
                  id="imageUrl"
                  name="imageUrl"
                  value={formData.imageUrl}
                  onChange={handleInputChange}
                  placeholder="أدخل رابط الصورة هنا"
                />
              </div>
              <div className="form-group">
                <label>رقم البطاقة الرمادية</label>
                <input
                  type="text"
                  name="grayCardNumber"
                  value={formData.grayCardNumber}
                  onChange={handleInputChange}
                  className="app-input"
                  placeholder="أدخل رقم البطاقة الرمادية"
                />
              </div>
              <div className="form-group">
                <label>صورة البطاقة الرمادية</label>
                <div className="image-upload-container">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e, 'grayCardImage')}
                    className="image-upload-input"
                    id="grayCardImage"
                  />
                  <label htmlFor="grayCardImage" className="image-upload-label">
                    <i className="fas fa-upload"></i>
                    اختر صورة البطاقة الرمادية
                  </label>
                  {formData.grayCardImage && (
                    <div className="image-preview">
                      <img src={formData.grayCardImage} alt="معاينة البطاقة الرمادية" />
                    </div>
                  )}
                </div>
              </div>
              <div className="form-group">
                <label>رقم البطاقة الوطنية</label>
                <input
                  type="text"
                  name="nationalIdNumber"
                  value={formData.nationalIdNumber}
                  onChange={handleInputChange}
                  className="app-input"
                  placeholder="أدخل رقم البطاقة الوطنية"
                />
              </div>
              <div className="form-group">
                <label>صورة البطاقة الوطنية</label>
                <div className="image-upload-container">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e, 'nationalIdImage')}
                    className="image-upload-input"
                    id="nationalIdImage"
                  />
                  <label htmlFor="nationalIdImage" className="image-upload-label">
                    <i className="fas fa-upload"></i>
                    اختر صورة البطاقة الوطنية
                  </label>
                  {formData.nationalIdImage && (
                    <div className="image-preview">
                      <img src={formData.nationalIdImage} alt="معاينة البطاقة الوطنية" />
                    </div>
                  )}
                </div>
              </div>
              <div className="modal-actions">
                <button type="submit" className="app-button primary">
                  {editingDriver ? 'حفظ التغييرات' : 'إضافة السائق'}
                </button>
                <button type="button" className="app-button" onClick={handleCloseModal}>
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showDriverDetailsModal && selectedDriverDetails && (
        <div className="modal-overlay" onClick={closeDriverDetailsModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>تفاصيل السائق</h3>
            <div className="driver-details-content">
              {selectedDriverDetails.imageUrl && (
                <img src={selectedDriverDetails.imageUrl} alt={selectedDriverDetails.name} className="driver-details-image" />
              )}
              {!selectedDriverDetails.imageUrl && (
                <img src="https://via.placeholder.com/120" alt="Placeholder" className="driver-details-image" />
              )}
              <p><strong>الاسم:</strong> {selectedDriverDetails.name}</p>
              <p><strong>رقم الهاتف:</strong> {selectedDriverDetails.phone}</p>
              <p><strong>رقم الرخصة:</strong> {selectedDriverDetails.licenseNumber}</p>
              <p><strong>المدينة:</strong> {selectedDriverDetails.city}</p>
              <p><strong>الحالة:</strong> {selectedDriverDetails.status}</p>
            </div>
            <div className="modal-actions">
              <button className="app-button secondary" onClick={closeDriverDetailsModal}>
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Image Modal */}
      {showImageModal && (
        <div className="image-modal-overlay" onClick={handleCloseImageModal}>
          <div className="image-modal-content" onClick={e => e.stopPropagation()}>
            <button className="close-image-modal" onClick={handleCloseImageModal}>
              <i className="fas fa-times"></i>
            </button>
            <h3>{selectedImageTitle}</h3>
            <div className="image-modal-container">
              <img src={selectedImage} alt={selectedImageTitle} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DriverManagement; 