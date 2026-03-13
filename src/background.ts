import { StorageService } from './lib/storage'

// Listen for messages from the dashboard website
chrome.runtime.onMessageExternal.addListener(async (request, _sender, sendResponse) => {
  if (request.type === 'CONNECT_EXTENSION' && request.token) {
    const settings = await StorageService.getSettings()
    settings.apiToken = request.token
    settings.isSubscribed = !!request.isSubscribed
    settings.syncMode = 'cloud'
    await StorageService.saveSettings(settings)
    
    console.log('Successfully connected via external message')
    sendResponse({ success: true })
  }
})

// Listen for internal messages from popup/content scripts
chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
  if (request.type === 'SAVE_NOTE_REMOTE') {
    StorageService.syncNoteRemote(request.note).then(() => {
      sendResponse({ success: true });
    }).catch(err => {
      sendResponse({ success: false, error: err.message });
    });
    return true; // Keep channel open for async
  }
  
  if (request.type === 'DELETE_NOTE_REMOTE') {
    StorageService.deleteNoteRemote(request.id).then(() => {
      sendResponse({ success: true });
    }).catch(err => {
      sendResponse({ success: false, error: err.message });
    });
    return true;
  }

  if (request.type === 'SYNC_ALL') {
    StorageService.syncWithCloud().then(() => {
      sendResponse({ success: true });
    }).catch(err => {
      sendResponse({ success: false, error: err.message });
    });
    return true;
  }
});
