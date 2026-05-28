import { useState, useRef, useEffect } from 'react';
import './App.css';
import HeroSection from './components/HeroSection';
import LoadingTerminal from './components/LoadingTerminal';
import Dashboard from './components/Dashboard';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

function App() {
  const [phase, setPhase] = useState('hero'); // 'hero' | 'loading' | 'dashboard'
  const [analysisData, setAnalysisData] = useState(null);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState(null);
  const dashboardRef = useRef(null);

  const handleAnalyze = async ({ targetRole, githubUsername, notionDatabaseId }) => {
    setFormData({ targetRole, githubUsername });
    setError(null);
    setPhase('loading');

    try {
      const res = await fetch(`${API_URL}/api/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetRole, githubUsername, notionDatabaseId })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Analysis failed');
      }

      setAnalysisData(data);
      setPhase('dashboard');
    } catch (err) {
      setError(err.message);
      setPhase('hero');
    }
  };

  const handleReset = () => {
    setPhase('hero');
    setAnalysisData(null);
    setError(null);
  };

  useEffect(() => {
    if (phase === 'dashboard' && dashboardRef.current) {
      dashboardRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [phase]);

  return (
    <div className="app">
      {/* Always show hero section */}
      {phase === 'hero' && (
        <HeroSection onAnalyze={handleAnalyze} error={error} />
      )}

      {/* Loading terminal */}
      {phase === 'loading' && (
        <LoadingTerminal
          targetRole={formData?.targetRole}
          githubUsername={formData?.githubUsername}
        />
      )}

      {/* Dashboard */}
      {phase === 'dashboard' && analysisData && (
        <div ref={dashboardRef}>
          <Dashboard
            data={analysisData}
            onReset={handleReset}
            apiUrl={API_URL}
          />
        </div>
      )}
    </div>
  );
}

export default App;
