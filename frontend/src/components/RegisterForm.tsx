import { FormEvent, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import FacebookLogin from '@greatsumini/react-facebook-login';
import { useAuth } from '../hooks/useAuth';

export default function RegisterForm() {
    const { register, loginWithGoogle, loginWithFacebook } = useAuth();
    const nav = useNavigate();
    const [email, setEmail] = useState('');
    const [fullName, setFullName] = useState('');
    const [password, setPassword] = useState('');
    const [confirm, setConfirm] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const FB_APP_ID = (import.meta as any)?.env?.VITE_FACEBOOK_APP_ID || '';

    const emailError = useMemo(() => {
        if (!email) return 'Email is required';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Invalid email format';
        return null;
    }, [email]);

    const passwordError = useMemo(() => {
        if (!password) return 'Password is required';
        if (password.length < 8) return 'Password must be at least 8 characters';
        if (!/[A-Z]/.test(password)) return 'Password must contain at least one uppercase letter';
        if (!/[0-9]/.test(password)) return 'Password must contain at least one digit';
        return null;
    }, [password]);

    const confirmError = useMemo(() => {
        if (!confirm) return 'Please confirm your password';
        if (confirm !== password) return 'Passwords do not match';
        return null;
    }, [confirm, password]);

    const canSubmit = !loading && !emailError && !passwordError && !confirmError;

    async function onSubmit(e: FormEvent) {
        e.preventDefault();
        if (!canSubmit) {
            setError('Please fix the errors above');
            return;
        }

        setError(null);
        setLoading(true);
        try {
            await register(email.trim(), password, fullName.trim() || undefined);
            nav('/dashboard', { replace: true });
        } catch (err: any) {
            setError(err?.response?.data?.detail || 'Registration failed');
        } finally {
            setLoading(false);
        }
    }

    const handleGoogleRegister = async (credential: string) => {
        setError(null);
        setLoading(true);
        try {
            await loginWithGoogle(credential);
            nav('/dashboard', { replace: true });
        } catch (err: any) {
            setError(err?.response?.data?.detail || 'Google registration failed');
        } finally {
            setLoading(false);
        }
    };

    const handleFacebookRegister = async (accessToken: string) => {
        setError(null);
        setLoading(true);
        try {
            await loginWithFacebook(accessToken);
            nav('/dashboard', { replace: true });
        } catch (err: any) {
            setError(err?.response?.data?.detail || 'Facebook registration failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ maxWidth: 400, margin: '48px auto', padding: '0 16px' }}>
            <h1 style={{ textAlign: 'center', marginBottom: 24 }}>Dang ky</h1>

            {error && (
                <div
                    style={{
                        color: '#c62828',
                        marginBottom: 16,
                        textAlign: 'left',
                        padding: '12px 12px',
                        backgroundColor: '#ffebee',
                        borderRadius: 4,
                        fontSize: 13,
                        border: '1px solid #ef5350',
                        lineHeight: '1.5',
                    }}
                >
                    <strong>Error:</strong> {error}
                </div>
            )}

            <form onSubmit={onSubmit}>
                <div style={{ marginBottom: 16 }}>
                    <label style={{ display: 'block', marginBottom: 6, fontSize: 14, fontWeight: 500 }}>
                        Email
                    </label>
                    <input
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        style={{
                            width: '100%',
                            padding: 10,
                            borderRadius: 4,
                            border: emailError ? '2px solid #d32f2f' : '1px solid #ccc',
                            boxSizing: 'border-box',
                            fontSize: 14,
                        }}
                    />
                    {emailError && <div style={{ color: '#d32f2f', fontSize: 12, marginTop: 4 }}>{emailError}</div>}
                </div>

                <div style={{ marginBottom: 16 }}>
                    <label style={{ display: 'block', marginBottom: 6, fontSize: 14, fontWeight: 500 }}>
                        Full name (optional)
                    </label>
                    <input
                        type="text"
                        placeholder="Enter your full name"
                        value={fullName}
                        onChange={e => setFullName(e.target.value)}
                        style={{
                            width: '100%',
                            padding: 10,
                            borderRadius: 4,
                            border: '1px solid #ccc',
                            boxSizing: 'border-box',
                            fontSize: 14,
                        }}
                    />
                </div>

                <div style={{ marginBottom: 16 }}>
                    <label style={{ display: 'block', marginBottom: 6, fontSize: 14, fontWeight: 500 }}>
                        Password
                    </label>
                    <div style={{ position: 'relative' }}>
                        <input
                            type={showPassword ? 'text' : 'password'}
                            placeholder="At least 8 characters"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            style={{
                                width: '100%',
                                padding: 10,
                                paddingRight: 40,
                                borderRadius: 4,
                                border: passwordError ? '2px solid #d32f2f' : '1px solid #ccc',
                                boxSizing: 'border-box',
                                fontSize: 14,
                            }}
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(prev => !prev)}
                            style={{
                                position: 'absolute',
                                right: 10,
                                top: '50%',
                                transform: 'translateY(-50%)',
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                fontSize: 12,
                                color: '#666',
                                padding: 0,
                                width: 28,
                                height: 24,
                            }}
                        >
                            {showPassword ? 'HIDE' : 'SHOW'}
                        </button>
                    </div>
                    {passwordError && <div style={{ color: '#d32f2f', fontSize: 12, marginTop: 4 }}>{passwordError}</div>}
                </div>

                <div style={{ marginBottom: 16 }}>
                    <label style={{ display: 'block', marginBottom: 6, fontSize: 14, fontWeight: 500 }}>
                        Confirm password
                    </label>
                    <div style={{ position: 'relative' }}>
                        <input
                            type={showConfirm ? 'text' : 'password'}
                            placeholder="Re-enter password"
                            value={confirm}
                            onChange={e => setConfirm(e.target.value)}
                            style={{
                                width: '100%',
                                padding: 10,
                                paddingRight: 40,
                                borderRadius: 4,
                                border: confirmError ? '2px solid #d32f2f' : '1px solid #ccc',
                                boxSizing: 'border-box',
                                fontSize: 14,
                            }}
                        />
                        <button
                            type="button"
                            onClick={() => setShowConfirm(prev => !prev)}
                            style={{
                                position: 'absolute',
                                right: 10,
                                top: '50%',
                                transform: 'translateY(-50%)',
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                fontSize: 12,
                                color: '#666',
                                padding: 0,
                                width: 28,
                                height: 24,
                            }}
                        >
                            {showConfirm ? 'HIDE' : 'SHOW'}
                        </button>
                    </div>
                    {confirmError && <div style={{ color: '#d32f2f', fontSize: 12, marginTop: 4 }}>{confirmError}</div>}
                </div>

                <button
                    type="submit"
                    disabled={!canSubmit}
                    style={{
                        width: '100%',
                        padding: 12,
                        marginTop: 8,
                        backgroundColor: canSubmit ? '#28a745' : '#ccc',
                        color: 'white',
                        border: 'none',
                        borderRadius: 4,
                        cursor: canSubmit ? 'pointer' : 'not-allowed',
                        fontWeight: 'bold',
                        fontSize: 16,
                        transition: 'background-color 0.2s',
                    }}
                >
                    {loading ? 'Processing...' : 'Dang ky'}
                </button>
            </form>

            <div style={{ margin: '24px 0', display: 'flex', alignItems: 'center' }}>
                <div style={{ flex: 1, height: 1, backgroundColor: '#ccc' }} />
                <span style={{ margin: '0 10px', color: '#888', fontSize: 14 }}>Or register with</span>
                <div style={{ flex: 1, height: 1, backgroundColor: '#ccc' }} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                    <GoogleLogin
                        onSuccess={response => {
                            if (response.credential) {
                                handleGoogleRegister(response.credential);
                            }
                        }}
                        onError={() => setError('Google registration failed')}
                        useOneTap
                    />
                </div>

                {FB_APP_ID && (
                    <FacebookLogin
                        appId={FB_APP_ID}
                        onSuccess={response => {
                            if (response.accessToken) {
                                handleFacebookRegister(response.accessToken);
                            }
                        }}
                        onFail={() => setError('Facebook registration failed')}
                        render={({ onClick }) => (
                            <button
                                onClick={onClick}
                                disabled={loading}
                                style={{
                                    width: '100%',
                                    padding: 10,
                                    backgroundColor: loading ? '#999' : '#1877F2',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: 4,
                                    cursor: loading ? 'not-allowed' : 'pointer',
                                    fontWeight: 'bold',
                                }}
                            >
                                Continue with Facebook
                            </button>
                        )}
                    />
                )}
            </div>

            <div style={{ marginTop: 24, textAlign: 'center', fontSize: 14 }}>
                <span style={{ color: '#666' }}>Already have an account? </span>
                <Link to="/login" style={{ color: '#007bff', textDecoration: 'none', fontWeight: 500 }}>
                    Login now
                </Link>
            </div>
        </div>
    );
}
