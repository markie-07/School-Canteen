import React, { useState } from 'react';
import { Link, usePage } from '@inertiajs/react';

export default function VendorSidebar({ isMobileOpen, user }) {
    const { url } = usePage();
    const [isOrdersDropdownOpen, setIsOrdersDropdownOpen] = useState(url.startsWith('/vendor/orders'));

    const navigation = [
        { type: 'header', name: 'Operations' },
        { name: 'Dashboard', href: '/vendor/dashboard', icon: '🏠' },
        { 
            name: 'Active Orders', 
            icon: '📋',
            isDropdown: true,
            isOpen: isOrdersDropdownOpen,
            toggle: () => setIsOrdersDropdownOpen(!isOrdersDropdownOpen),
            children: [
                { name: 'New Orders', href: '/vendor/orders/new', icon: '📥' },
                { name: 'Preparing', href: '/vendor/orders/preparing', icon: '🍳' },
                { name: 'Serving', href: '/vendor/orders/serving', icon: '🍽️' },
                { name: 'Served', href: '/vendor/orders/served', icon: '✅' },
            ]
        },
        { type: 'header', name: 'Storefront' },
        { name: 'Menu Items', href: '/vendor/menu', icon: '🍕' },
        { name: 'Inventory', href: '/vendor/inventory', icon: '📦' },
        { name: 'Sales Reports', href: '/vendor/reports/sales', icon: '📈' },
        { name: 'Customers', href: '/vendor/customers', icon: '👥' },
        { name: 'Procurement Report', href: '/vendor/reports/procurement', icon: '📜' },
        { name: 'Customer Reviews', href: '/vendor/reviews', icon: '⭐' },
        { name: 'Store Profile', href: '/vendor/profile', icon: '👤' },
    ];

    const isActive = (href) => {
        return url === href || url.startsWith(href + '/');
    };

    return (
        <aside className={`sidebar ${isMobileOpen ? 'open' : ''}`}>
            <div className="sidebar-header">
                <div className="logo-container">
                    <span className="logo-icon">👨‍🍳</span>
                    <h1 className="logo-text">School<span>Canteen</span></h1>
                </div>
            </div>

            <nav className="sidebar-nav">
                {navigation.map((item, index) => (
                    item.type === 'header' ? (
                        <div key={index} className="nav-section-header">{item.name}</div>
                    ) : item.isDropdown ? (
                        <div key={index} className="dropdown-container">
                            <button 
                                onClick={item.toggle}
                                className={`nav-item dropdown-toggle ${isActive('/vendor/orders') ? 'active' : ''}`}
                            >
                                <span className="icon">{item.icon}</span>
                                <span className="nav-text">{item.name}</span>
                                <span className={`arrow ${item.isOpen ? 'open' : ''}`}>⌄</span>
                            </button>
                            {item.isOpen && (
                                <div className="dropdown-menu">
                                    {item.children.map((child) => (
                                        <Link 
                                            key={child.name}
                                            href={child.href} 
                                            className={`dropdown-item ${isActive(child.href) ? 'active' : ''}`}
                                        >
                                            <span className="icon">{child.icon}</span>
                                            <span className="nav-text">{child.name}</span>
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </div>
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
                        <div className="user-avatar">{(user.store_name || user.name).charAt(0)}</div>
                        <div className="status-indicator"></div>
                    </div>
                    <div className="user-details">
                        <p className="user-name">{user.store_name || user.name}</p>
                        <p className="user-role">{user.stall_number ? `Stall ${user.stall_number}` : 'Vendor Partner'}</p>
                    </div>
                </div>
                <Link href={route('logout')} method="post" as="button" className="logout-btn">
                    <span className="logout-icon">🚪</span> Sign Out
                </Link>
            </div>
        </aside>
    );
}
