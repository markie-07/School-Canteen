import VendorLayout from '@/Layouts/VendorLayout';
import { Head, useForm, router } from '@inertiajs/react';
import React, { useState, useMemo, useEffect } from 'react';

export default function VendorProcurementReport({ procurements, inventoryItems }) {
    const [searchQuery, setSearchQuery] = useState('');
    const [filterDate, setFilterDate] = useState('');
    
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingLog, setEditingLog] = useState(null);
    const [isAddingNewItem, setIsAddingNewItem] = useState(false);
    const [isAddingNewUnit, setIsAddingNewUnit] = useState(false);
    const [isAddingNewCategory, setIsAddingNewCategory] = useState(false);
    
    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm({
        item_name: '',
        customItem: '',
        category: '',
        customCategory: '',
        quantity: '',
        unit: '',
        customUnit: '',
        supplier: '',
        total_cost: '',
        date: new Date().toISOString().split('T')[0],
        status: 'Delivered'
    });

    // Filter Logic
    const filteredProcurements = useMemo(() => {
        return procurements.filter(p => {
            const matchesSearch = p.item_name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                                p.supplier.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                p.category.toLowerCase().includes(searchQuery.toLowerCase());
            
            const matchesDate = !filterDate || p.date === filterDate;
            
            return matchesSearch && matchesDate;
        });
    }, [procurements, searchQuery, filterDate]);

    const units = useMemo(() => {
        const uniqueUnits = [...new Set([...procurements.map(p => p.unit), ...inventoryItems.map(i => i.unit)])];
        return uniqueUnits;
    }, [procurements]);

    const categories = useMemo(() => {
        const uniqueCats = [...new Set([...procurements.map(p => p.category), ...inventoryItems.map(i => i.category)])];
        return uniqueCats;
    }, [procurements]);

    const handleItemChange = (e) => {
        const value = e.target.value;
        if (value === 'ADD_NEW') {
            setIsAddingNewItem(true);
            setData({ ...data, item_name: 'ADD_NEW', category: '', unit: '' });
        } else {
            setIsAddingNewItem(false);
            const matched = inventoryItems.find(i => i.item_name === value);
            if (matched) {
                setData({ ...data, item_name: value, category: matched.category, unit: matched.unit });
                setIsAddingNewCategory(false);
                setIsAddingNewUnit(false);
            } else {
                setData('item_name', value);
            }
        }
    };

    const handleOpenEditModal = (log) => {
        setEditingLog(log);
        setData({
            item_name: log.item_name,
            customItem: '',
            category: log.category,
            customCategory: '',
            quantity: log.quantity,
            unit: log.unit,
            customUnit: '',
            supplier: log.supplier,
            total_cost: log.total_cost,
            date: log.date,
            status: log.status
        });
        setIsAddingNewItem(false);
        setIsAddingNewCategory(false);
        setIsAddingNewUnit(false);
        setIsModalOpen(true);
    };

    const handleDeleteLog = (id) => {
        if(confirm('Are you sure you want to delete this procurement log?')) {
            router.delete(route('vendor.reports.procurement.destroy', id));
        }
    };

    const handleAddProcurement = (e) => {
        e.preventDefault();

        if (editingLog) {
            put(route('vendor.reports.procurement.update', editingLog.id), {
                onSuccess: () => handleCloseModal(),
            });
        } else {
            post(route('vendor.reports.procurement.store'), {
                onSuccess: () => handleCloseModal(),
            });
        }
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        resetForm();
    };

    const resetForm = () => {
        reset();
        clearErrors();
        setEditingLog(null);
        setIsAddingNewItem(false);
        setIsAddingNewUnit(false);
        setIsAddingNewCategory(false);
    };

    const totalExpenseValue = useMemo(() => {
        const total = filteredProcurements.reduce((acc, curr) => {
            return acc + parseFloat(curr.total_cost);
        }, 0);
        return `₱${total.toLocaleString()}`;
    }, [filteredProcurements]);

    return (
        <VendorLayout header={<h2>Procurement & Expense Reports</h2>}>
            <Head title="Procurement Report" />
            
            <div className="procurement-container">
                <div className="summary-cards">
                    <div className="summary-card">
                        <span className="label">Total Spending (Filtered)</span>
                        <span className="value">{totalExpenseValue}</span>
                        <span className="trend positive">Based on selection</span>
                    </div>
                    <div className="summary-card">
                        <span className="label">Logs Found</span>
                        <span className="value">{filteredProcurements.length}</span>
                        <span className="trend">Across history</span>
                    </div>
                    <div className="summary-card">
                        <span className="label">Pending Items</span>
                        <span className="value">{filteredProcurements.filter(p => p.status === 'Pending').length}</span>
                        <span className="trend warning">Awaiting delivery</span>
                    </div>
                </div>

                <div className="report-table-section">
                    <div className="table-header">
                        <h3>Procurement History</h3>
                        <div className="toolbar-container">
                            <div className="toolbar-left">
                                <div className="search-box">
                                    <span className="search-icon">🔍</span>
                                    <input 
                                        type="text" 
                                        placeholder="Search item, supplier..." 
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                </div>
                                <div className="date-filter-single">
                                    <div className="date-input-group">
                                        <label>Filter by Date</label>
                                        <input 
                                            type="date" 
                                            value={filterDate}
                                            onChange={(e) => setFilterDate(e.target.value)}
                                        />
                                    </div>
                                    {filterDate && (
                                        <button className="btn-clear" onClick={() => setFilterDate('')}>✕</button>
                                    )}
                                </div>
                            </div>
                            <div className="toolbar-right">
                                <button className="btn-export">
                                    <span className="icon">📥</span> Export CSV
                                </button>
                                <button className="btn-add-log" onClick={() => setIsModalOpen(true)}>+ Add New Log</button>
                            </div>
                        </div>
                    </div>
                    
                    <div className="table-wrapper">
                        <table className="procurement-table">
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Item Details</th>
                                    <th>Category</th>
                                    <th>Quantity</th>
                                    <th>Supplier</th>
                                    <th>Total Cost</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredProcurements.length > 0 ? filteredProcurements.map(log => (
                                    <tr key={log.id}>
                                        <td className="date-cell">{log.date}</td>
                                        <td className="item-cell">
                                            <span className="i-name">{log.item_name}</span>
                                        </td>
                                        <td><span className="cat-pill">{log.category}</span></td>
                                        <td className="qty-cell">
                                            <span className="q-val">{log.quantity}</span>
                                            <span className="u-val">{log.unit}</span>
                                        </td>
                                        <td className="supplier-cell">{log.supplier}</td>
                                        <td className="cost-cell">₱{parseFloat(log.total_cost).toLocaleString()}</td>
                                        <td>
                                            <span className={`status-pill ${log.status.toLowerCase()}`}>
                                                {log.status}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="action-buttons">
                                                <button className="btn-action edit" onClick={() => handleOpenEditModal(log)}>✏️</button>
                                                <button className="btn-action delete" onClick={() => handleDeleteLog(log.id)}>🗑️</button>
                                            </div>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan="8" className="empty-results">No procurement logs match your filters.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h3>{editingLog ? 'Edit Procurement Log' : 'Log New Procurement'}</h3>
                        <form onSubmit={handleAddProcurement}>
                            <div className="form-group">
                                <label>Item Name</label>
                                <select 
                                    value={data.item_name} 
                                    onChange={handleItemChange}
                                    required
                                >
                                    <option value="" disabled hidden>Select Item from Inventory</option>
                                    {!inventoryItems.some(i => i.item_name === data.item_name) && data.item_name !== 'ADD_NEW' && data.item_name !== '' && (
                                        <option value={data.item_name}>{data.item_name}</option>
                                    )}
                                    {inventoryItems.map(i => (
                                        <option key={i.item_name} value={i.item_name}>{i.item_name}</option>
                                    ))}
                                    <option value="ADD_NEW">+ Add New Item (Not in Inventory)...</option>
                                </select>
                            </div>

                            {isAddingNewItem && (
                                <div className="form-group animated-field">
                                    <label>New Item Name</label>
                                    <input 
                                        type="text" 
                                        value={data.customItem} 
                                        onChange={(e) => setData(prev => ({ ...prev, customItem: e.target.value, item_name: e.target.value }))}
                                        placeholder="Enter item name"
                                        required 
                                        autoFocus
                                    />
                                </div>
                            )}
                            
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Category</label>
                                    <select 
                                        value={data.category} 
                                        onChange={(e) => {
                                            const val = e.target.value;
                                            if (val === 'ADD_NEW') {
                                                setIsAddingNewCategory(true);
                                                setData('category', 'ADD_NEW');
                                            } else {
                                                setIsAddingNewCategory(false);
                                                setData('category', val);
                                            }
                                        }}
                                        required
                                    >
                                        <option value="" disabled hidden>Select Category</option>
                                        {!categories.includes(data.category) && data.category !== 'ADD_NEW' && data.category !== '' && (
                                            <option value={data.category}>{data.category}</option>
                                        )}
                                        {categories.map(c => (
                                            <option key={c} value={c}>{c}</option>
                                        ))}
                                        <option value="ADD_NEW">+ Add New Category...</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Unit</label>
                                    <select 
                                        value={data.unit} 
                                        onChange={(e) => {
                                            const val = e.target.value;
                                            if (val === 'ADD_NEW') {
                                                setIsAddingNewUnit(true);
                                                setData('unit', 'ADD_NEW');
                                            } else {
                                                setIsAddingNewUnit(false);
                                                setData('unit', val);
                                            }
                                        }}
                                        required
                                    >
                                        <option value="" disabled hidden>Select Unit</option>
                                        {!units.includes(data.unit) && data.unit !== 'ADD_NEW' && data.unit !== '' && (
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
                                        placeholder="Enter new category"
                                        required 
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
                                        placeholder="e.g. trays, bags"
                                        required 
                                    />
                                </div>
                            )}

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Quantity</label>
                                    <input 
                                        type="number" 
                                        step="0.01"
                                        value={data.quantity} 
                                        onChange={(e) => setData('quantity', e.target.value)}
                                        placeholder="0"
                                        required 
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Supplier</label>
                                    <input 
                                        type="text" 
                                        value={data.supplier} 
                                        onChange={(e) => setData('supplier', e.target.value)}
                                        placeholder="e.g. FreshMeat Co."
                                        required 
                                    />
                                </div>
                            </div>
                            
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Total Cost (₱)</label>
                                    <input 
                                        type="number" 
                                        value={data.total_cost} 
                                        onChange={(e) => setData('total_cost', e.target.value)}
                                        placeholder="0.00"
                                        required 
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Date</label>
                                    <input 
                                        type="date" 
                                        value={data.date} 
                                        onChange={(e) => setData('date', e.target.value)}
                                        required 
                                    />
                                </div>
                            </div>
                            
                            <div className="form-group">
                                <label>Status</label>
                                <select 
                                    value={data.status} 
                                    onChange={(e) => setData('status', e.target.value)}
                                >
                                    <option>Delivered</option>
                                    <option>Pending</option>
                                </select>
                            </div>
                            
                            <div className="modal-actions">
                                <button type="button" className="btn-cancel" onClick={handleCloseModal}>Cancel</button>
                                <button type="submit" className="btn-save" disabled={processing}>{editingLog ? 'Update Log' : 'Add Log'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <style dangerouslySetInnerHTML={{ __html: `
                .procurement-container { display: flex; flex-direction: column; gap: 30px; }
                .summary-cards { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; }
                .summary-card { background: white; padding: 25px; border-radius: 20px; box-shadow: 0 4px 15px rgba(0,0,0,0.02); display: flex; flex-direction: column; gap: 10px; }
                .summary-card .label { color: #999; font-size: 0.85rem; font-weight: 700; text-transform: uppercase; }
                .summary-card .value { font-size: 1.8rem; font-weight: 800; color: #333; }
                .summary-card .trend { font-size: 0.75rem; font-weight: 700; padding: 4px 8px; border-radius: 6px; width: fit-content; background: #f8f9fa; }
                
                .report-table-section { background: white; padding: 30px; border-radius: 20px; box-shadow: 0 4px 15px rgba(0,0,0,0.02); }
                .table-header { display: flex; flex-direction: column; gap: 20px; margin-bottom: 25px; }
                .table-header h3 { font-weight: 800; color: #333; }
                
                .toolbar-container { display: flex; justify-content: space-between; align-items: center; gap: 20px; }
                .toolbar-left { display: flex; align-items: center; gap: 15px; flex-grow: 1; }
                .toolbar-right { display: flex; align-items: center; gap: 12px; }

                .search-box { position: relative; max-width: 300px; width: 100%; }
                .search-box .search-icon { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); opacity: 0.4; }
                .search-box input { width: 100%; padding: 10px 15px 10px 40px; border-radius: 12px; border: 1px solid #eee; font-size: 0.85rem; transition: all 0.3s; }
                .search-box input:focus { border-color: #333; outline: none; background: #fafafa; }

                .date-filter-single { display: flex; align-items: center; gap: 10px; background: #fcfcfc; padding: 5px 12px; border-radius: 12px; border: 1px solid #f0f0f0; }
                .date-input-group { display: flex; align-items: center; gap: 8px; }
                .date-input-group label { font-size: 0.7rem; font-weight: 700; color: #999; text-transform: uppercase; white-space: nowrap; }
                .date-input-group input { border: none; background: none; font-size: 0.85rem; font-weight: 600; color: #333; cursor: pointer; padding: 5px 0; }
                .btn-clear { background: #eee; border: none; border-radius: 50%; width: 18px; height: 18px; font-size: 0.55rem; cursor: pointer; display: flex; align-items: center; justify-content: center; }

                .btn-add-log { background: #333; color: white; border: none; padding: 10px 20px; border-radius: 12px; font-weight: 700; font-size: 0.9rem; cursor: pointer; transition: all 0.2s; white-space: nowrap; }
                .btn-export { background: white; border: 1.5px solid #eee; padding: 10px 20px; border-radius: 12px; font-weight: 700; font-size: 0.9rem; cursor: pointer; color: #555; display: flex; align-items: center; gap: 8px; transition: all 0.3s ease; white-space: nowrap; }
                .btn-export:hover { border-color: #333; color: #333; }

                .procurement-table { width: 100%; border-collapse: collapse; }
                .procurement-table th { text-align: left; padding: 15px; color: #bbb; font-size: 0.75rem; text-transform: uppercase; border-bottom: 1px solid #f0f0f0; }
                .procurement-table td { padding: 20px 15px; border-bottom: 1px solid #f8f8f8; font-size: 0.95rem; }
                
                .item-cell .i-name { font-weight: 700; color: #333; }
                .cat-pill { background: #f0f4f8; color: #546e7a; padding: 4px 10px; border-radius: 8px; font-size: 0.8rem; font-weight: 600; }
                .qty-cell { display: flex; align-items: baseline; gap: 4px; }
                .cost-cell { font-weight: 800; color: var(--primary-emerald); }
                .status-pill { padding: 4px 12px; border-radius: 20px; font-size: 0.75rem; font-weight: 700; }
                .status-pill.delivered { background: #e9f9ef; color: #28c76f; }
                .status-pill.pending { background: #fff8f0; color: #ff9f43; }

                .action-buttons { display: flex; gap: 10px; }
                .btn-action { background: none; border: none; cursor: pointer; font-size: 1.1rem; opacity: 0.6; transition: opacity 0.2s; }
                .btn-action:hover { opacity: 1; }
                .empty-results { text-align: center; padding: 60px !important; color: #999; font-style: italic; }

                .modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; z-index: 2000; }
                .modal-content { background: white; padding: 30px; border-radius: 20px; width: 100%; max-width: 500px; box-shadow: 0 20px 40px rgba(0,0,0,0.2); overflow-y: auto; max-height: 90vh; }
                .modal-content h3 { margin-bottom: 20px; font-weight: 800; }
                .form-group { margin-bottom: 15px; display: flex; flex-direction: column; gap: 6px; }
                .form-group label { font-weight: 700; font-size: 0.85rem; color: #666; }
                .form-group input, .form-group select { padding: 10px; border-radius: 8px; border: 1px solid #eee; font-family: inherit; font-size: 0.9rem; }
                .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; }
                .modal-actions { display: flex; justify-content: flex-end; gap: 10px; margin-top: 25px; }
                .modal-actions button { padding: 10px 20px; border-radius: 8px; font-weight: 700; cursor: pointer; border: none; }
                .btn-cancel { background: #f0f0f0; }
                .btn-save { background: #333; color: white; }
                .animated-field { animation: slideDown 0.3s ease-out; }
                @keyframes slideDown { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }

                @media (max-width: 1024px) {
                    .toolbar-container { flex-direction: column; align-items: stretch; }
                    .toolbar-left { flex-wrap: wrap; }
                    .toolbar-right { justify-content: flex-end; }
                }
            `}} />
        </VendorLayout>
    );
}
