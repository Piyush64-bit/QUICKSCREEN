import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Copy, MonitorUp, StopCircle, LogOut } from "lucide-react";
import { motion } from "framer-motion";
import socket from "../socket";
import Toast from "../components/ui/Toast";

/* ---------------------------
   STUN + TURN (ENV)
---------------------------- */

const iceConfig = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    {
      urls: "turn:global.relay.metered.ca:80",
      username: import.meta.env.VITE_TURN_USERNAME,
      credential: import.meta.env.VITE_TURN_PASSWORD
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
  const [isHost, setIsHost] = useState(false);
  const [status, setStatus] = useState("Waiting for host...");
  const [showToast, setShowToast] = useState(false);

  /* ---------------------------
     Peer Creation
  ---------------------------- */

  const getPeer = () => {
    if (peerRef.current) return peerRef.current;

    const peer = new RTCPeerConnection(iceConfig);

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
      setStatus("Live");
    };

    peer.oniceconnectionstatechange = () => {
      console.log("ICE:", peer.iceConnectionState);
    };

    peerRef.current = peer;
    return peer;
  };

  /* ---------------------------
     Signaling
  ---------------------------- */

  useEffect(() => {
    socket.emit("join-room", roomId);

    const handleSignal = async (signal) => {
      const peer = getPeer();

      // STREAM ENDED
      if (signal.streamEnded) {
        videoRef.current.srcObject = null;
        peerRef.current?.close();
        peerRef.current = null;
        setStatus("Waiting for host...");
        setIsSharing(false);
        return;
      }

      // OFFER
      if (signal.offer) {
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
        if (peer.signalingState !== "have-local-offer") return;

        await peer.setRemoteDescription(
          new RTCSessionDescription(signal.answer)
        );
      }

      // ICE
      if (signal.candidate) {
        try {
          await peer.addIceCandidate(
            new RTCIceCandidate(signal.candidate)
          );
        } catch {}
      }
    };

    socket.on("signal", handleSignal);

    return () => socket.off("signal", handleSignal);
  }, [roomId]);

  /* ---------------------------
     Start Sharing (HOST)
  ---------------------------- */

  const startShare = async () => {
    try {
      setIsHost(true);

      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          frameRate: { ideal: 60, max: 60 },
          width: { max: 1920 },
          height: { max: 1080 }
        },
        audio: false
      });

      streamRef.current = stream;
      videoRef.current.srcObject = stream;

      const peer = getPeer();

      stream.getTracks().forEach(track => {
        const sender = peer.addTrack(track, stream);

        if (track.kind === "video") {
          const params = sender.getParameters();
          if (!params.encodings) params.encodings = [{}];
          params.encodings[0].maxBitrate = 6_000_000;
          sender.setParameters(params);
        }
      });

      const offer = await peer.createOffer();
      await peer.setLocalDescription(offer);

      socket.emit("signal", {
        roomId,
        signal: { offer }
      });

      setIsSharing(true);
      setStatus("You are sharing");

      stream.getVideoTracks()[0].onended = stopShare;
    } catch (err) {
      console.error(err);
    }
  };

  /* ---------------------------
     Stop Sharing
  ---------------------------- */

  const stopShare = () => {
    streamRef.current?.getTracks().forEach(track => track.stop());

    socket.emit("signal", {
      roomId,
      signal: { streamEnded: true }
    });

    peerRef.current?.close();
    peerRef.current = null;

    videoRef.current.srcObject = null;

    setIsSharing(false);
    setIsHost(false);
    setStatus("Waiting for host...");
  };

  /* ---------------------------
     Helpers
  ---------------------------- */

  const copyLink = async () => {
    await navigator.clipboard.writeText(window.location.href);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2000);
  };

  const leaveRoom = () => {
    stopShare();
    navigate("/");
  };

  /* ---------------------------
     UI
  ---------------------------- */

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-background text-white flex flex-col items-center justify-center relative"
    >
      <Toast message="Link copied" isVisible={showToast} />

      {/* Status */}
      <div className="absolute top-8 text-xs uppercase tracking-wide text-gray-400">
        {isHost ? "Host" : "Viewer"} · {status}
      </div>

      {/* Screen */}
      <div className="w-full max-w-6xl px-6">
        <div className="aspect-video rounded-3xl bg-black/40 border border-white/10 overflow-hidden flex items-center justify-center">
          {status === "Waiting for host..." && (
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

      {/* Controls */}
      <div className="fixed bottom-10 flex gap-2 bg-black/60 p-2 rounded-2xl border border-white/10 backdrop-blur">
        {!isSharing && (
          <button
            onClick={startShare}
            className="px-6 py-3 bg-primary text-black font-semibold rounded-xl flex items-center gap-2"
          >
            <MonitorUp size={16} />
            Share Screen
          </button>
        )}

        {isSharing && isHost && (
          <button
            onClick={stopShare}
            className="px-6 py-3 bg-red-500/20 text-red-400 rounded-xl flex items-center gap-2"
          >
            <StopCircle size={16} />
            Stop
          </button>
        )}

        <button onClick={copyLink} className="w-12 h-12 rounded-xl hover:bg-white/10 flex items-center justify-center">
          <Copy size={18} />
        </button>

        <button onClick={leaveRoom} className="w-12 h-12 rounded-xl hover:bg-red-500/10 text-red-400 flex items-center justify-center">
          <LogOut size={18} />
        </button>
      </div>
    </motion.div>
  );
}
