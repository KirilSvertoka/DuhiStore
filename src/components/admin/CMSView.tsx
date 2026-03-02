import React, { useState } from 'react';
import { CMSPage, HomeConfig } from '../../types';
import { XCircle } from 'lucide-react';

interface CMSViewProps {
  pages: CMSPage[];
  homeConfig: HomeConfig | null;
  onUpdateHome: () => void;
  onUpdatePage: () => void;
  token: string;
}

export default function CMSView({ pages, homeConfig, onUpdateHome, onUpdatePage, token }: CMSViewProps) {
  const [editingPage, setEditingPage] = useState<CMSPage | null>(null);
  const [localHomeConfig, setLocalHomeConfig] = useState<HomeConfig | null>(homeConfig);

  React.useEffect(() => {
    setLocalHomeConfig(homeConfig);
  }, [homeConfig]);

  const savePage = async () => {
    if (!editingPage) return;
    try {
      const res = await fetch(`/api/admin/cms/${editingPage.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(editingPage)
      });
      if (res.ok) {
        setEditingPage(null);
        onUpdatePage();
      }
    } catch (err) { console.error(err); }
  };

  const saveHomeConfig = async () => {
    if (!localHomeConfig) return;
    try {
      const res = await fetch('/api/settings/home', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(localHomeConfig)
      });
      if (res.ok) {
        alert('Home configuration saved successfully!');
        onUpdateHome();
      }
    } catch (err) { console.error(err); }
  };

  return (
    <div className="space-y-8">
      {localHomeConfig && (
        <div className="bg-white dark:bg-stone-900 p-8 rounded-3xl border border-stone-100 dark:border-stone-800 shadow-sm">
          <h3 className="text-xl font-serif text-stone-900 dark:text-stone-100 mb-6">Home Page Configuration</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Hero Title</label>
              <input 
                type="text" 
                value={localHomeConfig.heroTitle}
                onChange={e => setLocalHomeConfig({...localHomeConfig, heroTitle: e.target.value})}
                className="w-full px-4 py-2 bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-xl"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Hero Subtitle</label>
              <input 
                type="text" 
                value={localHomeConfig.heroSubtitle}
                onChange={e => setLocalHomeConfig({...localHomeConfig, heroSubtitle: e.target.value})}
                className="w-full px-4 py-2 bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-xl"
              />
            </div>
            <div className="flex justify-end">
              <button onClick={saveHomeConfig} className="px-6 py-2 bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 rounded-xl font-medium">Save Home Config</button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-stone-900 p-8 rounded-3xl border border-stone-100 dark:border-stone-800 shadow-sm">
        <h3 className="text-xl font-serif text-stone-900 dark:text-stone-100 mb-6">Information Pages</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {pages.map(page => (
            <button 
              key={page.id}
              onClick={() => setEditingPage(page)}
              className="p-6 bg-stone-50 dark:bg-stone-950 rounded-2xl border border-stone-100 dark:border-stone-800 text-left hover:border-stone-300 transition-all"
            >
              <h4 className="font-medium text-stone-900 dark:text-stone-100">{page.title}</h4>
              <p className="text-xs text-stone-500 mt-1">Last updated: {new Date(page.updatedAt).toLocaleDateString()}</p>
            </button>
          ))}
        </div>
      </div>

      {editingPage && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-stone-900 w-full max-w-4xl rounded-3xl p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-serif">Edit Page: {editingPage.title}</h3>
              <button onClick={() => setEditingPage(null)}><XCircle className="w-6 h-6 text-stone-400" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Title</label>
                <input 
                  type="text" 
                  value={editingPage.title}
                  onChange={e => setEditingPage({...editingPage, title: e.target.value})}
                  className="w-full px-4 py-2 bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-xl"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Content (Markdown)</label>
                <textarea 
                  rows={15}
                  value={editingPage.content}
                  onChange={e => setEditingPage({...editingPage, content: e.target.value})}
                  className="w-full px-4 py-2 bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-xl font-mono text-sm"
                />
              </div>
              <div className="flex justify-end gap-3">
                <button onClick={() => setEditingPage(null)} className="px-6 py-2 text-stone-500">Cancel</button>
                <button onClick={savePage} className="px-6 py-2 bg-stone-900 text-white rounded-xl">Save Changes</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
