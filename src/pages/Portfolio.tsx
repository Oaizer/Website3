import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { motion, AnimatePresence, useScroll, useTransform, useSpring, useVelocity } from "motion/react";
import { Terminal, User, Code, Briefcase, Mail, Github, Linkedin, ExternalLink, ChevronRight, ArrowLeft, Eraser, PenTool, Rocket } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { colorMap, DEFAULT_COLORS } from "../utils/constants";
import { CRTWrapper, LaunchPad, TerminalCard, SectionHeader, TextType, ScrambledText } from "../components/Effects";
export const Portfolio = () => {
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

      <div className="flex justify-end mb-16 pr-4">
        <LaunchPad />
      </div>

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
              color: "neon-pink" 
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

