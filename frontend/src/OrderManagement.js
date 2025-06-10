import React, { useState, useEffect } from 'react';
import './App.css';

const OrderManagement = () => {
  const [orders, setOrders] = useState([]);
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });
  const [showDeliveryModal, setShowDeliveryModal] = useState(false);
  const [currentDeliveryOrder, setCurrentDeliveryOrder] = useState(null);
  const [startOdometer, setStartOdometer] = useState('');
  const [showFuelModal, setShowFuelModal] = useState(false);
  const [fuelAmount, setFuelAmount] = useState('');
  const [fuelCost, setFuelCost] = useState('');
  const [fuelOdometer, setFuelOdometer] = useState('');
  const [showTollModal, setShowTollModal] = useState(false);
  const [tollStations, setTollStations] = useState([
    { id: 1, name: 'Station 1' },
    { id: 2, name: 'Station 2' },
    { id: 3, name: 'Station 3' }
  ]);
  const [currentTollStation, setCurrentTollStation] = useState('');
  const [tollAmount, setTollAmount] = useState('');
  const [showEndDeliveryModal, setShowEndDeliveryModal] = useState(false);
  const [endOdometer, setEndOdometer] = useState('');

  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification({ show: false, message: '', type: '' });
    }, 3000);
  };

  useEffect(() => {
    const storedOrders = localStorage.getItem('savedOrders');
    if (storedOrders) {
      try {
        const parsedOrders = JSON.parse(storedOrders);
        const ordersWithStatus = parsedOrders.map(order => ({
          ...order,
          status: order.status || 'pending'
        }));
        setOrders(ordersWithStatus);
        localStorage.setItem('savedOrders', JSON.stringify(ordersWithStatus));
      } catch (error) {
        console.error('Erreur lors du chargement des commandes:', error);
        localStorage.removeItem('savedOrders');
      }
    }
  }, []);

  const handleStartDelivery = (order) => {
    setCurrentDeliveryOrder(order);
    setShowDeliveryModal(true);
  };

  const handleConfirmStartDelivery = () => {
    if (!startOdometer) {
      showNotification('Veuillez entrer le kilométrage de départ.', 'error');
      return;
    }
    const updatedOrders = orders.map(order => {
      if (order.id === currentDeliveryOrder.id) {
        return { 
          ...order, 
          status: 'in_progress', 
          startOdometer: parseInt(startOdometer),
          startTime: new Date().toISOString()
        };
      }
      return order;
    });
    setOrders(updatedOrders);
    localStorage.setItem('savedOrders', JSON.stringify(updatedOrders));
    console.log('Orders after start delivery:', updatedOrders);
    setShowDeliveryModal(false);
    setStartOdometer('');
    showNotification('Livraison démarrée avec succès !');
  };

  const handleCompleteDelivery = (order) => {
    setCurrentDeliveryOrder(order);
    setShowEndDeliveryModal(true);
  };

  const handleConfirmEndDelivery = () => {
    if (!endOdometer) {
      showNotification('Veuillez entrer le kilométrage d\'arrivée.', 'error');
      return;
    }
    const updatedOrders = orders.map(order => {
      if (order.id === currentDeliveryOrder.id) {
        return { 
          ...order, 
          status: 'completed', 
          endOdometer: parseInt(endOdometer),
          endTime: new Date().toISOString()
        };
      }
      return order;
    });
    setOrders(updatedOrders);
    localStorage.setItem('savedOrders', JSON.stringify(updatedOrders));
    console.log('Orders after complete delivery:', updatedOrders);
    setShowEndDeliveryModal(false);
    setEndOdometer('');
    showNotification('Livraison terminée avec succès !');
  };

  const handleLogFuel = (order) => {
    setCurrentDeliveryOrder(order);
    setShowFuelModal(true);
  };

  const handleConfirmFuelLog = () => {
    if (!fuelAmount || !fuelCost || !fuelOdometer) {
      showNotification('Veuillez remplir tous les champs.', 'error');
      return;
    }
    const updatedOrders = orders.map(order => {
      if (order.id === currentDeliveryOrder.id) {
        return { ...order, fuelAmount: parseFloat(fuelAmount), fuelCost: parseFloat(fuelCost), fuelOdometer: parseFloat(fuelOdometer) };
      }
      return order;
    });
    setOrders(updatedOrders);
    localStorage.setItem('savedOrders', JSON.stringify(updatedOrders));
    setShowFuelModal(false);
    setFuelAmount('');
    setFuelCost('');
    setFuelOdometer('');
    showNotification('Enregistrement du carburant effectué avec succès !');
  };

  const handleLogToll = (order) => {
    setCurrentDeliveryOrder(order);
    setShowTollModal(true);
  };

  const handleConfirmTollLog = () => {
    if (!currentTollStation || !tollAmount) {
      showNotification('Veuillez sélectionner une station et entrer le montant du péage.', 'error');
      return;
    }
    const updatedOrders = orders.map(order => {
      if (order.id === currentDeliveryOrder.id) {
        return { ...order, tollStation: currentTollStation, tollAmount: parseFloat(tollAmount) };
      }
      return order;
    });
    setOrders(updatedOrders);
    localStorage.setItem('savedOrders', JSON.stringify(updatedOrders));
    setShowTollModal(false);
    setCurrentTollStation('');
    setTollAmount('');
    showNotification('Enregistrement du péage effectué avec succès !');
  };

  return (
    <div className="order-management-container">
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

      <h2 className="page-title">Gestion des Commandes</h2>

      {orders.length === 0 ? (
        <p className="no-data-message">Aucune commande enregistrée pour le moment.</p>
      ) : (
        <div className="orders-list">
          {orders.map(order => {
            console.log(`Order ID: ${order.id}, Status: ${order.status}`);
            return (
              <div key={order.id} className="order-card">
                <div className="card-header">
                  <h3>Commande du {order.date} à {order.time}</h3>
                  <span className={`status-badge ${order.status}`}>
                    {order.status === 'pending' ? 'En attente' : 
                     order.status === 'in_progress' ? 'En cours' : 
                     'Terminée'}
                  </span>
                </div>
                <p><strong>Produit:</strong> {order.productName || 'N/A'}</p>
                <p><strong>Destination:</strong> {order.destination}</p>
                <p><strong>Distance:</strong> {order.distance} km</p>
                <p><strong>Coût total:</strong> {order.totalCost} DH</p>
                
                {(order.startOdometer || order.endOdometer) && (
                  <div className="delivery-details">
                    <h4>Détails de la Livraison</h4>
                    {order.startOdometer && (
                      <p><strong>Kilométrage de départ:</strong> {order.startOdometer} km</p>
                    )}
                    {order.endOdometer && (
                      <p><strong>Kilométrage d'arrivée:</strong> {order.endOdometer} km</p>
                    )}
                    {order.startOdometer && order.endOdometer && (
                      <p><strong>Distance parcourue:</strong> {order.endOdometer - order.startOdometer} km</p>
                    )}
                  </div>
                )}
                
                {(order.fuelAmount || order.tollStation) && (
                  <div className="expenses-details">
                    <h4>Dépenses</h4>
                    {order.fuelAmount && (
                      <p><strong>Carburant:</strong> {order.fuelAmount} L, Coût: {order.fuelCost} DH, Kilométrage: {order.fuelOdometer} km</p>
                    )}
                    {order.tollStation && (
                      <p><strong>Péage:</strong> Station {order.tollStation}, Montant: {order.tollAmount} DH</p>
                    )}
                  </div>
                )}
                
                {order.status === 'pending' && (
                  <button className="start-delivery-button" onClick={() => handleStartDelivery(order)}>
                    Démarrer la Livraison
                  </button>
                )}
                {order.status === 'in_progress' && (
                  <>
                    <button className="complete-delivery-button" onClick={() => handleCompleteDelivery(order)}>
                      Terminer la Livraison
                    </button>
                    <button className="log-fuel-button" onClick={() => handleLogFuel(order)}>
                      Enregistrer le Carburant
                    </button>
                    <button className="log-toll-button" onClick={() => handleLogToll(order)}>
                      Enregistrer le Péage
                    </button>
                  </>
                )}
              </div>
            );
          })}
        </div>
      )}

      {showDeliveryModal && currentDeliveryOrder && (
        <div className="modal-overlay" onClick={() => setShowDeliveryModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3>Démarrer la Livraison</h3>
            <p>Commande pour {currentDeliveryOrder.destination}</p>
            <input
              type="number"
              placeholder="Kilométrage de départ"
              value={startOdometer}
              onChange={(e) => setStartOdometer(e.target.value)}
            />
            <button onClick={handleConfirmStartDelivery}>Confirmer le Départ</button>
          </div>
        </div>
      )}

      {showEndDeliveryModal && currentDeliveryOrder && (
        <div className="modal-overlay" onClick={() => setShowEndDeliveryModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3>Terminer la Livraison</h3>
            <p>Commande pour {currentDeliveryOrder.destination}</p>
            <input
              type="number"
              placeholder="Kilométrage d'arrivée"
              value={endOdometer}
              onChange={(e) => setEndOdometer(e.target.value)}
            />
            <button onClick={handleConfirmEndDelivery}>Confirmer l'Arrivée</button>
          </div>
        </div>
      )}

      {showFuelModal && currentDeliveryOrder && (
        <div className="modal-overlay" onClick={() => setShowFuelModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3>Enregistrer le Carburant</h3>
            <p>Commande pour {currentDeliveryOrder.destination}</p>
            <input
              type="number"
              placeholder="Quantité de carburant (L)"
              value={fuelAmount}
              onChange={(e) => setFuelAmount(e.target.value)}
            />
            <input
              type="number"
              placeholder="Coût du carburant (DH)"
              value={fuelCost}
              onChange={(e) => setFuelCost(e.target.value)}
            />
            <input
              type="number"
              placeholder="Kilométrage au ravitaillement"
              value={fuelOdometer}
              onChange={(e) => setFuelOdometer(e.target.value)}
            />
            <button onClick={handleConfirmFuelLog}>Confirmer</button>
          </div>
        </div>
      )}

      {showTollModal && currentDeliveryOrder && (
        <div className="modal-overlay" onClick={() => setShowTollModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3>Enregistrer le Péage</h3>
            <p>Commande pour {currentDeliveryOrder.destination}</p>
            <select
              value={currentTollStation}
              onChange={(e) => setCurrentTollStation(e.target.value)}
            >
              <option value="">Sélectionner une station</option>
              {tollStations.map(station => (
                <option key={station.id} value={station.id}>{station.name}</option>
              ))}
            </select>
            <input
              type="number"
              placeholder="Montant du péage (DH)"
              value={tollAmount}
              onChange={(e) => setTollAmount(e.target.value)}
            />
            <button onClick={handleConfirmTollLog}>Confirmer</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderManagement; 