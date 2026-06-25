import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Dumbbell, Utensils, Timer, Flame, Loader2, Sparkles, GlassWater, Trash2 } from 'lucide-react';
import { api } from '../../utils/api';

// Reusable progress bar component for macros
const MacroBar = ({ label, current, target, colorClass }) => {
  const percentage = target > 0 ? Math.min(Math.round((current / target) * 100), 100) : 0;
  
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span className="text-zinc-400">{label}</span>
        <span className="font-medium text-zinc-200">{Math.round(current)}g / {Math.round(target)}g</span>
      </div>
      <div className="h-2 w-full rounded-full bg-zinc-800/50 overflow-hidden backdrop-blur-sm border border-zinc-800/50">
        <div 
          className={`h-full rounded-full ${colorClass} transition-all duration-1000 ease-out relative`}
          style={{ width: `${percentage}%` }}
        >
          <div className="absolute top-0 right-0 bottom-0 w-4 bg-white/20 blur-[2px]" />
        </div>
      </div>
    </div>
  );
};

export default function Dashboard() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Water Tracker state
  const [showWaterHistory, setShowWaterHistory] = useState(false);
  const [isEditingGoal, setIsEditingGoal] = useState(false);
  const [tempGoal, setTempGoal] = useState(2000);
  const [customAmount, setCustomAmount] = useState('');
  const [loggingWater, setLoggingWater] = useState(false);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await api.get('/dashboard');
        const dashData = res.data.data;
        if (!dashData.profile?.height || !dashData.profile?.weight) {
          navigate('/profile', { state: { needSetup: true } });
        } else {
          setData(dashData);
          setTempGoal(dashData.todayWater?.goal || 2000);
        }
      } catch (err) {
        console.error("Dashboard error:", err);
        if (err.response?.status === 404) {
          // Profile not found, redirect to profile setup
          navigate('/profile');
        } else {
          setError(err.response?.data?.message || "Failed to load dashboard data.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, [navigate]);

  if (loading) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center gap-4">
        <Loader2 className="h-10 w-10 text-emerald-400 animate-spin" />
        <p className="text-zinc-400">Loading your fitness command center...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center gap-4 text-center">
        <p className="text-red-400 font-semibold">{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="px-6 py-2 bg-emerald-500 text-zinc-950 rounded-full font-semibold hover:bg-emerald-400 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!data) return null;

  // Calculate dynamic macro targets based on daily calorie target
  const calorieTarget = data.todayNutrition?.dailyTarget || 2000;
  const proteinTarget = data.todayNutrition?.targetProtein || Math.round((calorieTarget * 0.30) / 4);
  const carbsTarget = data.todayNutrition?.targetCarbs || Math.round((calorieTarget * 0.45) / 4);
  const fatsTarget = data.todayNutrition?.targetFats || Math.round((calorieTarget * 0.25) / 9);

  const caloriesConsumed = data.todayNutrition?.caloriesConsumed || 0;
  const proteinConsumed = data.todayNutrition?.macros?.protein || 0;
  const carbsConsumed = data.todayNutrition?.macros?.carbs || 0;
  const fatsConsumed = data.todayNutrition?.macros?.fats || 0;
  const caloriesBurned = data.todayNutrition?.caloriesBurned || 0;
  const workoutDuration = data.todayNutrition?.workoutDuration || 0;
  const bmiCurrent = data.bmi?.current ? Number(data.bmi.current).toFixed(1) : "N/A";
  const bmiCategory = data.bmi?.category || "Not Calculated";

  // Water helper methods
  const handleLogWater = async (amountVal) => {
    const amount = Number(amountVal);
    if (!amount || amount <= 0 || isNaN(amount)) return;
    
    setLoggingWater(true);
    try {
      const res = await api.post('/water', { amount });
      const newLog = res.data.data;
      
      setData(prev => {
        const waterObj = prev.todayWater || { logs: [], goal: 2000, totalIntake: 0 };
        return {
          ...prev,
          todayWater: {
            ...waterObj,
            logs: [...waterObj.logs, newLog],
            totalIntake: waterObj.totalIntake + amount
          }
        };
      });
      setCustomAmount('');
    } catch (err) {
      console.error("Failed to log water:", err);
    } finally {
      setLoggingWater(false);
    }
  };

  const handleDeleteWaterLog = async (logId) => {
    try {
      await api.delete(`/water/${logId}`);
      setData(prev => {
        const waterObj = prev.todayWater || { logs: [], goal: 2000, totalIntake: 0 };
        const targetLog = waterObj.logs.find(l => l._id === logId);
        const amountToDeduct = targetLog ? targetLog.amount : 0;
        return {
          ...prev,
          todayWater: {
            ...waterObj,
            logs: waterObj.logs.filter(l => l._id !== logId),
            totalIntake: Math.max(0, waterObj.totalIntake - amountToDeduct)
          }
        };
      });
    } catch (err) {
      console.error("Failed to delete water log:", err);
    }
  };

  const handleUpdateWaterGoal = async (e) => {
    e.preventDefault();
    const goalVal = Number(tempGoal);
    if (!goalVal || goalVal <= 0 || isNaN(goalVal)) return;

    try {
      await api.put('/water/goal', { waterGoal: goalVal });
      setData(prev => {
        const waterObj = prev.todayWater || { logs: [], goal: 2000, totalIntake: 0 };
        return {
          ...prev,
          todayWater: {
            ...waterObj,
            goal: goalVal
          }
        };
      });
      setIsEditingGoal(false);
    } catch (err) {
      console.error("Failed to update water goal:", err);
    }
  };

  const mealDay = data.todaysMeal?.day || data.greeting?.today;
  const mealPlanMeals = data.todaysMeal?.meals || [];

  // Goal progress feedback calculations
  const renderAnalysis = () => {
    if (!data.goalProgress) return null;
    
    const { startWeight, currentWeight, targetWeight } = data.goalProgress;
    const goal = data.profile?.goal || 'muscle_building';
    const delta = currentWeight - startWeight;
    const absDelta = Math.abs(delta).toFixed(1);
    
    const isWeightLossGoal = ['weight_loss', 'running', 'endurance'].includes(goal);
    
    let statusText = '';
    let statusColorClass = 'text-emerald-400 border-emerald-500/20 bg-emerald-500/10';
    let feedback = '';

    if (isWeightLossGoal) {
      if (delta < 0) {
        statusText = 'On Track';
        feedback = `Great progress! You have lost ${absDelta} kg since your starting weight of ${startWeight} kg. Your target is ${targetWeight} kg. Keep up the solid consistency!`;
      } else if (delta === 0) {
        statusText = 'Starting Line';
        statusColorClass = 'text-blue-400 border-blue-500/20 bg-blue-500/10';
        feedback = `Your starting weight is set at ${startWeight} kg. Stick to your customized calorie deficit and workout routine to begin your fat loss journey.`;
      } else {
        statusText = 'Adjustment Needed';
        statusColorClass = 'text-amber-400 border-amber-500/20 bg-amber-500/10';
        feedback = `You are currently ${absDelta} kg above your starting weight of ${startWeight} kg. Weight fluctuates easily due to water and glycogen—don't lose heart! Ensure you log all meals to monitor your calorie deficit closely.`;
      }
    } else { // Weight gain / muscle building
      if (delta > 0) {
        statusText = 'On Track';
        feedback = `Excellent progress! You have successfully gained ${absDelta} kg of mass. Your target weight is ${targetWeight} kg. Keep training heavy and meeting your daily protein targets!`;
      } else if (delta === 0) {
        statusText = 'Starting Line';
        statusColorClass = 'text-blue-400 border-blue-500/20 bg-blue-500/10';
        feedback = `Your starting weight is set at ${startWeight} kg. Focus on hitting a consistent surplus with high-protein meals and progressive overload to build muscle.`;
      } else {
        statusText = 'Caloric Adjustment';
        statusColorClass = 'text-amber-400 border-amber-500/20 bg-amber-500/10';
        feedback = `You are currently ${absDelta} kg below your starting weight of ${startWeight} kg. To build muscle, you need to eat in a calorie surplus. Check your meal logger and try increasing your daily calorie target.`;
      }
    }
    
    return { statusText, statusColorClass, feedback };
  };

  // SVG Chart calculation details
  const trend = data.bmi?.trend || [];
  let graphPoints = [];
  
  if (trend.length > 0) {
    graphPoints = trend.map((t) => ({
      weight: t.weight,
      date: new Date(t.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
    }));
  }
  
  if (graphPoints.length === 0 && data.goalProgress) {
    const { startWeight, currentWeight } = data.goalProgress;
    graphPoints = [
      { weight: startWeight, date: 'Start' },
      { weight: currentWeight, date: 'Current' }
    ];
  } else if (graphPoints.length === 1 && data.goalProgress) {
    const { startWeight } = data.goalProgress;
    if (graphPoints[0].weight !== startWeight) {
      graphPoints.unshift({ weight: startWeight, date: 'Start' });
    } else {
      graphPoints.push({ weight: graphPoints[0].weight, date: 'Today' });
    }
  }

  const svgWidth = 500;
  const svgHeight = 200;
  const paddingX = 40;
  const paddingY = 30;

  const weights = graphPoints.map(p => p.weight);
  const minW = Math.min(...weights) - 2;
  const maxW = Math.max(...weights) + 2;
  const weightRange = maxW - minW || 10;

  const points = graphPoints.map((p, i) => {
    const x = paddingX + (i / (graphPoints.length - 1 || 1)) * (svgWidth - 2 * paddingX);
    const y = svgHeight - paddingY - ((p.weight - minW) / weightRange) * (svgHeight - 2 * paddingY);
    return { x, y, weight: p.weight, date: p.date };
  });

  let pathD = '';
  if (points.length > 0) {
    pathD = `M ${points[0].x} ${points[0].y} ` + points.slice(1).map(p => `L ${p.x} ${p.y}`).join(' ');
  }

  let fillD = '';
  if (points.length > 0) {
    fillD = `${pathD} L ${points[points.length - 1].x} ${svgHeight - paddingY} L ${points[0].x} ${svgHeight - paddingY} Z`;
  }

  return (
    <div className="space-y-8 animate-[fade-in-up_0.6s_ease-out_forwards]">
      {/* Header */}
      <div className="relative flex justify-between items-center">
        <div>
          <div className="absolute -top-10 -left-10 w-48 h-48 bg-emerald-500/10 rounded-full blur-[80px] pointer-events-none" />
          <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-500">
            Welcome back, {data.greeting?.name || "Athlete"}
          </h1>
          <p className="mt-2 text-zinc-400">Here is your daily fitness and nutrition overview.</p>
        </div>
        <div className="text-right hidden md:block">
          <p className="text-zinc-300 font-semibold">{data.greeting?.today}</p>
          <p className="text-zinc-500 text-sm">{data.greeting?.date}</p>
        </div>
      </div>

      {/* Top Metrics Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {/* Activity Rings (Calorie & Macros) Card */}
        <div className="group relative rounded-[2rem] border border-zinc-800/60 bg-zinc-900/40 p-8 md:col-span-2 shadow-xl backdrop-blur-xl transition-all hover:border-emerald-500/30 overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl group-hover:bg-emerald-500/10 transition-colors pointer-events-none" />
          
          <div className="relative z-10 flex items-center gap-3 mb-6 border-b border-zinc-800/50 pb-4">
            <h3 className="text-xl font-bold text-white">Daily Activity Rings</h3>
          </div>

          <div className="relative z-10 flex flex-col lg:flex-row items-center gap-8 lg:gap-12 py-2">
            {/* Concentric Rings Visualizer */}
            <div className="flex justify-center items-center shrink-0">
              <svg viewBox="0 0 200 200" className="w-40 h-40 md:w-44 md:h-44 overflow-visible drop-shadow-[0_0_20px_rgba(0,0,0,0.5)]">
                <defs>
                  <linearGradient id="ringCalGradient" x1="0" y1="1" x2="0" y2="0">
                    <stop offset="0%" stopColor="#ff0055" />
                    <stop offset="100%" stopColor="#ff6600" />
                  </linearGradient>
                  <linearGradient id="ringProtGradient" x1="0" y1="1" x2="0" y2="0">
                    <stop offset="0%" stopColor="#a3ff00" />
                    <stop offset="100%" stopColor="#10b981" />
                  </linearGradient>
                  <linearGradient id="ringCarbGradient" x1="0" y1="1" x2="0" y2="0">
                    <stop offset="0%" stopColor="#00f2fe" />
                    <stop offset="100%" stopColor="#4facfe" />
                  </linearGradient>
                  <linearGradient id="ringFatsGradient" x1="0" y1="1" x2="0" y2="0">
                    <stop offset="0%" stopColor="#bf5af2" />
                    <stop offset="100%" stopColor="#8e2de2" />
                  </linearGradient>
                </defs>

                {/* Calories Ring (Outer) */}
                <circle
                  cx="100"
                  cy="100"
                  r="85"
                  fill="none"
                  stroke="#ff0055"
                  strokeWidth="10"
                  opacity="0.12"
                />
                <circle
                  cx="100"
                  cy="100"
                  r="85"
                  fill="none"
                  stroke="url(#ringCalGradient)"
                  strokeWidth="10"
                  strokeDasharray="534.07"
                  strokeDashoffset={534.07 - (Math.min(caloriesConsumed / (calorieTarget || 1), 1)) * 534.07}
                  strokeLinecap="round"
                  transform="rotate(-90 100 100)"
                  className="transition-all duration-1000 ease-out"
                />

                {/* Protein Ring (Middle-Outer) */}
                <circle
                  cx="100"
                  cy="100"
                  r="71"
                  fill="none"
                  stroke="#a3ff00"
                  strokeWidth="10"
                  opacity="0.12"
                />
                <circle
                  cx="100"
                  cy="100"
                  r="71"
                  fill="none"
                  stroke="url(#ringProtGradient)"
                  strokeWidth="10"
                  strokeDasharray="446.11"
                  strokeDashoffset={446.11 - (Math.min(proteinConsumed / (proteinTarget || 1), 1)) * 446.11}
                  strokeLinecap="round"
                  transform="rotate(-90 100 100)"
                  className="transition-all duration-1000 ease-out"
                />

                {/* Carbs Ring (Middle-Inner) */}
                <circle
                  cx="100"
                  cy="100"
                  r="57"
                  fill="none"
                  stroke="#00f2fe"
                  strokeWidth="10"
                  opacity="0.12"
                />
                <circle
                  cx="100"
                  cy="100"
                  r="57"
                  fill="none"
                  stroke="url(#ringCarbGradient)"
                  strokeWidth="10"
                  strokeDasharray="358.14"
                  strokeDashoffset={358.14 - (Math.min(carbsConsumed / (carbsTarget || 1), 1)) * 358.14}
                  strokeLinecap="round"
                  transform="rotate(-90 100 100)"
                  className="transition-all duration-1000 ease-out"
                />

                {/* Fats Ring (Inner) */}
                <circle
                  cx="100"
                  cy="100"
                  r="43"
                  fill="none"
                  stroke="#bf5af2"
                  strokeWidth="10"
                  opacity="0.12"
                />
                <circle
                  cx="100"
                  cy="100"
                  r="43"
                  fill="none"
                  stroke="url(#ringFatsGradient)"
                  strokeWidth="10"
                  strokeDasharray="270.18"
                  strokeDashoffset={270.18 - (Math.min(fatsConsumed / (fatsTarget || 1), 1)) * 270.18}
                  strokeLinecap="round"
                  transform="rotate(-90 100 100)"
                  className="transition-all duration-1000 ease-out"
                />
              </svg>
            </div>

            {/* Detailed metrics */}
            <div className="flex-1 w-full grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6">
              {/* Calories Row */}
              <div className="flex items-center gap-4 bg-zinc-950/20 p-4 rounded-2xl border border-zinc-800/30">
                <div className="w-3.5 h-3.5 rounded-full bg-[#ff0055] shadow-[0_0_10px_rgba(255,0,85,0.5)] shrink-0" />
                <div>
                  <p className="text-zinc-400 text-xs font-semibold uppercase tracking-wider">Move (Calories)</p>
                  <p className="text-lg font-bold text-white mt-1">
                    {Math.round(caloriesConsumed)} <span className="text-zinc-500 text-sm font-medium">/ {Math.round(calorieTarget)} kcal</span>
                  </p>
                  <span className="text-[11px] text-zinc-550 font-semibold block mt-0.5">
                    {Math.round((caloriesConsumed / (calorieTarget || 1)) * 100)}% completed
                  </span>
                </div>
              </div>

              {/* Protein Row */}
              <div className="flex items-center gap-4 bg-zinc-950/20 p-4 rounded-2xl border border-zinc-800/30">
                <div className="w-3.5 h-3.5 rounded-full bg-[#a3ff00] shadow-[0_0_10px_rgba(163,255,0,0.5)] shrink-0" />
                <div>
                  <p className="text-zinc-400 text-xs font-semibold uppercase tracking-wider">Protein (Build)</p>
                  <p className="text-lg font-bold text-white mt-1">
                    {Math.round(proteinConsumed)}g <span className="text-zinc-500 text-sm font-medium">/ {Math.round(proteinTarget)}g</span>
                  </p>
                  <span className="text-[11px] text-zinc-550 font-semibold block mt-0.5">
                    {Math.round((proteinConsumed / (proteinTarget || 1)) * 100)}% completed
                  </span>
                </div>
              </div>

              {/* Carbs Row */}
              <div className="flex items-center gap-4 bg-zinc-950/20 p-4 rounded-2xl border border-zinc-800/30">
                <div className="w-3.5 h-3.5 rounded-full bg-[#00f2fe] shadow-[0_0_10px_rgba(0,242,254,0.5)] shrink-0" />
                <div>
                  <p className="text-zinc-400 text-xs font-semibold uppercase tracking-wider">Carbs (Energy)</p>
                  <p className="text-lg font-bold text-white mt-1">
                    {Math.round(carbsConsumed)}g <span className="text-zinc-500 text-sm font-medium">/ {Math.round(carbsTarget)}g</span>
                  </p>
                  <span className="text-[11px] text-zinc-550 font-semibold block mt-0.5">
                    {Math.round((carbsConsumed / (carbsTarget || 1)) * 100)}% completed
                  </span>
                </div>
              </div>

              {/* Fats Row */}
              <div className="flex items-center gap-4 bg-zinc-950/20 p-4 rounded-2xl border border-zinc-800/30">
                <div className="w-3.5 h-3.5 rounded-full bg-[#8e2de2] shadow-[0_0_10px_rgba(142,45,226,0.5)] shrink-0" />
                <div>
                  <p className="text-zinc-400 text-xs font-semibold uppercase tracking-wider">Fats (Healthy)</p>
                  <p className="text-lg font-bold text-white mt-1">
                    {Math.round(fatsConsumed)}g <span className="text-zinc-500 text-sm font-medium">/ {Math.round(fatsTarget)}g</span>
                  </p>
                  <span className="text-[11px] text-zinc-550 font-semibold block mt-0.5">
                    {Math.round((fatsConsumed / (fatsTarget || 1)) * 100)}% completed
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* BMI Card */}
        <div className="group relative rounded-[2rem] border border-zinc-800/60 bg-zinc-900/40 p-8 flex flex-col justify-center items-center text-center shadow-xl backdrop-blur-xl transition-all hover:border-teal-500/30 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-teal-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
          <h3 className="relative z-10 text-zinc-400 text-sm font-medium mb-4 uppercase tracking-wider">Current BMI</h3>
          <div className="relative z-10 text-6xl font-bold text-white mb-4 drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]">
            {bmiCurrent}
          </div>
          <span className="relative z-10 inline-flex items-center rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-400 border border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.2)]">
            {bmiCategory}
          </span>
        </div>
      </div>

      {/* Weight Progress & Graph Card */}
      {data.goalProgress && (
        <div className="group relative rounded-[2rem] border border-zinc-800/60 bg-zinc-900/40 p-8 shadow-xl backdrop-blur-xl transition-all hover:border-emerald-500/30 overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl group-hover:bg-emerald-500/10 transition-colors pointer-events-none" />
          
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 border-b border-zinc-800/50 pb-6">
            <div>
              <h2 className="text-xl font-bold text-white">Weight Progress Tracker</h2>
              <p className="text-sm text-zinc-400 mt-1">Real-time analysis of your weight trends based on your fitness goals.</p>
            </div>
            {renderAnalysis() && (
              <span className={`inline-flex items-center rounded-full px-3.5 py-1 text-xs font-bold border transition-all duration-300 ${renderAnalysis().statusColorClass}`}>
                {renderAnalysis().statusText}
              </span>
            )}
          </div>

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-5 gap-8">
            {/* Target Tracking & AI Feedback (Left 2 cols) */}
            <div className="lg:col-span-2 space-y-6 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-400 font-medium">Starting weight: <strong className="text-zinc-200">{data.goalProgress.startWeight} kg</strong></span>
                  <span className="text-zinc-400 font-medium">Target: <strong className="text-zinc-200">{data.goalProgress.targetWeight} kg</strong></span>
                </div>
                
                <div className="relative pt-1">
                  <div className="flex mb-2 items-center justify-between">
                    <div>
                      <span className="text-xs font-semibold inline-block py-1 px-2.5 uppercase rounded-full text-emerald-400 bg-emerald-500/10 border border-emerald-500/20">
                        {data.goalProgress.progressPercentage}%
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-bold text-zinc-300">
                        {data.goalProgress.currentWeight} kg current
                      </span>
                    </div>
                  </div>
                  <div className="overflow-hidden h-2.5 text-xs flex rounded-full bg-zinc-850 border border-zinc-800/50 backdrop-blur-sm">
                    <div 
                      style={{ width: `${data.goalProgress.progressPercentage}%` }} 
                      className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-1000 ease-out relative"
                    >
                      <div className="absolute top-0 right-0 bottom-0 w-8 bg-white/20 blur-[1px]" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Progress Analysis Box */}
              {renderAnalysis() && (
                <div className="bg-zinc-950/40 border border-zinc-850 p-5 rounded-2xl leading-relaxed text-sm text-zinc-300 shadow-inner">
                  <h4 className="font-bold text-zinc-200 mb-1.5 text-xs uppercase tracking-wider text-emerald-400">AI Progress Analysis</h4>
                  <p>{renderAnalysis().feedback}</p>
                </div>
              )}
            </div>

            {/* SVG Trend Graph (Right 3 cols) */}
            <div className="lg:col-span-3 flex flex-col justify-end">
              <div className="bg-zinc-950/30 rounded-2xl p-5 border border-zinc-850 shadow-inner relative">
                {graphPoints.length > 0 ? (
                  <div>
                    <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-auto overflow-visible">
                      <defs>
                        <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
                          <stop offset="0%" stopColor="#10b981" />
                          <stop offset="100%" stopColor="#2dd4bf" />
                        </linearGradient>
                        <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#10b981" stopOpacity="0.4" />
                          <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                        </linearGradient>
                      </defs>

                      {/* Horizontal Grid lines */}
                      {[0.25, 0.5, 0.75].map((ratio, index) => {
                        const yVal = paddingY + ratio * (svgHeight - 2 * paddingY);
                        return (
                          <line 
                            key={index} 
                            x1={paddingX} 
                            y1={yVal} 
                            x2={svgWidth - paddingX} 
                            y2={yVal} 
                            stroke="#27272a" 
                            strokeDasharray="4 4" 
                            strokeWidth="1" 
                          />
                        );
                      })}

                      {/* Gradient Fill under path */}
                      {fillD && <path d={fillD} fill="url(#areaGradient)" />}

                      {/* Stroke path line */}
                      {pathD && (
                        <path 
                          d={pathD} 
                          stroke="url(#lineGradient)" 
                          strokeWidth="3.5" 
                          fill="none" 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                        />
                      )}

                      {/* Dots and Labels */}
                      {points.map((pt, idx) => (
                        <g key={idx} className="group/dot cursor-pointer">
                          <circle 
                            cx={pt.x} 
                            cy={pt.y} 
                            r="8" 
                            fill="#10b981" 
                            className="opacity-0 hover:opacity-20 transition-opacity duration-300" 
                          />
                          <circle 
                            cx={pt.x} 
                            cy={pt.y} 
                            r="5.5" 
                            fill="#10b981" 
                            stroke="#18181b" 
                            strokeWidth="2.5" 
                          />
                          <text 
                            x={pt.x} 
                            y={pt.y - 12} 
                            textAnchor="middle" 
                            className="text-[10px] font-bold fill-zinc-200"
                          >
                            {pt.weight} kg
                          </text>
                          <text 
                            x={pt.x} 
                            y={svgHeight - 8} 
                            textAnchor="middle" 
                            className="text-[9px] font-medium fill-zinc-500"
                          >
                            {pt.date}
                          </text>
                        </g>
                      ))}
                    </svg>
                  </div>
                ) : (
                  <div className="h-40 flex flex-col items-center justify-center text-center">
                    <p className="text-zinc-500 text-sm">Not enough logs to generate a chart yet.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Burn/Intake/Water Summary */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {/* Calories Consumed */}
        <div className="rounded-[2rem] border border-zinc-800/60 bg-zinc-900/40 p-6 flex flex-col justify-between shadow-xl backdrop-blur-xl">
          <div>
            <p className="text-zinc-400 text-sm uppercase tracking-wider font-medium">Calories Consumed Today</p>
            <div className="mt-3 text-4xl font-bold text-white">{Math.round(caloriesConsumed)} kcal</div>
          </div>
          <p className="mt-4 text-zinc-500 text-sm border-t border-zinc-800/40 pt-3">Meals logged: {data.todayNutrition?.mealsLogged || 0}</p>
        </div>

        {/* Interactive Water Intake Card */}
        <div className="group relative rounded-[2rem] border border-zinc-800/60 bg-zinc-900/40 p-6 flex flex-col justify-between shadow-xl backdrop-blur-xl transition-all hover:border-sky-500/30 overflow-hidden min-h-[220px]">
          <div className="absolute top-0 right-0 w-64 h-64 bg-sky-500/5 rounded-full blur-3xl group-hover:bg-sky-500/10 transition-colors pointer-events-none" />
          
          <div className="relative z-10 flex items-center justify-between border-b border-zinc-800/50 pb-2">
            <div className="flex items-center gap-2">
              <GlassWater className="h-5 w-5 text-sky-400 animate-pulse shrink-0" />
              <span className="text-zinc-400 text-sm uppercase tracking-wider font-medium">Hydration</span>
            </div>
            <div className="flex gap-2 shrink-0">
              <button 
                onClick={() => {
                  setTempGoal(data.todayWater?.goal || 2000);
                  setIsEditingGoal(true);
                }}
                className="px-2 py-1 rounded-lg bg-zinc-800/30 hover:bg-zinc-800 border border-zinc-800/50 text-zinc-400 hover:text-white transition-all text-xs font-semibold"
                title="Edit daily goal"
              >
                Goal: {data.todayWater?.goal || 2000}ml
              </button>
              <button 
                onClick={() => setShowWaterHistory(!showWaterHistory)}
                className="px-2 py-1 rounded-lg bg-zinc-800/30 hover:bg-zinc-800 border border-zinc-800/50 text-zinc-400 hover:text-white transition-all text-xs font-semibold"
                title="View today's history"
              >
                Logs ({data.todayWater?.logs?.length || 0})
              </button>
            </div>
          </div>

          {/* Card Content Area */}
          {isEditingGoal ? (
            <form onSubmit={handleUpdateWaterGoal} className="relative z-10 flex items-center gap-2 py-4">
              <input
                type="number"
                value={tempGoal}
                onChange={(e) => setTempGoal(e.target.value)}
                className="flex-1 rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs text-zinc-150 focus:border-sky-500 focus:outline-none"
                placeholder="Goal (ml)"
                min="100"
                required
              />
              <button 
                type="submit" 
                className="px-3 py-2 rounded-xl bg-sky-500 text-zinc-950 hover:bg-sky-450 transition-colors font-bold text-xs shrink-0"
              >
                Save
              </button>
              <button 
                type="button" 
                onClick={() => setIsEditingGoal(false)}
                className="px-3 py-2 rounded-xl bg-zinc-800 text-zinc-300 hover:bg-zinc-750 transition-colors font-bold text-xs shrink-0"
              >
                Cancel
              </button>
            </form>
          ) : showWaterHistory ? (
            /* Log history feed */
            <div className="relative z-10 flex-1 flex flex-col py-3 overflow-y-auto max-h-[140px] scrollbar-thin scrollbar-thumb-zinc-800 pr-1">
              <div className="flex justify-between items-center mb-2">
                <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Today's logs</span>
                <button 
                  className="text-xs text-sky-400 hover:underline"
                  onClick={() => setShowWaterHistory(false)}
                >
                  Back to Tracker
                </button>
              </div>
              {data.todayWater?.logs?.length > 0 ? (
                <div className="space-y-1.5">
                  {data.todayWater.logs.map((log) => (
                    <div key={log._id} className="flex justify-between items-center bg-zinc-950/40 px-3 py-1.5 rounded-xl border border-zinc-800/30 hover:border-sky-500/20 transition-all">
                      <div>
                        <span className="font-bold text-zinc-200 text-xs">{log.amount} ml</span>
                        <span className="text-[9px] text-zinc-500 block">
                          {new Date(log.consumedAt).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <button 
                        onClick={() => handleDeleteWaterLog(log._id)}
                        className="text-zinc-550 hover:text-red-400 p-1 rounded transition-colors"
                        title="Delete log"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 text-xs text-zinc-500">
                  No water logged yet today.
                </div>
              )}
            </div>
          ) : (
            /* Interactive visualizer */
            <div className="relative z-10 flex items-center justify-around py-3">
              {/* Cup Visualizer */}
              <div className="water-container hover:scale-105 transition-transform duration-300 shrink-0">
                {/* Blue filling */}
                <div 
                  className="water-wave" 
                  style={{ height: `${Math.min(100, Math.round(((data.todayWater?.totalIntake || 0) / (data.todayWater?.goal || 2000)) * 100))}%` }}
                />
                {/* Centered text display inside cup */}
                <div className="relative z-20 flex flex-col items-center select-none text-center">
                  <span className="text-[26px] font-black text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] leading-none">
                    {Math.round(((data.todayWater?.totalIntake || 0) / (data.todayWater?.goal || 2000)) * 100)}%
                  </span>
                  <span className="text-[9px] font-bold text-sky-200 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] uppercase mt-0.5 tracking-wider">
                    {data.todayWater?.totalIntake || 0}ml
                  </span>
                </div>
              </div>

              {/* Quick stats on side of visualizer */}
              <div className="flex flex-col justify-center">
                <span className="text-2xl font-black text-white leading-none">
                  {data.todayWater?.totalIntake || 0} <span className="text-xs font-normal text-zinc-500">ml</span>
                </span>
                <span className="text-[11px] text-zinc-400 font-semibold mt-1">
                  Target: {data.todayWater?.goal || 2000} ml
                </span>
                <span className="text-[10px] font-bold text-sky-400 mt-0.5">
                  {Math.max(0, (data.todayWater?.goal || 2000) - (data.todayWater?.totalIntake || 0)) <= 0 
                    ? "Goal Achieved! 🎉" 
                    : `${Math.max(0, (data.todayWater?.goal || 2000) - (data.todayWater?.totalIntake || 0))}ml remaining`
                  }
                </span>
              </div>
            </div>
          )}

          {/* Quick Logging Presets / Custom input */}
          {!isEditingGoal && !showWaterHistory && (
            <div className="relative z-10 pt-2 border-t border-zinc-800/40">
              <div className="grid grid-cols-3 gap-1.5 mb-2">
                <button 
                  onClick={() => handleLogWater(250)}
                  disabled={loggingWater}
                  className="py-1 rounded-xl bg-sky-500/10 hover:bg-sky-500 text-sky-400 hover:text-zinc-950 border border-sky-500/20 font-bold text-[10px] transition-all flex flex-col items-center justify-center cursor-pointer active:scale-95 disabled:opacity-50"
                >
                  <span>+250ml</span>
                </button>
                <button 
                  onClick={() => handleLogWater(500)}
                  disabled={loggingWater}
                  className="py-1 rounded-xl bg-sky-500/10 hover:bg-sky-500 text-sky-400 hover:text-zinc-950 border border-sky-500/20 font-bold text-[10px] transition-all flex flex-col items-center justify-center cursor-pointer active:scale-95 disabled:opacity-50"
                >
                  <span>+500ml</span>
                </button>
                <button 
                  onClick={() => handleLogWater(1000)}
                  disabled={loggingWater}
                  className="py-1 rounded-xl bg-sky-500/10 hover:bg-sky-500 text-sky-400 hover:text-zinc-950 border border-sky-500/20 font-bold text-[10px] transition-all flex flex-col items-center justify-center cursor-pointer active:scale-95 disabled:opacity-50"
                >
                  <span>+1000ml</span>
                </button>
              </div>

              {/* Custom ml input */}
              <div className="flex gap-1.5">
                <input
                  type="number"
                  placeholder="Custom ml..."
                  value={customAmount}
                  onChange={(e) => setCustomAmount(e.target.value)}
                  className="flex-1 min-w-0 bg-zinc-950/60 border border-zinc-800 rounded-xl px-2.5 py-1 text-[11px] text-zinc-300 focus:outline-none focus:border-sky-500"
                />
                <button 
                  onClick={() => handleLogWater(customAmount)}
                  disabled={loggingWater || !customAmount}
                  className="px-3 bg-sky-500 text-zinc-950 font-bold text-[11px] rounded-xl hover:bg-sky-400 transition-colors disabled:opacity-50 shrink-0"
                >
                  Log
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Calories Burned */}
        <div className="rounded-[2rem] border border-zinc-800/60 bg-zinc-900/40 p-6 flex flex-col justify-between shadow-xl backdrop-blur-xl">
          <div>
            <p className="text-zinc-400 text-sm uppercase tracking-wider font-medium">Calories Burned Today</p>
            <div className="mt-3 text-4xl font-bold text-white">{Math.round(caloriesBurned)} kcal</div>
          </div>
          <p className="mt-4 text-zinc-500 text-sm border-t border-zinc-800/40 pt-3">Workout logs: {data.todayNutrition?.workoutsLogged || 0}</p>
        </div>
      </div>

      {/* Today's Plan Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Meals List */}
        <div className="rounded-[2rem] border border-zinc-800/60 bg-zinc-900/40 p-8 shadow-xl backdrop-blur-xl">
          <div className="flex items-center justify-between mb-6 border-b border-zinc-800/50 pb-4">
            <div>
              <h3 className="text-xl font-bold text-zinc-100">Today's Meal Plan</h3>
              <p className="text-sm text-zinc-500 mt-1">You are at this day: {mealDay}</p>
            </div>
            <Link to="/meals" className="text-sm font-medium text-teal-400 hover:text-teal-300 transition-colors">
              View All
            </Link>
          </div>
          <div className="space-y-4">
            {mealPlanMeals.length > 0 ? (
              mealPlanMeals.map((meal, index) => (
                <div key={index} className="group flex items-center justify-between rounded-xl bg-zinc-800/20 p-4 border border-zinc-800/50 hover:bg-zinc-800/40 hover:border-teal-500/30 transition-all duration-300">
                  <div>
                    <p className="font-semibold text-zinc-200 group-hover:text-teal-400 transition-colors">{meal.mealName || meal.title || meal.name || `Meal ${index + 1}`}</p>
                    <p className="text-xs text-zinc-400 mt-1">{meal.mealType || "Meal"} • {meal.protein || 0}g Protein</p>
                  </div>
                  <div className="text-right font-bold text-white bg-zinc-950/50 px-3 py-1.5 rounded-lg border border-zinc-800">
                    {Math.round(meal.calories || 0)} kcal
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-zinc-500">
                <p>No meals in today's plan.</p>
                <Link to="/meals/generate" className="text-sm text-teal-400 hover:underline mt-2 inline-block">
                  Generate AI Meal Plan
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Workout Info Card with Concentric Activity Rings */}
        <div className="group relative rounded-[2rem] border border-zinc-800/60 bg-zinc-900/40 p-8 shadow-xl backdrop-blur-xl transition-all hover:border-emerald-500/30 overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl group-hover:bg-emerald-500/10 transition-colors pointer-events-none" />
          
          <div className="relative z-10 flex items-center justify-between mb-6 border-b border-zinc-800/50 pb-4">
            <h3 className="text-xl font-bold text-white">Workout Rings</h3>
            {data.todaysWorkout && (
              <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold border ${
                data.todaysWorkout.isRestDay 
                  ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' 
                  : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
              }`}>
                {data.todaysWorkout.isRestDay ? "Rest Day" : "Active Day"}
              </span>
            )}
          </div>

          <div className="relative z-10 flex flex-col lg:flex-row items-center gap-6 lg:gap-8 py-2">
            {/* Concentric Rings Visualizer */}
            <div className="flex justify-center items-center shrink-0">
              <svg viewBox="0 0 200 200" className="w-36 h-36 md:w-40 md:h-40 overflow-visible drop-shadow-[0_0_20px_rgba(0,0,0,0.5)]">
                <defs>
                  <linearGradient id="ringBurnGradient" x1="0" y1="1" x2="0" y2="0">
                    <stop offset="0%" stopColor="#ff4500" />
                    <stop offset="100%" stopColor="#ffaa00" />
                  </linearGradient>
                  <linearGradient id="ringDurGradient" x1="0" y1="1" x2="0" y2="0">
                    <stop offset="0%" stopColor="#00e676" />
                    <stop offset="100%" stopColor="#b2ff59" />
                  </linearGradient>
                  <linearGradient id="ringConstGradient" x1="0" y1="1" x2="0" y2="0">
                    <stop offset="0%" stopColor="#00e5ff" />
                    <stop offset="100%" stopColor="#0088ff" />
                  </linearGradient>
                </defs>

                {/* Calories Burned Ring (Outer) */}
                <circle
                  cx="100"
                  cy="100"
                  r="80"
                  fill="none"
                  stroke="#ff4500"
                  strokeWidth="14"
                  opacity="0.12"
                />
                <circle
                  cx="100"
                  cy="100"
                  r="80"
                  fill="none"
                  stroke="url(#ringBurnGradient)"
                  strokeWidth="14"
                  strokeDasharray="502.65"
                  strokeDashoffset={502.65 - (Math.min(caloriesBurned / 300, 1)) * 502.65}
                  strokeLinecap="round"
                  transform="rotate(-90 100 100)"
                  className="transition-all duration-1000 ease-out"
                />

                {/* Training Duration Ring (Middle) */}
                <circle
                  cx="100"
                  cy="100"
                  r="62"
                  fill="none"
                  stroke="#00e676"
                  strokeWidth="14"
                  opacity="0.12"
                />
                <circle
                  cx="100"
                  cy="100"
                  r="62"
                  fill="none"
                  stroke="url(#ringDurGradient)"
                  strokeWidth="14"
                  strokeDasharray="389.56"
                  strokeDashoffset={389.56 - (Math.min(workoutDuration / 45, 1)) * 389.56}
                  strokeLinecap="round"
                  transform="rotate(-90 100 100)"
                  className="transition-all duration-1000 ease-out"
                />

                {/* Consistency Ring (Inner) */}
                <circle
                  cx="100"
                  cy="100"
                  r="44"
                  fill="none"
                  stroke="#00e5ff"
                  strokeWidth="14"
                  opacity="0.12"
                />
                <circle
                  cx="100"
                  cy="100"
                  r="44"
                  fill="none"
                  stroke="url(#ringConstGradient)"
                  strokeWidth="14"
                  strokeDasharray="276.46"
                  strokeDashoffset={276.46 - (Math.min((data.workoutConsistency?.percentage || 0) / 100, 1)) * 276.46}
                  strokeLinecap="round"
                  transform="rotate(-90 100 100)"
                  className="transition-all duration-1000 ease-out"
                />
              </svg>
            </div>

            {/* Detailed metrics & actions */}
            <div className="flex-1 w-full flex flex-col justify-between h-full gap-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#ff4500]" />
                  <span className="text-zinc-400 text-xs font-semibold">Active Burn: <strong className="text-zinc-200">{Math.round(caloriesBurned)} / 300 kcal</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#00e676]" />
                  <span className="text-zinc-400 text-xs font-semibold">Time: <strong className="text-zinc-200">{Math.round(workoutDuration)} / 45 mins</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#00e5ff]" />
                  <span className="text-zinc-400 text-xs font-semibold">Consistency: <strong className="text-zinc-200">{data.workoutConsistency?.completedThisWeek || 0} / {data.workoutConsistency?.totalThisWeek || 0} days</strong></span>
                </div>
              </div>

              {data.todaysWorkout ? (
                <div className="pt-2 border-t border-zinc-850">
                  <p className="text-sm font-bold text-zinc-100">
                    Focus: <span className="text-emerald-400">{data.todaysWorkout.isRestDay ? "Rest & Recover" : data.todaysWorkout.focus}</span>
                  </p>
                  <p className="text-xs text-zinc-550 mt-1">
                    {data.todaysWorkout.isRestDay 
                      ? "Rest is key for muscle recovery." 
                      : `${data.todaysWorkout.exercises?.length || 0} custom movements planned.`}
                  </p>

                  {!data.todaysWorkout.isRestDay && (
                    <Link to="/workouts" className="block mt-4">
                      <button className="w-full py-2.5 bg-emerald-500 text-zinc-950 rounded-xl text-xs font-bold hover:bg-emerald-400 transition-colors shadow-[0_0_15px_rgba(16,185,129,0.25)]">
                        Start Workout
                      </button>
                    </Link>
                  )}
                </div>
              ) : (
                <div className="pt-2 border-t border-zinc-850 text-left">
                  <p className="text-xs text-zinc-500 font-medium">No workout plan loaded for today.</p>
                  <Link to="/workouts/generate" className="block mt-3">
                    <button className="w-full py-2.5 bg-emerald-500 text-zinc-950 rounded-xl text-xs font-bold hover:bg-emerald-400 transition-colors shadow-[0_0_15px_rgba(16,185,129,0.25)]">
                      Generate AI Plan
                    </button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}