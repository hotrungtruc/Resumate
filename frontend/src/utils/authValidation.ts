/**
 * Centralized email and password validation rules
 * Ensures consistency between frontend validation and backend requirements
 */

export const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export interface ValidationError {
    field: string;
    message: string;
}

export const validateEmail = (email: string): string | null => {
    if (!email?.trim()) {
        return 'Email is required';
    }
    if (!emailRegex.test(email)) {
        return 'Please enter a valid email address';
    }
    return null;
};

export const validatePassword = (password: string, mode: 'login' | 'register' = 'login'): string | null => {
    if (!password) {
        return 'Password is required';
    }
    if (password.length < 8) {
        return 'Password must be at least 8 characters';
    }

    // For registration, enforce stronger password requirements
    if (mode === 'register') {
        if (!/[A-Z]/.test(password)) {
            return 'Password must contain at least one uppercase letter';
        }
        if (!/[0-9]/.test(password)) {
            return 'Password must contain at least one digit';
        }
    }

    return null;
};

export const validatePasswordConfirm = (password: string, confirm: string): string | null => {
    if (!confirm) {
        return 'Please confirm your password';
    }
    if (confirm !== password) {
        return 'Passwords do not match';
    }
    return null;
};

export const validateFullName = (name: string): string | null => {
    if (!name?.trim()) {
        return null; // Optional field
    }
    if (name.trim().length < 2) {
        return 'Name must be at least 2 characters';
    }
    if (name.trim().length > 100) {
        return 'Name must not exceed 100 characters';
    }
    return null;
};
