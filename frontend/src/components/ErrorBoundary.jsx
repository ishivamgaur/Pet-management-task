import { Component } from "react";

// Catches render crashes so a bug shows a message instead of a blank page.
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  render() {
    if (!this.state.error) return this.props.children;

    return (
      <div className="mx-auto max-w-[1080px] px-5 py-20 text-center">
        <h2 className="font-display text-2xl">Something went wrong on this page</h2>
        <p className="mt-2 text-muted">{this.state.error.message}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 inline-flex min-h-10 items-center rounded-full bg-forest px-5 text-sm font-semibold text-white"
        >
          Reload page
        </button>
      </div>
    );
  }
}
