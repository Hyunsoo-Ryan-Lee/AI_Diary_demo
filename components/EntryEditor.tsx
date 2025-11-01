import React, { useState, useEffect, useCallback } from 'react';
import { Entry } from '../types';
import { suggestTags } from '../services/geminiService';
import { SparklesIcon, TagIcon, SaveIcon } from './icons';

interface EntryEditorProps {
  date: string;
  entry: Entry | null;
  onSave: (entry: Entry) => void;
}

const EntryEditor: React.FC<EntryEditorProps> = ({ date, entry, onSave }) => {
  const [content, setContent] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setContent(entry?.content || '');
    setTags(entry?.tags || []);
  }, [entry]);

  const handleSave = useCallback(() => {
    setIsSaving(true);
    onSave({ date, content, tags });
    setTimeout(() => setIsSaving(false), 1000);
  }, [date, content, tags, onSave]);

  const handleTagInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTagInput(e.target.value);
  };

  const handleTagInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      if (!tags.includes(tagInput.trim())) {
        setTags([...tags, tagInput.trim()]);
      }
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleSuggestTags = async () => {
    setIsSuggesting(true);
    const suggested = await suggestTags(content);
    if (suggested.length > 0) {
      const newTags = [...new Set([...tags, ...suggested])];
      setTags(newTags);
    }
    setIsSuggesting(false);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg border border-gray-200 dark:border-gray-700 h-full flex flex-col">
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
        Entry for <span className="text-indigo-500 dark:text-indigo-400">{new Date(date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
      </h2>
      <p className="text-gray-500 dark:text-gray-400 mb-4 text-sm">Write down your thoughts, tasks, or daily logs. Use tags to categorize your entries.</p>
      
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="What's on your mind today?"
        className="w-full flex-grow bg-gray-100 dark:bg-gray-900/50 rounded-md p-4 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-shadow resize-none border border-gray-300 dark:border-gray-700"
      />
      
      <div className="mt-4">
        <label className="flex items-center text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">
          <TagIcon /> <span className="ml-2">Tags</span>
        </label>
        <div className="flex flex-wrap items-center gap-2 bg-gray-100 dark:bg-gray-900/50 p-2 rounded-md border border-gray-300 dark:border-gray-700">
          {tags.map(tag => (
            <div key={tag} className="flex items-center bg-indigo-500/20 text-indigo-300 dark:text-indigo-200 text-xs font-medium px-2.5 py-1 rounded-full">
              {tag}
              <button onClick={() => removeTag(tag)} className="ml-2 text-indigo-300 dark:text-indigo-200 hover:text-white">
                &times;
              </button>
            </div>
          ))}
          <input
            type="text"
            value={tagInput}
            onChange={handleTagInputChange}
            onKeyDown={handleTagInputKeyDown}
            placeholder="Add a tag..."
            className="bg-transparent focus:outline-none text-sm p-1 flex-grow placeholder-gray-400 dark:placeholder-gray-500"
          />
        </div>
      </div>
      
      <div className="mt-6 flex flex-col sm:flex-row gap-4">
        <button
          onClick={handleSuggestTags}
          disabled={isSuggesting || !content}
          className="w-full sm:w-auto flex items-center justify-center px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
        >
          {isSuggesting ? (
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : (
            <SparklesIcon />
          )}
          <span className="ml-2">{isSuggesting ? 'Thinking...' : 'Suggest Tags'}</span>
        </button>
        <button
          onClick={handleSave}
          className={`w-full sm:w-auto flex items-center justify-center px-6 py-2 rounded-md transition-colors font-semibold ${isSaving ? 'bg-green-500 text-white' : 'bg-indigo-600 text-white hover:bg-indigo-500'}`}
        >
          <SaveIcon />
          <span className="ml-2">{isSaving ? 'Saved!' : 'Save Entry'}</span>
        </button>
      </div>
    </div>
  );
};

export default EntryEditor;