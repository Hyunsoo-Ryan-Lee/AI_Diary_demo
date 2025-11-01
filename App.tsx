import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { Entry, AnalysisResult } from './types';
import CalendarView from './components/CalendarView';
import EntryEditor from './components/EntryEditor';
import AnalysisDashboard from './components/AnalysisDashboard';
import { HeaderIcon, SunIcon, MoonIcon } from './components/icons';

const App: React.FC = () => {
  const [entries, setEntries] = useState<Record<string, Entry>>({
    '2024-07-20': { date: '2024-07-20', content: 'Started working on the new dashboard project. Focused on setting up the initial file structure and component planning. AI analysis features will be the core challenge.', tags: ['project-kickoff', 'react', 'planning'] },
    '2024-07-21': { date: '2024-07-21', content: 'Developed the Calendar and Entry Editor components. Implemented state management for daily entries. The UI is coming together with TailwindCSS.', tags: ['frontend', 'react', 'ui-dev'] },
    '2024-07-22': { date: '2024-07-22', content: 'Integrated Gemini API for tag suggestions. The AI is surprisingly accurate at identifying keywords. Also drafted the prompt for the main analysis feature.', tags: ['ai', 'gemini-api', 'nlp'] },
    '2024-07-23': { date: '2024-07-23', content: 'Worked on the analysis dashboard visualization. Used Recharts for a bar chart to show topic frequency. This will be a key part of the user experience.', tags: ['data-viz', 'recharts', 'dashboard'] },
    '2024-07-24': { date: '2024-07-24', content: 'Refined the overall UI/UX, focusing on a clean, dark-mode theme. Added loading states and empty states to improve user feedback. The dashboard project is making good progress.', tags: ['ui-ux', 'design', 'refinement'] },
  });
  const today = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState<string>(today);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light' || savedTheme === 'dark') {
        return savedTheme;
    }
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
        root.classList.add('dark');
    } else {
        root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);


  const selectedEntry = useMemo(() => entries[selectedDate], [entries, selectedDate]);

  const handleSaveEntry = useCallback((entry: Entry) => {
    setEntries(prevEntries => ({
      ...prevEntries,
      [entry.date]: entry,
    }));
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200 font-sans transition-colors duration-300">
      <header className="bg-white/80 dark:bg-gray-800/50 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700 p-4 flex items-center justify-center sticky top-0 z-10">
        <HeaderIcon />
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white ml-3">AI Work/Diary Analysis Dashboard</h1>
        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="ml-auto p-2 rounded-full text-gray-500 hover:bg-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 transition-colors"
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
        </button>
      </header>

      <main className="p-4 sm:p-6 lg:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 max-w-7xl mx-auto">
        <div className="lg:col-span-4 space-y-8">
          <CalendarView
            entries={Object.keys(entries)}
            selectedDate={selectedDate}
            onDateSelect={setSelectedDate}
          />
          <AnalysisDashboard
            entries={Object.values(entries)}
            analysisResult={analysisResult}
            setAnalysisResult={setAnalysisResult}
          />
        </div>

        <div className="lg:col-span-8">
          <EntryEditor
            key={selectedDate} // Re-mount component when date changes
            date={selectedDate}
            entry={selectedEntry}
            onSave={handleSaveEntry}
          />
        </div>
      </main>
    </div>
  );
};

export default App;