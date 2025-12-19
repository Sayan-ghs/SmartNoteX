import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../services/db';
import { SyncService } from '../services/sync';
import { NoteEditor } from '../components/NoteEditor';
import { ChevronRight, ChevronDown, Plus, FileText, ArrowLeft, MoreHorizontal, Loader2 } from 'lucide-react';
import { clsx } from 'clsx';
// import { api } from '../services/api';

export const NotebookView: React.FC = () => {
     const { id } = useParams<{ id: string }>();
     const notebookId = parseInt(id || '0');

     const notebook = useLiveQuery(() => db.notebooks.get(notebookId), [notebookId]);
     const chapters = useLiveQuery(() => db.chapters.where('localNotebookId').equals(notebookId).toArray(), [notebookId]);
     const notes = useLiveQuery(() => db.notes.toArray(), []); // Fetch all notes (optimize later)

     const [selectedNoteId, setSelectedNoteId] = useState<number | null>(null);
     const [expandedChapters, setExpandedChapters] = useState<Set<number>>(new Set());
     const [isSyncing, setIsSyncing] = useState(false);

     // Filter notes for chapters
     const getNotesForChapter = (chapterId: number) => notes?.filter(n => n.localChapterId === chapterId) || [];

     const toggleChapter = (cId: number) => {
          const next = new Set(expandedChapters);
          if (next.has(cId)) next.delete(cId);
          else next.add(cId);
          setExpandedChapters(next);
     };

     const handleCreateChapter = async () => {
          const title = prompt("Chapter Title:");
          if (title) {
               await db.chapters.add({
                    localNotebookId: notebookId,
                    title,
                    orderIndex: chapters?.length || 0,
                    syncStatus: 'dirty'
               } as any);
               SyncService.sync();
          }
     };

     const handleCreateNote = async (chapterId: number) => {
          const title = prompt("Note Title:");
          if (title) {
               const id = await db.notes.add({
                    localChapterId: chapterId,
                    title,
                    content: '',
                    isStructured: false,
                    createdAt: new Date().toISOString(),
                    syncStatus: 'dirty'
               } as any);
               setSelectedNoteId(id as number);
               setExpandedChapters(new Set(expandedChapters).add(chapterId));
               SyncService.sync();
          }
     };

     const selectedNote = notes?.find(n => n.id === selectedNoteId);

     const handleSaveNote = async (content: string) => {
          if (selectedNoteId) {
               await db.notes.update(selectedNoteId, { content, syncStatus: 'dirty' });
               // Debounce sync?
               // SyncService.sync(); 
          }
     };

     // AI Integration Handlers
     const handleAIStructure = async () => {
          if (!selectedNote) return;
          setIsSyncing(true);
          try {
               // Mock AI call or Real
               // const res = await api.post(`/ai/structure`, { ... });
               // For now just append structured text
               const newContent = selectedNote.content + "<br/><hr/><h3>AI Structured Summary:</h3><p>Generated content...</p>";
               await db.notes.update(selectedNoteId!, { content: newContent, isStructured: true, syncStatus: 'dirty' });
          } catch (e) {
               console.error(e);
          } finally {
               setIsSyncing(false);
          }
     };

     if (!notebook) return <div className="p-8">Loading notebook...</div>;

     return (
          <div className="flex h-screen bg-white">
               {/* Sidebar */}
               <aside className="w-80 bg-gray-50 border-r border-gray-200 flex flex-col">
                    <div className="p-4 border-b border-gray-200">
                         <Link to="/" className="text-gray-500 hover:text-blue-600 flex items-center gap-2 text-sm font-medium mb-4">
                              <ArrowLeft className="h-4 w-4" /> Back to Dashboard
                         </Link>
                         <h1 className="text-xl font-bold text-gray-900 truncate">{notebook.title}</h1>
                         <p className="text-xs text-gray-500 mt-1">{chapters?.length || 0} Chapters</p>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                         {chapters?.map(chapter => {
                              const chapterNotes = getNotesForChapter(chapter.id!);
                              const isExpanded = expandedChapters.has(chapter.id!);

                              return (
                                   <div key={chapter.id} className="select-none">
                                        <div
                                             className="flex items-center justify-between group cursor-pointer py-1"
                                             onClick={() => toggleChapter(chapter.id!)}
                                        >
                                             <div className="flex items-center gap-2 text-gray-700 font-medium">
                                                  {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                                                  {chapter.title}
                                             </div>
                                             <button
                                                  onClick={(e) => { e.stopPropagation(); handleCreateNote(chapter.id!); }}
                                                  className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-200 rounded text-gray-500"
                                                  title="Add Note"
                                             >
                                                  <Plus className="h-4 w-4" />
                                             </button>
                                        </div>

                                        {isExpanded && (
                                             <div className="ml-6 mt-1 space-y-1 border-l-2 border-gray-200 pl-2">
                                                  {chapterNotes.map(note => (
                                                       <div
                                                            key={note.id}
                                                            onClick={() => setSelectedNoteId(note.id!)}
                                                            className={clsx(
                                                                 "cursor-pointer px-3 py-2 rounded-lg text-sm flex items-center gap-2 transition-colors",
                                                                 selectedNoteId === note.id ? "bg-blue-100 text-blue-700 font-medium" : "text-gray-600 hover:bg-gray-100"
                                                            )}
                                                       >
                                                            <FileText className="h-3 w-3" />
                                                            <span className="truncate">{note.title}</span>
                                                       </div>
                                                  ))}
                                                  {chapterNotes.length === 0 && (
                                                       <div className="text-xs text-gray-400 italic px-3 py-1">No notes</div>
                                                  )}
                                             </div>
                                        )}
                                   </div>
                              );
                         })}

                         <button
                              onClick={handleCreateChapter}
                              className="w-full py-2 border-2 border-dashed border-gray-200 rounded-lg text-gray-400 text-sm font-medium hover:border-blue-300 hover:text-blue-500 flex items-center justify-center gap-2 transition-all"
                         >
                              <Plus className="h-4 w-4" /> Add Chapter
                         </button>
                    </div>
               </aside>

               {/* Main Area */}
               <main className="flex-1 flex flex-col h-full overflow-hidden relative">
                    {selectedNote ? (
                         <>
                              <header className="h-16 flex items-center justify-between px-8 bg-white border-b border-gray-100">
                                   <div className="flex items-center gap-4">
                                        <h2 className="text-lg font-bold text-gray-800">{selectedNote.title}</h2>
                                        {selectedNote.syncStatus === 'dirty' && <span className="text-xs text-yellow-600 bg-yellow-50 px-2 py-1 rounded-full">Unsynced</span>}
                                   </div>

                                   <div className="flex gap-2">
                                        <button
                                             onClick={handleAIStructure}
                                             disabled={isSyncing}
                                             className="bg-indigo-50 text-indigo-600 hover:bg-indigo-100 px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                                        >
                                             {isSyncing ? <Loader2 className="h-4 w-4 animate-spin" /> : "✨ AI Structure"}
                                        </button>
                                        <button className="text-gray-400 hover:bg-gray-100 p-2 rounded-lg">
                                             <MoreHorizontal className="h-5 w-5" />
                                        </button>
                                   </div>
                              </header>
                              <div className="flex-1 overflow-hidden bg-gray-50/30 p-8">
                                   <NoteEditor content={selectedNote.content} onChange={handleSaveNote} />
                              </div>
                         </>
                    ) : (
                         <div className="flex-1 flex flex-col items-center justify-center text-gray-300">
                              <FileText className="h-16 w-16 mb-4 opacity-50" />
                              <p className="text-lg font-medium">Select a note to start editing</p>
                         </div>
                    )}
               </main>
          </div>
     );
};
