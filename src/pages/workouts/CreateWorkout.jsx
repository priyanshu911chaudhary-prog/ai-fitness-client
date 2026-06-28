import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft, Trash2, Copy, ArrowUp, ArrowDown, Plus, ChevronDown } from 'lucide-react';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { api } from '../../utils/api';

export default function CreateWorkout() {
  const navigate = useNavigate();
  const { id } = useParams(); // URL parameter for Edit mode
  const [isLoading, setIsLoading] = useState(false);

  // Workout details
  const [name, setName] = useState('');
  const [goal, setGoal] = useState('Build Muscle');
  const [type, setType] = useState('Strength');
  const [difficulty, setDifficulty] = useState('intermediate');
  const [duration, setDuration] = useState(60);
  const [notes, setNotes] = useState('');
  const [muscleGroup, setMuscleGroup] = useState('Full Body');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  // Exercises list
  const [exercises, setExercises] = useState([
    { exerciseName: '', sets: 3, reps: 10, weight: 0, restTime: 60, caloriesBurned: 50, notes: '' }
  ]);

  // Load existing workout if in edit mode
  useEffect(() => {
    if (id) {
      const fetchWorkoutForEdit = async () => {
        try {
          setIsLoading(true);
          const res = await api.get(`/workouts/${id}`);
          const data = res.data.data;
          const workout = data.workout || data;
          setName(workout.title || '');
          setGoal(workout.goal || 'Build Muscle');
          setType(workout.type || 'Strength');
          setDifficulty(workout.difficulty || 'intermediate');
          setDuration(workout.duration || 60);
          setNotes(workout.notes || '');
          setMuscleGroup(workout.description || 'Full Body');
          if (workout.date) {
            setDate(new Date(workout.date).toISOString().split('T')[0]);
          }
          const loadedExercises = data.exercises || workout.exercises || [];
          if (loadedExercises.length > 0) {
            setExercises(loadedExercises.map(ex => ({
              exerciseName: ex.exerciseName || ex.name || '',
              sets: Number(ex.sets) || 3,
              reps: Number(ex.reps) || 10,
              weight: Number(ex.weight) || 0,
              restTime: Number(ex.restTime) || 60,
              caloriesBurned: Number(ex.caloriesBurned) || 50,
              notes: ex.notes || ''
            })));
          }
        } catch (err) {
          console.error("Failed to load workout details:", err);
          alert("Failed to load workout details for editing.");
        } finally {
          setIsLoading(false);
        }
      };
      fetchWorkoutForEdit();
    }
  }, [id]);

  // Calculate total calories dynamically
  const calculatedCalories = exercises.reduce((sum, ex) => sum + (Number(ex.caloriesBurned) || 0), 0);

  // Operations on exercises
  const handleAddExercise = () => {
    setExercises(prev => [...prev, { exerciseName: '', sets: 3, reps: 10, weight: 0, restTime: 60, caloriesBurned: 50, notes: '' }]);
  };

  const handleRemoveExercise = (index) => {
    if (exercises.length === 1) return;
    setExercises(prev => prev.filter((_, i) => i !== index));
  };

  const handleDuplicateExercise = (index) => {
    const itemToDuplicate = { ...exercises[index] };
    setExercises(prev => {
      const updated = [...prev];
      updated.splice(index + 1, 0, itemToDuplicate);
      return updated;
    });
  };

  const handleMoveUp = (index) => {
    if (index === 0) return;
    setExercises(prev => {
      const updated = [...prev];
      const temp = updated[index];
      updated[index] = updated[index - 1];
      updated[index - 1] = temp;
      return updated;
    });
  };

  const handleMoveDown = (index) => {
    if (index === exercises.length - 1) return;
    setExercises(prev => {
      const updated = [...prev];
      const temp = updated[index];
      updated[index] = updated[index + 1];
      updated[index + 1] = temp;
      return updated;
    });
  };

  const handleExerciseChange = (index, field, value) => {
    setExercises(prev => prev.map((ex, i) => {
      if (i === index) {
        return {
          ...ex,
          [field]: field === 'exerciseName' || field === 'notes' ? value : Number(value)
        };
      }
      return ex;
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      alert("Workout Name is required");
      return;
    }

    // Filter out blank exercise rows
    const validExercises = exercises.filter(ex => ex.exerciseName.trim() !== '');
    if (validExercises.length === 0) {
      alert("Please add at least one exercise with a name.");
      return;
    }

    setIsLoading(true);
    try {
      const payload = {
        title: name,
        description: muscleGroup, // Map muscleGroup to description to store Target Muscle Group in DB
        duration: Number(duration),
        difficulty,
        goal,
        type,
        notes,
        date: new Date(date),
        exercises: validExercises
      };

      if (id) {
        // Edit mode
        await api.put(`/workouts/${id}`, payload);
        alert("Workout updated successfully!");
      } else {
        // Create mode
        await api.post('/workouts', payload);
        alert("Workout created successfully!");
      }
      navigate('/workouts');
    } catch (err) {
      console.error("Failed to save workout:", err);
      alert(err.response?.data?.message || "Failed to save workout. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-[fade-in-up_0.6s_ease-out_forwards]">
      <button 
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-sm font-medium text-zinc-400 hover:text-emerald-400 transition-colors cursor-pointer"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Workouts
      </button>

      <div className="relative rounded-[2rem] border border-zinc-800/60 bg-zinc-900/40 p-8 shadow-xl backdrop-blur-xl overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
        <h1 className="relative z-10 text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-500 mb-8">
          {id ? 'Modify Workout Split' : 'Design Workout Routine'}
        </h1>
        
        <form onSubmit={handleSubmit} className="space-y-8 relative z-10">
          
          {/* General Routine Metadata */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Input 
              label="Workout Name"
              placeholder="e.g., Pull Day Focus"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            
            <div className="flex flex-col space-y-1.5 w-full">
              <label className="text-sm font-medium text-zinc-300">Workout Type</label>
              <div className="relative">
                <select 
                  className="flex h-11 w-full rounded-xl border border-zinc-800/80 bg-zinc-900/50 backdrop-blur-md px-4 py-2 text-base md:text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all duration-300 appearance-none pr-10"
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                >
                  <option value="Strength">Strength</option>
                  <option value="Cardio">Cardio</option>
                  <option value="Flexibility">Flexibility</option>
                  <option value="Hybrid">Hybrid</option>
                </select>
                <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 pointer-events-none" />
              </div>
            </div>

            <div className="flex flex-col space-y-1.5 w-full">
              <label className="text-sm font-medium text-zinc-300">Difficulty</label>
              <div className="relative">
                <select 
                  className="flex h-11 w-full rounded-xl border border-zinc-800/80 bg-zinc-900/50 backdrop-blur-md px-4 py-2 text-base md:text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all duration-300 appearance-none pr-10"
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
                <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 pointer-events-none" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 pt-6 border-t border-zinc-800/50">
            <Input 
              label="Goal Description"
              placeholder="e.g., hypertrophy, fat burn"
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
            />
            <Input 
              label="Target Muscle Group"
              placeholder="e.g., Chest, Back, Legs"
              value={muscleGroup}
              onChange={(e) => setMuscleGroup(e.target.value)}
            />
            <Input 
              label="Est. Duration (minutes)"
              type="number"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              required
            />
            <div className="flex flex-col space-y-1.5">
              <label className="text-sm font-medium text-zinc-300">Est. Calories Burned</label>
              <div className="flex h-11 items-center px-4 rounded-xl border border-zinc-800/80 bg-zinc-900/20 text-zinc-400 text-sm">
                {calculatedCalories} kcal (auto-summed)
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-zinc-800/50">
            <Input 
              label="Workout Date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>

          {/* Exercises List Redesign */}
          <div className="space-y-4 pt-8 border-t border-zinc-800/50">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-zinc-200">Routine Exercises</h2>
              <button 
                type="button"
                onClick={handleAddExercise}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 text-emerald-400 text-xs font-bold transition-all cursor-pointer"
              >
                <Plus className="h-4 w-4" />
                Add Exercise
              </button>
            </div>

            <div className="space-y-4">
              {exercises.map((ex, index) => (
                <div 
                  key={index}
                  className="bg-black/20 rounded-2xl border border-zinc-800/60 p-5 space-y-4 hover:border-zinc-700/80 transition-colors"
                >
                  {/* Row 1: Name, Sets, Reps, Weight */}
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                    <div className="md:col-span-5">
                      <label className="text-xs font-bold text-zinc-550 block mb-1.5">Exercise Name</label>
                      <input 
                        type="text"
                        placeholder="e.g., Dumbbell Bicep Curls"
                        value={ex.exerciseName}
                        onChange={(e) => handleExerciseChange(index, 'exerciseName', e.target.value)}
                        className="flex h-10 w-full rounded-xl border border-zinc-800 bg-zinc-950/60 px-3.5 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                        required
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="text-xs font-bold text-zinc-550 block mb-1.5">Sets</label>
                      <input 
                        type="number"
                        placeholder="3"
                        value={ex.sets}
                        onChange={(e) => handleExerciseChange(index, 'sets', e.target.value)}
                        className="flex h-10 w-full rounded-xl border border-zinc-800 bg-zinc-950/60 px-3.5 py-2 text-xs text-white text-center focus:outline-none focus:border-emerald-500"
                        required
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="text-xs font-bold text-zinc-550 block mb-1.5">Reps</label>
                      <input 
                        type="number"
                        placeholder="10"
                        value={ex.reps}
                        onChange={(e) => handleExerciseChange(index, 'reps', e.target.value)}
                        className="flex h-10 w-full rounded-xl border border-zinc-800 bg-zinc-950/60 px-3.5 py-2 text-xs text-white text-center focus:outline-none focus:border-emerald-500"
                        required
                      />
                    </div>
                    <div className="md:col-span-3">
                      <label className="text-xs font-bold text-zinc-550 block mb-1.5">Weight (kg)</label>
                      <input 
                        type="number"
                        placeholder="15"
                        value={ex.weight}
                        onChange={(e) => handleExerciseChange(index, 'weight', e.target.value)}
                        className="flex h-10 w-full rounded-xl border border-zinc-800 bg-zinc-950/60 px-3.5 py-2 text-xs text-white text-center focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>

                  {/* Row 2: Rest Time, Calories, Notes + Sorting Buttons */}
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end pt-2 border-t border-zinc-900">
                    <div className="md:col-span-3">
                      <label className="text-xs font-bold text-zinc-550 block mb-1.5">Rest Time (s)</label>
                      <input 
                        type="number"
                        placeholder="60"
                        value={ex.restTime}
                        onChange={(e) => handleExerciseChange(index, 'restTime', e.target.value)}
                        className="flex h-10 w-full rounded-xl border border-zinc-800 bg-zinc-950/60 px-3.5 py-2 text-xs text-white text-center focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                    <div className="md:col-span-3">
                      <label className="text-xs font-bold text-zinc-550 block mb-1.5">Est. Calories Burned</label>
                      <input 
                        type="number"
                        placeholder="50"
                        value={ex.caloriesBurned}
                        onChange={(e) => handleExerciseChange(index, 'caloriesBurned', e.target.value)}
                        className="flex h-10 w-full rounded-xl border border-zinc-800 bg-zinc-950/60 px-3.5 py-2 text-xs text-white text-center focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                    <div className="md:col-span-4">
                      <label className="text-xs font-bold text-zinc-550 block mb-1.5">Movement Notes</label>
                      <input 
                        type="text"
                        placeholder="e.g., slow eccentric phase"
                        value={ex.notes}
                        onChange={(e) => handleExerciseChange(index, 'notes', e.target.value)}
                        className="flex h-10 w-full rounded-xl border border-zinc-800 bg-zinc-950/60 px-3.5 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                    
                    {/* Control Actions (move, duplicate, delete) */}
                    <div className="md:col-span-2 flex items-center justify-end gap-2.5 h-10">
                      <button 
                        type="button"
                        onClick={() => handleMoveUp(index)}
                        disabled={index === 0}
                        className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-zinc-400 hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-all cursor-pointer"
                        title="Move Up"
                      >
                        <ArrowUp className="h-3.5 w-3.5" />
                      </button>
                      <button 
                        type="button"
                        onClick={() => handleMoveDown(index)}
                        disabled={index === exercises.length - 1}
                        className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-zinc-400 hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-all cursor-pointer"
                        title="Move Down"
                      >
                        <ArrowDown className="h-3.5 w-3.5" />
                      </button>
                      <button 
                        type="button"
                        onClick={() => handleDuplicateExercise(index)}
                        className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-zinc-400 hover:text-white transition-all cursor-pointer"
                        title="Duplicate Exercise"
                      >
                        <Copy className="h-3.5 w-3.5" />
                      </button>
                      <button 
                        type="button"
                        onClick={() => handleRemoveExercise(index)}
                        disabled={exercises.length === 1}
                        className="p-2 bg-white/5 hover:bg-red-500/10 rounded-lg text-zinc-500 hover:text-red-400 disabled:opacity-30 disabled:pointer-events-none transition-all cursor-pointer"
                        title="Remove Exercise"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                </div>
              ))}
            </div>
          </div>

          {/* Routine Notes */}
          <div className="flex flex-col space-y-1.5 pt-6 border-t border-zinc-800/50">
            <label className="text-sm font-medium text-zinc-300">Routine Notes</label>
            <textarea 
              placeholder="e.g., Focus on upper back and shoulders. Maximize mind-muscle connection."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="flex min-h-[80px] w-full rounded-xl border border-zinc-800 bg-zinc-900/50 px-4 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 backdrop-blur-md"
            />
          </div>

          {/* Footer controls */}
          <div className="pt-6 flex justify-end gap-3 border-t border-zinc-800/50">
            <Button type="button" variant="ghost" onClick={() => navigate(-1)} className="cursor-pointer">
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading} className="cursor-pointer">
              {isLoading ? 'Saving routine...' : 'Save Routine'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}