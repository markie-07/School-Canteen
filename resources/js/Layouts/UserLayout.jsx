import React, { useState, useEffect } from 'react';
import { usePage, router } from '@inertiajs/react';
import UserSidebar from '@/Components/UserSidebar';
import axios from 'axios';
import './CanteenLayout.css';

export default function UserLayout({ header, children }) {
    const { props } = usePage();
    const user = props.auth.user;
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    
    // Global Cart State
    const [cart, setCart] = useState([]);
    const [showCartModal, setShowCartModal] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [editingNoteIndex, setEditingNoteIndex] = useState(null);
    const [noteInputVal, setNoteInputVal] = useState('');
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('Cash');

    useEffect(() => {
        // Load cart from localStorage on mount
        const savedCart = localStorage.getItem('school_canteen_cart');
        if (savedCart) {
            setCart(JSON.parse(savedCart));
        }

        // Listen for external cart updates (from UserOrder page)
        const handleCartUpdate = () => {
            const updatedCart = localStorage.getItem('school_canteen_cart');
            if (updatedCart) {
                setCart(JSON.parse(updatedCart));
            }
        };

        window.addEventListener('cart-updated', handleCartUpdate);
        return () => window.removeEventListener('cart-updated', handleCartUpdate);
    }, []);

    const updateCart = (newCart) => {
        setCart(newCart);
        localStorage.setItem('school_canteen_cart', JSON.stringify(newCart));
        window.dispatchEvent(new Event('cart-updated'));
    };

    const handleRemoveFromCart = (index) => {
        const newCart = cart.filter((_, i) => i !== index);
        updateCart(newCart);
    };

    const handleUpdateNotes = (index, notesText) => {
        const newCart = [...cart];
        newCart[index] = {
            ...newCart[index],
            notes: notesText.trim()
        };
        updateCart(newCart);
    };

    const handleInitiateCheckout = () => {
        if (cart.length === 0) return;
        
        const vendorId = cart[0].vendor_id;
        const allSameVendor = cart.every(item => item.vendor_id === vendorId);
        
        if (!allSameVendor) {
            alert('Please only order from one store at a time.');
            return;
        }

        if (!vendorId) {
            alert('Invalid vendor information in cart. Please clear your cart and try again.');
            return;
        }
        
        setShowPaymentModal(true);
    };

    const handleCheckout = async () => {
        if (cart.length === 0) return;
        
        const vendorId = cart[0].vendor_id;
        const allSameVendor = cart.every(item => item.vendor_id === vendorId);
        
        if (!allSameVendor) {
            alert('Please only order from one store at a time.');
            return;
        }

        if (!vendorId) {
            alert('Invalid vendor information in cart. Please clear your cart and try again.');
            return;
        }
        
        setProcessing(true);

        router.post(route('user.place-order'), {
            cart: cart,
            vendor_id: vendorId,
            payment_method: selectedPaymentMethod
        }, {
            onSuccess: () => {
                updateCart([]);
                setShowCartModal(false);
                setShowPaymentModal(false);
                setProcessing(false);
                alert('Order placed successfully! Check "My Orders" to track it.');
            },
            onError: (errors) => {
                setProcessing(false);
                console.error("Order errors:", errors);
                alert('Failed to place order. Please check the information.');
            },
            onFinish: () => setProcessing(false)
        });
    };

    const cartTotal = cart.reduce((sum, item) => sum + item.totalPrice, 0);

    return (
        <div className="canteen-app theme-user">
            <UserSidebar 
                isMobileOpen={isMobileMenuOpen} 
                user={user} 
            />

            {/* Main Content Area */}
            <main className="main-container">
                <header className="main-header">
                    <div className="header-left">
                        <button 
                            className="mobile-toggle"
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        >
                            <div className={`hamburger ${isMobileMenuOpen ? 'active' : ''}`}>
                                <span></span>
                                <span></span>
                                <span></span>
                            </div>
                        </button>
                        <div className="header-content">
                            {header}
                        </div>
                    </div>
                    
                    <div className="header-actions">
                        <div className="action-button notification">
                            <span className="icon">🔔</span>
                            <span className="badge">2</span>
                        </div>
                        <div className="header-divider"></div>
                        <div className="date-display">
                            <span className="day">{new Date().toLocaleDateString('en-US', { weekday: 'short' })}</span>
                            <span className="date">{new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                        </div>
                    </div>
                </header>

                <section className="content-body">
                    {children}
                </section>
            </main>

            {/* Overlay for mobile */}
            {isMobileMenuOpen && (
                <div 
                    className="mobile-overlay" 
                    onClick={() => setIsMobileMenuOpen(false)}
                ></div>
            )}
            {/* Global Floating Cart Summary */}
            {cart.length > 0 && (
                <div className={`floating-cart-bar ${showCartModal ? 'expanded' : 'collapsed'}`}>
                    {showCartModal ? (
                        <div className="cart-expanded-view">
                            <div className="cart-header">
                                <div className="cart-title-area">
                                    <h3>My Order</h3>
                                    <span className="cart-count">{cart.length} items</span>
                                </div>
                                <button className="minimize-cart-btn" onClick={() => setShowCartModal(false)}>
                                    <span className="arrow-down">▼</span>
                                </button>
                            </div>

                            <div className="cart-items-list">
                                {cart.map((item, idx) => (
                                    <div key={idx} className="cart-item-row">
                                        <div className="cart-item-info">
                                            <div className="cart-item-main">
                                                <span className="cart-item-name">{item.quantity}x {item.name}</span>
                                                <div className="cart-item-right">
                                                    <span className="cart-item-price">₱{item.totalPrice.toLocaleString()}</span>
                                                    <button className="remove-item-btn" onClick={() => handleRemoveFromCart(idx)}>✕</button>
                                                </div>
                                            </div>
                                            
                                            {/* Item Notes / Recommendation Preferences */}
                                            {editingNoteIndex === idx ? (
                                                <div className="cart-item-notes-edit" style={{ marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                                    <textarea
                                                        className="notes-textarea-inline"
                                                        value={noteInputVal}
                                                        onChange={(e) => setNoteInputVal(e.target.value)}
                                                        placeholder="Add instructions or ask for recommendation (e.g. no onions, make it spicy, recommend drinks...)"
                                                        autoFocus
                                                        style={{
                                                            width: '100%',
                                                            fontSize: '0.78rem',
                                                            padding: '6px 8px',
                                                            borderRadius: '8px',
                                                            border: '1px solid #dee2e6',
                                                            outline: 'none',
                                                            resize: 'none',
                                                            fontFamily: 'inherit',
                                                            minHeight: '45px'
                                                        }}
                                                    />
                                                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                                                        <button 
                                                            onClick={() => setEditingNoteIndex(null)}
                                                            style={{
                                                                padding: '2px 8px',
                                                                fontSize: '0.7rem',
                                                                borderRadius: '4px',
                                                                border: '1px solid #ccc',
                                                                background: 'white',
                                                                cursor: 'pointer'
                                                            }}
                                                        >
                                                            Cancel
                                                        </button>
                                                        <button 
                                                            onClick={() => {
                                                                handleUpdateNotes(idx, noteInputVal);
                                                                setEditingNoteIndex(null);
                                                            }}
                                                            style={{
                                                                padding: '2px 8px',
                                                                fontSize: '0.7rem',
                                                                borderRadius: '4px',
                                                                border: 'none',
                                                                background: 'var(--primary-red)',
                                                                color: 'white',
                                                                fontWeight: 'bold',
                                                                cursor: 'pointer'
                                                            }}
                                                        >
                                                            Save
                                                        </button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div style={{ marginTop: '4px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                                    {item.notes ? (
                                                        <div className="cart-item-notes-display" style={{ 
                                                            fontSize: '0.78rem', 
                                                            color: '#64748b', 
                                                            background: '#f8fafc',
                                                            padding: '4px 8px',
                                                            borderRadius: '6px',
                                                            borderLeft: '2px solid #cbd5e1',
                                                            display: 'flex',
                                                            justifyContent: 'space-between',
                                                            alignItems: 'flex-start',
                                                            gap: '8px'
                                                        }}>
                                                            <span style={{ fontStyle: 'italic', wordBreak: 'break-word' }}>📝 "{item.notes}"</span>
                                                            <button 
                                                                onClick={() => {
                                                                    setEditingNoteIndex(idx);
                                                                    setNoteInputVal(item.notes || '');
                                                                }}
                                                                style={{
                                                                    background: 'none',
                                                                    border: 'none',
                                                                    color: '#3b82f6',
                                                                    fontSize: '0.7rem',
                                                                    cursor: 'pointer',
                                                                    padding: 0,
                                                                    fontWeight: '600'
                                                                }}
                                                            >
                                                                Edit
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <button
                                                            onClick={() => {
                                                                setEditingNoteIndex(idx);
                                                                setNoteInputVal('');
                                                            }}
                                                            style={{
                                                                background: 'none',
                                                                border: 'none',
                                                                color: '#64748b',
                                                                fontSize: '0.75rem',
                                                                cursor: 'pointer',
                                                                padding: '2px 0',
                                                                textAlign: 'left',
                                                                display: 'inline-flex',
                                                                alignItems: 'center',
                                                                gap: '4px',
                                                                transition: '0.2s',
                                                            }}
                                                            onMouseOver={(e) => e.target.style.color = 'var(--primary-red)'}
                                                            onMouseOut={(e) => e.target.style.color = '#64748b'}
                                                        >
                                                            ➕ Add notes / recommendation request
                                                        </button>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="cart-footer">
                                <div className="cart-total-row">
                                    <span>Total</span>
                                    <span className="total-price">₱{cartTotal.toLocaleString()}</span>
                                </div>
                                <button 
                                    className="btn-checkout-premium" 
                                    onClick={handleInitiateCheckout}
                                    disabled={processing}
                                >
                                    {processing ? 'Processing...' : 'Place Order'}
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="cart-collapsed-view" onClick={() => setShowCartModal(true)}>
                            <div className="cart-mini-info">
                                <span className="cart-mini-icon">🛒</span>
                                <span className="cart-mini-count">{cart.length} items in cart</span>
                            </div>
                            <div className="cart-mini-total">
                                <span>Total: ₱{cartTotal.toLocaleString()}</span>
                                <button className="btn-view-cart">View Order</button>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Payment Modal */}
            {showPaymentModal && (
                <div className="payment-modal-backdrop">
                    <div className="payment-modal-card">
                        <button className="payment-modal-close" onClick={() => setShowPaymentModal(false)}>✕</button>
                        
                        <div className="payment-modal-header">
                            <span className="payment-modal-icon">💳</span>
                            <h3>Select Payment Method</h3>
                            <p>Choose your preferred way to pay for this order.</p>
                        </div>
                        
                        <div className="payment-options-grid">
                            <div 
                                className={`payment-option-card cash ${selectedPaymentMethod === 'Cash' ? 'active' : ''}`}
                                onClick={() => setSelectedPaymentMethod('Cash')}
                            >
                                <div className="option-icon">💵</div>
                                <div className="option-info">
                                    <h4>Cash on Counter</h4>
                                    <p>Pay directly at the store counter upon pick-up</p>
                                </div>
                                <div className="option-check">✓</div>
                            </div>
                            
                            <div 
                                className={`payment-option-card gcash ${selectedPaymentMethod === 'GCash' ? 'active' : ''}`}
                                onClick={() => setSelectedPaymentMethod('GCash')}
                            >
                                <div className="option-icon bg-blue">
                                    <span className="gcash-logo-text">G</span>
                                </div>
                                <div className="option-info">
                                    <h4>GCash Digital Wallet</h4>
                                    <p>Pay via GCash app or store QR code</p>
                                </div>
                                <div className="option-check">✓</div>
                            </div>
                            
                            <div 
                                className={`payment-option-card maya ${selectedPaymentMethod === 'Maya' ? 'active' : ''}`}
                                onClick={() => setSelectedPaymentMethod('Maya')}
                            >
                                <div className="option-icon bg-maya">
                                    <span className="maya-logo-text">M</span>
                                </div>
                                <div className="option-info">
                                    <h4>Maya Pay</h4>
                                    <p>Pay via Maya digital wallet or terminal</p>
                                </div>
                                <div className="option-check">✓</div>
                            </div>
                        </div>

                        <div className="payment-modal-footer">
                            <div className="payment-summary-row">
                                <span>Total Amount:</span>
                                <span className="summary-total-price">₱{cartTotal.toLocaleString()}</span>
                            </div>
                            <button 
                                className="btn-confirm-payment"
                                onClick={handleCheckout}
                                disabled={processing}
                            >
                                {processing ? (
                                    <span className="spinner-loader"></span>
                                ) : (
                                    `Confirm & Place Order (₱${cartTotal.toLocaleString()})`
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <style dangerouslySetInnerHTML={{ __html: `
                /* Payment Modal Backdrop */
                .payment-modal-backdrop {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(15, 23, 42, 0.6);
                    backdrop-filter: blur(8px);
                    -webkit-backdrop-filter: blur(8px);
                    z-index: 10005;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    animation: modalFadeIn 0.3s ease-out;
                    padding: 20px;
                }

                @keyframes modalFadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }

                /* Payment Modal Card */
                .payment-modal-card {
                    background: rgba(255, 255, 255, 0.95);
                    backdrop-filter: blur(20px);
                    -webkit-backdrop-filter: blur(20px);
                    border: 1px solid rgba(255, 255, 255, 0.5);
                    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
                    border-radius: 28px;
                    width: 100%;
                    max-width: 480px;
                    padding: 32px;
                    position: relative;
                    animation: modalScaleIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
                    color: #1e293b;
                }

                @keyframes modalScaleIn {
                    from { transform: scale(0.9) translateY(10px); opacity: 0; }
                    to { transform: scale(1) translateY(0); opacity: 1; }
                }

                .payment-modal-close {
                    position: absolute;
                    top: 20px;
                    right: 20px;
                    background: #f1f5f9;
                    border: none;
                    width: 32px;
                    height: 32px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 0.8rem;
                    color: #64748b;
                    cursor: pointer;
                    transition: all 0.2s ease;
                }
                .payment-modal-close:hover {
                    background: #e2e8f0;
                    color: #0f172a;
                    transform: rotate(90deg);
                }

                /* Header */
                .payment-modal-header {
                    text-align: center;
                    margin-bottom: 28px;
                }
                .payment-modal-icon {
                    font-size: 2.5rem;
                    display: inline-block;
                    margin-bottom: 12px;
                    animation: iconPulse 2s infinite ease-in-out;
                }
                @keyframes iconPulse {
                    0%, 100% { transform: scale(1); }
                    50% { transform: scale(1.08); }
                }
                .payment-modal-header h3 {
                    font-size: 1.35rem;
                    font-weight: 800;
                    color: #0f172a;
                    margin-bottom: 6px;
                    letter-spacing: -0.5px;
                }
                .payment-modal-header p {
                    font-size: 0.88rem;
                    color: #64748b;
                }

                /* Payment Options Grid */
                .payment-options-grid {
                    display: flex;
                    flex-direction: column;
                    gap: 14px;
                    margin-bottom: 28px;
                }

                .payment-option-card {
                    display: flex;
                    align-items: center;
                    gap: 16px;
                    padding: 16px 20px;
                    border-radius: 18px;
                    border: 2px solid #e2e8f0;
                    cursor: pointer;
                    transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
                    position: relative;
                    background: #ffffff;
                }

                .payment-option-card:hover {
                    border-color: #cbd5e1;
                    transform: translateY(-2px);
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
                }

                /* Cash Card Active state */
                .payment-option-card.cash.active {
                    border-color: #10b981;
                    background: #f0fdf4;
                    box-shadow: 0 10px 25px -5px rgba(16, 185, 129, 0.15);
                }
                /* GCash Card Active state */
                .payment-option-card.gcash.active {
                    border-color: #005ce6;
                    background: #eff6ff;
                    box-shadow: 0 10px 25px -5px rgba(0, 92, 230, 0.15);
                }
                /* Maya Card Active state */
                .payment-option-card.maya.active {
                    border-color: #00e676;
                    background: #f0fdf4;
                    box-shadow: 0 10px 25px -5px rgba(0, 230, 118, 0.15);
                }

                .option-icon {
                    width: 44px;
                    height: 44px;
                    border-radius: 12px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 1.4rem;
                    flex-shrink: 0;
                    font-weight: bold;
                    background: #f1f5f9;
                }

                .option-icon.bg-blue {
                    background: #005ce6;
                    color: white;
                }
                .gcash-logo-text {
                    font-family: 'Inter', sans-serif;
                    font-weight: 900;
                    font-size: 1.3rem;
                    letter-spacing: -1px;
                }

                .option-icon.bg-maya {
                    background: linear-gradient(135deg, #00ff87 0%, #60efff 100%);
                    color: #0c101b;
                }
                .maya-logo-text {
                    font-family: 'Outfit', sans-serif;
                    font-weight: 800;
                    font-size: 1.2rem;
                }

                .option-info {
                    flex-grow: 1;
                }
                .option-info h4 {
                    font-size: 0.95rem;
                    font-weight: 700;
                    color: #0f172a;
                    margin-bottom: 2px;
                }
                .option-info p {
                    font-size: 0.78rem;
                    color: #64748b;
                    line-height: 1.2;
                }

                .option-check {
                    width: 22px;
                    height: 22px;
                    border-radius: 50%;
                    border: 2px solid #cbd5e1;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 0.75rem;
                    color: transparent;
                    font-weight: bold;
                    transition: all 0.2s ease;
                }

                .payment-option-card.active .option-check {
                    color: white;
                    border-color: transparent;
                }

                .payment-option-card.cash.active .option-check {
                    background: #10b981;
                }
                .payment-option-card.gcash.active .option-check {
                    background: #005ce6;
                }
                .payment-option-card.maya.active .option-check {
                    background: #00e676;
                }

                /* Footer styling */
                .payment-modal-footer {
                    margin-top: 24px;
                    border-top: 1px solid #e2e8f0;
                    padding-top: 20px;
                }

                .payment-summary-row {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 18px;
                    font-size: 0.95rem;
                    font-weight: 600;
                    color: #475569;
                }
                .summary-total-price {
                    font-size: 1.3rem;
                    font-weight: 800;
                    color: var(--primary-red);
                }

                .btn-confirm-payment {
                    width: 100%;
                    padding: 16px;
                    border-radius: 16px;
                    border: none;
                    background: var(--primary-red);
                    color: white;
                    font-weight: 800;
                    font-size: 1rem;
                    cursor: pointer;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    box-shadow: 0 10px 15px -3px rgba(239, 68, 68, 0.3);
                }
                .btn-confirm-payment:hover:not(:disabled) {
                    background: var(--primary-red-hover);
                    transform: translateY(-2px);
                    box-shadow: 0 12px 20px -3px rgba(239, 68, 68, 0.4);
                }
                .btn-confirm-payment:active:not(:disabled) {
                    transform: translateY(0);
                }
                .btn-confirm-payment:disabled {
                    opacity: 0.7;
                    cursor: not-allowed;
                }

                /* Loader */
                .spinner-loader {
                    width: 22px;
                    height: 22px;
                    border: 3px solid rgba(255, 255, 255, 0.3);
                    border-radius: 50%;
                    border-top-color: white;
                    animation: spin 0.8s linear infinite;
                }
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }

                .floating-cart-bar {
                    position: fixed;
                    bottom: 30px;
                    right: 30px;
                    z-index: 10001;
                    background: white;
                    box-shadow: 0 15px 45px rgba(0,0,0,0.15);
                    border: 1px solid rgba(0,0,0,0.05);
                    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
                }
                .floating-cart-bar.collapsed {
                    border-radius: 50px;
                    padding: 8px 12px 8px 20px;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    width: auto;
                    max-width: 400px;
                }
                .floating-cart-bar.collapsed:hover {
                    transform: translateY(-5px);
                    background: #fdfdfd;
                }
                .floating-cart-bar.expanded {
                    border-radius: 24px;
                    width: 350px;
                    bottom: 30px;
                }

                .cart-collapsed-view {
                    display: flex;
                    align-items: center;
                    gap: 25px;
                    width: 100%;
                }
                .cart-mini-info { display: flex; align-items: center; gap: 10px; }
                .cart-mini-icon { font-size: 1.2rem; }
                .cart-mini-count { font-weight: 700; font-size: 0.9rem; color: #333; }
                .cart-mini-total { display: flex; align-items: center; gap: 15px; font-weight: 800; color: var(--primary-red); }
                .btn-view-cart { 
                    background: #333; color: white; border: none; padding: 8px 16px; 
                    border-radius: 20px; font-size: 0.8rem; font-weight: 700; cursor: pointer;
                }

                .cart-expanded-view { display: flex; flex-direction: column; max-height: 80vh; }
                .cart-header {
                    padding: 20px 25px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    border-bottom: 1px solid #f8f8f8;
                }
                .cart-title-area h3 { margin: 0; font-size: 1.1rem; font-weight: 800; }
                .minimize-cart-btn { background: none; border: none; font-size: 0.8rem; color: #ccc; cursor: pointer; transition: 0.2s; }
                .minimize-cart-btn:hover { color: #333; }
                
                .cart-items-list {
                    padding: 15px 25px;
                    max-height: 200px;
                    overflow-y: auto;
                }
                .cart-items-list::-webkit-scrollbar { width: 4px; }
                .cart-items-list::-webkit-scrollbar-thumb { background: #eee; border-radius: 10px; }
                .cart-item-row { padding: 10px 0; border-bottom: 1px solid #fcfcfc; }
                .cart-item-main { display: flex; justify-content: space-between; align-items: center; font-size: 0.9rem; }
                .cart-item-name { font-weight: 600; color: #555; }
                .cart-item-right { display: flex; align-items: center; gap: 12px; }
                .cart-item-price { font-weight: 700; color: #333; }
                .remove-item-btn { 
                    background: #fff1f1; color: #ff6b6b; border: none; width: 22px; height: 22px; 
                    border-radius: 50%; font-size: 0.7rem; cursor: pointer; display: flex; 
                    align-items: center; justify-content: center; transition: 0.2s;
                }
                .remove-item-btn:hover { background: #ff6b6b; color: white; }

                .cart-footer {
                    padding: 20px 25px;
                    background: #fafafa;
                    border-top: 1px solid #f0f0f0;
                    border-bottom-left-radius: 24px;
                    border-bottom-right-radius: 24px;
                }
                .cart-total-row { display: flex; justify-content: space-between; margin-bottom: 15px; font-weight: 800; }
                .btn-checkout-premium { 
                    width: 100%; padding: 14px; border-radius: 12px; border: none; 
                    background: var(--primary-red); color: white; font-weight: 800; cursor: pointer;
                }

                @media (max-width: 768px) {
                    .floating-cart-bar { left: 20px; right: 20px; bottom: 20px; width: auto !important; }
                }
            `}} />
        </div>
    );
}
