import VendorLayout from '@/Layouts/VendorLayout';
import { Head, useForm, router } from '@inertiajs/react';
import React, { useState, useMemo, useRef } from 'react';

export default function VendorMenu({ menuItems }) {
    const [searchQuery, setSearchQuery] = useState('');
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const [isAddingNewCategory, setIsAddingNewCategory] = useState(false);
    const [currentViewImageIndex, setCurrentViewImageIndex] = useState(0);
    const [currentEditImageIndex, setCurrentEditImageIndex] = useState(0);
    const fileInputRef = useRef(null);
    
    const { data, setData, post, processing, errors, reset, clearErrors } = useForm({
        name: '',
        category: 'Main Course',
        customCategory: '',
        price: '',
        stock: '',
        status: 'Available',
        description: '',
        cooking_time: '',
        images: [], 
        ingredients: [],
    });

    const [imagePreviews, setImagePreviews] = useState([]);
    const [ingredientInput, setIngredientInput] = useState('');

    const categories = useMemo(() => {
        const uniqueCats = [...new Set(menuItems.map(item => item.category))];
        if (uniqueCats.length === 0) return ['Main Course', 'Sides', 'Beverages'];
        return uniqueCats;
    }, [menuItems]);

    const filteredItems = useMemo(() => {
        return menuItems.filter(item => 
            item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.category.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [menuItems, searchQuery]);

    const handleOpenAddModal = () => {
        setSelectedItem(null);
        reset();
        clearErrors();
        setImagePreviews([]);
        setIngredientInput('');
        setIsAddingNewCategory(false);
        setCurrentEditImageIndex(0);
        setIsEditModalOpen(true);
    };

    const handleOpenEditModal = (e, item) => {
        if (e) e.stopPropagation();
        setSelectedItem(item);
        clearErrors();
        setData({
            name: item.name,
            category: item.category,
            customCategory: '',
            price: item.price,
            stock: item.stock === null ? '' : item.stock,
            status: item.status || 'Available',
            description: item.description || '',
            cooking_time: item.cooking_time || '',
            images: item.images || [], 
            ingredients: item.ingredients || [],
        });
        setImagePreviews(item.images || []);
        setIngredientInput((item.ingredients || []).join(', '));
        setIsAddingNewCategory(false);
        setCurrentEditImageIndex(0);
        setIsEditModalOpen(true);
    };

    const handleViewItem = (item) => {
        setSelectedItem(item);
        setCurrentViewImageIndex(0);
        setIsViewModalOpen(true);
    };

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);
        if (files.length > 0) {
            setData('images', [...data.images, ...files]);
            const newPreviews = files.map(file => URL.createObjectURL(file));
            setImagePreviews(prev => [...prev, ...newPreviews]);
            // Automatically switch to the last uploaded image
            setCurrentEditImageIndex(imagePreviews.length + files.length - 1);
        }
    };

    const removeImage = (index) => {
        setData('images', data.images.filter((_, i) => i !== index));
        setImagePreviews(prev => prev.filter((_, i) => i !== index));
        if (currentEditImageIndex >= index && currentEditImageIndex > 0) {
            setCurrentEditImageIndex(prev => prev - 1);
        }
    };

    const handleIngredientChange = (e) => {
        const val = e.target.value;
        setIngredientInput(val);
        const ings = val.split(',').map(s => s.trim()).filter(s => s !== '');
        setData('ingredients', ings);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        // Sync category
        const finalCategory = isAddingNewCategory ? data.customCategory : data.category;
        
        // Prepare final data object
        const payload = {
            ...data,
            category: finalCategory,
        };

        if (selectedItem) {
            // Using router.post with spoofing for file uploads on update
            router.post(route('vendor.menu.update', selectedItem.id), {
                ...payload,
                _method: 'PUT'
            }, {
                onSuccess: () => {
                    setIsEditModalOpen(false);
                    setSelectedItem(null);
                }
            });
        } else {
            router.post(route('vendor.menu.store'), payload, {
                onSuccess: () => {
                    setIsEditModalOpen(false);
                    setSelectedItem(null);
                }
            });
        }
    };

    const handleDeleteItem = (e, id) => {
        e.stopPropagation();
        if(confirm('Are you sure you want to delete this item?')) {
            router.delete(route('vendor.menu.destroy', id));
        }
    };

    const toggleStatus = (e, id) => {
        e.stopPropagation();
        router.patch(route('vendor.menu.toggle-status', id));
    };

    return (
        <VendorLayout header={<h2>Menu Management</h2>}>
            <Head title="Menu Items" />
            
            <div className="menu-container">
                <div className="menu-header-actions">
                    <div className="search-bar">
                        <span className="search-icon">🔍</span>
                        <input type="text" placeholder="Search menu items..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                    </div>
                    <button className="btn-add-item" onClick={handleOpenAddModal}>+ Add New Item</button>
                </div>

                <div className="menu-grid">
                    {filteredItems.map(item => (
                        <div key={item.id} className="menu-card" onClick={() => handleViewItem(item)}>
                            <div className="card-image-wrapper">
                                <img src={item.images?.[0] || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=400&q=80'} alt={item.name} />
                                {item.images?.length > 1 && <div className="image-count-badge">+{item.images.length - 1} Photos</div>}
                                <div className="card-category-badge">{item.category}</div>
                                <button className={`card-status-badge ${item.status?.toLowerCase().replace(/ /g, '-')}`} onClick={(e) => toggleStatus(e, item.id)}>{item.status}</button>
                            </div>
                            <div className="card-content">
                                <div className="card-info">
                                    <h3 className="card-name">{item.name}</h3>
                                    <p className="card-desc-short">{item.description?.substring(0, 60)}...</p>
                                    <div className="card-stats">
                                        <span className="card-price">₱{item.price}</span>
                                        <span className={`card-stock ${item.stock === 0 ? 'low' : ''}`}>📦 {item.stock ?? 'N/A'} in stock</span>
                                    </div>
                                </div>
                                <div className="card-actions">
                                    <button className="btn-card-action edit" onClick={(e) => handleOpenEditModal(e, item)}>✏️ Edit</button>
                                    <button className="btn-card-action delete" onClick={(e) => handleDeleteItem(e, item.id)}>🗑️</button>
                                </div>
                            </div>
                        </div>
                    ))}
                    {filteredItems.length === 0 && (
                        <div className="no-results">
                            <p>No menu items found. Add your first dish to get started!</p>
                        </div>
                    )}
                </div>
            </div>

            {/* View Details Modal */}
            {isViewModalOpen && selectedItem && (
                <div className="modal-overlay" onClick={() => setIsViewModalOpen(false)}>
                    <div className="modal-content-premium view-details-modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-scroll-area">
                            <div className="view-modal-grid">
                                <div className="view-modal-images">
                                    <div className="main-view-img">
                                        <img src={selectedItem.images?.[currentViewImageIndex] || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=400&q=80'} alt={selectedItem.name} />
                                        
                                        {selectedItem.images?.length > 1 && (
                                            <>
                                                <button className="nav-arrow prev" onClick={() => setCurrentViewImageIndex(prev => prev === 0 ? selectedItem.images.length - 1 : prev - 1)}>‹</button>
                                                <button className="nav-arrow next" onClick={() => setCurrentViewImageIndex(prev => prev === selectedItem.images.length - 1 ? 0 : prev + 1)}>›</button>
                                                <div className="image-counter">{currentViewImageIndex + 1} / {selectedItem.images.length}</div>
                                            </>
                                        )}
                                    </div>
                                    <div className="view-gallery">
                                        {selectedItem.images?.map((img, idx) => (
                                            <img 
                                                key={idx} 
                                                src={img} 
                                                alt="gallery" 
                                                className={currentViewImageIndex === idx ? 'active' : ''}
                                                onClick={() => setCurrentViewImageIndex(idx)}
                                            />
                                        ))}
                                    </div>
                                </div>
                                <div className="view-modal-info">
                                    <button className="btn-close-view-premium" onClick={() => setIsViewModalOpen(false)}>✕</button>
                                    <div className="view-header">
                                        <span className="view-category">{selectedItem.category}</span>
                                    </div>
                                    <h2 className="view-name">{selectedItem.name}</h2>
                                    <div className="view-price-status">
                                        <span className="view-price">₱{selectedItem.price}</span>
                                        <span className={`view-status-badge ${selectedItem.status?.toLowerCase().replace(/ /g, '-')}`}>{selectedItem.status}</span>
                                    </div>
                                    <div className="view-section">
                                        <h4>Description</h4>
                                        <p className="view-description">{selectedItem.description || 'No description provided.'}</p>
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
                                    <div className="view-footer-stats">
                                        <div className="v-stat">
                                            <span className="v-label">Current Stock</span>
                                            <span className="v-value">{selectedItem.stock ?? 'N/A'} items</span>
                                        </div>
                                        <div className="v-stat">
                                            <span className="v-label">Availability</span>
                                            <span className="v-value">{selectedItem.status}</span>
                                        </div>
                                    </div>
                                    <div className="view-actions-bottom">
                                        <button className="btn-edit-from-view" onClick={() => { setIsViewModalOpen(false); handleOpenEditModal(null, selectedItem); }}>Edit Product Details</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit/Add Modal */}
            {isEditModalOpen && (
                <div className="modal-overlay" onClick={() => setIsEditModalOpen(false)}>
                    <div className="modal-content-premium add-edit-modal-premium" onClick={e => e.stopPropagation()}>
                        <div className="modal-scroll-area">
                            <form onSubmit={handleSubmit} className="premium-form-layout">
                                <div className="modal-sidebar-images-column">
                                    <div className="main-preview-area">
                                        {imagePreviews.length > 0 ? (
                                            <>
                                                <img src={imagePreviews[currentEditImageIndex]} alt="Main Preview" />
                                                {imagePreviews.length > 1 && (
                                                    <>
                                                        <button type="button" className="nav-arrow prev" onClick={(e) => { e.stopPropagation(); setCurrentEditImageIndex(prev => prev === 0 ? imagePreviews.length - 1 : prev - 1); }}>‹</button>
                                                        <button type="button" className="nav-arrow next" onClick={(e) => { e.stopPropagation(); setCurrentEditImageIndex(prev => prev === imagePreviews.length - 1 ? 0 : prev + 1); }}>›</button>
                                                        <div className="image-counter">{currentEditImageIndex + 1} / {imagePreviews.length}</div>
                                                    </>
                                                )}
                                                <div className="upload-overlay" onClick={() => fileInputRef.current.click()}><span>Click to Add More Photos</span></div>
                                            </>
                                        ) : (
                                            <div className="upload-placeholder-big" onClick={() => fileInputRef.current.click()}>
                                                <span className="icon">📸</span>
                                                <span className="text">Click to Add Photos</span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="gallery-preview-grid">
                                        {imagePreviews.map((img, idx) => (
                                            <div key={idx} className={`gallery-preview-item ${currentEditImageIndex === idx ? 'active' : ''}`} onClick={() => setCurrentEditImageIndex(idx)}>
                                                <img src={img} alt="Gallery Preview" />
                                                <button type="button" className="btn-remove-preview" onClick={(e) => { e.stopPropagation(); removeImage(idx); }}>✕</button>
                                            </div>
                                        ))}
                                        <div className="add-more-box" onClick={() => fileInputRef.current.click()}><span>+ Add More</span></div>
                                    </div>
                                    <input type="file" ref={fileInputRef} onChange={handleImageChange} accept="image/*" multiple style={{ display: 'none' }} />
                                    {errors.images && <span className="error-msg" style={{padding: '10px'}}>{errors.images}</span>}
                                </div>

                                <div className="form-content-column">
                                    <div className="modal-header-premium">
                                        <div className="title-group">
                                            <h3>{selectedItem ? 'Edit Dish Details' : 'Add New Dish'}</h3>
                                            <p className="subtitle">Enter the information for your menu item.</p>
                                        </div>
                                        <button type="button" className="btn-close-premium" onClick={() => setIsEditModalOpen(false)}>✕</button>
                                    </div>
                                    <div className="form-body-premium">
                                        <div className="form-group-premium">
                                            <label>Dish Name</label>
                                            <input type="text" value={data.name} onChange={(e) => setData('name', e.target.value)} placeholder="e.g. Signature Cheese Burger" required />
                                            {errors.name && <span className="error-msg">{errors.name}</span>}
                                        </div>
                                        <div className="form-group-premium">
                                            <label>Story / Description</label>
                                            <textarea value={data.description} onChange={(e) => setData('description', e.target.value)} placeholder="What makes this dish special?" rows="3"></textarea>
                                            {errors.description && <span className="error-msg">{errors.description}</span>}
                                        </div>
                                        <div className="form-group-premium"><label>Ingredients <span className="optional">(Comma separated)</span></label><input type="text" value={ingredientInput} onChange={handleIngredientChange} placeholder="e.g. Beef Patty, Lettuce, Cheese" /></div>
                                        <div className="form-group-premium">
                                            <label>Cooking / Prep Time <span className="optional">(Optional)</span></label>
                                            <input type="text" value={data.cooking_time} onChange={(e) => setData('cooking_time', e.target.value)} placeholder="e.g. 10 mins, 5 mins (Leave blank if easy to serve)" />
                                            {errors.cooking_time && <span className="error-msg">{errors.cooking_time}</span>}
                                        </div>
                                        <div className="form-row-premium">
                                            <div className="form-group-premium">
                                                <label>Category</label>
                                                <select value={data.category} onChange={(e) => { const val = e.target.value; setIsAddingNewCategory(val === 'ADD_NEW'); setData('category', val); }} required>
                                                    {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                                                    <option value="ADD_NEW">+ New Category...</option>
                                                </select>
                                                {errors.category && <span className="error-msg">{errors.category}</span>}
                                            </div>
                                            <div className="form-group-premium">
                                                <label>Price (₱)</label>
                                                <input type="number" step="0.01" value={data.price} onChange={(e) => setData('price', e.target.value)} placeholder="0.00" required />
                                                {errors.price && <span className="error-msg">{errors.price}</span>}
                                            </div>
                                        </div>
                                        {isAddingNewCategory && <div className="form-group-premium animated-field"><label>New Category Name</label><input type="text" value={data.customCategory} onChange={(e) => setData('customCategory', e.target.value)} placeholder="Enter category name" required autoFocus /></div>}
                                        <div className="form-row-premium">
                                            <div className="form-group-premium">
                                                <label>Stock Qty <span className="optional">(Opt)</span></label>
                                                <input type="number" value={data.stock} onChange={(e) => setData('stock', e.target.value)} placeholder="Qty" />
                                                {errors.stock && <span className="error-msg">{errors.stock}</span>}
                                            </div>
                                            <div className="form-group-premium"><label>Status <span className="optional">(Opt)</span></label><select value={data.status} onChange={(e) => setData('status', e.target.value)}><option value="Available">Available</option><option value="Out of Stock">Out of Stock</option></select></div>
                                        </div>
                                    </div>
                                    <div className="modal-footer-premium">
                                        <button type="button" className="btn-cancel-premium" onClick={() => setIsEditModalOpen(false)}>Cancel</button>
                                        <button type="submit" className="btn-save-premium" disabled={processing}>{selectedItem ? 'Update Dish' : 'Publish Dish'}</button>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            <style dangerouslySetInnerHTML={{ __html: `
                .menu-container { padding: 10px; }
                .menu-header-actions { display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px; gap: 20px; }
                .search-bar { flex-grow: 1; max-width: 400px; position: relative; }
                .search-icon { position: absolute; left: 15px; top: 50%; transform: translateY(-50%); opacity: 0.5; }
                .search-bar input { width: 100%; padding: 12px 12px 12px 45px; border-radius: 12px; border: 1px solid #eee; font-size: 0.95rem; background: white; }
                .btn-add-item { background: #333; color: white; border: none; padding: 12px 24px; border-radius: 12px; font-weight: 700; cursor: pointer; }

                .menu-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 25px; }
                .menu-card { background: white; border-radius: 24px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.03); border: 1px solid #f8f8f8; transition: all 0.3s ease; cursor: pointer; }
                .menu-card:hover { transform: translateY(-5px); box-shadow: 0 10px 25px rgba(0,0,0,0.08); }
                .card-image-wrapper { height: 180px; position: relative; overflow: hidden; }
                .card-image-wrapper img { width: 100%; height: 100%; object-fit: cover; }
                
                .image-count-badge { position: absolute; bottom: 10px; right: 10px; background: rgba(0,0,0,0.6); color: white; padding: 4px 10px; border-radius: 8px; font-size: 0.7rem; font-weight: 700; backdrop-filter: blur(4px); }
                .card-category-badge { position: absolute; top: 12px; left: 12px; background: rgba(255,255,255,0.9); backdrop-filter: blur(4px); padding: 4px 10px; border-radius: 8px; font-size: 0.7rem; font-weight: 700; color: #333; }
                
                .card-status-badge { position: absolute; top: 12px; right: 12px; border: none; padding: 4px 10px; border-radius: 8px; font-size: 0.65rem; font-weight: 800; text-transform: uppercase; cursor: pointer; transition: all 0.2s; }
                .card-status-badge.available { background: #e9f9ef; color: #28c76f; }
                .card-status-badge.out-of-stock { background: #fff5f5; color: #ff4d4f; }
                .card-status-badge:hover { filter: brightness(0.9); transform: scale(1.05); }
                
                .card-content { padding: 15px; display: flex; flex-direction: column; gap: 12px; }
                .card-name { font-size: 1rem; font-weight: 800; color: #333; }
                .card-desc-short { font-size: 0.75rem; color: #999; line-height: 1.4; height: 32px; overflow: hidden; }
                .card-stats { display: flex; justify-content: space-between; align-items: center; }
                .card-price { font-size: 1.1rem; font-weight: 900; color: #333; }
                .card-stock { font-size: 0.75rem; font-weight: 700; color: #bbb; }
                .card-stock.low { color: #ff4d4f; }
                
                .card-actions { display: flex; gap: 8px; border-top: 1px solid #f8f8f8; padding-top: 12px; }
                .btn-card-action { flex: 1; padding: 8px; border-radius: 10px; border: none; font-weight: 700; font-size: 0.8rem; cursor: pointer; }
                .btn-card-action.edit { background: #f8f9fa; color: #333; }
                .btn-card-action.delete { background: #fff5f5; color: #ff4d4f; }

                /* Premium Modal Architecture */
                .modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.6); backdrop-filter: blur(8px); display: flex; align-items: center; justify-content: center; z-index: 2000; }
                .modal-content-premium { background: white; border-radius: 24px; width: 95%; max-width: 950px; overflow: hidden; box-shadow: 0 30px 60px rgba(0,0,0,0.2); border: none; }
                .modal-scroll-area { max-height: 90vh; overflow-y: auto; scrollbar-width: none; -ms-overflow-style: none; }
                .modal-scroll-area::-webkit-scrollbar { display: none; }

                .premium-form-layout, .view-modal-grid { display: grid; grid-template-columns: 1.2fr 1fr; min-height: 550px; }
                
                /* Sidebar Image Column */
                .modal-sidebar-images-column, .view-modal-images { background: #000; display: flex; flex-direction: column; padding: 0; margin: 0; }
                .main-preview-area, .main-view-img { flex-grow: 1; overflow: hidden; position: relative; background: #111; display: flex; align-items: center; justify-content: center; min-height: 400px; }
                .main-preview-area img, .main-view-img img { width: 100%; height: 100%; object-fit: cover; }
                
                .upload-placeholder-big { text-align: center; color: #444; }
                .upload-placeholder-big .icon { font-size: 3rem; display: block; margin-bottom: 10px; }
                .upload-placeholder-big .text { font-size: 0.9rem; font-weight: 700; }
                .upload-overlay { position: absolute; bottom: 0; left: 0; right: 0; background: rgba(0,0,0,0.5); padding: 15px; text-align: center; color: white; font-size: 0.8rem; font-weight: 700; opacity: 0; transition: 0.2s; }
                .main-preview-area:hover .upload-overlay { opacity: 1; }

                .gallery-preview-grid, .view-gallery { display: flex; gap: 12px; padding: 15px 20px; overflow-x: auto; background: rgba(255,255,255,0.05); }
                .gallery-preview-item, .view-gallery img { width: 75px; height: 75px; flex-shrink: 0; border-radius: 12px; overflow: hidden; position: relative; object-fit: cover; cursor: pointer; border: 2px solid transparent; transition: 0.2s; }
                .gallery-preview-item.active, .view-gallery img.active { border-color: #ff6b6b; transform: scale(1.05); }
                .btn-remove-preview { position: absolute; top: 4px; right: 4px; background: rgba(0,0,0,0.6); border: none; color: white; width: 18px; height: 18px; border-radius: 50%; font-size: 0.5rem; cursor: pointer; z-index: 5; }
                .add-more-box { width: 75px; height: 75px; flex-shrink: 0; border-radius: 12px; border: 1px dashed #444; display: flex; align-items: center; justify-content: center; color: #555; font-size: 0.6rem; font-weight: 700; cursor: pointer; }

                /* Image Navigation Arrows */
                .nav-arrow { position: absolute; top: 50%; transform: translateY(-50%); background: rgba(0,0,0,0.4); color: white; border: none; width: 40px; height: 40px; border-radius: 50%; font-size: 1.5rem; cursor: pointer; z-index: 10; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(4px); transition: 0.2s; }
                .nav-arrow:hover { background: rgba(0,0,0,0.7); transform: translateY(-50%) scale(1.1); }
                .nav-arrow.prev { left: 15px; }
                .nav-arrow.next { right: 15px; }
                .image-counter { position: absolute; bottom: 15px; left: 50%; transform: translateX(-50%); background: rgba(0,0,0,0.6); color: white; padding: 4px 12px; border-radius: 20px; font-size: 0.75rem; font-weight: 700; backdrop-filter: blur(4px); z-index: 10; }

                /* Information Column */
                .form-content-column, .view-modal-info { padding: 40px; display: flex; flex-direction: column; gap: 30px; position: relative; }
                .btn-close-view-premium, .btn-close-premium { position: absolute; top: 30px; right: 30px; background: #f8f9fa; border: none; width: 35px; height: 35px; border-radius: 50%; cursor: pointer; font-size: 1rem; font-weight: 800; color: #aaa; transition: all 0.2s; z-index: 10; }
                .btn-close-view-premium:hover, .btn-close-premium:hover { background: #eee; color: #333; }
                
                .modal-header-premium, .view-header { display: flex; justify-content: space-between; align-items: flex-start; }
                .modal-header-premium h3 { font-size: 1.8rem; font-weight: 900; color: #333; }
                .subtitle { font-size: 0.85rem; color: #999; }
                
                .view-category { background: #f0f4f8; padding: 5px 12px; border-radius: 10px; font-size: 0.8rem; font-weight: 700; color: #333; width: fit-content; }
                .view-name { font-size: 2rem; font-weight: 900; color: #333; line-height: 1.1; }
                .view-price-status { display: flex; align-items: center; gap: 15px; }
                .view-price { font-size: 1.5rem; font-weight: 900; color: var(--primary-red); }
                .view-status-badge { padding: 4px 12px; border-radius: 20px; font-size: 0.75rem; font-weight: 800; text-transform: uppercase; }
                .view-status-badge.available { background: #e9f9ef; color: #28c76f; }
                .view-status-badge.out-of-stock { background: #fff5f5; color: #ff4d4f; }

                .form-body-premium { display: flex; flex-direction: column; gap: 40px; flex-grow: 1; }
                .form-group-premium { display: flex; flex-direction: column; gap: 8px; }
                .form-group-premium label { font-size: 0.85rem; font-weight: 800; color: #333; text-transform: uppercase; }
                .form-group-premium input, .form-group-premium select, .form-group-premium textarea { padding: 14px; border-radius: 12px; border: 1.5px solid #f0f0f0; background: #fafafa; font-family: inherit; font-size: 0.95rem; }
                .form-group-premium input:focus, .form-group-premium textarea:focus { outline: none; border-color: #333; background: white; }
                .form-row-premium { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }

                .modal-footer-premium { margin-top: auto; display: flex; gap: 15px; padding-top: 40px; }
                .btn-cancel-premium { flex: 1; padding: 15px; border-radius: 12px; border: none; font-weight: 800; color: #999; background: #f8f9fa; cursor: pointer; }
                .btn-save-premium { flex: 2; padding: 15px; border-radius: 12px; border: none; font-weight: 800; color: white; background: #333; cursor: pointer; }
                .btn-save-premium:disabled { opacity: 0.5; cursor: not-allowed; }

                .view-section h4 { font-size: 0.9rem; font-weight: 800; color: #333; text-transform: uppercase; margin-bottom: 10px; border-bottom: 1px solid #f0f0f0; padding-bottom: 5px; }
                .view-description { font-size: 0.95rem; line-height: 1.6; color: #666; }
                .ingredient-pills { display: flex; flex-wrap: wrap; gap: 8px; }
                .ing-pill { background: #f8f9fa; padding: 5px 12px; border-radius: 10px; font-size: 0.8rem; font-weight: 600; color: #555; border: 1px solid #eee; }
                
                .view-footer-stats { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-top: 20px; padding: 20px; background: #fafafa; border-radius: 20px; }
                .v-stat { display: flex; flex-direction: column; gap: 2px; }
                .v-label { font-size: 0.7rem; color: #999; font-weight: 700; text-transform: uppercase; }
                .v-value { font-weight: 800; color: #333; font-size: 1rem; }
                .view-actions-bottom { margin-top: auto; padding-top: 20px; }
                .btn-edit-from-view { width: 100%; padding: 15px; background: #333; color: white; border-radius: 12px; font-weight: 800; cursor: pointer; border: none; }

                .no-results { grid-column: 1 / -1; padding: 100px 20px; text-align: center; color: #999; background: #fafafa; border-radius: 24px; border: 2px dashed #f0f0f0; }
                
                .error-msg { color: #ff4d4f; font-size: 0.75rem; font-weight: 700; margin-top: -5px; }

                @media (max-width: 900px) {
                    .premium-form-layout, .view-modal-grid { grid-template-columns: 1fr; }
                    .modal-sidebar-images-column { height: 300px; }
                }
            `}} />
        </VendorLayout>
    );
}
