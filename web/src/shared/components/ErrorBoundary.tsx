import { Component, type ReactNode, type ErrorInfo } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
}

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('ErrorBoundary caught:', error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback ?? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <p className="text-lg font-semibold text-danger">Algo salio mal</p>
            <button
              onClick={() => this.setState({ hasError: false })}
              className="text-sm text-primary font-medium hover:underline"
            >
              Reintentar
            </button>
          </div>
        )
      );
    }
    return this.props.children;
  }
}
