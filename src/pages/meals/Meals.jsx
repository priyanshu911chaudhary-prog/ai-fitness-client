import { Link } from 'react-router-dom';
import { Plus, Sparkles, Utensils } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import {useFitnessStore} from "../../store/useFitnessStore";
import {Trash2} from "lucide-react";

export default function Meals() {
  const meals=useFitnessStore((state) => state.meals);
  const deleteMeal=useFitnessStore((state) => state.deleteMeal);

  return (
    <div className="space-y-8 animate-[fade-in-up_0.6s_ease-out_forwards]">
      {/* Header Actions */}
      <div className="relative flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div className="absolute -top-10 -left-10 w-48 h-48 bg-teal-500/10 rounded-full blur-[80px] pointer-events-none" />
        <div className="relative z-10">
          <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-500">Meals Library</h1>
          <p className="mt-2 text-zinc-400">Manage your nutrition and custom recipes.</p>
        </div>
        <div className="relative z-10 flex gap-4 w-full sm:w-auto">
          <Link to="/meals/generate" className="flex-1 sm:flex-none">
            <Button variant="outline" className="w-full gap-2">
              <Sparkles className="h-4 w-4 text-emerald-400" />
              AI Generator
            </Button>
          </Link>
          <Link to="/meals/create" className="flex-1 sm:flex-none">
            <Button className="w-full gap-2">
              <Plus className="h-4 w-4" />
              Add Meal
            </Button>
          </Link>
        </div>
      </div>

      {/* Meals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {meals.map((meal) => (
          <div key={meal.id} className="group relative rounded-[2rem] border border-zinc-800/60 bg-zinc-900/40 p-6 shadow-xl backdrop-blur-xl transition-all hover:border-teal-500/30 overflow-hidden cursor-pointer hover:-translate-y-1">
            <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/5 rounded-full blur-2xl group-hover:bg-teal-500/10 transition-colors pointer-events-none" />
            
            <button onClick={() => deleteMeal(meal.id)} className="absolute top-6 right-6 z-20">
              <Trash2 className="h-4 w-4 text-zinc-500 hover:text-red-400 transition-colors" />
            </button>
            
            <div className="relative z-10 flex justify-between items-start mb-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-zinc-800/50 group-hover:bg-teal-500/10 group-hover:text-teal-400 transition-colors border border-zinc-700/50">
                  <Utensils className="h-6 w-6 text-teal-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-zinc-100">{meal.name}</h3>
                  <span className="text-xs text-zinc-500">{meal.type}</span>
                </div>
              </div>
            </div>

            <div className="relative z-10 grid grid-cols-4 gap-2 text-center bg-zinc-950/50 rounded-xl p-3 border border-zinc-800/50">
              <div className="flex flex-col items-center justify-center">
                <p className="text-xs text-zinc-500 mb-1">Cals</p>
                <p className="font-semibold text-zinc-200">{meal.calories}</p>
              </div>
              <div>
                <p className="text-xs text-zinc-500 mb-1">Pro</p>
                <p className="font-semibold text-blue-400">{meal.protein}g</p>
              </div>
              <div>
                <p className="text-xs text-zinc-500 mb-1">Carb</p>
                <p className="font-semibold text-amber-400">{meal.carbs}g</p>
              </div>
              <div>
                <p className="text-xs text-zinc-500 mb-1">Fat</p>
                <p className="font-semibold text-red-400">{meal.fats}g</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}