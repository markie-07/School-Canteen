import UserLayout from '@/Layouts/UserLayout';
import Modal from '@/Components/Modal';
import { Head } from '@inertiajs/react';
import React, { useState } from 'react';
import axios from 'axios';

export default function UserOrder({ vendors }) {
    const [selectedVendor, setSelectedVendor] = useState(null);
    const [menuItems, setMenuItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [quantity, setQuantity] = useState(1);
    const [adding, setAdding] = useState(false);
    const [showCartModal, setShowCartModal] = useState(false);
    const [itemNotes, setItemNotes] = useState('');

    const getImageUrl = (path, fallback) => {
        if (!path) return fallback;
        if (path.startsWith('http')) return path;
        
        // If it already has /storage/ or storage/, just ensure it starts with /
        if (path.includes('storage/')) {
            return path.startsWith('/') ? path : `/${path}`;
        }
        
        // Ensure the path starts with /storage/ and doesn't have double slashes
        const cleanPath = path.startsWith('/') ? path.substring(1) : path;
        return `/storage/${cleanPath}`;
    };

    const fetchVendorMenu = async (vendor) => {
        setLoading(true);
        setSelectedVendor(vendor);
        try {
            const response = await axios.get(route('user.vendor.menu', vendor.id));
            setMenuItems(response.data.menuItems);
        } catch (error) {
            console.error("Error fetching menu:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleBack = () => {
        setSelectedVendor(null);
        setMenuItems([]);
    };

    const openItemDetails = (item) => {
        setSelectedItem(item);
        setCurrentImageIndex(0);
        setQuantity(1);
        setItemNotes('');
    };

    const closeItemDetails = () => {
        setSelectedItem(null);
        setQuantity(1);
        setItemNotes('');
    };

    const handleIncrement = () => setQuantity(q => q + 1);
    const handleDecrement = () => setQuantity(q => q > 1 ? q - 1 : 1);

    const handleAddToOrder = () => {
        setAdding(true);
        
        const orderItem = {
            ...selectedItem,
            quantity: quantity,
            notes: itemNotes.trim(),
            totalPrice: selectedItem.price * quantity,
            vendor_id: selectedVendor.id
        };

        // Update Global Cart via LocalStorage
        const existingCart = JSON.parse(localStorage.getItem('school_canteen_cart') || '[]');
        const newCart = [...existingCart, orderItem];
        localStorage.setItem('school_canteen_cart', JSON.stringify(newCart));
        
        // Notify Layout to update its state
        window.dispatchEvent(new Event('cart-updated'));

        setTimeout(() => {
            setAdding(false);
            closeItemDetails();
        }, 600);
    };

    return (
        <UserLayout header={<h2>{selectedVendor ? selectedVendor.store_name || selectedVendor.name : 'Choose a Store'}</h2>}>
            <Head title="Order Food" />

            <div className="order-container">
                {!selectedVendor ? (
                    <div className="vendors-grid-premium">
                        {vendors.map((vendor) => (
                            <div key={vendor.id} className="store-card-premium" onClick={() => fetchVendorMenu(vendor)}>
                                <div className="store-cover-wrapper">
                                    <img 
                                        src={getImageUrl(vendor.cover_photo, 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=600&q=80')} 
                                        className="store-cover" 
                                        alt="cover" 
                                    />
                                    <div className="store-status-tag">{vendor.status || 'Open'}</div>
                                    <div className="store-rating-tag">⭐ {parseFloat(vendor.rating || 0).toFixed(1)}</div>
                                </div>
                                
                                <div className="store-content-wrapper">
                                    <div className="store-profile-overlay">
                                        <img 
                                            src={getImageUrl(vendor.profile_image, `https://ui-avatars.com/api/?name=${vendor.store_name || vendor.name}&background=random`)} 
                                            alt="profile" 
                                        />
                                    </div>
                                    
                                    <div className="store-main-info">
                                        <div className="store-title-row">
                                            <h3 className="store-name-text">{vendor.store_name || vendor.name}</h3>
                                            <span className="stall-badge">Stall #{vendor.stall_number || 'N/A'}</span>
                                        </div>
                                        <p className="store-description-text">{vendor.description || 'Delicious food waiting for you at the canteen.'}</p>
                                    </div>

                                    <div className="store-meta-footer">
                                        <div className="meta-item">
                                            <span className="meta-icon">🕒</span>
                                            <span className="meta-text">
                                                {vendor.opening_time ? vendor.opening_time.substring(0,5) : '08:00'} - {vendor.closing_time ? vendor.closing_time.substring(0,5) : '17:00'}
                                            </span>
                                        </div>
                                        <button className="view-menu-btn-premium">View Menu →</button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="menu-view">
                        <button className="back-btn" onClick={handleBack}>
                            ← Back to Stores
                        </button>

                        {loading ? (
                            <div className="loading-state">Loading delicious menu...</div>
                        ) : (
                            <div className="menu-grid">
                                {menuItems.length > 0 ? menuItems.map(item => (
                                     <div key={item.id} className="menu-item-card" onClick={() => openItemDetails(item)}>
                                         <div className="item-image">
                                             {item.images && item.images.length > 0 ? (
                                                 <img src={getImageUrl(item.images[0], 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=400&q=80')} alt={item.name} />
                                             ) : (
                                                 <div className="item-placeholder">🍽️</div>
                                             )}
                                         </div>
                                         <div className="item-details">
                                             <div className="item-header">
                                                 <h4>{item.name}</h4>
                                                 <span className="item-price">₱{parseFloat(item.price).toLocaleString()}</span>
                                             </div>
                                             <p className="item-desc">{item.description || 'No description available.'}</p>
                                             <div className="item-footer">
                                                 <span className="item-category">{item.category}</span>
                                                 <button className="add-to-cart-btn" onClick={(e) => { e.stopPropagation(); openItemDetails(item); }}>Add to Order</button>
                                             </div>
                                         </div>
                                     </div>
                                 )) : (
                                     <div className="empty-state">This store hasn't added any menu items yet.</div>
                                 )}
                            </div>
                        )}
                    </div>
                )}
            </div>

            <Modal show={selectedItem !== null} onClose={closeItemDetails} maxWidth="3xl">
                {selectedItem && (
                    <div className="modal-content-premium">
                        <div className="view-modal-grid">
                            <div className="view-modal-images">
                                <div className="main-view-img">
                                    <img src={getImageUrl(selectedItem.images?.[currentImageIndex], 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=400&q=80')} alt={selectedItem.name} />
                                    
                                    {selectedItem.images?.length > 1 && (
                                        <>
                                            <button className="nav-arrow prev" onClick={() => setCurrentImageIndex(prev => prev === 0 ? selectedItem.images.length - 1 : prev - 1)}>‹</button>
                                            <button className="nav-arrow next" onClick={() => setCurrentImageIndex(prev => prev === selectedItem.images.length - 1 ? 0 : prev + 1)}>›</button>
                                            <div className="image-counter">{currentImageIndex + 1} / {selectedItem.images.length}</div>
                                        </>
                                    )}
                                </div>
                                <div className="view-gallery">
                                    {selectedItem.images?.map((img, idx) => (
                                        <img 
                                            key={idx} 
                                            src={getImageUrl(img, 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=100&q=80')} 
                                            alt="gallery" 
                                            className={currentImageIndex === idx ? 'active' : ''}
                                            onClick={() => setCurrentImageIndex(idx)}
                                        />
                                    ))}
                                </div>
                            </div>
                            
                            <div className="view-modal-info">
                                <button className="btn-close-view-premium" onClick={closeItemDetails}>✕</button>
                                
                                <div className="view-header">
                                    <span className="view-category">{selectedItem.category}</span>
                                </div>
                                
                                <h2 className="view-name">{selectedItem.name}</h2>
                                
                                <div className="view-price-status">
                                    <span className="view-price">₱{parseFloat(selectedItem.price).toLocaleString()}</span>
                                    <span className={`view-status-badge ${selectedItem.status?.toLowerCase().replace(/ /g, '-')}`}>{selectedItem.status}</span>
                                </div>
                                
                                <div className="view-section">
                                    <h4>Description</h4>
                                    <p className="view-description">{selectedItem.description || 'A delicious meal prepared fresh for you.'}</p>
                                </div>
                                
                                {selectedItem.cooking_time && (
                                    <div className="view-section">
                                        <h4>🍳 Cooking / Prep Time</h4>
                                        <p className="view-description" style={{ fontWeight: 700, color: '#333' }}>
                                            ⚡ Approximately {selectedItem.cooking_time}
                                        </p>
                                    </div>
                                )}

                                {selectedItem.ingredients?.length > 0 && (
                                    <div className="view-section">
                                        <h4>Ingredients</h4>
                                        <div className="ingredient-pills">
                                            {selectedItem.ingredients.map((ing, idx) => (
                                                <span key={idx} className="ing-pill">{ing}</span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <div className="view-section">
                                    <label htmlFor="item-notes" className="form-label" style={{ display: 'block', fontSize: '0.75rem', textTransform: 'uppercase', color: '#64748b', fontWeight: 800, marginBottom: '6px', letterSpacing: '0.5px' }}>
                                        📝 Special Instructions / Notes
                                    </label>
                                    <textarea
                                        id="item-notes"
                                        className="form-textarea"
                                        rows="2"
                                        placeholder="Add notes (e.g. no onions, make it spicy, or recommendation preferences...)"
                                        value={itemNotes}
                                        onChange={(e) => setItemNotes(e.target.value)}
                                        style={{ 
                                            width: '100%', 
                                            padding: '10px 12px', 
                                            borderRadius: '8px', 
                                            border: '1px solid #cbd5e1', 
                                            fontSize: '0.85rem', 
                                            background: '#f8fafc',
                                            resize: 'none',
                                            fontFamily: 'inherit'
                                        }}
                                    />
                                </div>

                                <div className="order-actions-premium">
                                    <div className="quantity-selector-premium">
                                        <button className="qty-btn-p" onClick={handleDecrement}>−</button>
                                        <span className="qty-val-p">{quantity}</span>
                                        <button className="qty-btn-p" onClick={handleIncrement}>+</button>
                                    </div>
                                    <button 
                                        className={`btn-add-to-order-premium ${adding ? 'adding' : ''}`}
                                        onClick={handleAddToOrder}
                                        disabled={adding}
                                    >
                                        {adding ? 'Adding...' : `Add to Order — ₱${(selectedItem.price * quantity).toLocaleString()}`}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </Modal>

            <style dangerouslySetInnerHTML={{ __html: `
                .order-container {
                    padding: 20px 0;
                }

                .vendors-grid-premium {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
                    gap: 30px;
                }

                .store-card-premium {
                    background: white;
                    border-radius: 24px;
                    overflow: hidden;
                    box-shadow: 0 10px 30px rgba(0,0,0,0.04);
                    cursor: pointer;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    border: 1px solid rgba(0,0,0,0.03);
                    position: relative;
                }
                .store-card-premium:hover {
                    transform: translateY(-10px);
                    box-shadow: 0 20px 40px rgba(0,0,0,0.08);
                }

                .store-cover-wrapper {
                    height: 160px;
                    position: relative;
                    overflow: hidden;
                }
                .store-cover {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                    transition: transform 0.5s;
                }
                .store-card-premium:hover .store-cover {
                    transform: scale(1.1);
                }
                .store-status-tag {
                    position: absolute;
                    top: 15px;
                    left: 15px;
                    background: rgba(255,255,255,0.95);
                    padding: 5px 12px;
                    border-radius: 50px;
                    font-size: 0.75rem;
                    font-weight: 800;
                    color: #28c76f;
                    backdrop-filter: blur(4px);
                    z-index: 5;
                }
                .store-rating-tag {
                    position: absolute;
                    top: 15px;
                    right: 15px;
                    background: rgba(0,0,0,0.5);
                    color: white;
                    padding: 5px 12px;
                    border-radius: 50px;
                    font-size: 0.75rem;
                    font-weight: 800;
                    backdrop-filter: blur(4px);
                    z-index: 5;
                }

                .store-content-wrapper {
                    padding: 0 25px 25px;
                    position: relative;
                }
                .store-profile-overlay {
                    width: 70px;
                    height: 70px;
                    border-radius: 20px;
                    border: 4px solid white;
                    overflow: hidden;
                    margin-top: -35px;
                    background: white;
                    position: relative;
                    z-index: 10;
                    box-shadow: 0 5px 15px rgba(0,0,0,0.1);
                }
                .store-profile-overlay img { width: 100%; height: 100%; object-fit: cover; }

                .store-main-info { margin-top: 15px; margin-bottom: 20px; }
                .store-title-row { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px; }
                .store-name-text { font-size: 1.25rem; font-weight: 900; color: #333; margin: 0; }
                .stall-badge { 
                    font-size: 0.7rem; font-weight: 800; background: #f0f0f0; 
                    padding: 4px 10px; border-radius: 8px; color: #666;
                }
                .store-description-text { 
                    font-size: 0.9rem; color: #777; line-height: 1.5; 
                    display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; 
                    overflow: hidden; margin: 0;
                }

                .store-meta-footer {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding-top: 15px;
                    border-top: 1px dashed #eee;
                }
                .meta-item { display: flex; align-items: center; gap: 6px; }
                .meta-icon { font-size: 0.9rem; }
                .meta-text { font-size: 0.8rem; font-weight: 700; color: #555; }
                
                .view-menu-btn-premium {
                    background: none; border: none; color: var(--primary-red);
                    font-weight: 800; font-size: 0.85rem; cursor: pointer;
                    transition: transform 0.2s;
                }
                .view-menu-btn-premium:hover { transform: translateX(5px); }

                .menu-view {
                    animation: fadeIn 0.4s ease;
                }
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .back-btn {
                    background: none;
                    border: none;
                    color: #666;
                    font-weight: 600;
                    cursor: pointer;
                    margin-bottom: 25px;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    transition: color 0.2s;
                }
                .back-btn:hover {
                    color: var(--primary-red);
                }

                .menu-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
                    gap: 25px;
                }
                .menu-item-card {
                    display: flex;
                    background: white;
                    border-radius: 20px;
                    overflow: hidden;
                    box-shadow: 0 4px 15px rgba(0,0,0,0.05);
                    border: 1px solid rgba(0,0,0,0.03);
                    height: 160px;
                    cursor: pointer;
                }
                .item-image {
                    width: 140px;
                    min-width: 140px;
                    background: #f8f9fa;
                }
                .item-image img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }
                .item-placeholder {
                    width: 100%;
                    height: 100%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 2.5rem;
                }
                .item-details {
                    flex: 1;
                    padding: 15px;
                    display: flex;
                    flex-direction: column;
                    justify-content: space-between;
                }
                .item-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    gap: 10px;
                }
                .item-header h4 {
                    margin: 0;
                    font-size: 1.1rem;
                    color: #333;
                }
                .item-price {
                    font-weight: 800;
                    color: var(--primary-red);
                    white-space: nowrap;
                }
                .item-desc {
                    font-size: 0.8rem;
                    color: #888;
                    display: -webkit-box;
                    -webkit-line-clamp: 2;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                    margin: 8px 0;
                }
                .item-footer {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
                .item-category {
                    font-size: 0.7rem;
                    background: #fef2f2;
                    color: var(--primary-red);
                    padding: 3px 10px;
                    border-radius: 20px;
                    font-weight: 700;
                    text-transform: uppercase;
                }
                .add-to-cart-btn {
                    background: #333;
                    color: white;
                    border: none;
                    padding: 6px 12px;
                    border-radius: 8px;
                    font-size: 0.8rem;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                .add-to-cart-btn:hover {
                    background: #000;
                    transform: scale(1.05);
                }
                .loading-state {
                    text-align: center;
                    padding: 100px;
                    color: #999;
                    font-weight: 600;
                }

                /* Compact Premium Modal Architecture */
                .modal-content-premium { 
                    background: white; 
                    border-radius: 24px; 
                    width: 100%; 
                    overflow: hidden; 
                    box-shadow: 0 20px 50px rgba(0,0,0,0.2); 
                    border: none; 
                    display: flex;
                    flex-direction: column;
                }
                .view-modal-grid { 
                    display: grid; 
                    grid-template-columns: 1fr 1fr; 
                    align-items: stretch;
                }
                
                /* Image Section */
                .view-modal-images { 
                    background: #000; 
                    display: flex; 
                    flex-direction: column; 
                    height: 100%;
                    border-top-left-radius: 24px;
                    border-bottom-left-radius: 24px;
                    overflow: hidden;
                }
                .main-view-img { 
                    height: 380px;
                    overflow: hidden; 
                    position: relative; 
                    background: #000; 
                    display: flex; 
                    align-items: center; 
                    justify-content: center; 
                }
                .main-view-img img { 
                    width: 100%; 
                    height: 100%; 
                    object-fit: cover; 
                }
                
                .view-gallery { 
                    display: flex; 
                    gap: 10px; 
                    padding: 12px 15px; 
                    overflow-x: auto; 
                    background: #111; 
                    border-top: 1px solid rgba(255,255,255,0.05);
                }
                .view-gallery img { 
                    width: 40px; 
                    height: 40px; 
                    flex-shrink: 0; 
                    border-radius: 8px; 
                    overflow: hidden; 
                    object-fit: cover; 
                    cursor: pointer; 
                    border: 2px solid transparent; 
                    transition: 0.2s; 
                }
                .view-gallery img.active { border-color: white; }

                .nav-arrow { 
                    position: absolute; 
                    top: 50%; 
                    transform: translateY(-50%); 
                    background: rgba(0,0,0,0.4); 
                    color: white; 
                    border: none; 
                    width: 34px; 
                    height: 34px; 
                    border-radius: 50%; 
                    font-size: 1.1rem; 
                    cursor: pointer; 
                    z-index: 10; 
                    display: flex; 
                    align-items: center; 
                    justify-content: center; 
                    backdrop-filter: blur(4px); 
                }
                .nav-arrow:hover { background: rgba(0,0,0,0.7); }
                .nav-arrow.prev { left: 10px; }
                .nav-arrow.next { right: 10px; }
                .image-counter { 
                    position: absolute; 
                    bottom: 12px; 
                    left: 50%; 
                    transform: translateX(-50%); 
                    background: rgba(0,0,0,0.5); 
                    color: white; 
                    padding: 2px 10px; 
                    border-radius: 20px; 
                    font-size: 0.65rem; 
                    font-weight: 700; 
                }

                /* Information Section */
                .view-modal-info { 
                    padding: 25px 30px; 
                    display: flex; 
                    flex-direction: column; 
                    gap: 15px; 
                    position: relative; 
                    background: white;
                    height: 100%;
                }
                
                .btn-close-view-premium { 
                    position: absolute; 
                    top: 15px; 
                    right: 15px; 
                    background: #f8f9fa; 
                    border: none; 
                    width: 30px; 
                    height: 30px; 
                    border-radius: 50%; 
                    cursor: pointer; 
                    font-size: 0.8rem; 
                    font-weight: 800; 
                    color: #aaa; 
                    transition: all 0.2s; 
                    z-index: 10; 
                }
                .btn-close-view-premium:hover { background: #eee; color: #333; }
                
                .view-header { display: flex; justify-content: space-between; align-items: flex-start; }
                .view-category { 
                    background: #fef2f2; 
                    padding: 3px 10px; 
                    border-radius: 6px; 
                    font-size: 0.7rem; 
                    font-weight: 700; 
                    color: var(--primary-red); 
                }
                .view-name { 
                    font-size: 1.5rem; 
                    font-weight: 900; 
                    color: #333; 
                    line-height: 1.2; 
                }
                .view-price-status { 
                    display: flex; 
                    align-items: center; 
                    gap: 12px; 
                }
                .view-price { 
                    font-size: 1.3rem; 
                    font-weight: 900; 
                    color: var(--primary-red); 
                }
                .view-status-badge { 
                    padding: 3px 10px; 
                    border-radius: 20px; 
                    font-size: 0.65rem; 
                    font-weight: 800; 
                    text-transform: uppercase; 
                }
                .view-status-badge.available { background: #e9f9ef; color: #28c76f; }

                .view-section h4 { 
                    font-size: 0.75rem; 
                    font-weight: 800; 
                    color: #333; 
                    text-transform: uppercase; 
                    margin-bottom: 6px; 
                    border-bottom: 1px solid #f0f0f0; 
                    padding-bottom: 4px; 
                }
                .view-description { 
                    font-size: 0.85rem; 
                    line-height: 1.5; 
                    color: #666; 
                    display: -webkit-box;
                    -webkit-line-clamp: 3;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                }
                .ingredient-pills { 
                    display: flex; 
                    flex-wrap: wrap; 
                    gap: 6px; 
                }
                .ing-pill { 
                    background: #f8f9fa; 
                    padding: 3px 10px; 
                    border-radius: 6px; 
                    font-size: 0.75rem; 
                    font-weight: 600; 
                    color: #555; 
                    border: 1px solid #eee; 
                }
                
                .order-actions-premium {
                    margin-top: auto;
                    display: flex;
                    gap: 12px;
                    padding-top: 15px;
                }
                .quantity-selector-premium {
                    display: flex;
                    align-items: center;
                    background: #f3f4f6;
                    border-radius: 10px;
                    overflow: hidden;
                    border: 1px solid #e5e7eb;
                }
                .qty-btn-p {
                    width: 40px;
                    height: 40px;
                    border: none;
                    background: none;
                    font-size: 1.1rem;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .qty-val-p {
                    width: 30px;
                    text-align: center;
                    font-weight: 700;
                    font-size: 0.95rem;
                }
                .btn-add-to-order-premium {
                    flex: 1;
                    padding: 12px;
                    background: #333;
                    color: white;
                    border-radius: 10px;
                    font-weight: 800;
                    cursor: pointer;
                    border: none;
                    font-size: 0.95rem;
                }
                .btn-add-to-order-premium:hover { background: #000; }
                .btn-add-to-order-premium.adding {
                    background: #28c76f;
                    pointer-events: none;
                }

                @media (max-width: 768px) {
                    .modal-content-premium { max-height: 90vh; border-radius: 20px; }
                    .view-modal-grid { grid-template-columns: 1fr; overflow-y: auto; }
                    .view-modal-images { height: 280px; min-height: auto; border-radius: 20px 20px 0 0; }
                    .view-name { font-size: 1.3rem; }
                }
            `}} />
        </UserLayout>
    );
}
