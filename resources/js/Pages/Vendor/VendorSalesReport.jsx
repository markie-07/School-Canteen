import VendorLayout from '@/Layouts/VendorLayout';
import { Head } from '@inertiajs/react';
import React, { useState, useMemo } from 'react';

export default function VendorSalesReport() {
    const [timeframe, setTimeframe] = useState('Weekly');

    // Mock data for different timeframes
    const chartData = useMemo(() => {
        switch(timeframe) {
            case 'Daily':
                return [
                    { label: '6am', val: 30, amount: '₱1,200' },
                    { label: '9am', val: 75, amount: '₱4,500' },
                    { label: '12pm', val: 95, amount: '₱8,200' },
                    { label: '3pm', val: 60, amount: '₱3,100' },
                    { label: '6pm', val: 40, amount: '₱1,800' },
                ];
            case 'Weekly':
                return [
                    { label: 'Mon', val: 60, amount: '₱12,400' },
                    { label: 'Tue', val: 45, amount: '₱10,200' },
                    { label: 'Wed', val: 85, amount: '₱18,500' },
                    { label: 'Thu', val: 70, amount: '₱14,100' },
                    { label: 'Fri', val: 95, amount: '₱22,000' },
                    { label: 'Sat', val: 40, amount: '₱8,500' },
                    { label: 'Sun', val: 30, amount: '₱5,200' },
                ];
            case 'Monthly':
                return [
                    { label: 'Jan', val: 65, amount: '₱85,000' },
                    { label: 'Feb', val: 55, amount: '₱72,000' },
                    { label: 'Mar', val: 80, amount: '₱110,000' },
                    { label: 'Apr', val: 90, amount: '₱125,000' },
                    { label: 'May', val: 75, amount: '₱98,000' },
                ];
            case 'Yearly':
                return [
                    { label: '2021', val: 50, amount: '₱850k' },
                    { label: '2022', val: 70, amount: '₱1.2M' },
                    { label: '2023', val: 85, amount: '₱1.5M' },
                    { label: '2024', val: 95, amount: '₱1.8M' },
                ];
            default: return [];
        }
    }, [timeframe]);

    const topItems = [
        { name: 'Beef Burger', sold: 450, revenue: '₱38,250' },
        { name: 'Chicken Sandwich', sold: 320, revenue: '₱24,000' },
        { name: 'Iced Tea', sold: 280, revenue: '₱7,000' },
        { name: 'French Fries', sold: 210, revenue: '₱7,350' },
    ];

    return (
        <VendorLayout header={<h2>Sales & Revenue Reports</h2>}>
            <Head title="Vendor Sales Report" />
            
            <div className="reports-container">
                <div className="reports-header-actions">
                    <div className="timeframe-selector">
                        {['Daily', 'Weekly', 'Monthly', 'Yearly'].map(t => (
                            <button 
                                key={t} 
                                className={`time-btn ${timeframe === t ? 'active' : ''}`}
                                onClick={() => setTimeframe(t)}
                            >
                                {t}
                            </button>
                        ))}
                    </div>
                    <button className="btn-export">📥 Export Report</button>
                </div>

                <div className="metrics-grid">
                    <div className="metric-card">
                        <span className="m-label">Total Revenue</span>
                        <span className="m-value">₱124,500.00</span>
                        <span className="m-trend positive">↑ 12% vs last {timeframe}</span>
                    </div>
                    <div className="metric-card">
                        <span className="m-label">Orders Completed</span>
                        <span className="m-value">1,452</span>
                        <span className="m-trend positive">↑ 5% vs last {timeframe}</span>
                    </div>
                    <div className="metric-card">
                        <span className="m-label">Average Order Value</span>
                        <span className="m-value">₱85.75</span>
                        <span className="m-trend negative">↓ 2% vs last {timeframe}</span>
                    </div>
                </div>

                <div className="reports-main-grid">
                    <div className="chart-placeholder-card">
                        <div className="card-header">
                            <h3>Revenue Overview ({timeframe})</h3>
                        </div>
                        <div className="visualizer">
                            <div className="bar-chart">
                                {chartData.map((data, i) => (
                                    <div key={i} className="bar-wrapper">
                                        <div className="bar" style={{ height: `${data.val}%` }}>
                                            <span className="bar-tooltip">{data.amount}</span>
                                        </div>
                                        <span className="bar-label">{data.label}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="top-products-card">
                        <div className="card-header">
                            <h3>Top Selling Items</h3>
                        </div>
                        <div className="product-list">
                            {topItems.map((item, index) => (
                                <div key={index} className="product-item">
                                    <div className="p-info">
                                        <span className="p-rank">{index + 1}</span>
                                        <span className="p-name">{item.name}</span>
                                    </div>
                                    <div className="p-stats">
                                        <span className="p-sold">{item.sold} sold</span>
                                        <span className="p-rev">{item.revenue}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <style dangerouslySetInnerHTML={{ __html: `
                .reports-container { display: flex; flex-direction: column; gap: 30px; }
                
                .reports-header-actions { display: flex; justify-content: space-between; align-items: center; }
                .timeframe-selector { display: flex; background: #eee; padding: 5px; border-radius: 12px; gap: 5px; }
                .time-btn { border: none; padding: 8px 20px; border-radius: 8px; font-weight: 700; font-size: 0.85rem; cursor: pointer; background: none; color: #666; transition: all 0.2s; }
                .time-btn.active { background: white; color: #333; box-shadow: 0 2px 8px rgba(0,0,0,0.05); }
                .btn-export { background: #333; color: white; border: none; padding: 10px 20px; border-radius: 10px; font-weight: 700; cursor: pointer; }

                .metrics-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; }
                .metric-card { background: white; padding: 25px; border-radius: 20px; box-shadow: 0 4px 15px rgba(0,0,0,0.02); display: flex; flex-direction: column; gap: 8px; }
                .m-label { color: #999; font-size: 0.85rem; font-weight: 600; text-transform: uppercase; }
                .m-value { font-size: 1.8rem; font-weight: 800; color: #333; }
                .m-trend { font-size: 0.75rem; font-weight: 700; padding: 4px 8px; border-radius: 6px; width: fit-content; }
                .m-trend.positive { background: #e9f9ef; color: #28c76f; }
                .m-trend.negative { background: #fff5f5; color: #ff4d4f; }

                .reports-main-grid { display: grid; grid-template-columns: 1.5fr 1fr; gap: 25px; }
                .chart-placeholder-card, .top-products-card { background: white; padding: 25px; border-radius: 20px; box-shadow: 0 4px 15px rgba(0,0,0,0.02); }
                .card-header h3 { font-weight: 800; color: #333; margin-bottom: 25px; font-size: 1.1rem; }
                
                .visualizer { height: 250px; display: flex; align-items: flex-end; padding-top: 20px; }
                .bar-chart { width: 100%; height: 100%; display: flex; justify-content: space-around; align-items: flex-end; gap: 10px; }
                .bar-wrapper { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 10px; height: 100%; justify-content: flex-end; }
                .bar { width: 100%; background: linear-gradient(to top, var(--primary-emerald), #2ecc71); border-radius: 6px 6px 0 0; position: relative; cursor: pointer; transition: all 0.3s ease-out; }
                .bar:hover { filter: brightness(1.1); transform: scaleX(1.05); }
                .bar-tooltip { position: absolute; top: -30px; left: 50%; transform: translateX(-50%); background: #333; color: white; padding: 4px 8px; border-radius: 6px; font-size: 0.7rem; opacity: 0; transition: opacity 0.2s; white-space: nowrap; pointer-events: none; }
                .bar:hover .bar-tooltip { opacity: 1; }
                .bar-label { font-size: 0.75rem; color: #bbb; font-weight: 700; }

                .product-list { display: flex; flex-direction: column; gap: 15px; }
                .product-item { display: flex; justify-content: space-between; align-items: center; padding: 15px; background: #fcfcfc; border-radius: 15px; border: 1px solid #f8f8f8; }
                .p-info { display: flex; align-items: center; gap: 15px; }
                .p-rank { font-weight: 800; color: #ddd; font-size: 1.2rem; }
                .p-name { font-weight: 700; color: #333; }
                .p-stats { text-align: right; }
                .p-sold { display: block; font-size: 0.75rem; color: #999; font-weight: 600; }
                .p-rev { font-weight: 800; color: var(--primary-emerald); font-size: 0.95rem; }

                @media (max-width: 992px) {
                    .reports-main-grid { grid-template-columns: 1fr; }
                }
            `}} />
        </VendorLayout>
    );
}
