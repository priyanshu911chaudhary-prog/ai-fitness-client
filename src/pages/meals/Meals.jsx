import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Sparkles, Utensils, Trash2, Loader2, Play, Copy, Edit, Eye, CheckCircle } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { api } from '../../utils/api';

export default function Meals() {
  const navigate = useNavigate();
  const [meals, setMeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isLoggingId, setIsLoggingId] = useState(null);

  const fetchMeals = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get('/meals');
      setMeals(res.data.data || []);
    } catch (err) {
      console.error("Failed to load meals:", err);
      setError(err.response?.data?.message || "Failed to load meals library.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMeals();
  }, []);

  const handleDeleteMeal = async (e, mealId) => {
    e.stopPropagation();
    if (!window.confirm("Are you sure you want to delete this meal plan?")) return;
    try {
      await api.delete(`/meals/${mealId}`);
      setMeals(prev => prev.filter(meal => meal._id !== mealId));
    } catch (err) {
      console.error("Failed to delete meal:", err);
      alert("Failed to delete meal. Please try again.");
    }
  };

  const handleDuplicateMeal = async (e, meal) => {
    e.stopPropagation();
    try {
      setLoading(true);
      const detailRes = await api.get(`/meals/${meal._id}`);
      const detail = detailRes.data.data;
      const fullMeal = detail.meal || detail;
      const fullItems = detail.item || fullMeal.items || [];

      const payload = {
        title: `${fullMeal.title} (Copy)`,
        description: fullMeal.description || "1 serving",
        mealType: fullMeal.mealType || "lunch",
        notes: fullMeal.notes || "",
        items: fullItems.map(it => ({
          foodName: it.foodName || it.name,
          quantity: Number(it.quantity) || 1,
          unit: it.unit || "g",
          calories: Number(it.calories) || 0,
          protein: Number(it.protein) || 0,
          carbs: Number(it.carbs) || 0,
          fats: Number(it.fats || it.fat) || 0,
          fibre: Number(it.fibre) || 0,
          sugar: Number(it.sugar) || 0,
          sodium: Number(it.sodium) || 0,
        }))
      };

      await api.post('/meals', payload);
      alert("Meal plan duplicated successfully!");
      fetchMeals();
    } catch (err) {
      console.error("Failed to duplicate meal:", err);
      alert(err.response?.data?.message || "Failed to duplicate meal.");
      setLoading(false);
    }
  };

  const handleConsumeMeal = async (e, meal) => {
    e.stopPropagation();
    try {
      setIsLoggingId(meal._id);
      await api.post(`/meals/${meal._id}/consume`, {});
      alert(`Meal "${meal.title}" logged successfully! Go check Meal History.`);
      fetchMeals(); // Refresh log status
    } catch (err) {
      console.error("Failed to log meal:", err);
      alert(err.response?.data?.message || "Failed to log meal.");
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
          <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white via-zinc-200 to-zinc-400">Meals Library</h1>
          <p className="mt-2 text-zinc-400">Manage your nutrition and custom recipes.</p>
        </div>
        <div className="relative z-10 flex gap-3 w-full sm:w-auto flex-wrap">
          <Link to="/meals/history" className="flex-1 sm:flex-none">
            <Button variant="outline" className="w-full gap-2 hover:bg-white/5">
              History
            </Button>
          </Link>
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

      {loading ? (
        <div className="flex h-[30vh] flex-col items-center justify-center gap-4">
          <Loader2 className="h-8 w-8 text-emerald-400 animate-spin" />
          <p className="text-zinc-500">Loading meals...</p>
        </div>
      ) : error ? (
        <div className="text-center py-10">
          <p className="text-red-400">{error}</p>
          <Button onClick={fetchMeals} className="mt-4">Retry</Button>
        </div>
      ) : meals.length === 0 ? (
        <div className="text-center py-20 bg-white/[0.02] border border-white/5 rounded-[2rem] backdrop-blur-2xl">
          <Utensils className="h-12 w-12 text-zinc-500 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-zinc-300">No meals logged yet</h3>
          <p className="text-zinc-400 mt-1 mb-6">Create a custom meal or use the AI Routine architect to design a diet plan.</p>
          <div className="flex gap-4 justify-center">
            <Link to="/meals/create">
              <Button size="sm">Add Custom Meal</Button>
            </Link>
            <Link to="/meals/generate">
              <Button size="sm" variant="outline">Generate AI Diet</Button>
            </Link>
          </div>
        </div>
      ) : (
        /* Meals Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {meals.map((meal) => {
            const displayType = meal.mealType 
              ? meal.mealType.charAt(0).toUpperCase() + meal.mealType.slice(1) 
              : "Full Day";

            const servingSize = meal.description || "1 serving";
            const isLoggedToday = meal.lastConsumed && new Date(meal.lastConsumed).toDateString() === new Date().toDateString();

            return (
              <div
                key={meal._id}
                role="button"
                tabIndex={0}
                onClick={() => navigate(`/meals/${meal._id}`)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    navigate(`/meals/${meal._id}`);
                  }
                }}
                className="group relative flex flex-col justify-between rounded-[2rem] border border-white/5 bg-white/[0.02] p-6 shadow-2xl backdrop-blur-2xl transition-all hover:bg-white/[0.04] hover:border-white/10 overflow-hidden cursor-pointer hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 min-h-[220px]"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl group-hover:bg-emerald-500/10 transition-colors pointer-events-none" />
                
                <div>
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-white/5 group-hover:bg-emerald-500/10 group-hover:text-emerald-400 transition-colors border border-white/5">
                        <Utensils className="h-5 w-5 text-emerald-400" />
                      </div>
                      <div>
                        <h3 className="font-bold text-zinc-150 text-base group-hover:text-white transition-colors">{meal.title}</h3>
                        <div className="flex flex-wrap gap-1.5 mt-1">
                          <span className="text-[9px] font-bold uppercase tracking-wider text-zinc-400 bg-white/5 px-2 py-0.5 rounded border border-white/5">{displayType}</span>
                          <span className="text-[9px] font-bold uppercase tracking-wider text-teal-400 bg-teal-500/10 px-2 py-0.5 rounded border border-teal-500/10">{servingSize}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Horizontal Stats Macro Strip */}
                  <div className="grid grid-cols-4 gap-2 text-center bg-black/40 rounded-xl p-3 border border-white/5 mt-4 text-xs">
                    <div>
                      <p className="text-[9px] text-zinc-500 uppercase font-bold mb-0.5">Cals</p>
                      <p className="font-semibold text-zinc-200">{Math.round(meal.totalCalories || meal.calories || 0)}</p>
                    </div>
                    <div>
                      <p className="text-[9px] text-zinc-500 uppercase font-bold mb-0.5">Protein</p>
                      <p className="font-semibold text-blue-400">{Math.round(meal.protein || 0)}g</p>
                    </div>
                    <div>
                      <p className="text-[9px] text-zinc-500 uppercase font-bold mb-0.5">Carbs</p>
                      <p className="font-semibold text-amber-400">{Math.round(meal.carbs || 0)}g</p>
                    </div>
                    <div>
                      <p className="text-[9px] text-zinc-500 uppercase font-bold mb-0.5">Fat</p>
                      <p className="font-semibold text-red-400">{Math.round(meal.fats || meal.fat || 0)}g</p>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-white/5 flex flex-wrap gap-2 justify-between items-center z-10">
                  <div className="flex gap-1">
                    <button
                      title="View details"
                      onClick={(e) => { e.stopPropagation(); navigate(`/meals/${meal._id}`); }}
                      className="p-1.5 rounded-lg bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10 transition-colors border border-white/5 cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                    <button
                      title="Edit recipe"
                      onClick={(e) => { e.stopPropagation(); navigate(`/meals/edit/${meal._id}`); }}
                      className="p-1.5 rounded-lg bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10 transition-colors border border-white/5 cursor-pointer"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      title="Duplicate meal recipe"
                      onClick={(e) => handleDuplicateMeal(e, meal)}
                      className="p-1.5 rounded-lg bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10 transition-colors border border-white/5 cursor-pointer"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    <button
                      title="Delete meal recipe"
                      onClick={(e) => handleDeleteMeal(e, meal._id)}
                      className="p-1.5 rounded-lg bg-white/5 text-zinc-500 hover:text-red-400 hover:bg-red-500/10 transition-colors border border-white/5 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {isLoggedToday ? (
                    <span className="px-3.5 py-1.5 rounded-lg bg-teal-500/10 border border-teal-500/20 text-teal-400 text-xs font-bold flex items-center gap-1 select-none">
                      ✓ Consumed
                    </span>
                  ) : (
                    <button
                      disabled={isLoggingId === meal._id}
                      onClick={(e) => handleConsumeMeal(e, meal)}
                      className="px-3.5 py-1.5 rounded-lg bg-teal-500 text-black text-xs font-bold hover:bg-teal-400 transition-all flex items-center gap-1.5 disabled:opacity-50 cursor-pointer shadow-lg shadow-teal-500/20"
                    >
                      <CheckCircle className="w-3 h-3" />
                      {isLoggingId === meal._id ? '...' : 'Log'}
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