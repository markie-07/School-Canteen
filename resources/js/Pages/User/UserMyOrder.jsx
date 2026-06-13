import UserLayout from '@/Layouts/UserLayout';
import Modal from '@/Components/Modal';
import { Head, router } from '@inertiajs/react';
import React, { useState } from 'react';

export default function UserMyOrder({ orders = {} }) {
    const [activeTab, setActiveTab] = useState('active');
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [cancelModalOpen, setCancelModalOpen] = useState(false);
    const [cancellingOrderId, setCancellingOrderId] = useState(null);
    const [customerReason, setCustomerReason] = useState('Change of mind / Ordered wrong items');
    const [customReason, setCustomReason] = useState('');
    
    // Rating States
    const [ratingInput, setRatingInput] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [commentInput, setCommentInput] = useState('');
    const [suggestionInput, setSuggestionInput] = useState('');
    const [ratingProcessing, setRatingProcessing] = useState(false);

    const handleSelectOrder = (order) => {
        setSelectedOrder(order);
        setRatingInput(0);
        setHoverRating(0);
        setCommentInput('');
        setSuggestionInput('');
    };

    const handleRateSubmit = (e) => {
        e.preventDefault();
        if (ratingInput === 0) {
            alert('Please select a star rating.');
            return;
        }

        setRatingProcessing(true);
        router.post(route('user.orders.rate', selectedOrder.id), {
            rating: ratingInput,
            comment: commentInput,
            suggestion: suggestionInput
        }, {
            onSuccess: () => {
                setRatingProcessing(false);
                setSelectedOrder(null);
                alert('Thank you for rating this store!');
            },
            onError: (errs) => {
                setRatingProcessing(false);
                console.error(errs);
            }
        });
    };

    const handleCancelOrder = (id) => {
        setCancellingOrderId(id);
        setCustomerReason('Change of mind / Ordered wrong items');
        setCustomReason('');
        setCancelModalOpen(true);
    };

    const submitCustomerCancel = (e) => {
        e.preventDefault();
        const finalReason = customerReason === 'Others' ? customReason.trim() : customerReason;
        if (!finalReason) {
            alert('Please specify a reason for cancellation.');
            return;
        }

        router.patch(route('user.orders.cancel', cancellingOrderId), {
            cancel_reason: finalReason
        }, {
            onSuccess: () => {
                setCancelModalOpen(false);
                setCancellingOrderId(null);
                setSelectedOrder(null);
            }
        });
    };

    const pending = orders.pending || [];
    const preparing = orders.preparing || [];
    const serving = orders.serving || [];
    const served = orders.served || [];

    const activeOrders = [
        ...pending.map(o => ({ ...o, status: 'Pending' })),
        ...preparing.map(o => ({ ...o, status: 'Preparing' })),
        ...serving.map(o => ({ ...o, status: 'Serving' }))
    ].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    const pastOrders = served.map(o => ({ ...o, status: o.status || 'Served' }))
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    const renderOrderCard = (order) => (
        <div 
            key={`${order.status}-${order.id}`} 
            className="order-history-card"
            onClick={() => handleSelectOrder(order)}
        >
            <div className="order-history-header">
                <div className="oh-left">
                    <span className="oh-id">{order.order_number}</span>
                    <span className="oh-date">{new Date(order.created_at).toLocaleDateString()}</span>
                </div>
                <div className={`oh-status-badge ${order.status.toLowerCase()}`}>
                    {order.status}
                </div>
            </div>
            
            <div className="order-history-body">
                <div className="oh-items">
                    <span className="oh-item-summary">
                        {(() => {
                            if (!order.items) return '';
                            try {
                                const parsed = JSON.parse(order.items);
                                if (Array.isArray(parsed)) {
                                    return parsed.map(item => `${item.quantity}x ${item.name}`).join(', ');
                                }
                            } catch (e) {}
                            return order.items;
                        })()}
                    </span>
                </div>
                <div className="oh-vendor">
                    <span className="icon">🏪</span> {order.vendor_name || 'Vendor'}
                </div>

                {/* Card Process Tracker (Only for Active Orders) */}
                {order.status !== 'Served' && order.status !== 'Cancelled' && (
                    <div className="card-process-tracker">
                        <div className="progress-track">
                            <div 
                                className="progress-fill" 
                                style={{ 
                                    width: order.status === 'Pending' ? '16%' : order.status === 'Preparing' ? '50%' : '84%' 
                                }} 
                            />
                        </div>
                        <div className="stepper-dots">
                            <div className={`step-dot-item ${['Pending', 'Preparing', 'Serving'].includes(order.status) ? 'active' : ''}`}>
                                <span className="dot"></span>
                                <span className="dot-label">Placed</span>
                            </div>
                            <div className={`step-dot-item ${['Preparing', 'Serving'].includes(order.status) ? 'active' : ''}`}>
                                <span className="dot"></span>
                                <span className="dot-label">Preparing</span>
                            </div>
                            <div className={`step-dot-item ${order.status === 'Serving' ? 'active' : ''}`}>
                                <span className="dot"></span>
                                <span className="dot-label">Ready</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <div className="order-history-footer">
                <div className="oh-total">
                    <span className="label">Total Amount</span>
                    <span className="amount">₱{parseFloat(order.total_price || 0).toLocaleString()}</span>
                </div>
                {order.status === 'Served' ? (
                    <button className="reorder-btn" onClick={(e) => e.stopPropagation()}>Order Again</button>
                ) : (
                    <div className="track-link">View Details →</div>
                )}
            </div>
        </div>
    );

    return (
        <UserLayout header={<h2>My Orders</h2>}>
            <Head title="My Orders" />

            <div className="orders-page-container">
                <div className="orders-tabs">
                    <button 
                        className={`tab-btn ${activeTab === 'active' ? 'active' : ''}`}
                        onClick={() => setActiveTab('active')}
                    >
                        Active Orders
                        {activeOrders.length > 0 && <span className="tab-count">{activeOrders.length}</span>}
                    </button>
                    <button 
                        className={`tab-btn ${activeTab === 'past' ? 'active' : ''}`}
                        onClick={() => setActiveTab('past')}
                    >
                        Order History
                    </button>
                </div>

                <div className="orders-content-area">
                    {activeTab === 'active' ? (
                        <div className="orders-grid-premium">
                            {activeOrders.length > 0 ? (
                                activeOrders.map(renderOrderCard)
                            ) : (
                                <div className="orders-empty-state">
                                    <div className="empty-icon">🍔</div>
                                    <h3>No active orders</h3>
                                    <p>Hungry? Start exploring the canteen menus!</p>
                                    <button className="start-ordering-btn" onClick={() => window.location.href = route('user.order')}>
                                        Browse Menus
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="orders-grid-premium">
                            {pastOrders.length > 0 ? (
                                pastOrders.map(renderOrderCard)
                            ) : (
                                <div className="orders-empty-state">
                                    <div className="empty-icon">⏳</div>
                                    <h3>No order history</h3>
                                    <p>Your completed orders will appear here.</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            <Modal show={selectedOrder !== null} onClose={() => setSelectedOrder(null)} maxWidth="md">
                {selectedOrder && (
                    <div className="order-details-modal">
                        <div className="od-modal-header">
                            <div className="od-title">
                                <h3>Order Details</h3>
                                <span className="od-number">{selectedOrder.order_number}</span>
                            </div>
                            <div className={`oh-status-badge ${selectedOrder.status.toLowerCase()}`}>
                                {selectedOrder.status}
                            </div>
                        </div>

                        <div className="od-modal-body">
                            {/* Visual Order Stepper Tracker inside Modal */}
                            <div className="od-section">
                                <label className="tracking-label">Order Process Tracker</label>
                                {selectedOrder.status === 'Cancelled' ? (
                                    <div className="cancelled-alert-banner">
                                        <span className="alert-icon">⚠️</span>
                                        <div className="alert-info" style={{ width: '100%' }}>
                                            <h4 style={{ margin: '0 0 2px 0', fontSize: '0.85rem', fontWeight: 800, color: '#c92a2a' }}>Order Cancelled</h4>
                                            <p style={{ margin: 0, fontSize: '0.74rem', color: '#fa5252', fontWeight: 600, lineHeight: 1.35 }}>
                                                {selectedOrder.cancel_reason && (selectedOrder.cancel_reason.startsWith('Customer:') || selectedOrder.cancel_reason === 'Cancelled by customer')
                                                    ? 'This order has been cancelled by you.' 
                                                    : 'This order has been cancelled by the vendor. Please contact the stall owner if you have questions.'}
                                            </p>
                                            {selectedOrder.cancel_reason && (
                                                <div className="cancel-reason-box" style={{ marginTop: '8px', background: 'rgba(239, 84, 85, 0.08)', padding: '6px 10px', borderRadius: '6px', borderLeft: '3px solid #ea5455' }}>
                                                    <span style={{ fontWeight: 800, color: '#c92a2a', display: 'block', fontSize: '0.65rem', textTransform: 'uppercase', marginBottom: '2px', letterSpacing: '0.5px' }}>Reason for cancellation:</span>
                                                    <span style={{ fontWeight: 700, color: '#d9383a', fontSize: '0.76rem', fontStyle: 'italic', display: 'block', lineHeight: '1.3' }}>
                                                        "{selectedOrder.cancel_reason.replace(/^(Customer|Vendor):\s*/, '')}"
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="modal-process-stepper-horizontal">
                                        <div className="progress-bar-bg">
                                            <div 
                                                className="progress-bar-fill" 
                                                style={{ 
                                                    width: selectedOrder.status === 'Pending' ? '0%' : 
                                                           selectedOrder.status === 'Preparing' ? '33.33%' : 
                                                           selectedOrder.status === 'Serving' ? '66.66%' : '100%' 
                                                }} 
                                            />
                                        </div>
                                        <div className="stepper-steps">
                                            <div className={`step-node ${['Pending', 'Preparing', 'Serving', 'Served'].includes(selectedOrder.status) ? 'completed' : ''} ${selectedOrder.status === 'Pending' ? 'current' : ''}`}>
                                                <div className="step-icon-circle">🏪</div>
                                                <span className="step-label">Placed</span>
                                            </div>
                                            <div className={`step-node ${['Preparing', 'Serving', 'Served'].includes(selectedOrder.status) ? 'completed' : ''} ${selectedOrder.status === 'Preparing' ? 'current' : ''}`}>
                                                <div className="step-icon-circle">🍳</div>
                                                <span className="step-label">Preparing</span>
                                            </div>
                                            <div className={`step-node ${['Serving', 'Served'].includes(selectedOrder.status) ? 'completed' : ''} ${selectedOrder.status === 'Serving' ? 'current' : ''}`}>
                                                <div className="step-icon-circle">🛎️</div>
                                                <span className="step-label">Ready</span>
                                            </div>
                                            <div className={`step-node ${selectedOrder.status === 'Served' ? 'completed' : ''} ${selectedOrder.status === 'Served' ? 'current' : ''}`}>
                                                <div className="step-icon-circle">✅</div>
                                                <span className="step-label">Completed</span>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="od-section">
                                <label>Store</label>
                                <p>🏪 {selectedOrder.vendor_name}</p>
                            </div>

                            <div className="od-section">
                                <label>Items</label>
                                <div className="od-items-list">
                                    {(() => {
                                        if (!selectedOrder.items) return null;
                                        try {
                                            const parsed = JSON.parse(selectedOrder.items);
                                            if (Array.isArray(parsed)) {
                                                return parsed.map((item, i) => (
                                                    <div key={i} className="od-item-row">
                                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                            <span>{item.quantity}x {item.name}</span>
                                                            <span style={{ color: '#888', fontWeight: 600 }}>₱{parseFloat(item.totalPrice || item.price * item.quantity || 0).toLocaleString()}</span>
                                                        </div>
                                                        {item.notes && (
                                                            <div style={{ 
                                                                marginTop: '6px', 
                                                                fontSize: '0.78rem', 
                                                                color: '#64748b', 
                                                                background: '#f8fafc',
                                                                padding: '6px 10px',
                                                                borderRadius: '8px',
                                                                borderLeft: '2px solid #cbd5e1',
                                                                fontStyle: 'italic',
                                                                wordBreak: 'break-word',
                                                                fontWeight: 'normal'
                                                            }}>
                                                                📝 Note: "{item.notes}"
                                                            </div>
                                                        )}
                                                    </div>
                                                ));
                                            }
                                        } catch (e) {}
                                        return selectedOrder.items.split(', ').map((item, i) => (
                                            <div key={i} className="od-item-row">{item}</div>
                                        ));
                                    })()}
                                </div>
                            </div>

                            <div className="od-section">
                                <label>Ordered On</label>
                                <p className="od-date-text">📅 {new Date(selectedOrder.created_at).toLocaleString()}</p>
                            </div>

                            {/* Star Rating & Comment Display / Form for Served Orders */}
                            {selectedOrder.status === 'Served' && selectedOrder.rating !== null && (
                                <div className="od-section rating-display-section">
                                    <label>Your Rating & Feedback</label>
                                    <div className="rating-display-card">
                                        <div className="rating-stars-row">
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <span key={star} className={`star-display ${star <= selectedOrder.rating ? 'active' : ''}`}>
                                                    ★
                                                </span>
                                            ))}
                                            <span className="rating-score-badge">{selectedOrder.rating}/5</span>
                                        </div>
                                        {selectedOrder.comment && (
                                            <p className="rating-comment-text">“{selectedOrder.comment}”</p>
                                        )}
                                        {selectedOrder.suggestion && (
                                            <div className="rating-suggestion-display" style={{ marginTop: '10px', padding: '12px', background: '#fffcf0', borderRadius: '12px', borderLeft: '4px solid #ffc107' }}>
                                                <span style={{ display: 'block', fontSize: '0.72rem', fontWeight: 800, color: '#b58900', textTransform: 'uppercase', marginBottom: '4px', letterSpacing: '0.5px' }}>💡 Your Suggestion:</span>
                                                <p style={{ margin: 0, fontSize: '0.85rem', color: '#856404', fontWeight: 600, fontStyle: 'italic', lineHeight: 1.4 }}>“{selectedOrder.suggestion}”</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {selectedOrder.status === 'Served' && selectedOrder.rating === null && (
                                <div className="od-section rating-form-section">
                                    <label>Rate your Experience</label>
                                    <form onSubmit={handleRateSubmit} className="rating-form-card">
                                        <p className="rating-hint">How was your order from {selectedOrder.vendor_name}? Help others by rating the store!</p>
                                        
                                        <div className="rating-stars-input">
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <button
                                                    type="button"
                                                    key={star}
                                                    className={`star-btn ${star <= hoverRating || star <= ratingInput ? 'active' : ''}`}
                                                    onClick={() => setRatingInput(star)}
                                                    onMouseEnter={() => setHoverRating(star)}
                                                    onMouseLeave={() => setHoverRating(0)}
                                                >
                                                    ★
                                                </button>
                                            ))}
                                        </div>

                                        <div className="form-group-inline">
                                            <textarea
                                                className="rating-comment-textarea"
                                                rows="3"
                                                placeholder="Leave a comment about the food, service, or speed... (optional)"
                                                value={commentInput}
                                                onChange={(e) => setCommentInput(e.target.value)}
                                            />
                                        </div>

                                        <div className="form-group-inline" style={{ marginTop: '12px' }}>
                                            <textarea
                                                className="rating-suggestion-textarea"
                                                style={{ 
                                                    width: '100%', 
                                                    padding: '12px 16px', 
                                                    borderRadius: '14px', 
                                                    border: '1.5px solid #ffe899', 
                                                    fontSize: '0.9rem', 
                                                    outline: 'none', 
                                                    resize: 'none',
                                                    background: '#fffcf0',
                                                    color: '#856404'
                                                }}
                                                rows="2"
                                                placeholder="Do you have any suggestions for the store? (e.g. add more sauce, extra cups) (optional)"
                                                value={suggestionInput}
                                                onChange={(e) => setSuggestionInput(e.target.value)}
                                            />
                                        </div>

                                        <button 
                                            type="submit" 
                                            className="btn-submit-rating"
                                            disabled={ratingInput === 0 || ratingProcessing}
                                        >
                                            {ratingProcessing ? 'Submitting...' : 'Submit Review'}
                                        </button>
                                    </form>
                                </div>
                            )}
                        </div>

                        <div className="od-modal-footer">
                            <div className="od-total">
                                <span>Total Paid</span>
                                <span className="price">₱{parseFloat(selectedOrder.total_price).toLocaleString()}</span>
                            </div>
                            <div style={{ display: 'flex', gap: '10px' }}>
                                {selectedOrder.status === 'Pending' && (
                                    <button 
                                        className="btn-cancel-order" 
                                        onClick={() => handleCancelOrder(selectedOrder.id)}
                                    >
                                        Cancel Order
                                    </button>
                                )}
                                <button className="close-details-btn" onClick={() => setSelectedOrder(null)}>
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </Modal>

            {cancelModalOpen && (
                <div className="custom-modal-overlay" onClick={() => setCancelModalOpen(false)}>
                    <div className="custom-modal-card" onClick={(e) => e.stopPropagation()}>
                        <div className="custom-modal-header">
                            <span className="modal-title-icon">⚠️</span>
                            <h3>Cancel Your Order</h3>
                            <button className="modal-close-btn" onClick={() => setCancelModalOpen(false)}>&times;</button>
                        </div>
                        <form onSubmit={submitCustomerCancel}>
                            <div className="modal-body">
                                <p className="modal-subtitle">Please select a reason for cancelling this order. This will be visible in your order history.</p>
                                
                                <div className="form-group">
                                    <label htmlFor="student-cancel-reason" className="form-label">Cancellation Reason</label>
                                    <select 
                                        id="student-cancel-reason"
                                        className="form-select"
                                        value={customerReason}
                                        onChange={(e) => setCustomerReason(e.target.value)}
                                    >
                                        <option value="Change of mind / Ordered wrong items">Change of mind / Ordered wrong items</option>
                                        <option value="Found another food choice">Found another food choice</option>
                                        <option value="Ordered from a wrong stall">Ordered from a wrong stall</option>
                                        <option value="Took too long to be confirmed">Took too long to be confirmed</option>
                                        <option value="Others">Others (Specify below)</option>
                                    </select>
                                </div>

                                {customerReason === 'Others' && (
                                    <div className="form-group anim-fade-in">
                                        <label htmlFor="student-custom-reason" className="form-label">Specify Custom Reason</label>
                                        <textarea
                                            id="student-custom-reason"
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
                            <div className="modal-footer" style={{ borderTop: '1px solid rgba(0,0,0,0.06)' }}>
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
                .orders-page-container {
                    max-width: 1000px;
                    margin: 0 auto;
                }
                .orders-tabs {
                    display: flex;
                    gap: 10px;
                    margin-bottom: 30px;
                    background: #f1f3f5;
                    padding: 6px;
                    border-radius: 16px;
                    width: fit-content;
                }
                .tab-btn {
                    padding: 10px 24px;
                    border: none;
                    background: none;
                    border-radius: 12px;
                    font-weight: 700;
                    color: #777;
                    cursor: pointer;
                    transition: all 0.2s;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }
                .tab-btn.active {
                    background: white;
                    color: #333;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.05);
                }
                .tab-count {
                    background: var(--primary-red);
                    color: white;
                    font-size: 0.7rem;
                    padding: 2px 7px;
                    border-radius: 10px;
                }

                .orders-grid-premium {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
                    gap: 20px;
                }

                .order-history-card {
                    background: white;
                    border-radius: 20px;
                    padding: 20px;
                    border: 1px solid rgba(0,0,0,0.05);
                    box-shadow: 0 5px 15px rgba(0,0,0,0.02);
                    transition: transform 0.2s;
                }
                .order-history-card:hover {
                    transform: translateY(-4px);
                    box-shadow: 0 10px 25px rgba(0,0,0,0.05);
                }

                .order-history-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    margin-bottom: 15px;
                }
                .oh-id { display: block; font-weight: 800; color: #333; font-size: 1.1rem; }
                .oh-date { font-size: 0.8rem; color: #999; font-weight: 600; }
                
                .oh-status-badge {
                    padding: 5px 12px;
                    border-radius: 20px;
                    font-size: 0.7rem;
                    font-weight: 800;
                    text-transform: uppercase;
                }
                .oh-status-badge.pending { background: #fff8e6; color: #ffa000; }
                .oh-status-badge.preparing { background: #e3f2fd; color: #1e88e5; }
                .oh-status-badge.serving { background: #f3e5f5; color: #8e24aa; }
                .oh-status-badge.served { background: #e9f9ef; color: #28c76f; }
                .oh-status-badge.cancelled { background: #ffebee; color: #ea5455; }

                /* Card Process Tracker Styles */
                .card-process-tracker {
                    margin-top: 15px;
                    padding-top: 15px;
                    border-top: 1px solid rgba(0,0,0,0.04);
                }
                .progress-track {
                    height: 5px;
                    background: #e2e8f0;
                    border-radius: 10px;
                    position: relative;
                    overflow: hidden;
                    margin-bottom: 8px;
                }
                .progress-fill {
                    height: 100%;
                    background: linear-gradient(90deg, var(--primary-red) 0%, #ff7675 100%);
                    border-radius: 10px;
                    transition: width 0.6s cubic-bezier(0.4, 0, 0.2, 1);
                }
                .stepper-dots {
                    display: flex;
                    justify-content: space-between;
                    position: relative;
                }
                .step-dot-item {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    font-size: 0.72rem;
                    font-weight: 750;
                    color: #94a3b8;
                    transition: color 0.3s ease;
                }
                .step-dot-item.active {
                    color: #334155;
                }
                .step-dot-item .dot {
                    width: 8px;
                    height: 8px;
                    border-radius: 50%;
                    background: #cbd5e1;
                    margin-bottom: 4px;
                    transition: all 0.3s ease;
                }
                .step-dot-item.active .dot {
                    background: var(--primary-red);
                    box-shadow: 0 0 8px rgba(234, 84, 85, 0.5);
                    transform: scale(1.2);
                }
                .step-dot-item.active .dot-label {
                    color: #1e293b;
                    font-weight: 800;
                }

                /* Modal Process Stepper */
                .modal-process-stepper-horizontal {
                    position: relative;
                    margin-top: 15px;
                    margin-bottom: 25px;
                    padding: 0 10px;
                }
                .modal-process-stepper-horizontal .progress-bar-bg {
                    position: absolute;
                    top: 18px;
                    left: 40px;
                    right: 40px;
                    height: 4px;
                    background: #e2e8f0;
                    border-radius: 10px;
                    z-index: 1;
                }
                .modal-process-stepper-horizontal .progress-bar-fill {
                    height: 100%;
                    background: linear-gradient(90deg, #28c76f 0%, #48da89 100%);
                    border-radius: 10px;
                    transition: width 0.6s cubic-bezier(0.4, 0, 0.2, 1);
                }
                .modal-process-stepper-horizontal .stepper-steps {
                    display: flex;
                    justify-content: space-between;
                    position: relative;
                    z-index: 2;
                }
                .modal-process-stepper-horizontal .step-node {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    width: 70px;
                }
                .modal-process-stepper-horizontal .step-icon-circle {
                    width: 36px;
                    height: 36px;
                    border-radius: 50%;
                    background: #f1f5f9;
                    border: 2.5px solid #cbd5e1;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 1.1rem;
                    transition: all 0.4s ease;
                    color: #94a3b8;
                }
                .modal-process-stepper-horizontal .step-node.completed .step-icon-circle {
                    background: #e6fcf5;
                    border-color: #28c76f;
                    color: #28c76f;
                    box-shadow: 0 0 10px rgba(40, 199, 111, 0.15);
                }
                .modal-process-stepper-horizontal .step-node.current .step-icon-circle {
                    background: #e8f4fd;
                    border-color: #1e88e5;
                    color: #1e88e5;
                    transform: scale(1.15);
                    box-shadow: 0 0 12px rgba(30, 136, 229, 0.3);
                    animation: pulseCircleHorizontal 2s infinite ease-in-out;
                }
                @keyframes pulseCircleHorizontal {
                    0% { box-shadow: 0 0 0 0 rgba(30, 136, 229, 0.4); }
                    70% { box-shadow: 0 0 0 8px rgba(30, 136, 229, 0); }
                    100% { box-shadow: 0 0 0 0 rgba(30, 136, 229, 0); }
                }
                .modal-process-stepper-horizontal .step-label {
                    margin-top: 8px;
                    font-size: 0.72rem;
                    font-weight: 750;
                    color: #94a3b8;
                    text-align: center;
                    transition: color 0.3s;
                }
                .modal-process-stepper-horizontal .step-node.completed .step-label {
                    color: #1e293b;
                    font-weight: 800;
                }
                .modal-process-stepper-horizontal .step-node.current .step-label {
                    color: #1e88e5;
                    font-weight: 900;
                }

                /* Canceled Alert Banner */
                .cancelled-alert-banner {
                    display: flex;
                    gap: 10px;
                    background: #fff5f5;
                    border: 1px solid #ffe3e3;
                    border-radius: 10px;
                    padding: 10px 14px;
                    margin-top: 8px;
                    align-items: flex-start;
                }
                .cancelled-alert-banner .alert-icon {
                    font-size: 1.1rem;
                    line-height: 1.2;
                }
                .cancelled-alert-banner h4 {
                    margin: 0 0 2px 0;
                    font-size: 0.85rem;
                    font-weight: 800;
                    color: #c92a2a;
                }
                .cancelled-alert-banner p {
                    margin: 0;
                    font-size: 0.74rem;
                    color: #fa5252;
                    font-weight: 600;
                    line-height: 1.35;
                }

                .order-history-body {
                    margin-bottom: 20px;
                    padding-bottom: 15px;
                    border-bottom: 1px dashed #eee;
                }
                .oh-items {
                    display: flex;
                    justify-content: space-between;
                    margin-bottom: 8px;
                }
                .oh-item-name { font-weight: 700; color: #444; }
                .oh-item-qty { color: #888; font-weight: 600; }
                .oh-vendor { font-size: 0.85rem; color: #666; font-weight: 600; }

                .order-history-footer {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
                .oh-total .label { display: block; font-size: 0.75rem; color: #999; font-weight: 700; text-transform: uppercase; }
                .oh-total .amount { font-size: 1.2rem; font-weight: 900; color: var(--primary-red); }

                .reorder-btn {
                    padding: 8px 16px;
                    background: #f8f9fa;
                    border: 1px solid #eee;
                    border-radius: 10px;
                    font-weight: 700;
                    font-size: 0.85rem;
                    cursor: pointer;
                    transition: 0.2s;
                }
                .reorder-btn:hover { background: #eee; }
                .track-link { font-size: 0.85rem; color: var(--primary-red); font-weight: 700; cursor: pointer; }

                .orders-empty-state {
                    grid-column: 1 / -1;
                    text-align: center;
                    padding: 80px 40px;
                    background: white;
                    border-radius: 30px;
                    border: 2px dashed #eee;
                }
                .empty-icon { font-size: 4rem; margin-bottom: 20px; }
                .orders-empty-state h3 { font-size: 1.5rem; font-weight: 800; margin-bottom: 10px; }
                .orders-empty-state p { color: #888; margin-bottom: 25px; }
                .start-ordering-btn {
                    padding: 12px 30px;
                    background: var(--primary-red);
                    color: white;
                    border: none;
                    border-radius: 12px;
                    font-weight: 700;
                    cursor: pointer;
                    box-shadow: 0 8px 20px var(--primary-red-alpha);
                }

                /* Modal Styles */
                .order-details-modal {
                    padding: 30px;
                    background: #ffffff;
                    border-radius: 24px;
                    box-shadow: 0 20px 40px rgba(0,0,0,0.12);
                    border: 1px solid rgba(0,0,0,0.06);
                    max-height: 85vh;
                    display: flex;
                    flex-direction: column;
                    overflow: hidden;
                }
                .od-modal-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 20px;
                    padding-bottom: 15px;
                    border-bottom: 1px solid #f1f3f5;
                    flex-shrink: 0;
                }
                .od-title h3 {
                    margin: 0;
                    font-size: 1.4rem;
                    font-weight: 850;
                    color: #1a1a1a;
                }
                .od-number {
                    font-size: 0.85rem;
                    color: #888;
                    font-weight: 600;
                    display: block;
                    margin-top: 3px;
                }
                
                .od-modal-body {
                    display: flex;
                    flex-direction: column;
                    gap: 20px;
                    margin-bottom: 20px;
                    overflow-y: auto;
                    padding-right: 8px;
                    flex-grow: 1;
                }
                .od-modal-body::-webkit-scrollbar {
                    width: 6px;
                }
                .od-modal-body::-webkit-scrollbar-track {
                    background: transparent;
                }
                .od-modal-body::-webkit-scrollbar-thumb {
                    background: #cbd5e1;
                    border-radius: 10px;
                }
                .od-modal-body::-webkit-scrollbar-thumb:hover {
                    background: #94a3b8;
                }
                .od-section label {
                    display: block;
                    font-size: 0.72rem;
                    text-transform: uppercase;
                    color: #a0a0a0;
                    font-weight: 800;
                    margin-bottom: 6px;
                    letter-spacing: 0.8px;
                }
                .od-section p {
                    margin: 0;
                    font-weight: 700;
                    color: #2d3748;
                    font-size: 1.05rem;
                }
                .od-date-text {
                    font-size: 0.88rem !important;
                    color: #718096 !important;
                    font-weight: 600 !important;
                }
                
                .od-items-list {
                    background: #f8f9fa;
                    padding: 20px;
                    border-radius: 16px;
                    border: 1px solid #e9ecef;
                }
                .od-item-row {
                    padding: 10px 0;
                    font-weight: 700;
                    color: #495057;
                    font-size: 0.95rem;
                }
                .od-item-row:not(:last-child) {
                    border-bottom: 1px solid #dee2e6;
                }

                .od-modal-footer {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    border-top: 1px solid #f1f3f5;
                    padding-top: 20px;
                    margin-top: 10px;
                    flex-shrink: 0;
                }
                .od-total span { display: block; }
                .od-total span:first-child {
                    font-size: 0.75rem;
                    color: #999;
                    font-weight: 700;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }
                .od-total .price {
                    font-size: 1.6rem;
                    font-weight: 900;
                    color: var(--primary-red);
                    margin-top: 2px;
                }
                
                .close-details-btn {
                    padding: 12px 30px;
                    background: #1a1a1a;
                    color: white;
                    border: none;
                    border-radius: 12px;
                    font-weight: 700;
                    cursor: pointer;
                    transition: all 0.2s ease;
                }
                .close-details-btn:hover {
                    background: #000000;
                    transform: translateY(-1px);
                    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                }
                .btn-cancel-order {
                    padding: 12px 24px;
                    background: #fff5f5;
                    color: #ea5455;
                    border: 1.5px solid #fecdd3;
                    border-radius: 12px;
                    font-weight: 700;
                    cursor: pointer;
                    transition: all 0.2s ease;
                }
                .btn-cancel-order:hover {
                    background: #ffe4e6;
                    color: #c92a2a;
                    border-color: #fca5a5;
                    transform: translateY(-1px);
                    box-shadow: 0 4px 12px rgba(234, 84, 85, 0.1);
                }

                /* Student Cancel Modal Premium Styles */
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
                    z-index: 20000;
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
                    text-align: left;
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

                /* Rating UI CSS */
                .rating-display-section {
                    background: #f8fafc;
                    padding: 16px;
                    border-radius: 16px;
                    border: 1px solid #e2e8f0;
                    margin-top: 15px;
                }
                .rating-display-card {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                }
                .rating-stars-row {
                    display: flex;
                    align-items: center;
                    gap: 4px;
                }
                .star-display {
                    font-size: 1.5rem;
                    color: #cbd5e1;
                }
                .star-display.active {
                    color: #ffb800;
                    text-shadow: 0 0 4px rgba(255, 184, 0, 0.4);
                }
                .rating-score-badge {
                    margin-left: 8px;
                    background: #fff;
                    color: #475569;
                    font-size: 0.8rem;
                    font-weight: 800;
                    padding: 3px 8px;
                    border-radius: 20px;
                    border: 1px solid #cbd5e1;
                }
                .rating-comment-text {
                    margin: 0;
                    font-size: 0.9rem;
                    color: #475569;
                    font-style: italic;
                    line-height: 1.4;
                    background: white;
                    padding: 10px 12px;
                    border-radius: 8px;
                    border-left: 3px solid #28c76f;
                }

                .rating-form-section {
                    background: #fff8f8;
                    padding: 20px;
                    border-radius: 18px;
                    border: 1.5px dashed #fca5a5;
                    margin-top: 15px;
                }
                .rating-form-card {
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                }
                .rating-hint {
                    margin: 0;
                    font-size: 0.85rem;
                    color: #64748b;
                    font-weight: 600;
                }
                .rating-stars-input {
                    display: flex;
                    gap: 6px;
                    justify-content: center;
                    margin: 8px 0;
                }
                .star-btn {
                    background: none;
                    border: none;
                    font-size: 2.2rem;
                    color: #cbd5e1;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    padding: 0;
                }
                .star-btn:hover {
                    transform: scale(1.2);
                }
                .star-btn.active {
                    color: #ffb800;
                    text-shadow: 0 0 8px rgba(255, 184, 0, 0.5);
                }
                .rating-comment-textarea {
                    width: 100%;
                    padding: 12px;
                    border-radius: 12px;
                    border: 1px solid #cbd5e1;
                    font-family: inherit;
                    font-size: 0.88rem;
                    background: #fff;
                    resize: vertical;
                    min-height: 70px;
                    outline: none;
                    box-sizing: border-box;
                    transition: all 0.2s;
                }
                .rating-comment-textarea:focus {
                    border-color: var(--primary-red);
                    box-shadow: 0 0 0 3px rgba(234, 84, 85, 0.12);
                }
                .btn-submit-rating {
                    width: 100%;
                    padding: 12px;
                    background: linear-gradient(135deg, var(--primary-red) 0%, #ff7675 100%);
                    color: white;
                    border: none;
                    border-radius: 12px;
                    font-weight: 800;
                    cursor: pointer;
                    box-shadow: 0 4px 12px rgba(234, 84, 85, 0.15);
                    transition: all 0.2s;
                }
                .btn-submit-rating:hover:not(:disabled) {
                    filter: brightness(1.05);
                    transform: translateY(-1px);
                    box-shadow: 0 6px 16px rgba(234, 84, 85, 0.25);
                }
                .btn-submit-rating:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                    background: #cbd5e1;
                    box-shadow: none;
                }
            `}} />
        </UserLayout>
    );
}
