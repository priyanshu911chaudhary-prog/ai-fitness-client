import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ChevronDown } from 'lucide-react';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { api } from '../../utils/api';

const mealSchema = z.object({
  name: z.string().min(2, "Meal name is required"),
  type: z.enum(["Breakfast", "Lunch", "Dinner", "Snack"]),
  calories: z.coerce.number().min(0, "Must be positive"),
  protein: z.coerce.number().min(0),
  carbs: z.coerce.number().min(0),
  fats: z.coerce.number().min(0),
});

export default function CreateMeal() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(mealSchema),
    defaultValues: { type: "Lunch" }
  });

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      const payload = {
        title: data.name,
        mealType: data.type.toLowerCase(),
        items: [{
          foodName: data.name,
          quantity: "1",
          calories: Number(data.calories),
          protein: Number(data.protein),
          carbs: Number(data.carbs),
          fats: Number(data.fats)
        }]
      };

      await api.post('/meals', payload);
      navigate('/meals');
    } catch (err) {
      console.error("Failed to create meal:", err);
      alert(err.response?.data?.message || "Failed to create meal. Please check details and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-[fade-in-up_0.6s_ease-out_forwards]">
      <button 
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-sm font-medium text-zinc-400 hover:text-teal-400 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Meals
      </button>

      <div className="relative rounded-[2rem] border border-zinc-800/60 bg-zinc-900/40 p-8 shadow-xl backdrop-blur-xl overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/5 rounded-full blur-3xl pointer-events-none" />
        <h1 className="relative z-10 text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-500 mb-8">Create Custom Meal</h1>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input 
              label="Meal Name"
              placeholder="e.g., Grilled Chicken Salad"
              error={errors.name?.message}
              {...register('name')}
            />
            
            <div className="relative z-10 flex flex-col space-y-1.5 w-full">
              <label className="text-sm font-medium text-zinc-300">Meal Type</label>
              <div className="relative">
                <select 
                  className="flex h-11 w-full rounded-xl border border-zinc-800/80 bg-zinc-900/50 backdrop-blur-md px-4 py-2 text-base md:text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500/50 transition-all duration-300 appearance-none pr-10"
                  {...register('type')}
                >
                  <option value="Breakfast">Breakfast</option>
                  <option value="Lunch">Lunch</option>
                  <option value="Dinner">Dinner</option>
                  <option value="Snack">Snack</option>
                </select>
                <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 pointer-events-none" />
              </div>
            </div>
          </div>

          <div className="relative z-10 grid grid-cols-2 md:grid-cols-4 gap-6 pt-6 border-t border-zinc-800/50">
            <Input 
              label="Calories (kcal)"
              type="number"
              placeholder="0"
              error={errors.calories?.message}
              {...register('calories')}
            />
            <Input 
              label="Protein (g)"
              type="number"
              placeholder="0"
              error={errors.protein?.message}
              {...register('protein')}
            />
            <Input 
              label="Carbs (g)"
              type="number"
              placeholder="0"
              error={errors.carbs?.message}
              {...register('carbs')}
            />
            <Input 
              label="Fats (g)"
              type="number"
              placeholder="0"
              error={errors.fats?.message}
              {...register('fats')}
            />
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <Button type="button" variant="ghost" onClick={() => navigate(-1)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Saving...' : 'Save Meal'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}