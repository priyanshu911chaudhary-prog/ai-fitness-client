import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Dumbbell, Utensils, Timer, Flame, Loader2, Sparkles } from 'lucide-react';
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
  const proteinTarget = Math.round((calorieTarget * 0.30) / 4);
  const carbsTarget = Math.round((calorieTarget * 0.45) / 4);
  const fatsTarget = Math.round((calorieTarget * 0.25) / 9);

  const caloriesConsumed = data.todayNutrition?.caloriesConsumed || 0;
  const caloriesBurned = data.todayNutrition?.caloriesBurned || 0;
  const bmiCurrent = data.bmi?.current ? Number(data.bmi.current).toFixed(1) : "N/A";
  const bmiCategory = data.bmi?.category || "Not Calculated";

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
        {/* Calorie Card */}
        <div className="group relative rounded-[2rem] border border-zinc-800/60 bg-zinc-900/40 p-8 md:col-span-2 shadow-xl backdrop-blur-xl transition-all hover:border-emerald-500/30 overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl group-hover:bg-emerald-500/10 transition-colors pointer-events-none" />
          <div className="relative z-10 flex items-end justify-between mb-8">
            <div>
              <h3 className="text-zinc-400 text-sm font-medium uppercase tracking-wider">Calories Today</h3>
              <div className="mt-2 text-5xl font-bold text-white">
                {Math.round(caloriesConsumed)} <span className="text-2xl text-zinc-500 font-medium">/ {Math.round(calorieTarget)} kcal</span>
              </div>
            </div>
          </div>
          
          <div className="relative z-10 grid grid-cols-3 gap-8 mt-4">
            <MacroBar 
              label="Protein" 
              current={data.todayNutrition?.macros?.protein || 0} 
              target={proteinTarget} 
              colorClass="bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" 
            />
            <MacroBar 
              label="Carbs" 
              current={data.todayNutrition?.macros?.carbs || 0} 
              target={carbsTarget} 
              colorClass="bg-teal-400 shadow-[0_0_10px_rgba(45,212,191,0.5)]" 
            />
            <MacroBar 
              label="Fats" 
              current={data.todayNutrition?.macros?.fats || 0} 
              target={fatsTarget} 
              colorClass="bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]" 
            />
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

      {/* Burn/Intake Summary */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="rounded-[2rem] border border-zinc-800/60 bg-zinc-900/40 p-6 shadow-xl backdrop-blur-xl">
          <p className="text-zinc-400 text-sm uppercase tracking-wider font-medium">Calories Consumed Today</p>
          <div className="mt-3 text-4xl font-bold text-white">{Math.round(caloriesConsumed)} kcal</div>
          <p className="mt-2 text-zinc-500 text-sm">Meals logged: {data.todayNutrition?.mealsLogged || 0}</p>
        </div>
        <div className="rounded-[2rem] border border-zinc-800/60 bg-zinc-900/40 p-6 shadow-xl backdrop-blur-xl">
          <p className="text-zinc-400 text-sm uppercase tracking-wider font-medium">Calories Burned Today</p>
          <div className="mt-3 text-4xl font-bold text-white">{Math.round(caloriesBurned)} kcal</div>
          <p className="mt-2 text-zinc-500 text-sm">Workout logs: {data.todayNutrition?.workoutsLogged || 0}</p>
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

        {/* Workout Info */}
        <div className="relative rounded-[2rem] border border-zinc-800/60 bg-zinc-900/40 p-8 flex flex-col items-center justify-center text-center shadow-xl backdrop-blur-xl overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
          
          {data.todaysWorkout ? (
            <div className="w-full h-full flex flex-col items-center justify-center">
              <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-4">
                <Dumbbell className="h-8 w-8 text-emerald-400" />
              </div>
              <h3 className="text-2xl font-bold text-zinc-100">
                {data.todaysWorkout.isRestDay ? "Rest Day" : data.todaysWorkout.focus || "Today's Workout"}
              </h3>
              <p className="text-zinc-400 mt-2 mb-6">
                {data.todaysWorkout.isRestDay 
                  ? "Take some time to recover and recharge." 
                  : `${data.todaysWorkout.exercises?.length || 0} exercises planned for today.`}
              </p>
              
              {!data.todaysWorkout.isRestDay && (
                <div className="flex gap-4">
                  <Link to="/workouts">
                    <button className="px-6 py-2 bg-emerald-500 text-zinc-950 rounded-full text-sm font-bold hover:bg-emerald-400 transition-colors shadow-[0_0_15px_rgba(16,185,129,0.3)]">
                      Start Workout
                    </button>
                  </Link>
                </div>
              )}
            </div>
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center">
              <div className="w-20 h-20 rounded-full bg-zinc-800/50 border border-zinc-700/50 flex items-center justify-center mb-6 shadow-inner">
                <Dumbbell className="h-10 w-10 text-zinc-500 group-hover:text-emerald-400 transition-colors duration-300" />
              </div>
              <h3 className="text-2xl font-bold text-zinc-100">No workout plan loaded</h3>
              <p className="text-zinc-400 mt-2 mb-8 max-w-xs">Ready to crush your goals today? Let's design a training block.</p>
              <Link to="/workouts/generate">
                <button className="relative px-8 py-3 bg-emerald-500 text-zinc-950 rounded-full text-sm font-bold hover:bg-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.3)] hover:shadow-[0_0_25px_rgba(16,185,129,0.5)] transition-all duration-300">
                  Generate AI Workout
                </button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}