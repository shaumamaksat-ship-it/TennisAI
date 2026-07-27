import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{padding: 20, color: 'white', background: '#0f172a', minHeight: '100vh'}}>
          <h2 style={{color: 'red'}}>Ошибка:</h2>
          <pre style={{color: '#f87171', whiteSpace: 'pre-wrap'}}>
            {this.state.error && this.state.error.toString()}
          </pre>
          <p style={{marginTop: 20}}>Пришли этот текст ошибки мне</p>
        </div>
      );
    }
    return this.props.children;
  }
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
);
