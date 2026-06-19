import { Link } from 'react-router-dom';
import { Plus, Sparkles, Dumbbell, Timer, Flame } from 'lucide-react';
import { Button } from '../../components/ui/Button';

export default function Workouts() {
  // MOCK DATA: Populating with realistic gym routines
  const workoutsList = [
    { id: 1, name: "Push Day: Chest & Triceps", duration: 60, calories: 450, type: "Strength", exercises: 6 },
    { id: 2, name: "Pull Day: Back & Biceps", duration: 60, calories: 420, type: "Strength", exercises: 6 },
    { id: 3, name: "Leg Day: Quads & Glutes", duration: 75, calories: 550, type: "Strength", exercises: 5 },
    { id: 4, name: "HIIT Cardio Blast", duration: 30, calories: 400, type: "Cardio", exercises: 8 },
    { id: 5, name: "Active Recovery & Core", duration: 45, calories: 200, type: "Flexibility", exercises: 10 },
  ];

  return (
    <div className="space-y-8 animate-[fade-in-up_0.6s_ease-out_forwards]">
      {/* Header Actions */}
      <div className="relative flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div className="absolute -top-10 -left-10 w-48 h-48 bg-emerald-500/10 rounded-full blur-[80px] pointer-events-none" />
        <div className="relative z-10">
          <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-500">Workouts Library</h1>
          <p className="mt-2 text-zinc-400">Manage your training splits and routines.</p>
        </div>
        <div className="relative z-10 flex gap-4 w-full sm:w-auto">
          {/* Wrap the button in a Link to point to /workouts/generate */}
          <Link to="/workouts/generate" className="flex-1 sm:flex-none">
            <Button variant="outline" className="w-full gap-2">
              <Sparkles className="h-4 w-4 text-emerald-400" />
              AI Generator
            </Button>
          </Link>
          <Link to="/workouts/create" className="flex-1 sm:flex-none">
            <Button className="w-full gap-2">
              <Plus className="h-4 w-4" />
              Add Workout
            </Button>
          </Link>
        </div>
      </div>

      {/* Workouts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {workoutsList.map((workout) => (
          <div key={workout.id} className="group relative rounded-[2rem] border border-zinc-800/60 bg-zinc-900/40 p-6 shadow-xl backdrop-blur-xl transition-all hover:border-emerald-500/30 overflow-hidden cursor-pointer hover:-translate-y-1">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl group-hover:bg-emerald-500/10 transition-colors pointer-events-none" />
            <div className="relative z-10 flex justify-between items-start mb-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-zinc-800/50 group-hover:bg-emerald-500/10 group-hover:text-emerald-400 transition-colors border border-zinc-700/50">
                  <Dumbbell className="h-6 w-6 text-emerald-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-zinc-100">{workout.name}</h3>
                  <span className="text-xs text-emerald-500">{workout.type}</span>
                </div>
              </div>
            </div>

            <div className="relative z-10 grid grid-cols-3 gap-2 text-center bg-zinc-950/50 rounded-xl p-3 border border-zinc-800/50">
              <div className="flex flex-col items-center">
                <Timer className="h-4 w-4 text-emerald-500/70 mb-1" />
                <p className="font-semibold text-zinc-200">{workout.duration}m</p>
              </div>
              <div className="flex flex-col items-center border-l border-r border-zinc-800/50">
                <Flame className="h-4 w-4 text-orange-500 mb-1" />
                <p className="font-semibold text-zinc-200">{workout.calories}</p>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-xs text-zinc-500 mb-1 block h-4">Exs</span>
                <p className="font-semibold text-zinc-200">{workout.exercises}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}