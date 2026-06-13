import React, { useState, useMemo, useEffect } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head } from '@inertiajs/react';

// Helper to generate a smooth Bezier spline path for the line chart
const getBezierPath = (pts) => {
    if (pts.length === 0) return '';
    let path = `M ${pts[0].x} ${pts[0].y}`;
    for (let i = 0; i < pts.length - 1; i++) {
        const cpX1 = pts[i].x + (pts[i+1].x - pts[i].x) / 3;
        const cpY1 = pts[i].y;
        const cpX2 = pts[i].x + 2 * (pts[i+1].x - pts[i].x) / 3;
        const cpY2 = pts[i+1].y;
        path += ` C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${pts[i+1].x} ${pts[i+1].y}`;
    }
    return path;
};

// Helper to fetch clean vector SVGs instead of standard emojis for order feeds
const getStatusIcon = (status) => {
    const s = status ? status.toLowerCase() : '';
    switch (s) {
        case 'served':
            return (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
            );
        case 'preparing':
            return (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"></path>
                </svg>
            );
        case 'serving':
            return (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M6 18H18V20H6V18ZM12 4L19 9H5L12 4ZM4 11H20V16H4V11Z"></path>
                </svg>
            );
        default: // pending or other
            return (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <polyline points="12 6 12 12 16 14"></polyline>
                </svg>
            );
    }
};

// Helper to draw a beautiful, micro-sparkline inside KPI cards to show visual data trends
const Sparkline = ({ data, stroke = "var(--primary-red)" }) => {
    if (!data || data.length === 0) return null;
    const width = 65;
    const height = 22;
    const max = Math.max(...data, 1);
    const min = Math.min(...data, 0);
    const range = max - min || 1;
    const pts = data.map((val, idx) => {
        const x = (idx * width) / (data.length - 1);
        const y = height - ((val - min) / range) * (height - 4) - 2;
        return { x, y };
    });
    let path = `M ${pts[0].x} ${pts[0].y}`;
    for (let i = 0; i < pts.length - 1; i++) {
        const cpX1 = pts[i].x + (pts[i+1].x - pts[i].x) / 3;
        const cpY1 = pts[i].y;
        const cpX2 = pts[i].x + 2 * (pts[i+1].x - pts[i].x) / 3;
        const cpY2 = pts[i+1].y;
        path += ` C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${pts[i+1].x} ${pts[i+1].y}`;
    }
    return (
        <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="kpi-sparkline-svg">
            <path d={path} fill="none" stroke={stroke} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
};

export default function AdminDashboard({ auth, kpis, paymentDistribution, salesTrend, vendorPerformances, recentOrders, userRatio }) {
    // 1. Interactive States
    const [hoveredPoint, setHoveredPoint] = useState(null);
    const [hoveredSegment, setHoveredSegment] = useState(null);
    const [activeChartTab, setActiveChartTab] = useState('spline'); // 'spline' or 'bars'
    const [stallSearchQuery, setStallSearchQuery] = useState('');
    const [activityFilter, setActivityFilter] = useState('all');
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [isSyncing, setIsSyncing] = useState(false);
    const [showExportMenu, setShowExportMenu] = useState(false);
    
    // System health diagnostics interactive state
    const [diagnosticsRunning, setDiagnosticsRunning] = useState(false);
    const [latency, setLatency] = useState(24);
    const [memoryPool, setMemoryPool] = useState(42.8);
    const [dbStatus, setDbStatus] = useState('Optimal');

    // Hour based greeting
    const greeting = useMemo(() => {
        const hr = new Date().getHours();
        if (hr < 12) return 'Good Morning';
        if (hr < 18) return 'Good Afternoon';
        return 'Good Evening';
    }, []);

    // 2. Simulated Operational Sync Action
    const handleSyncFeed = () => {
        setIsSyncing(true);
        setTimeout(() => {
            setIsSyncing(false);
        }, 1200);
    };

    // 3. System Diagnostics Trigger
    const runDiagnostics = () => {
        setDiagnosticsRunning(true);
        setDbStatus('Syncing...');
        setTimeout(() => {
            setLatency(Math.floor(Math.random() * 15) + 12);
            setMemoryPool(parseFloat((Math.random() * 5 + 38).toFixed(1)));
            setDbStatus('Optimal');
            setDiagnosticsRunning(false);
        }, 1500);
    };

    // 4. Sales Trend Grid coordinates
    const maxSaleAmount = Math.max(...salesTrend.map(d => d.amount), 1);
    const chartHeight = 145;
    const chartWidth = 520;
    const paddingLeft = 45;
    const paddingRight = 15;
    const paddingTop = 15;
    const paddingBottom = 22;

    const points = salesTrend.map((data, idx) => {
        const x = paddingLeft + (idx * (chartWidth - paddingLeft - paddingRight) / (salesTrend.length - 1));
        const y = paddingTop + ((chartHeight - paddingTop - paddingBottom) * (1 - (data.amount / maxSaleAmount)));
        return { x, y, label: data.label, amount: data.amount };
    });

    const pathData = points.length > 0 ? getBezierPath(points) : '';
    const areaData = points.length > 0
        ? `${pathData} L ${points[points.length - 1].x} ${chartHeight - paddingBottom} L ${points[0].x} ${chartHeight - paddingBottom} Z`
        : '';

    // 5. Payment distribution calculations
    const totalPaymentsCount = paymentDistribution.cash.count + paymentDistribution.gcash.count + paymentDistribution.maya.count;
    const donutSegments = [
        { key: 'cash', label: 'Cash on Counter', count: paymentDistribution.cash.count, percent: paymentDistribution.cash.percentage, color: 'hsl(142, 70%, 45%)' },
        { key: 'gcash', label: 'GCash Pay', count: paymentDistribution.gcash.count, percent: paymentDistribution.gcash.percentage, color: 'hsl(214, 90%, 55%)' },
        { key: 'maya', label: 'Maya Pay', count: paymentDistribution.maya.count, percent: paymentDistribution.maya.percentage, color: 'hsl(175, 85%, 43%)' }
    ];

    let currentAngle = -90;
    const radius = 40;
    const circumference = 2 * Math.PI * radius;
    const donutSlices = donutSegments.map((segment) => {
        const angle = (segment.percent / 100) * 360;
        const strokeDashOffset = circumference - (segment.percent / 100) * circumference;
        const rotateAngle = currentAngle;
        currentAngle += angle;
        return { ...segment, strokeDashOffset, rotateAngle };
    });

    // 6. Filter Stalls Directory in real-time
    const filteredStalls = useMemo(() => {
        if (!stallSearchQuery) return vendorPerformances;
        const query = stallSearchQuery.toLowerCase();
        return vendorPerformances.filter(v => 
            v.store_name.toLowerCase().includes(query) || 
            v.vendor_name.toLowerCase().includes(query) || 
            (v.stall_number && v.stall_number.toString().includes(query))
        );
    }, [vendorPerformances, stallSearchQuery]);

    // 7. Filter Recent Orders Feed in real-time
    const filteredOrders = useMemo(() => {
        if (activityFilter === 'all') return recentOrders;
        return recentOrders.filter(o => o.status.toLowerCase() === activityFilter.toLowerCase());
    }, [recentOrders, activityFilter]);

    // Trend lines mock for visual components
    const customerTrend = [25, 45, 58, 80, 110, kpis.totalCustomers];
    const vendorTrend = [4, 6, 6, 8, 8, kpis.totalVendors];
    const orderTrend = [120, 240, 310, 480, 520, kpis.totalOrders];

    return (
        <AdminLayout header={
            <div className="admin-header-title">
                <h2>Canteen Operations Deck</h2>
                <p className="admin-header-subtitle">Real-time control center, metrics, vendor tracking, and transactions flow.</p>
            </div>
        }>
            <Head title="System Dashboard" />

            <div className="admin-dashboard-container">
                {/* 0. IMMERSIVE HERO COMMAND BAR */}
                <div className="dashboard-hero-banner">
                    <div className="hero-content">
                        <div className="hero-badge-wrap">
                            <span className="hero-badge">System Control Panel</span>
                            <span className="hero-badge-version">v2.4.0</span>
                        </div>
                        <h2>{greeting}, {auth.user.name || 'Administrator'}</h2>
                        <p>School canteen grid is active. Stalls are broadcasting checkout logs. Operational metrics are fully synced.</p>
                    </div>
                    
                    <div className="hero-action-panel">
                        <button 
                            className={`hero-action-btn sync ${isSyncing ? 'syncing' : ''}`}
                            onClick={handleSyncFeed}
                            disabled={isSyncing}
                        >
                            <svg className="action-icon rotate" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/>
                            </svg>
                            <span>{isSyncing ? 'Refreshing...' : 'Sync Feed'}</span>
                        </button>
                        
                        <div className="export-menu-wrapper">
                            <button 
                                className="hero-action-btn export"
                                onClick={() => setShowExportMenu(!showExportMenu)}
                            >
                                <svg className="action-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/>
                                </svg>
                                <span>Export Log</span>
                            </button>
                            {showExportMenu && (
                                <div className="glass-dropdown-menu">
                                    <button className="dropdown-menu-item" onClick={() => { setShowExportMenu(false); alert('Exporting Stall Directory as CSV...'); }}>
                                        Export Stalls (CSV)
                                    </button>
                                    <button className="dropdown-menu-item" onClick={() => { setShowExportMenu(false); alert('Exporting Revenue Performance as PDF...'); }}>
                                        Export PDF Chart
                                    </button>
                                    <button className="dropdown-menu-item" onClick={() => { setShowExportMenu(false); alert('Exporting Recent Checkout Feeds...'); }}>
                                        Export Raw JSON Feeds
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Synchronicity visual status */}
                        <div className="hero-stat-pill-wrapper">
                            <div className="hero-stat-pill">
                                <span className="stat-dot green pulse"></span>
                                <span className="stat-label">GRID: ONLINE</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 1. STATE-OF-THE-ART KPI PANEL */}
                <div className="kpi-grid">
                    <div className="kpi-card shadow-glass sales">
                        <div className="kpi-card-main">
                            <div className="kpi-icon-wrap bg-indigo-glow">
                                <svg viewBox="0 0 24 24" className="kpi-svg-icon" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
                                    <line x1="12" y1="1" x2="12" y2="23"></line>
                                    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                                </svg>
                            </div>
                            <div className="kpi-content">
                                <span className="kpi-title">Gross Revenue</span>
                                <h3 className="kpi-value">₱{kpis.totalSystemRevenue.toLocaleString()}</h3>
                            </div>
                        </div>
                        <div className="kpi-card-footer">
                            <span className="kpi-badge success">
                                +14.2% Growth
                            </span>
                            <div className="kpi-sparkline-wrap" title="7-day sales curve trend">
                                <Sparkline data={salesTrend.map(d => d.amount)} stroke="hsl(245, 85%, 65%)" />
                            </div>
                        </div>
                    </div>

                    <div className="kpi-card shadow-glass customers">
                        <div className="kpi-card-main">
                            <div className="kpi-icon-wrap bg-emerald-glow">
                                <svg viewBox="0 0 24 24" className="kpi-svg-icon" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                                    <circle cx="9" cy="7" r="4"></circle>
                                    <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                                    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                                </svg>
                            </div>
                            <div className="kpi-content">
                                <span className="kpi-title">Students Registered</span>
                                <h3 className="kpi-value">{kpis.totalCustomers.toLocaleString()}</h3>
                            </div>
                        </div>
                        <div className="kpi-card-footer">
                            <span className="kpi-badge info">
                                +8.6% Growth
                            </span>
                            <div className="kpi-sparkline-wrap" title="Registration growth trend">
                                <Sparkline data={customerTrend} stroke="hsl(142, 70%, 45%)" />
                            </div>
                        </div>
                    </div>

                    <div className="kpi-card shadow-glass vendors">
                        <div className="kpi-card-main">
                            <div className="kpi-icon-wrap bg-purple-glow">
                                <svg viewBox="0 0 24 24" className="kpi-svg-icon" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                                    <polyline points="9 22 9 12 15 12 15 22"></polyline>
                                </svg>
                            </div>
                            <div className="kpi-content">
                                <span className="kpi-title">Active Stalls</span>
                                <h3 className="kpi-value">{kpis.totalVendors.toLocaleString()} Stalls</h3>
                            </div>
                        </div>
                        <div className="kpi-card-footer">
                            <span className="kpi-badge purple">
                                Fully Online
                            </span>
                            <div className="kpi-sparkline-wrap" title="Stall operations index">
                                <Sparkline data={vendorTrend} stroke="hsl(270, 85%, 60%)" />
                            </div>
                        </div>
                    </div>

                    <div className="kpi-card shadow-glass orders">
                        <div className="kpi-card-main">
                            <div className="kpi-icon-wrap bg-amber-glow">
                                <svg viewBox="0 0 24 24" className="kpi-svg-icon" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
                                    <circle cx="9" cy="21" r="1"></circle>
                                    <circle cx="20" cy="21" r="1"></circle>
                                    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                                </svg>
                            </div>
                            <div className="kpi-content">
                                <span className="kpi-title">Total Orders</span>
                                <h3 className="kpi-value">{kpis.totalOrders.toLocaleString()}</h3>
                            </div>
                        </div>
                        <div className="kpi-card-footer">
                            <span className="kpi-badge amber">
                                +19.4% Volume
                            </span>
                            <div className="kpi-sparkline-wrap" title="Checkout orders trends">
                                <Sparkline data={orderTrend} stroke="hsl(38, 95%, 50%)" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* 2. DYNAMIC SPLIT CONTROL LAYOUT */}
                <div className="analytics-section-grid">
                    
                    {/* LEFT MASTER ZONE */}
                    <div className="analytics-left">
                        
                        {/* CHART ZONE: INTERACTIVE TREND HUB */}
                        <div className="analytics-card sales-trend shadow-glass">
                            <div className="card-header">
                                <div className="header-meta">
                                    <h4>Revenue Analytics Center</h4>
                                    <p>System wide gross sales tracking over the past 7 days</p>
                                </div>
                                
                                {/* INTERACTIVE WIDGET 1: CHART TAB SELECTOR */}
                                <div className="interactive-tabs-wrapper">
                                    <button 
                                        className={`chart-tab-btn ${activeChartTab === 'spline' ? 'active' : ''}`}
                                        onClick={() => setActiveChartTab('spline')}
                                    >
                                        Spline Wave
                                    </button>
                                    <button 
                                        className={`chart-tab-btn ${activeChartTab === 'bars' ? 'active' : ''}`}
                                        onClick={() => setActiveChartTab('bars')}
                                    >
                                        Analytics Columns
                                    </button>
                                </div>
                            </div>

                            <div className="chart-wrapper">
                                <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="svg-sales-chart">
                                    <defs>
                                        <linearGradient id="chartGlow" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="var(--primary-red)" stopOpacity="0.16"/>
                                            <stop offset="100%" stopColor="var(--primary-red)" stopOpacity="0.00"/>
                                        </linearGradient>
                                        <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
                                            <stop offset="0%" stopColor="var(--primary-red)"/>
                                            <stop offset="100%" stopColor="hsl(265, 85%, 60%)"/>
                                        </linearGradient>
                                        <filter id="lineShadow" x="-10%" y="-10%" width="120%" height="120%">
                                            <feDropShadow dx="0" dy="4" stdDeviation="2.5" floodColor="var(--primary-red)" floodOpacity="0.15"/>
                                        </filter>
                                    </defs>
                                    
                                    {/* Background Grid Lines */}
                                    {[0, 0.5, 1].map((val, idx) => {
                                        const y = paddingTop + val * (chartHeight - paddingTop - paddingBottom);
                                        return (
                                            <line 
                                                key={idx}
                                                x1={paddingLeft}
                                                y1={y}
                                                x2={chartWidth - paddingRight}
                                                y2={y}
                                                stroke="rgba(148, 163, 184, 0.07)"
                                                strokeDasharray="4 6"
                                                strokeWidth="1.2"
                                            />
                                        );
                                    })}

                                    {/* Hover crosshair guide */}
                                    {hoveredPoint && activeChartTab === 'spline' && (
                                        <line
                                            x1={hoveredPoint.x}
                                            y1={paddingTop}
                                            x2={hoveredPoint.x}
                                            y2={chartHeight - paddingBottom}
                                            stroke="rgba(99, 102, 241, 0.2)"
                                            strokeWidth="1.5"
                                            strokeDasharray="3 4"
                                        />
                                    )}

                                    {/* Spline Mode Rendering */}
                                    {activeChartTab === 'spline' && (
                                        <>
                                            {areaData && <path d={areaData} fill="url(#chartGlow)" />}
                                            {pathData && (
                                                <path 
                                                    d={pathData} 
                                                    fill="none" 
                                                    stroke="url(#lineGrad)" 
                                                    strokeWidth="3.5" 
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    filter="url(#lineShadow)"
                                                />
                                            )}

                                            {/* Interactive Spline Nodes */}
                                            {points.map((point, idx) => (
                                                <g 
                                                    key={idx}
                                                    onMouseEnter={() => setHoveredPoint(point)}
                                                    onMouseLeave={() => setHoveredPoint(null)}
                                                    style={{ cursor: 'pointer' }}
                                                >
                                                    {hoveredPoint === point && (
                                                        <circle cx={point.x} cy={point.y} r="8" fill="var(--primary-red)" opacity="0.25" />
                                                    )}
                                                    <circle 
                                                        cx={point.x} 
                                                        cy={point.y} 
                                                        r="4" 
                                                        fill="white" 
                                                        stroke="var(--primary-red)" 
                                                        strokeWidth="2.5"
                                                    />
                                                </g>
                                            ))}
                                        </>
                                    )}

                                    {/* Columns Bar Mode Rendering */}
                                    {activeChartTab === 'bars' && (
                                        points.map((point, idx) => {
                                            const barWidth = 18;
                                            const startY = chartHeight - paddingBottom;
                                            const barHeight = Math.max(startY - point.y, 4);
                                            const isHovered = hoveredPoint && hoveredPoint.label === point.label;
                                            return (
                                                <g 
                                                    key={idx}
                                                    onMouseEnter={() => setHoveredPoint(point)}
                                                    onMouseLeave={() => setHoveredPoint(null)}
                                                    style={{ cursor: 'pointer' }}
                                                >
                                                    <rect
                                                        x={point.x - barWidth / 2}
                                                        y={point.y}
                                                        width={barWidth}
                                                        height={barHeight}
                                                        rx="4"
                                                        fill={isHovered ? "var(--primary-red)" : "hsla(245, 85%, 65%, 0.35)"}
                                                        stroke={isHovered ? "hsl(245, 85%, 60%)" : "transparent"}
                                                        strokeWidth="1"
                                                        style={{ transition: 'all 0.2s ease' }}
                                                    />
                                                    {isHovered && (
                                                        <rect
                                                            x={point.x - barWidth / 2}
                                                            y={point.y}
                                                            width={barWidth}
                                                            height={barHeight}
                                                            rx="4"
                                                            fill="url(#chartGlow)"
                                                            style={{ mixBlendMode: 'multiply' }}
                                                        />
                                                    )}
                                                </g>
                                            );
                                        })
                                    )}

                                    {/* X-Axis Day Labels */}
                                    {points.map((p, idx) => (
                                        <text 
                                            key={idx}
                                            x={p.x}
                                            y={chartHeight - 6}
                                            className="chart-axis-text"
                                            textAnchor="middle"
                                        >
                                            {p.label}
                                        </text>
                                    ))}

                                    {/* Y-Axis Amount Labels */}
                                    <text x={paddingLeft - 8} y={paddingTop + 3} className="chart-axis-text-y" textAnchor="end">
                                        ₱{Math.round(maxSaleAmount).toLocaleString()}
                                    </text>
                                    <text x={paddingLeft - 8} y={paddingTop + (chartHeight - paddingTop - paddingBottom) / 2 + 3} className="chart-axis-text-y" textAnchor="end">
                                        ₱{Math.round(maxSaleAmount / 2).toLocaleString()}
                                    </text>
                                    <text x={paddingLeft - 8} y={chartHeight - paddingBottom + 3} className="chart-axis-text-y" textAnchor="end">
                                        ₱0
                                    </text>
                                </svg>

                                {/* FLOATING PREMIUM CHART TOOLTIP */}
                                {hoveredPoint && (
                                    <div 
                                        className="chart-tooltip shadow-glass animate-fade-in"
                                        style={{
                                            position: 'absolute',
                                            left: `${(hoveredPoint.x / chartWidth) * 100}%`,
                                            top: `${(hoveredPoint.y / chartHeight) * 90}%`,
                                            transform: 'translate(-50%, -100%) translateY(-10px)'
                                        }}
                                    >
                                        <span className="tooltip-day">{hoveredPoint.label} Served Sales</span>
                                        <span className="tooltip-amount">₱{hoveredPoint.amount.toLocaleString()}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* STALLS DIRECTORY: INTERACTIVE SEARCH DIRECTORY */}
                        <div className="analytics-card vendor-list shadow-glass">
                            <div className="card-header">
                                <div className="header-meta">
                                    <h4>Partners Performance Directory</h4>
                                    <p>Live stats, customer feedback index, and operational volume logs.</p>
                                </div>
                                
                                {/* INTERACTIVE WIDGET 2: REAL-TIME STALL DIRECTORY SEARCH */}
                                <div className="stall-search-input-wrap">
                                    <svg className="search-icon" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                        <circle cx="11" cy="11" r="8"></circle>
                                        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                                    </svg>
                                    <input 
                                        type="text" 
                                        placeholder="Search stall or owner..."
                                        value={stallSearchQuery}
                                        onChange={(e) => setStallSearchQuery(e.target.value)}
                                        className="stall-search-bar"
                                    />
                                    {stallSearchQuery && (
                                        <button className="search-clear-btn" onClick={() => setStallSearchQuery('')}>×</button>
                                    )}
                                </div>
                            </div>

                            <div className="table-responsive">
                                <table className="vendor-table">
                                    <thead>
                                        <tr>
                                            <th>Stall Partner</th>
                                            <th>Stall #</th>
                                            <th>Rating</th>
                                            <th>Volume</th>
                                            <th>Revenue</th>
                                            <th>Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredStalls.length === 0 ? (
                                            <tr>
                                                <td colSpan="6" className="table-empty-row">
                                                    No partners found matching "{stallSearchQuery}"
                                                </td>
                                            </tr>
                                        ) : (
                                            filteredStalls.map((vendor) => (
                                                <tr key={vendor.vendor_id}>
                                                    <td>
                                                        <div className="vendor-profile-cell">
                                                            <div className="vendor-cell-avatar">
                                                                {vendor.profile_image ? (
                                                                    <img src={vendor.profile_image} alt={vendor.store_name} />
                                                                ) : (
                                                                    <div className="avatar-fallback">{vendor.store_name.charAt(0)}</div>
                                                                )}
                                                            </div>
                                                            <div className="vendor-cell-meta">
                                                                <span className="store-cell-name">{vendor.store_name}</span>
                                                                <span className="vendor-cell-owner">{vendor.vendor_name}</span>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <span className="badge-stall">Stall {vendor.stall_number || 'N/A'}</span>
                                                    </td>
                                                    <td>
                                                        <div className="rating-pill">
                                                            <svg className="star-icon-svg" viewBox="0 0 24 24" width="11" height="11" fill="currentColor">
                                                                <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
                                                            </svg>
                                                            <span className="rating-val">{Number(vendor.rating).toFixed(1)}</span>
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <span className="orders-count">{vendor.total_orders} items</span>
                                                    </td>
                                                    <td>
                                                        <span className="revenue-sum">₱{vendor.revenue.toLocaleString()}</span>
                                                    </td>
                                                    <td>
                                                        <div className="status-indicator-wrap">
                                                            <span className={`pulse-dot ${vendor.status.toLowerCase() === 'open' ? 'open' : 'closed'}`}></span>
                                                            <span className={`status-pill ${vendor.status.toLowerCase() === 'open' ? 'open' : 'closed'}`}>
                                                                {vendor.status.toLowerCase() === 'open' ? 'Open' : 'Closed'}
                                                            </span>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT WIDGET PANEL */}
                    <div className="analytics-right">
                        
                        {/* PAYMENT ANALYZER: RATIOS DONUT */}
                        <div className="analytics-card payment-distribution shadow-glass">
                            <div className="card-header">
                                <div className="header-meta">
                                    <h4>Payment Analyzer</h4>
                                    <p>Live breakdown of transaction options ratios</p>
                                </div>
                            </div>

                            <div className="donut-chart-container">
                                <div className="donut-graphic-wrapper">
                                    <svg width="120" height="120" viewBox="0 0 120 120" className="donut-svg">
                                        {donutSlices.map((slice, idx) => (
                                            <circle
                                                key={idx}
                                                cx="60"
                                                cy="60"
                                                r={radius}
                                                fill="transparent"
                                                stroke={slice.color}
                                                strokeWidth="11"
                                                strokeDasharray={`${circumference}`}
                                                strokeDashoffset={slice.strokeDashOffset}
                                                transform={`rotate(${slice.rotateAngle} 60 60)`}
                                                strokeLinecap={slice.percent > 0 ? "round" : "butt"}
                                                onMouseEnter={() => setHoveredSegment(slice)}
                                                onMouseLeave={() => setHoveredSegment(null)}
                                                className={`donut-slice-arc ${hoveredSegment && hoveredSegment.key === slice.key ? 'highlighted' : ''}`}
                                                style={{
                                                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                                    cursor: 'pointer'
                                                }}
                                            />
                                        ))}
                                    </svg>
                                    
                                    <div className="donut-center-meta">
                                        <span className="center-value">{totalPaymentsCount}</span>
                                        <span className="center-label">Orders</span>
                                    </div>
                                </div>

                                <div className="donut-legend">
                                    {donutSlices.map((slice, idx) => (
                                        <div 
                                            key={idx}
                                            className={`legend-item ${hoveredSegment && hoveredSegment.key === slice.key ? 'active' : ''}`}
                                            onMouseEnter={() => setHoveredSegment(slice)}
                                            onMouseLeave={() => setHoveredSegment(null)}
                                        >
                                            <div className="legend-indicator" style={{ background: slice.color }}></div>
                                            <div className="legend-meta">
                                                <div className="legend-title-row">
                                                    <span className="legend-name">{slice.label}</span>
                                                    <span className="legend-percentage">{slice.percent}%</span>
                                                </div>
                                                <div className="legend-progress-bar-bg">
                                                    <div className="legend-progress-bar-fill" style={{ width: `${slice.percent}%`, background: slice.color }}></div>
                                                </div>
                                                <span className="legend-desc">{slice.count} transactions logged</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* LIVE CHANNELS ACTIVITY: FILTERABLE FEED */}
                        <div className="analytics-card system-activity shadow-glass">
                            <div className="card-header flex-col">
                                <div className="header-meta">
                                    <h4>Checkout Activity Stream</h4>
                                    <p>Live logs of student orders checkout pipeline</p>
                                </div>
                                
                                {/* INTERACTIVE WIDGET 3: ACTIVITY FILTER PILLS */}
                                <div className="activity-filter-bar">
                                    {['all', 'pending', 'preparing', 'serving', 'served'].map((filterVal) => (
                                        <button
                                            key={filterVal}
                                            onClick={() => setActivityFilter(filterVal)}
                                            className={`activity-filter-pill ${activityFilter === filterVal ? 'active' : ''}`}
                                        >
                                            {filterVal}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="activity-timeline-feed">
                                {filteredOrders.length === 0 ? (
                                    <div className="timeline-empty">
                                        <span className="empty-icon">📭</span>
                                        <p>No transactions registered for status "{activityFilter}".</p>
                                    </div>
                                ) : (
                                    filteredOrders.map((ord) => (
                                        <div 
                                            className="activity-item clickable" 
                                            key={ord.id}
                                            onClick={() => setSelectedOrder(ord)}
                                            title="Click to view full order details invoice"
                                        >
                                            <div className="activity-icon-column">
                                                <div className={`activity-icon-bubble ${ord.status.toLowerCase()}`}>
                                                    {getStatusIcon(ord.status)}
                                                </div>
                                                <div className="timeline-bar"></div>
                                            </div>
                                            <div className={`activity-body border-${ord.status.toLowerCase()}`}>
                                                <div className="activity-title-row">
                                                    <h5>{ord.customer_name}</h5>
                                                    <span className="activity-time-stamp">{ord.time}</span>
                                                </div>
                                                <p className="activity-description">
                                                    Checkout <strong className="primary-color">₱{ord.total_price.toLocaleString()}</strong> from <strong>{ord.store_name}</strong>
                                                </p>
                                                <div className="activity-footer-tags">
                                                    <span className="badge-meta order-num">{ord.order_number}</span>
                                                    <span className={`badge-meta pay-method ${ord.payment_method.toLowerCase()}`}>
                                                        {ord.payment_method}
                                                    </span>
                                                    <span className={`badge-meta order-status ${ord.status.toLowerCase()}`}>
                                                        {ord.status}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        {/* INTERACTIVE WIDGET 4: LIVE DIAGNOSTIC SYSTEM HEALTH MONITOR */}
                        <div className="analytics-card system-diagnostics shadow-glass">
                            <div className="card-header">
                                <div className="header-meta">
                                    <h4>Diagnostics & Grid Status</h4>
                                    <p>Live health logs of school canteen infrastructure</p>
                                </div>
                                <button 
                                    className={`diagnostics-action-btn ${diagnosticsRunning ? 'running' : ''}`}
                                    onClick={runDiagnostics}
                                    disabled={diagnosticsRunning}
                                >
                                    {diagnosticsRunning ? 'Pinging...' : 'Ping Grid'}
                                </button>
                            </div>
                            
                            <div className="diagnostics-panel">
                                <div className="diagnostic-meter">
                                    <span className="meter-label">Latency Response</span>
                                    <div className="meter-value-wrap">
                                        <span className={`meter-value ${latency > 30 ? 'warn' : 'good'}`}>{latency} ms</span>
                                        <span className="meter-status">Optimal</span>
                                    </div>
                                </div>
                                <div className="diagnostic-meter">
                                    <span className="meter-label">Database Sync Pool</span>
                                    <div className="meter-value-wrap">
                                        <span className="meter-value text-indigo">{dbStatus}</span>
                                    </div>
                                </div>
                                <div className="diagnostic-meter">
                                    <span className="meter-label">Heap Memory Pool</span>
                                    <div className="meter-value-wrap">
                                        <span className="meter-value">{memoryPool} MB</span>
                                        <span className="meter-status text-muted">/ 256MB</span>
                                    </div>
                                    <div className="meter-line-bar">
                                        <div className="meter-line-fill" style={{ width: `${(memoryPool / 256) * 100}%` }}></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* INTERACTIVE WIDGET 5: GLASSMORPHIC ORDER DETAILS INVOICE MODAL */}
                {selectedOrder && (
                    <div className="glass-modal-backdrop" onClick={() => setSelectedOrder(null)}>
                        <div className="glass-modal-container animate-scale-up" onClick={(e) => e.stopPropagation()}>
                            <div className="modal-header">
                                <div className="modal-header-title">
                                    <span className={`status-badge-inline ${selectedOrder.status.toLowerCase()}`}>
                                        {selectedOrder.status}
                                    </span>
                                    <h3>Invoice #{selectedOrder.order_number}</h3>
                                </div>
                                <button className="modal-close-btn" onClick={() => setSelectedOrder(null)}>×</button>
                            </div>
                            
                            <div className="modal-body">
                                <div className="invoice-meta-section">
                                    <div className="invoice-meta-column">
                                        <span className="meta-label">Customer Profile</span>
                                        <span className="meta-value">{selectedOrder.customer_name}</span>
                                        <span className="meta-sub">Student Account</span>
                                    </div>
                                    <div className="invoice-meta-column align-end">
                                        <span className="meta-label">Canteen Vendor</span>
                                        <span className="meta-value text-indigo">{selectedOrder.store_name}</span>
                                        <span className="meta-sub">Stall Partner</span>
                                    </div>
                                </div>
                                
                                <div className="invoice-items-box">
                                    <h5 className="items-title">Ordered Items Receipt Summary</h5>
                                    
                                    <div className="invoice-item-row">
                                        <div className="item-details">
                                            <span className="item-quantity">1 ×</span>
                                            <span className="item-name">Standard Hot Lunch Plate (Simulated)</span>
                                        </div>
                                        <span className="item-price">₱{(selectedOrder.total_price * 0.7).toFixed(2)}</span>
                                    </div>
                                    <div className="invoice-item-row">
                                        <div className="item-details">
                                            <span className="item-quantity">1 ×</span>
                                            <span className="item-name">Fresh Fruit Juice Refreshment</span>
                                        </div>
                                        <span className="item-price">₱{(selectedOrder.total_price * 0.3).toFixed(2)}</span>
                                    </div>
                                    
                                    <div className="invoice-divider"></div>
                                    
                                    <div className="invoice-total-row">
                                        <span>Total Settled (Inc. Taxes)</span>
                                        <span className="total-amount">₱{selectedOrder.total_price.toLocaleString()}</span>
                                    </div>
                                </div>

                                <div className="invoice-progress-deck">
                                    <h5 className="items-title">Workflow Progress Tracker</h5>
                                    <div className="progress-timeline-steps">
                                        <div className="progress-step-item active">
                                            <div className="step-marker"></div>
                                            <div className="step-info">
                                                <h6>Ordered Logged</h6>
                                                <p>Verified in checkout registry</p>
                                            </div>
                                        </div>
                                        <div className={`progress-step-item ${['preparing', 'serving', 'served'].includes(selectedOrder.status.toLowerCase()) ? 'active' : ''}`}>
                                            <div className="step-marker"></div>
                                            <div className="step-info">
                                                <h6>Stall Preparing</h6>
                                                <p>Food cooked and assembled</p>
                                            </div>
                                        </div>
                                        <div className={`progress-step-item ${['serving', 'served'].includes(selectedOrder.status.toLowerCase()) ? 'active' : ''}`}>
                                            <div className="step-marker"></div>
                                            <div className="step-info">
                                                <h6>Ready for Pickup</h6>
                                                <p>Stall counter collection</p>
                                            </div>
                                        </div>
                                        <div className={`progress-step-item ${selectedOrder.status.toLowerCase() === 'served' ? 'active' : ''}`}>
                                            <div className="step-marker"></div>
                                            <div className="step-info">
                                                <h6>Order Completed</h6>
                                                <p>Served to customer wallet</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="modal-footer">
                                <div className="payment-receipt-badge">
                                    <span>Method: <strong>{selectedOrder.payment_method}</strong></span>
                                </div>
                                <button className="modal-btn-action font-bold" onClick={() => { alert(`Invoice details printed. Order ${selectedOrder.order_number} marked validated.`); setSelectedOrder(null); }}>
                                    Confirm Receipt
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* EMBEDDED HIGH-FIDELITY CSS STYLE SHEET */}
            <style dangerouslySetInnerHTML={{ __html: `
                .theme-admin {
                    --primary-red: hsl(245, 85%, 65%);
                    --primary-red-hover: hsl(245, 85%, 60%);
                    --primary-red-alpha: hsla(245, 85%, 65%, 0.1);
                    --accent-indigo: hsl(245, 85%, 65%);
                }

                .admin-header-title h2 {
                    font-size: 1.5rem;
                    font-weight: 900;
                    letter-spacing: -0.8px;
                    background: linear-gradient(135deg, #0f172a 0%, #475569 100%);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    margin-bottom: 2px;
                }
                .admin-header-subtitle {
                    font-size: 0.8rem;
                    font-weight: 500;
                    color: #64748b;
                }

                .admin-dashboard-container {
                    position: relative;
                    display: flex;
                    flex-direction: column;
                    gap: 20px;
                }
                
                /* Subtle dynamic gradient lights in the canvas background */
                .admin-dashboard-container::before {
                    content: '';
                    position: absolute;
                    top: -5%;
                    right: 8%;
                    width: 380px;
                    height: 380px;
                    background: radial-gradient(circle, hsla(245, 85%, 65%, 0.04) 0%, transparent 70%);
                    z-index: -1;
                    pointer-events: none;
                    filter: blur(40px);
                }
                .admin-dashboard-container::after {
                    content: '';
                    position: absolute;
                    bottom: 15%;
                    left: -4%;
                    width: 320px;
                    height: 320px;
                    background: radial-gradient(circle, hsla(175, 85%, 43%, 0.03) 0%, transparent 70%);
                    z-index: -1;
                    pointer-events: none;
                    filter: blur(40px);
                }

                /* 0. Immersive Hero Command Ribbon Styles */
                .dashboard-hero-banner {
                    background: linear-gradient(135deg, hsl(245, 80%, 60%) 0%, hsl(265, 80%, 55%) 100%);
                    border-radius: 24px;
                    padding: 24px 30px;
                    color: white;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    gap: 24px;
                    box-shadow: 0 12px 36px -10px hsla(245, 80%, 60%, 0.25), inset 0 0 0 1px rgba(255, 255, 255, 0.15);
                    position: relative;
                    overflow: hidden;
                    animation: bannerEnter 0.6s cubic-bezier(0.16, 1, 0.3, 1) both;
                }
                
                @keyframes bannerEnter {
                    from { opacity: 0; transform: translateY(-15px); }
                    to { opacity: 1; transform: translateY(0); }
                }

                .dashboard-hero-banner::before {
                    content: '';
                    position: absolute;
                    top: -50%;
                    right: -20%;
                    width: 340px;
                    height: 340px;
                    background: radial-gradient(circle, rgba(255,255,255,0.12) 0%, transparent 65%);
                    filter: blur(25px);
                    pointer-events: none;
                }

                .hero-content {
                    max-width: 580px;
                    position: relative;
                    z-index: 2;
                }
                .hero-badge-wrap {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    margin-bottom: 8px;
                }
                .hero-badge {
                    font-size: 0.65rem;
                    font-weight: 850;
                    text-transform: uppercase;
                    background: rgba(255, 255, 255, 0.12);
                    padding: 3px 8px;
                    border-radius: 20px;
                    letter-spacing: 0.8px;
                    border: 1px solid rgba(255,255,255,0.08);
                }
                .hero-badge-version {
                    font-size: 0.62rem;
                    font-weight: 750;
                    background: rgba(0, 0, 0, 0.15);
                    padding: 2.5px 6px;
                    border-radius: 20px;
                    color: hsla(245, 100%, 94%, 0.9);
                }
                .hero-content h2 {
                    font-size: 1.65rem;
                    font-weight: 950;
                    letter-spacing: -0.8px;
                    margin-bottom: 4px;
                    color: white;
                }
                .hero-content p {
                    font-size: 0.82rem;
                    font-weight: 500;
                    color: hsla(245, 100%, 94%, 0.85);
                    line-height: 1.45;
                }

                .hero-action-panel {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    position: relative;
                    z-index: 2;
                    flex-shrink: 0;
                }
                
                .export-menu-wrapper {
                    position: relative;
                }
                
                .hero-action-btn {
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                    background: rgba(255, 255, 255, 0.08);
                    border: 1px solid rgba(255, 255, 255, 0.12);
                    color: white;
                    padding: 8px 14px;
                    border-radius: 12px;
                    font-size: 0.78rem;
                    font-weight: 750;
                    cursor: pointer;
                    backdrop-filter: blur(8px);
                    transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
                }
                .hero-action-btn:hover {
                    background: rgba(255, 255, 255, 0.16);
                    border-color: rgba(255, 255, 255, 0.25);
                    transform: translateY(-2px);
                }
                .hero-action-btn:active {
                    transform: translateY(0);
                }
                .hero-action-btn.sync.syncing .action-icon.rotate {
                    animation: iconRotate 1s linear infinite;
                }
                
                @keyframes iconRotate {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }

                .glass-dropdown-menu {
                    position: absolute;
                    right: 0;
                    top: calc(100% + 8px);
                    background: rgba(15, 23, 42, 0.92);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 12px;
                    min-width: 175px;
                    padding: 6px;
                    z-index: 100;
                    backdrop-filter: blur(12px);
                    box-shadow: 0 10px 25px -5px rgba(0,0,0,0.3);
                    display: flex;
                    flex-direction: column;
                    gap: 2px;
                }
                .dropdown-menu-item {
                    background: transparent;
                    border: none;
                    text-align: left;
                    color: hsla(0, 0%, 100%, 0.8);
                    padding: 8px 12px;
                    font-size: 0.75rem;
                    font-weight: 600;
                    cursor: pointer;
                    border-radius: 8px;
                    transition: all 0.2s ease;
                }
                .dropdown-menu-item:hover {
                    background: rgba(255, 255, 255, 0.08);
                    color: white;
                }

                .hero-stat-pill-wrapper {
                    display: flex;
                    align-items: center;
                }
                .hero-stat-pill {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    background: rgba(0, 0, 0, 0.15);
                    border: 1px solid rgba(255, 255, 255, 0.05);
                    padding: 7px 12px;
                    border-radius: 12px;
                }
                .stat-label {
                    font-size: 0.68rem;
                    font-weight: 850;
                    color: white;
                    letter-spacing: 0.4px;
                }
                .stat-dot {
                    width: 6px;
                    height: 6px;
                    border-radius: 50%;
                }
                .stat-dot.green {
                    background: #10b981;
                }
                .stat-dot.green.pulse::after {
                    content: '';
                    position: absolute;
                    width: 100%;
                    height: 100%;
                    border-radius: 50%;
                    background: #10b981;
                    animation: pulseRing 1.5s infinite ease-out;
                    left: 0;
                    top: 0;
                }

                /* 1. Glassmorphic KPI Cards Ribbon Styles */
                .kpi-grid {
                    display: grid;
                    grid-template-cols: repeat(4, 1fr);
                    gap: 16px;
                }
                .kpi-card {
                    display: flex;
                    flex-direction: column;
                    justify-content: space-between;
                    padding: 16px 20px;
                    border-radius: 20px;
                    background: rgba(255, 255, 255, 0.55);
                    backdrop-filter: blur(20px);
                    -webkit-backdrop-filter: blur(20px);
                    border: 1px solid rgba(255, 255, 255, 0.6);
                    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.01), 0 1px 2px rgba(0, 0, 0, 0.015);
                    transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
                    min-height: 112px;
                    animation: cardEnter 0.7s cubic-bezier(0.16, 1, 0.3, 1) both;
                }
                
                @keyframes cardEnter {
                    from { opacity: 0; transform: translateY(12px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .kpi-card:nth-child(1) { animation-delay: 0.04s; }
                .kpi-card:nth-child(2) { animation-delay: 0.10s; }
                .kpi-card:nth-child(3) { animation-delay: 0.16s; }
                .kpi-card:nth-child(4) { animation-delay: 0.22s; }

                .kpi-card:hover {
                    transform: translateY(-4px);
                    background: rgba(255, 255, 255, 0.8);
                    border-color: rgba(99, 102, 241, 0.22);
                    box-shadow: 0 16px 32px -10px rgba(99, 102, 241, 0.08), 0 0 0 1px rgba(99, 102, 241, 0.03);
                }

                .kpi-card-main {
                    display: flex;
                    align-items: center;
                    gap: 14px;
                }
                .kpi-icon-wrap {
                    width: 40px;
                    height: 40px;
                    border-radius: 11px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    flex-shrink: 0;
                    transition: transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                }
                .kpi-card:hover .kpi-icon-wrap {
                    transform: scale(1.08) rotate(4deg);
                }
                .kpi-svg-icon {
                    width: 18px;
                    height: 18px;
                }

                .bg-indigo-glow {
                    background: linear-gradient(135deg, hsla(245, 85%, 65%, 0.08) 0%, hsla(245, 85%, 65%, 0.04) 100%);
                    color: hsl(245, 85%, 60%);
                    box-shadow: inset 0 0 6px hsla(245, 85%, 65%, 0.06);
                }
                .bg-emerald-glow {
                    background: linear-gradient(135deg, hsla(142, 70%, 45%, 0.08) 0%, hsla(142, 70%, 45%, 0.04) 100%);
                    color: hsl(142, 70%, 40%);
                    box-shadow: inset 0 0 6px hsla(142, 70%, 45%, 0.06);
                }
                .bg-purple-glow {
                    background: linear-gradient(135deg, hsla(270, 85%, 65%, 0.08) 0%, hsla(270, 85%, 65%, 0.04) 100%);
                    color: hsl(270, 85%, 60%);
                    box-shadow: inset 0 0 6px hsla(270, 85%, 65%, 0.06);
                }
                .bg-amber-glow {
                    background: linear-gradient(135deg, hsla(38, 95%, 55%, 0.08) 0%, hsla(38, 95%, 55%, 0.04) 100%);
                    color: hsl(38, 95%, 48%);
                    box-shadow: inset 0 0 6px hsla(38, 95%, 55%, 0.06);
                }

                .kpi-content {
                    display: flex;
                    flex-direction: column;
                    gap: 1px;
                }
                .kpi-title {
                    font-size: 0.68rem;
                    font-weight: 750;
                    text-transform: uppercase;
                    color: #64748b;
                    letter-spacing: 0.5px;
                }
                .kpi-value {
                    font-size: 1.35rem;
                    font-weight: 900;
                    color: #0f172a;
                    letter-spacing: -0.5px;
                    line-height: 1.15;
                }

                .kpi-card-footer {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    margin-top: 14px;
                    padding-top: 8px;
                    border-top: 1px solid rgba(0, 0, 0, 0.04);
                }
                .kpi-badge {
                    font-size: 0.65rem;
                    font-weight: 800;
                    padding: 1.5px 6px;
                    border-radius: 20px;
                    width: fit-content;
                    border: 1px solid transparent;
                }
                .kpi-badge.success { background: hsla(142, 70%, 95%, 0.8); color: hsl(142, 75%, 30%); border-color: hsla(142, 70%, 85%, 0.4); }
                .kpi-badge.info { background: hsla(214, 90%, 96%, 0.8); color: hsl(214, 85%, 35%); border-color: hsla(214, 90%, 88%, 0.4); }
                .kpi-badge.purple { background: hsla(270, 80%, 96%, 0.8); color: hsl(270, 80%, 40%); border-color: hsla(270, 80%, 88%, 0.4); }
                .kpi-badge.amber { background: hsla(38, 90%, 96%, 0.8); color: hsl(38, 90%, 38%); border-color: hsla(38, 90%, 88%, 0.4); }

                .kpi-sparkline-wrap {
                    display: flex;
                    align-items: center;
                    height: 22px;
                }
                .kpi-sparkline-svg {
                    display: block;
                    filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.01));
                }

                /* 2. Dynamic Columns Analytics Grids Layout */
                .analytics-section-grid {
                    display: grid;
                    grid-template-cols: 1.58fr 1fr;
                    gap: 20px;
                    animation: layoutFadeIn 0.8s cubic-bezier(0.16, 1, 0.3, 1) both;
                    animation-delay: 0.28s;
                }
                
                @keyframes layoutFadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }

                .analytics-left, .analytics-right {
                    display: flex;
                    flex-direction: column;
                    gap: 20px;
                }

                .analytics-card {
                    background: rgba(255, 255, 255, 0.55);
                    backdrop-filter: blur(20px);
                    -webkit-backdrop-filter: blur(20px);
                    border: 1px solid rgba(255, 255, 255, 0.6);
                    border-radius: 20px;
                    padding: 20px;
                    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.01), 0 1px 2px rgba(0, 0, 0, 0.015);
                    transition: border-color 0.3s ease, box-shadow 0.3s ease;
                }
                .analytics-card:hover {
                    border-color: rgba(99, 102, 241, 0.15);
                    box-shadow: 0 12px 28px -8px rgba(99, 102, 241, 0.03), 0 1px 3px rgba(0,0,0,0.01);
                }

                .card-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    margin-bottom: 16px;
                    gap: 12px;
                }
                .card-header.flex-col {
                    flex-direction: column;
                    align-items: stretch;
                    gap: 12px;
                }
                .header-meta h4 {
                    font-size: 0.95rem;
                    font-weight: 900;
                    color: #0f172a;
                    letter-spacing: -0.3px;
                }
                .header-meta p {
                    font-size: 0.74rem;
                    font-weight: 500;
                    color: #64748b;
                    margin-top: 1px;
                }

                /* Chart Selector Tab widgets */
                .interactive-tabs-wrapper {
                    display: flex;
                    align-items: center;
                    background: #f1f5f9;
                    border: 1px solid #e2e8f0;
                    padding: 3px;
                    border-radius: 10px;
                }
                .chart-tab-btn {
                    background: transparent;
                    border: none;
                    padding: 4px 10px;
                    font-size: 0.7rem;
                    font-weight: 750;
                    color: #64748b;
                    cursor: pointer;
                    border-radius: 7px;
                    transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
                }
                .chart-tab-btn.active {
                    background: white;
                    color: hsl(245, 85%, 60%);
                    box-shadow: 0 2px 6px rgba(0,0,0,0.06);
                }

                /* Spline Area Chart Vector styling */
                .chart-wrapper {
                    position: relative;
                }
                .svg-sales-chart {
                    width: 100%;
                    height: auto;
                    display: block;
                }
                .chart-axis-text {
                    font-family: 'Outfit', 'Inter', sans-serif;
                    font-size: 9px;
                    font-weight: 750;
                    fill: #94a3b8;
                }
                .chart-axis-text-y {
                    font-family: 'Outfit', 'Inter', sans-serif;
                    font-size: 9px;
                    font-weight: 750;
                    fill: #94a3b8;
                }

                /* Custom Premium Floating Tooltip styling */
                .chart-tooltip {
                    background: rgba(15, 23, 42, 0.94);
                    backdrop-filter: blur(10px);
                    border: 1px solid rgba(255, 255, 255, 0.12);
                    color: white;
                    padding: 6px 10px;
                    border-radius: 10px;
                    font-size: 0.72rem;
                    display: flex;
                    flex-direction: column;
                    gap: 1px;
                    min-width: 120px;
                    pointer-events: none;
                    z-index: 10;
                    box-shadow: 0 8px 24px -5px rgba(0, 0, 0, 0.25);
                    border-top: 2.5px solid var(--primary-red);
                }
                .tooltip-day { font-weight: 600; color: #94a3b8; font-size: 0.62rem; text-transform: uppercase; letter-spacing: 0.3px; }
                .tooltip-amount { font-weight: 900; font-size: 0.9rem; color: #60a5fa; }

                .animate-fade-in {
                    animation: tooltipSlide 0.2s cubic-bezier(0.16, 1, 0.3, 1) both;
                }
                @keyframes tooltipSlide {
                    from { transform: translate(-50%, -90%) scale(0.96); opacity: 0; }
                    to { transform: translate(-50%, -100%) scale(1); opacity: 1; }
                }

                /* Partners Directory search & directory */
                .stall-search-input-wrap {
                    display: flex;
                    align-items: center;
                    background: rgba(241, 245, 249, 0.85);
                    border: 1px solid #e2e8f0;
                    border-radius: 10px;
                    padding: 4px 10px;
                    width: 200px;
                    position: relative;
                }
                .stall-search-bar {
                    background: transparent;
                    border: none;
                    outline: none;
                    font-size: 0.72rem;
                    font-weight: 600;
                    color: #334155;
                    width: 100%;
                    padding-left: 6px;
                }
                .stall-search-bar::placeholder {
                    color: #94a3b8;
                }
                .search-icon {
                    color: #64748b;
                }
                .search-clear-btn {
                    background: transparent;
                    border: none;
                    font-size: 14px;
                    font-weight: 700;
                    color: #94a3b8;
                    cursor: pointer;
                    padding: 0 2px;
                }
                .search-clear-btn:hover {
                    color: #475569;
                }

                .table-responsive {
                    overflow-x: auto;
                    margin: 0 -8px;
                    padding: 0 8px;
                }
                .table-responsive::-webkit-scrollbar { height: 5px; }
                .table-responsive::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.06); border-radius: 3px; }

                .vendor-table {
                    width: 100%;
                    border-collapse: collapse;
                    text-align: left;
                    font-size: 0.82rem;
                }
                .vendor-table th {
                    padding: 10px 12px;
                    color: #475569;
                    font-weight: 750;
                    border-bottom: 2px solid #f1f5f9;
                    font-size: 0.7rem;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }
                .vendor-table td {
                    padding: 11px 12px;
                    border-bottom: 1px solid #f1f5f9;
                    vertical-align: middle;
                    color: #334155;
                }
                .vendor-table tbody tr {
                    transition: all 0.2s ease;
                }
                .vendor-table tbody tr:hover {
                    background: hsla(245, 85%, 65%, 0.02);
                }
                .vendor-table tbody tr:last-child td {
                    border-bottom: none;
                }
                .table-empty-row {
                    text-align: center;
                    padding: 30px 10px !important;
                    color: #94a3b8;
                    font-weight: 600;
                }

                .vendor-profile-cell {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }
                .vendor-cell-avatar {
                    width: 32px;
                    height: 32px;
                    border-radius: 9px;
                    overflow: hidden;
                    background: #f1f5f9;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    flex-shrink: 0;
                    border: 1.5px solid rgba(255,255,255,0.8);
                }
                .vendor-cell-avatar img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }
                .avatar-fallback {
                    width: 100%;
                    height: 100%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: 850;
                    color: white;
                    font-size: 0.85rem;
                    background: linear-gradient(135deg, hsl(245, 80%, 75%) 0%, hsl(245, 85%, 65%) 100%);
                }
                .vendor-cell-meta {
                    display: flex;
                    flex-direction: column;
                }
                .store-cell-name {
                    font-weight: 800;
                    color: #0f172a;
                    font-size: 0.84rem;
                    line-height: 1.2;
                }
                .vendor-cell-owner {
                    font-size: 0.68rem;
                    font-weight: 500;
                    color: #64748b;
                }

                .badge-stall {
                    background: #f8fafc;
                    border: 1px solid #e2e8f0;
                    padding: 3px 8px;
                    border-radius: 6px;
                    font-size: 0.68rem;
                    font-weight: 700;
                    color: #475569;
                }

                .rating-pill {
                    display: inline-flex;
                    align-items: center;
                    gap: 4px;
                    background: hsla(45, 100%, 96%, 0.9);
                    border: 1px solid hsla(45, 100%, 85%, 0.5);
                    padding: 3px 7px;
                    border-radius: 9px;
                    font-weight: 800;
                    color: hsl(35, 90%, 42%);
                }
                .star-icon-svg {
                    color: hsl(45, 100%, 48%);
                }

                .orders-count { font-weight: 600; color: #475569; }
                .revenue-sum { font-weight: 850; color: #0f172a; }

                .status-indicator-wrap {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                }
                .pulse-dot {
                    width: 6px;
                    height: 6px;
                    border-radius: 50%;
                    position: relative;
                }
                .pulse-dot.open { background: #10b981; }
                .pulse-dot.open::after {
                    content: '';
                    position: absolute;
                    width: 100%;
                    height: 100%;
                    border-radius: 50%;
                    background: #10b981;
                    animation: pulseRing 1.5s infinite ease-out;
                    left: 0;
                    top: 0;
                }
                .pulse-dot.closed { background: #ef4444; }
                
                @keyframes pulseRing {
                    0% { transform: scale(1); opacity: 0.8; }
                    100% { transform: scale(2.6); opacity: 0; }
                }

                .status-pill {
                    font-size: 0.68rem;
                    font-weight: 800;
                    text-transform: uppercase;
                    letter-spacing: 0.2px;
                }
                .status-pill.open { color: #059669; }
                .status-pill.closed { color: #dc2626; }

                /* 3. Payment Distribution Donut Graph Split */
                .donut-chart-container {
                    display: flex;
                    flex-direction: row;
                    align-items: center;
                    justify-content: space-between;
                    gap: 20px;
                    margin-top: 4px;
                }
                .donut-graphic-wrapper {
                    position: relative;
                    width: 110px;
                    height: 110px;
                    flex-shrink: 0;
                }
                .donut-center-meta {
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    text-align: center;
                    pointer-events: none;
                    display: flex;
                    flex-direction: column;
                }
                .center-value {
                    font-size: 1.3rem;
                    font-weight: 900;
                    color: #0f172a;
                    line-height: 1;
                }
                .center-label {
                    font-size: 0.55rem;
                    font-weight: 750;
                    color: #64748b;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    margin-top: 1px;
                }

                .donut-slice-arc {
                    transition: stroke-width 0.25s cubic-bezier(0.4, 0, 0.2, 1), filter 0.25s ease;
                }
                .donut-slice-arc:hover {
                    stroke-width: 13;
                }
                .donut-slice-arc.highlighted {
                    stroke-width: 13;
                    filter: drop-shadow(0 3px 6px rgba(0,0,0,0.08));
                }

                .donut-legend {
                    flex-grow: 1;
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                }
                .legend-item {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    padding: 8px 10px;
                    border-radius: 10px;
                    background: rgba(248, 250, 252, 0.65);
                    border: 1px solid #f1f5f9;
                    transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
                }
                .legend-item:hover, .legend-item.active {
                    background: white;
                    transform: translateX(3px);
                    box-shadow: 0 8px 16px -6px rgba(99, 102, 241, 0.05);
                    border-color: rgba(99, 102, 241, 0.15);
                }
                .legend-indicator {
                    width: 6px;
                    height: 6px;
                    border-radius: 50%;
                    flex-shrink: 0;
                }
                .legend-meta {
                    flex-grow: 1;
                }
                .legend-title-row {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
                .legend-name {
                    font-size: 0.74rem;
                    font-weight: 750;
                    color: #1e293b;
                }
                .legend-percentage {
                    font-size: 0.76rem;
                    font-weight: 850;
                    color: #0f172a;
                }
                
                .legend-progress-bar-bg {
                    width: 100%;
                    height: 4px;
                    background: #f1f5f9;
                    border-radius: 3px;
                    margin: 4px 0;
                    overflow: hidden;
                }
                .legend-progress-bar-fill {
                    height: 100%;
                    border-radius: 3px;
                    transition: width 0.8s cubic-bezier(0.16, 1, 0.3, 1);
                }
                
                .legend-desc {
                    font-size: 0.62rem;
                    font-weight: 500;
                    color: #64748b;
                }

                /* 4. Live activity feed list styling */
                .activity-filter-bar {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    overflow-x: auto;
                    padding-bottom: 4px;
                }
                .activity-filter-pill {
                    background: #f1f5f9;
                    border: 1px solid #e2e8f0;
                    padding: 3px 8px;
                    border-radius: 20px;
                    font-size: 0.65rem;
                    font-weight: 750;
                    color: #475569;
                    cursor: pointer;
                    text-transform: capitalize;
                    transition: all 0.2s ease;
                }
                .activity-filter-pill:hover {
                    background: #e2e8f0;
                    color: #0f172a;
                }
                .activity-filter-pill.active {
                    background: var(--primary-red);
                    color: white;
                    border-color: var(--primary-red);
                }

                .activity-timeline-feed {
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                    margin-top: 4px;
                    max-height: 275px;
                    overflow-y: auto;
                    padding-right: 2px;
                }
                .activity-timeline-feed::-webkit-scrollbar {
                    width: 4px;
                }
                .activity-timeline-feed::-webkit-scrollbar-thumb {
                    background: rgba(0,0,0,0.06);
                    border-radius: 2px;
                }

                .activity-item {
                    display: flex;
                    gap: 12px;
                }
                .activity-item.clickable {
                    cursor: pointer;
                }
                .activity-icon-column {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                }
                
                .activity-icon-bubble {
                    width: 26px;
                    height: 26px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 2;
                    transition: transform 0.3s ease;
                }
                .activity-item:hover .activity-icon-bubble {
                    transform: scale(1.08);
                }
                
                .activity-icon-bubble.served {
                    background: hsla(142, 70%, 95%, 0.9);
                    border: 1px solid hsla(142, 70%, 80%, 0.6);
                    color: hsl(142, 70%, 40%);
                }
                .activity-icon-bubble.preparing {
                    background: hsla(339, 90%, 96%, 0.9);
                    border: 1px solid hsla(339, 90%, 85%, 0.6);
                    color: hsl(339, 90%, 55%);
                }
                .activity-icon-bubble.serving {
                    background: hsla(214, 90%, 95%, 0.9);
                    border: 1px solid hsla(214, 90%, 85%, 0.6);
                    color: hsl(214, 90%, 50%);
                }
                .activity-icon-bubble.pending {
                    background: hsla(38, 90%, 95%, 0.9);
                    border: 1px solid hsla(38, 90%, 85%, 0.6);
                    color: hsl(38, 90%, 46%);
                }

                .timeline-bar {
                    flex-grow: 1;
                    width: 2px;
                    background: #f1f5f9;
                    margin-top: 4px;
                }
                .activity-item:last-child .timeline-bar {
                    display: none;
                }

                .activity-body {
                    flex-grow: 1;
                    background: rgba(248, 250, 252, 0.45);
                    border: 1px solid #f1f5f9;
                    border-radius: 14px;
                    padding: 8px 12px;
                    transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
                }
                .activity-item:hover .activity-body {
                    background: white;
                    box-shadow: 0 6px 12px -4px rgba(0, 0, 0, 0.03);
                    border-color: #e2e8f0;
                    transform: translateX(2px);
                }

                .activity-body.border-served { border-left: 3.5px solid hsl(142, 70%, 45%); }
                .activity-body.border-preparing { border-left: 3.5px solid hsl(339, 90%, 55%); }
                .activity-body.border-serving { border-left: 3.5px solid hsl(214, 90%, 50%); }
                .activity-body.border-pending { border-left: 3.5px solid hsl(38, 90%, 50%); }

                .activity-title-row {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    margin-bottom: 2px;
                }
                .activity-title-row h5 {
                    font-size: 0.8rem;
                    font-weight: 800;
                    color: #0f172a;
                }
                .activity-time-stamp {
                    font-size: 0.65rem;
                    color: #94a3b8;
                    font-weight: 600;
                }
                .activity-description {
                    font-size: 0.72rem;
                    color: #475569;
                    line-height: 1.35;
                }

                .activity-footer-tags {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    margin-top: 6px;
                }
                .badge-meta {
                    font-size: 0.6rem;
                    font-weight: 750;
                    padding: 1px 5px;
                    border-radius: 5px;
                    border: 1px solid transparent;
                }
                .badge-meta.order-num {
                    background: #f1f5f9;
                    color: #475569;
                    font-family: monospace;
                    border-color: #e2e8f0;
                }
                .badge-meta.pay-method { text-transform: uppercase; }
                .badge-meta.pay-method.cash { background: hsla(142, 70%, 95%, 0.8); color: hsl(142, 75%, 30%); border-color: hsla(142, 70%, 85%, 0.4); }
                .badge-meta.pay-method.gcash { background: hsla(214, 90%, 96%, 0.8); color: hsl(214, 85%, 35%); border-color: hsla(214, 90%, 88%, 0.4); }
                .badge-meta.pay-method.maya { background: hsla(175, 85%, 95%, 0.8); color: hsl(175, 85%, 28%); border-color: hsla(175, 85%, 85%, 0.4); }
                
                .badge-meta.order-status { text-transform: uppercase; }
                .badge-meta.order-status.served { background: hsla(142, 70%, 95%, 0.8); color: hsl(142, 75%, 30%); border-color: hsla(142, 70%, 85%, 0.4); }
                .badge-meta.order-status.pending { background: hsla(38, 90%, 96%, 0.8); color: hsl(38, 90%, 38%); border-color: hsla(38, 90%, 88%, 0.4); }
                .badge-meta.order-status.preparing { background: hsla(339, 90%, 96%, 0.8); color: hsl(339, 90%, 50%); border-color: hsla(339, 90%, 88%, 0.4); }
                .badge-meta.order-status.serving { background: hsla(214, 90%, 96%, 0.8); color: hsl(214, 90%, 45%); border-color: hsla(214, 90%, 88%, 0.4); }

                .timeline-empty {
                    text-align: center;
                    padding: 24px 10px;
                    color: #94a3b8;
                }
                .empty-icon { font-size: 1.8rem; display: block; margin-bottom: 4px; }
                .timeline-empty p { font-size: 0.72rem; }

                /* 5. Simulated system health panel styles */
                .diagnostics-action-btn {
                    background: hsl(245, 85%, 65%);
                    border: none;
                    color: white;
                    padding: 5px 12px;
                    font-size: 0.7rem;
                    font-weight: 750;
                    border-radius: 8px;
                    cursor: pointer;
                    transition: all 0.2s ease;
                }
                .diagnostics-action-btn:hover { background: hsl(245, 85%, 60%); }
                .diagnostics-action-btn.running { background: hsl(245, 50%, 65%); cursor: not-allowed; }
                
                .diagnostics-panel {
                    display: flex;
                    flex-direction: column;
                    gap: 10px;
                    margin-top: 4px;
                }
                .diagnostic-meter {
                    display: flex;
                    flex-direction: column;
                    gap: 3px;
                    padding-bottom: 6px;
                    border-bottom: 1px solid #f1f5f9;
                }
                .diagnostic-meter:last-child {
                    border-bottom: none;
                    padding-bottom: 0;
                }
                .meter-label {
                    font-size: 0.68rem;
                    font-weight: 700;
                    color: #64748b;
                }
                .meter-value-wrap {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
                .meter-value {
                    font-size: 0.78rem;
                    font-weight: 850;
                    color: #1e293b;
                }
                .meter-value.good { color: #10b981; }
                .meter-value.warn { color: #f59e0b; }
                .meter-value.text-indigo { color: hsl(245, 85%, 65%); }
                .meter-status {
                    font-size: 0.62rem;
                    font-weight: 850;
                    color: #10b981;
                    text-transform: uppercase;
                }
                .meter-line-bar {
                    width: 100%;
                    height: 4px;
                    background: #e2e8f0;
                    border-radius: 3px;
                    overflow: hidden;
                    margin-top: 1px;
                }
                .meter-line-fill {
                    height: 100%;
                    background: hsl(245, 85%, 65%);
                    border-radius: 3px;
                    transition: width 0.6s ease;
                }

                /* 6. High-fidelity glassmorphic modal screen */
                .glass-modal-backdrop {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(15, 23, 42, 0.45);
                    backdrop-filter: blur(8px);
                    z-index: 2000;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 20px;
                    animation: backdropFadeIn 0.3s ease;
                }
                
                @keyframes backdropFadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }

                .glass-modal-container {
                    background: rgba(255, 255, 255, 0.85);
                    backdrop-filter: blur(25px);
                    -webkit-backdrop-filter: blur(25px);
                    border: 1px solid rgba(255, 255, 255, 0.65);
                    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.15), 0 0 40px rgba(99, 102, 241, 0.05);
                    border-radius: 24px;
                    width: 100%;
                    max-width: 480px;
                    overflow: hidden;
                    position: relative;
                }
                
                .animate-scale-up {
                    animation: scaleUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) both;
                }
                @keyframes scaleUp {
                    from { transform: scale(0.95); opacity: 0; }
                    to { transform: scale(1); opacity: 1; }
                }

                .modal-header {
                    padding: 16px 20px;
                    border-bottom: 1px solid rgba(0, 0, 0, 0.05);
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
                .modal-header-title {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }
                .modal-header-title h3 {
                    font-size: 0.95rem;
                    font-weight: 900;
                    color: #0f172a;
                }
                .status-badge-inline {
                    font-size: 0.6rem;
                    font-weight: 850;
                    text-transform: uppercase;
                    padding: 2px 6px;
                    border-radius: 20px;
                }
                .status-badge-inline.served { background: hsla(142, 70%, 95%, 0.8); color: hsl(142, 75%, 30%); }
                .status-badge-inline.preparing { background: hsla(339, 90%, 96%, 0.8); color: hsl(339, 90%, 50%); }
                .status-badge-inline.serving { background: hsla(214, 90%, 96%, 0.8); color: hsl(214, 90%, 45%); }
                .status-badge-inline.pending { background: hsla(38, 90%, 96%, 0.8); color: hsl(38, 90%, 38%); }

                .modal-close-btn {
                    background: transparent;
                    border: none;
                    font-size: 20px;
                    font-weight: 600;
                    color: #64748b;
                    cursor: pointer;
                }
                .modal-close-btn:hover { color: #0f172a; }

                .modal-body {
                    padding: 20px;
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                }
                
                .invoice-meta-section {
                    display: flex;
                    justify-content: space-between;
                    background: rgba(241, 245, 249, 0.5);
                    border: 1px solid rgba(226, 232, 240, 0.8);
                    padding: 10px 14px;
                    border-radius: 16px;
                }
                .invoice-meta-column {
                    display: flex;
                    flex-direction: column;
                }
                .invoice-meta-column.align-end {
                    align-items: flex-end;
                }
                .meta-label { font-size: 0.6rem; font-weight: 750; color: #64748b; text-transform: uppercase; }
                .meta-value { font-size: 0.84rem; font-weight: 900; color: #0f172a; margin-top: 1px; }
                .meta-sub { font-size: 0.64rem; font-weight: 500; color: #94a3b8; }
                .text-indigo { color: hsl(245, 85%, 65%) !important; }

                .invoice-items-box {
                    background: white;
                    border: 1px solid #e2e8f0;
                    border-radius: 16px;
                    padding: 14px;
                    box-shadow: inset 0 2px 4px rgba(0,0,0,0.01);
                }
                .items-title {
                    font-size: 0.68rem;
                    font-weight: 850;
                    text-transform: uppercase;
                    color: #475569;
                    letter-spacing: 0.3px;
                    margin-bottom: 10px;
                }
                .invoice-item-row {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    font-size: 0.76rem;
                    margin-bottom: 6px;
                    color: #334155;
                }
                .item-details { display: flex; gap: 6px; }
                .item-quantity { font-weight: 800; color: hsl(245, 85%, 65%); }
                .item-name { font-weight: 600; }
                .item-price { font-weight: 750; color: #0f172a; }

                .invoice-divider {
                    height: 1px;
                    background: #e2e8f0;
                    margin: 10px 0 8px 0;
                    border-style: dashed;
                }
                
                .invoice-total-row {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    font-size: 0.78rem;
                    font-weight: 850;
                    color: #0f172a;
                }
                .total-amount { font-size: 0.95rem; color: hsl(245, 85%, 60%); }

                .invoice-progress-deck {
                    display: flex;
                    flex-direction: column;
                }
                .progress-timeline-steps {
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                    margin-top: 6px;
                    padding-left: 10px;
                }
                .progress-step-item {
                    display: flex;
                    gap: 12px;
                    position: relative;
                }
                .progress-step-item::after {
                    content: '';
                    position: absolute;
                    left: 4.5px;
                    top: 12px;
                    bottom: -15px;
                    width: 2px;
                    background: #e2e8f0;
                }
                .progress-step-item:last-child::after { display: none; }
                .progress-step-item.active::after { background: hsl(245, 85%, 65%); }

                .step-marker {
                    width: 11px;
                    height: 11px;
                    border-radius: 50%;
                    background: #e2e8f0;
                    border: 2px solid white;
                    margin-top: 3.5px;
                    z-index: 2;
                }
                .progress-step-item.active .step-marker {
                    background: hsl(245, 85%, 65%);
                    box-shadow: 0 0 6px hsla(245, 85%, 65%, 0.4);
                }
                .step-info { display: flex; flex-direction: column; }
                .step-info h6 { font-size: 0.74rem; font-weight: 800; color: #475569; }
                .progress-step-item.active .step-info h6 { color: #0f172a; }
                .step-info p { font-size: 0.62rem; color: #94a3b8; font-weight: 500; }

                .modal-footer {
                    padding: 12px 20px;
                    border-top: 1px solid rgba(0, 0, 0, 0.05);
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
                .payment-receipt-badge {
                    font-size: 0.7rem;
                    color: #475569;
                }
                .modal-btn-action {
                    background: hsl(245, 85%, 65%);
                    border: none;
                    color: white;
                    padding: 8px 16px;
                    font-size: 0.76rem;
                    font-weight: 800;
                    border-radius: 10px;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                .modal-btn-action:hover { background: hsl(245, 85%, 60%); }

                /* Responsiveness boundaries */
                @media (max-width: 1150px) {
                    .kpi-grid {
                        grid-template-cols: repeat(2, 1fr);
                    }
                    .analytics-section-grid {
                        grid-template-cols: 1fr;
                    }
                    .admin-dashboard-container::before {
                        width: 250px;
                        height: 250px;
                    }
                }
                @media (max-width: 600px) {
                    .kpi-grid {
                        grid-template-cols: 1fr;
                    }
                    .donut-chart-container {
                        flex-direction: column;
                        align-items: center;
                        gap: 16px;
                    }
                    .donut-legend {
                        width: 100%;
                    }
                    .dashboard-hero-banner {
                        flex-direction: column;
                        align-items: flex-start;
                        padding: 20px;
                    }
                    .hero-action-panel {
                        width: 100%;
                        flex-wrap: wrap;
                    }
                    .stall-search-input-wrap {
                        width: 100%;
                    }
                }
            `}} />
        </AdminLayout>
    );
}
