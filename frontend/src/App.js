import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import MapComponent from './MapComponent';
import CityManagement from './CityManagement';
import DriverManagement from './DriverManagement';
import ConsultationManagement from './ConsultationManagement';
import ProductManagement from './ProductManagement';
import Dashboard from './Dashboard';
import OrderManagement from './OrderManagement';
import './App.css';

function App() {
  const [cities, setCities] = useState(() => {
    const savedCities = localStorage.getItem('cities');
    let initialCities = savedCities ? JSON.parse(savedCities) : [];

    // Ensure 'JET MODULAIRE' is always in the cities list with distance 0 if not present
    const jetModulaireExists = initialCities.some(city => city.name === "JET MODULAIRE");
    if (!jetModulaireExists) {
      initialCities = [{ name: "JET MODULAIRE", distance: 0 }, ...initialCities];
    }
    return initialCities;
  });

  const [isSidebarOpen, setIsSidebarOpen] = useState(true); // Default to open

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // حفظ المدن في Local Storage عند التغيير
  useEffect(() => {
    localStorage.setItem('cities', JSON.stringify(cities));
  }, [cities]);

  return (
    <Router>
      <div className="app-container">
        <header className="app-header">
          <h1>Calculateur de Coûts d'Expédition</h1>
        </header>
        
        <button className="sidebar-toggle-button" onClick={toggleSidebar}>
          <i className={isSidebarOpen ? "fas fa-times" : "fas fa-bars"}></i>
        </button>

        <div className={`main-layout ${!isSidebarOpen ? 'sidebar-hidden' : ''}`}>
          <aside className={`sidebar ${!isSidebarOpen ? 'hidden' : ''}`}>
            <nav className="sidebar-nav">
              <Link to="/dashboard" className="sidebar-button" onClick={() => setIsSidebarOpen(false)}>
                <i className="fas fa-tachometer-alt"></i>
                Tableau de Bord
              </Link>
              <Link to="/" className="sidebar-button" onClick={() => setIsSidebarOpen(false)}>
                <i className="fas fa-calculator"></i>
                Calculateur de Coûts
              </Link>
              <Link to="/cities" className="sidebar-button" onClick={() => setIsSidebarOpen(false)}>
                <i className="fas fa-city"></i>
                Gestion des Villes
              </Link>
              <Link to="/drivers" className="sidebar-button" onClick={() => setIsSidebarOpen(false)}>
                <i className="fas fa-user-tie"></i>
                Gestion des Chauffeurs
              </Link>
              <Link to="/consultations" className="sidebar-button" onClick={() => setIsSidebarOpen(false)}>
                <i className="fas fa-book"></i>
                Gestion des Consultations
              </Link>
              <Link to="/products" className="sidebar-button" onClick={() => setIsSidebarOpen(false)}>
                <i className="fas fa-box"></i>
                Gestion des Produits
              </Link>
              <Link to="/orders" className="sidebar-button" onClick={() => setIsSidebarOpen(false)}>
                <i className="fas fa-clipboard-list"></i>
                Gestion des Commandes
              </Link>
            </nav>
          </aside>
          
          <main className="main-content">
            <Routes>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/" element={<MapComponent cities={cities} />} />
              <Route path="/cities" element={<CityManagement cities={cities} setCities={setCities} />} />
              <Route path="/drivers" element={<DriverManagement cities={cities} />} />
              <Route path="/consultations" element={<ConsultationManagement />} />
              <Route path="/products" element={<ProductManagement />} />
              <Route path="/orders" element={<OrderManagement />} />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
}

export default App;
