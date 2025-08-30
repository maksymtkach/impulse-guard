document.addEventListener('DOMContentLoaded', async () => {
  const { API_URL, API_TOKEN } = await chrome.storage.sync.get(['API_URL','API_TOKEN']);
  if (API_URL) document.getElementById('url').value = API_URL;
  if (API_TOKEN) document.getElementById('token').value = API_TOKEN;
});
document.getElementById('save').addEventListener('click', async () => {
  await chrome.storage.sync.set({
    API_URL: document.getElementById('url').value.trim(),
    API_TOKEN: document.getElementById('token').value.trim()
  });
  document.getElementById('msg').textContent = 'Saved.';
});

