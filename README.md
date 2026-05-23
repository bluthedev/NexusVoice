# 🌌 NexusVoice: 3D Neural Text-to-Speech Dashboard

NexusVoice is a state-of-the-art, futuristic 3D web application designed to orchestrate document ingestion and high-fidelity speech synthesis. It seamlessly converts raw text and PDF documents into studio-grade auditory signals, complete with dual-format export controls (`.wav` and `.mp3`/`.mp4` wrappers). Built using **React, Three.js, React Three Fiber, and Tailwind CSS**, the application presents a highly immersive, dark-themed cybernetic aesthetic featuring real-time 3D visualizers that dance to the rhythm of data streams.

---

## ✨ Key Features

- **🛸 Neural 3D Core Visualizer**: Driven by *Three.js* and *React Three Fiber*, a real-time, morphing holographic icosahedron reacts dynamically during file processing and audio synthesis.
- **📄 Advanced File Ingestion Matrix**: Drop plain text (`.txt`) or PDF files (`.pdf`) directly onto the UI. A PDF.js parsing engine automatically translates the layout into clean, extractable textual data.
- **🎙️ Real-time Audio Synthesis**: Instantly play extracted text directly within the browser using the Web Speech Synthesis API. Optimized to search for the most natural, premium-sounding voices (e.g., Google Neural voices).
- **💾 Audio Matrix Export**: Direct downlinks for `.mp3`/`.wav` tracks processed through high-velocity external speech synthesis servers with full retry & exponential backoff policies.
- **🛡️ Secure Local API Gateway**: Equipped with a robust Node.js backend acting as a secure proxy for enterprise Google Cloud/Vertex AI API endpoints, pre-configured with defensive rate limiting and hot-reloading.

---

## 🛠️ Tech Stack & Architecture

### **Frontend**
- **Core**: React 18+ (TypeScript)
- **Styling**: Tailwind CSS (sleek glassmorphism, dark neo-brutalist palettes, customized neon scrollbars)
- **3D Graphics**: Three.js, `@react-three/fiber`, and `@react-three/drei`
- **Vector Assets**: Lucide React Icons
- **Document Processing**: PDF.js (configured via remote web worker)

### **Backend**
- **Runtime**: Node.js & Express
- **API Proxy Interceptor**: Secure, client-side interceptor monkey-patching `window.fetch` and `window.WebSocket` to proxy Google Cloud AI requests.
- **Defense System**: `express-rate-limit` protecting backend APIs.
- **Authentication**: `google-auth-library` pulling from Google Application Default Credentials (ADC).

---

## 🚀 Setup & Launch Locally

Follow these quick instructions to initiate the application on your local machine:

### 📋 Prerequisites
- Ensure **Node.js** (v18 or higher) and **npm** are installed.
- (Optional for Backend Proxy) **Google Cloud SDK / gcloud CLI**:
  - Run `gcloud init` to bind your project.
  - Run `gcloud auth application-default login` to enable authentication for Google Cloud Vertex APIs.

### 🔌 Step-by-Step Launch

1. **Install Root and Workspace Dependencies**:
   ```bash
   npm install
   ```

2. **Configure Environment Variables**:
   Confirm your Google Cloud settings inside `backend/.env.local`:
   ```env
   API_BACKEND_HOST="127.0.0.1"
   API_BACKEND_PORT=5000
   API_PAYLOAD_MAX_SIZE="7mb"
   GOOGLE_CLOUD_LOCATION="global"
   GOOGLE_CLOUD_PROJECT="your-google-cloud-project-id"
   PROXY_HEADER="your-secure-proxy-header"
   ```

3. **Start the Concurrent Development Servers**:
   Launch both the Vite frontend and Node.js backend concurrently with a single command:
   ```bash
   npm run dev
   ```

   *Access the client dashboard at:* **`http://localhost:5173`** (or the port outputted by Vite).

---

## 📂 Project Structure

```
nexusvoice---3d-neural-tts/
├── frontend/                # Vite React App with 3D Canvas
│   ├── src/                 # Application codebase
│   │   ├── App.tsx          # Master controller & layout
│   │   ├── components/      # Loading3D visualizer & GlowingCard wrapper
│   │   └── utils/           # Audio play/download & PDF file ingestion services
│   ├── package.json         # Frontend packages
│   └── vite.config.ts       # Vite config
├── backend/                 # Node.js/Express Proxy API
│   ├── server.js            # Express API with WebSocket / Vertex proxy endpoints
│   ├── package.json         # Backend packages
│   └── .env.local           # Environment configuration (pre-loaded)
├── package.json             # Root monorepo workspace configurations
└── README.md                # Documentation matrix
```
