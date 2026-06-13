import React from 'react';
import { Link, usePage } from '@inertiajs/react';

export default function UserSidebar({ isMobileOpen, user }) {
    const { url } = usePage();

    const navigation = [
        { type: 'header', name: 'Main' },
        { name: 'Order Food', route: 'user.order', icon: '🍔' },
        { type: 'header', name: 'Personal' },
        { name: 'My Orders', route: 'user.orders', icon: '📜' },
        { name: 'Profile', route: 'user.profile', icon: '👤' },
    ];

    const isCurrent = (item) => {
        if (item.route) return route().current(item.route);
        if (item.href) return url === item.href;
        return false;
    };

    return (
        <aside className={`sidebar ${isMobileOpen ? 'open' : ''}`}>
            <div className="sidebar-header">
                <div className="logo-container">
                    <span className="logo-icon">🥗</span>
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
                            href={item.route ? route(item.route) : item.href} 
                            className={`nav-item ${isCurrent(item) ? 'active' : ''}`}
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
                        <div className="user-avatar" style={{ overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            {user.profile_image ? (
                                <img src={user.profile_image} alt={user.name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
                            ) : (
                                user.name.charAt(0)
                            )}
                        </div>
                        <div className="status-indicator"></div>
                    </div>
                    <div className="user-details">
                        <p className="user-name">{user.name}</p>
                        <p className="user-role">Student</p>
                    </div>
                </div>
                <Link href={route('logout')} method="post" as="button" className="logout-btn">
                    <span className="logout-icon">🚪</span> Sign Out
                </Link>
            </div>
        </aside>
    );
}
