import React, { useState } from 'react';
import { usePage } from '@inertiajs/react';
import AdminSidebar from '@/Components/AdminSidebar';
import './CanteenLayout.css';

export default function AdminLayout({ header, children }) {
    const { props } = usePage();
    const user = props.auth.user;
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    return (
        <div className="canteen-app theme-admin">
            <AdminSidebar 
                isMobileOpen={isMobileMenuOpen} 
                user={user} 
            />

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
                            <span className="badge">12</span>
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
