let extractedData = null;

document.getElementById('extractMessages').addEventListener('click', async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  
  if (!tab.url.includes('web.whatsapp.com')) {
    alert('Please navigate to WhatsApp Web first');
    return;
  }
  
  chrome.tabs.sendMessage(tab.id, { action: 'extractMessages' }, (response) => {
    if (response && response.messages) {
      extractedData = response.messages;
      document.getElementById('output').innerText = 
        `Extracted ${response.messages.length} messages`;
    }
  });
});

document.getElementById('extractContacts').addEventListener('click', async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  
  chrome.tabs.sendMessage(tab.id, { action: 'extractContacts' }, (response) => {
    if (response && response.contacts) {
      extractedData = response.contacts;
      document.getElementById('output').innerText = 
        `Extracted ${response.contacts.length} contacts`;
    }
  });
});

document.getElementById('downloadData').addEventListener('click', () => {
  if (!extractedData) {
    alert('No data extracted yet');
    return;
  }
  
  const blob = new Blob([JSON.stringify(extractedData, null, 2)], 
    { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `whatsapp-data-${Date.now()}.json`;
  a.click();
});