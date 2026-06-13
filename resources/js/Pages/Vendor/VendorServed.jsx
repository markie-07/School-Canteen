import VendorLayout from '@/Layouts/VendorLayout';
import { Head } from '@inertiajs/react';
import React from 'react';
import { VendorOrderItemsList } from '@/Utils/orderHelper';

export default function VendorServed({ orders }) {
    
    // Split date & time cleanly for premium presentation
    const formatDate = (dateString) => {
        try {
            const d = new Date(dateString);
            const datePart = d.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
            const timePart = d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
            return { datePart, timePart };
        } catch (e) {
            return { datePart: dateString, timePart: '' };
        }
    };

    return (
        <VendorLayout header={
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '1.6rem' }}>📜</span>
                <h2 style={{ margin: 0, fontWeight: '800', color: '#1e293b' }}>Served Orders History</h2>
            </div>
        }>
            <Head title="Served Orders" />
            
            <div className="history-container">
                <div className="history-header-bar">
                    <div className="header-badge-count">
                        <span className="count-dot"></span>
                        {orders.length} Completed Orders
                    </div>
                </div>

                <div className="table-wrapper">
                    <table className="history-table">
                        <thead>
                            <tr>
                                <th style={{ width: '160px' }}>Order ID</th>
                                <th>Customer</th>
                                <th>Items</th>
                                <th style={{ width: '160px' }}>Date & Time</th>
                                <th style={{ width: '120px' }}>Amount</th>
                                <th style={{ width: '120px' }}>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orders.map(order => {
                                const { datePart, timePart } = formatDate(order.updated_at);
                                return (
                                    <tr key={order.id}>
                                        <td className="id-cell">
                                            <span className="order-number-badge">
                                                #{order.order_number}
                                            </span>
                                        </td>
                                        <td className="user-cell">
                                            <div className="customer-name-wrapper">{order.user?.name || order.customer_name}</div>
                                            {order.user && (
                                                <div className="customer-meta-row">
                                                    <span className="customer-badge id">
                                                        <span className="icon">🆔</span> {order.user.id_number || 'N/A'}
                                                    </span>
                                                    <span className="customer-badge phone">
                                                        <span className="icon">📞</span> {order.user.phone || 'N/A'}
                                                    </span>
                                                </div>
                                            )}
                                        </td>
                                        <td className="items-cell">
                                            <VendorOrderItemsList itemsString={order.items} compact={true} />
                                        </td>
                                        <td className="date-cell">
                                            <div className="date-primary">{datePart}</div>
                                            <div className="date-secondary">{timePart}</div>
                                        </td>
                                        <td className="amount-cell">
                                            <span className="amount-tag">
                                                ₱{parseFloat(order.total_price).toLocaleString()}
                                            </span>
                                        </td>
                                        <td>
                                            <span className="status-pill">
                                                <span className="pulse-green-dot"></span>
                                                Completed
                                            </span>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            <style dangerouslySetInnerHTML={{ __html: `
                .history-container {
                    background: rgba(255, 255, 255, 0.95);
                    border-radius: 20px;
                    padding: 24px;
                    box-shadow: 0 10px 30px rgba(0,0,0,0.03);
                    border: 1px solid rgba(255, 255, 255, 0.8);
                    backdrop-filter: blur(12px);
                }
                .history-header-bar {
                    margin-bottom: 20px;
                    display: flex;
                    justify-content: flex-start;
                    align-items: center;
                }
                .header-badge-count {
                    font-size: 0.8rem;
                    background: #f1f5f9;
                    color: #475569;
                    padding: 6px 14px;
                    border-radius: 12px;
                    font-weight: 750;
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                    border: 1px solid #e2e8f0;
                }
                .count-dot {
                    width: 6px;
                    height: 6px;
                    background: #28c76f;
                    border-radius: 50%;
                }
                .table-wrapper {
                    overflow-x: auto;
                    border-radius: 12px;
                    border: 1px solid #e2e8f0;
                    background: #fff;
                }
                .history-table {
                    width: 100%;
                    border-collapse: collapse;
                    text-align: left;
                }
                .history-table th {
                    padding: 16px 20px;
                    border-bottom: 2px solid #f1f5f9;
                    background: #f8fafc;
                    color: #64748b;
                    font-size: 0.78rem;
                    text-transform: uppercase;
                    letter-spacing: 0.8px;
                    font-weight: 800;
                }
                .history-table td {
                    padding: 18px 20px;
                    border-bottom: 1px solid #f1f5f9;
                    color: #1e293b;
                    font-size: 0.9rem;
                    vertical-align: middle;
                }
                .history-table tr {
                    transition: all 0.2s ease-in-out;
                }
                .history-table tr:hover {
                    background: #fafafc;
                }
                
                /* Order ID Badge styling */
                .id-cell {
                    white-space: nowrap;
                }
                .order-number-badge {
                    font-family: SFMono-Regular, Consolas, Monaco, monospace;
                    background: #f1f5f9;
                    color: #475569;
                    border: 1px solid #e2e8f0;
                    padding: 6px 10px;
                    border-radius: 8px;
                    font-size: 0.78rem;
                    font-weight: 700;
                    display: inline-block;
                    letter-spacing: -0.2px;
                }

                .user-cell {
                    min-width: 200px;
                }
                .customer-name-wrapper {
                    font-weight: 750;
                    color: #0f172a;
                    font-size: 0.94rem;
                }
                .customer-meta-row {
                    display: flex;
                    gap: 6px;
                    margin-top: 6px;
                }
                .customer-badge {
                    font-size: 0.7rem;
                    padding: 3px 8px;
                    border-radius: 6px;
                    font-weight: 750;
                    display: inline-flex;
                    align-items: center;
                    gap: 4px;
                    border: 1px solid transparent;
                }
                .customer-badge.id {
                    background: #eef2ff;
                    color: #4f46e5;
                    border-color: #e0e7ff;
                }
                .customer-badge.phone {
                    background: #ecfdf5;
                    color: #059669;
                    border-color: #d1fae5;
                }
                
                /* Items column styling */
                .items-cell {
                    max-width: 320px;
                    min-width: 250px;
                }

                /* Date-time separation styling */
                .date-cell {
                    white-space: nowrap;
                }
                .date-primary {
                    font-weight: 700;
                    color: #334155;
                    font-size: 0.88rem;
                }
                .date-secondary {
                    color: #64748b;
                    font-size: 0.74rem;
                    margin-top: 2px;
                    font-weight: 600;
                }

                /* Amount pill styling */
                .amount-cell {
                    font-weight: 800;
                    font-size: 1.05rem;
                }
                .amount-tag {
                    color: #0f172a;
                    background: #f8fafc;
                    padding: 6px 12px;
                    border-radius: 8px;
                    border: 1px solid #e2e8f0;
                    display: inline-block;
                }

                /* Completed green status pill with pulsing indicator dot */
                .status-pill {
                    background: #d1fae5;
                    color: #065f46;
                    border: 1px solid #a7f3d0;
                    padding: 6px 14px;
                    border-radius: 20px;
                    font-size: 0.78rem;
                    font-weight: 800;
                    display: inline-flex;
                    align-items: center;
                    gap: 6px;
                    box-shadow: 0 2px 4px rgba(4, 120, 87, 0.05);
                }
                .pulse-green-dot {
                    width: 6px;
                    height: 6px;
                    background: #10b981;
                    border-radius: 50%;
                    display: inline-block;
                    animation: pulse-dot 2s infinite;
                }
                @keyframes pulse-dot {
                    0% {
                        transform: scale(0.9);
                        box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7);
                    }
                    70% {
                        transform: scale(1);
                        box-shadow: 0 0 0 4px rgba(16, 185, 129, 0);
                    }
                    100% {
                        transform: scale(0.9);
                        box-shadow: 0 0 0 0 rgba(16, 185, 129, 0);
                    }
                }
            `}} />
        </VendorLayout>
    );
}
