import Dexie, { type Table } from 'dexie';

export type SyncStatus = 'synced' | 'dirty' | 'deleted';

export interface Notebook {
     id?: number;
     backendId?: number;
     title: string;
     description?: string;
     color?: string;
     createdAt: string;
     syncStatus: SyncStatus;
}

export interface Chapter {
     id?: number;
     backendId?: number;
     notebookId: number; // Linked to Notebook.id (Local)? Or BackendId?
     // Strategy: Use Local ID for valid offline linking.
     // But if we sync, we need to resolve.
     // Let's use Local ID `localNotebookId` for foreign keys in Dexie.
     localNotebookId: number;
     title: string;
     orderIndex: number;
     syncStatus: SyncStatus;
}

export interface Note {
     id?: number;
     backendId?: number;
     localChapterId: number; // Linked to Chapter.id (Local)
     title: string;
     content: string;
     isStructured: boolean;
     createdAt: string;
     syncStatus: SyncStatus;
}

export class SmartNoteXDB extends Dexie {
     notebooks!: Table<Notebook>;
     chapters!: Table<Chapter>;
     notes!: Table<Note>;

     constructor() {
          super('SmartNoteXDB');
          this.version(2).stores({
               notebooks: '++id, backendId, syncStatus',
               chapters: '++id, backendId, localNotebookId, syncStatus',
               notes: '++id, backendId, localChapterId, syncStatus'
          });
     }
}

export const db = new SmartNoteXDB();
