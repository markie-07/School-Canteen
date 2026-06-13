import VendorLayout from '@/Layouts/VendorLayout';
import { Head, router } from '@inertiajs/react';
import React, { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { VendorOrderItemsList } from '@/Utils/orderHelper';

export default function VendorOrders({ orders }) {
    const [cancelModalOpen, setCancelModalOpen] = useState(false);
    const [selectedOrderId, setSelectedOrderId] = useState(null);
    const [cancelReason, setCancelReason] = useState('Out of stock / Ingredients unavailable');
    const [customReason, setCustomReason] = useState('');

    const confirmOrder = (id) => {
        router.patch(route('vendor.orders.update-status', id), {
            status: 'preparing',
            current_status: 'pending'
        });
    };

    const openCancelModal = (id) => {
        setSelectedOrderId(id);
        setCancelReason('Out of stock / Ingredients unavailable');
        setCustomReason('');
        setCancelModalOpen(true);
    };

    const handleCancelSubmit = (e) => {
        e.preventDefault();
        const finalReason = cancelReason === 'Others' ? customReason.trim() : cancelReason;
        if (!finalReason) {
            alert('Please specify a reason for cancellation.');
            return;
        }

        router.patch(route('vendor.orders.update-status', selectedOrderId), {
            status: 'cancelled',
            current_status: 'pending',
            cancel_reason: finalReason
        }, {
            onSuccess: () => {
                setCancelModalOpen(false);
                setSelectedOrderId(null);
            }
        });
    };

    return (
        <VendorLayout header={<h2>New Orders</h2>}>
            <Head title="New Orders" />
            
            <div className="orders-grid">
                {orders.length > 0 ? orders.map(order => (
                    <div key={order.id} className="order-card">
                        <div className="order-card-header">
                            <span className="order-id">#{order.order_number}</span>
                            <span className="order-time">{formatDistanceToNow(new Date(order.created_at))} ago</span>
                        </div>
                        <div className="order-card-body">
                            <div className="customer-info-section">
                                <p className="customer-name">{order.user?.name || order.customer_name}</p>
                                {order.user && (
                                    <div className="customer-sub-details">
                                        <span className="customer-detail-badge">🆔 {order.user.id_number || 'N/A'}</span>
                                        <span className="customer-detail-badge">📞 {order.user.phone || 'N/A'}</span>
                                    </div>
                                )}
                            </div>
                            <VendorOrderItemsList itemsString={order.items} />
                            <p className="order-total">₱{parseFloat(order.total_price).toLocaleString()}</p>
                        </div>
                        <div className="order-card-actions">
                            <button onClick={() => openCancelModal(order.id)} className="btn-cancel">Cancel</button>
                            <button onClick={() => confirmOrder(order.id)} className="btn-confirm">Confirm & Prepare</button>
                        </div>
                    </div>
                )) : (
                    <div className="empty-state">
                        <p>No new orders at the moment. ☕</p>
                    </div>
                )}
            </div>

            {cancelModalOpen && (
                <div className="custom-modal-overlay" onClick={() => setCancelModalOpen(false)}>
                    <div className="custom-modal-card" onClick={(e) => e.stopPropagation()}>
                        <div className="custom-modal-header">
                            <span className="modal-title-icon">⚠️</span>
                            <h3>Cancel Order</h3>
                            <button className="modal-close-btn" onClick={() => setCancelModalOpen(false)}>&times;</button>
                        </div>
                        <form onSubmit={handleCancelSubmit}>
                            <div className="modal-body">
                                <p className="modal-subtitle">Please select a reason for cancelling this order. This will be visible to the customer.</p>
                                
                                <div className="form-group">
                                    <label htmlFor="cancel-reason-select" className="form-label">Cancellation Reason</label>
                                    <select 
                                        id="cancel-reason-select"
                                        className="form-select"
                                        value={cancelReason}
                                        onChange={(e) => setCancelReason(e.target.value)}
                                    >
                                        <option value="Out of stock / Ingredients unavailable">Out of stock / Ingredients unavailable</option>
                                        <option value="Store is closing early">Store is closing early</option>
                                        <option value="Technical / Kitchen issues">Technical / Kitchen issues</option>
                                        <option value="Cannot fulfill order in time">Cannot fulfill order in time</option>
                                        <option value="Others">Others (Specify below)</option>
                                    </select>
                                </div>

                                {cancelReason === 'Others' && (
                                    <div className="form-group anim-fade-in">
                                        <label htmlFor="custom-reason-textarea" className="form-label">Specify Custom Reason</label>
                                        <textarea
                                            id="custom-reason-textarea"
                                            className="form-textarea"
                                            rows="3"
                                            placeholder="Type custom reason here..."
                                            value={customReason}
                                            onChange={(e) => setCustomReason(e.target.value)}
                                            required
                                        />
                                    </div>
                                )}
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn-modal-cancel" onClick={() => setCancelModalOpen(false)}>
                                    Go Back
                                </button>
                                <button type="submit" className="btn-modal-confirm">
                                    Confirm Cancellation
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <style dangerouslySetInnerHTML={{ __html: `
                .orders-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
                    gap: 20px;
                }
                .order-card {
                    background: white;
                    border-radius: 15px;
                    padding: 20px;
                    box-shadow: 0 4px 15px rgba(0,0,0,0.05);
                    border: 1px solid rgba(0,0,0,0.05);
                    transition: transform 0.2s;
                }
                .order-card:hover { transform: translateY(-5px); }
                .order-card-header {
                    display: flex;
                    justify-content: space-between;
                    margin-bottom: 15px;
                    border-bottom: 1px dashed #eee;
                    padding-bottom: 10px;
                }
                .order-id { font-weight: 800; color: var(--primary-red); }
                .order-time { font-size: 0.8rem; color: #999; }
                .customer-name { font-weight: 750; color: #1a1a1a; margin-bottom: 0; }
                .customer-info-section {
                    margin-bottom: 12px;
                    background: #f8f9fa;
                    padding: 10px 14px;
                    border-radius: 10px;
                    border-left: 3px solid var(--primary-red);
                }
                .customer-sub-details {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 8px;
                    margin-top: 6px;
                }
                .customer-detail-badge {
                    font-size: 0.72rem;
                    background: white;
                    padding: 3px 8px;
                    border-radius: 6px;
                    border: 1px solid #e2e8f0;
                    color: #4a5568;
                    font-weight: 750;
                    display: inline-flex;
                    align-items: center;
                    gap: 4px;
                }
                .order-items { font-size: 0.9rem; color: #666; margin-bottom: 10px; }
                .order-total { font-weight: 800; font-size: 1.1rem; color: #333; }
                .order-card-actions {
                    display: flex;
                    gap: 10px;
                    margin-top: 20px;
                }
                .order-card-actions button {
                    flex: 1;
                    padding: 10px;
                    border-radius: 10px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s;
                    border: none;
                }
                .btn-cancel { background: #f8f9fa; color: #666; }
                .btn-confirm { background: var(--primary-red); color: white; }
                .btn-cancel:hover { background: #eee; }
                .btn-confirm:hover { filter: brightness(1.1); }
                .empty-state {
                    grid-column: 1 / -1;
                    text-align: center;
                    padding: 50px;
                    background: white;
                    border-radius: 20px;
                    color: #999;
                }

                /* Premium Modal Styles */
                .custom-modal-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(15, 23, 42, 0.3);
                    backdrop-filter: blur(8px);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 1000;
                    animation: fadeInOverlay 0.25s ease-out;
                }
                .custom-modal-card {
                    background: rgba(255, 255, 255, 0.95);
                    border-radius: 20px;
                    width: 90%;
                    max-width: 480px;
                    box-shadow: 0 20px 40px rgba(15, 23, 42, 0.15);
                    border: 1px solid rgba(255,255,255,0.8);
                    animation: slideUpCard 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
                    overflow: hidden;
                }
                .custom-modal-header {
                    display: flex;
                    align-items: center;
                    padding: 20px 24px;
                    border-bottom: 1px solid rgba(0,0,0,0.06);
                    position: relative;
                }
                .modal-title-icon {
                    font-size: 1.4rem;
                    margin-right: 12px;
                }
                .custom-modal-header h3 {
                    margin: 0;
                    font-size: 1.25rem;
                    font-weight: 800;
                    color: #1e293b;
                }
                .modal-close-btn {
                    position: absolute;
                    right: 20px;
                    top: 50%;
                    transform: translateY(-50%);
                    background: none;
                    border: none;
                    font-size: 1.5rem;
                    color: #94a3b8;
                    cursor: pointer;
                    transition: color 0.2s;
                }
                .modal-close-btn:hover {
                    color: #475569;
                }
                .modal-body {
                    padding: 24px;
                }
                .modal-subtitle {
                    font-size: 0.88rem;
                    color: #64748b;
                    margin: 0 0 20px 0;
                    line-height: 1.5;
                }
                .form-group {
                    margin-bottom: 18px;
                }
                .form-label {
                    display: block;
                    font-size: 0.75rem;
                    text-transform: uppercase;
                    color: #64748b;
                    font-weight: 800;
                    margin-bottom: 6px;
                    letter-spacing: 0.5px;
                }
                .form-select, .form-textarea {
                    width: 100%;
                    padding: 10px 14px;
                    border-radius: 10px;
                    border: 1px solid #cbd5e1;
                    background: #f8fafc;
                    color: #1e293b;
                    font-size: 0.92rem;
                    font-weight: 600;
                    transition: all 0.2s;
                    box-sizing: border-box;
                }
                .form-select:focus, .form-textarea:focus {
                    outline: none;
                    border-color: var(--primary-red);
                    background: #fff;
                    box-shadow: 0 0 0 3px rgba(234, 84, 85, 0.15);
                }
                .form-textarea {
                    resize: vertical;
                    min-height: 80px;
                    font-family: inherit;
                }
                .modal-footer {
                    display: flex;
                    gap: 12px;
                    padding: 16px 24px 24px;
                    border-top: 1px solid rgba(0,0,0,0.06);
                    background: #f8fafc;
                }
                .btn-modal-cancel {
                    flex: 1;
                    background: white;
                    color: #64748b;
                    border: 1px solid #cbd5e1 !important;
                    padding: 11px !important;
                    font-size: 0.9rem;
                    font-weight: 700;
                    border-radius: 10px;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                .btn-modal-cancel:hover {
                    background: #f1f5f9;
                    color: #334155;
                }
                .btn-modal-confirm {
                    flex: 1.3;
                    background: linear-gradient(135deg, var(--primary-red) 0%, #ff7675 100%);
                    color: white;
                    border: none !important;
                    padding: 11px !important;
                    font-size: 0.9rem;
                    font-weight: 700;
                    border-radius: 10px;
                    cursor: pointer;
                    transition: all 0.2s;
                    box-shadow: 0 4px 12px rgba(234, 84, 85, 0.2);
                }
                .btn-modal-confirm:hover {
                    filter: brightness(1.05);
                    transform: translateY(-1px);
                    box-shadow: 0 6px 16px rgba(234, 84, 85, 0.3);
                }
                .anim-fade-in {
                    animation: fadeIn 0.2s ease-out forwards;
                }
                @keyframes fadeInOverlay {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes slideUpCard {
                    from { transform: translateY(20px); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(5px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}} />
        </VendorLayout>
    );
}
