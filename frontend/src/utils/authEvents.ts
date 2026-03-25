/**
 * Auth event emitter for handling authentication state changes
 * Allows components to react to session expiration and auth errors
 * without hard redirects or local state pollution
 */

export type AuthEventType = 'session_expired' | 'session_expiring_soon' | 'auth_error' | 'login_required';

export interface AuthEvent {
    type: AuthEventType;
    message: string;
    timestamp: number;
}

class AuthEventEmitter {
    private listeners: ((event: AuthEvent) => void)[] = [];

    subscribe(listener: (event: AuthEvent) => void): () => void {
        this.listeners.push(listener);
        // Return unsubscribe function
        return () => {
            this.listeners = this.listeners.filter(l => l !== listener);
        };
    }

    emit(type: AuthEventType, message: string): void {
        const event: AuthEvent = {
            type,
            message,
            timestamp: Date.now(),
        };
        this.listeners.forEach(listener => {
            try {
                listener(event);
            } catch (err) {
                console.error('Error in auth event listener:', err);
            }
        });
    }

    // Helper methods
    sessionExpired(): void {
        this.emit('session_expired', 'Your session has expired. Please log in again.');
    }

    sessionExpiringsoon(): void {
        this.emit('session_expiring_soon', 'Your session will expire soon. Please save your work.');
    }

    authError(message: string): void {
        this.emit('auth_error', message);
    }

    loginRequired(): void {
        this.emit('login_required', 'You need to log in to access this resource.');
    }
}

export const authEventEmitter = new AuthEventEmitter();
