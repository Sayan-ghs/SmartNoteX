import { db, type Notebook } from './db';
import { api } from './api';

export class SyncService {
     private static isSyncing = false;

     static async sync() {
          if (this.isSyncing) return;
          if (!navigator.onLine) return; // Don't try if offline

          this.isSyncing = true;
          try {
               await this.syncNotebooks();
               await this.syncChapters();
               await this.syncNotes();
               console.log('Sync completed successfully');
          } catch (error) {
               console.error('Sync failed', error);
          } finally {
               this.isSyncing = false;
          }
     }

     // --- Notebooks ---

     private static async syncNotebooks() {
          // 1. Push dirty
          const dirtyNotebooks = await db.notebooks
               .where('syncStatus')
               .equals('dirty')
               .toArray();

          for (const nb of dirtyNotebooks) {
               if (nb.syncStatus === 'deleted' && nb.backendId) {
                    await api.delete(`/notebooks/${nb.backendId}`);
                    await db.notebooks.delete(nb.id!);
               } else if (nb.syncStatus === 'dirty') {
                    if (nb.backendId) {
                         await api.put(`/notebooks/${nb.backendId}`, {
                              title: nb.title,
                              description: nb.description,
                              color: nb.color
                         });
                         await db.notebooks.update(nb.id!, { syncStatus: 'synced' });
                    } else {
                         const { data } = await api.post('/notebooks', {
                              title: nb.title,
                              description: nb.description,
                              color: nb.color
                         });
                         await db.notebooks.update(nb.id!, {
                              backendId: data.id,
                              syncStatus: 'synced'
                         });
                    }
               }
          }

          // 2. Pull from server
          const { data: serverNotebooks } = await api.get<Notebook[]>('/notebooks');
          for (const remoteNb of serverNotebooks) {
               const existing = await db.notebooks.where('backendId').equals(remoteNb.id || 0).first();
               if (existing) {
                    if (existing.syncStatus === 'synced') {
                         await db.notebooks.update(existing.id!, {
                              ...remoteNb,
                              backendId: remoteNb.id,
                              syncStatus: 'synced'
                         });
                    }
               } else {
                    await db.notebooks.add({
                         ...remoteNb,
                         backendId: remoteNb.id,
                         syncStatus: 'synced'
                    } as any);
               }
          }
     }

     // --- Chapters ---
     private static async syncChapters() {
          // 1. Push dirty
          const dirtyStart = await db.chapters.where('syncStatus').equals('dirty').toArray();
          for (const ch of dirtyStart) {
               if (ch.syncStatus === 'deleted' && ch.backendId) {
                    await api.delete(`/chapters/${ch.backendId}`);
                    await db.chapters.delete(ch.id!);
               } else if (ch.syncStatus === 'dirty') {
                    const notebook = await db.notebooks.get(ch.localNotebookId);
                    if (!notebook || !notebook.backendId) continue;

                    if (ch.backendId) {
                         await api.put(`/chapters/${ch.backendId}`, { title: ch.title, order_index: ch.orderIndex });
                         await db.chapters.update(ch.id!, { syncStatus: 'synced' });
                    } else {
                         const { data } = await api.post(`/notebooks/${notebook.backendId}/chapters`, {
                              title: ch.title,
                              order_index: ch.orderIndex,
                              description: "Created from frontend"
                         });
                         await db.chapters.update(ch.id!, { backendId: data.id, syncStatus: 'synced' });
                    }
               }
          }

          // 2. Pull
          const notebooks = await db.notebooks.where('syncStatus').equals('synced').toArray();
          for (const nb of notebooks) {
               if (!nb.backendId) continue;
               try {
                    const { data: serverChapters } = await api.get(`/notebooks/${nb.backendId}/chapters`);
                    for (const rCh of serverChapters) {
                         const existing = await db.chapters.where('backendId').equals(rCh.id).first();
                         if (existing) {
                              if (existing.syncStatus === 'synced') {
                                   await db.chapters.update(existing.id!, { ...rCh, syncStatus: 'synced' });
                              }
                         } else {
                              await db.chapters.add({
                                   ...rCh,
                                   backendId: rCh.id,
                                   localNotebookId: nb.id!,
                                   syncStatus: 'synced'
                              } as any);
                         }
                    }
               } catch (e) {
                    console.warn(`Failed to fetch chapters for nb ${nb.backendId}`, e);
               }
          }
     }

     // --- Notes ---
     private static async syncNotes() {
          // 1. Push dirty
          const dirtyNotes = await db.notes.where('syncStatus').equals('dirty').toArray();
          for (const note of dirtyNotes) {
               const chapter = await db.chapters.get(note.localChapterId);
               if (!chapter || !chapter.backendId) continue;

               if (note.syncStatus === 'deleted') {
                    // Handle delete
               } else if (note.syncStatus === 'dirty') {
                    if (note.backendId) {
                         await api.put(`/notes/${note.backendId}`, { title: note.title, content: note.content });
                         await db.notes.update(note.id!, { syncStatus: 'synced' });
                    } else {
                         const { data } = await api.post(`/chapters/${chapter.backendId}/notes`, {
                              title: note.title,
                              content: note.content || "",
                              is_ai_structured: note.isStructured
                         });
                         await db.notes.update(note.id!, { backendId: data.id, syncStatus: 'synced' });
                    }
               }
          }
     }
}
