import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home, Bug, X } from 'lucide-react';
import { NeumorphicButton } from '@/components/ui/neumorphic-button';
import { NeumorphicCard } from '@/components/ui/neumorphic-card';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorId: string;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: ''
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error,
      errorId: Math.random().toString(36).substr(2, 9)
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    this.setState({
      error,
      errorInfo,
      errorId: Math.random().toString(36).substr(2, 9)
    });

    // Log error to external service
    this.logError(error, errorInfo);
    
    // Call custom error handler
    this.props.onError?.(error, errorInfo);
  }

  logError = (error: Error, errorInfo: ErrorInfo) => {
    const errorData = {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      errorId: this.state.errorId,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href
    };

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Error Details:', errorData);
    }

    // Send to error reporting service
    this.sendErrorReport(errorData);
  };

  sendErrorReport = async (errorData: any) => {
    try {
      // In a real app, send to error reporting service like Sentry
      // await fetch('/api/errors', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(errorData)
      // });
      
      console.log('Error report would be sent:', errorData);
    } catch (reportingError) {
      console.error('Failed to send error report:', reportingError);
    }
  };

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: ''
    });
  };

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  handleReportBug = () => {
    const errorData = {
      errorId: this.state.errorId,
      error: this.state.error?.message,
      stack: this.state.error?.stack,
      componentStack: this.state.errorInfo?.componentStack,
      timestamp: new Date().toISOString()
    };

    // Copy error details to clipboard
    navigator.clipboard.writeText(JSON.stringify(errorData, null, 2))
      .then(() => {
        alert('Error details copied to clipboard. Please share this with the support team.');
      })
      .catch(() => {
        alert('Please copy the error details manually and share with support.');
      });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
          <NeumorphicCard className="w-full max-w-2xl p-8">
            <div className="text-center space-y-6">
              {/* Error Icon */}
              <div className="flex justify-center">
                <div className="w-20 h-20 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center">
                  <AlertTriangle className="h-10 w-10 text-red-600 dark:text-red-400" />
                </div>
              </div>

              {/* Error Title */}
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  Oops! Something went wrong
                </h1>
                <p className="text-gray-600 dark:text-gray-300">
                  We're sorry, but something unexpected happened. Our team has been notified.
                </p>
              </div>

              {/* Error Details */}
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details className="text-left bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
                  <summary className="cursor-pointer font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Error Details (Development)
                  </summary>
                  <div className="space-y-2 text-sm">
                    <div>
                      <strong>Error ID:</strong> {this.state.errorId}
                    </div>
                    <div>
                      <strong>Message:</strong> {this.state.error.message}
                    </div>
                    <div>
                      <strong>Stack:</strong>
                      <pre className="mt-1 p-2 bg-gray-200 dark:bg-gray-700 rounded text-xs overflow-auto">
                        {this.state.error.stack}
                      </pre>
                    </div>
                    {this.state.errorInfo && (
                      <div>
                        <strong>Component Stack:</strong>
                        <pre className="mt-1 p-2 bg-gray-200 dark:bg-gray-700 rounded text-xs overflow-auto">
                          {this.state.errorInfo.componentStack}
                        </pre>
                      </div>
                    )}
                  </div>
                </details>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <NeumorphicButton
                  onClick={this.handleRetry}
                  className="flex items-center space-x-2 px-6 py-3"
                >
                  <RefreshCw className="h-4 w-4" />
                  <span>Try Again</span>
                </NeumorphicButton>

                <NeumorphicButton
                  onClick={this.handleReload}
                  variant="secondary"
                  className="flex items-center space-x-2 px-6 py-3"
                >
                  <RefreshCw className="h-4 w-4" />
                  <span>Reload Page</span>
                </NeumorphicButton>

                <NeumorphicButton
                  onClick={this.handleGoHome}
                  variant="ghost"
                  className="flex items-center space-x-2 px-6 py-3"
                >
                  <Home className="h-4 w-4" />
                  <span>Go Home</span>
                </NeumorphicButton>
              </div>

              {/* Report Bug Button */}
              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <NeumorphicButton
                  onClick={this.handleReportBug}
                  variant="ghost"
                  className="flex items-center space-x-2 px-4 py-2 text-sm"
                >
                  <Bug className="h-4 w-4" />
                  <span>Report Bug</span>
                </NeumorphicButton>
              </div>

              {/* Error ID for Support */}
              <div className="text-xs text-gray-500 dark:text-gray-400">
                Error ID: {this.state.errorId}
              </div>
            </div>
          </NeumorphicCard>
        </div>
      );
    }

    return this.props.children;
  }
}

// Higher-order component for error boundaries
export const withErrorBoundary = <P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<Props, 'children'>
) => {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;
  return WrappedComponent;
};

// Global error handler
export const setupGlobalErrorHandling = () => {
  // Handle unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
    
    // Log to error reporting service
    const errorData = {
      type: 'unhandledrejection',
      reason: event.reason,
      timestamp: new Date().toISOString(),
      url: window.location.href
    };
    
    console.log('Promise rejection error:', errorData);
  });

  // Handle JavaScript errors
  window.addEventListener('error', (event) => {
    console.error('Global error:', event.error);
    
    const errorData = {
      type: 'javascript',
      message: event.message,
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
      error: event.error,
      timestamp: new Date().toISOString(),
      url: window.location.href
    };
    
    console.log('Global error:', errorData);
  });
};

// Error reporting hook
export const useErrorReporting = () => {
  const reportError = (error: Error, context?: string) => {
    const errorData = {
      message: error.message,
      stack: error.stack,
      context,
      timestamp: new Date().toISOString(),
      url: window.location.href
    };

    console.error('Reported error:', errorData);
    
    // Send to error reporting service
    // fetch('/api/errors', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(errorData)
    // });
  };

  return { reportError };
};
