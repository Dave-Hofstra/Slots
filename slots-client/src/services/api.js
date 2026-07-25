const API_BASE = '/Slots/api/slots';

export async function fetchThemesFromServer() {
  const resp = await fetch(`${API_BASE}/themes`);
  const data = await resp.json();
  return data.themes || {};
}

export async function saveThemesToServer(themes) {
  await fetch(`${API_BASE}/themes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ themes }),
  });
}

export async function uploadSymbolImage(themeKey, symId, blob) {
  const fd = new FormData();
  fd.append('theme', themeKey);
  fd.append('sym', symId);
  fd.append('file', blob, symId + '.png');
  const resp = await fetch(`${API_BASE}/themes/upload`, { method: 'POST', body: fd });
  const data = await resp.json();
  if (resp.status !== 200 || !data.path) throw new Error('Upload failed');
  return data.path;
}

export async function fetchPlayersFromServer() {
  const resp = await fetch(`${API_BASE}/players`);
  const data = await resp.json();
  return data.players || {};
}

export async function savePlayersToServer(players) {
  await fetch(`${API_BASE}/players`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ players }),
  });
}
