import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }
  static getDerivedStateFromError(error) {
    return { error };
  }
  render() {
    if (this.state.error) {
      return (
        <div style={{ background: '#080808', color: '#fff', minHeight: '100vh', padding: '24px 20px', fontFamily: 'monospace' }}>
          <div style={{ color: '#ff4444', fontSize: 18, fontWeight: 700, marginBottom: 12 }}>App crashed — render error</div>
          <pre style={{ fontSize: 13, color: '#ff8888', whiteSpace: 'pre-wrap', wordBreak: 'break-all', marginBottom: 16 }}>
            {this.state.error.toString()}
          </pre>
          <pre style={{ fontSize: 11, color: '#555', whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
            {this.state.error.stack}
          </pre>
          <button
            onClick={() => this.setState({ error: null })}
            style={{ marginTop: 20, padding: '8px 20px', background: '#1a1a1a', border: '1px solid #333', borderRadius: 8, color: '#fff', cursor: 'pointer' }}>
            Retry
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>,
)
