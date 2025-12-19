import React, { useState, useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { Link } from 'react-router-dom';
import { db } from '../services/db';
import { SyncService } from '../services/sync';
import { Plus, Book, Wifi, WifiOff, RefreshCw } from 'lucide-react';
import clsx from 'clsx';
import { useAuthStore } from '../stores/useAuthStore';

export const Dashboard: React.FC = () => {
     const notebooks = useLiveQuery(() => db.notebooks.toArray());
     const [isOnline, setIsOnline] = useState(navigator.onLine);
     const [isSyncing, setIsSyncing] = useState(false);
     const logout = useAuthStore(s => s.logout);
     const user = useAuthStore(s => s.user);

     const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
     const [newTitle, setNewTitle] = useState('');
     const [newDesc, setNewDesc] = useState('');

     useEffect(() => {
          const handleOnline = () => { setIsOnline(true); SyncService.sync(); };
          const handleOffline = () => setIsOnline(false);
          window.addEventListener('online', handleOnline);
          window.addEventListener('offline', handleOffline);

          // Initial sync
          SyncService.sync();

          return () => {
               window.removeEventListener('online', handleOnline);
               window.removeEventListener('offline', handleOffline);
          };
     }, []);

     const handleCreate = async (e: React.FormEvent) => {
          e.preventDefault();
          try {
               await db.notebooks.add({
                    title: newTitle,
                    description: newDesc,
                    color: '#3B82F6',
                    createdAt: new Date().toISOString(),
                    syncStatus: 'dirty',
                    localNotebookId: 0, // Not used for notebook
               } as any);
               setNewTitle('');
               setNewDesc('');
               setIsCreateModalOpen(false);
               SyncService.sync();
          } catch (error) {
               console.error(error);
          }
     };

     const handleSync = async () => {
          setIsSyncing(true);
          await SyncService.sync();
          setIsSyncing(false);
     }

     return (
          <div className="min-h-screen bg-gray-50 flex flex-col">
               {/* Navbar */}
               <header className="bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between sticky top-0 z-10">
                    <div className="flex items-center gap-2">
                         <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">SN</div>
                         <span className="text-xl font-bold text-gray-800 tracking-tight">SmartNoteX</span>
                    </div>

                    <div className="flex items-center gap-4">
                         <div className={clsx("flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium", isOnline ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700")}>
                              {isOnline ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
                              {isOnline ? 'Online' : 'Offline'}
                         </div>

                         <button onClick={handleSync} className={clsx("p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-all", isSyncing && "animate-spin")}>
                              <RefreshCw className="h-5 w-5" />
                         </button>

                         <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 border-2 border-white shadow-sm" title={user?.email}></div>
                         <button onClick={logout} className="text-sm text-gray-500 hover:text-red-500">Logout</button>
                    </div>
               </header>

               {/* Content */}
               <main className="flex-1 p-8 max-w-7xl mx-auto w-full">
                    <div className="flex items-center justify-between mb-8">
                         <h2 className="text-2xl font-bold text-gray-800">Your Notebooks</h2>
                         <button
                              onClick={() => setIsCreateModalOpen(true)}
                              className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-medium shadow-lg shadow-blue-600/20 flex items-center gap-2 transition-all active:scale-95"
                         >
                              <Plus className="h-5 w-5" />
                              New Notebook
                         </button>
                    </div>

                    {/* Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                         {notebooks?.map((nb) => (
                              <Link key={nb.id} to={`/notebook/${nb.id}`} className="group relative bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 block">
                                   <div className="absolute top-4 right-4">
                                        {nb.syncStatus === 'dirty' && <div className="h-2 w-2 bg-yellow-400 rounded-full" title="Unsynced changes"></div>}
                                   </div>
                                   <div className="mb-4">
                                        <span className="inline-flex p-3 rounded-xl bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                             <Book className="h-6 w-6" />
                                        </span>
                                   </div>
                                   <h3 className="text-lg font-bold text-gray-900 mb-2 truncate">{nb.title}</h3>
                                   <p className="text-gray-500 text-sm line-clamp-2">{nb.description || "No description"}</p>
                                   <div className="mt-4 pt-4 border-t border-gray-50 flex items-center justify-between text-xs text-gray-400">
                                        <span>{new Date(nb.createdAt).toLocaleDateString()}</span>
                                        <span>{nb.syncStatus === 'synced' ? 'Synced' : 'Local'}</span>
                                   </div>
                              </Link>
                         ))}

                         {/* Empty State */}
                         {notebooks?.length === 0 && (
                              <div className="col-span-full py-12 text-center text-gray-400 border-2 border-dashed border-gray-200 rounded-2xl">
                                   <Book className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                   <p className="text-lg">No notebooks found. Create one to get started!</p>
                              </div>
                         )}
                    </div>
               </main>

               {/* Create Modal */}
               {isCreateModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                         <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl animate-in fade-in zoom-in duration-200">
                              <h3 className="text-xl font-bold mb-4">Create Notebook</h3>
                              <form onSubmit={handleCreate}>
                                   <input
                                        autoFocus
                                        className="w-full text-lg font-medium placeholder:text-gray-400 border-none focus:ring-0 px-0 mb-4"
                                        placeholder="Notebook Title"
                                        value={newTitle}
                                        onChange={e => setNewTitle(e.target.value)}
                                   />
                                   <textarea
                                        className="w-full text-sm text-gray-600 placeholder:text-gray-400 border-none focus:ring-0 px-0 resize-none h-24"
                                        placeholder="Description (optional)"
                                        value={newDesc}
                                        onChange={e => setNewDesc(e.target.value)}
                                   />
                                   <div className="flex justify-end gap-3 mt-6">
                                        <button type="button" onClick={() => setIsCreateModalOpen(false)} className="text-gray-500 hover:bg-gray-100 px-4 py-2 rounded-lg font-medium text-sm">Cancel</button>
                                        <button type="submit" disabled={!newTitle} className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium text-sm hover:bg-blue-700 disabled:opacity-50">Create</button>
                                   </div>
                              </form>
                         </div>
                    </div>
               )}
          </div>
     );
};
