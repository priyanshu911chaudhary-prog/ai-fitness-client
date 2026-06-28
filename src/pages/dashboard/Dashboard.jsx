import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Dumbbell, Utensils, Timer, Flame, Loader2, Sparkles, GlassWater, Trash2 } from 'lucide-react';
import { api } from '../../utils/api';

// Reusable progress bar component for macros
const MacroBar = ({ label, current, target, colorClass }) => {
  const percentage = target > 0 ? Math.min(Math.round((current / target) * 105), 100) : 0;
  
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

  // Selector states for target prioritization
  const [allWorkouts, setAllWorkouts] = useState([]);
  const [allMeals, setAllMeals] = useState([]);
  const [activeWorkout, setActiveWorkout] = useState(null);
  const [activeMeal, setActiveMeal] = useState(null);
  const [showWorkoutSelector, setShowWorkoutSelector] = useState(false);
  const [showMealSelector, setShowMealSelector] = useState(false);

  // Water Tracker state
  const [showWaterHistory, setShowWaterHistory] = useState(false);
  const [isEditingGoal, setIsEditingGoal] = useState(false);
  const [tempGoal, setTempGoal] = useState(2000);
  const [customAmount, setCustomAmount] = useState('');
  const [loggingWater, setLoggingWater] = useState(false);
  
  // Weight timeframe
  const [weightTimeframe, setWeightTimeframe] = useState('weekly'); // 'weekly' or 'monthly'
  const [showWeightLogger, setShowWeightLogger] = useState(false);
  const [newWeight, setNewWeight] = useState('');
  const [loggingWeight, setLoggingWeight] = useState(false);

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
          
          // Fetch choices and preferences
          try {
            const [wRes, mRes] = await Promise.all([
              api.get('/workouts/list'),
              api.get('/meals')
            ]);
            setAllWorkouts(wRes.data.data || []);
            setAllMeals(mRes.data.data || []);

            const savedWorkoutId = localStorage.getItem('active_dashboard_workout_id');
            const savedMealId = localStorage.getItem('active_dashboard_meal_id');

            if (savedWorkoutId) {
              try {
                const res = await api.get(`/workouts/${savedWorkoutId}`);
                setActiveWorkout(res.data.data.workout || res.data.data);
              } catch (e) {
                console.error("Failed to load active workout preference", e);
                localStorage.removeItem('active_dashboard_workout_id');
              }
            }
            if (savedMealId) {
              try {
                const res = await api.get(`/meals/${savedMealId}`);
                setActiveMeal(res.data.data.meal || res.data.data);
              } catch (e) {
                console.error("Failed to load active meal preference", e);
                localStorage.removeItem('active_dashboard_meal_id');
              }
            }
          } catch (err) {
            console.error("Failed to load routine preferences", err);
          }
        }
      } catch (err) {
        console.error("Dashboard error:", err);
        if (err.response?.status === 404) {
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
        <Loader2 className="h-10 w-10 text-white animate-spin" />
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
          className="px-6 py-2 bg-white text-black rounded-full font-semibold hover:bg-zinc-200 transition-colors shadow-lg"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!data) return null;

  // Destructure metrics
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

  const handleLogWeight = async (e) => {
    e.preventDefault();
    const weightVal = Number(newWeight);
    if (!weightVal || weightVal <= 0 || isNaN(weightVal)) return;

    setLoggingWeight(true);
    try {
      const heightVal = data.profile?.height || data.bmi?.height || 170;
      const res = await api.post('/bmi', { weight: weightVal, height: heightVal });
      const newRecord = res.data.data;
      
      setData(prev => {
        const trendArr = prev.bmi?.trend || [];
        const nextTrend = [...trendArr, newRecord];
        
        let nextGoalProgress = prev.goalProgress;
        if (nextGoalProgress) {
          const totalToLose = Math.abs(nextGoalProgress.startWeight - nextGoalProgress.targetWeight);
          const lost = Math.abs(nextGoalProgress.startWeight - weightVal);
          const percentage = totalToLose > 0 ? Math.min(Math.round((lost / totalToLose) * 100), 100) : 0;
          nextGoalProgress = {
            ...nextGoalProgress,
            currentWeight: weightVal,
            progressPercentage: percentage
          };
        }
        
        return {
          ...prev,
          bmi: {
            ...prev.bmi,
            current: newRecord.bmi,
            category: newRecord.category,
            weight: weightVal,
            trend: nextTrend
          },
          goalProgress: nextGoalProgress
        };
      });
      setNewWeight('');
      setShowWeightLogger(false);
    } catch (err) {
      console.error("Failed to log weight:", err);
      alert(err.response?.data?.message || "Failed to log weight");
    } finally {
      setLoggingWeight(false);
    }
  };

  // Goal progress feedback calculations
  const renderAnalysis = () => {
    if (!data.goalProgress) return null;
    
    const { startWeight, currentWeight, targetWeight } = data.goalProgress;
    const goal = data.profile?.goal || 'muscle_building';
    const delta = currentWeight - startWeight;
    const absDelta = Math.abs(delta).toFixed(1);
    
    const isWeightLossGoal = ['weight_loss', 'running', 'endurance'].includes(goal);
    
    let statusText = '';
    let statusColorClass = 'text-white border-white/10 bg-white/5';
    let feedback = '';

    if (isWeightLossGoal) {
      if (delta < 0) {
        statusText = 'On Track';
        statusColorClass = 'text-emerald-400 border-emerald-500/20 bg-emerald-500/10';
        feedback = `Great progress! You have lost ${absDelta} kg since your starting weight. Your target is ${targetWeight} kg. Keep up the consistency!`;
      } else if (delta === 0) {
        statusText = 'Starting Line';
        statusColorClass = 'text-blue-400 border-blue-500/20 bg-blue-500/10';
        feedback = `Starting weight is set at ${startWeight} kg. Maintain your calorie deficit to begin your fat loss journey.`;
      } else {
        statusText = 'Adjustment Needed';
        statusColorClass = 'text-amber-400 border-amber-500/20 bg-amber-500/10';
        feedback = `Currently ${absDelta} kg above start weight. Weight fluctuates easily due to water and glycogen. Ensure you track calories accurately.`;
      }
    } else {
      if (delta > 0) {
        statusText = 'On Track';
        statusColorClass = 'text-emerald-400 border-emerald-500/20 bg-emerald-500/10';
        feedback = `Excellent progress! You have successfully gained ${absDelta} kg. Target is ${targetWeight} kg. Hit protein goals!`;
      } else if (delta === 0) {
        statusText = 'Starting Line';
        statusColorClass = 'text-blue-400 border-blue-500/20 bg-blue-500/10';
        feedback = `Starting weight is set at ${startWeight} kg. Focus on hitting a consistent surplus with progressive overload.`;
      } else {
        statusText = 'Caloric surplus needed';
        statusColorClass = 'text-amber-400 border-amber-500/20 bg-amber-500/10';
        feedback = `Currently ${absDelta} kg below start weight. To build muscle, you need to eat in a surplus. Increase your daily meals.`;
      }
    }
    
    return { statusText, statusColorClass, feedback };
  };

  // SVG Chart calculation details - Weight trend
  const trend = data.bmi?.trend || [];
  let graphPoints = [];
  const activeTrend = weightTimeframe === 'weekly' ? trend.slice(-7) : trend.slice(-30);
  
  if (activeTrend.length > 0) {
    graphPoints = activeTrend.map((t) => ({
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

  // Weekly Charts Calculation
  const weeklyData = data.weeklyChartsData || [];
  const maxCals = Math.max(...weeklyData.map(d => Math.max(d.caloriesConsumed, d.caloriesBurned)), 2500);
  const maxWaterVal = Math.max(...weeklyData.map(d => d.waterIntake), 2500);

  return (
    <div className="space-y-8 animate-[fade-in-up_0.6s_ease-out_forwards]">
      {/* Greeting Header */}
      <div className="relative flex justify-between items-center">
        <div>
          <div className="absolute -top-10 -left-10 w-48 h-48 bg-emerald-500/10 rounded-full blur-[80px] pointer-events-none" />
          <h1 className="text-4xl font-black bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent">
            Welcome back, {data.greeting?.name || "Athlete"}
          </h1>
          <p className="mt-2 text-zinc-400">Here is your daily fitness and nutrition overview.</p>
        </div>
        <div className="text-right hidden md:block">
          <p className="text-zinc-300 font-semibold">{data.greeting?.today}</p>
          <p className="text-zinc-550 text-sm">{data.greeting?.date}</p>
        </div>
      </div>

      {/* Today's Focus & Targets */}
      {(() => {
        const todayName = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][new Date().getDay()];

        // Workout to render
        let workoutToRender = null;
        if (activeWorkout) {
          const todayPlan = activeWorkout.weeklyPlan?.find(day => day.day === todayName);
          workoutToRender = todayPlan 
            ? {
                workoutId: activeWorkout._id,
                day: todayPlan.day,
                focus: todayPlan.focus || activeWorkout.title,
                isRestDay: todayPlan.isRestDay,
                exercises: todayPlan.exercises || [],
                isCompleted: data.recentWorkouts?.some(rw => 
                  rw.workoutName === activeWorkout.title &&
                  new Date(rw.completedAt || rw.createdAt).toDateString() === new Date().toDateString()
                )
              }
            : {
                workoutId: activeWorkout._id,
                day: todayName,
                focus: activeWorkout.title,
                isRestDay: false,
                exercises: activeWorkout.exercises || [],
                isCompleted: data.recentWorkouts?.some(rw => 
                  rw.workoutName === activeWorkout.title &&
                  new Date(rw.completedAt || rw.createdAt).toDateString() === new Date().toDateString()
                )
              };
        } else {
          workoutToRender = data.todaysWorkout;
        }

        // Meal plan to render
        let mealToRender = null;
        if (activeMeal) {
          const todayPlan = activeMeal.weeklyPlan?.find(day => day.day === todayName);
          mealToRender = todayPlan
            ? {
                mealPlanId: activeMeal._id,
                day: todayPlan.day,
                meals: todayPlan.meals || [],
                dailyCalorieTarget: activeMeal.dailyCalorieTarget || 2000,
                dietPreference: activeMeal.dietPreference || "vegetarian",
              }
            : {
                mealPlanId: activeMeal._id,
                day: todayName,
                meals: activeMeal.meals || activeMeal.items?.map(it => ({
                  mealType: activeMeal.mealType || 'lunch',
                  mealName: it.foodName || it.name || activeMeal.title,
                  name: it.foodName || it.name || activeMeal.title,
                  calories: it.calories || 0
                })) || [],
                dailyCalorieTarget: activeMeal.totalCalories || activeMeal.calories || 2000,
                dietPreference: activeMeal.mealType || "lunch",
              };
        } else {
          mealToRender = data.todaysMeal;
        }

        return (
          <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Today's Workout Focus */}
            <div className="relative rounded-[2rem] border border-white/5 bg-white/[0.02] p-8 shadow-2xl backdrop-blur-2xl transition-all hover:bg-white/[0.04]">
              
              {/* Workout Selection Modal Overlay inside Card */}
              {showWorkoutSelector && (
                <div className="absolute inset-0 bg-zinc-950/95 z-30 p-6 rounded-[2rem] overflow-y-auto flex flex-col justify-between border border-white/10 animate-[fade-in_0.2s_ease-out]">
                  <div>
                    <h4 className="text-sm font-bold text-white mb-3">Prioritize Workout Target</h4>
                    <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                      <button
                        onClick={() => {
                          localStorage.removeItem('active_dashboard_workout_id');
                          setActiveWorkout(null);
                          setShowWorkoutSelector(false);
                        }}
                        className={`w-full text-left text-xs p-2.5 rounded-xl border transition-all cursor-pointer ${
                          !activeWorkout 
                            ? 'border-emerald-500 bg-emerald-500/10 text-white font-bold' 
                            : 'border-white/5 bg-white/[0.02] hover:bg-white/5 text-zinc-400'
                        }`}
                      >
                        Default (Latest Plan)
                      </button>
                      {allWorkouts.map(w => (
                        <button
                          key={w._id}
                          onClick={() => {
                            localStorage.setItem('active_dashboard_workout_id', w._id);
                            setActiveWorkout(w);
                            setShowWorkoutSelector(false);
                          }}
                          className={`w-full text-left text-xs p-2.5 rounded-xl border transition-all cursor-pointer ${
                            activeWorkout?._id === w._id 
                              ? 'border-emerald-500 bg-emerald-500/10 text-white font-bold' 
                              : 'border-white/5 bg-white/[0.02] hover:bg-white/5 text-zinc-400'
                          }`}
                        >
                          {w.title} ({w.type || 'Strength'})
                        </button>
                      ))}
                    </div>
                  </div>
                  <button 
                    onClick={() => setShowWorkoutSelector(false)}
                    className="mt-4 w-full bg-white/5 hover:bg-white/10 text-zinc-350 font-bold py-2.5 rounded-xl text-xs transition-colors cursor-pointer"
                  >
                    Close
                  </button>
                </div>
              )}

              <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-emerald-500/10 p-2.5">
                    <Dumbbell className="h-5 w-5 text-emerald-400" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white">Today's Workout</h3>
                    <div className="flex items-center gap-2 mt-0.5">
                      <p className="text-[10px] text-zinc-500">{workoutToRender?.day || "No plan active"}</p>
                      <button 
                        onClick={() => setShowWorkoutSelector(true)}
                        className="text-[9px] text-emerald-400 hover:text-emerald-300 font-bold bg-emerald-500/10 border border-emerald-500/10 px-2 py-0.5 rounded cursor-pointer transition-colors"
                      >
                        Switch target
                      </button>
                    </div>
                  </div>
                </div>
                {workoutToRender?.isCompleted ? (
                  <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full uppercase tracking-wider">
                    Completed ✅
                  </span>
                ) : workoutToRender?.isRestDay ? (
                  <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-3 py-1 rounded-full uppercase tracking-wider">
                    Rest Day 🧘
                  </span>
                ) : (
                  <span className="text-[10px] font-bold text-rose-400 bg-rose-500/10 border border-rose-500/20 px-3 py-1 rounded-full uppercase tracking-wider">
                    Pending 🔥
                  </span>
                )}
              </div>

              {workoutToRender ? (
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-semibold text-zinc-200">{workoutToRender.focus || "Recovery Focus"}</p>
                    <p className="text-xs text-zinc-500 mt-1">
                      {workoutToRender.isRestDay 
                        ? "Time to rest and let muscles recover."
                        : `${workoutToRender.exercises?.length || 0} planned movements`}
                    </p>
                  </div>
                  
                  {!workoutToRender.isRestDay && workoutToRender.exercises?.length > 0 && (
                    <div className="space-y-2 max-h-[120px] overflow-y-auto pr-1">
                      {workoutToRender.exercises.slice(0, 3).map((ex, i) => (
                        <div key={i} className="flex justify-between items-center text-xs bg-white/[0.01] border border-white/5 p-2 rounded-xl">
                          <span className="font-semibold text-zinc-350">{ex.exerciseName || ex.name}</span>
                          <span className="text-zinc-500">{ex.sets}x{ex.reps} {ex.weight > 0 ? `• ${ex.weight}kg` : ""}</span>
                        </div>
                      ))}
                      {workoutToRender.exercises.length > 3 && (
                        <p className="text-[10px] text-zinc-500 text-center">+ {workoutToRender.exercises.length - 3} more exercises</p>
                      )}
                    </div>
                  )}

                  {!workoutToRender.isRestDay && !workoutToRender.isCompleted && (
                    <div className="flex gap-3 pt-2">
                      <button
                        onClick={async () => {
                          try {
                            const totalCal = workoutToRender.exercises?.reduce((sum, ex) => sum + (ex.caloriesBurned || 0), 0) || 300;
                            await api.post(`/workouts/${workoutToRender.workoutId}/log`, {
                              duration: 45,
                              caloriesBurned: totalCal,
                            });
                            alert("Workout logged successfully!");
                            window.location.reload();
                          } catch (err) {
                            alert(err.response?.data?.message || "Failed to log workout");
                          }
                        }}
                        className="flex-1 text-center bg-emerald-500 text-black py-2.5 rounded-xl font-bold text-xs hover:bg-emerald-400 transition-colors shadow-lg hover:shadow-emerald-500/25 cursor-pointer"
                      >
                        Quick Log
                      </button>
                      <Link 
                        to={`/workouts/${workoutToRender.workoutId}`} 
                        className="flex-1 text-center bg-white/5 border border-white/10 text-zinc-350 py-2.5 rounded-xl font-bold text-xs hover:bg-white/10 transition-colors flex items-center justify-center"
                      >
                        View Details
                      </Link>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-xs text-zinc-500 py-4">No active workout split scheduled for today. Start a template from Workouts!</p>
              )}
            </div>

            {/* Today's Meal Plan Focus */}
            <div className="relative rounded-[2rem] border border-white/5 bg-white/[0.02] p-8 shadow-2xl backdrop-blur-2xl transition-all hover:bg-white/[0.04]">
              
              {/* Meal Selection Modal Overlay inside Card */}
              {showMealSelector && (
                <div className="absolute inset-0 bg-zinc-950/95 z-30 p-6 rounded-[2rem] overflow-y-auto flex flex-col justify-between border border-white/10 animate-[fade-in_0.2s_ease-out]">
                  <div>
                    <h4 className="text-sm font-bold text-white mb-3">Prioritize Nutrition Target</h4>
                    <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                      <button
                        onClick={() => {
                          localStorage.removeItem('active_dashboard_meal_id');
                          setActiveMeal(null);
                          setShowMealSelector(false);
                        }}
                        className={`w-full text-left text-xs p-2.5 rounded-xl border transition-all cursor-pointer ${
                          !activeMeal 
                            ? 'border-teal-500 bg-teal-500/10 text-white font-bold' 
                            : 'border-white/5 bg-white/[0.02] hover:bg-white/5 text-zinc-400'
                        }`}
                      >
                        Default (Latest Plan)
                      </button>
                      {allMeals.map(m => (
                        <button
                          key={m._id}
                          onClick={() => {
                            localStorage.setItem('active_dashboard_meal_id', m._id);
                            setActiveMeal(m);
                            setShowMealSelector(false);
                          }}
                          className={`w-full text-left text-xs p-2.5 rounded-xl border transition-all cursor-pointer ${
                            activeMeal?._id === m._id 
                              ? 'border-teal-500 bg-teal-500/10 text-white font-bold' 
                              : 'border-white/5 bg-white/[0.02] hover:bg-white/5 text-zinc-400'
                          }`}
                        >
                          {m.title} ({m.mealType || 'Diet'})
                        </button>
                      ))}
                    </div>
                  </div>
                  <button 
                    onClick={() => setShowMealSelector(false)}
                    className="mt-4 w-full bg-white/5 hover:bg-white/10 text-zinc-355 font-bold py-2.5 rounded-xl text-xs transition-colors cursor-pointer"
                  >
                    Close
                  </button>
                </div>
              )}

              <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-teal-500/10 p-2.5">
                    <Utensils className="h-5 w-5 text-teal-400" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white">Today's Nutrition Plan</h3>
                    <div className="flex items-center gap-2 mt-0.5">
                      <p className="text-[10px] text-zinc-500">{mealToRender?.day || "No plan active"}</p>
                      <button 
                        onClick={() => setShowMealSelector(true)}
                        className="text-[9px] text-teal-400 hover:text-teal-300 font-bold bg-teal-500/10 border border-teal-500/10 px-2 py-0.5 rounded cursor-pointer transition-colors"
                      >
                        Switch target
                      </button>
                    </div>
                  </div>
                </div>
                {data.todayNutrition?.mealsLogged >= (mealToRender?.meals?.length || 3) ? (
                  <span className="text-[10px] font-bold text-teal-400 bg-teal-500/10 border border-teal-500/20 px-3 py-1 rounded-full uppercase tracking-wider">
                    Full Plan Logged ✅
                  </span>
                ) : (
                  <span className="text-[10px] font-bold text-rose-400 bg-rose-500/10 border border-rose-500/20 px-3 py-1 rounded-full uppercase tracking-wider">
                    {Math.max(0, (mealToRender?.meals?.length || 0) - (data.todayNutrition?.mealsLogged || 0))} Pending 🍽️
                  </span>
                )}
              </div>

              {mealToRender ? (
                <div className="space-y-4">
                  <div className="flex justify-between text-xs">
                    <span className="text-zinc-400">Type / Style: <strong className="text-zinc-200 capitalize">{mealToRender.dietPreference}</strong></span>
                    <span className="text-zinc-400">Target: <strong className="text-zinc-200">{mealToRender.dailyCalorieTarget} kcal</strong></span>
                  </div>

                  <div className="space-y-2 max-h-[120px] overflow-y-auto pr-1">
                    {(mealToRender.meals || []).map((meal, idx) => {
                      return (
                        <div key={idx} className="flex justify-between items-center text-xs bg-white/[0.01] border border-white/5 p-2 rounded-xl">
                          <div>
                            <span className="font-bold text-zinc-350 capitalize">{meal.mealType}: </span>
                            <span className="text-zinc-400">{meal.mealName || meal.name}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-zinc-500 font-medium">{meal.calories} kcal</span>
                            {(() => {
                              const today = new Date().toDateString();
                              const isAlreadyLogged = data.recentMeals?.some(m => 
                                m.mealType?.toLowerCase() === meal.mealType?.toLowerCase() &&
                                new Date(m.consumedAt || m.createdAt).toDateString() === today
                              );
                              
                              return isAlreadyLogged ? (
                                <span className="text-[10px] font-bold text-teal-400 bg-teal-500/10 border border-teal-500/20 px-2.5 py-1 rounded-lg">
                                  Logged ✓
                                </span>
                              ) : (
                                <button
                                  onClick={async () => {
                                    try {
                                      await api.post(`/meals/${mealToRender.mealPlanId}/consume`, {
                                        day: mealToRender.day,
                                        mealType: meal.mealType
                                      });
                                      alert(`${meal.mealType} logged successfully!`);
                                      window.location.reload();
                                    } catch (err) {
                                      alert(err.response?.data?.message || "Failed to log meal");
                                    }
                                  }}
                                  className="px-2.5 py-1 rounded-lg bg-teal-500 hover:bg-teal-400 text-[10px] font-bold text-black transition-colors cursor-pointer"
                                >
                                  ✓ Log
                                </button>
                              );
                            })()}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="text-center">
                    <Link 
                      to={`/meals/${mealToRender.mealPlanId}`} 
                      className="inline-block text-center w-full bg-white/5 border border-white/10 text-zinc-350 py-2.5 rounded-xl font-bold text-xs hover:bg-white/10 transition-colors"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-zinc-500 py-4">No active nutrition split scheduled for today. Start a meal template from Meals library!</p>
              )}
            </div>
          </div>
        );
      })()}

      {/* Top Metrics Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {/* Activity Rings (Calorie & Macros) Card */}
        <div className="group relative rounded-[2rem] border border-white/5 bg-white/[0.02] p-8 md:col-span-2 shadow-2xl backdrop-blur-2xl transition-all hover:bg-white/[0.04] hover:border-white/10 overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/[0.01] rounded-full blur-3xl group-hover:bg-white/[0.03] transition-colors pointer-events-none" />
          
          <div className="relative z-10 flex items-center gap-3 mb-6 border-b border-white/5 pb-4">
            <h3 className="text-xl font-bold text-white">Daily Activity Rings</h3>
          </div>

          <div className="relative z-10 flex flex-col lg:flex-row items-center gap-8 lg:gap-12 py-2">
            <div className="flex justify-center items-center shrink-0">
              <svg viewBox="0 0 200 200" className="w-40 h-40 md:w-44 md:h-44 overflow-visible drop-shadow-[0_0_20px_rgba(0,0,0,0.5)]">
                <defs>
                  <linearGradient id="ringCalGradient" x1="0" y1="1" x2="0" y2="0">
                    <stop offset="0%" stopColor="#ff1358" />
                    <stop offset="100%" stopColor="#ff5b37" />
                  </linearGradient>
                  <linearGradient id="ringProtGradient" x1="0" y1="1" x2="0" y2="0">
                    <stop offset="0%" stopColor="#ff9800" />
                    <stop offset="100%" stopColor="#ffc107" />
                  </linearGradient>
                  <linearGradient id="ringCarbGradient" x1="0" y1="1" x2="0" y2="0">
                    <stop offset="0%" stopColor="#00e676" />
                    <stop offset="100%" stopColor="#00b0ff" />
                  </linearGradient>
                  <linearGradient id="ringFatsGradient" x1="0" y1="1" x2="0" y2="0">
                    <stop offset="0%" stopColor="#b200ff" />
                    <stop offset="100%" stopColor="#f50057" />
                  </linearGradient>
                </defs>

                {/* Calories Ring (Outer) */}
                <circle cx="100" cy="100" r="85" fill="none" stroke="#ff1358" strokeWidth="10" opacity="0.08" />
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

                {/* Protein Ring */}
                <circle cx="100" cy="100" r="71" fill="none" stroke="#ff9800" strokeWidth="10" opacity="0.08" />
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

                {/* Carbs Ring */}
                <circle cx="100" cy="100" r="57" fill="none" stroke="#00e676" strokeWidth="10" opacity="0.08" />
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

                {/* Fats Ring */}
                <circle cx="100" cy="100" r="43" fill="none" stroke="#b200ff" strokeWidth="10" opacity="0.08" />
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
              <div className="flex items-center gap-4 bg-white/[0.01] p-4 rounded-2xl border border-white/5">
                <div className="w-3.5 h-3.5 rounded-full bg-[#ff1358] shadow-[0_0_10px_rgba(255,19,88,0.4)] shrink-0" />
                <div>
                  <p className="text-zinc-400 text-xs font-semibold uppercase tracking-wider">Move (Calories)</p>
                  <p className="text-lg font-bold text-white mt-1">
                    {Math.round(caloriesConsumed)} <span className="text-zinc-500 text-sm font-medium">/ {Math.round(calorieTarget)} kcal</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 bg-white/[0.01] p-4 rounded-2xl border border-white/5">
                <div className="w-3.5 h-3.5 rounded-full bg-[#ff9800] shadow-[0_0_10px_rgba(255,152,0,0.4)] shrink-0" />
                <div>
                  <p className="text-zinc-400 text-xs font-semibold uppercase tracking-wider">Protein</p>
                  <p className="text-lg font-bold text-white mt-1">
                    {Math.round(proteinConsumed)}g <span className="text-zinc-500 text-sm font-medium">/ {Math.round(proteinTarget)}g</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 bg-white/[0.01] p-4 rounded-2xl border border-white/5">
                <div className="w-3.5 h-3.5 rounded-full bg-[#00e676] shadow-[0_0_10px_rgba(0,230,118,0.4)] shrink-0" />
                <div>
                  <p className="text-zinc-400 text-xs font-semibold uppercase tracking-wider">Carbs</p>
                  <p className="text-lg font-bold text-white mt-1">
                    {Math.round(carbsConsumed)}g <span className="text-zinc-500 text-sm font-medium">/ {Math.round(carbsTarget)}g</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 bg-white/[0.01] p-4 rounded-2xl border border-white/5">
                <div className="w-3.5 h-3.5 rounded-full bg-[#b200ff] shadow-[0_0_10px_rgba(178,0,255,0.4)] shrink-0" />
                <div>
                  <p className="text-zinc-400 text-xs font-semibold uppercase tracking-wider">Fats</p>
                  <p className="text-lg font-bold text-white mt-1">
                    {Math.round(fatsConsumed)}g <span className="text-zinc-500 text-sm font-medium">/ {Math.round(fatsTarget)}g</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* BMI Card */}
        <div className="group relative rounded-[2rem] border border-white/5 bg-white/[0.02] p-8 flex flex-col justify-center items-center text-center shadow-2xl backdrop-blur-2xl transition-all hover:border-white/10 hover:bg-white/[0.04] overflow-hidden">
          <h3 className="text-zinc-400 text-sm font-medium mb-4 uppercase tracking-wider">Current BMI</h3>
          <div className="text-6xl font-bold text-white mb-4 drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]">
            {bmiCurrent}
          </div>
          <span className="inline-flex items-center rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white border border-white/10">
            {bmiCategory}
          </span>
        </div>
      </div>

      {/* Goal Progress & Graph Card */}
      {data.goalProgress && (
        <div className="group relative rounded-[2rem] border border-white/5 bg-white/[0.02] p-8 shadow-2xl backdrop-blur-2xl transition-all hover:bg-white/[0.04] hover:border-white/10 overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/[0.01] rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 border-b border-white/5 pb-6">
            <div>
              <h2 className="text-xl font-bold text-white">Weight Progress Tracker</h2>
              <p className="text-sm text-zinc-400 mt-1">Real-time analysis of your weight trends based on your fitness goals.</p>
            </div>
            <div className="flex items-center gap-4 flex-wrap">
              <div className="inline-flex rounded-xl bg-white/5 p-1 border border-white/5 shrink-0">
                <button
                  onClick={() => setWeightTimeframe('weekly')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    weightTimeframe === 'weekly' ? 'bg-white text-black shadow-lg' : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  Weekly
                </button>
                <button
                  onClick={() => setWeightTimeframe('monthly')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    weightTimeframe === 'monthly' ? 'bg-white text-black shadow-lg' : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  Monthly
                </button>
              </div>

              {showWeightLogger ? (
                <form onSubmit={handleLogWeight} className="inline-flex items-center gap-1.5 bg-white/5 p-1 rounded-xl border border-white/5">
                  <input
                    type="number"
                    step="0.1"
                    placeholder="Weight (kg)"
                    value={newWeight}
                    onChange={(e) => setNewWeight(e.target.value)}
                    className="w-24 bg-black border border-white/10 rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none"
                    required
                  />
                  <button type="submit" className="px-3 py-1 bg-emerald-500 text-black font-bold text-xs rounded-lg hover:bg-emerald-400 transition-colors">
                    Log
                  </button>
                  <button type="button" onClick={() => setShowWeightLogger(false)} className="px-2 py-1 rounded-lg bg-white/5 text-zinc-350 text-xs">
                    Cancel
                  </button>
                </form>
              ) : (
                <button onClick={() => setShowWeightLogger(true)} className="px-3.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 text-zinc-300 hover:text-white text-xs font-semibold cursor-pointer">
                  Log Weight
                </button>
              )}
            </div>
          </div>

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-5 gap-8">
            <div className="lg:col-span-2 space-y-6 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-400 font-medium">Starting weight: <strong className="text-zinc-200">{data.goalProgress.startWeight} kg</strong></span>
                  <span className="text-zinc-400 font-medium">Target: <strong className="text-zinc-200">{data.goalProgress.targetWeight} kg</strong></span>
                </div>
                
                <div className="relative pt-1">
                  <div className="flex mb-2 items-center justify-between">
                    <span className="text-xs font-semibold py-1 px-2.5 uppercase rounded-full text-white bg-white/10 border border-white/10">
                      {data.goalProgress.progressPercentage}%
                    </span>
                    <span className="text-xs font-bold text-zinc-350">{data.goalProgress.currentWeight} kg current</span>
                  </div>
                  <div className="overflow-hidden h-2.5 text-xs flex rounded-full bg-zinc-950/80 border border-white/5">
                    <div 
                      style={{ width: `${data.goalProgress.progressPercentage}%` }} 
                      className="flex flex-col text-center justify-center bg-gradient-to-r from-white to-zinc-400 rounded-full transition-all duration-1000 ease-out"
                    />
                  </div>
                </div>
              </div>

              {renderAnalysis() && (
                <div className="bg-white/[0.01] border border-white/5 p-5 rounded-2xl leading-relaxed text-sm text-zinc-350">
                  <h4 className="font-bold text-white mb-1.5 text-xs uppercase tracking-wider">AI Progress Analysis</h4>
                  <p>{renderAnalysis().feedback}</p>
                </div>
              )}
            </div>

            <div className="lg:col-span-3 flex flex-col justify-end">
              <div className="bg-white/[0.01] rounded-2xl p-5 border border-white/5 shadow-inner">
                {graphPoints.length > 0 ? (
                  <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-auto overflow-visible">
                    <defs>
                      <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#00e5ff" />
                        <stop offset="100%" stopColor="#00b0ff" />
                      </linearGradient>
                      <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#00e5ff" stopOpacity="0.15" />
                        <stop offset="100%" stopColor="#00e5ff" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>

                    {fillD && <path d={fillD} fill="url(#areaGradient)" />}
                    {pathD && <path d={pathD} stroke="url(#lineGradient)" strokeWidth="3.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />}

                    {points.map((pt, idx) => (
                      <g key={idx}>
                        <circle cx={pt.x} cy={pt.y} r="5.5" fill="#00e5ff" stroke="#000" strokeWidth="2" />
                        <text x={pt.x} y={pt.y - 12} textAnchor="middle" className="text-[10px] font-bold fill-zinc-200">{pt.weight} kg</text>
                        <text x={pt.x} y={svgHeight - 8} textAnchor="middle" className="text-[9px] font-medium fill-zinc-550">{pt.date}</text>
                      </g>
                    ))}
                  </svg>
                ) : (
                  <div className="h-40 flex items-center justify-center text-center text-zinc-500 text-sm">
                    No weight records logged.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Hydration Water Card */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="rounded-[2rem] border border-white/5 bg-white/[0.02] p-6 flex flex-col justify-between">
          <div>
            <p className="text-zinc-400 text-sm uppercase tracking-wider font-medium">Calories Consumed Today</p>
            <div className="mt-3 text-4xl font-bold text-white">{Math.round(caloriesConsumed)} kcal</div>
          </div>
          <p className="mt-4 text-zinc-500 text-sm border-t border-white/5 pt-3">Target: {calorieTarget} kcal</p>
        </div>

        {/* Interactive Hydration Card */}
        <div className="rounded-[2rem] border border-white/5 bg-white/[0.02] p-6 flex flex-col justify-between min-h-[220px]">
          <div className="flex items-center justify-between border-b border-white/5 pb-2">
            <div className="flex items-center gap-2">
              <GlassWater className="h-5 w-5 text-white" />
              <span className="text-zinc-400 text-sm uppercase tracking-wider font-medium">Hydration</span>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setIsEditingGoal(true)} className="px-2 py-1 rounded-lg bg-white/5 text-zinc-300 text-xs">
                Goal: {data.todayWater?.goal || 2000}ml
              </button>
              <button onClick={() => setShowWaterHistory(!showWaterHistory)} className="px-2 py-1 rounded-lg bg-white/5 text-zinc-300 text-xs">
                Logs ({data.todayWater?.logs?.length || 0})
              </button>
            </div>
          </div>

          {isEditingGoal ? (
            <form onSubmit={handleUpdateWaterGoal} className="flex items-center gap-2 py-4">
              <input
                type="number"
                value={tempGoal}
                onChange={(e) => setTempGoal(e.target.value)}
                className="flex-1 bg-black rounded-xl border border-white/10 px-3 py-1.5 text-xs text-white"
                required
              />
              <button type="submit" className="px-3 py-1.5 bg-white text-black font-bold text-xs rounded-xl">Save</button>
              <button type="button" onClick={() => setIsEditingGoal(false)} className="px-3 py-1.5 bg-white/5 text-zinc-350 text-xs rounded-xl">Cancel</button>
            </form>
          ) : showWaterHistory ? (
            <div className="flex-1 flex flex-col py-3 overflow-y-auto max-h-[140px] pr-1">
              <div className="flex justify-between items-center mb-2">
                <span className="text-[10px] font-bold text-zinc-500 uppercase">Logs</span>
                <button className="text-xs text-white" onClick={() => setShowWaterHistory(false)}>Back</button>
              </div>
              {data.todayWater?.logs?.length > 0 ? (
                <div className="space-y-1">
                  {data.todayWater.logs.map((log) => (
                    <div key={log._id} className="flex justify-between items-center bg-white/[0.01] px-3 py-1 rounded-xl border border-white/5">
                      <span className="text-xs text-zinc-350 font-bold">{log.amount} ml</span>
                      <button onClick={() => handleDeleteWaterLog(log._id)} className="text-zinc-600 hover:text-red-400">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center py-4 text-xs text-zinc-550">No water logged.</p>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-around py-3">
              <div className="text-center">
                <span className="text-3xl font-black text-white">{data.todayWater?.totalIntake || 0} ml</span>
                <span className="block text-xs text-zinc-500 mt-1">Goal: {data.todayWater?.goal || 2000} ml</span>
              </div>
              <div className="grid grid-cols-2 gap-1 shrink-0">
                <button onClick={() => handleLogWater(250)} className="px-2.5 py-1 rounded-lg bg-white/5 text-zinc-300 text-xs font-bold hover:bg-white hover:text-black transition-colors">+250ml</button>
                <button onClick={() => handleLogWater(500)} className="px-2.5 py-1 rounded-lg bg-white/5 text-zinc-300 text-xs font-bold hover:bg-white hover:text-black transition-colors">+500ml</button>
              </div>
            </div>
          )}
        </div>

        <div className="rounded-[2rem] border border-white/5 bg-white/[0.02] p-6 flex flex-col justify-between">
          <div>
            <p className="text-zinc-400 text-sm uppercase tracking-wider font-medium">Calories Burned Today</p>
            <div className="mt-3 text-4xl font-bold text-white">{Math.round(caloriesBurned)} kcal</div>
          </div>
          <p className="mt-4 text-zinc-500 text-sm border-t border-white/5 pt-3">Workouts logged: {data.todayNutrition?.workoutsLogged || 0}</p>
        </div>
      </div>

      {/* Weekly Charts: Hydration & Calories */}
      {weeklyData.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Weekly Calorie Intake vs Burn Chart */}
          <div className="rounded-[2rem] border border-white/5 bg-white/[0.02] p-6 shadow-xl">
            <h3 className="text-base font-bold text-white mb-4">Weekly Calories Intake vs Burn</h3>
            <svg viewBox="0 0 500 180" className="w-full h-auto overflow-visible">
              {/* Daily Bars */}
              {weeklyData.map((d, i) => {
                const x = 50 + i * 65;
                const intakeH = (d.caloriesConsumed / maxCals) * 110;
                const burnH = (d.caloriesBurned / maxCals) * 110;
                return (
                  <g key={i}>
                    {/* Consumed Bar */}
                    <rect x={x - 12} y={130 - intakeH} width="10" height={intakeH} fill="#00e676" rx="3" opacity="0.8" />
                    {/* Burned Bar */}
                    <rect x={x + 2} y={130 - burnH} width="10" height={burnH} fill="#ff1358" rx="3" opacity="0.8" />
                    
                    <text x={x} y="150" textAnchor="middle" className="text-[10px] font-bold fill-zinc-400">{d.day}</text>
                    <text x={x} y="165" textAnchor="middle" className="text-[8px] fill-zinc-550">{d.date}</text>
                  </g>
                );
              })}
            </svg>
            <div className="flex gap-4 justify-center mt-2 text-xs">
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-[#00e676]" /> Consumed</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-[#ff1358]" /> Burned</span>
            </div>
          </div>

          {/* Weekly Hydration levels */}
          <div className="rounded-[2rem] border border-white/5 bg-white/[0.02] p-6 shadow-xl">
            <h3 className="text-base font-bold text-white mb-4">Weekly Hydration (ml)</h3>
            <svg viewBox="0 0 500 180" className="w-full h-auto overflow-visible">
              {weeklyData.map((d, i) => {
                const x = 50 + i * 65;
                const waterH = (d.waterIntake / maxWaterVal) * 110;
                return (
                  <g key={i}>
                    <rect x={x - 10} y={130 - waterH} width="20" height={waterH} fill="#00e5ff" rx="4" opacity="0.8" />
                    <text x={x} y={120 - waterH} textAnchor="middle" className="text-[9px] font-bold fill-zinc-200">{d.waterIntake} ml</text>
                    <text x={x} y="150" textAnchor="middle" className="text-[10px] font-bold fill-zinc-400">{d.day}</text>
                  </g>
                );
              })}
            </svg>
          </div>
        </div>
      )}

      {/* Recent Workouts and Recent Meals */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Recent Workouts */}
        <div className="group rounded-[2rem] border border-white/5 bg-white/[0.02] p-8 shadow-2xl backdrop-blur-2xl transition-all hover:bg-white/[0.04] hover:border-white/10 overflow-hidden">
          <div className="flex items-center justify-between mb-6 border-b border-white/5 pb-4">
            <div>
              <h3 className="text-xl font-bold text-white">Recent Workouts</h3>
              <p className="text-sm text-zinc-550 mt-1">Your last 5 logged workout sessions.</p>
            </div>
            <Link to="/workouts/history" className="text-sm font-medium text-emerald-400 hover:text-emerald-300 transition-colors">
              View History
            </Link>
          </div>
          <div className="space-y-3">
            {data.recentWorkouts?.length > 0 ? (
              data.recentWorkouts.map((workout, index) => (
                <div key={index} className="flex flex-col gap-3 rounded-xl bg-white/[0.01] p-5 border border-white/5 hover:border-white/10 hover:bg-white/[0.02] transition-all">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-semibold text-zinc-150 text-base">{workout.workoutName}</p>
                      <p className="text-xs text-zinc-500 mt-1 uppercase tracking-wider font-medium">
                        {workout.workoutType} • {new Date(workout.completedAt || workout.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                      </p>
                    </div>
                    <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-lg">
                      {workout.completionPercentage || 100}% Done
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-2 py-1 text-xs border-t border-b border-white/[0.03] my-1 text-zinc-400">
                    <div>
                      <span className="text-[10px] text-zinc-500 block uppercase font-bold">Duration</span>
                      <span className="font-semibold text-zinc-200">{workout.duration} min</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-zinc-500 block uppercase font-bold">Burned</span>
                      <span className="font-semibold text-rose-500">{workout.caloriesBurned} kcal</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-zinc-500 block uppercase font-bold">Movements</span>
                      <span className="font-semibold text-zinc-200">{workout.exercises?.length || 0} exercises</span>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Link 
                      to={`/workouts/history?search=${encodeURIComponent(workout.workoutName)}`} 
                      className="px-3 py-1 bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white rounded-lg text-xs font-bold transition-all border border-white/5"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-zinc-500 text-xs py-4 text-center">No workouts completed yet.</p>
            )}
          </div>
        </div>

        {/* Recent Meals */}
        <div className="group rounded-[2rem] border border-white/5 bg-white/[0.02] p-8 shadow-2xl backdrop-blur-2xl transition-all hover:bg-white/[0.04] hover:border-white/10 overflow-hidden">
          <div className="flex items-center justify-between mb-6 border-b border-white/5 pb-4">
            <div>
              <h3 className="text-xl font-bold text-white">Recent Meals</h3>
              <p className="text-sm text-zinc-550 mt-1">Your last 5 logged meal entries.</p>
            </div>
            <Link to="/meals/history" className="text-sm font-medium text-emerald-400 hover:text-emerald-300 transition-colors">
              View History
            </Link>
          </div>
          <div className="space-y-3">
            {data.recentMeals?.length > 0 ? (
              data.recentMeals.map((meal, index) => (
                <div key={index} className="flex flex-col gap-3 rounded-xl bg-white/[0.01] p-5 border border-white/5 hover:border-white/10 hover:bg-white/[0.02] transition-all">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-semibold text-zinc-150 text-base">{meal.mealName}</p>
                      <p className="text-xs text-zinc-500 mt-1 uppercase tracking-wider font-medium">
                        <span className="capitalize">{meal.mealType}</span> • {new Date(meal.consumedAt || meal.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                      </p>
                    </div>
                    <span className="text-[10px] text-zinc-500 bg-white/5 px-2 py-0.5 rounded border border-white/5">
                      {new Date(meal.consumedAt || meal.createdAt).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <div className="grid grid-cols-4 gap-2 py-1 border-t border-b border-white/[0.03] my-1 text-xs text-zinc-400">
                    <div>
                      <span className="text-[10px] text-zinc-500 block uppercase font-bold">Calories</span>
                      <span className="font-semibold text-white">{Math.round(meal.totalCalories)} kcal</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-zinc-500 block uppercase font-bold">Protein</span>
                      <span className="font-semibold text-blue-400">{Math.round(meal.totalProtein || 0)}g</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-zinc-500 block uppercase font-bold">Carbs</span>
                      <span className="font-semibold text-amber-400">{Math.round(meal.totalCarbs || 0)}g</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-zinc-500 block uppercase font-bold">Fat</span>
                      <span className="font-semibold text-red-400">{Math.round(meal.totalFat || 0)}g</span>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Link 
                      to={`/meals/history?search=${encodeURIComponent(meal.mealName)}`} 
                      className="px-3 py-1 bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white rounded-lg text-xs font-bold transition-all border border-white/5"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-zinc-500 text-xs py-4 text-center">No meals logged yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}