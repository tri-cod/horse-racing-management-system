import { Component } from 'react';
import '../assets/css/ErrorBoundary.css';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error('[ErrorBoundary]', error, info.componentStack);
  }

  handleReset = () => {
    this.setState({ error: null });
  };

  render() {
    if (this.state.error) {
      if (this.props.fallback) {
        return this.props.fallback(this.state.error, this.handleReset);
      }

      return (
        <div className="error-boundary">
          <div className="error-boundary__card">
            <h2 className="error-boundary__title">Đã có lỗi xảy ra</h2>
            <p className="error-boundary__message">
              {this.state.error?.message || 'Lỗi không xác định'}
            </p>
            <div className="error-boundary__actions">
              <button className="btn btn--primary" onClick={this.handleReset}>
                Thử lại
              </button>
              <button className="btn btn--secondary" onClick={() => window.location.href = '/'}>
                Về trang chủ
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
