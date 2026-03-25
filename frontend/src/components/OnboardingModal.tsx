import { CSSProperties, useState } from 'react';
import api from '../api/axios';

interface OnboardingModalProps {
    isOpen: boolean;
    onComplete: (method: 'linkedin' | 'cv' | 'skip') => void;
}

const OnboardingModal = ({ isOpen, onComplete }: OnboardingModalProps) => {
    const [activeOption, setActiveOption] = useState<'linkedin' | 'cv' | 'skip' | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    if (!isOpen) return null;

    const handleLinkedIn = async () => {
        setLoading(true);
        setError(null);
        try {
            // TODO: Implement LinkedIn OAuth flow
            // For now, just mark as completed
            await api.patch('/users/me', { has_completed_onboarding: true });
            setActiveOption(null); // Reset state before completing
            onComplete('linkedin');
        } catch (err: any) {
            setError(err?.response?.data?.detail || 'Failed to connect LinkedIn');
        } finally {
            setLoading(false);
        }
    };

    const handleCVUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) {
            // User cancelled file selection - reset activeOption
            setActiveOption(null);
            // Reset file input value
            e.target.value = '';
            return;
        }

        setLoading(true);
        setError(null);
        try {
            const formData = new FormData();
            formData.append('file', file);

            // TODO: Send to CV OCR endpoint
            // const res = await api.post('/resumes/extract-from-cv', formData);

            // For now, just mark as completed
            await api.patch('/users/me', { has_completed_onboarding: true });
            setActiveOption(null); // Reset state before completing
            e.target.value = ''; // Reset file input value
            onComplete('cv');
        } catch (err: any) {
            setError(err?.response?.data?.detail || 'Failed to upload CV');
            setActiveOption(null); // Reset on error
            e.target.value = ''; // Reset file input value
        } finally {
            setLoading(false);
        }
    };

    const handleSkip = async () => {
        setLoading(true);
        setError(null);
        try {
            await api.patch('/users/me', { has_completed_onboarding: true });
            setActiveOption(null); // Reset state before completing
            onComplete('skip');
        } catch (err: any) {
            setError(err?.response?.data?.detail || 'Failed to complete onboarding');
        } finally {
            setLoading(false);
        }
    };

    const styles = {
        overlay: {
            position: 'fixed' as const,
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
        },
        modal: {
            backgroundColor: 'white',
            borderRadius: 8,
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.15)',
            maxWidth: 600,
            width: '90%',
            padding: 32,
            textAlign: 'center' as const,
        },
        title: {
            fontSize: 28,
            fontWeight: 'bold',
            marginBottom: 12,
            color: '#333',
        },
        subtitle: {
            fontSize: 16,
            color: '#666',
            marginBottom: 32,
            lineHeight: 1.5,
        },
        optionsContainer: {
            display: 'flex',
            flexDirection: 'column' as const,
            gap: 16,
            marginBottom: 24,
        },
        optionButton: {
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            padding: 20,
            backgroundColor: '#f5f5f5',
            border: '2px solid transparent',
            borderRadius: 8,
            cursor: 'pointer',
            transition: 'all 0.2s',
            fontSize: 16,
            fontWeight: 500,
            color: '#333',
        } as CSSProperties,
        optionButtonActive: {
            backgroundColor: '#e3f2fd',
            borderColor: '#1976d2',
            color: '#1976d2',
        } as CSSProperties,
        optionIcon: {
            fontSize: 28,
            minWidth: 40,
        },
        optionText: {
            textAlign: 'left' as const,
            flex: 1,
        },
        optionTitle: {
            fontWeight: 'bold',
            display: 'block',
            marginBottom: 4,
        },
        optionDesc: {
            fontSize: 13,
            color: '#999',
            display: 'block',
        },
        cvInput: {
            display: 'none',
        },
        buttonGroup: {
            display: 'flex',
            gap: 12,
            justifyContent: 'center',
        },
        button: {
            padding: '12px 24px',
            borderRadius: 4,
            border: 'none',
            fontSize: 14,
            fontWeight: 'bold',
            cursor: 'pointer',
            transition: 'all 0.2s',
        },
        continueBtn: {
            backgroundColor: '#1976d2',
            color: 'white',
            flex: 1,
        },
        skipBtn: {
            backgroundColor: '#f0f0f0',
            color: '#333',
            minWidth: 100,
        },
        error: {
            color: '#d32f2f',
            fontSize: 13,
            marginTop: 12,
            padding: '8px',
            backgroundColor: '#ffebee',
            borderRadius: 4,
        },
    };

    return (
        <div style={styles.overlay}>
            <div style={styles.modal}>
                <div style={styles.title}>Welcome to Resumate!</div>
                <div style={styles.subtitle}>
                    Let's get you started. Choose how you'd like to build your profile:
                </div>

                <div style={styles.optionsContainer}>
                    {/* LinkedIn Option - Click sets activeOption to 'linkedin' */}
                    <button
                        style={{
                            ...styles.optionButton,
                            ...(activeOption === 'linkedin' ? styles.optionButtonActive : {}),
                        }}
                        onClick={() => setActiveOption('linkedin')}
                        disabled={loading}
                    >
                        <span style={styles.optionIcon}>💼</span>
                        <div style={styles.optionText}>
                            <span style={styles.optionTitle}>Import from LinkedIn</span>
                            <span style={styles.optionDesc}>
                                Automatically populate your profile with LinkedIn data
                            </span>
                        </div>
                    </button>

                    {/* CV Upload Option - Click sets activeOption to 'cv' AND opens file dialog */}
                    <button
                        style={{
                            ...styles.optionButton,
                            ...(activeOption === 'cv' ? styles.optionButtonActive : {}),
                        }}
                        onClick={() => {
                            setActiveOption('cv');
                            setTimeout(() => document.getElementById('cv-input')?.click(), 0);
                        }}
                        disabled={loading}
                    >
                        <span style={styles.optionIcon}>📄</span>
                        <div style={styles.optionText}>
                            <span style={styles.optionTitle}>Upload CV (PDF/DOCX)</span>
                            <span style={styles.optionDesc}>
                                We'll extract your resume data using OCR
                            </span>
                        </div>
                        <input
                            id="cv-input"
                            type="file"
                            style={styles.cvInput}
                            accept=".pdf,.docx,.doc"
                            onChange={handleCVUpload}
                            disabled={loading}
                        />
                    </button>

                    {/* Skip Option - Click sets activeOption to 'skip' */}
                    <button
                        style={{
                            ...styles.optionButton,
                            ...(activeOption === 'skip' ? styles.optionButtonActive : {}),
                        }}
                        onClick={() => setActiveOption('skip')}
                        disabled={loading}
                    >
                        <span style={styles.optionIcon}>⭐</span>
                        <div style={styles.optionText}>
                            <span style={styles.optionTitle}>Start Fresh</span>
                            <span style={styles.optionDesc}>
                                Build your profile from scratch manually
                            </span>
                        </div>
                    </button>
                </div>

                {error && <div style={styles.error}>{error}</div>}

                <div style={styles.buttonGroup}>
                    {activeOption === 'linkedin' && (
                        <button
                            style={{
                                ...styles.button,
                                ...styles.continueBtn,
                            }}
                            onClick={handleLinkedIn}
                            disabled={loading}
                        >
                            {loading ? 'Connecting...' : 'Continue with LinkedIn'}
                        </button>
                    )}
                    {activeOption === 'cv' && (
                        <button
                            style={{
                                ...styles.button,
                                ...styles.continueBtn,
                            }}
                            onClick={() => document.getElementById('cv-input')?.click()}
                            disabled={loading}
                        >
                            {loading ? 'Processing...' : 'Browse Files'}
                        </button>
                    )}
                    {activeOption === 'skip' && (
                        <button
                            style={{
                                ...styles.button,
                                ...styles.continueBtn,
                            }}
                            onClick={handleSkip}
                            disabled={loading}
                        >
                            {loading ? 'Processing...' : 'Start Fresh'}
                        </button>
                    )}
                    {activeOption && (
                        <button
                            style={{ ...styles.button, ...styles.skipBtn }}
                            onClick={() => setActiveOption(null)}
                            disabled={loading}
                        >
                            Back
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default OnboardingModal;
