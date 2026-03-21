import { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  componentStack: string;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null, componentStack: '' };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, componentStack: '' };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({ componentStack: errorInfo.componentStack || '' });
    console.error('Error caught by boundary:', error, errorInfo);
  }

  resetError = () => {
    this.setState({ hasError: false, error: null, componentStack: '' });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
          padding: '20px',
          backgroundColor: '#f5f5f5',
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '40px',
            borderRadius: '8px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            maxWidth: '500px',
            textAlign: 'center',
          }}>
            <h1 style={{ color: '#d32f2f', marginBottom: '16px' }}>
              Oops! Something went wrong
            </h1>
            <p style={{ color: '#666', marginBottom: '20px' }}>
              We encountered an unexpected error. Please try refreshing the page.
            </p>
            {this.state.error && (
              <details style={{
                textAlign: 'left',
                backgroundColor: '#f9f9f9',
                padding: '16px',
                borderRadius: '4px',
                marginBottom: '20px',
                maxHeight: '200px',
                overflowY: 'auto',
              }}>
                <summary style={{ cursor: 'pointer', color: '#666' }}>
                  Error Details
                </summary>
                <pre style={{
                  marginTop: '12px',
                  fontSize: '12px',
                  color: '#d32f2f',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                }}>
                  {this.state.error.toString()}
                </pre>
                {this.state.componentStack && (
                  <pre style={{
                    marginTop: '12px',
                    fontSize: '11px',
                    color: '#444',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                  }}>
                    {this.state.componentStack}
                  </pre>
                )}
              </details>
            )}
            <button
              onClick={this.resetError}
              style={{
                padding: '12px 24px',
                backgroundColor: '#1976d2',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '16px',
              }}
            >
              Try Again
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
