import VendorLayout from '@/Layouts/VendorLayout';
import { Head } from '@inertiajs/react';
import React, { useState } from 'react';
import { format } from 'date-fns';
import { VendorOrderItemsList } from '@/Utils/orderHelper';

export default function VendorCustomer({ customers, orderHistory }) {
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    const filteredCustomers = customers.filter(c => 
        c.customer_name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const customerOrders = selectedCustomer 
        ? orderHistory.filter(o => o.customer_name === selectedCustomer.customer_name)
        : [];

    return (
        <VendorLayout header={<h2>Customer Directory</h2>}>
            <Head title="Vendor Customers" />

            <div className="customer-module">
                <div className="customer-sidebar">
                    <div className="search-bar">
                        <input 
                            type="text" 
                            placeholder="Search customers..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    
                    <div className="customer-list">
                        {filteredCustomers.length > 0 ? filteredCustomers.map((customer, idx) => (
                            <div 
                                key={idx} 
                                className={`customer-item ${selectedCustomer?.customer_name === customer.customer_name ? 'active' : ''}`}
                                onClick={() => setSelectedCustomer(customer)}
                            >
                                <div className="customer-avatar">
                                    {customer.customer_name.charAt(0).toUpperCase()}
                                </div>
                                <div className="customer-info">
                                    <p className="name">{customer.customer_name}</p>
                                    <p className="stats">{customer.total_orders} orders · ₱{parseFloat(customer.total_spent).toLocaleString()}</p>
                                </div>
                            </div>
                        )) : (
                            <div className="no-results">No customers found.</div>
                        )}
                    </div>
                </div>

                <div className="customer-details">
                    {selectedCustomer ? (
                        <div className="details-content">
                            <div className="details-header">
                                <div className="header-main">
                                    <div className="large-avatar">
                                        {selectedCustomer.customer_name.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <h1>{selectedCustomer.customer_name}</h1>
                                        <p className="member-since">Last Purchase: {format(new Date(selectedCustomer.last_purchase), 'MMM dd, yyyy')}</p>
                                    </div>
                                </div>
                                <div className="header-stats">
                                    <div className="stat-box">
                                        <span className="label">Total Spent</span>
                                        <span className="value">₱{parseFloat(selectedCustomer.total_spent).toLocaleString()}</span>
                                    </div>
                                    <div className="stat-box">
                                        <span className="label">Total Orders</span>
                                        <span className="value">{selectedCustomer.total_orders}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="order-history-section">
                                <h3>Order History</h3>
                                <div className="history-table-container">
                                    <table className="history-table">
                                        <thead>
                                            <tr>
                                                <th>Order #</th>
                                                <th>Date</th>
                                                <th>Items</th>
                                                <th>Total</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {customerOrders.map(order => {
                                                const dateObj = new Date(order.created_at);
                                                const dateStr = format(dateObj, 'MMM dd, yyyy');
                                                const timeStr = format(dateObj, 'hh:mm a');
                                                return (
                                                    <tr key={order.id}>
                                                        <td className="order-num">
                                                            <span className="order-number-badge">#{order.order_number}</span>
                                                        </td>
                                                        <td className="order-date">
                                                            <div className="date-primary">{dateStr}</div>
                                                            <div className="date-secondary">{timeStr}</div>
                                                        </td>
                                                        <td className="order-items-list">
                                                            <VendorOrderItemsList itemsString={order.items} compact={true} />
                                                        </td>
                                                        <td className="order-price">
                                                            <span className="amount-tag">₱{parseFloat(order.total_price).toLocaleString()}</span>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="placeholder-state">
                            <div className="placeholder-icon">👤</div>
                            <h2>Select a customer to view their order history</h2>
                            <p>Browse through your regular customers and their purchase patterns.</p>
                        </div>
                    )}
                </div>
            </div>

            <style dangerouslySetInnerHTML={{ __html: `
                .customer-module {
                    display: grid;
                    grid-template-columns: 350px 1fr;
                    gap: 0;
                    background: white;
                    border-radius: 20px;
                    overflow: hidden;
                    height: calc(100vh - 180px);
                    box-shadow: 0 10px 30px rgba(0,0,0,0.08);
                    border: 1px solid rgba(0,0,0,0.05);
                }

                .customer-sidebar {
                    border-right: 1px solid #f0f0f0;
                    display: flex;
                    flex-direction: column;
                    background: #fcfcfc;
                }

                .search-bar {
                    padding: 20px;
                    border-bottom: 1px solid #f0f0f0;
                }

                .search-bar input {
                    width: 100%;
                    padding: 12px 15px;
                    border-radius: 12px;
                    border: 1px solid #eee;
                    background: white;
                    outline: none;
                    transition: all 0.2s;
                }

                .search-bar input:focus {
                    border-color: var(--primary-red);
                    box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.1);
                }

                .customer-list {
                    flex: 1;
                    overflow-y: auto;
                }

                .customer-item {
                    display: flex;
                    align-items: center;
                    padding: 15px 20px;
                    cursor: pointer;
                    transition: all 0.2s;
                    border-bottom: 1px solid #f9f9f9;
                }

                .customer-item:hover {
                    background: #f0f0f0;
                }

                .customer-item.active {
                    background: #fff;
                    border-left: 4px solid var(--primary-red);
                    box-shadow: inset 5px 0 10px rgba(0,0,0,0.02);
                }

                .customer-avatar {
                    width: 45px;
                    height: 45px;
                    border-radius: 12px;
                    background: linear-gradient(135deg, var(--primary-red), #ff6b6b);
                    color: white;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: 800;
                    margin-right: 15px;
                    font-size: 1.2rem;
                }

                .customer-info .name {
                    font-weight: 700;
                    margin: 0;
                    color: #333;
                }

                .customer-info .stats {
                    font-size: 0.8rem;
                    color: #888;
                    margin: 2px 0 0;
                }

                .customer-details {
                    flex: 1;
                    background: white;
                    overflow-y: auto;
                }

                .placeholder-state {
                    height: 100%;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    color: #aaa;
                    text-align: center;
                    padding: 40px;
                }

                .placeholder-icon {
                    font-size: 4rem;
                    margin-bottom: 20px;
                    opacity: 0.2;
                }

                .details-content {
                    padding: 40px;
                }

                .details-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    margin-bottom: 40px;
                    padding-bottom: 30px;
                    border-bottom: 1px solid #f0f0f0;
                }

                .header-main {
                    display: flex;
                    align-items: center;
                    gap: 25px;
                }

                .large-avatar {
                    width: 80px;
                    height: 80px;
                    border-radius: 20px;
                    background: #f8f9fa;
                    color: var(--primary-red);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: 800;
                    font-size: 2.5rem;
                    box-shadow: 0 4px 10px rgba(0,0,0,0.05);
                }

                .header-main h1 {
                    margin: 0;
                    font-size: 2rem;
                    color: #333;
                }

                .member-since {
                    color: #999;
                    margin-top: 5px;
                }

                .header-stats {
                    display: flex;
                    gap: 20px;
                }

                .stat-box {
                    background: #f8f9fa;
                    padding: 15px 25px;
                    border-radius: 15px;
                    text-align: center;
                    min-width: 120px;
                }

                .stat-box .label {
                    display: block;
                    font-size: 0.75rem;
                    color: #888;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                    margin-bottom: 5px;
                }

                .stat-box .value {
                    font-size: 1.2rem;
                    font-weight: 800;
                    color: #333;
                }

                .order-history-section h3 {
                    margin-bottom: 20px;
                    font-size: 1.2rem;
                    color: #444;
                }

                 .history-table-container {
                    background: #fff;
                    border-radius: 12px;
                    overflow: hidden;
                    border: 1px solid #e2e8f0;
                }

                .history-table {
                    width: 100%;
                    border-collapse: collapse;
                }

                .history-table th {
                    background: #f8fafc;
                    text-align: left;
                    padding: 16px 20px;
                    font-size: 0.78rem;
                    color: #64748b;
                    font-weight: 800;
                    text-transform: uppercase;
                    letter-spacing: 0.8px;
                    border-bottom: 2px solid #f1f5f9;
                }

                .history-table td {
                    padding: 18px 20px;
                    border-bottom: 1px solid #f1f5f9;
                    color: #1e293b;
                    font-size: 0.9rem;
                    vertical-align: middle;
                }

                .history-table tr {
                    transition: background 0.2s ease-in-out;
                }

                .history-table tr:hover {
                    background: #fafafc;
                }

                .order-num {
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

                .order-date {
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

                .order-items-list {
                    max-width: 320px;
                    min-width: 250px;
                }

                .order-price {
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

                @media (max-width: 1024px) {
                    .customer-module {
                        grid-template-columns: 1fr;
                        height: auto;
                    }
                    .customer-sidebar {
                        height: 400px;
                        border-right: none;
                        border-bottom: 1px solid #f0f0f0;
                    }
                }
            `}} />
        </VendorLayout>
    );
}
