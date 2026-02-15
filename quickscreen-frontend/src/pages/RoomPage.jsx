import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import socket from "../socket";
import { Copy, MonitorUp, StopCircle, LogOut, Activity } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { log as logger } from "../utils/logger";
import Toast from "../components/ui/Toast";

/* ---------------------------
   STUN + TURN (ENV)
---------------------------- */

const iceConfig = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
    {
      urls: [
        "turn:global.relay.metered.ca:80",
        "turn:global.relay.metered.ca:3478",
        "turn:global.relay.metered.ca:443",
      ],
      username: import.meta.env.VITE_TURN_USERNAME,
      credential: import.meta.env.VITE_TURN_PASSWORD,
    },
    {
      urls: [
        "turn:global.relay.metered.ca:80?transport=tcp",
        "turn:global.relay.metered.ca:3478?transport=tcp",
        "turn:global.relay.metered.ca:443?transport=tcp",
      ],
      username: import.meta.env.VITE_TURN_USERNAME,
      credential: import.meta.env.VITE_TURN_PASSWORD,
    },
  ],
  iceCandidatePoolSize: 10,
  iceTransportPolicy: "all",
};

// Use the imported logger with the same interface
const log = {
  i: (msg, data) => logger.i(msg, data),
  s: (msg, data) => logger.s(msg, data),
  e: (msg, data) => logger.e(msg, data),
  w: (msg, data) => logger.w(msg, data),
};

// Diagnostic Check
if (
  !import.meta.env.VITE_TURN_USERNAME ||
  !import.meta.env.VITE_TURN_PASSWORD
) {
  log.w(
    "WebRTC: TURN credentials missing in ENV - relaying will fail across networks!",
  );
} else {
  log.s("WebRTC: TURN credentials found.");
}

export default function RoomPage() {
  const { roomId } = useParams();
  const navigate = useNavigate();

  const videoRef = useRef(null);
  const peerRef = useRef(null);
  const streamRef = useRef(null);
  const pendingCandidatesRef = useRef([]);

  const [isSharing, setIsSharing] = useState(false);
  const [isHost, setIsHost] = useState(false);
  const [status, setStatus] = useState("Waiting for host...");
  const [showToast, setShowToast] = useState(false);
  const [hasRemoteStream, setHasRemoteStream] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [debugInfo, setDebugInfo] = useState({
    conn: "new",
    ice: "new",
    socket: false,
    candidates: 0,
    hasRelay: false,
  });

  const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

  const getPeer = () => {
    if (peerRef.current) {
      log.i("Reusing peer");
      return peerRef.current;
    }

    log.i("Creating new peer", iceConfig);
    const peer = new RTCPeerConnection(iceConfig);

    // Monitor connection states
    peer.onconnectionstatechange = () => {
      log.i(`Connection: ${peer.connectionState}`);
      setDebugInfo((prev) => ({ ...prev, conn: peer.connectionState }));

      if (peer.connectionState === "connected") {
        log.s("Peer CONNECTED!");
        setStatus("Live");
      }

      if (peer.connectionState === "failed") {
        log.e("Connection FAILED - restarting ICE");
        peer.restartIce();
      }

      if (peer.connectionState === "disconnected") {
        log.w("Disconnected");
        setStatus("Reconnecting...");
      }
    };

    peer.oniceconnectionstatechange = () => {
      log.i(`ICE: ${peer.iceConnectionState}`);
      setDebugInfo((prev) => ({ ...prev, ice: peer.iceConnectionState }));

      if (peer.iceConnectionState === "failed") {
        log.e("ICE FAILED");
      }
    };

    peer.onicegatheringstatechange = () => {
      log.i(`ICE gathering: ${peer.iceGatheringState}`);
    };

    peer.onicecandidateerror = (e) => {
      log.e(`ICE candidate error: ${e.errorCode} ${e.errorText} at ${e.url}`);
    };

    peer.onicecandidate = (e) => {
      if (e.candidate) {
        log.i("Sending ICE candidate", e.candidate.type);
        setDebugInfo((prev) => ({
          ...prev,
          candidates: prev.candidates + 1,
          hasRelay: prev.hasRelay || e.candidate.type === "relay",
        }));
        socket.emit("signal", {
          roomId,
          signal: { candidate: e.candidate },
        });
      } else {
        log.s("ICE gathering complete");
      }
    };

    peer.ontrack = (e) => {
      log.s("Track received!", e.track.kind);

      if (videoRef.current && e.streams[0]) {
        videoRef.current.srcObject = e.streams[0];
        setHasRemoteStream(true);
        setStatus("Live");
        log.s("Stream attached to video");

        // Force video to play
        videoRef.current.play().catch((err) => {
          log.e("Video play error", err);
        });
      }
    };

    peer.onsignalingstatechange = () => {
      log.i(`Signaling: ${peer.signalingState}`);
    };

    peerRef.current = peer;
    return peer;
  };

  useEffect(() => {
    log.i(`Joining room: ${roomId}`);
    socket.emit("join-room", roomId);

    // Monitor socket
    const onConnect = () => {
      log.s("Socket connected", socket.id);
      setDebugInfo((prev) => ({ ...prev, socket: true }));
    };

    const onDisconnect = () => {
      log.e("Socket disconnected");
      setDebugInfo((prev) => ({ ...prev, socket: false }));
    };

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);

    if (socket.connected) onConnect();

    const handleSignal = async (signal) => {
      log.i("Signal received", Object.keys(signal));

      const peer = getPeer();

      // Host stopped sharing
      if (signal.streamEnded) {
        log.i("Stream ended");
        if (videoRef.current) videoRef.current.srcObject = null;
        peerRef.current?.close();
        peerRef.current = null;
        pendingCandidatesRef.current = [];
        setHasRemoteStream(false);
        setStatus("Waiting for host...");
        setIsSharing(false);
        return;
      }

      // Handle offer (viewer receives this)
      if (signal.offer) {
        log.i("Processing offer");

        if (peer.signalingState !== "stable") {
          log.w(`Cannot process offer - state: ${peer.signalingState}`);
          return;
        }

        try {
          await peer.setRemoteDescription(
            new RTCSessionDescription(signal.offer),
          );
          log.s("Remote description set");

          // Process any pending candidates
          for (const candidate of pendingCandidatesRef.current) {
            try {
              await peer.addIceCandidate(new RTCIceCandidate(candidate));
              log.s("Added pending candidate");
            } catch (err) {
              log.e("Failed to add pending candidate", err);
            }
          }
          pendingCandidatesRef.current = [];

          const answer = await peer.createAnswer();
          await peer.setLocalDescription(answer);
          log.s("Answer created");

          socket.emit("signal", {
            roomId,
            signal: { answer },
          });
          log.i("Answer sent");
        } catch (err) {
          log.e("Offer processing failed", err);
        }
      }

      // Handle answer (host receives this)
      if (signal.answer) {
        log.i("Processing answer");

        if (peer.signalingState !== "have-local-offer") {
          log.w(`Cannot process answer - state: ${peer.signalingState}`);
          return;
        }

        try {
          await peer.setRemoteDescription(
            new RTCSessionDescription(signal.answer),
          );
          log.s("Answer set");

          // Process pending candidates
          for (const candidate of pendingCandidatesRef.current) {
            try {
              await peer.addIceCandidate(new RTCIceCandidate(candidate));
              log.s("Added pending candidate");
            } catch (err) {
              log.e("Failed to add pending candidate", err);
            }
          }
          pendingCandidatesRef.current = [];
        } catch (err) {
          log.e("Answer processing failed", err);
        }
      }

      // Handle ICE candidate
      if (signal.candidate) {
        log.i("ICE candidate received");

        if (!peer.remoteDescription) {
          log.w("No remote description yet - queuing candidate");
          pendingCandidatesRef.current.push(signal.candidate);
          return;
        }

        try {
          await peer.addIceCandidate(new RTCIceCandidate(signal.candidate));
          log.s("ICE candidate added");
        } catch (err) {
          log.e("Failed to add ICE candidate", err);
        }
      }
    };

    const handleViewerJoined = async () => {
      log.i("Viewer joined");

      if (!isHost || !isSharing) {
        log.w("Not hosting - ignoring", { isHost, isSharing });
        return;
      }

      const peer = getPeer();

      try {
        const offer = await peer.createOffer();
        await peer.setLocalDescription(offer);
        log.s("Offer created for viewer");

        socket.emit("signal", {
          roomId,
          signal: { offer },
        });
        log.i("Offer sent to viewer");
      } catch (err) {
        log.e("Failed to create offer for viewer", err);
      }
    };

    socket.on("signal", handleSignal);
    socket.on("viewer-joined", handleViewerJoined);

    return () => {
      log.i("Cleanup");
      socket.off("signal", handleSignal);
      socket.off("viewer-joined", handleViewerJoined);
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
    };
  }, [roomId, isHost, isSharing]);

  const startShare = async () => {
    log.i("Starting screen share");

    try {
      setIsHost(true);

      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          frameRate: { ideal: 60, max: 60 },
          width: { max: 1920 },
          height: { max: 1080 },
        },
        audio: false,
      });

      log.s("Stream captured", {
        tracks: stream.getTracks().length,
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      const peer = getPeer();

      stream.getTracks().forEach((track) => {
        log.i(`Adding ${track.kind} track`);
        const sender = peer.addTrack(track, stream);

        if (track.kind === "video") {
          const params = sender.getParameters();
          if (!params.encodings) params.encodings = [{}];
          params.encodings[0].maxBitrate = 6_000_000;
          sender.setParameters(params);
          log.i("Bitrate set to 6Mbps");
        }
      });

      const offer = await peer.createOffer();
      await peer.setLocalDescription(offer);
      log.s("Initial offer created");

      socket.emit("signal", {
        roomId,
        signal: { offer },
      });

      setIsSharing(true);
      setStatus("You are sharing");

      stream.getVideoTracks()[0].onended = () => {
        log.i("Share ended by user");
        stopShare();
      };
    } catch (err) {
      log.e("Failed to start share", err);
      setIsHost(false);
      setStatus("Failed to start sharing");
    }
  };

  const stopShare = () => {
    log.i("Stopping share");

    streamRef.current?.getTracks().forEach((track) => {
      track.stop();
      log.i(`Stopped ${track.kind} track`);
    });

    socket.emit("signal", {
      roomId,
      signal: { streamEnded: true },
    });

    peerRef.current?.close();
    peerRef.current = null;
    pendingCandidatesRef.current = [];

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setIsSharing(false);
    setIsHost(false);
    setStatus("Waiting for host...");
  };

  const copyLink = async () => {
    await navigator.clipboard.writeText(window.location.href);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2000);
  };

  const leaveRoom = () => {
    stopShare();
    navigate("/");
  };

  const getStatusColor = (state) => {
    if (state === "connected") return "text-green-400";
    if (state === "failed" || state === "disconnected") return "text-red-400";
    if (state === "connecting" || state === "checking")
      return "text-yellow-400";
    return "text-gray-400";
  };

  const getStatusDot = (state) => {
    if (state === "connected") return "bg-green-500";
    if (state === "failed" || state === "disconnected") return "bg-red-500";
    if (state === "connecting" || state === "checking")
      return "bg-yellow-500 animate-pulse";
    return "bg-gray-500";
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-background text-white flex flex-col items-center justify-center relative"
    >
      <Toast message="Link copied" isVisible={showToast} />

      <div className="absolute top-8 text-xs uppercase tracking-wide text-gray-400">
        {isMobile ? "Viewer · Mobile" : isHost ? "Host · Desktop" : "Viewer"} ·{" "}
        {status}
      </div>

      <div className="w-full max-w-6xl px-6 relative">
        <div className="aspect-video rounded-3xl bg-black/40 border border-white/10 overflow-hidden flex items-center justify-center relative">
          {isMobile && !hasRemoteStream && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-10">
              <div className="text-center max-w-xs px-6">
                <p className="text-sm text-gray-300 mb-2">Viewing mode</p>
                <p className="text-xs text-gray-400 leading-relaxed">
                  Screen sharing is available on desktop browsers. Join from a
                  desktop to host and share your screen.
                </p>
              </div>
            </div>
          )}

          {status === "Waiting for host..." &&
            !isMobile &&
            !hasRemoteStream && (
              <div className="absolute text-gray-400 text-sm">
                Waiting for host to start sharing…
              </div>
            )}

          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            className="w-full h-full object-contain"
          />
        </div>
      </div>

      <div className="fixed bottom-10 flex gap-2 bg-black/60 p-2 rounded-2xl border border-white/10 backdrop-blur">
        {!isSharing && !isMobile && (
          <button
            onClick={startShare}
            className="px-6 py-3 bg-primary text-black font-semibold rounded-xl flex items-center gap-2 hover:bg-primary/90 transition-colors"
          >
            <MonitorUp size={16} />
            Share Screen
          </button>
        )}

        {isSharing && isHost && (
          <button
            onClick={stopShare}
            className="px-6 py-3 bg-red-500/20 text-red-400 rounded-xl flex items-center gap-2 hover:bg-red-500/30 transition-colors"
          >
            <StopCircle size={16} />
            Stop
          </button>
        )}

        <button
          onClick={copyLink}
          className="w-12 h-12 rounded-xl hover:bg-white/10 flex items-center justify-center transition-colors"
          title="Copy room link"
        >
          <Copy size={18} />
        </button>

        {/* Stats Button */}
        <div className="relative">
          <button
            onClick={() => setShowStats(!showStats)}
            className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors relative ${
              showStats ? "bg-white/10" : "hover:bg-white/10"
            }`}
            title="Connection stats"
          >
            <Activity size={18} />
            {/* Status indicator dot */}
            <span
              className={`absolute top-2 right-2 w-2 h-2 rounded-full ${getStatusDot(debugInfo.conn)}`}
            />
          </button>

          {/* Stats Dropdown */}
          <AnimatePresence>
            {showStats && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="absolute bottom-full mb-3 right-0 bg-black/95 backdrop-blur-xl p-4 rounded-xl border border-white/20 shadow-2xl min-w-[240px]"
              >
                <div className="flex items-center gap-2 mb-3 pb-3 border-b border-white/10">
                  <Activity size={14} className="text-primary" />
                  <span className="text-sm font-semibold text-white">
                    Connection Stats
                  </span>
                </div>

                <div className="space-y-2.5 font-mono text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Role</span>
                    <span className="text-white font-semibold">
                      {isHost ? "Host" : "Viewer"}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Status</span>
                    <span className="text-white font-semibold">{status}</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Peer Connection</span>
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${getStatusDot(debugInfo.conn)}`}
                      />
                      <span
                        className={`capitalize ${getStatusColor(debugInfo.conn)}`}
                      >
                        {debugInfo.conn}
                      </span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">ICE Connection</span>
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${getStatusDot(debugInfo.ice)}`}
                      />
                      <span
                        className={`capitalize ${getStatusColor(debugInfo.ice)}`}
                      >
                        {debugInfo.ice}
                      </span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Socket</span>
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${debugInfo.socket ? "bg-green-500" : "bg-red-500"}`}
                      />
                      <span
                        className={
                          debugInfo.socket ? "text-green-400" : "text-red-400"
                        }
                      >
                        {debugInfo.socket ? "Connected" : "Disconnected"}
                      </span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">TURN Config</span>
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${import.meta.env.VITE_TURN_USERNAME ? "bg-green-500" : "bg-red-500"}`}
                      />
                      <span
                        className={
                          import.meta.env.VITE_TURN_USERNAME
                            ? "text-green-400"
                            : "text-red-400"
                        }
                      >
                        {import.meta.env.VITE_TURN_USERNAME ? "Set" : "Missing"}
                      </span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">ICE Candidates</span>
                    <div className="flex flex-col items-end">
                      <span className="text-white">
                        {debugInfo.candidates || 0} total
                      </span>
                      <span className="text-[10px] text-gray-500">
                        {debugInfo.hasRelay
                          ? "✓ Relay (TURN) active"
                          : "⚠ No Relay (TURN)"}
                      </span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Video Stream</span>
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${hasRemoteStream ? "bg-green-500" : "bg-gray-500"}`}
                      />
                      <span
                        className={
                          hasRemoteStream ? "text-green-400" : "text-gray-400"
                        }
                      >
                        {hasRemoteStream ? "Active" : "None"}
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <button
          onClick={leaveRoom}
          className="w-12 h-12 rounded-xl hover:bg-red-500/10 text-red-400 flex items-center justify-center transition-colors"
          title="Leave room"
        >
          <LogOut size={18} />
        </button>
      </div>
    </motion.div>
  );
}
