# ✍️ Ghostwriter — AI-Powered Authentic Voice Repurposing Engine

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://ghostwriter-azure.vercel.app/)
[![Backend API](https://img.shields.io/badge/Backend-Render-46E3B7?style=for-the-badge&logo=render&logoColor=white)](https://ghostwriter-rtkp.onrender.com/api/profile?userId=default-creator)
[![Hackathon](https://img.shields.io/badge/Hackathon-The%20Sandbox%20x%20Animoca%20Brands-FF5E00?style=for-the-badge)](https://hellominds.ai)
[![License](https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge)](LICENSE)

> **Ghostwriter** is an AI agent built on **Minds by Animoca Brands** that repurposes long-form content (YouTube transcripts, articles, scripts) into platform-native text that **actually sounds like you**. Unlike generic AI tools that strip away creator tone, Ghostwriter maintains an evolving, RLHF-refined Voice Profile that adapts to your unique writing style over time.

---

## 🔗 Quick Links

- 🌐 **Live Web Application (Vercel):** [ghostwriter-azure.vercel.app](https://ghostwriter-azure.vercel.app/)
- ⚙️ **Production API (Render):** [ghostwriter-rtkp.onrender.com](https://ghostwriter-rtkp.onrender.com/)
- 🧠 **AI Platform:** [Minds by Animoca Brands (`api.build.hellominds.ai/v1`)](https://build.hellominds.ai)

---

## 🎯 The Problem

Creators who repurpose long-form videos or articles across social media face a major bottleneck:
1. **Generic AI Output:** Existing tools (OpusClip, Repurpose.io) generate grammatically robotic text that strips out creator tone, slang, sentence rhythm, and authentic voice.
2. **Hours Spent Editing:** Creators spend hours manually rewriting AI-generated captions and threads before publishing.
3. **Platform Penalties:** Auto-posting tools are penalized by platform algorithms (especially Instagram & YouTube) which suppress third-party automated posts.

**Academic & Technical Basis:** Research on LLM authorship proves that when LLMs are prompted naively to *"match my tone"*, their outputs still cluster closer to the model's baseline distribution than the target author's style. Solving this requires persistent, explicit voice-memory constraint injection and active RLHF learning.

---

## ✨ Key Features

- **🧠 Minds by Animoca Brands Core Engine:** Uses Animoca Minds as the persistent reasoning core for cross-platform content transformation.
- **🎙️ Evolving Voice Profile (RLHF Loop):** Extracts tone traits, enforces a negative word "Kill List", and automatically generates stylistic rules when you edit AI drafts.
- **📹 Multi-Tier YouTube & Article Ingestion Engine:** Extracts transcripts from YouTube URLs via a 5-tier fallback engine (RapidAPI Proxy $\rightarrow$ TimedText $\rightarrow$ JSDOM) with 100% cloud datacenter block bypass.
- **📱 3 Platform-Native Formats:**
  - **X (Twitter) Threads:** 3-5 punchy, hook-driven tweet sequences.
  - **Instagram Captions:** Formatted with line breaks, hooks, and engagement calls-to-action.
  - **YouTube Community Posts:** Conversational, audience-facing posts with poll questions.
- **⚡ Dual AI Engine Support:** Powered by Animoca Minds API with seamless fallback to Google Gemini 2.5 Flash / 2.0 Flash.
- **📜 History & Repurposing Studio:** View, manage, edit, and filter previous generations with full markdown support.

---

## 🏗️ System Architecture

```mermaid
graph TD
    User([👤 Content Creator]) -->|Paste URL / Transcript| UI[💻 Vercel React Frontend]
    UI -->|REST API Requests| Server[⚙️ Render Express Backend]
    
    subgraph Backend Core Engine
        Server -->|Fetch Transcript| Ingest[📹 Multi-Tier YouTube Ingest Engine]
        Ingest -->|RapidAPI Proxy / TimedText| Server
        Server -->|Load Voice Profile & Rules| DB[(🍃 MongoDB Atlas)]
        
        Server -->|Compressed Context + Voice Rules| Minds[🧠 Animoca Minds API]
        Minds -->|Fallback if Quota Exceeded| Gemini[✨ Google Gemini Flash API]
    end
    
    Minds -->|Platform Native JSON| Server
    Gemini -->|Platform Native JSON| Server
    Server -->|Sanitized JSON Response| UI
    UI -->|User Edits Draft| RLHF[🔄 RLHF Rule Generator]
    RLHF -->|Save Learned Style Rule| DB
```

---

## 🛠️ Tech Stack

- **Frontend:** React 18, Vite, Lucide Icons, Glassmorphism CSS design system.
- **Backend:** Node.js, Express.js, MongoDB (Mongoose), `https` native stream handling.
- **AI Engines:** Minds by Animoca Brands API (`api.build.hellominds.ai/v1`), Google Gemini 2.5/2.0 Flash.
- **Ingestion:** RapidAPI YouTube Transcripts Proxy, JSDOM, `youtube-caption-extractor`.
- **Deployment:** Vercel (Frontend), Render (Backend & Mongo Atlas).

---

## 🚀 Local Setup Instructions

### Prerequisites
- Node.js (v18+ recommended)
- MongoDB instance (local or MongoDB Atlas)
- RapidAPI Key (for YouTube transcript ingestion)
- Animoca Minds API Key & Gemini API Key

### 1. Clone Repository
```bash
git clone https://github.com/abdulahadqaiser/ghostwriter.git
cd ghostwriter
```

### 2. Backend Setup
```bash
cd server
npm install
```

Create a `.env` file in the `server/` directory:
```env
PORT=5000
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/ghostwriter
MINDS_BUILDER_API_KEY=your_minds_api_key
MINDS_MIND_ID=c909513e-f36b-1410-8465-00039ce7df11
GEMINI_API_KEY=your_gemini_api_key
RAPIDAPI_KEY=your_rapidapi_key
RAPIDAPI_HOST=youtube-transcript3.p.rapidapi.com
```

Start the backend dev server:
```bash
npm run dev
```

### 3. Frontend Setup
```bash
cd ../client
npm install
npm run dev
```

Open `http://localhost:3000` in your browser.

---

## 📹 Hackathon Pitch & Walkthrough Video Script (3-Minute Video)

Below is the complete 3-minute video presentation script for demo video submission.

---

### ⏱️ Video Timeline Overview
| Timestamp | Section | Key Visual / Screen Focus |
|---|---|---|
| **0:00 - 0:30** | **The Hook & Problem** | Creator editing generic AI captions, showing frustration |
| **0:30 - 1:15** | **The Solution & Voice Setup** | Ghostwriter UI, Voice Profile modal, Kill List |
| **1:15 - 2:15** | **Live Demo (Ingest to Repurpose)** | Pasting MKBHD video URL $\rightarrow$ 3 platform outputs |
| **2:15 - 2:45** | **The RLHF Learning Loop** | User editing draft $\rightarrow$ Auto-suggested rule saved |
| **2:45 - 3:00** | **Tech Architecture & Closing** | Animoca Minds API diagram & future vision |

---

### 🎙️ Full Spoken Script & Screen Directions

#### **[0:00 - 0:30] SECTION 1: THE HOOK & THE PROBLEM**

- **[VISUAL]**: Show a creator looking at ChatGPT or standard AI caption tools. Highlight generic outputs filled with words like *"delve"*, *"tapestry"*, and robotic phrasing.
- **[SPEAKER]**:
  > *"Every creator knows that content repurposing is the secret to scaling audience reach. But if you've ever used standard AI tools, you know the problem: **they get the format right, but they completely strip away your voice**.*
  >
  > *Creators spend hours manually rewriting generic AI captions before publishing because no creator wants to sound like a bot.
  >
  > *Meet **Ghostwriter** — an AI engine built on **Minds by Animoca Brands** that repurposes your long-form videos and articles into platform-native text that **actually sounds like you wrote it**."*

---

#### **[0:30 - 1:15] SECTION 2: VOICE PROFILE & MINDS ENGINE**

- **[VISUAL]**: Screen recording of [Ghostwriter Web App](https://ghostwriter-azure.vercel.app/). Click on **"Voice Profile"** modal in top navigation.
- **[SPEAKER]**:
  > *"The foundation of Ghostwriter is memory ownership. Powered by Animoca Minds API, Ghostwriter holds an evolving Voice Profile of the creator.
  >
  > *Here in the Voice Profile studio, creators feed past writing samples, define their tone traits — like 'Direct', 'Punchy', or 'Authentic' — and configure a **Kill List** of forbidden AI words like 'delve', 'synergy', and 'tapestry'.
  >
  > *Every time Ghostwriter processes content, it injects these stylistic constraints directly into the Minds reasoning core."*

---

#### **[1:15 - 2:15] SECTION 3: LIVE REPURPOSING DEMO**

- **[VISUAL]**: Paste Marquez Brownlee's Apple Vision Pro YouTube URL (`https://www.youtube.com/watch?v=86Gy035z_KA`) into the input box. Click **"Repurpose Content"**. Watch the processing animation, then reveal the 3 tabbed outputs.
- **[SPEAKER]**:
  > *"Let's see it in action. I'll paste a YouTube video URL.
  >
  > *Our multi-tier ingestion engine extracts the transcript in real-time — bypassing cloud IP blocks seamlessly. Ghostwriter then condenses the context while preserving speaker rhythm and sends it through our Animoca Minds pipeline.
  >
  > *In seconds, we get three platform-native outputs:
  > 1. **An X Thread:** 5 punchy tweets formatted with natural pauses and vocal emphasis.
  > 2. **An Instagram Caption:** Hook-first with clean paragraph spacing and zero forbidden words.
  > 3. **A YouTube Community Post:** Conversational tone ending with an interactive poll question."*

---

#### **[2:15 - 2:45] SECTION 4: THE RLHF LEARNING LOOP**

- **[VISUAL]**: Click **"Edit Mode"** on the generated X thread. Change a phrase (e.g., change *"do not"* to *"don't"*). Click **"Save Edits"**. Show the AI pop-up notification: *"New rule learned: Always use casual contractions (don't) instead of formal phrasing"*.
- **[SPEAKER]**:
  > *"Here is where Ghostwriter gets truly intelligent: **The RLHF Learning Loop**.
  >
  > *When a creator edits any draft in the Repurposing Studio, Ghostwriter analyzes the diff in the background using Gemini AI and automatically extracts a new writing rule.
  >
  > *That rule is permanently saved back to the creator's Animoca Mind profile — meaning Ghostwriter literally gets smarter and more accurate to your voice with every edit."*

---

#### **[2:45 - 3:00] SECTION 5: TECH ARCHITECTURE & CLOSING**

- **[VISUAL]**: Show the architecture diagram (Vercel React + Render Node.js + Animoca Minds API + MongoDB Atlas). End on logo screen with live URL: `ghostwriter-azure.vercel.app`.
- **[SPEAKER]**:
  > *"Ghostwriter is built with React, Node.js, Express, and MongoDB, using Animoca Minds API as its reasoning core.
  >
  > *By combining persistent voice profiles with live learning feedback, Ghostwriter gives creators their time back — without compromising their authentic voice.
  >
  > *Try the live app today at **ghostwriter-azure.vercel.app**. Thank you!"*

---

## 📜 License

Distributed under the MIT License. See `LICENSE` for details.
