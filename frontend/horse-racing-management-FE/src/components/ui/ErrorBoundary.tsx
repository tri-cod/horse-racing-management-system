import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
 children: ReactNode;
 fallback?: ReactNode;
}

interface State {
 hasError: boolean;
 message: string;
}

export class ErrorBoundary extends Component<Props, State> {
 state: State = { hasError: false, message: '' };

 static getDerivedStateFromError(error: Error): State {
 return { hasError: true, message: error.message };
 }

 componentDidCatch(error: Error, info: ErrorInfo) {
 console.error('[ErrorBoundary]', error, info.componentStack);
 }

 handleReset = () => this.setState({ hasError: false, message: '' });

 render() {
 if (this.state.hasError) {
 if (this.props.fallback) return this.props.fallback;
 return (
 <div className="">
 <h2 className="">Something went wrong</h2>
 <p className="">{this.state.message}</p>
 <button className="" onClick={this.handleReset}>Try again</button>
 </div>
 );
 }
 return this.props.children;
 }
}
