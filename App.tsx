
import React, { useState, useEffect } from 'react';
import { DiaryEntry, UserProfile, GenerationTone } from './types';
import { generateDiaryEntry, generateWeeklySummary } from './services/geminiService';
import Header from './components/Header';
import EntryForm from './components/EntryForm';
import EntryCard from './components/EntryCard';
import UserProfileModal from './components/UserProfileModal';

const App: React.FC = () => {
  const [entries, setEntries] = useState<DiaryEntry[]>([]);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [weeklyReport, setWeeklyReport] = useState<{ weeklySummary: string; majorMilestone: string; nextWeekGoals: string } | null>(null);

  useEffect(() => {
    const savedEntries = localStorage.getItem('vtu_diary_entries');
    const savedUser = localStorage.getItem('vtu_user_profile');
    if (savedEntries) setEntries(JSON.parse(savedEntries));
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    } else {
      setShowProfileModal(true);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('vtu_diary_entries', JSON.stringify(entries));
  }, [entries]);

  const handleAddEntry = async (brief: string, date: string, tone: GenerationTone, image?: string) => {
    if (!user) {
      setShowProfileModal(true);
      return;
    }
    setIsGenerating(true);
    try {
      const gen = await generateDiaryEntry(brief, tone, user.internshipTitle, image);
      const newEntry: DiaryEntry = {
        id: crypto.randomUUID(),
        date,
        brief,
        generatedContent: gen.description,
        learningOutcomes: gen.learningOutcomes,
        tags: gen.tags
      };
      setEntries([newEntry, ...entries]);
    } catch (error) {
      console.error(error);
      alert("AI Generation failed.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSummarizeWeek = async () => {
    if (entries.length < 3) return alert("Need 3 entries minimum.");
    setIsSummarizing(true);
    try {
      const summary = await generateWeeklySummary(entries.slice(0, 7));
      setWeeklyReport(summary);
    } catch (error) {
      console.error(error);
    } finally {
      setIsSummarizing(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20 print:bg-white print:p-0">
      <div className="print:hidden">
        <Header 
          user={user} 
          onEditProfile={() => setShowProfileModal(true)} 
          onExport={() => window.print()}
          hasEntries={entries.length > 0}
        />
      </div>
      
      <main className="max-w-4xl mx-auto px-4 pt-24 space-y-8 print:pt-0 print:px-0">
        <div className="hidden print:block text-center border-b-2 border-slate-900 pb-6 mb-8">
          <h1 className="text-2xl font-bold uppercase tracking-tight">Internship Daily Diary</h1>
          <div className="mt-4 grid grid-cols-2 text-left gap-4 text-sm font-medium">
            <p><strong>Name:</strong> {user?.name}</p>
            <p><strong>USN:</strong> {user?.usn}</p>
            <p><strong>Company:</strong> {user?.company}</p>
            <p><strong>Title:</strong> {user?.internshipTitle}</p>
          </div>
        </div>

        <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 print:hidden">
          <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
            <i className="fa-solid fa-plus-circle text-indigo-600"></i> New Entry
          </h2>
          <EntryForm onAdd={handleAddEntry} isGenerating={isGenerating} />
        </section>

        {entries.length > 0 && (
          <section className="bg-indigo-900 text-white rounded-2xl p-6 shadow-xl print:text-slate-900 print:bg-white print:border print:shadow-none">
            <div className="flex justify-between items-center mb-4 print:hidden">
              <h2 className="text-lg font-bold flex items-center gap-2">Weekly Synthesis</h2>
              <button 
                onClick={handleSummarizeWeek}
                disabled={isSummarizing}
                className="bg-white/20 hover:bg-white/30 text-white px-4 py-1.5 rounded-lg text-sm font-semibold transition-all"
              >
                {isSummarizing ? <i className="fa-solid fa-spinner fa-spin"></i> : <i className="fa-solid fa-wand-magic"></i>} Generate
              </button>
            </div>
            {weeklyReport && (
              <div className="space-y-4">
                <div className="bg-white/10 p-4 rounded-xl print:bg-slate-50">
                  <h4 className="text-xs font-bold uppercase tracking-widest text-indigo-300 mb-2">Summary</h4>
                  <p className="text-sm">{weeklyReport.weeklySummary}</p>
                </div>
              </div>
            )}
          </section>
        )}

        <div className="space-y-6">
          {entries.map(entry => (
            <EntryCard key={entry.id} entry={entry} onDelete={() => setEntries(entries.filter(e => e.id !== entry.id))} />
          ))}
        </div>

        <div className="hidden print:grid grid-cols-2 gap-20 pt-20 mt-20">
          <div className="border-t border-slate-900 pt-2 text-center text-sm font-bold">Industry Supervisor</div>
          <div className="border-t border-slate-900 pt-2 text-center text-sm font-bold">Internal Guide</div>
        </div>
      </main>

      {showProfileModal && (
        <UserProfileModal 
          currentProfile={user} 
          onSave={(p) => { setUser(p); localStorage.setItem('vtu_user_profile', JSON.stringify(p)); setShowProfileModal(false); }} 
          onClose={() => user && setShowProfileModal(false)} 
        />
      )}
    </div>
  );
};

export default App;
