import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { motion, AnimatePresence, useScroll, useTransform, useSpring, useVelocity } from "motion/react";
import { Terminal, User, Code, Briefcase, Mail, Github, Linkedin, ExternalLink, ChevronRight, ArrowLeft, Eraser, PenTool, Rocket } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { colorMap, DEFAULT_COLORS } from "../utils/constants";
export const CursorTrail = () => {
  const [particles, setParticles] = useState<{ id: string; x: number; y: number; timestamp: number }[]>([]);
  const pixelSize = 24;
  const lastPos = React.useRef<{ x: number; y: number } | null>(null);
  const particleCounter = React.useRef(0);

  const addParticle = useCallback((x: number, y: number) => {
    const gx = Math.floor(x / (pixelSize / 4)) * (pixelSize / 4);
    const gy = Math.floor(y / (pixelSize / 4)) * (pixelSize / 4);
    const id = `${gx}-${gy}-${Date.now()}-${particleCounter.current++}`;
    
    setParticles((prev) => {
      // Lower density for less obtrusive trail
      return [...prev.slice(-60), { id, x: gx, y: gy, timestamp: Date.now() }];
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
        // Moderate steps for a smooth but lighter trail
        const steps = Math.max(1, Math.ceil(distance / (pixelSize / 4)));
        
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
        <filter id="thermal-blur">
          <feGaussianBlur in="SourceGraphic" stdDeviation="8" result="blur" />
          <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 25 -12" result="goo" />
        </filter>
      </svg>
      <div 
        className="fixed inset-0 pointer-events-none z-[10000] overflow-hidden mix-blend-screen"
        style={{ filter: 'url(#thermal-blur)' }}
      >
        <AnimatePresence>
          {particles.map((p) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, scale: 0.8, backgroundColor: "#fff" }}
              animate={{ 
                opacity: [0, 0.4, 0.2, 0],
                scale: [0.8, 1.2, 1.5, 1.8],
                backgroundColor: ["#fff", "#ffff00", "#ff4400", "#4400ff", "#000044"]
              }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              onAnimationComplete={() => {
                setParticles((prev) => prev.filter((part) => part.id !== p.id));
              }}
              style={{
                position: "absolute",
                left: p.x - pixelSize / 2,
                top: p.y - pixelSize / 2,
                width: `${pixelSize}px`,
                height: `${pixelSize}px`,
                borderRadius: "50%",
              }}
            />
          ))}
        </AnimatePresence>
      </div>
    </>
  );
};

// const DEFAULT_COLORS = ["#5227FF", "#ff0000"];

export const ColorBends = ({
  rotation = 45,
  speed = 0.2,
  colors = DEFAULT_COLORS,
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
      style={{ opacity: 0.05 }}
    />
  );
};

export const SpaceshipScroll = () => {
  const { scrollYProgress } = useScroll();
  const scrollVelocity = useVelocity(scrollYProgress);
  const smoothVelocity = useSpring(scrollVelocity, {
    damping: 50,
    stiffness: 400
  });

  // Calculate flame length based on velocity
  const flameScale = useTransform(smoothVelocity, [-0.1, 0, 0.1], [2.5, 1, 2.5]);
  const flameOpacity = useTransform(smoothVelocity, [-0.01, 0, 0.01], [1, 0.4, 1]);

  // Path coordinates: subtle zig-zag along the right edge
  const xRaw = useTransform(scrollYProgress, 
    [0, 0.2, 0.4, 0.6, 0.8, 0.9, 1], 
    [90, 92, 88, 92, 88, 90, 50]
  );
  
  const yRaw = useTransform(scrollYProgress, 
    [0, 1], 
    [20, 82]
  );

  // Smooth the position for more natural "floaty" movement
  const xSpring = useSpring(xRaw, { damping: 65, stiffness: 25 });
  const ySpring = useSpring(yRaw, { damping: 65, stiffness: 25 });

  // Convert to viewport strings for style
  const x = useTransform(xSpring, (val) => `${val}vw`);
  const y = useTransform(ySpring, (val) => `${val}vh`);

  // Landing state logic
  const landingProgress = useTransform(scrollYProgress, [0.92, 0.98, 1], [0, 0, 1]);
  
  // Fade out flame as we land
  const landingFlameOpacity = useTransform(landingProgress, [0, 0.5], [1, 0]);
  const combinedFlameOpacity = useTransform(
    [flameOpacity, landingFlameOpacity], 
    ([fo, lfo]) => (fo as number) * (lfo as number)
  );

  // Calculate rotation based on velocity vector
  const vx = useVelocity(xSpring);
  const vy = useVelocity(ySpring);
  
  const lastRotation = useRef(0);
  const rawRotateValue = useTransform([vx, vy], ([latestVx, latestVy]) => {
    const vX = latestVx as number;
    const vY = latestVy as number;
    
    if (Math.abs(vX) < 0.001 && Math.abs(vY) < 0.001) {
      return lastRotation.current;
    }
    
    const angle = Math.atan2(vY, vX) * (180 / Math.PI);
    const newRotation = angle + 90;
    lastRotation.current = newRotation;
    return newRotation;
  });

  // Blend velocity rotation with 0 (upright) as we land
  const rotateValue = useTransform([rawRotateValue, landingProgress], ([rot, lp]) => {
    const r = rot as number;
    const p = lp as number;
    return r * (1 - p); // Gradually force to 0
  });

  // Smooth the rotation so it doesn't snap
  const rotate = useSpring(rotateValue, { damping: 25, stiffness: 120 });

  // Landing effects: pulse and flicker
  const landingPulse = useTransform(landingProgress, [0.8, 0.9, 1], [1, 1.1, 1]);
  const combinedPulse = landingPulse;

  const landingFlicker = useTransform(landingProgress, [0.9, 0.92, 0.94, 0.96, 0.98, 1], [1, 0.5, 1, 0.3, 1, 1]);
  const combinedFlicker = landingFlicker;

  return (
    <>
      <motion.div
        style={{
          position: "fixed",
          left: x,
          top: y,
          rotate,
          zIndex: 50,
          pointerEvents: "none",
          x: "-50%",
          y: "-50%",
          scale: combinedPulse,
          opacity: combinedFlicker
        }}
        className="flex flex-col items-center"
      >
      {/* Detailed 8-bit Galaga Style Ship */}
      <div className="relative w-12 h-12">
        <svg width="48" height="48" viewBox="0 0 16 16" className="drop-shadow-[0_0_10px_rgba(255,255,255,0.6)]">
          {/* Main Body - Layered for detail */}
          <rect x="7" y="2" width="2" height="12" fill="#FFFFFF" />
          <rect x="6" y="4" width="4" height="8" fill="#F0F0F0" />
          <rect x="5" y="6" width="6" height="4" fill="#FFFFFF" />
          
          {/* Wings */}
          <rect x="3" y="8" width="2" height="5" fill="#5227FF" />
          <rect x="11" y="8" width="2" height="5" fill="#5227FF" />
          <rect x="2" y="10" width="2" height="3" fill="#3A1BCB" />
          <rect x="12" y="10" width="2" height="3" fill="#3A1BCB" />
          
          {/* Accents & Cockpit */}
          <rect x="7" y="1" width="2" height="1" fill="#FF0000" />
          <rect x="7" y="5" width="2" height="2" fill="#00FFFF" opacity="0.8" />
          <rect x="4" y="9" width="1" height="1" fill="#FF0000" />
          <rect x="11" y="9" width="1" height="1" fill="#FF0000" />
          
          {/* Engine Grills */}
          <rect x="6" y="13" width="1" height="1" fill="#444444" />
          <rect x="9" y="13" width="1" height="1" fill="#444444" />
        </svg>
      </div>

      {/* Improved 8-bit Flickering Flames */}
      <motion.div
        style={{ scaleY: flameScale, opacity: combinedFlameOpacity }}
        className="flex flex-col items-center -mt-1 origin-top"
      >
        <motion.div
          animate={{ 
            opacity: [0.8, 1, 0.9],
            scaleX: [0.9, 1.1, 1],
          }}
          transition={{ repeat: Infinity, duration: 0.1 }}
          className="flex flex-col items-center"
        >
          {/* Pixelated Flame Layers */}
          <div className="flex gap-[1px]">
            <div className="w-2 h-1 bg-white" />
            <div className="w-2 h-1 bg-white" />
          </div>
          <div className="w-6 h-2 bg-yellow-400" />
          <div className="w-4 h-3 bg-orange-500" />
          <div className="w-2 h-5 bg-red-600" />
          <div className="w-1 h-4 bg-red-800 opacity-50" />
        </motion.div>
      </motion.div>
    </motion.div>
    </>
  );
};

export const LaunchPad = () => {
  return (
    <div className="relative">
      {/* Retro Launch Pad */}
      <div className="w-32 h-3 bg-zinc-800 border-x-4 border-t-4 border-neon-pink/100" />
      <div className="w-32 h-8 bg-zinc-900 border-x-4 border-b-4 border-neon-pink/50 flex items-center justify-center">
        <div className="w-24 h-4 border border-dashed border-neon-pink/20 flex items-center justify-center">
          <span className="text-[8px] text-neon-pink/40 tracking-[0.3em] font-mono uppercase">Launch_Pad_Alpha</span>
        </div>
      </div>
      {/* Lights */}
      <div className="absolute -top-1 left-2 w-1.5 h-1.5 bg-blue-500 animate-pulse rounded-full" />
      <div className="absolute -top-1 right-2 w-1.5 h-1.5 bg-blue-500 animate-pulse rounded-full" />
    </div>
  );
};

export const LandingPad = () => {
  return (
    <div className="flex flex-col items-center justify-center py-20 border-t border-white/10 mt-20">
      <div className="relative">
        {/* Retro Landing Pad */}
        <div className="w-48 h-4 bg-zinc-800 border-x-4 border-t-4 border-azure-blue/50" />
        <div className="w-48 h-12 bg-zinc-900 border-x-4 border-b-4 border-azure-blue/50 flex items-center justify-center">
          <div className="w-40 h-8 border-2 border-dashed border-azure-blue/20 flex items-center justify-center">
            <span className="text-[10px] text-azure-blue/40 tracking-[0.5em] font-mono">LANDING_ZONE_01</span>
          </div>
        </div>
        {/* Lights */}
        <div className="absolute -top-2 left-4 w-2 h-2 bg-red-500 animate-pulse rounded-full" />
        <div className="absolute -top-2 right-4 w-2 h-2 bg-red-500 animate-pulse rounded-full" />
      </div>
    </div>
  );
};

export const CRTWrapper = ({ children }: { children: React.ReactNode }) => (
  <div className="relative min-h-screen bg-black overflow-x-hidden">
    <ColorBends
      rotation={45}
      speed={0.2}
      colors={DEFAULT_COLORS}
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
    <SpaceshipScroll />
    <div className="crt-overlay" />
    <div className="crt-scanline" />
    <div className="dither-screen" />
    <div className="relative z-10 p-4 md:p-8 max-w-6xl mx-auto">
      {children}
      <LandingPad />
    </div>
  </div>
);


export const TextType = ({ text, speed = 20, className }: { text: string; speed?: number; className?: string }) => {
  const [displayedText, setDisplayedText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const isTypingRef = useRef(false);

  const type = useCallback(() => {
    if (isTypingRef.current) return;
    isTypingRef.current = true;
    setIsTyping(true);
    setDisplayedText("");
    
    let i = 0;
    const interval = setInterval(() => {
      setDisplayedText(text.slice(0, i + 1));
      i++;
      if (i >= text.length) {
        clearInterval(interval);
        setIsTyping(false);
        isTypingRef.current = false;
      }
    }, speed);
  }, [text, speed]);

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

export const ScrambledText = ({ text, className }: { text: string; className?: string }) => {
  const [displayText, setDisplayText] = useState(text);
  const [isScrambling, setIsScrambling] = useState(false);
  const isScramblingRef = useRef(false);
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+";
  
  const scramble = useCallback(() => {
    if (isScramblingRef.current) return;
    isScramblingRef.current = true;
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
        isScramblingRef.current = false;
      }
      
      iteration += 1 / 3;
    }, 30);
  }, [text]);

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

export const SectionHeader = ({ title, color }: { title: string; color: string }) => {
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

export const TerminalCard = ({ 
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

