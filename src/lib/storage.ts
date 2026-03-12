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

export type SyncMode = 'local' | 'cloud'

export interface Settings {
  apiToken: string;
  syncMode: SyncMode;
  apiUrl: string;
  isSubscribed: boolean;
}

export class StorageService {
  private static DEFAULT_API_URL = 'https://twitter-sticky-notes.cranl.app'; // Placeholder

  static async getSettings(): Promise<Settings> {
    return new Promise((resolve) => {
      if (typeof chrome !== 'undefined' && chrome.storage) {
        chrome.storage.local.get(['settings'], (result) => {
          resolve(result.settings || {
            apiToken: '',
            syncMode: 'local',
            apiUrl: this.DEFAULT_API_URL,
            isSubscribed: false
          });
        });
      } else {
        const raw = localStorage.getItem('settings');
        resolve(raw ? JSON.parse(raw) : {
          apiToken: '',
          syncMode: 'local',
          apiUrl: this.DEFAULT_API_URL,
          isSubscribed: false
        });
      }
    });
  }

  static async saveSettings(settings: Settings): Promise<void> {
    return new Promise((resolve) => {
      if (typeof chrome !== 'undefined' && chrome.storage) {
        chrome.storage.local.set({ settings }, () => resolve());
      } else {
        localStorage.setItem('settings', JSON.stringify(settings));
        resolve();
      }
    });
  }

  static async getNotes(username: string, platform: SocialPlatform): Promise<StickyNote[]> {
    const allNotes = await this.getAllNotes();
    return allNotes.filter(n => n.username.toLowerCase() === username.toLowerCase() && n.platform === platform);
  }

  static async getAllNotes(): Promise<StickyNote[]> {
    // If cloud sync is on, we might want to pull first, but for now we pull manually or periodically
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

    // Save locally
    await this.saveLocally(allNotes);

    // Sync to cloud if enabled
    const settings = await this.getSettings();
    if (settings.syncMode === 'cloud' && settings.apiToken) {
      try {
        await fetch(`${settings.apiUrl}/api/notes`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${settings.apiToken}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({
            twitter_user_id: note.username, // Using username as ID for Twitter in this extension
            twitter_username: note.username,
            content: note.text,
            source_url: note.sourceUrl,
            client_id: note.id
          })
        });
      } catch (err) {
        console.error('Cloud Sync Failed:', err);
      }
    }
  }

  static async deleteNote(id: string): Promise<void> {
    let allNotes = await this.getAllNotes();
    allNotes = allNotes.filter(n => n.id !== id);
    
    await this.saveLocally(allNotes);

    const settings = await this.getSettings();
    if (settings.syncMode === 'cloud' && settings.apiToken) {
       // In a full sync system, we'd handle soft deletes or specific delete endpoints
       // For now, we'll rely on the full sync trigger or specific delete if needed
    }
  }

  private static async saveLocally(notes: StickyNote[]): Promise<void> {
    return new Promise((resolve, reject) => {
      if (typeof chrome !== 'undefined' && chrome.storage) {
        chrome.storage.local.set({ stickyNotes: notes }, () => {
          if (chrome.runtime.lastError) return reject(chrome.runtime.lastError);
          resolve();
        });
      } else {
        localStorage.setItem('stickyNotes', JSON.stringify(notes));
        resolve();
      }
    });
  }

  static async syncWithCloud(): Promise<void> {
    const settings = await this.getSettings();
    if (!settings.apiToken) return;

    const localNotes = await this.getAllNotes();
    
    try {
      const response = await fetch(`${settings.apiUrl}/api/sync`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${settings.apiToken}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          notes: localNotes.map(n => ({
            twitter_user_id: n.username,
            twitter_username: n.username,
            content: n.text,
            source_url: n.sourceUrl,
            client_id: n.id
          }))
        })
      });

      if (response.ok) {
        const data = await response.json();
        const serverNotes: StickyNote[] = data.notes.map((n: any) => ({
          id: n.client_id,
          username: n.twitter_username,
          platform: 'twitter',
          text: n.content,
          sourceUrl: n.source_url,
          createdAt: new Date(n.created_at).getTime(),
          updatedAt: new Date(n.updated_at).getTime()
        }));

        // Replace local with merged cloud server state
        await this.saveLocally(serverNotes);
      }
    } catch (err) {
      console.error('Cloud Sync Background Failed:', err);
    }
  }

  static async checkSubscription(): Promise<boolean> {
    const settings = await this.getSettings();
    if (!settings.apiToken) return false;

    try {
      const response = await fetch(`${settings.apiUrl}/api/user`, {
        headers: {
          'Authorization': `Bearer ${settings.apiToken}`,
          'Accept': 'application/json'
        }
      });
      if (response.ok) {
        const user = await response.json();
        settings.isSubscribed = user.is_subscribed;
        await this.saveSettings(settings);
        return settings.isSubscribed;
      }
    } catch (err) {
      console.error('Subscription Check Failed:', err);
    }
    return settings.isSubscribed;
  }

  static loginWithGoogle(): void {
    const apiUrl = 'https://twitter-sticky-notes.cranl.app'; 
    window.open(`${apiUrl}/dashboard`, '_blank');
  }
}
