import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Copy, MonitorUp, StopCircle, LogOut } from "lucide-react";
import { motion } from "framer-motion";
import socket from "../socket";
import Toast from "../components/ui/Toast";

/* STUN + TURN */
const iceConfig = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    {
      urls: "turn:openrelay.metered.ca:80",
      username: "openrelayproject",
      credential: "openrelayproject"
    }
  ]
};

export default function RoomPage() {
  const { roomId } = useParams();
  const navigate = useNavigate();

  const videoRef = useRef(null);
  const peerRef = useRef(null);
  const streamRef = useRef(null);

  const [isSharing, setIsSharing] = useState(false);
  const [status, setStatus] = useState("Waiting for peer...");
  const [showToast, setShowToast] = useState(false);

  // --------------------
  // Create / Get Peer
  // --------------------
  const getPeer = () => {
    if (peerRef.current) return peerRef.current;

    const peer = new RTCPeerConnection(iceConfig);

    peer.addTransceiver("video", { direction: "sendrecv" });
    peer.addTransceiver("audio", { direction: "sendrecv" });

    peer.onicecandidate = (e) => {
      if (e.candidate) {
        socket.emit("signal", {
          roomId,
          signal: { candidate: e.candidate }
        });
      }
    };

    peer.ontrack = (e) => {
      videoRef.current.srcObject = e.streams[0];
      setStatus("Connected");
    };

    peerRef.current = peer;
    return peer;
  };

  // --------------------
  // Socket Signaling
  // --------------------
  useEffect(() => {
    socket.emit("join-room", roomId);

    const handleSignal = async (signal) => {

      // OFFER
      if (signal.offer) {
  const peer = getPeer();

  // ✅ Prevent invalid state
  if (peer.signalingState !== "stable") return;

  await peer.setRemoteDescription(
    new RTCSessionDescription(signal.offer)
  );

  const answer = await peer.createAnswer();
  await peer.setLocalDescription(answer);

  socket.emit("signal", {
    roomId,
    signal: { answer }
  });
}


      // ANSWER
      if (signal.answer) {
        const peer = getPeer();

        await peer.setRemoteDescription(
          new RTCSessionDescription(signal.answer)
        );
      }

      // ICE
      if (signal.candidate) {
        const peer = getPeer();

        await peer.addIceCandidate(
          new RTCIceCandidate(signal.candidate)
        );
      }
    };

    // 🔥 LATE JOIN HANDLER
    const handlePeerJoined = async () => {
      if (!isSharing) return;

      const peer = getPeer();

      const offer = await peer.createOffer();
      await peer.setLocalDescription(offer);

      socket.emit("signal", {
        roomId,
        signal: { offer }
      });
    };

    socket.on("signal", handleSignal);
    socket.on("peer-joined", handlePeerJoined);

    return () => {
      socket.off("signal", handleSignal);
      socket.off("peer-joined", handlePeerJoined);
    };
  }, [roomId, isSharing]);

  // --------------------
  // Start Share
  // --------------------
  const startShare = async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true
      });

      streamRef.current = stream;
      videoRef.current.srcObject = stream;

      const peer = getPeer();

      stream.getTracks().forEach(track => {
        peer.addTrack(track, stream);
      });

      const offer = await peer.createOffer();
      await peer.setLocalDescription(offer);

      socket.emit("signal", {
        roomId,
        signal: { offer }
      });

      setIsSharing(true);
      setStatus("Live");

      stream.getVideoTracks()[0].onended = () => {
        stopShare();
      };

    } catch (err) {
      console.error("Error sharing:", err);
    }
  };

  // --------------------
  // Stop Share
  // --------------------
  const stopShare = () => {
    streamRef.current?.getTracks().forEach(track => track.stop());

    peerRef.current?.close();
    peerRef.current = null;

    videoRef.current.srcObject = null;

    setIsSharing(false);
    setStatus("Stopped");
  };

  // --------------------
  // Leave Room
  // --------------------
  const leaveRoom = () => {
    stopShare();
    navigate("/");
  };

  // --------------------
  // Copy Link
  // --------------------
  const copyLink = async () => {
    await navigator.clipboard.writeText(window.location.href);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2000);
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-background text-white flex flex-col items-center justify-center relative font-sans selection:bg-primary/20 overflow-hidden"
    >

      <Toast message="Link copied to clipboard" isVisible={showToast} onClose={() => setShowToast(false)} />

      {/* Background Decor */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-primary/10 blur-[130px] rounded-full pointer-events-none opacity-40 mix-blend-screen" />

      {/* Status Pill */}
      <div className="absolute top-8 z-10">
        <div className="flex items-center gap-3 px-4 py-2 rounded-full bg-white/5 border border-white/5 backdrop-blur-md shadow-lg ring-1 ring-black/20">
          <span className="relative flex h-2.5 w-2.5">
            {(status === "Connected" || status === "Live") && (
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            )}
            <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${status === "Connected" || status === "Live" ? "bg-emerald-500" : "bg-amber-500"}`}></span>
          </span>
          <span className="text-xs font-semibold tracking-wide text-gray-300 uppercase">{status}</span>
        </div>
      </div>

      {/* Screen */}
      <div className="relative w-full max-w-6xl px-6 md:px-0">
        <div className="aspect-video rounded-3xl bg-surface/40 border border-white/5 shadow-2xl overflow-hidden ring-1 ring-white/5">
          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            className="w-full h-full object-contain"
          />
        </div>
      </div>

      {/* Controls */}
      <div className="fixed bottom-10 z-50">
        <div className="flex items-center gap-2 p-2 rounded-2xl bg-surface/80 border border-white/10 backdrop-blur-2xl shadow-2xl">

          {!isSharing ? (
            <button
              onClick={startShare}
              className="flex items-center gap-2.5 px-6 py-3.5 rounded-xl bg-primary hover:bg-primary/90 text-black/80 font-bold text-sm shadow-lg"
            >
              <MonitorUp className="w-4 h-4" />
              Share Screen
            </button>
          ) : (
            <button
              onClick={stopShare}
              className="flex items-center gap-2.5 px-6 py-3.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 text-sm"
            >
              <StopCircle className="w-4 h-4" />
              Stop Sharing
            </button>
          )}

          <div className="w-px h-8 bg-white/10 mx-2"></div>

          <button
            onClick={copyLink}
            className="w-12 h-12 rounded-xl hover:bg-white/5 flex items-center justify-center"
          >
            <Copy className="w-5 h-5" />
          </button>

          <button
            onClick={leaveRoom}
            className="w-12 h-12 rounded-xl hover:bg-red-500/10 text-red-400 flex items-center justify-center"
          >
            <LogOut className="w-5 h-5" />
          </button>

        </div>
      </div>

    </motion.div>
  );
}
