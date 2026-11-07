import React from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

class ErrorBoundary extends React.Component<
  {children: React.ReactNode},
  {hasError: boolean; error: Error | null}
> {
  constructor(props: {children: React.ReactNode}) {
    super(props);
    this.state = {hasError: false, error: null};
  }

  static getDerivedStateFromError(error: Error) {
    return {hasError: true, error};
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Portfolio App Crash caught by ErrorBoundary:', error, errorInfo);
  }

  handleReload = () => {
    localStorage.removeItem('ronny_v2_photos_map');
    localStorage.removeItem('ronny_v2_demo_inquiries');
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#F8F6F0] flex flex-col items-center justify-center p-6 text-center text-[#111215] font-['Kanit',sans-serif]">
          <div className="funky-card bg-white p-8 max-w-lg rounded-3xl border-2 border-[#111215] shadow-[6px_6px_0px_#111215] flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-[#FF5500]/10 border-2 border-[#111215] flex items-center justify-center text-[#FF5500] text-3xl font-black">
              ✦
            </div>
            <h1 className="text-2xl font-black uppercase tracking-tight">
              Onset Media · Portfolio
            </h1>
            <p className="text-sm text-[#5C6F74] font-mono">
              The application encountered a display glitch. Click below to recover with fresh assets.
            </p>
            <button
              onClick={this.handleReload}
              className="px-6 py-2.5 rounded-xl bg-[#D2FF3A] hover:bg-[#bde82c] text-[#111215] border-2 border-[#111215] font-mono font-bold uppercase shadow-[3px_3px_0px_#111215] cursor-pointer active:translate-x-0.5 active:translate-y-0.5"
            >
              Reload Studio
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

createRoot(document.getElementById('root')!).render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
);
