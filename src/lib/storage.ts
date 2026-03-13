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
  isAdmin: boolean;
}

export class StorageService {
  private static DEFAULT_API_URL = 'https://notes.hadealahmad.com';

  static async getSettings(): Promise<Settings> {
    return new Promise((resolve) => {
      const defaults: Settings = {
        apiToken: '',
        syncMode: 'local',
        apiUrl: this.DEFAULT_API_URL,
        isSubscribed: false,
        isAdmin: false
      };

      if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
        chrome.storage.local.get(['settings'], (result) => {
          const stored = result.settings || {};
          resolve({ ...defaults, ...stored });
        });
      } else {
        const raw = localStorage.getItem('settings');
        const stored = raw ? JSON.parse(raw) : {};
        resolve({ ...defaults, ...stored });
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
        const response = await fetch(`${settings.apiUrl}/api/notes`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${settings.apiToken}`,
            'X-Api-Token': settings.apiToken,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({
            twitter_user_id: note.username,
            twitter_username: note.username,
            content: note.text,
            source_url: note.sourceUrl,
            client_id: note.id
          })
        });
        if (!response.ok) {
           const errorData = await response.json();
           console.error('Cloud Sync Failed:', response.status, errorData);
        } else {
           console.log('Note synced to cloud successfully');
        }
      } catch (err) {
        console.error('Cloud Sync Network Error:', err);
      }
      
      // Also trigger a full background sync to ensure everything is perfectly aligned
      await this.syncWithCloud();
    }
  }

  static async deleteNote(id: string): Promise<void> {
    let allNotes = await this.getAllNotes();
    allNotes = allNotes.filter(n => n.id !== id);
    
    await this.saveLocally(allNotes);

    const settings = await this.getSettings();
    if (settings.syncMode === 'cloud' && settings.apiToken) {
       try {
         // Assuming the server uses the client_id (which is our local id) for deletion 
         // or we search for the note with that client_id
         const response = await fetch(`${settings.apiUrl}/api/notes/0?client_id=${id}`, {
           method: 'DELETE',
           headers: {
             'Authorization': `Bearer ${settings.apiToken}`,
             'Accept': 'application/json'
           }
         });
         
         if (!response.ok) {
           console.warn('Cloud Delete failed, will retry during full sync', response.status);
         } else {
           console.log('Note deleted from cloud');
         }
       } catch (err) {
         console.error('Cloud Delete Network Error:', err);
       }
       
       // Trigger full sync to be sure
       await this.syncWithCloud();
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
          'X-Api-Token': settings.apiToken,
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
          id: n.client_id || `remote-${n.id}`,
          username: n.twitter_username || n.twitter_user_id,
          platform: 'twitter' as const,
          text: n.content,
          sourceUrl: n.source_url,
          createdAt: new Date(n.created_at).getTime(),
          updatedAt: new Date(n.updated_at).getTime()
        }));

        console.log(`Synced ${serverNotes.length} notes from cloud`);
        // Replace local with merged cloud server state
        await this.saveLocally(serverNotes);
      } else {
        const errorData = await response.json();
        console.error('Cloud Sync Sync failed:', response.status, errorData);
      }
    } catch (err) {
      console.error('Cloud Sync Background Network Error:', err);
    }
  }

  static async checkSubscription(): Promise<boolean> {
    const settings = await this.getSettings();
    if (!settings.apiToken) return false;

    try {
      const response = await fetch(`${settings.apiUrl}/api/user`, {
        headers: {
          'Authorization': `Bearer ${settings.apiToken}`,
          'X-Api-Token': settings.apiToken,
          'Accept': 'application/json'
        }
      });
      if (response.ok) {
        const user = await response.json();
        settings.isSubscribed = !!user.is_subscribed;
        settings.isAdmin = !!user.is_admin;
        await this.saveSettings(settings);
        return settings.isSubscribed || settings.isAdmin;
      }
    } catch (err) {
      console.error('Subscription Check Failed:', err);
    }
    return settings.isSubscribed;
  }

  static async connectWithDashboard(): Promise<boolean> {
    const settings = await this.getSettings();
    try {
      const response = await fetch(`${settings.apiUrl}/api/connect`, {
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
          'X-Requested-With': 'XMLHttpRequest'
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.token) {
          settings.apiToken = data.token;
          settings.isSubscribed = !!data.user.is_subscribed;
          settings.isAdmin = !!data.user.is_admin;
          settings.syncMode = 'cloud';
          await this.saveSettings(settings);
          console.log('Successfully connected to cloud account:', data.user.email);
          return true;
        }
      } else {
        console.warn('Authentication with dashboard failed:', response.status, response.statusText);
      }
    } catch (err) {
      console.error('Network error during auto-connect:', err);
    }
    return false;
  }

  static loginWithGoogle(): void {
    const apiUrl = 'https://notes.hadealahmad.com'; 
    window.open(`${apiUrl}/dashboard`, '_blank');
  }
}
