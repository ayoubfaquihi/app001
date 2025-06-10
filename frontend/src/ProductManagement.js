import React, { useState, useEffect } from 'react';
import './App.css';

const ProductManagement = () => {
  const [products, setProducts] = useState(() => {
    const savedProducts = localStorage.getItem('products');
    return savedProducts ? JSON.parse(savedProducts) : [];
  });
  const [newProductName, setNewProductName] = useState('');
  const [newProductDescription, setNewProductDescription] = useState('');
  const [newProductImages, setNewProductImages] = useState([]);
  const [editingProduct, setEditingProduct] = useState(null);
  const [showProductModal, setShowProductModal] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [currentImages, setCurrentImages] = useState([]);
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState({ type: '', id: null });

  useEffect(() => {
    localStorage.setItem('products', JSON.stringify(products));
  }, [products]);

  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification({ show: false, message: '', type: '' });
    }, 3000);
  };

  const openAddModal = () => {
    setEditingProduct(null);
    setNewProductName('');
    setNewProductDescription('');
    setNewProductImages([]);
    setShowProductModal(true);
  };

  const openEditModal = (product) => {
    setEditingProduct(product);
    setNewProductName(product.name);
    setNewProductDescription(product.description);
    setNewProductImages(product.images || []);
    setShowProductModal(true);
  };

  const closeProductModal = () => {
    setShowProductModal(false);
    setEditingProduct(null);
    setNewProductName('');
    setNewProductDescription('');
    setNewProductImages([]);
  };

  const openImageModal = (images, index) => {
    setCurrentImages(images);
    setCurrentImageIndex(index);
    setShowImageModal(true);
  };

  const closeImageModal = () => {
    setShowImageModal(false);
    setCurrentImages([]);
    setCurrentImageIndex(0);
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const newUploadedImages = [];

    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        newUploadedImages.push(reader.result);
        if (newUploadedImages.length === files.length) {
          setNewProductImages(prevImages => [...prevImages, ...newUploadedImages]);
        }
      };
      reader.readAsDataURL(file);
    });
    e.target.value = null;
  };

  const handleRemoveImage = (indexToRemove) => {
    setNewProductImages(prevImages => prevImages.filter((_, index) => index !== indexToRemove));
  };

  const handleAddProduct = () => {
    if (newProductName.trim() === '') {
      showNotification('Veuillez entrer un nom de produit.', 'error');
      return;
    }

    const newProduct = {
      id: Date.now(),
      name: newProductName.trim(),
      description: newProductDescription.trim(),
      images: newProductImages,
    };

    setProducts([...products, newProduct]);
    closeProductModal();
    showNotification('Produit ajouté avec succès !');
  };

  const handleUpdateProduct = () => {
    if (newProductName.trim() === '') {
      showNotification('Veuillez entrer un nom de produit.', 'error');
      return;
    }

    setProducts(products.map(product =>
      product.id === editingProduct.id
        ? { ...product, name: newProductName.trim(), description: newProductDescription.trim(), images: newProductImages }
        : product
    ));
    closeProductModal();
    showNotification('Produit mis à jour avec succès !');
  };

  const handleDeleteProduct = (id) => {
    setConfirmAction({ type: 'single', id });
    setShowConfirmModal(true);
  };

  const handleDeleteAllProducts = () => {
    setConfirmAction({ type: 'all' });
    setShowConfirmModal(true);
  };

  const handleConfirmDelete = () => {
    if (confirmAction.type === 'all') {
      setProducts([]);
      showNotification('Tous les produits ont été supprimés avec succès !');
    } else if (confirmAction.type === 'single') {
      setProducts(products.filter(product => product.id !== confirmAction.id));
      showNotification('Produit supprimé avec succès !');
    }
    setShowConfirmModal(false);
  };

  return (
    <div className="product-management-container">
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

      <div className="section-header" style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '30px',
        padding: '20px',
        backgroundColor: '#f8f9fa',
        borderRadius: '10px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
      }}>
        <h1 style={{ margin: 0, color: '#0056b3' }}>Gestion des Produits</h1>
        <div style={{ display: 'flex', gap: '15px' }}>
          <button onClick={openAddModal} className="app-button success">
            <i className="fas fa-plus"></i> Ajouter un produit
          </button>
          <button onClick={handleDeleteAllProducts} className="app-button danger">
            <i className="fas fa-trash"></i> Supprimer tout
          </button>
        </div>
      </div>

      <div className="product-list-section">
        <h2 style={{ color: '#495057', marginBottom: '20px' }}>Produits Disponibles</h2>
        {products.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '40px',
            backgroundColor: '#f8f9fa',
            borderRadius: '10px',
            color: '#6c757d'
          }}>
            <p>Aucun produit disponible. Commencez par ajouter des produits !</p>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '20px'
          }}>
            {products.map((product) => (
              <div key={product.id} style={{
                backgroundColor: 'white',
                borderRadius: '10px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                overflow: 'hidden'
              }}>
                <div style={{
                  padding: '15px',
                  borderBottom: '1px solid #e9ecef'
                }}>
                  <h3 style={{ margin: 0, color: '#0056b3' }}>{product.name}</h3>
                </div>
                {product.images && product.images.length > 0 && (
                  <div style={{
                    position: 'relative',
                    cursor: 'pointer'
                  }} onClick={() => openImageModal(product.images, 0)}>
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      style={{
                        width: '100%',
                        height: '200px',
                        objectFit: 'cover'
                      }}
                    />
                      {product.images.length > 1 && (
                      <span style={{
                        position: 'absolute',
                        top: '10px',
                        right: '10px',
                        backgroundColor: 'rgba(0,0,0,0.7)',
                        color: 'white',
                        padding: '5px 10px',
                        borderRadius: '15px',
                        fontSize: '14px'
                      }}>
                        +{product.images.length - 1}
                      </span>
                      )}
                  </div>
                )}
                {product.description && (
                  <p style={{
                    padding: '15px',
                    margin: 0,
                    color: '#666',
                    borderBottom: '1px solid #e9ecef'
                  }}>
                    {product.description}
                  </p>
                )}
                <div style={{
                  padding: '15px',
                  display: 'flex',
                  gap: '10px'
                }}>
                  <button onClick={() => openEditModal(product)} className="app-button info product-card-action-button">
                    <i className="fas fa-edit"></i> Modifier
                  </button>
                  <button onClick={() => handleDeleteProduct(product.id)} className="app-button danger product-card-action-button">
                    <i className="fas fa-trash"></i> Supprimer
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showProductModal && (
        <div className="modal-overlay" onClick={closeProductModal} style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{
            backgroundColor: 'white',
            padding: '30px',
            borderRadius: '15px',
            width: '90%',
            maxWidth: '600px',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}>
            <div className="modal-header" style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '20px',
              paddingBottom: '15px',
              borderBottom: '1px solid #e9ecef'
            }}>
              <h3 style={{ margin: 0, color: '#0056b3' }}>
                {editingProduct ? 'Modifier le Produit' : 'Ajouter un Nouveau Produit'}
              </h3>
              <button onClick={closeProductModal} style={{
                background: 'none',
                border: 'none',
                fontSize: '24px',
                color: '#666',
                cursor: 'pointer'
              }}>&times;</button>
            </div>
            <div className="modal-body">
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', color: '#495057' }}>
                  Nom du Produit
                </label>
                <input
                  type="text"
                  value={newProductName}
                  onChange={(e) => setNewProductName(e.target.value)}
                  placeholder="Entrez le nom du produit"
                  style={{
                    width: '100%',
                    padding: '10px',
                    borderRadius: '5px',
                    border: '1px solid #ced4da',
                    fontSize: '16px'
                  }}
                />
              </div>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', color: '#495057' }}>
                  Description (optionnelle)
                </label>
                <textarea
                  value={newProductDescription}
                  onChange={(e) => setNewProductDescription(e.target.value)}
                  placeholder="Entrez la description du produit"
                  rows="3"
                  style={{
                    width: '100%',
                    padding: '10px',
                    borderRadius: '5px',
                    border: '1px solid #ced4da',
                    fontSize: '16px',
                    resize: 'vertical'
                  }}
                ></textarea>
              </div>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', color: '#495057' }}>
                  Images
                </label>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  style={{ marginBottom: '10px' }}
                />
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))',
                  gap: '10px'
                }}>
                    {newProductImages.map((image, index) => (
                    <div key={index} style={{ position: 'relative' }}>
                      <img
                        src={image}
                        alt={`Preview ${index + 1}`}
                        style={{
                          width: '100%',
                          height: '100px',
                          objectFit: 'cover',
                          borderRadius: '5px'
                        }}
                      />
                      <button
                        onClick={() => handleRemoveImage(index)}
                        style={{
                          position: 'absolute',
                          top: '5px',
                          right: '5px',
                          backgroundColor: 'rgba(220, 53, 69, 0.9)',
                          color: 'white',
                          border: 'none',
                          borderRadius: '50%',
                          width: '24px',
                          height: '24px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        ×
                        </button>
                      </div>
                    ))}
                  </div>
              </div>
            </div>
            <div className="modal-footer" style={{
              marginTop: '20px',
              paddingTop: '20px',
              borderTop: '1px solid #e9ecef',
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '10px'
            }}>
              <button onClick={closeProductModal} className="app-button secondary">
                Annuler
              </button>
              <button
                onClick={editingProduct ? handleUpdateProduct : handleAddProduct}
                className="app-button success"
              >
                {editingProduct ? 'Mettre à jour' : 'Ajouter'}
              </button>
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
                ? 'Supprimer tous les produits ?'
                : 'Supprimer ce produit ?'}
            </h3>
            
            <p style={{
              color: '#666',
              marginBottom: '25px',
              lineHeight: '1.5'
            }}>
              {confirmAction.type === 'all'
                ? 'Cette action supprimera définitivement tous les produits. Cette action est irréversible.'
                : 'Cette action supprimera définitivement ce produit. Cette action est irréversible.'}
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
                  minWidth: '120px',
                }}
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
                  minWidth: '120px',
                }}
                className="app-button danger"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}

      {showImageModal && (
        <div className="image-modal-overlay" onClick={closeImageModal}>
          <div className="image-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="image-modal-header">
              <h3>صورة المنتج ({currentImageIndex + 1} من {currentImages.length})</h3>
              <button className="close-image-modal" onClick={closeImageModal}>
                &times;
              </button>
            </div>
            <div className="image-modal-container">
              {currentImages.length > 0 && (
                <img src={currentImages[currentImageIndex]} alt="صورة المنتج" />
              )}
              {currentImages.length > 1 && (
                <>
                  <button 
                    className="carousel-nav-button prev"
                    onClick={(e) => {
                      e.stopPropagation();
                      setCurrentImageIndex(prevIndex => 
                        prevIndex === 0 ? currentImages.length - 1 : prevIndex - 1
                      );
                    }}
                  >
                    &lt;
                  </button>
                  <button 
                    className="carousel-nav-button next"
                    onClick={(e) => {
                      e.stopPropagation();
                      setCurrentImageIndex(prevIndex => 
                        prevIndex === currentImages.length - 1 ? 0 : prevIndex + 1
                      );
                    }}
                  >
                    &gt;
                  </button>
                </>
              )}
            </div>
          </div>
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
    </div>
  );
};

export default ProductManagement; 