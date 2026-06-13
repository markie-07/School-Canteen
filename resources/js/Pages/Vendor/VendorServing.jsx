import VendorLayout from '@/Layouts/VendorLayout';
import { Head, router } from '@inertiajs/react';
import React from 'react';
import { VendorOrderItemsList } from '@/Utils/orderHelper';

export default function VendorServing({ orders }) {
    const completeService = (id) => {
        router.patch(route('vendor.orders.update-status', id), {
            status: 'served',
            current_status: 'serving'
        });
    };

    return (
        <VendorLayout header={<h2>Serving Orders</h2>}>
            <Head title="Serving Orders" />
            
            <div className="orders-grid">
                {orders.length > 0 ? orders.map(order => (
                    <div key={order.id} className="order-card serving">
                        <div className="order-card-header">
                            <span className="order-id">#{order.order_number}</span>
                            <span className="status-tag ready">Ready to Serve</span>
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
                            <button onClick={() => completeService(order.id)} className="btn-serve">Mark as Served</button>
                        </div>
                    </div>
                )) : (
                    <div className="empty-state">
                        <p>No orders ready for serving. 🍽️</p>
                    </div>
                )}
            </div>

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
                    border-left: 5px solid #28c76f;
                }
                .order-card-header {
                    display: flex;
                    justify-content: space-between;
                    margin-bottom: 15px;
                }
                .order-id { font-weight: 800; color: #28c76f; }
                .status-tag.ready { font-size: 0.7rem; background: #e9f9ef; color: #28c76f; padding: 4px 10px; border-radius: 20px; font-weight: 700; }
                .customer-name { font-weight: 750; color: #1a1a1a; margin-bottom: 0; }
                .customer-info-section {
                    margin-bottom: 12px;
                    background: #f8f9fa;
                    padding: 10px 14px;
                    border-radius: 10px;
                    border-left: 3px solid #28c76f;
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
                .order-items { font-size: 0.9rem; color: #666; margin-bottom: 5px; }
                .order-total { font-weight: 800; font-size: 1.1rem; color: #333; margin-bottom: 15px; }
                .btn-serve {
                    width: 100%;
                    padding: 12px;
                    background: #28c76f;
                    color: white;
                    border: none;
                    border-radius: 10px;
                    font-weight: 700;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                .btn-serve:hover { filter: brightness(1.1); transform: scale(1.02); }
                .empty-state {
                    grid-column: 1 / -1;
                    text-align: center;
                    padding: 50px;
                    background: white;
                    border-radius: 20px;
                    color: #999;
                }
            `}} />
        </VendorLayout>
    );
}
