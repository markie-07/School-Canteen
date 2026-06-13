import React, { useState } from 'react';
import { Link, usePage } from '@inertiajs/react';
import './CanteenLayout.css';

export default function CanteenLayout({ user, header, children }) {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const { url } = usePage();

    // Define navigation items for each role
    const navigation = {
        admin: [
            { name: 'Dashboard', href: '/admin/dashboard', icon: '📊' },
            { name: 'User Management', href: '/admin/users', icon: '👥' },
            { name: 'Vendor Management', href: '/admin/vendors', icon: '🏪' },
            { name: 'Menu Categories', href: '/admin/categories', icon: '📂' },
            { name: 'System Settings', href: '/admin/settings', icon: '⚙️' },
        ],
        vendor: [
            { name: 'Dashboard', href: '/vendor/dashboard', icon: '🏠' },
            { name: 'Menu Items', href: '/vendor/menu', icon: '🍕' },
            { name: 'Active Orders', href: '/vendor/orders', icon: '📋' },
            { name: 'Sales Reports', href: '/vendor/reports', icon: '📈' },
            { name: 'Profile Settings', href: '/vendor/profile', icon: '👤' },
        ],
        user: [
            { name: 'Home', href: '/dashboard', icon: '🏠' },
            { name: 'Order Food', href: '/user/order', icon: '🍔' },
            { name: 'My Orders', href: '/user/history', icon: '📜' },
            { name: 'My Wallet', href: '/user/wallet', icon: '💳' },
            { name: 'Profile', href: '/profile', icon: '👤' },
        ]
    };

    // Fallback to empty array if role is not found
    const menuItems = navigation[user.role] || [];

    const isActive = (href) => {
        return url === href || url.startsWith(href + '/');
    };

    return (
        <div className="canteen-app">
            {/* Sidebar Navigation */}
            <aside className={`sidebar ${isMobileMenuOpen ? 'open' : ''}`}>
                <div className="sidebar-header">
                    <div className="logo-container">
                        <span className="logo-icon">🥗</span>
                        <h1 className="logo-text">School<span>Canteen</span></h1>
                    </div>
                </div>

                <nav className="sidebar-nav">
                    {menuItems.map((item) => (
                        <Link 
                            key={item.name}
                            href={item.href} 
                            className={`nav-item ${isActive(item.href) ? 'active' : ''}`}
                        >
                            <span className="icon">{item.icon}</span>
                            <span className="nav-text">{item.name}</span>
                        </Link>
                    ))}
                </nav>

                <div className="sidebar-footer">
                    <div className="user-profile-card">
                        <div className="user-avatar-wrapper">
                            <div className="user-avatar">{user.name.charAt(0)}</div>
                            <div className="status-indicator"></div>
                        </div>
                        <div className="user-details">
                            <p className="user-name">{user.name}</p>
                            <p className="user-role">{user.role.charAt(0).toUpperCase() + user.role.slice(1)}</p>
                        </div>
                    </div>
                    <Link href={route('logout')} method="post" as="button" className="logout-btn">
                        <span className="logout-icon">🚪</span> Sign Out
                    </Link>
                </div>
            </aside>

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
                            <span className="badge">3</span>
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
        </div>
    );
}
