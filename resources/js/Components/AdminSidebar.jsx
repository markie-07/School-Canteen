import React from 'react';
import { Link, usePage } from '@inertiajs/react';

export default function AdminSidebar({ isMobileOpen, user }) {
    const { url } = usePage();

    const navigation = [
        { type: 'header', name: 'Management' },
        { name: 'Dashboard', href: '/admin/dashboard', icon: '📊' },
        { name: 'User Management', href: '/admin/users', icon: '👥' },
        { name: 'Vendor Management', href: '/admin/vendors', icon: '🏪' },
        { type: 'header', name: 'System' },
        { name: 'Menu Categories', href: '/admin/categories', icon: '📂' },
        { name: 'System Settings', href: '/admin/settings', icon: '⚙️' },
    ];

    const isActive = (href) => {
        return url === href || url.startsWith(href + '/');
    };

    return (
        <aside className={`sidebar ${isMobileOpen ? 'open' : ''}`}>
            <div className="sidebar-header">
                <div className="logo-container">
                    <span className="logo-icon">🏢</span>
                    <h1 className="logo-text">School<span>Canteen</span></h1>
                </div>
            </div>

            <nav className="sidebar-nav">
                {navigation.map((item, index) => (
                    item.type === 'header' ? (
                        <div key={index} className="nav-section-header">{item.name}</div>
                    ) : (
                        <Link 
                            key={item.name}
                            href={item.href} 
                            className={`nav-item ${isActive(item.href) ? 'active' : ''}`}
                        >
                            <span className="icon">{item.icon}</span>
                            <span className="nav-text">{item.name}</span>
                        </Link>
                    )
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
                        <p className="user-role">Administrator</p>
                    </div>
                </div>
                <Link href={route('logout')} method="post" as="button" className="logout-btn">
                    <span className="logout-icon">🚪</span> Sign Out
                </Link>
            </div>
        </aside>
    );
}
