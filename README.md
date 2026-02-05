# Quick Screen

**Instant Peer-to-Peer Screen Sharing**

[View Live Demo](#) · [Report Bug](#) · [Request Feature](#)

---

## Overview

Quick Screen is a high-performance, peer-to-peer screen sharing application designed for instant collaboration. It eliminates the friction of traditional video conferencing tools by removing the need for sign-ups, software installations, or complex setup processes.

Built on WebRTC standards, Quick Screen establishes a direct, end-to-end encrypted connection between users, ensuring low latency and high security. The application uses a lightweight WebSocket-based signaling server to coordinate connections but does not store or process any media stream on the server side, guaranteeing privacy by design.

## Core Features

- **Instant Session Creation**: Generate a unique, secure room ID with a single click.
- **Zero-Latency P2P Streaming**: Leverage WebRTC for direct browser-to-browser media transfer.
- **End-to-End Encryption**: Media streams are encrypted via DTLS/SRTP; no data touches the server.
- **Cross-Browser Compatibility**: Fully supported on Chrome, Firefox, Safari, and Edge without plugins.
- **Production-Grade UI**: Features a "Midnight Ethereal" aesthetic with glassmorphism, fluid animations (Framer Motion), and responsive design.

## Technology Stack

### Frontend
- **Framework**: React 18, Vite
- **Styling**: Tailwind CSS, PostCSS
- **State/Animation**: Framer Motion, Lucid React
- **WebRTC**: Native Browser API (RTCPeerConnection, navigator.mediaDevices)

### Backend (Signaling)
- **Runtime**: Node.js
- **Framework**: Express.js
- **Real-time Engine**: Socket.IO (WebSockets)
- **Security**: Rate Limiting, CORS configuration

### Infrastructure
- **Frontend Hosting**: Vercel
- **Backend Hosting**: Render / Railway
- **Protocol**: TCP (Signaling), UDP (Media Transport)

## System Architecture

Quick Screen implements a standard WebRTC Mesh architecture with a signaling server.

1.  **Signaling Phase**: Client A (Host) and Client B (Viewer) connect to the Socket.IO signaling server.
2.  **SDP Exchange**: Clients exchange Session Description Protocol (SDP) objects (Offer/Answer) via the signaling server to negotiate media capabilities.
3.  **ICE Candidate Exchange**: Clients exchange Interactive Connectivity Establishment (ICE) candidates to discover the best network path (direct LAN, NAT traversal via STUN).
4.  **P2P Connection**: Once the handshake is complete, a direct `RTCPeerConnection` is established.
5.  **Media Streaming**: Video/Audio data flows directly between clients via UDP. The server is no longer involved in the media transfer.

## How It Works

1.  **Host** clicks "Start Sharing" on the landing page, initializing a room.
2.  **Host** obtains a unique Room ID / URL and shares it with the **Viewer**.
3.  **Viewer** enters the Room ID or visits the link.
4.  **Host** receives a notification that a peer has joined and initiates the WebRTC Offer.
5.  **Viewer** receives the Offer, sets it as the Remote Description, and responds with an Answer.
6.  **Host** receives the Answer and finalizes the connection.
7.  Screen sharing stream begins immediately.

## Local Development Setup

### Prerequisites
- Node.js v18+
- npm v9+

### Backend Setup
```bash
cd quickscreen-backend
npm install
npm start
# Server runs on http://localhost:3000
```

### Frontend Setup
```bash
cd quickscreen-frontend
npm install
npm run dev
# Client runs on http://localhost:5173
```

## Environment Variables

### Frontend (.env)
```bash
VITE_BACKEND_URL=http://localhost:3000
```

### Backend (.env)
```bash
PORT=3000
CORS_ORIGIN=http://localhost:5173
```

## Deployment

### Frontend (Vercel)
1.  Connect GitHub repository to Vercel.
2.  Set Root Directory to `quickscreen-frontend`.
3.  Add Environment Variable `VITE_BACKEND_URL` pointing to your production backend.
4.  Deploy.

### Backend (Render)
1.  Create a new Web Service on Render.
2.  Connect GitHub repository.
3.  Set Root Directory to `quickscreen-backend`.
4.  Set Build Command to `npm install`.
5.  Set Start Command to `npm start`.
6.  Add Environment Variable `CORS_ORIGIN` pointing to your production frontend domain.

## Project Structure

```text
QUICKSCREEN/
├── quickscreen-frontend/     # React Client
│   ├── src/
│   │   ├── components/       # Reusable UI components
│   │   ├── pages/            # Route views (Landing, Room)
│   │   ├── utils/            # Helper functions (Room ID gen)
│   │   └── socket.js         # Socket.IO client instance
│   └── tailwind.config.js    # Design system configuration
│
└── quickscreen-backend/      # Signaling Server
    ├── src/
    │   ├── index.js          # Express app & Socket.IO logic
    │   └── socket.js         # Socket configuration
    └── package.json
```

## Resume Key Points

-   **Real-Time Engineering**: Architected a scalable WebRTC signaling service using Socket.IO to facilitate millisecond-latency peer-to-peer connections.
-   **Security**: Implemented secure signaling patterns and header security (Helmet) to protect signaling data and prevent common web vulnerabilities.
-   **Modern UI/UX**: Designed and built a "production-grade" interface using React and Tailwind CSS, featuring advanced animations and a custom aesthetic system.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
