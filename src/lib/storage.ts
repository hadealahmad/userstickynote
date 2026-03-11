export type SocialPlatform = 'twitter'

export interface StickyNote {
  id: string;
  username: string;
  platform: SocialPlatform;
  text: string;
  sourceUrl?: string;
  createdAt: number;
  updatedAt: number;
}

export class StorageService {
  static async getNotes(username: string, platform: SocialPlatform): Promise<StickyNote[]> {
    const allNotes = await this.getAllNotes();
    return allNotes.filter(n => n.username.toLowerCase() === username.toLowerCase() && n.platform === platform);
  }

  static async getAllNotes(): Promise<StickyNote[]> {
    return new Promise((resolve, reject) => {
      if (typeof chrome !== 'undefined' && chrome.storage) {
        try {
          chrome.storage.local.get(['stickyNotes'], (result) => {
            if (chrome.runtime.lastError) return reject(chrome.runtime.lastError);
            resolve((result.stickyNotes as StickyNote[]) || []);
          });
        } catch (err) {
          reject(err);
        }
      } else {
        // Fallback for local development outside extension
        const raw = localStorage.getItem('stickyNotes')
        resolve(raw ? JSON.parse(raw) : [])
      }
    });
  }

  static async saveNote(note: StickyNote): Promise<void> {
    const allNotes = await this.getAllNotes();
    const existingIndex = allNotes.findIndex(n => n.id === note.id);
    if (existingIndex >= 0) {
      note.updatedAt = Date.now();
      allNotes[existingIndex] = note;
    } else {
      note.createdAt = Date.now();
      note.updatedAt = Date.now();
      allNotes.push(note);
    }
    return new Promise((resolve, reject) => {
      if (typeof chrome !== 'undefined' && chrome.storage) {
        try {
          chrome.storage.local.set({ stickyNotes: allNotes }, () => {
            if (chrome.runtime.lastError) return reject(chrome.runtime.lastError);
            resolve();
          });
        } catch (err) {
          reject(err);
        }
      } else {
        localStorage.setItem('stickyNotes', JSON.stringify(allNotes));
        resolve()
      }
    });
  }

  static async deleteNote(id: string): Promise<void> {
    let allNotes = await this.getAllNotes();
    allNotes = allNotes.filter(n => n.id !== id);
    return new Promise((resolve, reject) => {
      if (typeof chrome !== 'undefined' && chrome.storage) {
        try {
          chrome.storage.local.set({ stickyNotes: allNotes }, () => {
            if (chrome.runtime.lastError) return reject(chrome.runtime.lastError);
            resolve();
          });
        } catch (err) {
          reject(err);
        }
      } else {
        localStorage.setItem('stickyNotes', JSON.stringify(allNotes));
        resolve()
      }
    });
  }
}
