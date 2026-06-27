import React from "react";

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        this.setState({ errorInfo });
        console.error("ErrorBoundary caught an error", error, errorInfo);
    }

    handleReset = () => {
        this.setState({ hasError: false, error: null, errorInfo: null });
        if (this.props.onReset) {
            this.props.onReset();
        }
    };

    render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <div className="box" style={{ margin: "1rem", border: "1px solid var(--color-accent-4)" }}>
                    <article className="message is-danger">
                        <div className="message-header" style={{ backgroundColor: "var(--color-accent-4)", color: "#fff" }}>
                            <p style={{ display: "flex", alignItems: "center", gap: "0.5rem", margin: 0 }}>
                                <i className="fas fa-exclamation-triangle"></i>
                                <span>Something went wrong</span>
                            </p>
                        </div>
                        <div className="message-body" style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                            <p>An unexpected error occurred in this section of the application.</p>
                            
                            <div style={{ display: "flex", gap: "0.5rem" }}>
                                <button className="button is-small is-danger is-outlined" onClick={this.handleReset}>
                                    Try Again
                                </button>
                                <button className="button is-small is-light" onClick={() => window.location.reload()}>
                                    Reload Page
                                </button>
                            </div>

                            {this.state.error && (
                                <details className="is-size-7" style={{ marginTop: "0.5rem" }}>
                                    <summary style={{ cursor: "pointer", color: "var(--color-accent-4)", borderBottom: "none" }}>
                                        Error Details
                                    </summary>
                                    <pre className="has-background-light p-3 mt-2" style={{ whiteSpace: "pre-wrap", overflowX: "auto" }}>
                                        {this.state.error.toString()}
                                        {this.state.errorInfo && this.state.errorInfo.componentStack}
                                    </pre>
                                </details>
                            )}
                        </div>
                    </article>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
