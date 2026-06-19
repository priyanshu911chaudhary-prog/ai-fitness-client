import { useState  } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';

const workoutSchema = z.object({
  name: z.string().min(2, "Workout name is required"),
  type: z.enum(["Strength", "Cardio", "Flexibility", "Hybrid"]),
  duration: z.coerce.number().min(1, "Duration must be at least 1 minute"),
  caloriesBurned: z.coerce.number().min(0, "Cannot be negative"),
});

export default function CreateWorkout() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(workoutSchema),
    defaultValues: { type: "Strength" }
  });

  const onSubmit = async (data) => {
    setIsLoading(true);
    console.log("Saving Workout:", data);
    
    // MOCK API DELAY
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Go back to workouts library after saving
    navigate('/workouts');
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-[fade-in-up_0.6s_ease-out_forwards]">
      <button 
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-sm font-medium text-zinc-400 hover:text-emerald-400 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Workouts
      </button>

      <div className="relative rounded-[2rem] border border-zinc-800/60 bg-zinc-900/40 p-8 shadow-xl backdrop-blur-xl overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
        <h1 className="relative z-10 text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-500 mb-8">Create Custom Workout</h1>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input 
              label="Workout Name"
              placeholder="e.g., Heavy Leg Day"
              error={errors.name?.message}
              {...register('name')}
            />
            
            <div className="relative z-10 flex flex-col space-y-1.5 w-full">
              <label className="text-sm font-medium text-zinc-300">Workout Type</label>
              <select 
                className="flex h-11 w-full rounded-xl border border-zinc-800/80 bg-zinc-900/50 backdrop-blur-md px-4 py-2 text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all duration-300"
                {...register('type')}
              >
                <option value="Strength">Strength</option>
                <option value="Cardio">Cardio</option>
                <option value="Flexibility">Flexibility</option>
                <option value="Hybrid">Hybrid</option>
              </select>
            </div>
          </div>

          <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 border-t border-zinc-800/50">
            <Input 
              label="Est. Duration (minutes)"
              type="number"
              placeholder="60"
              error={errors.duration?.message}
              {...register('duration')}
            />
            <Input 
              label="Est. Calories Burned"
              type="number"
              placeholder="400"
              error={errors.caloriesBurned?.message}
              {...register('caloriesBurned')}
            />
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <Button type="button" variant="ghost" onClick={() => navigate(-1)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Saving...' : 'Save Workout'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}