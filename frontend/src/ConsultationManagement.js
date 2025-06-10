import React, { useState, useEffect } from 'react';
import './App.css'; // استخدم نفس ملف الـ CSS لتناسق التصميم

const ConsultationManagement = () => {
  const [consultations, setConsultations] = useState([]);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedConsultation, setSelectedConsultation] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState({ type: '', id: null });

  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification({ show: false, message: '', type: '' });
    }, 3000);
  };

  useEffect(() => {
    const storedConsultations = localStorage.getItem('consultations');
    if (storedConsultations) {
      try {
        const parsedConsultations = JSON.parse(storedConsultations);
        const consultationsWithConversionStatus = parsedConsultations.map(cons => ({
          ...cons,
          isConvertedToOrder: cons.isConvertedToOrder || false
        }));
        setConsultations(consultationsWithConversionStatus);
      } catch (error) {
        console.error('Erreur lors du chargement des consultations:', error);
        localStorage.removeItem('consultations');
      }
    }
  }, []);

  const handleDeleteConsultation = (id) => {
    setConfirmAction({ type: 'single', id });
    setShowConfirmModal(true);
  };

  const handleDeleteAllConsultations = () => {
    setConfirmAction({ type: 'all' });
    setShowConfirmModal(true);
  };

  const handleConfirmDelete = () => {
    if (confirmAction.type === 'all') {
      setConsultations([]);
      localStorage.removeItem('consultations');
      showNotification('Toutes les consultations ont été supprimées avec succès !');
    } else if (confirmAction.type === 'single') {
      const updatedConsultations = consultations.filter(cons => cons.id !== confirmAction.id);
      setConsultations(updatedConsultations);
      localStorage.setItem('consultations', JSON.stringify(updatedConsultations));
      showNotification('Consultation supprimée avec succès !');
    }
    setShowConfirmModal(false);
  };

  const handleViewDetails = (consultation) => {
    setSelectedConsultation(consultation);
    setShowDetailsModal(true);
  };

  const handleCloseDetailsModal = () => {
    setShowDetailsModal(false);
    setSelectedConsultation(null);
  };

  const filteredConsultations = consultations.filter(cons => {
    const matchesSearchQuery = cons.destination.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (!filterDate) {
      return matchesSearchQuery;
    }

    const consultationDate = new Date(cons.date);
    const filterDateTime = new Date(filterDate);

    return matchesSearchQuery && 
           consultationDate.getFullYear() === filterDateTime.getFullYear() &&
                        consultationDate.getMonth() === filterDateTime.getMonth() &&
                        consultationDate.getDate() === filterDateTime.getDate();
  });

  const handleConvertToOrder = (consultationToConvert) => {
    if (consultationToConvert.isConvertedToOrder) {
      showNotification('Cette consultation a déjà été convertie en commande.', 'error');
      return;
    }

    const existingOrders = JSON.parse(localStorage.getItem('savedOrders')) || [];
    const newOrder = { ...consultationToConvert, convertedAt: new Date().toISOString(), status: 'pending' };
    const updatedOrders = [...existingOrders, newOrder];
    localStorage.setItem('savedOrders', JSON.stringify(updatedOrders));
    
    const updatedConsultations = consultations.map(cons => 
      cons.id === consultationToConvert.id ? { ...cons, isConvertedToOrder: true } : cons
    );
    setConsultations(updatedConsultations);
    localStorage.setItem('consultations', JSON.stringify(updatedConsultations));

    showNotification(`Consultation pour ${consultationToConvert.destination} convertie en commande avec succès !`, 'success');
  };

  return (
    <div className="consultation-management-container">
      {notification.show && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          padding: '15px 25px',
          backgroundColor: notification.type === 'success' ? '#d4edda' : '#f8d7da',
          color: notification.type === 'success' ? '#155724' : '#721c24',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          animation: 'slideIn 0.3s ease-out',
          border: `1px solid ${notification.type === 'success' ? '#c3e6cb' : '#f5c6cb'}`
        }}>
          <div style={{
            width: '24px',
            height: '24px',
            borderRadius: '50%',
            backgroundColor: notification.type === 'success' ? '#28a745' : '#dc3545',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: '14px',
            fontWeight: 'bold'
          }}>
            {notification.type === 'success' ? '✓' : '!'}
          </div>
          <span style={{ fontWeight: '500' }}>{notification.message}</span>
        </div>
      )}

      <style>
        {`
          @keyframes slideIn {
            from {
              transform: translateX(100%);
              opacity: 0;
            }
            to {
              transform: translateX(0);
              opacity: 1;
            }
          }
        `}
      </style>

      <h2 className="page-title">Gestion des Consultations</h2>
      <div className="search-and-delete-section">
        <input
          type="text"
          placeholder="Rechercher par ville..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="consultation-search-input"
        />
        <input
          type="date"
          value={filterDate}
          onChange={(e) => setFilterDate(e.target.value)}
          className="consultation-date-input"
        />
        <button className="delete-all-button" onClick={handleDeleteAllConsultations}>
          Supprimer toutes les consultations
        </button>
      </div>
      {filteredConsultations.length === 0 ? (
        <p className="no-data-message">Aucune consultation enregistrée ne correspond aux critères de recherche.</p>
      ) : (
        <div className="consultations-list">
          {filteredConsultations.map(cons => (
              <div key={cons.id} className="consultation-card">
                <div className="card-header">
                <h3>Consultation du {cons.date} à {cons.time}</h3>
                  <button className="view-details-button" onClick={() => handleViewDetails(cons)}>
                  Voir les détails
                  </button>
                </div>
              <p><strong>Destination:</strong> {cons.destination}</p>
              <p><strong>Distance:</strong> {cons.distance} km</p>
              <p><strong>Coût total:</strong> {cons.totalCost} DH</p>
              <div className="card-actions">
                {!cons.isConvertedToOrder && (
                  <button className="btn btn-primary" onClick={() => handleConvertToOrder(cons)}>
                    <i className="fas fa-exchange-alt"></i> Convertir en Commande
                  </button>
                )}
                {cons.isConvertedToOrder && (
                  <button className="btn btn-secondary" disabled>
                    <i className="fas fa-check-circle"></i> Convertie en Commande
                  </button>
                )}
                {!cons.isConvertedToOrder && (
                  <button className="btn btn-danger" onClick={() => handleDeleteConsultation(cons.id)}>
                    <i className="fas fa-trash-alt"></i> Supprimer
                </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {showDetailsModal && selectedConsultation && (
        <div className="modal-overlay" onClick={handleCloseDetailsModal}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{
            backgroundColor: '#ffffff',
            borderRadius: '15px',
            boxShadow: '0 8px 30px rgba(0,0,0,0.25)',
            padding: '30px',
            width: '90%',
            maxWidth: '800px',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}>
            <div className="modal-header" style={{
              borderBottom: '2px solid #e9ecef',
              paddingBottom: '15px',
              marginBottom: '20px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <h2 style={{
                color: '#0056b3',
                margin: 0,
                fontSize: '24px',
                fontWeight: 'bold'
              }}>Détails de la Consultation</h2>
              <button className="close-button" onClick={handleCloseDetailsModal} style={{
                background: 'none',
                border: 'none',
                fontSize: '24px',
                color: '#666',
                cursor: 'pointer',
                padding: '5px'
              }}>×</button>
            </div>

            <div className="modal-body" style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '20px'
            }}>
              <div className="basic-info" style={{
                backgroundColor: '#f8f9fa',
                padding: '20px',
                borderRadius: '10px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
              }}>
                <h3 style={{
                  color: '#0056b3',
                  marginTop: 0,
                  marginBottom: '15px',
                  fontSize: '18px',
                  borderBottom: '1px solid #dee2e6',
                  paddingBottom: '10px'
                }}>Informations Générales</h3>
                <div style={{ display: 'grid', gap: '10px' }}>
                  <p style={{ margin: '5px 0' }}><strong style={{ color: '#495057' }}>Date:</strong> <span style={{ color: '#666' }}>{selectedConsultation.date} à {selectedConsultation.time}</span></p>
                  <p style={{ margin: '5px 0' }}><strong style={{ color: '#495057' }}>Point de départ:</strong> <span style={{ color: '#666' }}>{selectedConsultation.origin}</span></p>
                  <p style={{ margin: '5px 0' }}><strong style={{ color: '#495057' }}>Destination:</strong> <span style={{ color: '#666' }}>{selectedConsultation.destination}</span></p>
                  <p style={{ margin: '5px 0' }}><strong style={{ color: '#495057' }}>Distance:</strong> <span style={{ color: '#666' }}>{selectedConsultation.distance} km</span></p>
                  <p style={{ margin: '5px 0' }}><strong style={{ color: '#495057' }}>Produit:</strong> <span style={{ color: '#666' }}>{selectedConsultation.productName}</span></p>
                  <p style={{ margin: '5px 0' }}><strong style={{ color: '#495057' }}>Quantité:</strong> <span style={{ color: '#666' }}>{selectedConsultation.quantity}</span></p>
                </div>
              </div>

              <div className="cost-info" style={{
                backgroundColor: '#f8f9fa',
                padding: '20px',
                borderRadius: '10px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
              }}>
                <h3 style={{
                  color: '#0056b3',
                  marginTop: 0,
                  marginBottom: '15px',
                  fontSize: '18px',
                  borderBottom: '1px solid #dee2e6',
                  paddingBottom: '10px'
                }}>Détails des Coûts</h3>
                <div style={{ display: 'grid', gap: '10px' }}>
                  <p style={{ margin: '5px 0' }}><strong style={{ color: '#495057' }}>Prix par km:</strong> <span style={{ color: '#666' }}>{selectedConsultation.pricePerKm} DH</span></p>
                  <p style={{ margin: '5px 0' }}><strong style={{ color: '#495057' }}>Salaire mensuel du chauffeur:</strong> <span style={{ color: '#666' }}>{selectedConsultation.monthlyDriverSalary} DH</span></p>
                  <p style={{ margin: '5px 0' }}><strong style={{ color: '#495057' }}>Pourcentage de réduction:</strong> <span style={{ color: '#666' }}>{selectedConsultation.discountPercentage}%</span></p>
                  <p style={{ margin: '5px 0' }}><strong style={{ color: '#495057' }}>Déchargement requis:</strong> <span style={{ color: '#666' }}>{selectedConsultation.requiresUnloading ? 'Oui' : 'Non'}</span></p>
                  <p style={{ margin: '5px 0' }}><strong style={{ color: '#495057' }}>Déchargement le lendemain:</strong> <span style={{ color: '#666' }}>{selectedConsultation.unloadingNextDay ? 'Oui' : 'Non'}</span></p>
                </div>
              </div>

              <div className="cost-breakdown" style={{
                gridColumn: '1 / -1',
                backgroundColor: '#f8f9fa',
                padding: '20px',
                borderRadius: '10px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
              }}>
                <h3 style={{
                  color: '#0056b3',
                  marginTop: 0,
                  marginBottom: '15px',
                  fontSize: '18px',
                  borderBottom: '1px solid #dee2e6',
                  paddingBottom: '10px'
                }}>Détail des Coûts</h3>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                  gap: '15px'
                }}>
                  {selectedConsultation.costDetails && Object.entries(selectedConsultation.costDetails).map(([key, item]) => (
                    <div key={key} style={{
                      backgroundColor: '#fff',
                      padding: '15px',
                      borderRadius: '8px',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                    }}>
                      <p style={{ margin: '0 0 10px 0' }}>
                        <strong style={{ color: '#0056b3' }}>{item.label}:</strong>
                        <span style={{ color: '#28a745', fontWeight: 'bold', marginLeft: '5px' }}>
                          {item.value} {item.unit || ''}
                        </span>
                      </p>
                  {item.details && Object.entries(item.details).map(([subKey, subItem]) => (
                        <p key={subKey} style={{
                          margin: '5px 0',
                          paddingLeft: '15px',
                          borderLeft: '2px solid #e9ecef',
                          fontSize: '0.9em',
                          color: '#666'
                        }}>
                          {subItem.label}: <span style={{ color: '#495057', fontWeight: '500' }}>
                            {subItem.value} {subItem.unit || ''}
                          </span>
                    </p>
                  ))}
                </div>
              ))}
            </div>
              </div>

              <div className="total-cost" style={{
                gridColumn: '1 / -1',
                backgroundColor: '#e8f4ff',
                padding: '20px',
                borderRadius: '10px',
                textAlign: 'center',
                border: '2px solid #0056b3'
              }}>
                <h3 style={{
                  color: '#0056b3',
                  margin: '0 0 10px 0',
                  fontSize: '20px'
                }}>Coût Total</h3>
                <p style={{
                  fontSize: '24px',
                  fontWeight: 'bold',
                  color: '#0056b3',
                  margin: 0
                }}>{selectedConsultation.totalCost} DH</p>
              </div>
            </div>

            <div className="modal-footer" style={{
              marginTop: '20px',
              paddingTop: '20px',
              borderTop: '1px solid #dee2e6',
              textAlign: 'right'
            }}>
              <button onClick={handleCloseDetailsModal} style={{
                backgroundColor: '#6c757d',
                color: 'white',
                border: 'none',
                padding: '10px 20px',
                borderRadius: '5px',
                cursor: 'pointer',
                fontSize: '16px',
                transition: 'background-color 0.3s'
              }}>Fermer</button>
            </div>
          </div>
        </div>
      )}

      {showConfirmModal && (
        <div className="modal-overlay" style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '30px',
            borderRadius: '15px',
            boxShadow: '0 8px 30px rgba(0,0,0,0.25)',
            width: '90%',
            maxWidth: '500px',
            textAlign: 'center'
          }}>
            <div style={{
              width: '60px',
              height: '60px',
              margin: '0 auto 20px',
              backgroundColor: '#fff3cd',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <span style={{
                fontSize: '30px',
                color: '#856404'
              }}>⚠️</span>
            </div>
            
            <h3 style={{
              color: '#333',
              fontSize: '20px',
              marginBottom: '15px',
              fontWeight: 'bold'
            }}>
              {confirmAction.type === 'all' 
                ? 'Supprimer toutes les consultations ?'
                : 'Supprimer cette consultation ?'}
            </h3>
            
            <p style={{
              color: '#666',
              marginBottom: '25px',
              lineHeight: '1.5'
            }}>
              {confirmAction.type === 'all'
                ? 'Cette action supprimera définitivement toutes les consultations enregistrées. Cette action est irréversible.'
                : 'Cette action supprimera définitivement cette consultation. Cette action est irréversible.'}
            </p>

            <div style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '15px'
            }}>
              <button
                onClick={() => setShowConfirmModal(false)}
                style={{
                  padding: '12px 25px',
                  backgroundColor: '#6c757d',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '16px',
                  transition: 'background-color 0.3s',
                  minWidth: '120px'
                }}
                onMouseOver={(e) => e.target.style.backgroundColor = '#5a6268'}
                onMouseOut={(e) => e.target.style.backgroundColor = '#6c757d'}
              >
                Annuler
              </button>
              <button
                onClick={handleConfirmDelete}
                style={{
                  padding: '12px 25px',
                  backgroundColor: '#dc3545',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '16px',
                  transition: 'background-color 0.3s',
                  minWidth: '120px'
                }}
                onMouseOver={(e) => e.target.style.backgroundColor = '#c82333'}
                onMouseOut={(e) => e.target.style.backgroundColor = '#dc3545'}
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConsultationManagement; 