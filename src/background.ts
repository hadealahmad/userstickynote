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

// Periodic check or other background tasks could go here
