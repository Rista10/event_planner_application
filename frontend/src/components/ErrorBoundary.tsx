import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
        console.error('ErrorBoundary caught an error:', error, errorInfo);
    }

    render(): ReactNode {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <div className="flex min-h-screen items-center justify-center bg-gray-50">
                    <div className="text-center">
                        <h1 className="text-2xl font-bold text-gray-900">Something went wrong</h1>
                        <p className="mt-2 text-gray-600">
                            {this.state.error?.message || 'An unexpected error occurred.'}
                        </p>
                        <button
                            className="mt-4 rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                            onClick={() => window.location.reload()}
                        >
                            Reload Page
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
