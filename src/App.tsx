/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion, AnimatePresence } from "motion/react";
import { 
  Terminal, 
  User, 
  Code, 
  Briefcase, 
  Mail, 
  Github, 
  Linkedin, 
  ExternalLink,
  ChevronRight,
  ArrowLeft,
  Eraser,
  PenTool
} from "lucide-react";
import React, { useState, useEffect, useCallback, useRef } from "react";
import { Routes, Route, Link, useNavigate } from "react-router-dom";
const DB_URL = "https://kvdb.io/M5cpvUdqjBMqQB3gxhMtG8/messages";

const CursorTrail = () => {
  const [particles, setParticles] = useState<{ id: string; x: number; y: number }[]>([]);
  const pixelSize = 20;
  const lastPos = React.useRef<{ x: number; y: number } | null>(null);

  const addParticle = useCallback((x: number, y: number) => {
    const gx = Math.floor(x / pixelSize) * pixelSize;
    const gy = Math.floor(y / pixelSize) * pixelSize;
    const id = `${gx}-${gy}`;
    
    setParticles((prev) => {
      if (prev.some(p => p.id === id)) return prev;
      return [...prev.slice(-100), { id, x: gx, y: gy }];
    });
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const x = e.clientX;
      const y = e.clientY;

      if (lastPos.current) {
        const dx = x - lastPos.current.x;
        const dy = y - lastPos.current.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const steps = Math.max(1, Math.ceil(distance / (pixelSize / 2)));
        
        for (let i = 1; i <= steps; i++) {
          const ix = lastPos.current.x + dx * (i / steps);
          const iy = lastPos.current.y + dy * (i / steps);
          addParticle(ix, iy);
        }
      } else {
        addParticle(x, y);
      }
      lastPos.current = { x, y };
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [addParticle]);

  return (
    <>
      <svg style={{ position: 'absolute', width: 0, height: 0 }}>
        <filter id="custom-goo-filter">
          <feGaussianBlur in="SourceGraphic" stdDeviation="2" result="blur" />
          <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -7" result="goo" />
          <feComposite in="SourceGraphic" in2="goo" operator="atop" />
        </filter>
      </svg>
      <div 
        className="fixed inset-0 pointer-events-none z-[10000] overflow-hidden"
        style={{ filter: 'url(#custom-goo-filter)' }}
      >
        <AnimatePresence>
          {particles.map((p) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0.8, scale: 0.1 }}
              animate={{ opacity: 0, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25, ease: "linear" }}
              onAnimationComplete={() => {
                setParticles((prev) => prev.filter((part) => part.id !== p.id));
              }}
              style={{
                position: "absolute",
                left: p.x,
                top: p.y,
                width: `${pixelSize}px`,
                height: `${pixelSize}px`,
                backgroundColor: "#ffffff",
                boxShadow: "0 0 20px #ffffff",
              }}
            />
          ))}
        </AnimatePresence>
      </div>
    </>
  );
};

const ColorBends = ({
  rotation = 45,
  speed = 0.2,
  colors = ["#5227FF", "#ff0000"],
  transparent = true,
  autoRotate = 0,
  scale = 1,
  frequency = 1,
  warpStrength = 1,
  mouseInfluence = 1,
  parallax = 0.5,
  noise = 0.1,
}: {
  rotation?: number;
  speed?: number;
  colors?: string[];
  transparent?: boolean;
  autoRotate?: number;
  scale?: number;
  frequency?: number;
  warpStrength?: number;
  mouseInfluence?: number;
  parallax?: number;
  noise?: number;
}) => {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const mouseRef = React.useRef({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = {
        x: (e.clientX / window.innerWidth) * 2 - 1,
        y: (e.clientY / window.innerHeight) * 2 - 1,
      };
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const gl = canvas.getContext("webgl");
    if (!gl) return;

    const hexToRgb = (hex: string) => {
      const r = parseInt(hex.slice(1, 3), 16) / 255;
      const g = parseInt(hex.slice(3, 5), 16) / 255;
      const b = parseInt(hex.slice(5, 7), 16) / 255;
      return [r, g, b];
    };

    const c1 = hexToRgb(colors[0] || "#5227FF");
    const c2 = hexToRgb(colors[1] || "#ff0000");

    const vs = `
      attribute vec2 position;
      void main() {
        gl_Position = vec4(position, 0.0, 1.0);
      }
    `;

    const fs = `
      precision highp float;
      uniform float u_time;
      uniform vec2 u_resolution;
      uniform vec2 u_mouse;
      uniform float u_rotation;
      uniform float u_speed;
      uniform vec3 u_color1;
      uniform vec3 u_color2;
      uniform float u_scale;
      uniform float u_frequency;
      uniform float u_warp;
      uniform float u_mouse_inf;
      uniform float u_noise;

      float hash(vec2 p) {
        return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
      }

      float noise(vec2 p) {
        vec2 i = floor(p);
        vec2 f = fract(p);
        f = f * f * (3.0 - 2.0 * f);
        return mix(mix(hash(i + vec2(0.0, 0.0)), hash(i + vec2(1.0, 0.0)), f.x),
                   mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x), f.y);
      }

      mat2 rotate2d(float angle) {
        return mat2(cos(angle), -sin(angle), sin(angle), cos(angle));
      }

      void main() {
        vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution.xy) / min(u_resolution.y, u_resolution.x);
        uv *= u_scale * 2.0;
        uv *= rotate2d(u_rotation + u_time * ${autoRotate.toFixed(4)});

        vec2 warp_uv = uv;
        float n = noise(uv * u_frequency + u_time * u_speed);
        warp_uv += u_warp * vec2(noise(uv + n), noise(uv - n));
        warp_uv += u_mouse * u_mouse_inf * 0.2;

        float final_n = noise(warp_uv * u_frequency + u_time * u_speed * 0.5);
        vec3 color = mix(u_color1, u_color2, final_n);
        
        // Add subtle grain
        color += (hash(gl_FragCoord.xy + u_time) - 0.5) * u_noise;

        gl_FragColor = vec4(color, ${transparent ? "0.15" : "1.0"});
      }
    `;

    const createShader = (gl: WebGLRenderingContext, type: number, source: string) => {
      const shader = gl.createShader(type)!;
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      return shader;
    };

    const program = gl.createProgram()!;
    gl.attachShader(program, createShader(gl, gl.VERTEX_SHADER, vs));
    gl.attachShader(program, createShader(gl, gl.FRAGMENT_SHADER, fs));
    gl.linkProgram(program);
    gl.useProgram(program);

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]), gl.STATIC_DRAW);

    const pos = gl.getAttribLocation(program, "position");
    gl.enableVertexAttribArray(pos);
    gl.vertexAttribPointer(pos, 2, gl.FLOAT, false, 0, 0);

    const utime = gl.getUniformLocation(program, "u_time");
    const ures = gl.getUniformLocation(program, "u_resolution");
    const umouse = gl.getUniformLocation(program, "u_mouse");
    const urot = gl.getUniformLocation(program, "u_rotation");
    const uspeed = gl.getUniformLocation(program, "u_speed");
    const uc1 = gl.getUniformLocation(program, "u_color1");
    const uc2 = gl.getUniformLocation(program, "u_color2");
    const uscale = gl.getUniformLocation(program, "u_scale");
    const ufreq = gl.getUniformLocation(program, "u_frequency");
    const uwarp = gl.getUniformLocation(program, "u_warp");
    const umouseinf = gl.getUniformLocation(program, "u_mouse_inf");
    const unoise = gl.getUniformLocation(program, "u_noise");

    let animationFrame: number;
    const render = (time: number) => {
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
        gl.viewport(0, 0, width, height);
      }

      gl.uniform1f(utime, time * 0.001);
      gl.uniform2f(ures, canvas.width, canvas.height);
      gl.uniform2f(umouse, mouseRef.current.x, mouseRef.current.y);
      gl.uniform1f(urot, (rotation * Math.PI) / 180);
      gl.uniform1f(uspeed, speed);
      gl.uniform3fv(uc1, c1);
      gl.uniform3fv(uc2, c2);
      gl.uniform1f(uscale, scale);
      gl.uniform1f(ufreq, frequency);
      gl.uniform1f(uwarp, warpStrength);
      gl.uniform1f(umouseinf, mouseInfluence);
      gl.uniform1f(unoise, noise);

      gl.drawArrays(gl.TRIANGLES, 0, 6);
      animationFrame = requestAnimationFrame(render);
    };
    animationFrame = requestAnimationFrame(render);

    return () => cancelAnimationFrame(animationFrame);
  }, [rotation, speed, colors, transparent, autoRotate, scale, frequency, warpStrength, mouseInfluence, noise]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none z-0"
      style={{ opacity: 0.2 }}
    />
  );
};

const CRTWrapper = ({ children }: { children: React.ReactNode }) => (
  <div className="relative min-h-screen">
    <ColorBends
      rotation={45}
      speed={0.2}
      colors={["#5227FF", "#ff0000"]}
      transparent
      autoRotate={0}
      scale={1}
      frequency={1}
      warpStrength={1}
      mouseInfluence={1}
      parallax={0.5}
      noise={0.1}
    />
    <CursorTrail />
    <div className="crt-overlay" />
    <div className="crt-scanline" />
    <div className="dither-screen" />
    <div className="relative z-10 p-4 md:p-8 max-w-6xl mx-auto">
      {children}
    </div>
  </div>
);

const colorMap: Record<string, { text: string; bg: string; border: string }> = {
  "amber-gold": { text: "text-amber-gold", bg: "bg-amber-gold", border: "border-amber-gold" },
  "blaze-orange": { text: "text-blaze-orange", bg: "bg-blaze-orange", border: "border-blaze-orange" },
  "neon-pink": { text: "text-neon-pink", bg: "bg-neon-pink", border: "border-neon-pink" },
  "blue-violet": { text: "text-blue-violet", bg: "bg-blue-violet", border: "border-blue-violet" },
  "azure-blue": { text: "text-azure-blue", bg: "bg-azure-blue", border: "border-azure-blue" },
};

const TextType = ({ text, speed = 20, className }: { text: string; speed?: number; className?: string }) => {
  const [displayedText, setDisplayedText] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const type = useCallback(() => {
    if (isTyping) return;
    setIsTyping(true);
    setDisplayedText("");
    
    let i = 0;
    const interval = setInterval(() => {
      setDisplayedText(text.slice(0, i + 1));
      i++;
      if (i >= text.length) {
        clearInterval(interval);
        setIsTyping(false);
      }
    }, speed);
  }, [text, speed, isTyping]);

  return (
    <motion.span 
      onViewportEnter={type}
      className={className}
    >
      {displayedText}
      {isTyping && <span className="inline-block w-1 h-3 bg-white ml-1 animate-pulse" />}
    </motion.span>
  );
};

const ScrambledText = ({ text, className }: { text: string; className?: string }) => {
  const [displayText, setDisplayText] = useState(text);
  const [isScrambling, setIsScrambling] = useState(false);
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+";
  
  const scramble = useCallback(() => {
    if (isScrambling) return;
    setIsScrambling(true);
    
    let iteration = 0;
    const interval = setInterval(() => {
      setDisplayText((prev) => 
        text
          .split("")
          .map((char, index) => {
            if (index < iteration) {
              return text[index];
            }
            return characters[Math.floor(Math.random() * characters.length)];
          })
          .join("")
      );
      
      if (iteration >= text.length) {
        clearInterval(interval);
        setIsScrambling(false);
      }
      
      iteration += 1 / 3;
    }, 30);
  }, [text, isScrambling]);

  useEffect(() => {
    scramble();
  }, [text]);

  return (
    <motion.span 
      onViewportEnter={scramble}
      className={className}
    >
      {displayText}
    </motion.span>
  );
};

const SectionHeader = ({ title, color }: { title: string; color: string }) => {
  const colors = colorMap[color] || colorMap["azure-blue"];
  return (
    <div className="mb-8 flex items-center gap-4">
      <div className={`h-px flex-1 ${colors.bg}`} />
      <h2 className={`text-2xl md:text-4xl font-bold uppercase tracking-widest glow-text ${colors.text}`}>
        <ScrambledText text={title} />
      </h2>
      <div className={`h-px flex-1 ${colors.bg}`} />
    </div>
  );
};

const TerminalCard = ({ 
  children, 
  status = "ACTIVE", 
  accentColor = "azure-blue", 
  glowColor = "neon-pink",
  className = ""
}: { 
  children: React.ReactNode; 
  status?: string; 
  accentColor?: string; 
  glowColor?: string;
  className?: string;
}) => {
  const accent = colorMap[accentColor] || colorMap["azure-blue"];
  const glow = colorMap[glowColor] || colorMap["neon-pink"];
  
  return (
    <div className={`relative group ${className}`}>
      <div className={`absolute -inset-0.5 bg-gradient-to-r from-${glowColor} to-${accentColor} rounded blur opacity-10 group-hover:opacity-30 transition duration-500`}></div>
      <div className={`relative bg-black border ${accent.border}/30 p-6 dither-bg group-hover:${accent.border}/60 transition-all`}>
        <div className="flex items-center justify-between mb-4 text-[10px] uppercase tracking-widest">
          <div className="flex items-center gap-2">
            <div className={`w-1.5 h-1.5 rounded-full ${glow.bg} animate-pulse`} />
            <span className={accent.text}>{status}</span>
          </div>
          <div className="opacity-30">SYS_REF: {Math.random().toString(16).slice(2, 8).toUpperCase()}</div>
        </div>
        {children}
      </div>
    </div>
  );
};

const TerminalWall = () => {
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");
  const navigate = useNavigate();
  const scrollRef = useRef<HTMLDivElement>(null);

  const fetchMessages = async () => {
    try {
      const res = await fetch(DB_URL);
      const text = await res.text();
      if (text) {
        setMessages(JSON.parse(text));
      }
    } catch (e) {
      console.error("Failed to fetch messages");
    }
  };

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    
    const newMessage = {
      text: input,
      id: Math.random().toString(36).substring(7),
      timestamp: new Date().toISOString(),
    };
    
    setInput("");
    
    setMessages((prev) => {
      const updated = [...prev, newMessage].slice(-100);
      fetch(DB_URL, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updated)
      }).catch(console.error);
      return updated;
    });
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

const Portfolio = () => {
  const [booted, setBooted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setBooted(true), 1500);
    return () => clearTimeout(timer);
  }, []);

  if (!booted) {
    return (
      <div className="bg-black min-h-screen flex items-center justify-center font-mono text-amber-gold p-4">
        <div className="max-w-md w-full">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <p className="mb-2">SYSTEM BOOT SEQUENCE v1.0.4...</p>
            <p className="mb-2">MEMORY CHECK: 640KB OK</p>
            <p className="mb-2">LOADING PORTFOLIO_DATA...</p>
            <p className="mb-2">ESTABLISHING NEON_LINK...</p>
            <motion.div 
              className="h-2 bg-amber-gold mt-4"
              initial={{ width: 0 }}
              animate={{ width: "100%" }}
              transition={{ duration: 1.2, ease: "linear" }}
            />
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <CRTWrapper>
      {/* Header / Nav */}
      <nav className="flex flex-col md:flex-row justify-between items-center mb-16 border-b border-azure-blue/30 pb-4">
        <div className="flex items-center gap-2 mb-4 md:mb-0">
          <Terminal className="text-neon-pink" size={24} />
          <span className="text-xl font-bold tracking-tighter text-neon-pink glow-text">OLIVER_AIZER.EXE</span>
        </div>
        <div className="flex gap-6 text-sm uppercase tracking-widest">
          <a href="#about" className="hover:text-amber-gold transition-colors">About</a>
          <a href="#experience" className="hover:text-blaze-orange transition-colors">Experience</a>
          <a href="#research" className="hover:text-neon-pink transition-colors">Research</a>
          <a href="#skills" className="hover:text-blue-violet transition-colors">Skills</a>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="about" className="mb-32">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-5xl md:text-8xl font-black mb-6 leading-none">
            <span className="text-azure-blue block glow-text">MECHANICAL</span>
            <span className="text-neon-pink block glow-text">ENGINEERING</span>
          </h1>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
            <div className="border-l-2 border-blaze-orange pl-6 py-2">
              <p className="text-lg md:text-xl text-amber-gold/90 leading-relaxed mb-6">
                Mechanical Engineering student at Cornell University with a focus on robotics, 
                autonomous systems, and advanced aerial vehicle development. 
                Crafting robust hardware solutions for complex technical challenges.
              </p>
              <div className="flex gap-4">
                <a 
                  href="https://OllieAizer.vercel.app" 
                  className="p-2 border border-azure-blue hover:bg-azure-blue hover:text-black transition-all glow-border"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ExternalLink size={20} />
                </a>
                <a 
                  href="mailto:oa248@cornell.edu" 
                  className="p-2 border border-neon-pink hover:bg-neon-pink hover:text-black transition-all glow-border"
                >
                  <Mail size={20} />
                </a>
              </div>
            </div>
            <TerminalCard status="STATUS: ACTIVE_RESEARCH" accentColor="azure-blue" glowColor="neon-pink">
              <p className="text-azure-blue font-mono text-sm leading-relaxed">
                {`> Hey, My name's Oliver Aizer!`}
                <br /><br />
                {`> I'm a Mechanical Engineering student at Cornell University (Class of 2028).`}
                <br /><br />
                {`> My expertise lies in CAD design (Solidworks, Fusion 360), robotic morphologies, and autonomous navigation payloads.`}
              </p>
            </TerminalCard>
          </div>
        </motion.div>
      </section>

      {/* Education Section */}
      <section id="education" className="mb-32">
        <SectionHeader title="Education" color="amber-gold" />
        <div className="space-y-6">
          <TerminalCard status="EDU_RECORD_01" accentColor="amber-gold" glowColor="azure-blue">
            <div className="flex flex-col md:flex-row justify-between gap-4">
              <div>
                <h3 className="text-2xl md:text-3xl font-bold text-amber-gold glow-text tracking-tight">Cornell University</h3>
                <p className="text-sm text-azure-blue/90">B.S. Mechanical Engineering | GPA: 3.5</p>
              </div>
              <div className="text-azure-blue font-mono text-sm">
                [Expected May 2028]
              </div>
            </div>
          </TerminalCard>
          <TerminalCard status="EDU_RECORD_02" accentColor="amber-gold" glowColor="azure-blue">
            <div className="flex flex-col md:flex-row justify-between gap-4">
              <div>
                <h3 className="text-2xl md:text-3xl font-bold text-amber-gold glow-text tracking-tight">Horace Mann School</h3>
                <p className="text-sm text-azure-blue/90">uwGPA: 3.8 | ACT: 36</p>
              </div>
              <div className="text-azure-blue font-mono text-sm">
                [June 2025]
              </div>
            </div>
          </TerminalCard>
        </div>
      </section>

      {/* Experience Section */}
      <section id="experience" className="mb-32">
        <SectionHeader title="Experience" color="blaze-orange" />
        <div className="space-y-8">
          {[
            { 
              company: "Modovolo", 
              date: "Jan 2026 - Present", 
              role: "Junior Payload Engineer",
              desc: "Developed next-gen LiDAR payload for autonomous navigation using Solidworks and carbon-fiber composites. Conducted flight-test validation of sensor data integrity."
            },
            { 
              company: "Mars Rover Project Team", 
              date: "Oct 2025 - Present", 
              role: "Arm Team Engineer",
              desc: "Designed and fabricated 4 active cooling camera mounts to survive temperatures in excess of 100°F. Presented design and analysis to senior members."
            },
            { 
              company: "Physical Intelligence Club", 
              date: "Sept 2025 - Present", 
              role: "Mechanical Team Lead",
              desc: "Engineered diverse robotic systems, including custom aerial drones and a hexapod robot. Collaborated with industry partners for tailored morphologies."
            },
            { 
              company: "FTC Robotics Team", 
              date: "Sept 2021 - Jun 2025", 
              role: "Captain",
              desc: "Directed end-to-end design of a 40lb competitive robot. Led a 20-person technical team through iterative engineering cycles."
            },
          ].map((exp, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <TerminalCard 
                status="EXP_RECORD_LOADED" 
                accentColor="blaze-orange" 
                glowColor="amber-gold"
              >
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                    <div>
                      <h3 className="text-2xl md:text-3xl font-bold text-blaze-orange glow-text tracking-tight">{exp.company}</h3>
                      <p className="text-sm text-azure-blue/90">{exp.role}</p>
                    </div>
                    <div className="text-amber-gold font-mono text-sm bg-amber-gold/5 px-3 py-1 border border-amber-gold/20">
                      {`> [${exp.date}]`}
                    </div>
                  </div>
                  <p className="text-xs text-white/80 leading-relaxed border-l border-blaze-orange/30 pl-4">
                    <TextType text={exp.desc} />
                  </p>
                </div>
              </TerminalCard>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Research Section */}
      <section id="research" className="mb-32">
        <SectionHeader title="Research" color="neon-pink" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {[
            { 
              title: "Hybrid Control Architectures", 
              lab: "GeoDesiC Lab - Cornell", 
              date: "Jan 2026 - Present", 
              desc: "Designing experimental physical aerial morphologies for novel flight technology under a Boeing-funded initiative.",
              color: "neon-pink" 
            },
            { 
              title: "Hypertension Detection", 
              lab: "Shimbo Lab - Columbia", 
              date: "Jul - Aug 2023", 
              desc: "Guided study participants through research protocols and investigated populations for masked hypertension.",
              color: "azure-blue" 
            },
          ].map((res, i) => {
            const colors = colorMap[res.color] || colorMap["neon-pink"];
            return (
              <motion.div 
                key={i}
                whileHover={{ scale: 1.02 }}
                className="h-full"
              >
                <TerminalCard 
                  status="RES_DATA_SYNC" 
                  accentColor={res.color} 
                  glowColor={res.color === 'neon-pink' ? 'azure-blue' : 'neon-pink'}
                  className="h-full"
                >
                  <div className="flex flex-col h-full">
                    <div className="flex justify-between items-start mb-4">
                      <Code className={colors.text} size={24} />
                      <span className="text-[10px] opacity-50 font-mono">{res.date}</span>
                    </div>
                    <h3 className={`text-2xl md:text-3xl font-bold mb-1 ${colors.text} glow-text tracking-tight`}>{res.title}</h3>
                    <p className="text-xs text-white/70 mb-3 italic">{res.lab}</p>
                    <p className="text-sm text-white/90 mb-6 flex-grow">
                      <TextType text={res.desc} />
                    </p>
                  </div>
                </TerminalCard>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Skills Section */}
      <section id="skills" className="mb-32">
        <SectionHeader title="Specialized Skills" color="blue-violet" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <TerminalCard status="SKILLS_MANIFEST" accentColor="blue-violet" glowColor="neon-pink">
            <h4 className="text-blue-violet font-bold mb-4 uppercase tracking-widest">Programs & Tools</h4>
            <div className="flex flex-wrap gap-2">
              {["Autodesk Fusion 360", "Solidworks", "Autodesk Inventor", "Onshape", "Excel", "Python", "pandas", "MatPlotLib"].map((skill, i) => (
                <span key={i} className="text-xs bg-blue-violet/10 text-blue-violet border border-blue-violet/30 px-2 py-1">
                  {skill}
                </span>
              ))}
            </div>
          </TerminalCard>
          <TerminalCard status="HOBBIES_MANIFEST" accentColor="blue-violet" glowColor="azure-blue">
            <h4 className="text-azure-blue font-bold mb-4 uppercase tracking-widest">Interests</h4>
            <div className="flex flex-wrap gap-2">
              {["Volleyball", "Gardening", "Baking", "Photography"].map((hobby, i) => (
                <span key={i} className="text-xs bg-azure-blue/10 text-azure-blue border border-azure-blue/30 px-2 py-1">
                  {hobby}
                </span>
              ))}
            </div>
          </TerminalCard>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-blue-violet/30 pt-16 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16">
          <div>
            <h2 className="text-4xl md:text-6xl font-black text-blue-violet glow-text mb-8 leading-tight">
              LETS CONNECT AND BUILD SOMETHING!
            </h2>
            <a 
              href="mailto:oa248@cornell.edu" 
              className="inline-flex items-center gap-4 text-xl md:text-2xl font-bold hover:text-neon-pink transition-colors group"
            >
              <Mail className="group-hover:animate-bounce" />
              <span>oa248@cornell.edu</span>
            </a>
            <p className="mt-4 text-azure-blue/70 font-mono text-sm">(347)-963-7216</p>
          </div>
          <div className="grid grid-cols-2 gap-8">
            <div>
              <h4 className="text-xs uppercase tracking-widest text-white/70 mb-4">Sitemap</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#about" className="hover:text-azure-blue">About</a></li>
                <li><a href="#education" className="hover:text-azure-blue">Education</a></li>
                <li><a href="#experience" className="hover:text-azure-blue">Experience</a></li>
                <li><a href="#research" className="hover:text-azure-blue">Research</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-xs uppercase tracking-widest text-white/70 mb-4">Links</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="https://OllieAizer.vercel.app" className="hover:text-neon-pink">Portfolio</a></li>
                <li><a href="mailto:oa248@cornell.edu" className="hover:text-neon-pink">Email</a></li>
              </ul>
            </div>
          </div>
        </div>
        <div className="flex flex-col md:flex-row justify-between items-center text-[10px] text-white/40 uppercase tracking-[0.2em] gap-4">
          <p>© 2026 OLIVER_AIZER.SYS ALL RIGHTS RESERVED</p>
          <Link 
            to="/mark"
            className="px-6 py-2 border border-azure-blue/30 bg-azure-blue/5 text-azure-blue hover:bg-azure-blue hover:text-black transition-all font-mono text-xs tracking-widest flex items-center gap-2 group"
          >
            <PenTool size={14} className="group-hover:rotate-12 transition-transform" />
            <span>{">"} LEAVE_YOUR_MARK</span>
          </Link>
          <p>BUILT_FOR_ROBOTICS_AND_DESIGN</p>
        </div>
      </footer>
    </CRTWrapper>
  );
};

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Portfolio />} />
      <Route path="/mark" element={<TerminalWall />} />
    </Routes>
  );
}
