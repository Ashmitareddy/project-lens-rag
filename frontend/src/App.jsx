import React, { useState, useEffect } from 'react';
import { analyzeProject } from './api/analyze';
import Results from './components/Results';
import { FaHistory, FaPlus, FaSpinner } from 'react-icons/fa';

const DOMAIN_OPTIONS = [
  "FinTech", "HealthTech", "EdTech", "E-Commerce", "SaaS", 
  "Cybersecurity", "AI/ML", "Cloud Engineering", "DevOps", 
  "Data Engineering", "Enterprise Software", "Product-Based Companies", 
  "Service-Based Companies", "Other"
];

const ROLE_OPTIONS = [
  "Frontend Developer", "Backend Developer", "Full Stack Developer", 
  "Software Engineer", "Data Analyst", "Data Engineer", 
  "Machine Learning Engineer", "AI Engineer", "DevOps Engineer", 
  "Cloud Engineer", "Security Engineer", "Product Engineer", "Other"
];

export default function App() {
  const [history, setHistory] = useState([]);
  const [activeSession, setActiveSession] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Form State
  const [domain, setDomain] = useState('');
  const [customDomain, setCustomDomain] = useState('');
  const [role, setRole] = useState('');
  const [customRole, setCustomRole] = useState('');
  const [techStack, setTechStack] = useState('');
  const [projectDescription, setProjectDescription] = useState('');

  // Load history on mount
  useEffect(() => {
    const saved = localStorage.getItem('lens_history');
    if (saved) {
      setHistory(JSON.parse(saved));
    }
  }, []);

  const saveToHistory = (data, reqData) => {
    const newEntry = {
      id: Date.now(),
      date: new Date().toISOString(),
      reqData,
      result: data
    };
    const newHistory = [newEntry, ...history];
    setHistory(newHistory);
    localStorage.setItem('lens_history', JSON.stringify(newHistory));
    setActiveSession(newEntry);
  };

  const handleNew = () => {
    setActiveSession(null);
    setDomain('');
    setCustomDomain('');
    setRole('');
    setCustomRole('');
    setTechStack('');
    setProjectDescription('');
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    const finalDomain = domain === 'Other' ? customDomain : domain;
    const finalRole = role === 'Other' ? customRole : role;

    if (!finalDomain || !finalRole || !techStack || !projectDescription) {
      setError("Please fill in all required fields.");
      return;
    }

    setLoading(true);
    const reqData = { domain: finalDomain, role: finalRole, techStack, projectDescription };
    
    try {
      const data = await analyzeProject(reqData);
      saveToHistory(data, reqData);
    } catch (err) {
      setError(err.message || "Failed to analyze project.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden font-sans">
      
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-gray-200 flex flex-col hidden md:flex">
        <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
          <h1 className="font-bold text-xl text-gray-800 tracking-tight">Project<span className="text-[var(--color-primary-dark)]">-Lens</span></h1>
        </div>
        <div className="p-4">
          <button 
            onClick={handleNew}
            className="w-full flex items-center justify-center space-x-2 bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-gray-900 px-4 py-2 rounded-lg font-medium transition-colors"
          >
            <FaPlus /> <span>New Analysis</span>
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 flex items-center"><FaHistory className="mr-2"/> History</h3>
          {history.length === 0 && <p className="text-sm text-gray-400">No previous analyses.</p>}
          {history.map(item => (
            <div 
              key={item.id} 
              onClick={() => setActiveSession(item)}
              className={`p-3 rounded-lg cursor-pointer text-sm truncate transition-colors ${activeSession?.id === item.id ? 'bg-[var(--color-primary)]/20 border border-[var(--color-primary)]' : 'hover:bg-gray-100 border border-transparent'}`}
            >
              <div className="font-medium text-gray-800 truncate">{item.reqData.domain} - {item.reqData.role}</div>
              <div className="text-xs text-gray-500 truncate mt-1">Score: {item.result.suitabilityScore} • {new Date(item.date).toLocaleDateString()}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto scroll-smooth">
        
        {/* Header (Mobile) */}
        <div className="md:hidden bg-white p-4 border-b flex justify-between items-center sticky top-0 z-10">
          <h1 className="font-bold text-xl text-gray-800">Project<span className="text-[var(--color-primary-dark)]">-Lens</span></h1>
          <button onClick={handleNew} className="text-gray-600"><FaPlus /></button>
        </div>

        <div className="max-w-5xl mx-auto p-6 md:p-12">
          
          {/* Main Form */}
          {!activeSession && (
            <div className="max-w-3xl mx-auto animate-fade-in-up">
              <div className="text-center mb-10">
                <h2 className="text-4xl font-extrabold text-gray-900 tracking-tight mb-4">Evaluate your engineering project</h2>
                <p className="text-lg text-gray-500">Benchmark your project against real-world standards and generate a roadmap to scale.</p>
              </div>

              <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 space-y-6">
                
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                    {error}
                  </div>
                )}

                <div className="grid md:grid-cols-3 gap-6">
                  {/* Domain */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Target Domain</label>
                    <select 
                      value={domain} onChange={e => setDomain(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent outline-none transition-all"
                    >
                      <option value="">Select Domain...</option>
                      {DOMAIN_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                    {domain === 'Other' && (
                      <input type="text" placeholder="Specify Domain" value={customDomain} onChange={e => setCustomDomain(e.target.value)} className="mt-2 w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-[var(--color-primary)] outline-none" />
                    )}
                  </div>
                  
                  {/* Role */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Target Role</label>
                    <select 
                      value={role} onChange={e => setRole(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent outline-none transition-all"
                    >
                      <option value="">Select Role...</option>
                      {ROLE_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                    {role === 'Other' && (
                      <input type="text" placeholder="Specify Role" value={customRole} onChange={e => setCustomRole(e.target.value)} className="mt-2 w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-[var(--color-primary)] outline-none" />
                    )}
                  </div>

                  {/* Tech Stack */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Tech Stack</label>
                    <input 
                      type="text" 
                      placeholder="e.g. React, Node, MongoDB"
                      value={techStack} onChange={e => setTechStack(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent outline-none transition-all"
                    />
                  </div>
                </div>

                {/* Project Description */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Project Description</label>
                  <textarea 
                    rows="6"
                    placeholder="Describe your project architecture, features, tech stack, and implementation details..."
                    value={projectDescription} onChange={e => setProjectDescription(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent outline-none transition-all resize-none"
                  ></textarea>
                </div>

                <div className="flex justify-center pt-2">
                  <button 
                    type="submit" 
                    disabled={loading}
                    className="w-full md:w-auto bg-gray-900 hover:bg-gray-800 text-white font-semibold py-3 px-12 rounded-xl transition-all shadow-md flex items-center justify-center disabled:opacity-70"
                  >
                    {loading ? <FaSpinner className="animate-spin mr-2" /> : null}
                    {loading ? 'Analyzing Project...' : 'Analyze Project'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="mt-20 flex flex-col items-center justify-center space-y-4 text-gray-500 animate-pulse">
              <div className="w-16 h-16 border-4 border-t-[var(--color-primary-dark)] border-gray-200 rounded-full animate-spin"></div>
              <p>Cross-referencing engineering standards...</p>
            </div>
          )}

          {/* Results View */}
          {activeSession && !loading && (
            <Results data={activeSession.result} />
          )}

        </div>
      </div>
    </div>
  );
}
