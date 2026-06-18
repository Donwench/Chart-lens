import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Sparkles, 
  BookOpen, 
  GraduationCap, 
  Flame, 
  TrendingUp, 
  CheckCircle2, 
  Users, 
  Briefcase, 
  HelpCircle, 
  ChevronRight,
  ShieldCheck,
  Award,
  DollarSign,
  AlertTriangle,
  Send,
  Zap,
  ChevronDown
} from "lucide-react";

interface MasterClassProps {
  themePreset?: "sapphire" | "champagne" | "hyperneon";
}

export const MasterClass: React.FC<MasterClassProps> = ({ themePreset = "sapphire" }) => {
  // Theme helpers
  const isChampagne = themePreset === "champagne";
  const isHyperneon = themePreset === "hyperneon";

  const appThemeText = isChampagne ? "text-amber-400" : isHyperneon ? "text-fuchsia-400" : "text-blue-400";
  const appThemeBgAccent = isChampagne ? "bg-amber-500/10" : isHyperneon ? "bg-fuchsia-500/10" : "bg-blue-500/10";
  const appThemeBorder = isChampagne ? "border-amber-500/20" : isHyperneon ? "border-fuchsia-500/20" : "border-blue-500/20";
  const appThemeButton = isChampagne 
    ? "bg-amber-600 hover:bg-amber-500 text-black shadow-[0_0_15px_rgba(245,158,11,0.3)] hover:shadow-[0_0_25px_rgba(245,158,11,0.5)]" 
    : isHyperneon 
      ? "bg-fuchsia-600 hover:bg-fuchsia-500 text-white shadow-[0_0_15px_rgba(232,121,249,0.35)] hover:shadow-[0_0_25px_rgba(232,121,249,0.55)]" 
      : "bg-blue-600 hover:bg-blue-500 text-white shadow-[0_0_15px_rgba(59,130,246,0.3)] hover:shadow-[0_0_25px_rgba(59,130,246,0.5)]";

  const appThemeHoverText = isChampagne ? "group-hover:text-amber-400" : isHyperneon ? "group-hover:text-fuchsia-400" : "group-hover:text-blue-400";
  const themeCardBg = isChampagne ? "bg-[#14110C]/80" : isHyperneon ? "bg-[#110A18]/80" : "bg-[#0F1117]/80";

  // State controls for interactive features
  const [activeModule, setActiveModule] = useState<number | null>(0);
  const [enrollName, setEnrollName] = useState("");
  const [enrollEmail, setEnrollEmail] = useState("");
  const [enrollExperience, setEnrollExperience] = useState("beginner");
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [enrollError, setEnrollError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Dynamic Tuition & ROI Calculator state
  const [capitalSize, setCapitalSize] = useState<number>(10000);
  const [monthlyReturnGoal, setMonthlyReturnGoal] = useState<number>(5);
  
  // Real-time seats countdown
  const [seatsLeft, setSeatsLeft] = useState(7);
  useEffect(() => {
    const timer = setInterval(() => {
      setSeatsLeft((prev) => {
        if (prev <= 2) return prev;
        // 5% chance of decreasing seat count occasionally to simulate real-time demand pressure
        return Math.random() > 0.93 ? prev - 1 : prev;
      });
    }, 12000);
    return () => clearInterval(timer);
  }, []);

  // Simple countdown timer to midnight
  const [timeLeft, setTimeLeft] = useState({ hours: 14, minutes: 22, seconds: 48 });
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        } else {
          return { hours: 23, minutes: 59, seconds: 59 };
        }
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleEnrollSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!enrollName.trim() || !enrollEmail.trim()) {
      setEnrollError("Please supply both a valid name and active trader email to authenticate ticket registration.");
      return;
    }
    setEnrollError(null);
    setIsSubmitting(true);
    
    setTimeout(() => {
      setIsSubmitting(false);
      setIsEnrolled(true);
    }, 1500);
  };

  // Syllabus Modules definitions
  const modules = [
    {
      id: 0,
      title: "Module 1: Level Extraction Architecture",
      subtitle: "Parsing the raw interface grids with mathematical certainty",
      duration: "Week 1-2",
      lessons: [
        "Dynamic Support & Resistance (S&R) micro-grids",
        "Understanding standard deviation levels & delta distributions",
        "Recognizing liquidity sweeps and high-probability gaps",
        "AI vision optimization: Preparing screenshots for automated telemetry"
      ],
      icon: "🎯"
    },
    {
      id: 1,
      title: "Module 2: Advanced Risk Ratios & Capital Sizing",
      subtitle: "How to engineer zero-leakage trade positions of scale",
      duration: "Week 3",
      lessons: [
        "Optimal balance-to-lot coefficient models",
        "Configuring dynamic Stop Loss buffers for volatile pairs (XAUUSD, BTCUSD)",
        "The mathematical formula behind 1:3 and 1:5 risk-to-reward ratios",
        "Surviving systematic flash crashes and news-events slippage"
      ],
      icon: "📊"
    },
    {
      id: 2,
      title: "Module 3: Visual Playbook Strategy Mastery",
      subtitle: "Executing the 16 institutional strategies effortlessly",
      duration: "Week 4",
      lessons: [
        "The 'Order Block Sweep' & 'Breaker Block Mitigation' signals",
        "Standard deviation channel bounds vs. parabolic breakouts",
        "Customizing visual parameters layout based on session times",
        "Automating confirmations through Lens Aesthetics V2.5 telemetry"
      ],
      icon: "⚡"
    },
    {
      id: 3,
      title: "Module 4: Institutional Mindset & Portfolio Orchestration",
      subtitle: "Synthesizing cold execution habits and consistent pacing",
      duration: "Week 5",
      lessons: [
        "Eliminating intuitive fumbles (over-leveraging, revenge triggers)",
        "Logging precise parameter deviations in the Setup Journal",
        "Side-by-side post-mortem audits for high-yield iterations",
        "Setting up custom local volatility notifications and alarms"
      ],
      icon: "🧠"
    }
  ];

  // Calculators outputs
  const estimatedAnnualPremiumReturns = (capitalSize * (monthlyReturnGoal / 100) * 12).toLocaleString(undefined, { maximumFractionDigits: 0 });
  const estimatedCompoundExtraTwoYears = (capitalSize * Math.pow(1 + (monthlyReturnGoal + 2.5) / 100, 24) - capitalSize).toLocaleString(undefined, { maximumFractionDigits: 0 });

  return (
    <div className="space-y-12">
      {/* 1. HERO SECTION */}
      <section className="relative rounded-2xl overflow-hidden border border-white/5 py-12 md:py-20 px-6 md:px-10 text-center flex flex-col items-center bg-radial-at-t from-[#1F172E] via-[#0A0B10] to-[#0A0B10]">
        {/* Abstract glow grids background */}
        <div className="absolute inset-0 opacity-15 pointer-events-none bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]" />
        
        <div className="relative z-10 max-w-4xl space-y-6">
          <motion.div
            initial={{ opacity: 0, y: -15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black tracking-widest uppercase bg-black/40 border ${appThemeBorder} ${appThemeText}`}
          >
            <Sparkles className="h-4 w-4 animate-spin-slow" />
            ELITE TRADING PROGRAM NOW OPEN
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl md:text-6xl font-black text-white tracking-tight leading-tight uppercase font-sansID"
            id="masterclass-title"
          >
            The Chart <br className="hidden md:block"/>
            <span className={`bg-gradient-to-r ${isChampagne ? "from-amber-400 via-amber-200 to-amber-500" : isHyperneon ? "from-fuchsia-500 via-pink-400 to-fuchsia-300" : "from-blue-500 via-indigo-400 to-cyan-400"} bg-clip-text text-transparent`}>
              MasterClass
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.25 }}
            className="text-base text-white/70 max-w-2xl mx-auto leading-relaxed"
          >
            Transform your technical chart assessment from basic guessworks into high-probability institutional level mechanics. Master standard deviations, volume distribution parameters, and dynamic position risk sizing limits.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="pt-4 flex flex-wrap justify-center gap-4"
          >
            <a 
              href="#enroll-portal"
              className={`px-8 py-4.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all duration-300 ${appThemeButton}`}
            >
              SECURE YOUR ADMISSION TICKET
            </a>
            <a 
              href="#syllabus-curriculum"
              className="px-8 py-4.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/80 hover:text-white border border-white/10 text-xs font-extrabold transition-all duration-200 uppercase tracking-wider"
            >
              EXPLORE CURRICULUM
            </a>
          </motion.div>

          {/* Real-time Ticker stats banner */}
          <div className="pt-10 flex flex-wrap justify-center gap-6 md:gap-12 text-left">
            <div className="border-l-2 border-white/10 pl-4">
              <span className="block text-2xl font-black text-white">4.96/5</span>
              <span className="text-[10px] uppercase tracking-wider text-white/40">Verified Alumni Rating</span>
            </div>
            <div className="border-l-2 border-white/10 pl-4">
              <span className="block text-2xl font-black text-white">1,850+</span>
              <span className="text-[10px] uppercase tracking-wider text-white/40">Funded Speculators</span>
            </div>
            <div className="border-l-2 border-white/10 pl-4 text-rose-400">
              <span className="block text-2xl font-black animate-pulse">{seatsLeft} SEATS</span>
              <span className="text-[10px] uppercase tracking-wider text-white/40">Remaining This Month</span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. VALUE PROPOSITION BULLETS & PERKS */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className={`p-6 rounded-xl border border-white/5 ${themeCardBg} flex flex-col justify-between space-y-4 hover:border-white/10 transition`}>
          <div className="space-y-2">
            <div className="p-3 bg-indigo-500/10 text-indigo-400 w-12 h-12 rounded-lg flex items-center justify-center">
              <GraduationCap className="h-6 w-6" />
            </div>
            <h3 className="text-base font-bold text-white uppercase tracking-wide">Dynamic Mathematics Syllabus</h3>
            <p className="text-xs text-white/60 leading-relaxed">
              No retail generic strategies. Learn pattern extractions formatted around rigorous quant-style volume bands and precision Fibonacci alignments.
            </p>
          </div>
          <span className="text-[10px] font-mono text-white/35">MODULES 1 THROUGH 4 COMPREHENSIVE</span>
        </div>

        <div className={`p-6 rounded-xl border border-white/5 ${themeCardBg} flex flex-col justify-between space-y-4 hover:border-white/10 transition`}>
          <div className="space-y-2">
            <div className="p-3 bg-emerald-500/10 text-emerald-400 w-12 h-12 rounded-lg flex items-center justify-center">
              <TrendingUp className="h-6 w-6" />
            </div>
            <h3 className="text-base font-bold text-white uppercase tracking-wide">Risk Sizing Strategy Labs</h3>
            <p className="text-xs text-white/60 leading-relaxed">
              Master state-of-the-art positioning models. Calculate lot sizes, target stop margins, and potential payout thresholds with high-precision.
            </p>
          </div>
          <span className="text-[10px] font-mono text-white/35">PORTFOLIO EXPOSURE COMPREHENDED</span>
        </div>

        <div className={`p-6 rounded-xl border border-white/5 ${themeCardBg} flex flex-col justify-between space-y-4 hover:border-white/10 transition`}>
          <div className="space-y-2">
            <div className="p-3 bg-rose-500/10 text-rose-400 w-12 h-12 rounded-lg flex items-center justify-center">
              <Flame className="h-6 w-6" />
            </div>
            <h3 className="text-base font-bold text-white uppercase tracking-wide">Dynamic Alarms and Logging</h3>
            <p className="text-xs text-white/60 leading-relaxed">
              Connect theoretical setups back to reality. Learn to record trading diaries, save parameters, and audit setups side-by-side to fix flaws.
            </p>
          </div>
          <span className="text-[10px] font-mono text-white/35">PLAYBOOK HISTORICAL SYNCHRONIZATION</span>
        </div>
      </section>

      {/* 3. DYNAMIC ROI & POTENTIAL EDUCATION CALCULATOR */}
      <section className={`p-6 md:p-8 rounded-2xl border border-white/5 bg-[#0F1117]/60 relative overflow-hidden`}>
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <Award className={`h-32 w-32 ${appThemeText}`} />
        </div>

        <div className="relative z-10 space-y-6">
          <div className="max-w-2xl">
            <span className={`text-[10px] font-black tracking-widest uppercase ${appThemeText} bg-white/5 border border-white/5 px-2.5 py-1 rounded-md`}>
              PLAYFUL ANALYTICAL LABORATORY
            </span>
            <h2 className="text-xl md:text-2xl font-black text-white mt-3 uppercase">
              Chart MasterClass Potential ROI Projection
            </h2>
            <p className="text-xs text-white/50 mt-1">
              Test how refining your mathematical target alignment can exponentially affect your active spec-account portfolio over monthly compounding intervals.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-black/30 p-6 rounded-xl border border-white/5">
            {/* Input sliders */}
            <div className="lg:col-span-7 space-y-5">
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-white/60 font-semibold uppercase">Speculation Portfolio Size ($)</span>
                  <span className={`font-mono font-bold ${appThemeText}`}>${capitalSize.toLocaleString()} USD</span>
                </div>
                <input 
                  type="range" 
                  min="1000" 
                  max="250000" 
                  step="1000"
                  value={capitalSize}
                  onChange={(e) => setCapitalSize(Number(e.target.value))}
                  className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
                <div className="flex justify-between text-[10px] text-white/30 font-mono">
                  <span>$1,000</span>
                  <span>$100,000</span>
                  <span>$250,000</span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-white/60 font-semibold uppercase">Current Monthly Target Yield (%)</span>
                  <span className={`font-mono font-bold ${appThemeText}`}>{monthlyReturnGoal}% Monthly</span>
                </div>
                <input 
                  type="range" 
                  min="1" 
                  max="25" 
                  step="1"
                  value={monthlyReturnGoal}
                  onChange={(e) => setMonthlyReturnGoal(Number(e.target.value))}
                  className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
                <div className="flex justify-between text-[10px] text-white/30 font-mono">
                  <span>1% Stable Yield</span>
                  <span>12% High Risk</span>
                  <span>25% Speculative</span>
                </div>
              </div>
            </div>

            {/* Calculations summaries */}
            <div className="lg:col-span-5 p-4 bg-white/[0.02] border border-white/5 rounded-xl space-y-4">
              <div className="space-y-1">
                <span className="text-[9px] uppercase font-bold text-white/30 tracking-widest block">Standard Potential Extractions (Annual)</span>
                <span className="text-xl font-black text-white font-mono">${estimatedAnnualPremiumReturns}</span>
              </div>
              <div className="h-px bg-white/5" />
              <div className="space-y-1">
                <div className="flex items-center gap-1">
                  <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider">With +2.5% Premium MasterClass Edge 🚀</span>
                </div>
                <span className="text-2xl font-black text-emerald-400 font-mono">+${estimatedCompoundExtraTwoYears}</span>
                <p className="text-[9.5px] text-white/40 leading-snug">
                  Aggregate dynamic ROI compound projections over 24-month cycles assuming continuous alignment with the certified Playbook signals.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. SYLLABUS ACCORDION */}
      <section id="syllabus-curriculum" className="space-y-6">
        <div className="text-center">
          <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-white/5 border border-white/10 text-white/40">
            THE EDUCATIONAL BLUEPRINT
          </span>
          <h2 className="text-2xl font-black text-white mt-2 uppercase tracking-wide">
            5-Week Intensive Academy Curriculum
          </h2>
          <p className="text-xs text-white/50 max-w-md mx-auto mt-1">
            Dive into precise, logical breakdowns. No filler content, only direct metrics.
          </p>
        </div>

        <div className="max-w-3xl mx-auto space-y-3">
          {modules.map((m) => {
            const isOpen = activeModule === m.id;
            return (
              <div 
                key={m.id}
                className={`border border-white/5 rounded-xl overflow-hidden transition-all duration-200 ${
                  isOpen ? "bg-[#0F1117] border-white/10 shadow-lg" : "bg-white/[0.015] hover:bg-white/[0.03]"
                }`}
              >
                <button
                  onClick={() => setActiveModule(isOpen ? null : m.id)}
                  className="w-full text-left p-4.5 flex items-center justify-between gap-4 cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-lg bg-white/5 rounded-lg p-1.5 w-9 h-9 flex items-center justify-center border border-white/5">
                      {m.icon}
                    </span>
                    <div>
                      <h3 className="text-sm font-extrabold text-white leading-tight uppercase tracking-wide">{m.title}</h3>
                      <p className="text-[10.5px] text-white/50 mt-0.5 line-clamp-1">{m.subtitle}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 font-mono text-[10px] text-white/40 shrink-0">
                    <span className="hidden sm:inline bg-white/5 border border-white/5 px-2 py-0.5 rounded text-[9.5px] uppercase font-bold tracking-wider">{m.duration}</span>
                    <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${isOpen ? "rotate-180 text-white" : ""}`} />
                  </div>
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: "auto" }}
                      exit={{ height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden border-t border-white/5"
                    >
                      <div className="p-4 bg-black/20 space-y-3">
                        <span className="text-[10px] uppercase font-black tracking-widest text-white/45 block">KEY LEARNING MILESTONES:</span>
                        <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                          {m.lessons.map((lesson, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-white/70">
                              <CheckCircle2 className={`h-4 w-4 shrink-0 mt-0.5 ${appThemeText}`} />
                              <span>{lesson}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </section>

      {/* 5. STUDENT TESTIMONIALS */}
      <section className="space-y-6">
        <div className="text-center">
          <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-white/5 border border-white/10 text-white/40">
            PROVEN SPECS SUCCESS
          </span>
          <h2 className="text-2xl font-black text-white mt-2 uppercase tracking-wide">
            Verified Speculator Testimonials
          </h2>
          <p className="text-xs text-white/50 max-w-md mx-auto mt-1">
            Real outcomes validated by certified students with verified funded accounts.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          <div className="p-5.5 bg-[#0F1117] border border-white/5 rounded-xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-yellow-500 to-amber-600 flex items-center justify-center text-black font-extrabold text-sm">
                MK
              </div>
              <div>
                <h4 className="text-xs font-bold text-white uppercase tracking-wide">Marcus K.</h4>
                <p className="text-[10px] font-mono text-white/40">Funded Prop Speculator ($200K Account)</p>
              </div>
            </div>
            <p className="text-xs text-white/70 leading-relaxed italic">
              "Module 2's session on dynamic lot sizing completely salvaged my trading. I went from blowing evaluation metrics to setting precise Standard Deviation buffers. Lens aesthetics V2.5 plus these course calculations is literally cheating."
            </p>
          </div>

          <div className="p-5.5 bg-[#0F1117] border border-white/5 rounded-xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-fuchsia-500 to-indigo-600 flex items-center justify-center text-white font-extrabold text-sm">
                SL
              </div>
              <div>
                <h4 className="text-xs font-bold text-white uppercase tracking-wide">Sarah L.</h4>
                <p className="text-[10px] font-mono text-white/40">Systematic Gold & Crypto Trader</p>
              </div>
            </div>
            <p className="text-xs text-white/70 leading-relaxed italic">
              "The side-by-side comparison strategy is incredible. Being able to audit multiple setup logs together and identify discrepancies helped me shift my weekly accuracy from 48% to 74% with strict 1:4 R:R limits on XAUUSD."
            </p>
          </div>
        </div>
      </section>

      {/* 6. ENROLLMENT OR DEADLINE FORM */}
      <section id="enroll-portal" className="max-w-2xl mx-auto">
        <div className="p-6 md:p-8 bg-gradient-to-b from-[#111319] to-[#0A0B10] rounded-2xl border border-white/10 space-y-6 relative overflow-hidden shadow-[0_0_25px_rgba(0,0,0,0.6)]">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />
          
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-lg md:text-xl font-black text-white uppercase tracking-wide">Confirm Academy Seat</h2>
              <p className="text-xs text-white/50 mt-1">Ticket registration for {new Date().toLocaleDateString(undefined, { month: "long", year: "numeric" })} cohort.</p>
            </div>
            
            {/* Countdown Badge */}
            <div className="flex items-center gap-2 bg-rose-500/10 border border-rose-500/20 px-3 py-1.5 rounded-lg text-rose-400 font-mono text-xs font-bold">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
              </span>
              <span>CLOSING IN: {String(timeLeft.hours).padStart(2, '0')}:{String(timeLeft.minutes).padStart(2, '0')}:{String(timeLeft.seconds).padStart(2, '0')}</span>
            </div>
          </div>

          <div className="h-px bg-white/5" />

          {/* Success screen */}
          {isEnrolled ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-8 space-y-4"
            >
              <div className="mx-auto w-12 h-12 bg-emerald-500/15 border border-emerald-500/35 rounded-full flex items-center justify-center text-emerald-400">
                <CheckCircle2 className="h-6 w-6 animate-pulse" />
              </div>
              <h3 className="text-base font-black text-white uppercase tracking-wider">AESTHETIC ADMISSION GUARANTEED!</h3>
              <p className="text-xs text-white/70 max-w-md mx-auto leading-relaxed">
                Congratulations <span className="font-extrabold text-white">{enrollName}</span>! We have locked down 1 of the {seatsLeft} remaining seats under the email <span className="text-[#3b82f6] font-mono">{enrollEmail}</span>.
              </p>
              <div className="p-3.5 bg-white/[0.02] border border-white/5 rounded-xl inline-block text-left text-[11px] font-mono text-white/50 max-w-md space-y-1">
                <span className="text-white font-bold uppercase block mb-1">🎟️ NEXT ONBOARDING STEPS:</span>
                <div>1. Auditing verification link dispatched to your inbox.</div>
                <div>2. Complete the initial 15-minute diagnostic profile.</div>
                <div>3. Obtain early access to Module 1 telemetry tools.</div>
              </div>
            </motion.div>
          ) : (
            <form onSubmit={handleEnrollSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-black tracking-widest text-[#E0E0E6]/50">Traders Full Name</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Marcus Aurelius" 
                    value={enrollName}
                    onChange={(e) => setEnrollName(e.target.value)}
                    className="w-full text-xs px-3.5 py-2.5 bg-black/40 border border-white/10 rounded-lg text-white focus:outline-none focus:border-blue-500/50 transition-colors placeholder-white/20"
                    disabled={isSubmitting}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-black tracking-widest text-[#E0E0E6]/50">Primary Speculator Email</label>
                  <input 
                    type="email" 
                    placeholder="e.g. pilot@elitecharts.com" 
                    value={enrollEmail}
                    onChange={(e) => setEnrollEmail(e.target.value)}
                    className="w-full text-xs px-3.5 py-2.5 bg-black/40 border border-white/10 rounded-lg text-white focus:outline-none focus:border-blue-500/50 transition-colors placeholder-white/20"
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] uppercase font-black tracking-widest text-[#E0E0E6]/50">Current Speculative Level</label>
                <select 
                  value={enrollExperience}
                  onChange={(e) => setEnrollExperience(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 bg-black/50 border border-white/10 rounded-lg text-white/80 focus:outline-none focus:border-blue-500/50 transition-colors"
                  disabled={isSubmitting}
                >
                  <option value="beginner">Beginer (0 - 6 Months active speculation)</option>
                  <option value="intermediate">Intermediate (6+ Months - understand pip distance)</option>
                  <option value="advanced">Advanced Pattern Professional (Looking for algorithmic ratio adjustments)</option>
                </select>
              </div>

              {enrollError && (
                <div className="p-3 rounded-lg bg-rose-500/15 border border-rose-500/20 text-rose-400 text-xs flex gap-2">
                  <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>{enrollError}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer ${appThemeButton}`}
              >
                {isSubmitting ? (
                  <>
                    <div className="h-3.5 w-3.5 rounded-full border-2 border-t-transparent border-white animate-spin" />
                    <span>Verifying Credentials...</span>
                  </>
                ) : (
                  <>
                    <Send className="h-3.5 w-3.5" />
                    <span>Confirm Tuition Seat Enrollment</span>
                  </>
                )}
              </button>

              <div className="flex justify-center items-center gap-6 pt-2 text-[10px] text-white/40">
                <span className="flex items-center gap-1">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                  No Risk Guarantee
                </span>
                <span>•</span>
                <span className="flex items-center gap-1 animate-pulse">
                  <Zap className={`h-3.5 w-3.5 ${appThemeText}`} />
                  Instant Intake Portal Access
                </span>
              </div>
            </form>
          )}
        </div>
      </section>
    </div>
  );
};
