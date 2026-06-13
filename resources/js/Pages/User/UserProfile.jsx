import UserLayout from '@/Layouts/UserLayout';
import { Head, useForm, router } from '@inertiajs/react';
import React, { useState, useRef } from 'react';

export default function UserProfile({ auth, status }) {
    const { user } = auth;

    const [isEditingPassword, setIsEditingPassword] = useState(false);
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const imageInputRef = useRef(null);
    const [imageSuccess, setImageSuccess] = useState(false);
    const [imageError, setImageError] = useState(null);
    const [isUploading, setIsUploading] = useState(false);

    // Form for password update
    const {
        data: passwordData,
        setData: setPasswordData,
        put: putPassword,
        processing: passwordProcessing,
        errors: passwordErrors,
        reset: resetPasswordForm,
        recentlySuccessful: passwordSuccess,
    } = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    const handlePasswordSubmit = (e) => {
        e.preventDefault();
        putPassword(route('password.update'), {
            preserveScroll: true,
            onSuccess: () => {
                resetPasswordForm();
                setIsEditingPassword(false);
                setShowCurrentPassword(false);
                setShowNewPassword(false);
                setShowConfirmPassword(false);
            },
        });
    };

    const handleImageClick = () => {
        if (imageInputRef.current) {
            imageInputRef.current.click();
        }
    };

    const handleImageFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Basic client-side validation
        if (!file.type.startsWith('image/')) {
            setImageError('Please select a valid image file.');
            return;
        }
        if (file.size > 2 * 1024 * 1024) { // 2MB limit
            setImageError('Image file size must be less than 2MB.');
            return;
        }

        setImageError(null);
        setIsUploading(true);

        const reader = new FileReader();
        reader.onloadend = () => {
            router.patch(route('user.profile.update'), {
                profile_image: reader.result
            }, {
                preserveScroll: true,
                onSuccess: () => {
                    setIsUploading(false);
                    setImageSuccess(true);
                    setTimeout(() => {
                        setImageSuccess(false);
                    }, 3000);
                },
                onError: (errors) => {
                    setIsUploading(false);
                    setImageError(errors.profile_image || 'Failed to upload profile image.');
                }
            });
        };
        reader.onerror = () => {
            setIsUploading(false);
            setImageError('Failed to read image file.');
        };
        reader.readAsDataURL(file);
    };

    return (
        <UserLayout header={<h2>My Profile</h2>}>
            <Head title="My Profile" />

            <div className="profile-page-container">
                {/* Banner Status Alerts */}
                {passwordSuccess && (
                    <div className="alert-banner success animate-fade-in">
                        <span className="icon">🔑</span>
                        <p>Your password was updated successfully!</p>
                    </div>
                )}

                {imageSuccess && (
                    <div className="alert-banner success animate-fade-in">
                        <span className="icon">📸</span>
                        <p>Your profile image was updated successfully!</p>
                    </div>
                )}

                {imageError && (
                    <div className="alert-banner error animate-fade-in">
                        <span className="icon">⚠️</span>
                        <p>{imageError}</p>
                    </div>
                )}

                <div className="profile-grid">
                    {/* Left Column - Card & Statistics */}
                    <div className="profile-left-col">
                        <div className="profile-avatar-card">
                            <div className="card-gradient-bg"></div>
                            <div className="avatar-section">
                                <div 
                                    className="avatar-container" 
                                    style={{ cursor: 'pointer', position: 'relative' }}
                                    onClick={handleImageClick}
                                    title="Click to change profile picture"
                                >
                                    <div className="avatar-placeholder" style={{ overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 0 }}>
                                        {user.profile_image ? (
                                            <img src={user.profile_image} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        ) : (
                                            user.name ? user.name.charAt(0).toUpperCase() : 'S'
                                        )}
                                    </div>
                                    <div className="avatar-edit-overlay">
                                        ✏️ Edit
                                    </div>
                                    {isUploading && (
                                        <div className="avatar-uploading-overlay">
                                            <div className="spinner"></div>
                                        </div>
                                    )}
                                </div>
                                <input
                                    type="file"
                                    ref={imageInputRef}
                                    onChange={handleImageFileChange}
                                    accept="image/*"
                                    style={{ display: 'none' }}
                                />
                                <h3 className="profile-name">{user.name}</h3>
                                <span className="profile-badge">Student Member</span>
                            </div>
                            
                            <div className="profile-meta-list">
                                <div className="meta-item">
                                    <span className="label">Student ID Number</span>
                                    <span className="value" style={{ fontFamily: 'monospace', fontWeight: 800, color: 'var(--primary-red, #ff4d4d)' }}>{user.id_number || 'Not Set'}</span>
                                </div>
                                <div className="meta-item">
                                    <span className="label">Registered Email</span>
                                    <span className="value">{user.email}</span>
                                </div>
                                <div className="meta-item">
                                    <span className="label">Phone Number</span>
                                    <span className="value">{user.phone || 'Not specified'}</span>
                                </div>
                            </div>
                        </div>

                        {/* Quick Wallet Info */}
                        <div className="profile-wallet-card">
                            <div className="wallet-header">
                                <span className="icon">💳</span>
                                <h4>Canteen Balance</h4>
                            </div>
                            <div className="wallet-body">
                                <h2 className="wallet-balance">₱500.00</h2>
                                <p className="wallet-note">Standard Student Account</p>
                            </div>
                            <div className="wallet-footer">
                                <div className="stat-box">
                                    <span className="stat-val">3</span>
                                    <span className="stat-lbl">Orders Placed</span>
                                </div>
                                <div className="stat-box border-l">
                                    <span className="stat-val">Active</span>
                                    <span className="stat-lbl">Account Status</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Forms */}
                    <div className="profile-right-col">
                        {/* Profile Details Form Card */}
                        <div className="settings-card">
                            <div className="card-header">
                                <span className="icon">👤</span>
                                <div>
                                    <h3>Account Information</h3>
                                    <p>Your registered student profile details.</p>
                                </div>
                            </div>
                            
                            <div className="settings-form">
                                <div className="form-group">
                                    <label htmlFor="name">Full Name</label>
                                    <input
                                        id="name"
                                        type="text"
                                        className="form-input"
                                        value={user.name}
                                        readOnly
                                        disabled
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="id_number">Student ID Number</label>
                                    <input
                                        id="id_number"
                                        type="text"
                                        className="form-input"
                                        value={user.id_number || ''}
                                        placeholder="Not Set"
                                        readOnly
                                        disabled
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="email">Email Address</label>
                                    <input
                                        id="email"
                                        type="email"
                                        className="form-input"
                                        value={user.email}
                                        readOnly
                                        disabled
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="phone">Phone Number</label>
                                    <input
                                        id="phone"
                                        type="tel"
                                        className="form-input"
                                        value={user.phone || ''}
                                        placeholder="Not specified"
                                        readOnly
                                        disabled
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Password Settings Card */}
                        <div className="settings-card mt-8">
                            <div className="card-header">
                                <span className="icon">🔒</span>
                                <div>
                                    <h3>Security & Password</h3>
                                    <p>Ensure your account is using a secure, long password.</p>
                                </div>
                            </div>
                            
                            <form onSubmit={handlePasswordSubmit} className="settings-form">
                                {isEditingPassword ? (
                                    <>
                                        <div className="form-group animate-fade-in">
                                            <label htmlFor="current_password">Current Password</label>
                                            <div className="password-input-wrapper">
                                                <input
                                                    id="current_password"
                                                    type={showCurrentPassword ? "text" : "password"}
                                                    className={`form-input ${passwordErrors.current_password ? 'error' : ''}`}
                                                    value={passwordData.current_password}
                                                    onChange={(e) => setPasswordData('current_password', e.target.value)}
                                                    required
                                                />
                                                <button
                                                    type="button"
                                                    className="password-toggle-eye"
                                                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                                    tabIndex="-1"
                                                >
                                                    {showCurrentPassword ? '👁️' : '🙈'}
                                                </button>
                                            </div>
                                            {passwordErrors.current_password && <span className="form-error-msg">{passwordErrors.current_password}</span>}
                                        </div>

                                        <div className="form-group animate-fade-in">
                                            <label htmlFor="password">New Password</label>
                                            <div className="password-input-wrapper">
                                                <input
                                                    id="password"
                                                    type={showNewPassword ? "text" : "password"}
                                                    className={`form-input ${passwordErrors.password ? 'error' : ''}`}
                                                    value={passwordData.password}
                                                    onChange={(e) => setPasswordData('password', e.target.value)}
                                                    required
                                                />
                                                <button
                                                    type="button"
                                                    className="password-toggle-eye"
                                                    onClick={() => setShowNewPassword(!showNewPassword)}
                                                    tabIndex="-1"
                                                >
                                                    {showNewPassword ? '👁️' : '🙈'}
                                                </button>
                                            </div>
                                            {passwordErrors.password && <span className="form-error-msg">{passwordErrors.password}</span>}
                                        </div>

                                        <div className="form-group animate-fade-in">
                                            <label htmlFor="password_confirmation">Confirm Password</label>
                                            <div className="password-input-wrapper">
                                                <input
                                                    id="password_confirmation"
                                                    type={showConfirmPassword ? "text" : "password"}
                                                    className={`form-input ${passwordErrors.password_confirmation ? 'error' : ''}`}
                                                    value={passwordData.password_confirmation}
                                                    onChange={(e) => setPasswordData('password_confirmation', e.target.value)}
                                                    required
                                                />
                                                <button
                                                    type="button"
                                                    className="password-toggle-eye"
                                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                    tabIndex="-1"
                                                >
                                                    {showConfirmPassword ? '👁️' : '🙈'}
                                                </button>
                                            </div>
                                            {passwordErrors.password_confirmation && <span className="form-error-msg">{passwordErrors.password_confirmation}</span>}
                                        </div>
                                    </>
                                ) : (
                                    <div className="password-placeholder-state animate-fade-in">
                                        <span className="secure-badge">🛡️ Secure Connection Active</span>
                                        <p>Your password is encrypted. Click Change Password below to update it.</p>
                                    </div>
                                )}

                                <div className="form-actions" style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                                    {isEditingPassword ? (
                                        <>
                                            <button 
                                                type="button" 
                                                className="cancel-btn" 
                                                onClick={() => {
                                                    resetPasswordForm();
                                                    setIsEditingPassword(false);
                                                    setShowCurrentPassword(false);
                                                    setShowNewPassword(false);
                                                    setShowConfirmPassword(false);
                                                }}
                                                disabled={passwordProcessing}
                                            >
                                                Cancel
                                            </button>
                                            <button 
                                                type="submit" 
                                                className="save-btn" 
                                                disabled={passwordProcessing}
                                            >
                                                {passwordProcessing ? 'Saving...' : '💾 Save Password'}
                                            </button>
                                        </>
                                    ) : (
                                        <button 
                                            type="button" 
                                            className="edit-toggle-btn" 
                                            onClick={() => setIsEditingPassword(true)}
                                        >
                                            🔑 Change Password
                                        </button>
                                    )}
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>

            <style dangerouslySetInnerHTML={{ __html: `
                .profile-page-container {
                    max-width: 1100px;
                    margin: 0 auto;
                    padding: 10px 0 40px;
                }
                
                /* Alert Banners */
                .alert-banner {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 16px 20px;
                    border-radius: 16px;
                    margin-bottom: 25px;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.02);
                }
                .alert-banner.success {
                    background: #edfbf3;
                    border: 1px solid #cbf4dc;
                    color: #1e7e43;
                }
                .alert-banner.error {
                    background: #fff5f5;
                    border: 1px solid #fed7d7;
                    color: #c53030;
                }
                .alert-banner .icon {
                    font-size: 1.25rem;
                }
                .alert-banner p {
                    margin: 0;
                    font-weight: 700;
                    font-size: 0.95rem;
                }
                
                /* Grid System */
                .profile-grid {
                    display: grid;
                    grid-template-columns: 340px 1fr;
                    gap: 30px;
                }
                
                @media (max-width: 900px) {
                    .profile-grid {
                        grid-template-columns: 1fr;
                    }
                }
                
                /* Left Column Cards */
                .profile-avatar-card {
                    background: white;
                    border-radius: 24px;
                    border: 1px solid rgba(0,0,0,0.06);
                    overflow: hidden;
                    box-shadow: 0 10px 30px rgba(0,0,0,0.02);
                    margin-bottom: 25px;
                }
                .card-gradient-bg {
                    height: 100px;
                    background: linear-gradient(135deg, var(--primary-red, #ff4d4d) 0%, #ff8080 100%);
                }
                .avatar-section {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    margin-top: -50px;
                    padding: 0 24px 24px;
                    border-bottom: 1px solid #f1f3f5;
                }
                .avatar-container {
                    position: relative;
                    margin-bottom: 15px;
                    border-radius: 50%;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                }
                .avatar-container:hover {
                    transform: scale(1.04);
                }
                .avatar-placeholder {
                    width: 100px;
                    height: 100px;
                    border-radius: 50px;
                    background: #ffffff;
                    color: var(--primary-red, #ff4d4d);
                    font-size: 2.8rem;
                    font-weight: 900;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    box-shadow: 0 8px 24px rgba(0,0,0,0.08);
                    border: 4px solid #ffffff;
                    margin-bottom: 0;
                }
                .avatar-edit-overlay {
                    position: absolute;
                    inset: 4px;
                    border-radius: 50%;
                    background: rgba(0, 0, 0, 0.5);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    font-size: 0.78rem;
                    font-weight: 800;
                    opacity: 0;
                    transition: opacity 0.25s ease;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }
                .avatar-container:hover .avatar-edit-overlay {
                    opacity: 1;
                }
                .avatar-uploading-overlay {
                    position: absolute;
                    inset: 4px;
                    border-radius: 50%;
                    background: rgba(0, 0, 0, 0.6);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .avatar-uploading-overlay .spinner {
                    width: 28px;
                    height: 28px;
                    border: 3px solid rgba(255,255,255,0.3);
                    border-radius: 50%;
                    border-top-color: white;
                    animation: spin 1s ease-in-out infinite;
                }
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
                .profile-name {
                    font-size: 1.35rem;
                    font-weight: 850;
                    color: #1a1a1a;
                    margin: 0 0 5px;
                    text-align: center;
                }
                .profile-badge {
                    font-size: 0.75rem;
                    font-weight: 800;
                    background: #fff0f0;
                    color: var(--primary-red, #ff4d4d);
                    padding: 5px 14px;
                    border-radius: 20px;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }
                
                .profile-meta-list {
                    padding: 24px;
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                }
                .meta-item {
                    display: flex;
                    flex-direction: column;
                    gap: 4px;
                }
                .meta-item .label {
                    font-size: 0.72rem;
                    font-weight: 800;
                    color: #a0a0a0;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }
                .meta-item .value {
                    font-size: 0.95rem;
                    font-weight: 700;
                    color: #2d3748;
                    word-break: break-all;
                }
                
                /* Wallet Card */
                .profile-wallet-card {
                    background: white;
                    border-radius: 24px;
                    border: 1px solid rgba(0,0,0,0.06);
                    overflow: hidden;
                    box-shadow: 0 10px 30px rgba(0,0,0,0.02);
                }
                .wallet-header {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    padding: 20px 24px 10px;
                }
                .wallet-header .icon {
                    font-size: 1.2rem;
                }
                .wallet-header h4 {
                    margin: 0;
                    font-size: 0.9rem;
                    font-weight: 800;
                    color: #718096;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }
                .wallet-body {
                    padding: 0 24px 20px;
                }
                .wallet-balance {
                    font-size: 2.2rem;
                    font-weight: 900;
                    color: var(--primary-red, #ff4d4d);
                    margin: 0 0 2px;
                }
                .wallet-note {
                    margin: 0;
                    font-size: 0.8rem;
                    color: #a0aec0;
                    font-weight: 600;
                }
                .wallet-footer {
                    display: flex;
                    border-top: 1px solid #f1f3f5;
                    background: #fcfcfc;
                }
                .stat-box {
                    flex: 1;
                    padding: 16px;
                    text-align: center;
                    display: flex;
                    flex-direction: column;
                    gap: 2px;
                }
                .stat-box .stat-val {
                    font-size: 1.15rem;
                    font-weight: 900;
                    color: #2d3748;
                }
                .stat-box .stat-lbl {
                    font-size: 0.68rem;
                    font-weight: 800;
                    color: #a0aec0;
                    text-transform: uppercase;
                    letter-spacing: 0.3px;
                }
                .border-l {
                    border-left: 1px solid #f1f3f5;
                }
                
                /* Settings Cards on Right */
                .settings-card {
                    background: white;
                    border-radius: 24px;
                    border: 1px solid rgba(0,0,0,0.06);
                    padding: 30px;
                    box-shadow: 0 10px 30px rgba(0,0,0,0.02);
                }
                .settings-card.mt-8 {
                    margin-top: 30px;
                }
                
                .card-header {
                    display: flex;
                    gap: 15px;
                    align-items: flex-start;
                    margin-bottom: 25px;
                    padding-bottom: 15px;
                    border-bottom: 1px solid #f1f3f5;
                }
                .card-header .icon {
                    font-size: 1.5rem;
                    padding: 8px;
                    background: #fff0f0;
                    border-radius: 12px;
                    color: var(--primary-red, #ff4d4d);
                }
                .card-header h3 {
                    margin: 0;
                    font-size: 1.25rem;
                    font-weight: 850;
                    color: #1a1a1a;
                }
                .card-header p {
                    margin: 3px 0 0;
                    font-size: 0.85rem;
                    color: #718096;
                    font-weight: 600;
                }
                
                /* Form Fields */
                .settings-form {
                    display: flex;
                    flex-direction: column;
                    gap: 20px;
                }
                .form-group {
                    display: flex;
                    flex-direction: column;
                    gap: 6px;
                }
                .form-group label {
                    font-size: 0.78rem;
                    font-weight: 800;
                    color: #4a5568;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }
                .form-input {
                    padding: 12px 16px;
                    border-radius: 12px;
                    border: 1px solid #cbd5e0;
                    font-size: 0.95rem;
                    font-weight: 600;
                    color: #2d3748;
                    outline: none;
                    transition: all 0.2s ease;
                }
                .form-input:focus {
                    border-color: var(--primary-red, #ff4d4d);
                    box-shadow: 0 0 0 3px rgba(255, 77, 77, 0.12);
                }
                .form-input:disabled {
                    background: #f8f9fa;
                    border-color: #e2e8f0;
                    color: #718096;
                    cursor: default;
                    box-shadow: none;
                }
                .form-input.error {
                    border-color: #e53e3e;
                }
                .form-error-msg {
                    font-size: 0.78rem;
                    color: #e53e3e;
                    font-weight: 700;
                    margin-top: 2px;
                }
                
                .form-actions {
                    display: flex;
                    justify-content: flex-end;
                    border-top: 1px solid #f1f3f5;
                    padding-top: 20px;
                    margin-top: 10px;
                }
                
                .save-btn {
                    padding: 12px 28px;
                    background: #1a1a1a;
                    color: white;
                    border: none;
                    border-radius: 12px;
                    font-weight: 700;
                    cursor: pointer;
                    transition: all 0.2s ease;
                }
                .save-btn:hover:not(:disabled) {
                    background: #000000;
                    transform: translateY(-1px);
                    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
                }
                .save-btn:disabled {
                    background: #a0aec0;
                    cursor: not-allowed;
                }

                .cancel-btn {
                    padding: 12px 24px;
                    background: #edf2f7;
                    color: #4a5568;
                    border: 1px solid #cbd5e0;
                    border-radius: 12px;
                    font-weight: 700;
                    cursor: pointer;
                    transition: all 0.2s ease;
                }
                .cancel-btn:hover:not(:disabled) {
                    background: #e2e8f0;
                }
                .cancel-btn:disabled {
                    background: #edf2f7;
                    color: #a0aec0;
                    cursor: not-allowed;
                }

                .edit-toggle-btn {
                    padding: 12px 28px;
                    background: var(--primary-red, #ff4d4d);
                    color: white;
                    border: none;
                    border-radius: 12px;
                    font-weight: 700;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }
                .edit-toggle-btn:hover {
                    background: #e63939;
                    transform: translateY(-1px);
                    box-shadow: 0 4px 12px rgba(255, 77, 77, 0.2);
                }
                
                /* Micro Animations */
                .animate-fade-in {
                    animation: fadeIn 0.3s ease forwards;
                }
                @keyframes fadeIn {
                    from {
                        opacity: 0;
                        transform: translateY(-8px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                .password-placeholder-state {
                    text-align: center;
                    padding: 24px 15px;
                    border: 1px dashed #cbd5e0;
                    border-radius: 16px;
                    background: #fafafa;
                }
                .password-placeholder-state p {
                    margin: 12px 0 0;
                    font-size: 0.85rem;
                    color: #718096;
                    font-weight: 600;
                }
                .secure-badge {
                    display: inline-flex;
                    align-items: center;
                    gap: 6px;
                    padding: 6px 14px;
                    background: #edf2f7;
                    color: #4a5568;
                    border-radius: 20px;
                    font-size: 0.72rem;
                    font-weight: 800;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }

                .password-input-wrapper {
                    position: relative;
                    display: flex;
                    align-items: center;
                }
                .password-input-wrapper .form-input {
                    width: 100%;
                    padding-right: 48px;
                }
                .password-toggle-eye {
                    position: absolute;
                    right: 12px;
                    background: none;
                    border: none;
                    cursor: pointer;
                    font-size: 1.15rem;
                    padding: 4px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: #718096;
                    transition: transform 0.1s ease;
                }
                .password-toggle-eye:hover {
                    transform: scale(1.12);
                }
            `}} />
        </UserLayout>
    );
}
