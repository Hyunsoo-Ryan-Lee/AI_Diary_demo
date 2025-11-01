import React, { useState, useMemo } from 'react';
import { Entry, AnalysisResult, Topic } from '../types';
import { analyzeEntries } from '../services/geminiService';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { ChartIcon } from './icons';


interface AnalysisDashboardProps {
  entries: Entry[];
  analysisResult: AnalysisResult | null;
  setAnalysisResult: (result: AnalysisResult | null) => void;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-gray-800 p-2 border border-gray-200 dark:border-gray-600 rounded-md shadow-lg">
        <p className="label text-gray-900 dark:text-white font-bold">{`${label}`}</p>
        <p className="intro text-indigo-500 dark:text-indigo-300">{`Frequency : ${payload[0].value}`}</p>
      </div>
    );
  }

  return null;
};

const AnalysisDashboard: React.FC<AnalysisDashboardProps> = ({ entries, analysisResult, setAnalysisResult }) => {
  const [isLoading, setIsLoading] = useState(false);

  const sortedDates = useMemo(() => entries.map(e => e.date).sort(), [entries]);
  const defaultStartDate = sortedDates[0] || new Date().toISOString().split('T')[0];
  const defaultEndDate = sortedDates[sortedDates.length - 1] || new Date().toISOString().split('T')[0];

  const [startDate, setStartDate] = useState(defaultStartDate);
  const [endDate, setEndDate] = useState(defaultEndDate);

  const handleAnalyze = async () => {
    setIsLoading(true);
    setAnalysisResult(null);
    const filteredEntries = entries.filter(e => e.date >= startDate && e.date <= endDate);
    if (filteredEntries.length > 0) {
      const result = await analyzeEntries(filteredEntries, startDate, endDate);
      setAnalysisResult(result);
    }
    setIsLoading(false);
  };
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg border border-gray-200 dark:border-gray-700">
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">AI Analysis</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label htmlFor="start-date" className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Start Date</label>
          <input type="date" id="start-date" value={startDate} onChange={e => setStartDate(e.target.value)} className="w-full bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded-md p-2 text-gray-900 dark:text-white focus:ring-indigo-500 focus:border-indigo-500 dark:[color-scheme:dark]"/>
        </div>
        <div>
          <label htmlFor="end-date" className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">End Date</label>
          <input type="date" id="end-date" value={endDate} onChange={e => setEndDate(e.target.value)} className="w-full bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded-md p-2 text-gray-900 dark:text-white focus:ring-indigo-500 focus:border-indigo-500 dark:[color-scheme:dark]"/>
        </div>
      </div>
      <button 
        onClick={handleAnalyze} 
        disabled={isLoading}
        className="w-full flex items-center justify-center bg-indigo-600 text-white font-semibold py-2 px-4 rounded-md hover:bg-indigo-500 transition-colors disabled:opacity-50 disabled:cursor-wait"
      >
        {isLoading ? (
             <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
        ) : (
          <ChartIcon />
        )}
        <span className="ml-2">{isLoading ? 'Analyzing...' : 'Analyze Period'}</span>
      </button>

      {isLoading && (
        <div className="text-center p-8 text-gray-400">
          <p>AI is analyzing your entries...</p>
        </div>
      )}

      {!isLoading && analysisResult && (
        <div className="mt-6 space-y-6 animate-fade-in">
          <div>
            <h3 className="text-lg font-semibold text-indigo-600 dark:text-indigo-300 mb-2">Summary</h3>
            <p className="text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-900/50 p-3 rounded-md border border-gray-200 dark:border-gray-700 text-sm">{analysisResult.summary}</p>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-indigo-600 dark:text-indigo-300 mb-2">Trend</h3>
            <p className="text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-900/50 p-3 rounded-md border border-gray-200 dark:border-gray-700 text-sm">{analysisResult.trend}</p>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-indigo-600 dark:text-indigo-300 mb-2">Topic Frequency</h3>
            <div className="h-64 w-full bg-gray-100 dark:bg-gray-900/50 p-2 rounded-md border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analysisResult.topics} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="currentColor" opacity={0.2}/>
                  <XAxis dataKey="topic" tick={{ fill: 'currentColor', fontSize: 12 }} />
                  <YAxis tick={{ fill: 'currentColor', fontSize: 12 }} allowDecimals={false} />
                  <Tooltip content={<CustomTooltip />} cursor={{fill: 'currentColor', opacity: 0.1}}/>
                  <Bar dataKey="frequency" fill="#6366f1" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
      
      {!isLoading && !analysisResult && (
        <div className="text-center p-8 text-gray-400 dark:text-gray-500">
            <p>Select a date range and click "Analyze Period" to see AI-powered insights about your work and life.</p>
        </div>
      )}
    </div>
  );
};

export default AnalysisDashboard;