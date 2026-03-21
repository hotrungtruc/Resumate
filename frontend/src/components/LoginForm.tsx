import { FormEvent, useMemo, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import FacebookLogin from '@greatsumini/react-facebook-login';
import { useAuth } from '../hooks/useAuth';

export default function LoginForm() {
    const { login, loginWithGoogle, loginWithFacebook } = useAuth();
    const nav = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const FB_APP_ID = (import.meta as any).env?.VITE_FACEBOOK_APP_ID || '';

    const emailError = useMemo(() => {
        if (!email) return 'Email is required';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Invalid email format';
        return null;
    }, [email]);

    const passwordError = useMemo(() => {
        if (!password) return 'Password is required';
        if (password.length < 8) return 'Password must be at least 8 characters';
        return null;
    }, [password]);

    const canSubmit = !loading && !emailError && !passwordError;

    async function onSubmit(e: FormEvent) {
        e.preventDefault();
        if (!canSubmit) {
            setError('Please fix the errors above');
            return;
        }

        setError(null);
        setLoading(true);
        try {
            await login(email.trim(), password);
            nav('/dashboard', { replace: true });
        } catch (err: any) {
            setError(err?.response?.data?.detail || 'Login failed');
        } finally {
            setLoading(false);
        }
    }

    const handleGoogleLogin = async (credential: string) => {
        setError(null);
        setLoading(true);
        try {
            await loginWithGoogle(credential);
            nav('/dashboard', { replace: true });
        } catch (err: any) {
            setError(err?.response?.data?.detail || 'Google login failed');
        } finally {
            setLoading(false);
        }
    };

    const handleFacebookLogin = async (accessToken: string) => {
        setError(null);
        setLoading(true);
        try {
            await loginWithFacebook(accessToken);
            nav('/dashboard', { replace: true });
        } catch (err: any) {
            setError(err?.response?.data?.detail || 'Facebook login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ maxWidth: 360, margin: '64px auto', padding: '0 16px' }}>
            <h1 style={{ textAlign: 'center' }}>Dang nhap</h1>
            {error && (
                <div
                    style={{
                        color: '#c62828',
                        marginBottom: 12,
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
                        placeholder="Email"
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
                        Password
                    </label>
                    <div style={{ position: 'relative' }}>
                        <input
                            type={showPassword ? 'text' : 'password'}
                            placeholder="Password"
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

                <button
                    type="submit"
                    disabled={!canSubmit}
                    style={{
                        width: '100%',
                        padding: 12,
                        backgroundColor: canSubmit ? '#007bff' : '#ccc',
                        color: 'white',
                        border: 'none',
                        borderRadius: 4,
                        cursor: canSubmit ? 'pointer' : 'not-allowed',
                        fontWeight: 'bold',
                        fontSize: 16,
                        transition: 'background-color 0.2s',
                    }}
                >
                    {loading ? 'Processing...' : 'Dang nhap'}
                </button>
            </form>

            <div style={{ margin: '24px 0', display: 'flex', alignItems: 'center' }}>
                <div style={{ flex: 1, height: 1, backgroundColor: '#ccc' }} />
                <span style={{ margin: '0 10px', color: '#888', fontSize: 14 }}>Or</span>
                <div style={{ flex: 1, height: 1, backgroundColor: '#ccc' }} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                    <GoogleLogin
                        onSuccess={response => {
                            if (response.credential) {
                                handleGoogleLogin(response.credential);
                            }
                        }}
                        onError={() => setError('Google login failed')}
                        useOneTap
                    />
                </div>

                {FB_APP_ID && (
                    <FacebookLogin
                        appId={FB_APP_ID}
                        onSuccess={response => {
                            if (response.accessToken) {
                                handleFacebookLogin(response.accessToken);
                            }
                        }}
                        onFail={() => setError('Facebook login failed')}
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

            <div style={{ marginTop: 24, textAlign: 'center' }}>
                <span>No account? </span>
                <Link to="/register">Register now</Link>
            </div>
        </div>
    );
}
