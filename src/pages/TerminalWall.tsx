import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { motion, AnimatePresence, useScroll, useTransform, useSpring, useVelocity } from "motion/react";
import { Terminal, User, Code, Briefcase, Mail, Github, Linkedin, ExternalLink, ChevronRight, ArrowLeft, Eraser, PenTool, Rocket } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { colorMap, DEFAULT_COLORS } from "../utils/constants";
import { db } from "../firebase";
import { collection, query, orderBy, limit, onSnapshot, addDoc, getDocFromServer, doc } from "firebase/firestore";
import { ColorBends } from "../components/Effects";
export const TerminalWall = () => {
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");
  const navigate = useNavigate();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Validate connection to Firestore
    const testConnection = async () => {
      try {
        await getDocFromServer(doc(db, 'test', 'connection'));
      } catch (error) {
        if(error instanceof Error && error.message.includes('the client is offline')) {
          console.error("Please check your Firebase configuration.");
        }
      }
    };
    testConnection();

    // Set up real-time listener
    const q = query(
      collection(db, "messages"),
      orderBy("timestamp", "asc"),
      limit(100)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setMessages(msgs);
    }, (error) => {
      console.error("Firestore Error: ", error);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    
    try {
      await addDoc(collection(db, "messages"), {
        text: input,
        timestamp: new Date().toISOString() // Using ISO string for consistency with previous logic
      });
      setInput("");
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black overflow-hidden flex flex-col font-mono">
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <ColorBends speed={0.1} noise={0.05} />
      </div>
      
      <div className="relative z-10 p-4 flex items-center justify-between border-b border-white/10 bg-black/50 backdrop-blur-md">
        <button 
          onClick={() => navigate("/")}
          className="flex items-center gap-2 text-azure-blue hover:text-white transition-colors uppercase tracking-widest text-sm"
        >
          <ArrowLeft size={16} />
          <span>Back to Terminal</span>
        </button>
        
        <div className="text-amber-gold text-xs uppercase tracking-[0.2em] animate-pulse">
          Live Terminal Wall v1.0.2
        </div>
      </div>

      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-hide"
      >
        {messages.map((msg) => (
          <motion.div 
            key={msg.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex gap-4 items-start"
          >
            <span className="text-white/30 text-[10px] pt-1">
              [{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}]
            </span>
            <div className="flex-1">
              <span className="text-azure-blue mr-2 font-bold">{">"}</span>
              <span className="text-white/90 break-all">{msg.text}</span>
            </div>
          </motion.div>
        ))}
        {messages.length === 0 && (
          <div className="text-white/20 text-center mt-20 italic">
            No records found. Be the first to leave your mark.
          </div>
        )}
      </div>

      <form 
        onSubmit={handleSubmit}
        className="relative z-10 p-6 border-t border-white/10 bg-black/50 backdrop-blur-md"
      >
        <div className="flex items-center gap-4 max-w-4xl mx-auto">
          <span className="text-azure-blue font-bold text-xl">{">"}</span>
          <input
            autoFocus
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 bg-transparent border-none outline-none text-white placeholder:text-white/20 text-lg"
          />
          <button 
            type="submit"
            className="px-4 py-1 border border-azure-blue text-azure-blue hover:bg-azure-blue hover:text-black transition-all text-xs uppercase tracking-widest"
          >
            Execute
          </button>
        </div>
      </form>

      <div className="absolute bottom-20 right-6 z-10 pointer-events-none opacity-20">
        <Terminal size={120} className="text-azure-blue" />
      </div>
    </div>
  );
};

