import VendorLayout from '@/Layouts/VendorLayout';
import { Head, Link, router, useForm } from '@inertiajs/react';
import React, { useState, useRef } from 'react';

export default function VendorProfile({ auth, profile, totalOrders }) {
    const [isEditMode, setIsEditMode] = useState(false);
    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [passwordSuccess, setPasswordSuccess] = useState(false);

    const currentPasswordInput = useRef(null);
    const passwordInput = useRef(null);

    const {
        data: passwordData,
        setData: setPasswordData,
        errors: passwordErrors,
        put: putPassword,
        reset: resetPassword,
        processing: passwordProcessing,
        clearErrors: clearPasswordErrors
    } = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    const handlePasswordSubmit = (e) => {
        e.preventDefault();
        clearPasswordErrors();
        
        putPassword(route('password.update'), {
            preserveScroll: true,
            onSuccess: () => {
                resetPassword();
                setPasswordSuccess(true);
                setTimeout(() => {
                    setPasswordSuccess(false);
                    setIsPasswordModalOpen(false);
                }, 2000);
            },
            onError: (errs) => {
                if (errs.password) {
                    resetPassword('password', 'password_confirmation');
                    if (passwordInput.current) passwordInput.current.focus();
                }
                if (errs.current_password) {
                    resetPassword('current_password');
                    if (currentPasswordInput.current) currentPasswordInput.current.focus();
                }
            }
        });
    };

    // Combine auth.user and profile data
    const [storeInfo, setStoreInfo] = useState({
        storeName: profile?.store_name || auth.user.store_name || "",
        ownerName: auth.user.name,
        email: auth.user.email,
        phone: profile?.phone || auth.user.phone || "",
        stallNumber: profile?.stall_number || auth.user.stall_number || "",
        description: profile?.description || auth.user.description || "",
        openTime: profile?.opening_time || auth.user.opening_time || "07:00",
        closeTime: profile?.closing_time || auth.user.closing_time || "17:00",
        status: profile?.status || auth.user.status || "Open",
        coverPhoto: profile?.cover_photo || auth.user.cover_photo || "/canteen_cover_photo_1778838750806.png",
        profileImage: profile?.profile_image || auth.user.profile_image || "/canteen_profile_logo_1778838842825.png"
    });

    const coverInputRef = useRef(null);
    const profileInputRef = useRef(null);

    React.useEffect(() => {
        setStoreInfo({
            storeName: profile?.store_name || auth.user.store_name || "",
            ownerName: auth.user.name,
            email: auth.user.email,
            phone: profile?.phone || auth.user.phone || "",
            stallNumber: profile?.stall_number || auth.user.stall_number || "",
            description: profile?.description || auth.user.description || "",
            openTime: profile?.opening_time || auth.user.opening_time || "07:00",
            closeTime: profile?.closing_time || auth.user.closing_time || "17:00",
            status: profile?.status || auth.user.status || "Open",
            coverPhoto: profile?.cover_photo || auth.user.cover_photo || "/canteen_cover_photo_1778838750806.png",
            profileImage: profile?.profile_image || auth.user.profile_image || "/canteen_profile_logo_1778838842825.png"
        });
    }, [auth.user, profile]);

    const handleToggleEdit = (e) => {
        if (isEditMode) {
            router.post(route('vendor.profile.update-details'), {
                email: storeInfo.email,
                store_name: storeInfo.storeName,
                phone: storeInfo.phone,
                stall_number: storeInfo.stallNumber,
                description: storeInfo.description,
                opening_time: storeInfo.openTime,
                closing_time: storeInfo.closeTime,
                status: storeInfo.status,
                profile_image: storeInfo.profileImage,
                cover_photo: storeInfo.coverPhoto
            }, {
                onSuccess: () => {
                    setIsEditMode(false);
                    alert('Store profile updated successfully!');
                }
            });
        } else {
            setIsEditMode(true);
        }
    };

    const handleImageChange = (type, e) => {
        if (!isEditMode) return;
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setStoreInfo(prev => ({
                    ...prev,
                    [type]: reader.result
                }));
            };
            reader.readAsDataURL(file);
        }
    };

    const renderField = (label, value, key, type = "text") => {
        return (
            <div className={`form-group ${key === 'description' ? 'full-width' : ''}`}>
                <label>{label}</label>
                {isEditMode ? (
                    key === 'description' ? (
                        <textarea 
                            value={storeInfo[key]} 
                            onChange={(e) => setStoreInfo({...storeInfo, [key]: e.target.value})}
                            rows="3"
                        ></textarea>
                    ) : (
                        <input 
                            type={type}
                            value={storeInfo[key]} 
                            onChange={(e) => setStoreInfo({...storeInfo, [key]: e.target.value})}
                        />
                    )
                ) : (
                    <div className="static-value">{value || <span className="placeholder">Not specified</span>}</div>
                )}
            </div>
        );
    };

    return (
        <VendorLayout header={<h2>Store Profile Settings</h2>}>
            <Head title="Vendor Profile" />
            
            <div className="profile-container">
                <div className="profile-grid">
                    <div className="info-column">
                        <div className="profile-card hero-section">
                            <div className="cover-wrapper">
                                <img src={storeInfo.coverPhoto} alt="Cover" className="cover-img" />
                                {isEditMode && (
                                    <div className="cover-overlay">
                                        <button className="btn-change-cover" onClick={() => coverInputRef.current.click()}>
                                            📷 Change Cover
                                        </button>
                                        <input 
                                            type="file" 
                                            ref={coverInputRef} 
                                            hidden 
                                            accept="image/*"
                                            onChange={(e) => handleImageChange('coverPhoto', e)}
                                        />
                                    </div>
                                )}
                                <div className="profile-img-wrapper">
                                    <img src={storeInfo.profileImage} alt="Profile" className="profile-avatar-img" />
                                    {isEditMode && (
                                        <>
                                            <button className="btn-change-profile" onClick={() => profileInputRef.current.click()}>
                                                ✏️
                                            </button>
                                            <input 
                                                type="file" 
                                                ref={profileInputRef} 
                                                hidden 
                                                accept="image/*"
                                                onChange={(e) => handleImageChange('profileImage', e)}
                                            />
                                        </>
                                    )}
                                </div>
                            </div>
                            
                            <div className="hero-content">
                                <div className="hero-titles">
                                    <h3>{storeInfo.storeName}</h3>
                                    <div className="hero-badges">
                                        <span className={`status-pill ${storeInfo.status.toLowerCase()}`}>{storeInfo.status}</span>
                                        <span className="vendor-type">{storeInfo.stallNumber}</span>
                                        <span className="divider">•</span>
                                        <span className="vendor-type">Verified Vendor</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="profile-card form-section">
                            <div className="card-header">
                                <h4>General Information</h4>
                                <p>{isEditMode ? 'You are currently in editing mode.' : 'View your store details and operating hours.'}</p>
                            </div>
                            
                            <div className="profile-form">
                                <div className="form-grid">
                                    {renderField("Store Name", storeInfo.storeName, "storeName")}
                                    {renderField("Stall Number", storeInfo.stallNumber, "stallNumber")}
                                    {renderField("Email Address", storeInfo.email, "email", "email")}
                                    {renderField("Contact Phone", storeInfo.phone, "phone")}
                                    {renderField("Description", storeInfo.description, "description")}
                                    {renderField("Opening Time", storeInfo.openTime, "openTime", "time")}
                                    {renderField("Closing Time", storeInfo.closeTime, "closeTime", "time")}
                                </div>

                                <div className="form-actions">
                                    <button 
                                        className={`btn-mode-toggle ${isEditMode ? 'saving' : ''}`} 
                                        onClick={handleToggleEdit}
                                    >
                                        {isEditMode ? '✓ Save Changes' : '✏️ Edit Details'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="side-column">
                        <div className="profile-card stats-mini">
                            <div className="card-header">
                                <h4>Store Analytics</h4>
                            </div>
                            <div className="mini-stat-item">
                                <span className="s-label">Avg. Rating</span>
                                <span className="val">⭐ {profile?.rating ? parseFloat(profile.rating).toFixed(1) : 'No ratings yet'} ({profile?.rating_count || 0} reviews)</span>
                            </div>
                            <div className="mini-stat-item">
                                <span className="s-label">Total Orders</span>
                                <span className="val">{(totalOrders ?? 0).toLocaleString()}</span>
                            </div>
                            <div className="mini-stat-item">
                                <span className="s-label">Vendor Since</span>
                                <span className="val">Jan 2024</span>
                            </div>
                            <Link href="/vendor/reviews" className="btn-view-detailed-link">
                                View Detailed Analytics
                            </Link>
                        </div>

                        <div className="profile-card account-security">
                            <div className="card-header">
                                <h4>Account Security</h4>
                            </div>
                            <p>Manage your login credentials and security settings.</p>
                            <button className="btn-outline-security" onClick={() => setIsPasswordModalOpen(true)}>Change Password</button>
                            <button className="btn-danger-link">Deactivate Store</button>
                        </div>
                    </div>
                </div>
            </div>

            <style dangerouslySetInnerHTML={{ __html: `
                .profile-container { padding-bottom: 50px; }
                .profile-grid { display: grid; grid-template-columns: 2fr 1fr; gap: 30px; }
                
                .profile-card { background: white; border-radius: 24px; box-shadow: 0 4px 20px rgba(0,0,0,0.03); margin-bottom: 30px; overflow: hidden; }
                
                .hero-section { padding: 0; position: relative; }
                .cover-wrapper { height: 200px; width: 100%; position: relative; background: #eee; }
                .cover-img { width: 100%; height: 100%; object-fit: cover; }
                .cover-overlay { position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.25); display: flex; align-items: center; justify-content: center; }
                .btn-change-cover { background: rgba(255,255,255,0.9); color: #333; border: none; padding: 10px 20px; border-radius: 12px; font-weight: 700; font-size: 0.8rem; cursor: pointer; backdrop-filter: blur(4px); }

                .profile-img-wrapper { position: absolute; bottom: -45px; left: 40px; width: 110px; height: 110px; }
                .profile-avatar-img { width: 100%; height: 100%; object-fit: cover; border-radius: 28px; border: 5px solid white; box-shadow: 0 8px 20px rgba(0,0,0,0.1); background: white; }
                .btn-change-profile { position: absolute; bottom: 0; right: 0; width: 32px; height: 32px; background: #333; color: white; border: none; border-radius: 10px; cursor: pointer; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 10px rgba(0,0,0,0.2); }

                .hero-content { padding: 60px 40px 25px 40px; display: flex; justify-content: space-between; align-items: flex-end; }
                .hero-titles h3 { font-size: 1.6rem; font-weight: 800; color: #333; margin-bottom: 5px; }
                .hero-badges { display: flex; gap: 10px; align-items: center; }
                .status-pill { padding: 4px 12px; border-radius: 20px; font-size: 0.7rem; font-weight: 700; text-transform: uppercase; }
                .status-pill.open { background: #e9f9ef; color: #28c76f; }
                .vendor-type { font-size: 0.7rem; font-weight: 700; color: #999; text-transform: uppercase; }
                .divider { color: #ddd; font-size: 0.8rem; }

                .form-section { padding: 40px; }
                .form-section .card-header { margin-bottom: 40px; }
                .form-section h4 { font-size: 1.15rem; font-weight: 800; color: #333; margin-bottom: 4px; }
                .form-section p { font-size: 0.85rem; color: #aaa; }
                
                .form-actions { margin-top: 40px; padding-top: 30px; border-top: 1px solid #f8f8f8; display: flex; justify-content: flex-end; }
                .btn-mode-toggle { background: #f8f9fa; color: #555; border: 1.5px solid #eee; padding: 12px 30px; border-radius: 14px; font-weight: 700; font-size: 0.9rem; cursor: pointer; transition: all 0.3s; display: flex; align-items: center; gap: 8px; }
                .btn-mode-toggle:hover { border-color: #333; color: #333; transform: translateY(-1px); }
                .btn-mode-toggle.saving { background: #333; color: white; border-color: #333; }
                .btn-mode-toggle.saving:hover { background: #000; box-shadow: 0 8px 20px rgba(0,0,0,0.15); }

                .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 25px; }
                .form-group.full-width { grid-column: 1 / -1; }
                .form-group label { display: block; font-weight: 700; font-size: 0.8rem; color: #999; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 12px; }
                
                .static-value { font-size: 1rem; font-weight: 700; color: #333; padding: 12px 0; border-bottom: 1px solid #f8f8f8; }
                .static-value .placeholder { color: #ccc; font-weight: 500; font-style: italic; }

                .form-group input, .form-group textarea { width: 100%; padding: 14px; border-radius: 14px; border: 1px solid #f0f0f0; background: #fafafa; font-family: inherit; font-size: 0.95rem; transition: all 0.3s; color: #333; }
                .form-group input:focus, .form-group textarea:focus { outline: none; border-color: #333; background: white; box-shadow: 0 0 0 4px rgba(0,0,0,0.05); }
                
                .side-column .profile-card { padding: 30px; }
                .mini-stat-item { display: flex; justify-content: space-between; padding: 15px 0; border-bottom: 1px solid #f8f8f8; font-size: 0.9rem; }
                .mini-stat-item .s-label { color: #888; font-weight: 600; }
                .mini-stat-item .val { font-weight: 800; color: #333; }
                
                .btn-view-detailed-link { display: block; text-align: center; width: 100%; margin-top: 20px; background: #f8f9fa; border: none; padding: 12px; border-radius: 12px; font-weight: 700; font-size: 0.85rem; cursor: pointer; color: #555; text-decoration: none; transition: all 0.2s; }
                .btn-view-detailed-link:hover { background: #eee; color: #333; transform: translateY(-1px); }

                .account-security p { font-size: 0.85rem; color: #999; margin-bottom: 25px; line-height: 1.6; }
                .btn-outline-security { width: 100%; background: none; border: 1.5px solid #eee; padding: 12px; border-radius: 12px; font-weight: 700; color: #666; cursor: pointer; margin-bottom: 12px; transition: all 0.2s; }
                .btn-outline-security:hover { border-color: #333; color: #333; }
                .btn-danger-link { width: 100%; background: none; border: none; color: #ea5455; font-weight: 700; font-size: 0.8rem; cursor: pointer; margin-top: 10px; }

                /* Change Password Premium Modal Styles */
                .modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.6); backdrop-filter: blur(8px); display: flex; align-items: center; justify-content: center; z-index: 2000; }
                .modal-content-premium { background: white; border-radius: 24px; width: 95%; max-width: 500px; overflow: hidden; box-shadow: 0 30px 60px rgba(0,0,0,0.2); border: none; }
                .btn-close-premium { position: absolute; top: 30px; right: 30px; background: #f8f9fa; border: none; width: 35px; height: 35px; border-radius: 50%; cursor: pointer; font-size: 1rem; font-weight: 800; color: #aaa; transition: all 0.2s; z-index: 10; display: flex; align-items: center; justify-content: center; }
                .btn-close-premium:hover { background: #eee; color: #333; }
                
                .password-modal-premium { max-width: 500px; padding: 40px; position: relative; }
                .security-icon-circle { font-size: 2.2rem; margin-bottom: 12px; display: inline-block; background: #fafafa; width: 60px; height: 60px; display: flex; align-items: center; justify-content: center; border-radius: 50%; border: 1.5px solid #f0f0f0; }
                .premium-password-form { display: flex; flex-direction: column; gap: 30px; }
                .password-input-wrapper { position: relative; width: 100%; }
                .password-input-wrapper input { width: 100%; padding: 14px 45px 14px 14px; border-radius: 14px; border: 1.5px solid #f0f0f0; background: #fafafa; font-family: inherit; font-size: 0.95rem; transition: all 0.3s; color: #333; }
                .password-input-wrapper input:focus { outline: none; border-color: #333; background: white; box-shadow: 0 0 0 4px rgba(0,0,0,0.05); }
                .password-toggle-btn { position: absolute; right: 14px; top: 50%; transform: translateY(-50%); background: none; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; padding: 4px; color: #888; transition: color 0.2s; }
                .password-toggle-btn:hover { color: #333; }
                .eye-icon { width: 20px; height: 20px; }
                .success-banner-premium { background: #e9f9ef; color: #28c76f; border: 1.5px solid #d2f4e1; padding: 15px; border-radius: 14px; display: flex; align-items: center; gap: 10px; font-weight: 700; font-size: 0.9rem; animation: slideIn 0.3s ease-out; }
                .success-banner-premium .success-icon { font-size: 1.2rem; }
                
                .form-body-premium { display: flex; flex-direction: column; gap: 20px; }
                .form-group-premium { display: flex; flex-direction: column; gap: 8px; }
                .form-group-premium label { font-size: 0.85rem; font-weight: 800; color: #333; text-transform: uppercase; }
                
                .modal-footer-premium { display: flex; gap: 15px; padding-top: 10px; }
                .btn-cancel-premium { flex: 1; padding: 15px; border-radius: 12px; border: none; font-weight: 800; color: #999; background: #f8f9fa; cursor: pointer; transition: background 0.2s; }
                .btn-cancel-premium:hover { background: #eee; }
                .btn-save-premium { flex: 2; padding: 15px; border-radius: 12px; border: none; font-weight: 800; color: white; background: #333; cursor: pointer; transition: background 0.2s; }
                .btn-save-premium:hover { background: #000; }
                .btn-save-premium:disabled { opacity: 0.5; cursor: not-allowed; }

                .error-msg { color: #ff4d4f; font-size: 0.75rem; font-weight: 700; margin-top: 2px; }

                @keyframes slideIn {
                    from { transform: translateY(-10px); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }

                @media (max-width: 1024px) {
                    .profile-grid { grid-template-columns: 1fr; }
                    .form-grid { grid-template-columns: 1fr; }
                }
            `}} />

            {isPasswordModalOpen && (
                <div className="modal-overlay" onClick={() => { setIsPasswordModalOpen(false); resetPassword(); clearPasswordErrors(); }}>
                    <div className="modal-content-premium password-modal-premium" onClick={e => e.stopPropagation()}>
                        <button type="button" className="btn-close-premium" onClick={() => { setIsPasswordModalOpen(false); resetPassword(); clearPasswordErrors(); }}>✕</button>
                        
                        <form onSubmit={handlePasswordSubmit} className="premium-password-form">
                            <div className="modal-header-premium">
                                <div className="title-group">
                                    <div className="security-icon-circle">🔐</div>
                                    <h3>Change Password</h3>
                                    <p className="subtitle">Ensure your account is using a long, secure password.</p>
                                </div>
                            </div>
                            
                            <div className="form-body-premium">
                                {passwordSuccess && (
                                    <div className="success-banner-premium">
                                        <span className="success-icon">✓</span>
                                        <span className="success-text">Password updated successfully! Closing...</span>
                                    </div>
                                )}
                                
                                <div className="form-group-premium">
                                    <label>Current Password</label>
                                    <div className="password-input-wrapper">
                                        <input 
                                            type={showCurrentPassword ? "text" : "password"}
                                            ref={currentPasswordInput}
                                            value={passwordData.current_password}
                                            onChange={(e) => setPasswordData('current_password', e.target.value)}
                                            placeholder="Enter your current password"
                                            required
                                        />
                                        <button 
                                            type="button" 
                                            className="password-toggle-btn"
                                            onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                        >
                                            {showCurrentPassword ? (
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="eye-icon">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.815 7.815L21 21m-3.955-3.955-3.9-3.9m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
                                                </svg>
                                            ) : (
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="eye-icon">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                                                </svg>
                                            )}
                                        </button>
                                    </div>
                                    {passwordErrors.current_password && <span className="error-msg">{passwordErrors.current_password}</span>}
                                </div>

                                <div className="form-group-premium">
                                    <label>New Password</label>
                                    <div className="password-input-wrapper">
                                        <input 
                                            type={showNewPassword ? "text" : "password"}
                                            ref={passwordInput}
                                            value={passwordData.password}
                                            onChange={(e) => setPasswordData('password', e.target.value)}
                                            placeholder="Minimum 8 characters"
                                            required
                                        />
                                        <button 
                                            type="button" 
                                            className="password-toggle-btn"
                                            onClick={() => setShowNewPassword(!showNewPassword)}
                                        >
                                            {showNewPassword ? (
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="eye-icon">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.815 7.815L21 21m-3.955-3.955-3.9-3.9m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
                                                </svg>
                                            ) : (
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="eye-icon">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                                                </svg>
                                            )}
                                        </button>
                                    </div>
                                    {passwordErrors.password && <span className="error-msg">{passwordErrors.password}</span>}
                                </div>

                                <div className="form-group-premium">
                                    <label>Confirm Password</label>
                                    <div className="password-input-wrapper">
                                        <input 
                                            type={showConfirmPassword ? "text" : "password"}
                                            value={passwordData.password_confirmation}
                                            onChange={(e) => setPasswordData('password_confirmation', e.target.value)}
                                            placeholder="Verify your new password"
                                            required
                                        />
                                        <button 
                                            type="button" 
                                            className="password-toggle-btn"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        >
                                            {showConfirmPassword ? (
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="eye-icon">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.815 7.815L21 21m-3.955-3.955-3.9-3.9m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
                                                </svg>
                                            ) : (
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="eye-icon">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                                                </svg>
                                            )}
                                        </button>
                                    </div>
                                    {passwordErrors.password_confirmation && <span className="error-msg">{passwordErrors.password_confirmation}</span>}
                                </div>
                            </div>
                            
                            <div className="modal-footer-premium">
                                <button type="button" className="btn-cancel-premium" onClick={() => { setIsPasswordModalOpen(false); resetPassword(); clearPasswordErrors(); }}>Cancel</button>
                                <button type="submit" className="btn-save-premium" disabled={passwordProcessing}>
                                    {passwordProcessing ? 'Saving...' : 'Update Password'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </VendorLayout>
    );
}
