import VendorLayout from '@/Layouts/VendorLayout';
import { Head, Link, router } from '@inertiajs/react';
import React, { useState } from 'react';

export default function VendorDashboard({ 
    auth, 
    metrics, 
    salesTrend, 
    peakHours, 
    orderDistribution, 
    topItems, 
    nextOrders, 
    recentActivity 
}) {
    const [timeframe, setTimeframe] = useState('Weekly');
    const [hoveredPoint, setHoveredPoint] = useState(null);
    const [hoveredDonutSegment, setHoveredDonutSegment] = useState(null);

    // Dynamic state calculations or filters based on timeframe tab
    const displayMetrics = {
        todayRevenue: timeframe === 'Daily' ? metrics.todayRevenue : metrics.todayRevenue * 5.8,
        itemsServedCount: timeframe === 'Daily' ? metrics.itemsServedCount : Math.round(metrics.itemsServedCount * 6.2),
        completionRate: metrics.completionRate,
        averageOrderValue: metrics.averageOrderValue,
    };

    // Calculate SVG Area Chart Path
    const maxAmount = salesTrend && salesTrend.length > 0 ? Math.max(...salesTrend.map(d => d.amount), 500) : 1000;
    const chartHeight = 140;
    const chartWidth = 520;
    const points = salesTrend ? salesTrend.map((d, i) => {
        const x = (i * (chartWidth - 60) / 6) + 30;
        const y = chartHeight - (d.amount / maxAmount) * (chartHeight - 40) - 10;
        return { x, y, label: d.label, amount: d.amount };
    }) : [];

    const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
    const areaPath = points.length > 0 
        ? `${linePath} L ${points[points.length - 1].x} ${chartHeight} L ${points[0].x} ${chartHeight} Z`
        : '';

    // Calculate Donut Segments
    const dist = orderDistribution || { pending: 0, preparing: 0, serving: 0, served: 100, counts: { pending: 0, preparing: 0, serving: 0, served: 0 } };
    const totalVal = (dist.counts.pending + dist.counts.preparing + dist.counts.serving + dist.counts.served) || 1;
    const segments = [
        { label: 'Pending', count: dist.counts.pending, percent: dist.pending, color: '#ff9f43', hoverColor: '#ffa852' },
        { label: 'Preparing', count: dist.counts.preparing, percent: dist.preparing, color: '#7367f0', hoverColor: '#8075f2' },
        { label: 'Serving', count: dist.counts.serving, percent: dist.serving, color: '#00cfe8', hoverColor: '#1ad4ec' },
        { label: 'Served', count: dist.counts.served, percent: dist.served, color: '#28c76f', hoverColor: '#3cd27f' },
    ].filter(s => s.count > 0);

    let accumulatedCircumference = 0;
    const r = 40;
    const circ = 2 * Math.PI * r; // ~251.2
    const segmentData = segments.map(seg => {
        const share = seg.count / totalVal;
        const strokeLength = share * circ;
        const strokeOffset = circ - accumulatedCircumference;
        accumulatedCircumference += strokeLength;
        return { ...seg, strokeLength, strokeOffset };
    });

    const handleStartOrder = (orderId) => {
        router.patch(`/vendor/orders/${orderId}/status`, {
            status: 'preparing',
            current_status: 'pending'
        });
    };

    return (
        <VendorLayout header={
            <div className="dashboard-header-flex">
                <h2>Canteen Analytics & Statistics</h2>
                <div className="timeframe-selector">
                    {['Daily', 'Weekly', 'Monthly'].map(t => (
                        <button 
                            key={t} 
                            className={`time-btn ${timeframe === t ? 'active' : ''}`}
                            onClick={() => setTimeframe(t)}
                        >
                            {t}
                        </button>
                    ))}
                </div>
            </div>
        }>
            <Head title="Vendor Analytics" />

            <div className="stats-dashboard-container">
                {/* 1. Dynamic Metric Cards */}
                <div className="metrics-grid">
                    <div className="stat-card metric-item glassmorphism">
                        <div className="card-top">
                            <span className="card-icon">💰</span>
                            <span className="trend-badge positive">↑ 14.2%</span>
                        </div>
                        <div className="card-details">
                            <span className="card-label">{timeframe} Revenue</span>
                            <span className="card-value">₱{displayMetrics.todayRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                        </div>
                    </div>

                    <div className="stat-card metric-item glassmorphism">
                        <div className="card-top">
                            <span className="card-icon">🍽️</span>
                            <span className="trend-badge positive">↑ 8.3%</span>
                        </div>
                        <div className="card-details">
                            <span className="card-label">Orders Completed</span>
                            <span className="card-value">{displayMetrics.itemsServedCount}</span>
                        </div>
                    </div>

                    <div className="stat-card metric-item glassmorphism">
                        <div className="card-top">
                            <span className="card-icon">⚡</span>
                            <span className="trend-badge neutral">AOV</span>
                        </div>
                        <div className="card-details">
                            <span className="card-label">Avg. Order Value</span>
                            <span className="card-value">₱{displayMetrics.averageOrderValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                        </div>
                    </div>

                    <div className="stat-card metric-item glassmorphism">
                        <div className="card-top">
                            <span className="card-icon">📈</span>
                            <span className="trend-badge positive">↑ 1.2%</span>
                        </div>
                        <div className="card-details">
                            <span className="card-label">Order Completion Rate</span>
                            <span className="card-value">{displayMetrics.completionRate}%</span>
                        </div>
                    </div>
                </div>

                {/* 2. Visual Analytics Main Row */}
                <div className="analytics-main-row">
                    {/* Interactive Sales Curve Area Chart */}
                    <div className="chart-card sales-trend-card glassmorphism">
                        <div className="chart-header-row">
                            <h3>Sales Trend ({timeframe})</h3>
                            <span className="chart-sub">Daily revenue mapping (last 7 days)</span>
                        </div>
                        <div className="svg-container">
                            <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="svg-element">
                                <defs>
                                    <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#28c76f" stopOpacity="0.45" />
                                        <stop offset="100%" stopColor="#28c76f" stopOpacity="0.00" />
                                    </linearGradient>
                                    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                                        <feGaussianBlur stdDeviation="3" result="blur" />
                                        <feComposite in="SourceGraphic" in2="blur" operator="over" />
                                    </filter>
                                </defs>

                                {/* dashed horizontal grids */}
                                <line x1="30" y1="30" x2={chartWidth - 30} y2="30" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="4 4" />
                                <line x1="30" y1="75" x2={chartWidth - 30} y2="75" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="4 4" />
                                <line x1="30" y1="120" x2={chartWidth - 30} y2="120" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="4 4" />

                                {/* Area Fill */}
                                {areaPath && <path d={areaPath} fill="url(#salesGradient)" />}

                                {/* Line Path */}
                                {linePath && <path d={linePath} fill="none" stroke="#28c76f" strokeWidth="3" filter="url(#glow)" strokeLinecap="round" />}

                                {/* Coordinate nodes */}
                                {points.map((p, i) => (
                                    <circle
                                        key={i}
                                        cx={p.x}
                                        cy={p.y}
                                        r={hoveredPoint === i ? 6 : 4}
                                        fill={hoveredPoint === i ? "#fff" : "#28c76f"}
                                        stroke="#28c76f"
                                        strokeWidth="2"
                                        style={{ cursor: 'pointer', transition: 'all 0.15s ease-in-out' }}
                                        onMouseEnter={() => setHoveredPoint(i)}
                                        onMouseLeave={() => setHoveredPoint(null)}
                                    />
                                ))}

                                {/* Floating dynamic tooltip inside SVG */}
                                {hoveredPoint !== null && (
                                    <g transform={`translate(${points[hoveredPoint].x - 60}, ${points[hoveredPoint].y - 45})`}>
                                        <rect width="120" height="35" rx="6" fill="#1e293b" opacity="0.95" />
                                        <text x="60" y="16" fill="#fff" fontSize="10" fontWeight="700" textAnchor="middle">
                                            {points[hoveredPoint].label}: ₱{points[hoveredPoint].amount.toLocaleString()}
                                        </text>
                                        <text x="60" y="27" fill="#94a3b8" fontSize="8" fontWeight="600" textAnchor="middle">
                                            Revenue
                                        </text>
                                    </g>
                                )}
                            </svg>
                        </div>
                        {/* X-Axis labels row */}
                        <div className="chart-labels-row">
                            {salesTrend && salesTrend.map((d, i) => (
                                <span key={i} className="axis-label">{d.label}</span>
                            ))}
                        </div>
                    </div>

                    {/* Donut Distribution Chart */}
                    <div className="chart-card donut-card glassmorphism">
                        <div className="chart-header-row">
                            <h3>Order Ratios</h3>
                            <span className="chart-sub">Proportional active stages</span>
                        </div>
                        
                        <div className="donut-body">
                            <div className="donut-svg-wrapper">
                                <svg width="110" height="110" viewBox="0 0 120 120" style={{ transform: 'rotate(-90deg)' }}>
                                    <circle cx="60" cy="60" r="40" fill="transparent" stroke="#f8fafc" strokeWidth="10" />
                                    {segmentData.map((seg, idx) => (
                                        <circle
                                            key={idx}
                                            cx="60"
                                            cy="60"
                                            r="40"
                                            fill="transparent"
                                            stroke={seg.color}
                                            strokeWidth="10"
                                            strokeDasharray={`${seg.strokeLength} ${circ}`}
                                            strokeDashoffset={seg.strokeOffset}
                                            strokeLinecap="round"
                                            style={{ 
                                                transition: 'all 0.3s ease-in-out',
                                                cursor: 'pointer',
                                                filter: hoveredDonutSegment === idx ? 'brightness(1.15) drop-shadow(0 2px 4px rgba(0,0,0,0.1))' : 'none'
                                            }}
                                            onMouseEnter={() => setHoveredDonutSegment(idx)}
                                            onMouseLeave={() => setHoveredDonutSegment(null)}
                                        />
                                    ))}
                                </svg>
                                <div className="donut-center-label">
                                    <span className="d-num">{totalVal}</span>
                                    <span className="d-lbl">Orders</span>
                                </div>
                            </div>

                            <div className="donut-legend">
                                {segments.map((seg, i) => (
                                    <div 
                                        key={i} 
                                        className={`legend-item ${hoveredDonutSegment === i ? 'highlighted' : ''}`}
                                        onMouseEnter={() => setHoveredDonutSegment(i)}
                                        onMouseLeave={() => setHoveredDonutSegment(null)}
                                    >
                                        <div className="legend-indicator" style={{ backgroundColor: seg.color }}></div>
                                        <span className="l-name">{seg.label}</span>
                                        <span className="l-count">{seg.count} ({seg.percent}%)</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* 3. Deep-Dive Statistics Section */}
                <div className="dashboard-deep-dive-grid">
                    {/* Vertical Peak Hours Graph */}
                    <div className="stat-card statistics-breakdown glassmorphism">
                        <div className="card-header">
                            <h3>Peak Dining Hours</h3>
                            <span className="chart-sub">Highest traffic periods by time of day</span>
                        </div>
                        <div className="peak-hours-visualizer">
                            {peakHours.map((hour, idx) => (
                                <div key={idx} className="peak-bar-wrapper">
                                    <div className="peak-bar-container">
                                        <div 
                                            className="peak-bar-fill"
                                            style={{ height: `${hour.val || 5}%` }}
                                        />
                                        <span className="bar-floating-tag">{hour.count} orders</span>
                                    </div>
                                    <span className="peak-bar-label">{hour.label.split(' ')[0]}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Popular Menu Items Breakdown */}
                    <div className="stat-card statistics-breakdown glassmorphism">
                        <div className="card-header">
                            <h3>Best-Selling Menu Items</h3>
                            <span className="chart-sub">Top ranked by quantity ordered</span>
                        </div>
                        <div className="popular-products-list">
                            {topItems.map((item, index) => {
                                const maxSold = Math.max(...topItems.map(t => t.sold), 1) || 1;
                                const barWidth = (item.sold / maxSold) * 100;
                                return (
                                    <div key={index} className="popular-item-card">
                                        <div className="pop-info">
                                            <div className="pop-rank-circle">#{item.rank}</div>
                                            <div className="pop-name-block">
                                                <span className="pop-name">{item.name}</span>
                                                <span className="pop-sold">{item.sold} items served</span>
                                            </div>
                                        </div>
                                        <div className="pop-graph-block">
                                            <div className="pop-progress-track">
                                                <div className="pop-progress-fill" style={{ width: `${barWidth}%`, background: `linear-gradient(90deg, var(--primary-emerald), #2ecc71)` }} />
                                            </div>
                                            <span className="pop-rev">{item.revenue}</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* 4. Active Prep Queue & Timelines */}
                <div className="active-prep-grid">
                    {/* Live Prepare Queue Quick Action */}
                    <div className="stat-card quick-prep-card glassmorphism">
                        <div className="card-header-flex">
                            <h3>Next to Prepare</h3>
                            <Link href="/vendor/orders/new" className="quick-link">Go to Queue →</Link>
                        </div>
                        
                        <div className="queue-list">
                            {nextOrders && nextOrders.length > 0 ? nextOrders.map((ord, idx) => (
                                <div key={idx} className="queue-row glassmorphism">
                                    <div className="queue-left">
                                        <span className="badge-ord-number">#{ord.order_number}</span>
                                        <span className="ord-customer">{ord.user?.name || ord.customer_name}</span>
                                        <span className="ord-items">{ord.items}</span>
                                    </div>
                                    <button className="btn-prep-quick" onClick={() => handleStartOrder(ord.id)}>
                                        🍳 Start
                                    </button>
                                </div>
                            )) : (
                                <div className="queue-empty-state">
                                    <span className="e-emoji">🎉</span>
                                    <p className="e-text">Prepare queue is completely clear!</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Timeline Log */}
                    <div className="stat-card timeline-card glassmorphism">
                        <div className="card-header">
                            <h3>Operational Log</h3>
                            <span className="chart-sub">Real-time status updates</span>
                        </div>
                        <div className="activity-timeline">
                            {recentActivity && recentActivity.length > 0 ? recentActivity.map((act, idx) => (
                                <div key={idx} className="timeline-item">
                                    <div className="timeline-bullet" style={{
                                        borderColor: act.type === 'serve' ? '#28c76f' : act.type === 'prepare' ? '#7367f0' : '#ff9f43'
                                    }}>
                                        {act.icon}
                                    </div>
                                    <div className="timeline-body">
                                        <span className="t-title">{act.title}</span>
                                        <span className="t-desc">{act.desc}</span>
                                        <span className="t-time">{act.time}</span>
                                    </div>
                                </div>
                            )) : (
                                <div className="timeline-empty">No updates logged recently.</div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <style dangerouslySetInnerHTML={{ __html: `
                .stats-dashboard-container {
                    display: flex;
                    flex-direction: column;
                    gap: 30px;
                    padding-bottom: 50px;
                }

                .dashboard-header-flex {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    width: 100%;
                }

                .timeframe-selector {
                    display: flex;
                    background: #f1f5f9;
                    padding: 4px;
                    border-radius: 12px;
                    gap: 4px;
                    border: 1px solid #e2e8f0;
                }

                .time-btn {
                    border: none;
                    padding: 6px 16px;
                    border-radius: 8px;
                    font-weight: 700;
                    font-size: 0.8rem;
                    cursor: pointer;
                    background: none;
                    color: #64748b;
                    transition: all 0.2s ease-in-out;
                }

                .time-btn.active {
                    background: white;
                    color: #0f172a;
                    box-shadow: 0 4px 10px rgba(0,0,0,0.06);
                }

                .glassmorphism {
                    background: rgba(255, 255, 255, 0.95);
                    border: 1.5px solid rgba(226, 232, 240, 0.8);
                    box-shadow: 0 4px 24px rgba(0, 0, 0, 0.02);
                    border-radius: 24px;
                    padding: 24px;
                    transition: transform 0.25s ease, box-shadow 0.25s ease;
                }

                .glassmorphism:hover {
                    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.04);
                }

                .metrics-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
                    gap: 20px;
                }

                .metric-item {
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                }

                .card-top {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }

                .card-icon {
                    width: 44px;
                    height: 44px;
                    background: #f8fafc;
                    border-radius: 12px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 1.25rem;
                    border: 1px solid #e2e8f0;
                }

                .trend-badge {
                    font-size: 0.7rem;
                    font-weight: 800;
                    padding: 4px 10px;
                    border-radius: 20px;
                    text-transform: uppercase;
                }

                .trend-badge.positive {
                    background: #e6fcf5;
                    color: #0ca678;
                }

                .trend-badge.neutral {
                    background: #f1f5f9;
                    color: #64748b;
                }

                .card-details {
                    display: flex;
                    flex-direction: column;
                    gap: 4px;
                }

                .card-label {
                    font-size: 0.78rem;
                    color: #64748b;
                    font-weight: 700;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }

                .card-value {
                    font-size: 1.6rem;
                    font-weight: 850;
                    color: #0f172a;
                    letter-spacing: -0.5px;
                }

                .analytics-main-row {
                    display: grid;
                    grid-template-columns: 1.6fr 1fr;
                    gap: 24px;
                }

                .chart-card {
                    display: flex;
                    flex-direction: column;
                }

                .chart-header-row {
                    display: flex;
                    flex-direction: column;
                    gap: 4px;
                    margin-bottom: 20px;
                }

                .chart-header-row h3 {
                    font-size: 1.05rem;
                    font-weight: 800;
                    color: #0f172a;
                    margin: 0;
                }

                .chart-sub {
                    font-size: 0.76rem;
                    color: #94a3b8;
                    font-weight: 600;
                }

                .svg-container {
                    flex: 1;
                    position: relative;
                }

                .svg-element {
                    width: 100%;
                    height: auto;
                    display: block;
                    overflow: visible;
                }

                .chart-labels-row {
                    display: flex;
                    justify-content: space-between;
                    padding: 10px 30px 0 30px;
                    border-top: 1px solid #f1f5f9;
                    margin-top: 10px;
                }

                .axis-label {
                    font-size: 0.72rem;
                    color: #94a3b8;
                    font-weight: 750;
                }

                .donut-body {
                    display: flex;
                    align-items: center;
                    gap: 20px;
                    flex: 1;
                }

                .donut-svg-wrapper {
                    position: relative;
                    width: 110px;
                    height: 110px;
                }

                .donut-center-label {
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    pointer-events: none;
                }

                .d-num {
                    font-size: 1.35rem;
                    font-weight: 850;
                    color: #0f172a;
                }

                .d-lbl {
                    font-size: 0.6rem;
                    color: #94a3b8;
                    text-transform: uppercase;
                    font-weight: 700;
                }

                .donut-legend {
                    display: flex;
                    flex-direction: column;
                    gap: 10px;
                    flex: 1;
                }

                .legend-item {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    padding: 4px 8px;
                    border-radius: 8px;
                    transition: background 0.15s ease;
                }

                .legend-item.highlighted {
                    background: #f8fafc;
                }

                .legend-indicator {
                    width: 8px;
                    height: 8px;
                    border-radius: 50%;
                }

                .l-name {
                    font-size: 0.78rem;
                    font-weight: 700;
                    color: #475569;
                    flex: 1;
                }

                .l-count {
                    font-size: 0.76rem;
                    font-weight: 800;
                    color: #0f172a;
                }

                .dashboard-deep-dive-grid {
                    display: grid;
                    grid-template-columns: 1fr 1.2fr;
                    gap: 24px;
                }

                .statistics-breakdown {
                    display: flex;
                    flex-direction: column;
                }

                .card-header {
                    margin-bottom: 20px;
                }

                .card-header h3 {
                    font-size: 1.05rem;
                    font-weight: 800;
                    color: #0f172a;
                    margin: 0 0 4px 0;
                }

                .peak-hours-visualizer {
                    display: flex;
                    justify-content: space-around;
                    align-items: flex-end;
                    height: 140px;
                    padding-bottom: 15px;
                }

                .peak-bar-wrapper {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    flex: 1;
                    gap: 10px;
                }

                .peak-bar-container {
                    position: relative;
                    width: 32px;
                    height: 100px;
                    background: #f8fafc;
                    border-radius: 8px;
                    display: flex;
                    align-items: flex-end;
                    overflow: visible;
                    border: 1px solid #f1f5f9;
                }

                .peak-bar-fill {
                    width: 100%;
                    background: linear-gradient(180deg, #ff8787 0%, #ff6b6b 100%);
                    border-radius: 6px 6px 0 0;
                    transition: height 0.6s cubic-bezier(0.16, 1, 0.3, 1);
                }

                .peak-bar-container:hover .bar-floating-tag {
                    opacity: 1;
                }

                .bar-floating-tag {
                    position: absolute;
                    top: -28px;
                    left: 50%;
                    transform: translateX(-50%);
                    background: #1e293b;
                    color: white;
                    font-size: 0.65rem;
                    padding: 3px 6px;
                    border-radius: 6px;
                    opacity: 0;
                    pointer-events: none;
                    transition: opacity 0.2s;
                    white-space: nowrap;
                    z-index: 10;
                }

                .peak-bar-label {
                    font-size: 0.7rem;
                    color: #94a3b8;
                    font-weight: 800;
                    text-align: center;
                }

                .popular-products-list {
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                }

                .popular-item-card {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                    padding: 12px 16px;
                    background: #f8fafc;
                    border-radius: 14px;
                    border: 1px solid #f1f5f9;
                }

                .pop-info {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }

                .pop-rank-circle {
                    width: 24px;
                    height: 24px;
                    border-radius: 50%;
                    background: #1e293b;
                    color: white;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 0.72rem;
                    font-weight: 800;
                }

                .pop-name-block {
                    display: flex;
                    flex-direction: column;
                }

                .pop-name {
                    font-size: 0.85rem;
                    font-weight: 800;
                    color: #1e293b;
                }

                .pop-sold {
                    font-size: 0.72rem;
                    color: #94a3b8;
                    font-weight: 600;
                }

                .pop-graph-block {
                    display: flex;
                    align-items: center;
                    gap: 16px;
                }

                .pop-progress-track {
                    flex: 1;
                    height: 6px;
                    background: #e2e8f0;
                    border-radius: 10px;
                    overflow: hidden;
                }

                .pop-progress-fill {
                    height: 100%;
                    border-radius: 10px;
                    transition: width 0.6s ease;
                }

                .pop-rev {
                    font-size: 0.82rem;
                    font-weight: 850;
                    color: #0ca678;
                }

                .active-prep-grid {
                    display: grid;
                    grid-template-columns: 1.3fr 1fr;
                    gap: 24px;
                }

                .card-header-flex {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 20px;
                }

                .card-header-flex h3 {
                    font-size: 1.05rem;
                    font-weight: 800;
                    color: #0f172a;
                    margin: 0;
                }

                .quick-link {
                    font-size: 0.78rem;
                    font-weight: 850;
                    color: #7367f0;
                    text-decoration: none;
                }

                .queue-list {
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                }

                .queue-row {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 16px;
                    background: #f8fafc;
                    border-radius: 16px;
                    border: 1px solid #f1f5f9;
                }

                .queue-left {
                    display: flex;
                    flex-direction: column;
                    gap: 2px;
                    flex: 1;
                    margin-right: 15px;
                }

                .badge-ord-number {
                    font-family: monospace;
                    background: #e2e8f0;
                    color: #475569;
                    padding: 2px 6px;
                    border-radius: 6px;
                    font-size: 0.7rem;
                    font-weight: 800;
                    width: fit-content;
                    margin-bottom: 4px;
                }

                .ord-customer {
                    font-size: 0.88rem;
                    font-weight: 800;
                    color: #0f172a;
                }

                .ord-items {
                    font-size: 0.78rem;
                    color: #64748b;
                    font-weight: 600;
                }

                .btn-prep-quick {
                    background: #1e293b;
                    color: white;
                    border: none;
                    padding: 8px 18px;
                    border-radius: 10px;
                    font-weight: 800;
                    font-size: 0.78rem;
                    cursor: pointer;
                    transition: background 0.15s ease;
                }

                .btn-prep-quick:hover {
                    background: #0f172a;
                }

                .queue-empty-state {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    padding: 40px;
                    text-align: center;
                }

                .e-emoji {
                    font-size: 2.5rem;
                    margin-bottom: 12px;
                }

                .e-text {
                    font-size: 0.82rem;
                    color: #94a3b8;
                    font-weight: 700;
                }

                .activity-timeline {
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                }

                .timeline-item {
                    display: flex;
                    gap: 14px;
                    position: relative;
                }

                .timeline-item:not(:last-child)::after {
                    content: '';
                    position: absolute;
                    left: 17px;
                    top: 36px;
                    bottom: -16px;
                    width: 1px;
                    background: #e2e8f0;
                }

                .timeline-bullet {
                    width: 34px;
                    height: 34px;
                    border-radius: 50%;
                    border: 2px solid;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: white;
                    font-size: 0.95rem;
                    z-index: 10;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.02);
                }

                .timeline-body {
                    display: flex;
                    flex-direction: column;
                    gap: 2px;
                }

                .t-title {
                    font-size: 0.82rem;
                    font-weight: 800;
                    color: #0f172a;
                }

                .t-desc {
                    font-size: 0.76rem;
                    color: #64748b;
                    font-weight: 600;
                }

                .t-time {
                    font-size: 0.65rem;
                    color: #94a3b8;
                    font-weight: 700;
                }

                .timeline-empty {
                    font-size: 0.8rem;
                    color: #94a3b8;
                    text-align: center;
                    padding: 30px;
                    font-weight: 700;
                }

                @media (max-width: 1024px) {
                    .analytics-main-row,
                    .dashboard-deep-dive-grid,
                    .active-prep-grid {
                        grid-template-columns: 1fr;
                    }
                }
            `}} />
        </VendorLayout>
    );
}
