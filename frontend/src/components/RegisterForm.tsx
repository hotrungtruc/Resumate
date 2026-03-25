import { FormEvent, useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import FacebookLogin from '@greatsumini/react-facebook-login';
import { useAuth } from '../hooks/useAuth';
import { validateEmail, validatePassword, validatePasswordConfirm, validateFullName } from '../utils/authValidation';

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

    const FB_APP_ID = ((import.meta as any).env?.VITE_FACEBOOK_APP_ID as string) || '';

    const emailError = useMemo(() => validateEmail(email), [email]);

    const passwordError = useMemo(() => validatePassword(password, 'register'), [password]);

    const confirmError = useMemo(() => validatePasswordConfirm(password, confirm), [confirm, password]);

    const nameError = useMemo(() => validateFullName(fullName), [fullName]);

    const canSubmit = !loading && !emailError && !passwordError && !confirmError && !nameError;

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
            const message = err?.response?.data?.detail;
            if (message?.includes('already')) {
                setError('This account already exists. Please sign in instead.');
            } else if (message?.includes('invalid')) {
                setError('The credentials provided are invalid. Please try again.');
            } else {
                setError('Sign up with Google failed. Please try again or use email/password.');
            }
            console.error('Google registration error:', message);
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
            const message = err?.response?.data?.detail;
            if (message?.includes('already')) {
                setError('This account already exists. Please sign in instead.');
            } else {
                setError('Sign up with Facebook failed. Please try again or use email/password.');
            }
            console.error('Facebook registration error:', message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ maxWidth: 380, margin: '64px auto', padding: '0 16px' }}>
            <h1 style={{ textAlign: 'center', marginBottom: 24, fontSize: 28, fontWeight: 'bold', color: '#333' }}>
                Create your Resumate account
            </h1>

            {error && (
                <div
                    role="alert"
                    style={{
                        color: '#d32f2f',
                        marginBottom: 16,
                        padding: '12px 16px',
                        backgroundColor: '#ffebee',
                        borderRadius: 6,
                        fontSize: 13,
                        border: '1px solid #ef5350',
                        lineHeight: '1.6',
                    }}
                >
                    {error}
                </div>
            )}

            <form onSubmit={onSubmit}>
                <div style={{ marginBottom: 20 }}>
                    <label htmlFor="email" style={{ display: 'block', marginBottom: 8, fontSize: 14, fontWeight: 600, color: '#333' }}>
                        Email Address
                    </label>
                    <input
                        id="email"
                        type="email"
                        placeholder="your@email.com"
                        value={email}
                        onChange={e => setEmail(e.target.value.trim())}
                        aria-invalid={!!emailError}
                        aria-describedby={emailError ? 'email-error' : undefined}
                        style={{
                            width: '100%',
                            padding: '11px 12px',
                            borderRadius: 6,
                            border: emailError ? '2px solid #d32f2f' : '1px solid #d0d0d0',
                            boxSizing: 'border-box',
                            fontSize: 14,
                            fontFamily: 'inherit',
                            transition: 'border-color 0.2s, box-shadow 0.2s',
                            outline: 'none',
                            backgroundColor: '#fff',
                        }}
                        onFocus={e => {
                            e.currentTarget.style.borderColor = '#007bff';
                            e.currentTarget.style.boxShadow = '0 0 0 2px rgba(0, 123, 255, 0.1)';
                        }}
                        onBlur={e => {
                            e.currentTarget.style.borderColor = emailError ? '#d32f2f' : '#d0d0d0';
                            e.currentTarget.style.boxShadow = 'none';
                        }}
                    />
                    {emailError && (
                        <div id="email-error" style={{ color: '#d32f2f', fontSize: 12, marginTop: 6 }}>
                            {emailError}
                        </div>
                    )}
                </div>

                <div style={{ marginBottom: 20 }}>
                    <label htmlFor="fullName" style={{ display: 'block', marginBottom: 8, fontSize: 14, fontWeight: 600, color: '#333' }}>
                        Full Name <span style={{ color: '#999', fontSize: 12, fontWeight: 400 }}>(optional)</span>
                    </label>
                    <input
                        id="fullName"
                        type="text"
                        placeholder="John Doe"
                        value={fullName}
                        onChange={e => setFullName(e.target.value)}
                        aria-invalid={!!nameError}
                        aria-describedby={nameError ? 'name-error' : undefined}
                        style={{
                            width: '100%',
                            padding: '11px 12px',
                            borderRadius: 6,
                            border: nameError ? '2px solid #d32f2f' : '1px solid #d0d0d0',
                            boxSizing: 'border-box',
                            fontSize: 14,
                            fontFamily: 'inherit',
                            transition: 'border-color 0.2s, box-shadow 0.2s',
                            outline: 'none',
                            backgroundColor: '#fff',
                        }}
                        onFocus={e => {
                            e.currentTarget.style.borderColor = '#007bff';
                            e.currentTarget.style.boxShadow = '0 0 0 2px rgba(0, 123, 255, 0.1)';
                        }}
                        onBlur={e => {
                            e.currentTarget.style.borderColor = nameError ? '#d32f2f' : '#d0d0d0';
                            e.currentTarget.style.boxShadow = 'none';
                        }}
                    />
                    {nameError && (
                        <div id="name-error" style={{ color: '#d32f2f', fontSize: 12, marginTop: 6 }}>
                            {nameError}
                        </div>
                    )}
                </div>

                <div style={{ marginBottom: 20 }}>
                    <label htmlFor="password" style={{ display: 'block', marginBottom: 8, fontSize: 14, fontWeight: 600, color: '#333' }}>
                        Password
                    </label>
                    <div style={{ position: 'relative' }}>
                        <input
                            id="password"
                            type={showPassword ? 'text' : 'password'}
                            placeholder="••••••••"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            aria-invalid={!!passwordError}
                            aria-describedby={passwordError ? 'password-error' : undefined}
                            style={{
                                width: '100%',
                                padding: '11px 12px',
                                paddingRight: 44,
                                borderRadius: 6,
                                border: passwordError ? '2px solid #d32f2f' : '1px solid #d0d0d0',
                                boxSizing: 'border-box',
                                fontSize: 14,
                                fontFamily: 'inherit',
                                transition: 'border-color 0.2s, box-shadow 0.2s',
                                outline: 'none',
                                backgroundColor: '#fff',
                            }}
                            onFocus={e => {
                                e.currentTarget.style.borderColor = '#007bff';
                                e.currentTarget.style.boxShadow = '0 0 0 2px rgba(0, 123, 255, 0.1)';
                            }}
                            onBlur={e => {
                                e.currentTarget.style.borderColor = passwordError ? '#d32f2f' : '#d0d0d0';
                                e.currentTarget.style.boxShadow = 'none';
                            }}
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(prev => !prev)}
                            aria-label={showPassword ? 'Hide password' : 'Show password'}
                            aria-pressed={showPassword}
                            style={{
                                position: 'absolute',
                                right: 12,
                                top: '50%',
                                transform: 'translateY(-50%)',
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                fontSize: 20,
                                color: '#666',
                                padding: 0,
                                width: 28,
                                height: 28,
                                display: 'grid',
                                placeItems: 'center',
                                borderRadius: 4,
                                transition: 'background-color 0.2s',
                            }}
                            onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#f0f0f0')}
                            onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
                        >
                            <span className="material-symbols-outlined" aria-hidden="true">
                                {showPassword ? 'visibility_off' : 'visibility'}
                            </span>
                        </button>
                    </div>
                    {passwordError && (
                        <div id="password-error" style={{ color: '#d32f2f', fontSize: 12, marginTop: 6 }}>
                            {passwordError}
                        </div>
                    )}
                    <div style={{ fontSize: 12, color: '#666', marginTop: 8, lineHeight: '1.4' }}>
                        <div>Password must have:</div>
                        <ul style={{ margin: '4px 0 0 16px', paddingLeft: 0 }}>
                            <li>At least 8 characters</li>
                            <li>One uppercase letter (A-Z)</li>
                            <li>One digit (0-9)</li>
                        </ul>
                    </div>
                </div>

                <div style={{ marginBottom: 20 }}>
                    <label htmlFor="confirm" style={{ display: 'block', marginBottom: 8, fontSize: 14, fontWeight: 600, color: '#333' }}>
                        Confirm Password
                    </label>
                    <div style={{ position: 'relative' }}>
                        <input
                            id="confirm"
                            type={showConfirm ? 'text' : 'password'}
                            placeholder="••••••••"
                            value={confirm}
                            onChange={e => setConfirm(e.target.value)}
                            aria-invalid={!!confirmError}
                            aria-describedby={confirmError ? 'confirm-error' : undefined}
                            style={{
                                width: '100%',
                                padding: '11px 12px',
                                paddingRight: 44,
                                borderRadius: 6,
                                border: confirmError ? '2px solid #d32f2f' : '1px solid #d0d0d0',
                                boxSizing: 'border-box',
                                fontSize: 14,
                                fontFamily: 'inherit',
                                transition: 'border-color 0.2s, box-shadow 0.2s',
                                outline: 'none',
                                backgroundColor: '#fff',
                            }}
                            onFocus={e => {
                                e.currentTarget.style.borderColor = '#007bff';
                                e.currentTarget.style.boxShadow = '0 0 0 2px rgba(0, 123, 255, 0.1)';
                            }}
                            onBlur={e => {
                                e.currentTarget.style.borderColor = confirmError ? '#d32f2f' : '#d0d0d0';
                                e.currentTarget.style.boxShadow = 'none';
                            }}
                        />
                        <button
                            type="button"
                            onClick={() => setShowConfirm(prev => !prev)}
                            aria-label={showConfirm ? 'Hide confirm password' : 'Show confirm password'}
                            aria-pressed={showConfirm}
                            style={{
                                position: 'absolute',
                                right: 12,
                                top: '50%',
                                transform: 'translateY(-50%)',
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                fontSize: 20,
                                color: '#666',
                                padding: 0,
                                width: 28,
                                height: 28,
                                display: 'grid',
                                placeItems: 'center',
                                borderRadius: 4,
                                transition: 'background-color 0.2s',
                            }}
                            onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#f0f0f0')}
                            onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
                        >
                            <span className="material-symbols-outlined" aria-hidden="true">
                                {showConfirm ? 'visibility_off' : 'visibility'}
                            </span>
                        </button>
                    </div>
                    {confirmError && (
                        <div id="confirm-error" style={{ color: '#d32f2f', fontSize: 12, marginTop: 6 }}>
                            {confirmError}
                        </div>
                    )}
                </div>

                <button
                    type="submit"
                    disabled={!canSubmit}
                    style={{
                        width: '100%',
                        padding: '12px 16px',
                        backgroundColor: canSubmit ? '#007bff' : '#ccc',
                        color: 'white',
                        border: 'none',
                        borderRadius: 6,
                        cursor: canSubmit ? 'pointer' : 'not-allowed',
                        fontWeight: 600,
                        fontSize: 15,
                        transition: 'all 0.2s',
                        opacity: canSubmit ? 1 : 0.6,
                    }}
                    onMouseEnter={e => {
                        if (canSubmit) (e.currentTarget as any).style.backgroundColor = '#0056b3';
                    }}
                    onMouseLeave={e => {
                        if (canSubmit) (e.currentTarget as any).style.backgroundColor = '#007bff';
                    }}
                >
                    {loading ? 'Creating account...' : 'Sign up'}
                </button>
            </form>

            <div style={{ margin: '24px 0', display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ flex: 1, height: '1px', backgroundColor: '#e0e0e0' }} />
                <span style={{ color: '#999', fontSize: 13, fontWeight: 500 }}>OR</span>
                <div style={{ flex: 1, height: '1px', backgroundColor: '#e0e0e0' }} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                    <GoogleLogin
                        text="signup_with"
                        onSuccess={response => {
                            if (response.credential) {
                                handleGoogleRegister(response.credential);
                            }
                        }}
                        onError={() => setError('Sign up with Google failed. Please try again or use email/password.')}
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
                        onFail={() => setError('Sign up with Facebook failed. Please try again or use email/password.')}
                        render={({ onClick }) => (
                            <button
                                onClick={onClick}
                                disabled={loading}
                                type="button"
                                style={{
                                    width: '100%',
                                    padding: '11px 16px',
                                    backgroundColor: loading ? '#bbb' : '#1877F2',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: 6,
                                    cursor: loading ? 'not-allowed' : 'pointer',
                                    fontWeight: 600,
                                    fontSize: 14,
                                    transition: 'all 0.2s',
                                }}
                                onMouseEnter={e => {
                                    if (!loading) (e.currentTarget as any).style.backgroundColor = '#0a66c2';
                                }}
                                onMouseLeave={e => {
                                    if (!loading) (e.currentTarget as any).style.backgroundColor = '#1877F2';
                                }}
                            >
                                Sign up with Facebook
                            </button>
                        )}
                    />
                )}
            </div>

            <div style={{ marginTop: 28, textAlign: 'center', fontSize: 14 }}>
                <span style={{ color: '#666' }}>Already have an account? </span>
                <Link to="/login" style={{ color: '#007bff', textDecoration: 'none', fontWeight: 600 }}>
                    Sign in
                </Link>
            </div>
        </div>
    );
}
