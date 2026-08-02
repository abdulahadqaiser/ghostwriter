const express = require('express');
const router = express.Router();
const { YoutubeTranscript } = require('youtube-transcript');
const { getSubtitles } = require('youtube-caption-extractor');

// Extract YouTube video ID from various URL formats
function extractVideoId(urlStr) {
  if (!urlStr || typeof urlStr !== 'string') return null;
  const str = urlStr.trim();
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = str.match(regExp);
  if (match && match[2] && match[2].length === 11) return match[2];
  if (str.length === 11 && !str.includes('/') && !str.includes('.')) return str;
  return null;
}

function isYouTubeUrl(url) {
  return /youtu\.be|youtube\.com/i.test(url);
}

// Tier 4 helper: Direct watch HTML parsing with Consent Cookie
async function fetchDirectYoutubeTrack(videoId) {
  const watchUrl = `https://www.youtube.com/watch?v=${videoId}`;
  const response = await fetch(watchUrl, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
      'Accept-Language': 'en-US,en;q=0.9',
      'Cookie': 'CONSENT=PENDING+999; YES+cb.20210328-17-p0.en+FX+410; SOCS=CAESEwgDEgk1ODE3OTQ1MjEaAmVuIAEaBgiA_LqqBg; PREF=tz=UTC'
    }
  });

  if (!response.ok) throw new Error(`YouTube watch page returned HTTP ${response.status}`);
  const html = await response.text();

  const tracksMatch = html.match(/"captionTracks":\s*(\[.*?\])/);
  if (!tracksMatch) throw new Error('captionTracks not present in watch HTML');

  const tracks = JSON.parse(tracksMatch[1]);
  if (!tracks || tracks.length === 0) throw new Error('No caption tracks found in JSON');

  const selectedTrack = tracks.find(t => t.languageCode === 'en' || t.languageCode?.startsWith('en')) || tracks[0];
  if (!selectedTrack?.baseUrl) throw new Error('Selected track missing baseUrl');

  const xmlRes = await fetch(selectedTrack.baseUrl, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
      'Referer': watchUrl
    }
  });

  const xmlText = await xmlRes.text();
  if (!xmlText) throw new Error('Subtitle XML track was empty');

  const textMatches = xmlText.match(/<text[^>]*>(.*?)<\/text>/gi);
  if (!textMatches || textMatches.length === 0) throw new Error('No text nodes in subtitle XML');

  return textMatches.map(m => m.replace(/<[^>]+>/g, ''));
}

// RapidAPI YouTube Transcript Helper (Solution 2 - 100% Reliable for Cloud/Datacenter Deployments)
async function fetchRapidApiYoutubeTranscript(videoId) {
  const apiKey = process.env.RAPIDAPI_KEY || 'b387161834mshf868b88c1f28bd4p1b48f7jsn1fda6a9d16cf';
  const host = process.env.RAPIDAPI_HOST || 'youtube-transcript3.p.rapidapi.com';
  const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
  const apiUrl = `https://${host}/api/transcript-with-url?url=${encodeURIComponent(videoUrl)}&flat_text=true&lang=en`;

  console.log(`[Ingest API] Calling RapidAPI (${host}) for videoId: ${videoId}`);

  const response = await fetch(apiUrl, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'x-rapidapi-host': host,
      'x-rapidapi-key': apiKey
    }
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`RapidAPI returned HTTP ${response.status}: ${errText}`);
  }

  const data = await response.json();
  if (!data || data.success === false) {
    throw new Error(data?.error || 'RapidAPI transcript extraction failed.');
  }

  if (typeof data.transcript === 'string' && data.transcript.trim()) {
    return [data.transcript.trim()];
  }

  if (Array.isArray(data.transcript) && data.transcript.length > 0) {
    return data.transcript.map(item => typeof item === 'string' ? item : (item.text || item.content || ''));
  }

  throw new Error('RapidAPI returned empty transcript content.');
}

// POST /api/ingest/youtube - Extract YouTube transcript
router.post('/youtube', async (req, res) => {
  try {
    const { url } = req.body;
    if (!url || typeof url !== 'string' || !url.trim()) {
      return res.status(400).json({ success: false, error: 'Please provide a valid YouTube video URL.' });
    }

    const videoId = extractVideoId(url);
    if (!videoId) {
      return res.status(400).json({ success: false, error: 'Invalid YouTube URL. Could not extract video ID.' });
    }

    console.log(`[Ingest API] Fetching transcript for YouTube videoId: ${videoId}`);

    let rawSegments = [];
    let extractionError = null;

    // Tier 0: RapidAPI YouTube Transcript API (Solution 2 - 100% Reliable Datacenter Bypass)
    try {
      const rapidApiSegments = await fetchRapidApiYoutubeTranscript(videoId);
      if (rapidApiSegments && rapidApiSegments.length > 0) {
        rawSegments = rapidApiSegments;
        console.log(`[Ingest API] Tier 0 (RapidAPI) succeeded for ${videoId} (${rawSegments.length} segments)`);
      }
    } catch (rapidErr) {
      console.warn(`[Ingest API] Tier 0 (RapidAPI) failed for ${videoId}:`, rapidErr.message);
      extractionError = rapidErr;
    }

    // Tier 1: Try youtube-caption-extractor with lang='en'
    if (rawSegments.length === 0) {
      try {
        const result = await getSubtitles({ videoID: videoId, lang: 'en' });
        if (result && Array.isArray(result) && result.length > 0) {
          rawSegments = result.map(s => s.text);
          console.log(`[Ingest API] Tier 1 (youtube-caption-extractor en) succeeded for ${videoId} (${rawSegments.length} segments)`);
        }
      } catch (err1) {
        console.warn(`[Ingest API] Tier 1 failed for ${videoId}:`, err1.message);
        if (!extractionError) extractionError = err1;
      }
    }

    // Tier 2: Try youtube-caption-extractor without language constraint
    if (rawSegments.length === 0) {
      try {
        const result = await getSubtitles({ videoID: videoId });
        if (result && Array.isArray(result) && result.length > 0) {
          rawSegments = result.map(s => s.text);
          console.log(`[Ingest API] Tier 2 (youtube-caption-extractor default) succeeded for ${videoId} (${rawSegments.length} segments)`);
        }
      } catch (err2) {
        console.warn(`[Ingest API] Tier 2 failed for ${videoId}:`, err2.message);
        if (!extractionError) extractionError = err2;
      }
    }

    // Tier 3: Try youtube-transcript library
    if (rawSegments.length === 0) {
      try {
        const items = await YoutubeTranscript.fetchTranscript(videoId);
        if (items && Array.isArray(items) && items.length > 0) {
          rawSegments = items.map(item => item.text);
          console.log(`[Ingest API] Tier 3 (youtube-transcript) succeeded for ${videoId} (${rawSegments.length} segments)`);
        }
      } catch (err3) {
        console.warn(`[Ingest API] Tier 3 failed for ${videoId}:`, err3.message);
        if (!extractionError) extractionError = err3;
      }
    }

    // Tier 4: Direct watch HTML parsing with Consent Cookie
    if (rawSegments.length === 0) {
      try {
        const directSegments = await fetchDirectYoutubeTrack(videoId);
        if (directSegments && directSegments.length > 0) {
          rawSegments = directSegments;
          console.log(`[Ingest API] Tier 4 (direct HTML track) succeeded for ${videoId} (${rawSegments.length} segments)`);
        }
      } catch (err4) {
        console.warn(`[Ingest API] Tier 4 failed for ${videoId}:`, err4.message);
        if (!extractionError) extractionError = err4;
      }
    }

    if (rawSegments.length === 0) {
      const detail = extractionError?.message || 'No caption tracks found';
      console.error(`[Ingest API] All YouTube transcript extraction tiers failed for ${videoId}: ${detail}`);
      return res.status(400).json({
        success: false,
        error: `Could not extract subtitles for this video (${detail}). Please verify captions are available or paste text manually.`
      });
    }

    const transcriptText = rawSegments
      .map(t => typeof t === 'string' ? t : '')
      .map(t => t.replace(/&amp;/g, '&').replace(/&#39;/g, "'").replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>'))
      .join(' ')
      .replace(/\s+/g, ' ')
      .trim();

    if (!transcriptText || transcriptText.length < 10) {
      return res.status(400).json({
        success: false,
        error: 'Extracted transcript was empty or too short. Subtitles may be disabled for this video.'
      });
    }

    res.json({
      success: true,
      videoId,
      transcript: transcriptText,
      itemCount: rawSegments.length,
      source: 'youtube'
    });
  } catch (err) {
    console.error('[Ingest API] Unexpected error extracting YouTube transcript:', err.stack || err.message);
    res.status(400).json({
      success: false,
      error: `YouTube transcript extraction failed: ${err.message}. Please paste text manually.`
    });
  }
});

// POST /api/ingest/article - Extract article text via Readability
router.post('/article', async (req, res) => {
  try {
    const { url } = req.body;
    if (!url || typeof url !== 'string' || !url.trim()) {
      return res.status(400).json({ success: false, error: 'Please provide a valid article URL.' });
    }

    // Validate URL format
    let parsedUrl;
    try {
      parsedUrl = new URL(url.trim());
      if (!['http:', 'https:'].includes(parsedUrl.protocol)) throw new Error('Bad protocol');
    } catch (_) {
      return res.status(400).json({ success: false, error: 'Invalid URL. Please include http:// or https://' });
    }

    console.log(`[Ingest API] Fetching article from: ${parsedUrl.href}`);

    // Dynamically require to avoid issues if packages aren't installed yet
    const { Readability } = require('@mozilla/readability');
    const { JSDOM } = require('jsdom');

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);

    let html;
    try {
      const response = await fetch(parsedUrl.href, {
        signal: controller.signal,
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; GhostwriterBot/1.0)',
          'Accept': 'text/html,application/xhtml+xml',
          'Accept-Language': 'en-US,en;q=0.9'
        }
      });
      clearTimeout(timeout);

      if (!response.ok) {
        return res.status(400).json({ success: false, error: `Could not fetch article: HTTP ${response.status}. The site may block automated requests.` });
      }
      html = await response.text();
    } catch (fetchErr) {
      clearTimeout(timeout);
      if (fetchErr.name === 'AbortError') {
        return res.status(400).json({ success: false, error: 'Request timed out. The site took too long to respond.' });
      }
      return res.status(400).json({ success: false, error: `Could not reach the URL: ${fetchErr.message}` });
    }

    // Parse with JSDOM + Readability
    const dom = new JSDOM(html, { url: parsedUrl.href });
    const document = dom.window.document;

    // ── Pre-clean noisy elements BEFORE Readability sees the DOM ──────────
    // These patterns consistently produce garbage output: comment sections,
    // upvote widgets, sidebars, nav bars, footers, and any element whose
    // class or id contains the word "comment".
    const noiseSelectors = [
      '.comments', '#comments',
      '.post-responses', '.responses',
      '.upvotes', '.upvote',
      'footer', 'nav', 'aside',
      '.sidebar', '#sidebar',
      '[class*="comment"]', '[id*="comment"]',
      '[class*="reply"]',   '[id*="reply"]',
      '[class*="reaction"]',
      '[class*="widget"]',
      '[class*="subscribe"]', '[id*="subscribe"]',
      '[class*="newsletter"]',
      '[class*="related"]', '[id*="related"]',
      '[class*="recommend"]',
      '[class*="social"]',
      'script', 'style', 'noscript'
    ];
    noiseSelectors.forEach(selector => {
      try {
        document.querySelectorAll(selector).forEach(el => el.remove());
      } catch (_) { /* invalid selector — skip */ }
    });

    const reader = new Readability(document);
    const article = reader.parse();

    if (!article || !article.textContent || article.textContent.trim().length < 100) {
      return res.status(400).json({ success: false, error: 'Could not extract readable content from this URL. Try pasting the text manually.' });
    }

    // ── Clean up whitespace ───────────────────────────────────────────────
    const cleanText = article.textContent
      .replace(/\t/g, ' ')           // tabs → single space
      .replace(/[ ]{3,}/g, '  ')     // 3+ spaces → 2 spaces
      .replace(/\n{3,}/g, '\n\n')    // 3+ newlines → exactly 2 (prevents blank-wall effect)
      .trim();

    res.json({
      success: true,
      title: article.title || '',
      byline: article.byline || '',
      excerpt: article.excerpt || '',
      text: cleanText,
      wordCount: cleanText.split(/\s+/).length,
      source: 'article'
    });
  } catch (err) {
    console.error('[Ingest API] Article extraction error:', err.message);
    res.status(400).json({ success: false, error: 'Could not extract article content. Please paste the text manually.' });
  }
});

// POST /api/ingest/auto - Auto-detect YouTube vs Article and route accordingly
router.post('/auto', async (req, res) => {
  const { url } = req.body;
  if (!url) return res.status(400).json({ success: false, error: 'URL is required.' });
  // Forward to the correct sub-route handler based on URL type
  req.body.url = url;
  if (isYouTubeUrl(url)) {
    return router.handle({ ...req, path: '/youtube', url: '/youtube' }, res, () => {});
  }
  return router.handle({ ...req, path: '/article', url: '/article' }, res, () => {});
});

module.exports = router;
