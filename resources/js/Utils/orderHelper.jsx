import React from 'react';

/**
 * VendorOrderItemsList - Formats and displays customer order items.
 * If there are notes, they are highlighted in an eye-catching alert box to prevent misreading.
 * 
 * @param {string} itemsString - The flat string containing items and notes (e.g. "1x Burger (no onions), 1x Fries")
 * @param {boolean} compact - Set to true for compact table layouts
 */
export function VendorOrderItemsList({ itemsString, compact = false }) {
    if (!itemsString) return null;

    // Split by commas that are NOT inside parentheses
    const items = itemsString.split(/,\s*(?![^(]*\))/);

    if (compact) {
        return (
            <div className="vendor-order-items-list compact" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {items.map((itemStr, idx) => {
                    const trimmed = itemStr.trim();
                    if (!trimmed) return null;

                    const match = trimmed.match(/^(.*?)\s*\((.*?)\)\s*$/);
                    
                    if (match) {
                        const itemName = match[1];
                        const itemNote = match[2];
                        
                        return (
                            <div key={idx} style={{ fontSize: '0.8rem', color: '#1e293b', lineHeight: '1.4' }}>
                                <span style={{ fontWeight: '700' }}>{itemName}</span>
                                <span style={{
                                    marginLeft: '6px',
                                    fontSize: '0.72rem',
                                    color: '#b45309',
                                    background: '#fffbeb',
                                    padding: '2px 6px',
                                    borderRadius: '4px',
                                    border: '1px solid #fde68a',
                                    display: 'inline-block',
                                    fontWeight: '700',
                                    fontStyle: 'italic'
                                }}>
                                    📝 {itemNote}
                                </span>
                            </div>
                        );
                    }

                    return (
                        <div key={idx} style={{ fontSize: '0.8rem', color: '#334155', fontWeight: '600' }}>
                            {trimmed}
                        </div>
                    );
                })}
            </div>
        );
    }

    return (
        <div className="vendor-order-items-list" style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '12px', marginBottom: '12px' }}>
            {items.map((itemStr, idx) => {
                const trimmed = itemStr.trim();
                if (!trimmed) return null;

                const match = trimmed.match(/^(.*?)\s*\((.*?)\)\s*$/);
                
                if (match) {
                    const itemName = match[1];
                    const itemNote = match[2];
                    
                    return (
                        <div key={idx} className="vendor-item-block" style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'flex-start',
                            background: '#f8fafc',
                            border: '1.5px solid #e2e8f0',
                            padding: '10px 14px',
                            borderRadius: '12px',
                            gap: '6px'
                        }}>
                            <span className="vendor-item-name" style={{ fontWeight: '800', color: '#0f172a', fontSize: '0.94rem' }}>
                                {itemName}
                            </span>
                            <div className="vendor-item-note" style={{
                                fontSize: '0.82rem',
                                color: '#b45309',
                                background: '#fffbeb',
                                borderLeft: '4px solid #f59e0b',
                                padding: '6px 12px',
                                borderRadius: '6px',
                                fontWeight: '700',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '6px',
                                width: '100%',
                                boxSizing: 'border-box'
                            }}>
                                ⚠️ Note: "{itemNote}"
                            </div>
                        </div>
                    );
                }

                return (
                    <div key={idx} className="vendor-item-block" style={{
                        background: '#f8fafc',
                        border: '1.5px solid #e2e8f0',
                        padding: '10px 14px',
                        borderRadius: '12px',
                        display: 'flex',
                        alignItems: 'center'
                    }}>
                        <span className="vendor-item-name" style={{ fontWeight: '800', color: '#334155', fontSize: '0.94rem' }}>
                            {trimmed}
                        </span>
                    </div>
                );
            })}
        </div>
    );
}
