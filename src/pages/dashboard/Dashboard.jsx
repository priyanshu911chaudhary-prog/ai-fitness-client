import { Dumbbell } from 'lucide-react'; // <-- Add this line

// Reusable progress bar component for macros
const MacroBar = ({ label, current, target, colorClass }) => {
  const percentage = Math.min(Math.round((current / target) * 100), 100);
  
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span className="text-zinc-400">{label}</span>
        <span className="font-medium text-zinc-200">{current}g / {target}g</span>
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
  // MOCK DATA: We'll replace this with the real API call to /dashboard later
  const mockData = {
    user: "Dev",
    bmi: 22.4,
    calories: { current: 1850, target: 2400 },
    macros: {
      protein: { current: 110, target: 150 },
      carbs: { current: 200, target: 250 },
      fats: { current: 55, target: 70 }
    },
    todayMeals: [
      { id: 1, name: "Egg Bhurji with Bread", calories: 380, protein: "22g" },
      { id: 2, name: "Masala Oats", calories: 250, protein: "8g" },
      { id: 3, name: "Sandwich with Veggies", calories: 320, protein: "12g" },
      { id: 4, name: "Mess Dinner (Protein-Rich)", calories: 600, protein: "35g" },
    ]
  };

  return (
    <div className="space-y-8 animate-[fade-in-up_0.6s_ease-out_forwards]">
      {/* Header */}
      <div className="relative">
        <div className="absolute -top-10 -left-10 w-48 h-48 bg-emerald-500/10 rounded-full blur-[80px] pointer-events-none" />
        <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-500">Welcome back, {mockData.user}</h1>
        <p className="mt-2 text-zinc-400">Here is your daily fitness and nutrition overview.</p>
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
                {mockData.calories.current} <span className="text-2xl text-zinc-500 font-medium">/ {mockData.calories.target} kcal</span>
              </div>
            </div>
          </div>
          
          <div className="relative z-10 grid grid-cols-3 gap-8 mt-4">
            <MacroBar label="Protein" current={mockData.macros.protein.current} target={mockData.macros.protein.target} colorClass="bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
            <MacroBar label="Carbs" current={mockData.macros.carbs.current} target={mockData.macros.carbs.target} colorClass="bg-teal-400 shadow-[0_0_10px_rgba(45,212,191,0.5)]" />
            <MacroBar label="Fats" current={mockData.macros.fats.current} target={mockData.macros.fats.target} colorClass="bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
          </div>
        </div>

        {/* BMI Card */}
        <div className="group relative rounded-[2rem] border border-zinc-800/60 bg-zinc-900/40 p-8 flex flex-col justify-center items-center text-center shadow-xl backdrop-blur-xl transition-all hover:border-teal-500/30 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-teal-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
          <h3 className="relative z-10 text-zinc-400 text-sm font-medium mb-4 uppercase tracking-wider">Current BMI</h3>
          <div className="relative z-10 text-6xl font-bold text-white mb-4 drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]">{mockData.bmi}</div>
          <span className="relative z-10 inline-flex items-center rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-400 border border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.2)]">
            Healthy Weight
          </span>
        </div>
      </div>

      {/* Today's Plan Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Meals List */}
        <div className="rounded-[2rem] border border-zinc-800/60 bg-zinc-900/40 p-8 shadow-xl backdrop-blur-xl">
          <div className="flex items-center justify-between mb-6 border-b border-zinc-800/50 pb-4">
            <h3 className="text-xl font-bold text-zinc-100">Today's Meal Plan</h3>
            <button className="text-sm font-medium text-teal-400 hover:text-teal-300 transition-colors">View All</button>
          </div>
          <div className="space-y-4">
            {mockData.todayMeals.map((meal) => (
              <div key={meal.id} className="group flex items-center justify-between rounded-xl bg-zinc-800/20 p-4 border border-zinc-800/50 hover:bg-zinc-800/40 hover:border-teal-500/30 transition-all duration-300">
                <div>
                  <p className="font-semibold text-zinc-200 group-hover:text-teal-400 transition-colors">{meal.name}</p>
                  <p className="text-xs text-zinc-400 mt-1">{meal.protein} Protein</p>
                </div>
                <div className="text-right font-bold text-white bg-zinc-950/50 px-3 py-1.5 rounded-lg border border-zinc-800">
                  {meal.calories} kcal
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Workout Placeholder */}
        <div className="relative rounded-[2rem] border border-zinc-800/60 bg-zinc-900/40 p-8 flex flex-col items-center justify-center text-center shadow-xl backdrop-blur-xl overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
          <div className="w-20 h-20 rounded-full bg-zinc-800/50 border border-zinc-700/50 flex items-center justify-center mb-6 shadow-inner">
            <Dumbbell className="h-10 w-10 text-zinc-500 group-hover:text-emerald-400 transition-colors duration-300" />
          </div>
          <h3 className="text-2xl font-bold text-zinc-100">No workout logged yet</h3>
          <p className="text-zinc-400 mt-2 mb-8 max-w-xs">Ready to crush your goals today? Let's get moving.</p>
          <button className="relative px-8 py-3 bg-emerald-500 text-zinc-950 rounded-full text-sm font-bold hover:bg-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.3)] hover:shadow-[0_0_25px_rgba(16,185,129,0.5)] transition-all duration-300">
            Log Workout
          </button>
        </div>
      </div>
    </div>
  );
}