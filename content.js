// 1 Wait for WhatsApp to load
function waitForWhatsApp() {
  return new Promise((resolve) => {
    const checkInterval = setInterval(() => {
      const mainElement = document.querySelector('#main');
      if (mainElement) {
        clearInterval(checkInterval);
        resolve();
      }
    }, 1000);
  });
}

//  2 Extract chat messages
function extractMessages() {
  const messages = [];
  const messageElements = document.querySelectorAll('#main div.message-in, #main div.message-out');
  
  messageElements.forEach((msgEl) => {
    const copyableEl = msgEl.querySelector('.copyable-text');
    const textEl =
      msgEl.querySelector('span.selectable-text.copyable-text') ||
      msgEl.querySelector('.copyable-text span.selectable-text') ||
      msgEl.querySelector('[data-testid="msg-text"]') ||
      copyableEl;

    const meta = copyableEl?.getAttribute('data-pre-plain-text') || '';
    const senderMatch = meta.match(/\] (.*?):\s*$/);

    const message = {
      text: textEl?.innerText?.trim() || '',
      time: meta,
      isOutgoing: msgEl.classList.contains('message-out'),
      sender: senderMatch ? senderMatch[1] : (msgEl.classList.contains('message-out') ? 'You' : ''),
      hasMedia: msgEl.querySelector('img, video, audio') !== null
    };
    messages.push(message);
  });
  
  return messages;
}

// 3 Extract contact list
function extractContacts() {
  const contacts = [];
  const contactElements = document.querySelectorAll('div[role="listitem"]');
  
  contactElements.forEach((contact) => {
    const nameEl = contact.querySelector('span[title]');
    const lastMessageEl = contact.querySelector('._11JPr');
    
    if (nameEl) {
      contacts.push({
        name: nameEl.getAttribute('title'),
        lastMessage: lastMessageEl?.innerText || '',
        unread: contact.querySelector('.OUeyt') !== null
      });
    }
  });
  
  return contacts;
}

// 4 Extract current chat info
function extractCurrentChatInfo() {
  const headerName = document.querySelector('header span[title]');
  const chatInfo = {
    name: headerName?.getAttribute('title') || '',
    isGroup: document.querySelector('header img[alt*="group"]') !== null
  };
  return chatInfo;
}

// 5 Listen for messages from popup/background
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'extractMessages') {
    waitForWhatsApp().then(() => {
      const messages = extractMessages();
      sendResponse({ messages });
    });
    return true;
  } else if (request.action === 'extractContacts') {
    const contacts = extractContacts();
    sendResponse({ contacts });
  } else if (request.action === 'getCurrentChat') {
    const chatInfo = extractCurrentChatInfo();
    sendResponse({ chatInfo });
  }
});

// 5 Auto-extract on page load
waitForWhatsApp().then(() => {
  console.log('WhatsApp Web loaded and ready for extraction');
});