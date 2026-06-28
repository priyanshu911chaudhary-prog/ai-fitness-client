import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Sparkles, Dumbbell, Timer, Flame, Trash2, Loader2, Play, Copy, Edit, Eye } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { api } from '../../utils/api';

export default function Workouts() {
  const navigate = useNavigate();
  const [workouts, setWorkouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isLoggingId, setIsLoggingId] = useState(null);

  const fetchWorkouts = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get('/workouts/list');
      setWorkouts(res.data.data || []);
    } catch (err) {
      console.error("Failed to load workouts:", err);
      setError(err.response?.data?.message || "Failed to load workouts library.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkouts();
  }, []);

  const handleDeleteWorkout = async (e, workoutId) => {
    e.stopPropagation();
    if (!window.confirm("Are you sure you want to delete this workout routine?")) return;
    try {
      await api.delete(`/workouts/${workoutId}`);
      setWorkouts(prev => prev.filter(w => w._id !== workoutId));
    } catch (err) {
      console.error("Failed to delete workout:", err);
      alert("Failed to delete workout. Please try again.");
    }
  };

  const handleDuplicateWorkout = async (e, workout) => {
    e.stopPropagation();
    try {
      setLoading(true);
      const detailRes = await api.get(`/workouts/${workout._id}`);
      const detail = detailRes.data.data;
      const fullWorkout = detail.workout || detail;
      const fullExercises = detail.exercises || fullWorkout.exercises || [];

      const payload = {
        title: `${fullWorkout.title} (Copy)`,
        description: fullWorkout.description || "Full Body",
        duration: Number(fullWorkout.duration) || 60,
        difficulty: fullWorkout.difficulty || "intermediate",
        goal: fullWorkout.goal || "Build Muscle",
        type: fullWorkout.type || "Strength",
        notes: fullWorkout.notes || "",
        exercises: fullExercises.map(ex => ({
          exerciseName: ex.exerciseName || ex.name,
          sets: Number(ex.sets) || 3,
          reps: Number(ex.reps) || 10,
          weight: Number(ex.weight) || 0,
          restTime: Number(ex.restTime) || 60,
          caloriesBurned: Number(ex.caloriesBurned) || 50,
          notes: ex.notes || ""
        }))
      };

      await api.post('/workouts', payload);
      alert("Workout duplicated successfully!");
      fetchWorkouts();
    } catch (err) {
      console.error("Failed to duplicate workout:", err);
      alert(err.response?.data?.message || "Failed to duplicate workout.");
      setLoading(false);
    }
  };

  const handleStartWorkout = async (e, workout) => {
    e.stopPropagation();
    try {
      setIsLoggingId(workout._id);
      const detailRes = await api.get(`/workouts/${workout._id}`);
      const detail = detailRes.data.data;
      const fullWorkout = detail.workout || detail;
      const fullExercises = detail.exercises || fullWorkout.exercises || [];
      const totalCalories = fullExercises.reduce((sum, ex) => sum + (ex.caloriesBurned || 0), 0) || 300;

      await api.post(`/workouts/${workout._id}/log`, {
        duration: fullWorkout.duration || 60,
        caloriesBurned: totalCalories,
      });
      alert(`Workout "${fullWorkout.title}" logged successfully! Go check Workout History.`);
      fetchWorkouts(); // Refresh to update status
    } catch (err) {
      console.error("Failed to start workout:", err);
      alert(err.response?.data?.message || "Failed to start workout.");
    } finally {
      setIsLoggingId(null);
    }
  };

  return (
    <div className="space-y-8 animate-[fade-in-up_0.6s_ease-out_forwards]">
      {/* Header Actions */}
      <div className="relative flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div className="absolute -top-10 -left-10 w-48 h-48 bg-emerald-500/10 rounded-full blur-[80px] pointer-events-none" />
        <div className="relative z-10">
          <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white via-zinc-200 to-zinc-400">Workouts Library</h1>
          <p className="mt-2 text-zinc-400">Manage your training splits and routines.</p>
        </div>
        <div className="relative z-10 flex gap-3 w-full sm:w-auto flex-wrap">
          <Link to="/workouts/history" className="flex-1 sm:flex-none">
            <Button variant="outline" className="w-full gap-2 hover:bg-white/5">
              History
            </Button>
          </Link>
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

      {loading ? (
        <div className="flex h-[30vh] flex-col items-center justify-center gap-4">
          <Loader2 className="h-8 w-8 text-emerald-400 animate-spin" />
          <p className="text-zinc-500">Loading workouts...</p>
        </div>
      ) : error ? (
        <div className="text-center py-10">
          <p className="text-red-400">{error}</p>
          <Button onClick={fetchWorkouts} className="mt-4">Retry</Button>
        </div>
      ) : workouts.length === 0 ? (
        <div className="text-center py-20 bg-white/[0.02] border border-white/5 rounded-[2rem] backdrop-blur-2xl">
          <Dumbbell className="h-12 w-12 text-zinc-500 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-zinc-300">No workouts logged yet</h3>
          <p className="text-zinc-400 mt-1 mb-6">Create a custom workout or let the AI Architect generate a personalized weekly split.</p>
          <div className="flex gap-4 justify-center">
            <Link to="/workouts/create">
              <Button size="sm">Create Custom Workout</Button>
            </Link>
            <Link to="/workouts/generate">
              <Button size="sm" variant="outline">Generate AI Workout</Button>
            </Link>
          </div>
        </div>
      ) : (
        /* Workouts Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {workouts.map((workout) => {
            const muscleGroup = workout.description || "Full Body";
            const exercisesCount = workout.exercises?.length || workout.exerciseCount || 0;
            const isCompletedToday = workout.lastPerformed && new Date(workout.lastPerformed).toDateString() === new Date().toDateString();
            
            const caloriesBurned = workout.exercises && workout.exercises.length > 0
              ? workout.exercises.reduce((sum, ex) => sum + (ex.caloriesBurned || 0), 0)
              : workout.caloriesBurned || 300;

            return (
              <div
                key={workout._id}
                role="button"
                tabIndex={0}
                onClick={() => navigate(`/workouts/${workout._id}`)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    navigate(`/workouts/${workout._id}`);
                  }
                }}
                className="group relative flex flex-col justify-between rounded-[2rem] border border-white/5 bg-white/[0.02] p-6 shadow-2xl backdrop-blur-2xl transition-all hover:bg-white/[0.04] hover:border-white/10 overflow-hidden cursor-pointer hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 min-h-[220px]"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl group-hover:bg-emerald-500/10 transition-colors pointer-events-none" />
                
                <div>
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-white/5 group-hover:bg-emerald-500/10 group-hover:text-emerald-400 transition-colors border border-white/5">
                        <Dumbbell className="h-5 w-5 text-emerald-400" />
                      </div>
                      <div>
                        <h3 className="font-bold text-zinc-150 text-base group-hover:text-white transition-colors">{workout.title}</h3>
                        <div className="flex flex-wrap gap-1.5 mt-1">
                          <span className="text-[9px] font-bold uppercase tracking-wider text-zinc-400 bg-white/5 px-2 py-0.5 rounded border border-white/5">{workout.type || "Strength"}</span>
                          <span className="text-[9px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/10">{muscleGroup}</span>
                          <span className="text-[9px] font-bold uppercase tracking-wider text-zinc-450 bg-white/5 px-2 py-0.5 rounded border border-white/5 capitalize">{workout.difficulty || "intermediate"}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Horizontal Stats Strip */}
                  <div className="grid grid-cols-3 gap-2 py-3 px-4 bg-black/40 rounded-xl border border-white/5 mt-4 text-center text-xs">
                    <div>
                      <span className="text-[10px] text-zinc-500 block uppercase font-bold">Duration</span>
                      <span className="font-semibold text-zinc-200">{workout.duration || 60}m</span>
                    </div>
                    <div className="border-l border-r border-white/5">
                      <span className="text-[10px] text-zinc-500 block uppercase font-bold">Burn</span>
                      <span className="font-semibold text-rose-450">{caloriesBurned} kcal</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-zinc-500 block uppercase font-bold">Movements</span>
                      <span className="font-semibold text-zinc-200">{exercisesCount} ex</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-white/5 flex flex-wrap gap-2 justify-between items-center z-10">
                  <div className="flex gap-1">
                    <button
                      title="View workout"
                      onClick={(e) => { e.stopPropagation(); navigate(`/workouts/${workout._id}`); }}
                      className="p-1.5 rounded-lg bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10 transition-colors border border-white/5 cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                    <button
                      title="Edit workout"
                      onClick={(e) => { e.stopPropagation(); navigate(`/workouts/edit/${workout._id}`); }}
                      className="p-1.5 rounded-lg bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10 transition-colors border border-white/5 cursor-pointer"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      title="Duplicate workout"
                      onClick={(e) => handleDuplicateWorkout(e, workout)}
                      className="p-1.5 rounded-lg bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10 transition-colors border border-white/5 cursor-pointer"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    <button
                      title="Delete workout"
                      onClick={(e) => handleDeleteWorkout(e, workout._id)}
                      className="p-1.5 rounded-lg bg-white/5 text-zinc-500 hover:text-red-400 hover:bg-red-500/10 transition-colors border border-white/5 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {isCompletedToday ? (
                    <span className="px-3.5 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold flex items-center gap-1 select-none">
                      ✓ Completed
                    </span>
                  ) : (
                    <button
                      disabled={isLoggingId === workout._id}
                      onClick={(e) => handleStartWorkout(e, workout)}
                      className="px-3.5 py-1.5 rounded-lg bg-emerald-500 text-black text-xs font-bold hover:bg-emerald-400 transition-all flex items-center gap-1 disabled:opacity-50 cursor-pointer shadow-lg shadow-emerald-500/20"
                    >
                      <Play className="w-3 h-3 fill-current" />
                      {isLoggingId === workout._id ? '...' : 'Log'}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}