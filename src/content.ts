import { createApp } from 'vue';
import './style.css';
import StickyNoteWidget from './components/StickyNoteWidget.vue';

console.log('Twitter Sticky Notes: Initialized');

function injectWidgets() {
  // Target actions menu on tweets (caret) and profiles (userActions)
  const actionButtons = document.querySelectorAll('[data-testid="caret"], [data-testid="userActions"]');

  actionButtons.forEach((btn) => {
    if ((btn as any).__stickyNoteInjected) return;
    
    let username = '';
    let sourceUrl = window.location.href; 

    const tweet = btn.closest('[data-testid="tweet"]');
    if (tweet) {
      // Find the username in the tweet
      const userNode = tweet.querySelector('[data-testid="User-Name"] a[href^="/"]');
      if (userNode) {
        const href = userNode.getAttribute('href');
        if (href) username = href.replace('/', '').split('/')[0] || '';
      }
      
      // Attempt to find tweet specific url (often stored on the datestamp time element)
      const timeNode = tweet.querySelector('time');
      if (timeNode) {
        const linkNode = timeNode.closest('a');
        if (linkNode && linkNode.href) {
          sourceUrl = linkNode.href;
        }
      }
    } else {
      // If we are on a profile page (no tweet wrapper), username is in the URL usually
      const pathParts = window.location.pathname.split('/').filter(Boolean);
      if (pathParts.length > 0) {
        username = pathParts[0] || '';
      }
    }

    if (!username || ['home', 'explore', 'notifications', 'messages', 'i', 'compose'].includes(username.toLowerCase())) return;

    (btn as any).__stickyNoteInjected = true;

    const container = document.createElement('div');

    if (tweet) {
       container.className = 'sticky-note-injection-point inline-flex items-center justify-center mr-1';
       // On a tweet, the caret is usually grouped with Grok actions inside an r-1cmwbt1 container
       // We inject as the first child of this container to appear next to Grok icon.
       const actionsContainer = btn.closest('.r-1cmwbt1') || btn.parentNode;
       if (actionsContainer && actionsContainer !== btn) {
         actionsContainer.insertBefore(container, actionsContainer.firstChild);
       } else {
         btn.parentNode?.insertBefore(container, btn);
       }
    } else {
       container.className = 'sticky-note-injection-point flex items-center justify-center h-full mr-2';
       // Inside user actions (profile) wrapper directly
       btn.parentNode?.insertBefore(container, btn);
    }

    const isProfile = !tweet;
    const app = createApp(StickyNoteWidget, { username, sourceUrl, isProfile });
    app.mount(container);
  });
}

const observer = new MutationObserver(() => {
  injectWidgets();
});

if (document.body) {
  observer.observe(document.body, { childList: true, subtree: true });
  injectWidgets(); 
} else {
  document.addEventListener('DOMContentLoaded', () => {
    observer.observe(document.body, { childList: true, subtree: true });
    injectWidgets();
  });
}
