const RENDER_BACKEND_URL = 'https://ghostwriter-rtkp.onrender.com/api';

const API_BASE = import.meta.env.VITE_API_BASE_URL ||
  (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1'
    ? RENDER_BACKEND_URL
    : '/api');

export async function fetchVoiceProfile(userId = 'default-creator') {
  const res = await fetch(`${API_BASE}/profile?userId=${encodeURIComponent(userId)}`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export async function saveOnboardingSamples(samples, userId = 'default-creator') {
  const res = await fetch(`${API_BASE}/profile/onboarding`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ samples, userId })
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export async function updateKillList(killList, userId = 'default-creator') {
  const res = await fetch(`${API_BASE}/profile/kill-list`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ killList, userId })
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export async function repurposeContent(sourceContent, userId = 'default-creator', engine = 'minds') {
  const res = await fetch(`${API_BASE}/repurpose`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sourceContent, userId, engine })
  });
  if (!res.ok) {
    let serverMsg = `HTTP ${res.status}`;
    try {
      const body = await res.json();
      if (body.error) serverMsg = body.error;
    } catch (_) {}
    throw new Error(serverMsg);
  }
  return res.json();
}

export async function saveCorrection(platform, originalText, correctedText, learnedRule, userId = 'default-creator') {
  const res = await fetch(`${API_BASE}/corrections`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ platform, originalText, correctedText, learnedRule, userId })
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export async function fetchMindsStatus() {
  const res = await fetch(`${API_BASE}/minds/status`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export async function fetchRepurposeHistory(userId = 'default-creator') {
  const res = await fetch(`${API_BASE}/history?userId=${encodeURIComponent(userId)}`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export async function deleteHistoryItem(id, userId = 'default-creator') {
  const res = await fetch(`${API_BASE}/history/${id}?userId=${encodeURIComponent(userId)}`, {
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

export async function addProfileCorrection(correctionText, userId = 'default-creator') {
  const res = await fetch(`${API_BASE}/profile/corrections`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ correctionText, userId })
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export async function deleteProfileCorrection(index, userId = 'default-creator') {
  const res = await fetch(`${API_BASE}/profile/corrections/${index}?userId=${encodeURIComponent(userId)}`, {
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
    let serverMsg = `HTTP ${res.status}: Subtitles could not be fetched for this video.`;
    try {
      const body = await res.json();
      if (body && body.error) serverMsg = body.error;
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

// ── RLHF Learning Loop (Gemini-Powered) ───────────────────────────────────────

export async function suggestCorrectionRule(originalText, editedText) {
  const res = await fetch(`${API_BASE}/corrections/suggest`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ originalText, editedText })
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export async function acceptCorrectionRule(rule, userId = 'default-creator') {
  const res = await fetch(`${API_BASE}/corrections/accept`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ rule, userId })
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

