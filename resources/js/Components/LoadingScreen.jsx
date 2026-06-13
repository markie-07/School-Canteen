import React from 'react';

export default function LoadingScreen() {
    return (
        <div className="loading-overlay">
            <div className="loading-content">
                <div className="loading-logo">
                    <span className="logo-icon">🍎</span>
                    <h2>School Canteen</h2>
                </div>
                <div className="loading-bar">
                    <div className="loading-progress"></div>
                </div>
                <p className="loading-text">Preparing your experience...</p>
            </div>

            <style dangerouslySetInnerHTML={{ __html: `
                .loading-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100vw;
                    height: 100vh;
                    background: #ffffff;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 99999;
                    animation: fadeIn 0.3s ease-out;
                }
                .loading-content {
                    text-align: center;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 20px;
                }
                .loading-logo {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 10px;
                }
                .logo-icon {
                    font-size: 3.5rem;
                    animation: bounce 2s infinite ease-in-out;
                }
                .loading-logo h2 {
                    font-size: 1.8rem;
                    font-weight: 900;
                    color: #333;
                    letter-spacing: -1px;
                    margin: 0;
                }
                .loading-bar {
                    width: 240px;
                    height: 6px;
                    background: #f0f0f0;
                    border-radius: 10px;
                    overflow: hidden;
                    position: relative;
                }
                .loading-progress {
                    position: absolute;
                    width: 60%;
                    height: 100%;
                    background: linear-gradient(90deg, #ff4757, #ff6b81);
                    border-radius: 10px;
                    animation: progressMove 1.8s infinite ease-in-out;
                }
                .loading-text {
                    color: #aaa;
                    font-size: 1rem;
                    font-weight: 600;
                    letter-spacing: 1px;
                    text-transform: uppercase;
                }

                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes bounce {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-15px); }
                }
                @keyframes progressMove {
                    0% { transform: translateX(-100%); width: 30%; }
                    50% { width: 60%; }
                    100% { transform: translateX(250%); width: 30%; }
                }
            `}} />
        </div>
    );
}
