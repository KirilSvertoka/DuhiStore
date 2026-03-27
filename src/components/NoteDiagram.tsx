import { Note } from '../types';
import { useLanguage } from './LanguageProvider';
import { motion } from 'motion/react';

interface NoteDiagramProps {
  topNotes: Note[];
  heartNotes: Note[];
  baseNotes: Note[];
}

export default function NoteDiagram({ topNotes, heartNotes, baseNotes }: NoteDiagramProps) {
  const { language, t } = useLanguage();
  
  const getNoteName = (note: Note) => language === 'be' && note.name_be ? note.name_be : note.name;

  const NoteGroup = ({ title, notes, delay }: { title: string, notes: Note[], delay: number }) => {
    // Find max value to normalize bars if needed, but assuming 0-100 scale for simplicity
    // or just using the values as relative weights.
    const totalValue = notes.reduce((sum, n) => sum + n.value, 0);

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-brand-border pb-2">
          <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-muted">
            {title}
          </h4>
          <span className="text-[10px] font-mono text-brand-muted">
            {notes.length} {t('notes').toLowerCase()}
          </span>
        </div>
        <div className="space-y-3">
          {notes.map((note, idx) => (
            <div key={idx} className="space-y-1.5">
              <div className="flex justify-between items-end">
                <span className="text-sm font-medium text-brand-light">
                  {getNoteName(note)}
                </span>
                <span className="text-[10px] font-mono text-brand-muted">
                  {note.value}%
                </span>
              </div>
              <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${note.value}%` }}
                  transition={{ duration: 1, delay: delay + (idx * 0.1), ease: "circOut" }}
                  className="h-full bg-white rounded-full opacity-60"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-12 py-4">
      <NoteGroup title={t('topNotes')} notes={topNotes} delay={0.1} />
      <NoteGroup title={t('heartNotes')} notes={heartNotes} delay={0.3} />
      <NoteGroup title={t('baseNotes')} notes={baseNotes} delay={0.5} />
    </div>
  );
}
