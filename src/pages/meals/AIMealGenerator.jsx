import { useState  } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bot, Sparkles, ArrowLeft, Loader2, CheckCircle2 } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { useFitnessStore } from '../../store/useFitnessStore';

export default function AIMealGenerator() {
  const navigate = useNavigate();
  const addMeal = useFitnessStore((state) => state.addMeal);
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  // Notice how the AI "thinks" about specific menu items
  const steps = [
    "Analyzing dietary preferences...",
    "Calculating Total Daily Energy Expenditure (TDEE)...",
    "Incorporating masala oats and egg bhurji...",
    "Evaluating protein-rich mess dinner options...",
    "Finalizing macronutrient split..."
  ];

  const handleGenerate = async () => {
    setIsGenerating(true);

    for (let i = 0; i < steps.length; i++) {
      setCurrentStep(i);
      await new Promise(resolve => setTimeout(resolve, 1200)); 
    }

    // Mock response injecting a highly specific combo meal
    const aiGeneratedMeal = {
      name: "AI Custom: Paneer Thing & Veggie Sandwich",
      type: "Lunch",
      calories: 520,
      protein: 32,
      carbs: 48,
      fats: 18,
    };

    addMeal(aiGeneratedMeal);
    navigate('/meals');
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-[fade-in-up_0.6s_ease-out_forwards]">
      <button 
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-sm font-medium text-zinc-400 hover:text-teal-400 transition-colors disabled:opacity-50"
        disabled={isGenerating}
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Meals
      </button>

      <div className="relative rounded-[2rem] border border-zinc-800/60 bg-zinc-900/40 p-10 text-center shadow-2xl shadow-teal-500/5 backdrop-blur-xl overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-teal-500/10 blur-[100px] pointer-events-none" />

        <div className="relative z-10 mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-2xl bg-zinc-950 border border-zinc-800/50 shadow-inner">
          <Bot className={`h-10 w-10 ${isGenerating ? 'text-teal-400 animate-pulse drop-shadow-[0_0_15px_rgba(20,184,166,0.8)]' : 'text-zinc-400'}`} />
        </div>

        <h1 className="relative z-10 text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-500 mb-4">AI Nutrition Architect</h1>
        <p className="relative z-10 text-zinc-400 mb-10 max-w-lg mx-auto text-lg leading-relaxed">
          Let our AI analyze your metabolic rate and build a highly optimized, personalized meal plan hitting your exact macro goals.
        </p>

        {!isGenerating ? (
          <Button size="lg" onClick={handleGenerate} className="relative z-10 gap-3 w-full sm:w-auto px-10 py-6 text-lg rounded-full shadow-[0_0_20px_rgba(20,184,166,0.4)] hover:shadow-[0_0_35px_rgba(20,184,166,0.6)]">
            <Sparkles className="h-6 w-6" />
            Generate Custom Plan
          </Button>
        ) : (
          <div className="relative z-10 space-y-6 bg-zinc-950/60 rounded-2xl p-8 border border-zinc-800/50 text-left max-w-md mx-auto shadow-inner backdrop-blur-md">
            {steps.map((step, index) => (
              <div key={index} className="flex items-center gap-4">
                {currentStep > index ? (
                  <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                ) : currentStep === index ? (
                  <Loader2 className="h-5 w-5 text-emerald-400 animate-spin" />
                ) : (
                  <div className="h-5 w-5 rounded-full border-2 border-zinc-700" />
                )}
                <span className={`text-sm font-medium ${currentStep >= index ? 'text-zinc-200' : 'text-zinc-600'}`}>
                  {step}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}