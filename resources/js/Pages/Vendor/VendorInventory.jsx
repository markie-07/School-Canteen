import VendorLayout from '@/Layouts/VendorLayout';
import { Head, useForm, router } from '@inertiajs/react';
import React, { useState, useMemo } from 'react';

export default function VendorInventory({ inventory }) {
    const [searchQuery, setSearchQuery] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalType, setModalType] = useState('update'); // 'update' or 'restock'
    const [selectedItem, setSelectedItem] = useState(null);
    
    const [isAddingNewUnit, setIsAddingNewUnit] = useState(false);
    const [isAddingNewCategory, setIsAddingNewCategory] = useState(false);
    
    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm({ 
        item_name: '', 
        category: 'Meat', 
        customCategory: '',
        quantity: '', 
        unit: 'pcs',
        customUnit: '' 
    });

    // Extract unique units and categories for the dropdowns
    const units = useMemo(() => {
        const uniqueUnits = [...new Set(inventory.map(item => item.unit))];
        return uniqueUnits;
    }, [inventory]);

    const categories = useMemo(() => {
        const uniqueCats = [...new Set(inventory.map(item => item.category))];
        return uniqueCats;
    }, [inventory]);

    // Filtered inventory based on search
    const filteredInventory = useMemo(() => {
        return inventory.filter(i => 
            i.item_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            i.category.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [inventory, searchQuery]);

    // Auto-calculate status based on stock count
    const calculateStatus = (stock) => {
        if (stock <= 0) return 'Out of Stock';
        if (stock <= 5) return 'Critical';
        if (stock <= 20) return 'Low Stock';
        return 'In Stock';
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'In Stock': return '#28c76f';
            case 'Low Stock': return '#ff9f43';
            case 'Critical': return '#ea5455';
            case 'Out of Stock': return '#999';
            default: return '#666';
        }
    };

    const handleOpenUpdate = (item) => {
        setSelectedItem(item);
        setData({ 
            item_name: item.item_name, 
            category: item.category, 
            customCategory: '',
            quantity: item.quantity, 
            unit: item.unit,
            customUnit: ''
        });
        setIsAddingNewUnit(false);
        setIsAddingNewCategory(false);
        setModalType('update');
        setIsModalOpen(true);
    };

    const handleOpenRestock = () => {
        setSelectedItem(null);
        reset();
        clearErrors();
        setData({ 
            item_name: '', 
            category: categories[0] || 'Meat', 
            customCategory: '',
            quantity: '', 
            unit: units[0] || 'pcs',
            customUnit: ''
        });
        setIsAddingNewUnit(false);
        setIsAddingNewCategory(false);
        setModalType('restock');
        setIsModalOpen(true);
    };

    const handleCategoryChange = (e) => {
        const value = e.target.value;
        if (value === 'ADD_NEW') {
            setIsAddingNewCategory(true);
            setData('category', 'ADD_NEW');
        } else {
            setIsAddingNewCategory(false);
            setData('category', value);
        }
    };

    const handleUnitChange = (e) => {
        const value = e.target.value;
        if (value === 'ADD_NEW') {
            setIsAddingNewUnit(true);
            setData('unit', 'ADD_NEW');
        } else {
            setIsAddingNewUnit(false);
            setData('unit', value);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (modalType === 'update' && selectedItem) {
            put(route('vendor.inventory.update', selectedItem.id), {
                onSuccess: () => setIsModalOpen(false),
            });
        } else {
            post(route('vendor.inventory.store'), {
                onSuccess: () => setIsModalOpen(false),
            });
        }
    };

    const handleDelete = (id) => {
        if (confirm('Are you sure you want to delete this item?')) {
            router.delete(route('vendor.inventory.destroy', id));
        }
    };

    // Stats calculations
    const stats = useMemo(() => ({
        total: inventory.length,
        low: inventory.filter(i => i.status === 'Low Stock' || i.status === 'Critical').length,
        out: inventory.filter(i => i.status === 'Out of Stock').length
    }), [inventory]);

    return (
        <VendorLayout header={<h2>Inventory Tracking</h2>}>
            <Head title="Vendor Inventory" />
            
            <div className="inventory-container">
                <div className="inventory-stats">
                    <div className="stat-card">
                        <span className="stat-label">Total Items</span>
                        <span className="stat-value">{stats.total}</span>
                    </div>
                    <div className="stat-card warning">
                        <span className="stat-label">Low Stock</span>
                        <span className="stat-value">{stats.low}</span>
                    </div>
                    <div className="stat-card danger">
                        <span className="stat-label">Out of Stock</span>
                        <span className="stat-value">{stats.out}</span>
                    </div>
                </div>

                <div className="inventory-table-container">
                    <div className="table-header">
                        <div className="header-left-actions">
                            <h3>Stock Levels</h3>
                            <div className="inventory-search">
                                <span className="search-icon">🔍</span>
                                <input 
                                    type="text" 
                                    placeholder="Search ingredients..." 
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                        </div>
                        <button className="btn-restock" onClick={handleOpenRestock}>Log Restock / Add New</button>
                    </div>
                    
                    <table className="inventory-table">
                        <thead>
                            <tr>
                                <th>Ingredient/Supply</th>
                                <th>Category</th>
                                <th>Current Stock</th>
                                <th>Status</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredInventory.length > 0 ? filteredInventory.map(item => (
                                <tr key={item.id}>
                                    <td className="item-name-cell">{item.item_name}</td>
                                    <td><span className="cat-pill">{item.category}</span></td>
                                    <td className="stock-cell">
                                        <span className="stock-num">{item.quantity}</span>
                                        <span className="unit-label">{item.unit}</span>
                                    </td>
                                    <td>
                                        <span 
                                            className="status-dot-wrapper"
                                            style={{ color: getStatusColor(calculateStatus(item.quantity)) }}
                                        >
                                            <span className="status-dot" style={{ backgroundColor: getStatusColor(calculateStatus(item.quantity)) }}></span>
                                            {calculateStatus(item.quantity)}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="action-buttons">
                                            <button className="btn-update-action" onClick={() => handleOpenUpdate(item)}>✏️</button>
                                            <button className="btn-action-delete" onClick={() => handleDelete(item.id)}>🗑️</button>
                                        </div>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="5" className="empty-search">No results found for "{searchQuery}"</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h3>{modalType === 'update' ? 'Update Stock Item' : 'Add New Stock / Restock'}</h3>
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label>Item Name</label>
                                <input 
                                    type="text" 
                                    value={data.item_name} 
                                    onChange={(e) => setData('item_name', e.target.value)}
                                    placeholder="e.g. Burger Patties"
                                    required 
                                />
                            </div>
                            
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Category</label>
                                    <select 
                                        value={data.category} 
                                        onChange={handleCategoryChange}
                                        required
                                    >
                                        {!categories.includes(data.category) && data.category !== 'ADD_NEW' && (
                                            <option value={data.category}>{data.category}</option>
                                        )}
                                        {categories.map(cat => (
                                            <option key={cat} value={cat}>{cat}</option>
                                        ))}
                                        <option value="ADD_NEW">+ Add New Category...</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Unit</label>
                                    <select 
                                        value={data.unit} 
                                        onChange={handleUnitChange}
                                        required
                                    >
                                        {!units.includes(data.unit) && data.unit !== 'ADD_NEW' && (
                                            <option value={data.unit}>{data.unit}</option>
                                        )}
                                        {units.map(u => (
                                            <option key={u} value={u}>{u}</option>
                                        ))}
                                        <option value="ADD_NEW">+ Add New Unit...</option>
                                    </select>
                                </div>
                            </div>

                            {isAddingNewCategory && (
                                <div className="form-group animated-field">
                                    <label>New Category Name</label>
                                    <input 
                                        type="text" 
                                        value={data.customCategory} 
                                        onChange={(e) => setData(prev => ({ ...prev, customCategory: e.target.value, category: e.target.value }))}
                                        placeholder="e.g. Spices, Cleaning, etc."
                                        required 
                                        autoFocus
                                    />
                                </div>
                            )}

                            {isAddingNewUnit && (
                                <div className="form-group animated-field">
                                    <label>New Unit Name</label>
                                    <input 
                                        type="text" 
                                        value={data.customUnit} 
                                        onChange={(e) => setData(prev => ({ ...prev, customUnit: e.target.value, unit: e.target.value }))}
                                        placeholder="e.g. trays, bags, oz"
                                        required 
                                        autoFocus
                                    />
                                </div>
                            )}

                            <div className="form-group">
                                <label>Current Quantity</label>
                                <input 
                                    type="number" 
                                    value={data.quantity} 
                                    onChange={(e) => setData('quantity', e.target.value)}
                                    placeholder="0"
                                    required 
                                />
                            </div>
                            
                            <div className="modal-actions">
                                <button type="button" className="btn-cancel" onClick={() => setIsModalOpen(false)}>Cancel</button>
                                <button type="submit" className="btn-save" disabled={processing}>Save Changes</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <style dangerouslySetInnerHTML={{ __html: `
                .inventory-container { display: flex; flex-direction: column; gap: 30px; }
                .inventory-stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; }
                .stat-card { background: white; padding: 25px; border-radius: 20px; box-shadow: 0 4px 15px rgba(0,0,0,0.02); display: flex; align-items: center; gap: 20px; }
                .stat-icon { width: 60px; height: 60px; border-radius: 15px; display: flex; align-items: center; justify-content: center; font-size: 1.5rem; }
                .stat-info { display: flex; flex-direction: column; gap: 5px; }
                .stat-label { color: #999; font-size: 0.85rem; font-weight: 600; }
                .stat-value { font-size: 1.5rem; font-weight: 800; color: #333; }

                .inventory-table-container { background: white; padding: 25px; border-radius: 20px; box-shadow: 0 4px 15px rgba(0,0,0,0.02); }
                .table-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px; gap: 20px; }
                .header-left-actions { display: flex; align-items: center; gap: 30px; flex-grow: 1; }
                .table-header h3 { font-weight: 800; color: #333; white-space: nowrap; }
                
                .inventory-search { position: relative; max-width: 350px; width: 100%; }
                .inventory-search .search-icon { position: absolute; left: 15px; top: 50%; transform: translateY(-50%); opacity: 0.4; }
                .inventory-search input { width: 100%; padding: 10px 15px 10px 45px; border-radius: 12px; border: 1px solid #eee; font-size: 0.9rem; transition: all 0.3s; }

                .btn-restock { background: #333; color: white; border: none; padding: 10px 20px; border-radius: 12px; font-weight: 700; cursor: pointer; white-space: nowrap; }
                
                .inventory-table { width: 100%; border-collapse: collapse; }
                .inventory-table th { text-align: left; padding: 15px; color: #bbb; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 1px; border-bottom: 1px solid #f0f0f0; }
                .inventory-table td { padding: 20px 15px; border-bottom: 1px solid #f8f8f8; font-size: 0.95rem; }
                .item-name-cell { font-weight: 700; color: #333; }
                .cat-pill { background: #f0f4f8; color: #546e7a; padding: 4px 10px; border-radius: 8px; font-size: 0.8rem; font-weight: 600; }
                .stock-num { font-weight: 800; font-size: 1.1rem; margin-right: 5px; }
                .unit-label { color: #999; font-size: 0.85rem; }
                
                .status-dot-wrapper { display: flex; align-items: center; gap: 8px; font-weight: 700; font-size: 0.85rem; }
                .status-dot { width: 8px; height: 8px; border-radius: 50%; }
                
                .btn-update-action { background: none; border: none; font-size: 1.1rem; cursor: pointer; transition: all 0.2s; opacity: 0.6; }
                .btn-update-action:hover { opacity: 1; transform: scale(1.1); }
                .btn-action-delete { background: none; border: none; cursor: pointer; font-size: 1rem; opacity: 0.6; transition: opacity 0.2s; }
                .btn-action-delete:hover { opacity: 1; }
                .action-buttons { display: flex; gap: 10px; align-items: center; }

                /* Modal Styles */
                .modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; z-index: 2000; }
                .modal-content { background: white; padding: 30px; border-radius: 20px; width: 100%; max-width: 500px; box-shadow: 0 20px 40px rgba(0,0,0,0.2); }
                .modal-content h3 { margin-bottom: 20px; font-weight: 800; }
                .form-group { margin-bottom: 20px; display: flex; flex-direction: column; gap: 8px; }
                .form-group label { font-weight: 700; font-size: 0.9rem; color: #666; }
                .form-group input, .form-group select { padding: 12px; border-radius: 10px; border: 1px solid #eee; font-family: inherit; font-size: 0.95rem; }
                .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
                .modal-actions { display: flex; justify-content: flex-end; gap: 10px; margin-top: 30px; }
                .modal-actions button { padding: 12px 24px; border-radius: 10px; font-weight: 700; cursor: pointer; border: none; }
                .btn-cancel { background: #f0f0f0; color: #666; }
                .btn-save { background: #333; color: white; }

                .animated-field { animation: slideDown 0.3s ease-out; }
                @keyframes slideDown { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
            `}} />
        </VendorLayout>
    );
}
