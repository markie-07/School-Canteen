import React from 'react';
import { Head, useForm } from '@inertiajs/react';
import './CanteenLogin.css';

export default function Login({ status, canResetPassword }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <div className="canteen-login-container">
            <Head title="Canteen Login" />
            
            <div className="login-overlay">
                <div className="login-card">
                    <div className="login-header">
                        <div className="logo-container">
                            <span className="logo-icon">🥗</span>
                            <h1 className="logo-text">School<span>Canteen</span></h1>
                        </div>
                        <p className="subtitle">Welcome back! Please login to your account.</p>
                    </div>

                    {status && (
                        <div className="status-message">
                            {status}
                        </div>
                    )}

                    <form onSubmit={submit} className="login-form">
                        <div className="form-group">
                            <label htmlFor="email">Email Address</label>
                            <div className="input-wrapper">
                                <span className="input-icon">✉️</span>
                                <input
                                    id="email"
                                    type="email"
                                    name="email"
                                    value={data.email}
                                    placeholder="your@email.com"
                                    onChange={(e) => setData('email', e.target.value)}
                                    required
                                />
                            </div>
                            {errors.email && <span className="error-text">{errors.email}</span>}
                        </div>

                        <div className="form-group">
                            <label htmlFor="password">Password</label>
                            <div className="input-wrapper">
                                <span className="input-icon">🔒</span>
                                <input
                                    id="password"
                                    type="password"
                                    name="password"
                                    value={data.password}
                                    placeholder="••••••••"
                                    onChange={(e) => setData('password', e.target.value)}
                                    required
                                />
                            </div>
                            {errors.password && <span className="error-text">{errors.password}</span>}
                        </div>

                        <div className="form-options">
                            <label className="remember-me">
                                <input
                                    type="checkbox"
                                    name="remember"
                                    checked={data.remember}
                                    onChange={(e) => setData('remember', e.target.checked)}
                                />
                                <span>Remember me</span>
                            </label>
                            {canResetPassword && (
                                <a href={route('password.request')} className="forgot-password">
                                    Forgot Password?
                                </a>
                            )}
                        </div>

                        <button type="submit" className="login-button" disabled={processing}>
                            {processing ? 'Logging in...' : 'Sign In'}
                        </button>
                    </form>

                    <div className="login-footer">
                        <p>Don't have an account? <a href={route('register')}>Create one</a></p>
                    </div>
                </div>
            </div>
        </div>
    );
}
