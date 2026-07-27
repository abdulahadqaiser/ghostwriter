const express = require('express');
const router = express.Router();
const { YoutubeTranscript } = require('youtube-transcript');

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

    const items = await YoutubeTranscript.fetchTranscript(videoId);

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, error: 'Subtitles are disabled for this video. Please paste text manually.' });
    }

    const transcriptText = items
      .map(item => item.text.replace(/&amp;/g, '&').replace(/&#39;/g, "'").replace(/&quot;/g, '"'))
      .join(' ')
      .replace(/\s+/g, ' ')
      .trim();

    res.json({ success: true, videoId, transcript: transcriptText, itemCount: items.length, source: 'youtube' });
  } catch (err) {
    console.warn('[Ingest API] Error extracting YouTube transcript:', err.message);
    res.status(400).json({ success: false, error: 'Subtitles are disabled for this video. Please paste text manually.' });
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
