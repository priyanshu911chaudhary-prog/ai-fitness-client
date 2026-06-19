import { Link } from 'react-router-dom';
import { BrainCircuit, Activity, Utensils, ArrowRight, BarChart3 } from 'lucide-react';
import { Button } from '../components/ui/Button';
import heroImage from '../assets/hero_ai.png';

export default function Landing() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50 overflow-hidden selection:bg-emerald-500/30">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-zinc-800/50 bg-zinc-950/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BrainCircuit className="h-6 w-6 text-emerald-400" />
            <span className="text-xl font-bold bg-gradient-to-r from-zinc-100 to-zinc-400 bg-clip-text text-transparent">
              AIFit
            </span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-zinc-400">
            <a href="#features" className="hover:text-emerald-400 transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-emerald-400 transition-colors">How it Works</a>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/login" className="text-sm font-medium text-zinc-300 hover:text-white transition-colors">
              Log In
            </Link>
            <Link to="/signup">
              <Button className="bg-emerald-500 hover:bg-emerald-600 text-zinc-950 px-5 py-2 text-sm font-semibold rounded-full shadow-[0_0_15px_rgba(16,185,129,0.3)] hover:shadow-[0_0_25px_rgba(16,185,129,0.5)] transition-all">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center pt-20 pb-20 px-6 overflow-hidden">
        {/* Background Glows */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-[120px] pointer-events-none" />
        
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8 z-10 animate-[fade-in-up_0.8s_ease-out_forwards]">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900/80 border border-zinc-800 text-sm text-emerald-400">
              <SparklesIcon className="w-4 h-4" />
              <span>Next-Gen Fitness Intelligence</span>
            </div>
            
            <h1 className="text-5xl lg:text-7xl font-extrabold tracking-tight text-white leading-tight">
              Unlock Your <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-500 animate-[glow_2s_ease-in-out_infinite_alternate]">
                Ultimate Potential
              </span>
            </h1>
            
            <p className="text-lg text-zinc-400 max-w-lg leading-relaxed">
              Experience the future of fitness. Our AI analyzes your biometrics to craft personalized workout routines and meal plans that guarantee results.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Link to="/signup">
                <Button className="w-full sm:w-auto text-lg px-8 py-4 h-auto rounded-full bg-emerald-500 hover:bg-emerald-400 text-zinc-950 shadow-[0_0_20px_rgba(52,211,153,0.4)] transition-all flex items-center justify-center gap-2">
                  Start Free Trial <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
              <Link to="/login">
                <Button variant="outline" className="w-full sm:w-auto text-lg px-8 py-4 h-auto rounded-full border-zinc-700 text-zinc-300 hover:bg-zinc-800">
                  View Demo
                </Button>
              </Link>
            </div>
            
          </div>
          
          <div className="relative z-10 flex justify-center lg:justify-end animate-[float_6s_ease-in-out_infinite]">
            <div className="relative w-full max-w-lg aspect-square rounded-[2rem] overflow-hidden border border-zinc-800/50 shadow-2xl shadow-emerald-500/10">
              <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/20 to-transparent mix-blend-overlay z-10" />
              <img 
                src={heroImage} 
                alt="AI Fitness Tracker Interface" 
                className="object-cover w-full h-full"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Bento Box */}
      <section id="features" className="py-24 px-6 bg-zinc-900/50">
        <div className="max-w-7xl mx-auto space-y-16">
          <div className="text-center max-w-2xl mx-auto space-y-4">
            <h2 className="text-3xl lg:text-5xl font-bold text-white">Why Choose AIFit?</h2>
            <p className="text-zinc-400 text-lg">Stop guessing. Let data and intelligence drive your fitness journey.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            {/* Feature 1 - Large */}
            <div className="md:col-span-2 group relative overflow-hidden rounded-3xl bg-zinc-900 border border-zinc-800 p-8 transition-all hover:border-emerald-500/50">
              <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl group-hover:bg-emerald-500/10 transition-colors" />
              <BrainCircuit className="w-12 h-12 text-emerald-400 mb-6" />
              <h3 className="text-2xl font-bold text-zinc-100 mb-3">Adaptive AI Engine</h3>
              <p className="text-zinc-400 max-w-md">Our neural network learns from every rep. It instantly adjusts your weekly plans to optimize for muscle growth, fat loss, or endurance based on real-time feedback.</p>
            </div>
            
            {/* Feature 2 */}
            <div className="group relative overflow-hidden rounded-3xl bg-zinc-900 border border-zinc-800 p-8 transition-all hover:border-teal-500/50">
              <Utensils className="w-12 h-12 text-teal-400 mb-6" />
              <h3 className="text-xl font-bold text-zinc-100 mb-3">Smart Macros</h3>
              <p className="text-zinc-400">Generate perfect meal plans instantly tailored to your dietary needs and caloric targets.</p>
            </div>
            
            {/* Feature 3 */}
            <div className="group relative overflow-hidden rounded-3xl bg-zinc-900 border border-zinc-800 p-8 transition-all hover:border-blue-500/50">
              <Activity className="w-12 h-12 text-blue-400 mb-6" />
              <h3 className="text-xl font-bold text-zinc-100 mb-3">Live Biometrics</h3>
              <p className="text-zinc-400">Track your BMI, weight trends, and workout consistency all in one beautiful dashboard.</p>
            </div>
            
            {/* Feature 4 - Large */}
            <div className="md:col-span-2 group relative overflow-hidden rounded-3xl bg-zinc-900 border border-zinc-800 p-8 transition-all hover:border-emerald-500/50">
              <BarChart3 className="w-12 h-12 text-emerald-400 mb-6" />
              <h3 className="text-2xl font-bold text-zinc-100 mb-3">Actionable Insights</h3>
              <p className="text-zinc-400 max-w-md">Visualize your progress with stunning charts. See exactly how your diet affects your performance and make data-driven decisions to crush your plateaus.</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-24 px-6 relative">
        <div className="max-w-7xl mx-auto space-y-16">
          <div className="text-center max-w-2xl mx-auto space-y-4">
            <h2 className="text-3xl lg:text-5xl font-bold text-white">Three Steps to Glory</h2>
            <p className="text-zinc-400 text-lg">We've removed the friction so you can focus on the work.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 relative">
            {/* Connecting Line */}
            <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-[2px] bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent -z-10" />
            
            <div className="relative space-y-4 text-center">
              <div className="w-24 h-24 mx-auto rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-3xl font-bold text-emerald-400 shadow-[0_0_30px_rgba(52,211,153,0.1)]">1</div>
              <h3 className="text-xl font-bold text-zinc-100">Set Your Targets</h3>
              <p className="text-zinc-400">Input your stats, goals, and diet preferences. We establish your baseline.</p>
            </div>
            
            <div className="relative space-y-4 text-center">
              <div className="w-24 h-24 mx-auto rounded-full bg-zinc-900 border border-emerald-500/30 flex items-center justify-center text-3xl font-bold text-emerald-400 shadow-[0_0_30px_rgba(52,211,153,0.2)]">2</div>
              <h3 className="text-xl font-bold text-zinc-100">Generate Plans</h3>
              <p className="text-zinc-400">Our AI crafts a custom 7-day workout and meal schedule in milliseconds.</p>
            </div>
            
            <div className="relative space-y-4 text-center">
              <div className="w-24 h-24 mx-auto rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-3xl font-bold text-emerald-400 shadow-[0_0_30px_rgba(52,211,153,0.1)]">3</div>
              <h3 className="text-xl font-bold text-zinc-100">Execute & Track</h3>
              <p className="text-zinc-400">Follow the plan, log your completion, and watch your metrics soar.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Footer Section */}
      <section className="py-24 px-6 border-t border-zinc-800/50 bg-gradient-to-b from-zinc-950 to-emerald-950/20">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <h2 className="text-4xl md:text-5xl font-bold text-white">Ready to transform?</h2>
          <p className="text-xl text-zinc-400">Join thousands of users who have already upgraded their fitness with AIFit.</p>
          <Link to="/signup">
            <Button className="mt-4 text-lg px-10 py-5 h-auto rounded-full bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold shadow-[0_0_30px_rgba(52,211,153,0.5)] transition-all">
              Create Your Free Account
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-zinc-800/50 text-center text-zinc-500 text-sm">
        <p>© 2026 AI Fitness Tracker. All rights reserved.</p>
      </footer>
    </div>
  );
}

function SparklesIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
      <path d="M5 3v4" />
      <path d="M19 17v4" />
      <path d="M3 5h4" />
      <path d="M17 19h4" />
    </svg>
  );
}
