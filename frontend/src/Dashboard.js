import React, { useState, useEffect } from 'react';

const Dashboard = () => {
  const [timePeriod, setTimePeriod] = useState('mois'); // Default to month
  const [consultations, setConsultations] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [totalNetProfit, setTotalNetProfit] = useState(0);
  const [topCities, setTopCities] = useState([]);

  useEffect(() => {
    const savedConsultations = localStorage.getItem('consultations');
    if (savedConsultations) {
      setConsultations(JSON.parse(savedConsultations));
    }
  }, []);

  useEffect(() => {
    // Function to filter and process data based on timePeriod
    const processData = () => {
      const now = new Date();
      let filteredConsultations = [];

      if (timePeriod === 'jour') {
        filteredConsultations = consultations.filter(c => {
          const consultationDate = new Date(c.date);
          return consultationDate.toDateString() === now.toDateString();
        });
      } else if (timePeriod === 'semaine') {
        const oneWeekAgo = new Date(now.setDate(now.getDate() - 7));
        filteredConsultations = consultations.filter(c => new Date(c.date) >= oneWeekAgo);
      } else if (timePeriod === 'mois') {
        const oneMonthAgo = new Date(now.setMonth(now.getMonth() - 1));
        filteredConsultations = consultations.filter(c => new Date(c.date) >= oneMonthAgo);
      } else if (timePeriod === '3mois') {
        const threeMonthsAgo = new Date(now.setMonth(now.getMonth() - 3));
        filteredConsultations = consultations.filter(c => new Date(c.date) >= threeMonthsAgo);
      } else if (timePeriod === 'année') {
        const oneYearAgo = new Date(now.setFullYear(now.getFullYear() - 1));
        filteredConsultations = consultations.filter(c => new Date(c.date) >= oneYearAgo);
      }

      // Calculate Top Products
      const productCounts = {};
      filteredConsultations.forEach(c => {
        if (c.productName) {
          productCounts[c.productName] = (productCounts[c.productName] || 0) + 1;
        }
      });
      const sortedProducts = Object.entries(productCounts)
        .sort(([, countA], [, countB]) => countB - countA)
        .map(([name, count]) => ({ name, count }));
      setTopProducts(sortedProducts);

      // Calculate Total Net Profit
      const totalProfit = filteredConsultations.reduce((sum, c) => {
        const netProfit = parseFloat(c.costDetails?.netProfit?.value) || 0;
        return sum + netProfit;
      }, 0);
      setTotalNetProfit(totalProfit);

      // Calculate Top Cities
      const cityCounts = {};
      filteredConsultations.forEach(c => {
        if (c.destination) {
          cityCounts[c.destination] = (cityCounts[c.destination] || 0) + 1;
        }
      });
      const sortedCities = Object.entries(cityCounts)
        .sort(([, countA], [, countB]) => countB - countA)
        .map(([name, count]) => ({ name, count }));
      setTopCities(sortedCities);
    };

    processData();
  }, [timePeriod, consultations]); // Re-run when timePeriod or consultations change

  return (
    <div className="dashboard-container">
      <h2 className="dashboard-header">Tableau de Bord</h2>
      <div className="time-period-filter-group">
        <label htmlFor="timePeriod" className="filter-label">Filtrer par période :</label>
        <select id="timePeriod" value={timePeriod} onChange={(e) => setTimePeriod(e.target.value)} className="filter-select">
          <option value="jour">Jour</option>
          <option value="semaine">Semaine</option>
          <option value="mois">Mois</option>
          <option value="3mois">3 Mois</option>
          <option value="année">Année</option>
        </select>
      </div>

      <div className="dashboard-section dashboard-card">
        <h3 className="section-title">Bénéfice Net Total :</h3>
        <p className="total-profit-display">
          {totalNetProfit.toFixed(2)} DH
        </p>
      </div>

      <div className="dashboard-section dashboard-card">
        <h3 className="section-title">Produits les plus demandés :</h3>
        {topProducts.length > 0 ? (
          <table className="dashboard-table">
            <thead>
              <tr>
                <th>Produit</th>
                <th>Demandes</th>
              </tr>
            </thead>
            <tbody>
              {topProducts.map((product, index) => (
                <tr key={index}>
                  <td>{product.name}</td>
                  <td>{product.count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="no-data-message">Aucun produit demandé pour cette période.</p>
        )}
      </div>

      <div className="dashboard-section dashboard-card">
        <h3 className="section-title">Villes les plus demandées :</h3>
        {topCities.length > 0 ? (
          <table className="dashboard-table">
            <thead>
              <tr>
                <th>Ville</th>
                <th>Demandes</th>
              </tr>
            </thead>
            <tbody>
              {topCities.map((city, index) => (
                <tr key={index}>
                  <td>{city.name}</td>
                  <td>{city.count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="no-data-message">Aucune ville demandée pour cette période.</p>
        )}
      </div>
    </div>
  );
};

export default Dashboard; 