const API_BASE = '/api';

export async function fetchVoiceProfile() {
  const res = await fetch(`${API_BASE}/profile`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export async function saveOnboardingSamples(samples) {
  const res = await fetch(`${API_BASE}/profile/onboarding`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ samples })
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export async function updateKillList(killList) {
  const res = await fetch(`${API_BASE}/profile/kill-list`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ killList })
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export async function repurposeContent(sourceContent) {
  const res = await fetch(`${API_BASE}/repurpose`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sourceContent })
  });
  if (!res.ok) {
    // Try to parse the server's user-facing error message
    let serverMsg = `HTTP ${res.status}`;
    try {
      const body = await res.json();
      if (body.error) serverMsg = body.error;
    } catch (_) {}
    throw new Error(serverMsg);
  }
  return res.json();
}

export async function saveCorrection(platform, originalText, correctedText, learnedRule) {
  const res = await fetch(`${API_BASE}/corrections`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ platform, originalText, correctedText, learnedRule })
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export async function fetchMindsStatus() {
  const res = await fetch(`${API_BASE}/minds/status`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export async function fetchRepurposeHistory() {
  const res = await fetch(`${API_BASE}/history`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export async function deleteHistoryItem(id) {
  const res = await fetch(`${API_BASE}/history/${id}`, {
    method: 'DELETE'
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export async function clearAllHistory() {
  const res = await fetch(`${API_BASE}/history`, {
    method: 'DELETE'
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export async function addProfileCorrection(correctionText) {
  const res = await fetch(`${API_BASE}/profile/corrections`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ correctionText })
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export async function deleteProfileCorrection(index) {
  const res = await fetch(`${API_BASE}/profile/corrections/${index}`, {
    method: 'DELETE'
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export async function ingestYouTubeTranscript(url) {
  const res = await fetch(`${API_BASE}/ingest/youtube`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url })
  });
  if (!res.ok) {
    let serverMsg = 'Subtitles are disabled for this video. Please paste text manually.';
    try {
      const body = await res.json();
      if (body.error) serverMsg = body.error;
    } catch (_) {}
    throw new Error(serverMsg);
  }
  return res.json();
}

export async function ingestArticle(url) {
  const res = await fetch(`${API_BASE}/ingest/article`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url })
  });
  if (!res.ok) {
    let serverMsg = 'Could not extract article content. Please paste the text manually.';
    try {
      const body = await res.json();
      if (body.error) serverMsg = body.error;
    } catch (_) {}
    throw new Error(serverMsg);
  }
  return res.json();
}
