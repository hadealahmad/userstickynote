import { createApp } from 'vue';
import './style.css';
import StickyNoteWidget from './components/StickyNoteWidget.vue';

console.log('Twitter Sticky Notes: Initialized');

function injectWidgets() {
  // Target multiple possible anchor points for better coverage
  const anchors = document.querySelectorAll('[data-testid="User-Name"], [data-testid="caret"], [data-testid="userActions"]');

  anchors.forEach((anchor) => {
    if ((anchor as any).__stickyNoteInjected) return;
    
    const tweet = anchor.closest('[data-testid="tweet"]');
    const profileActions = anchor.closest('[data-testid="userActions"]');
    
    let username = '';
    let sourceUrl = window.location.href; 

    if (tweet) {
      // Find the username in the tweet
      const userNode = tweet.querySelector('[data-testid="User-Name"] a[href^="/"]');
      if (userNode) {
        const href = userNode.getAttribute('href');
        if (href) username = href.replace('/', '').split('/')[0] || '';
      }
      
      const timeNode = tweet.querySelector('time');
      if (timeNode) {
        const linkNode = timeNode.closest('a');
        if (linkNode && linkNode.href) sourceUrl = linkNode.href;
      }
    } else {
      const pathParts = window.location.pathname.split('/').filter(Boolean);
      if (pathParts.length > 0) {
        username = pathParts[0] || '';
      }
    }

    if (!username || ['home', 'explore', 'notifications', 'messages', 'i', 'compose', 'search'].includes(username.toLowerCase())) return;

    (anchor as any).__stickyNoteInjected = true;

    const container = document.createElement('div');
    container.className = 'sticky-note-injection-point inline-flex items-center justify-center shrink-0';

    if (tweet) {
       // On a tweet, we prefer placing it in the top actions row (next to name or grok)
       const grok = tweet.querySelector('[aria-label="Grok actions"]');
       const caret = tweet.querySelector('[data-testid="caret"]');
       
       if (grok) {
         // Place right before Grok
         grok.parentNode?.insertBefore(container, grok);
         container.classList.add('mr-1');
       } else if (caret) {
         // Place before the three-dots menu
         caret.parentNode?.insertBefore(container, caret);
         container.classList.add('mr-1');
       } else {
         // Fallback: append after the name section
         const nameSection = anchor.closest('[data-testid="User-Name"]');
         if (nameSection) {
           nameSection.parentNode?.appendChild(container);
           container.classList.add('ml-2');
         }
       }
    } else if (profileActions) {
       // Profile page actions list
       anchor.parentNode?.insertBefore(container, anchor);
       container.classList.add('mr-2', 'h-full');
    } else if (anchor.getAttribute('data-testid') === 'User-Name') {
       // Generic username appearance
       anchor.appendChild(container);
       container.classList.add('ml-2');
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
