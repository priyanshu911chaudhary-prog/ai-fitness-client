import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Search, Calendar, Utensils, ChevronDown, ChevronUp, Edit2, Trash2, Plus, Loader2, Info } from 'lucide-react';
import { api } from '../../utils/api';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';

export default function MealHistory() {
  const navigate = useNavigate();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Filters
  const [timeframe, setTimeframe] = useState('this_month'); // today, this_week, this_month, custom
  const [searchQuery, setSearchQuery] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  
  // Expanded log IDs
  const [expandedLogs, setExpandedLogs] = useState({});

  // Editing state
  const [editingLog, setEditingLog] = useState(null);
  const [editCalories, setEditCalories] = useState(0);
  const [editProtein, setEditProtein] = useState(0);
  const [editCarbs, setEditCarbs] = useState(0);
  const [editFat, setEditFat] = useState(0);

  // Direct Logging state
  const [showLogModal, setShowLogModal] = useState(false);
  const [logName, setLogName] = useState('');
  const [logType, setLogType] = useState('lunch'); // breakfast, lunch, dinner, snack
  const [logDate, setLogDate] = useState(new Date().toISOString().split('T')[0]);
  const [logFoods, setLogFoods] = useState([
    { name: '', quantity: 100, unit: 'g', calories: 150, protein: 10, carbs: 20, fat: 5, fibre: 2, sugar: 3, sodium: 100 }
  ]);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      setError(null);
      
      let url = `/meals/history?timeframe=${timeframe}&search=${encodeURIComponent(searchQuery)}`;
      if (timeframe === 'custom' && startDate && endDate) {
        url += `&startDate=${startDate}&endDate=${endDate}`;
      }
      
      const res = await api.get(url);
      setLogs(res.data.data || []);
    } catch (err) {
      console.error("Failed to load meal history:", err);
      setError(err.response?.data?.message || "Failed to load meal history.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [timeframe, startDate, endDate]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchHistory();
  };

  const toggleExpand = (id) => {
    setExpandedLogs(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const handleDeleteLog = async (logId) => {
    if (!window.confirm("Are you sure you want to permanently delete this logged meal?")) return;
    try {
      await api.delete(`/meals/history/${logId}`);
      setLogs(prev => prev.filter(log => log._id !== logId));
    } catch (err) {
      console.error("Failed to delete log:", err);
      alert("Failed to delete log. Please try again.");
    }
  };

  const handleStartEdit = (log) => {
    setEditingLog(log);
    setEditCalories(log.totalCalories);
    setEditProtein(log.totalProtein || 0);
    setEditCarbs(log.totalCarbs || 0);
    setEditFat(log.totalFat || 0);
    setEditFibre(log.totalFibre || 0);
    setEditServingSize(log.description || '1 serving');
    setEditNotes(log.notes || '');
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/meals/history/${editingLog._id}`, {
        totalCalories: Number(editCalories),
        totalProtein: Number(editProtein),
        totalCarbs: Number(editCarbs),
        totalFat: Number(editFat),
        totalFibre: Number(editFibre),
        description: editServingSize,
        notes: editNotes
      });
      
      // Update local state
      setLogs(prev => prev.map(log => {
        if (log._id === editingLog._id) {
          return {
            ...log,
            totalCalories: Number(editCalories),
            totalProtein: Number(editProtein),
            totalCarbs: Number(editCarbs),
            totalFat: Number(editFat),
            totalFibre: Number(editFibre),
            description: editServingSize,
            notes: editNotes
          };
        }
        return log;
      }));
      setEditingLog(null);
    } catch (err) {
      console.error("Failed to update log:", err);
      alert("Failed to update log.");
    }
  };

  // Log Custom Meal logic
  const handleAddFoodRow = () => {
    setLogFoods(prev => [...prev, { name: '', quantity: 100, unit: 'g', calories: 0, protein: 0, carbs: 0, fat: 0, fibre: 0, sugar: 0, sodium: 0 }]);
  };

  const handleRemoveFoodRow = (index) => {
    if (logFoods.length === 1) return;
    setLogFoods(prev => prev.filter((_, i) => i !== index));
  };

  const handleFoodChange = (index, field, value) => {
    setLogFoods(prev => prev.map((fd, i) => {
      if (i === index) {
        return {
          ...fd,
          [field]: field === 'name' || field === 'unit' ? value : Number(value)
        };
      }
      return fd;
    }));
  };

  const handleLogCustomMeal = async (e) => {
    e.preventDefault();
    if (!logName.trim()) {
      alert("Please enter a meal name.");
      return;
    }
    
    // Validate foods
    const validFoods = logFoods.filter(fd => fd.name.trim() !== '');
    if (validFoods.length === 0) {
      alert("Please add at least one food item.");
      return;
    }

    // Compute totals
    const totalCalories = validFoods.reduce((sum, f) => sum + (f.calories || 0), 0);
    const totalProtein = validFoods.reduce((sum, f) => sum + (f.protein || 0), 0);
    const totalCarbs = validFoods.reduce((sum, f) => sum + (f.carbs || 0), 0);
    const totalFat = validFoods.reduce((sum, f) => sum + (f.fat || 0), 0);
    const totalFibre = validFoods.reduce((sum, f) => sum + (f.fibre || 0), 0);
    const totalSugar = validFoods.reduce((sum, f) => sum + (f.sugar || 0), 0);
    const totalSodium = validFoods.reduce((sum, f) => sum + (f.sodium || 0), 0);

    try {
      const payload = {
        mealName: logName,
        mealType: logType,
        consumedAt: logDate,
        totalCalories,
        totalProtein,
        totalCarbs,
        totalFat,
        totalFibre,
        totalSugar,
        totalSodium,
        foods: validFoods
      };

      const res = await api.post('/meals/history', payload);
      setLogs(prev => [res.data.data, ...prev]);
      setShowLogModal(false);
      
      // Reset form
      setLogName('');
      setLogType('lunch');
      setLogFoods([{ name: '', quantity: 100, unit: 'g', calories: 150, protein: 10, carbs: 20, fat: 5, fibre: 2, sugar: 3, sodium: 100 }]);
    } catch (err) {
      console.error("Failed to log custom meal:", err);
      alert("Failed to log meal.");
    }
  };

  // Stats calculation
  const totalLoggedMeals = logs.length;
  const totalCals = logs.reduce((sum, log) => sum + (log.totalCalories || 0), 0);
  const totalPro = logs.reduce((sum, log) => sum + (log.totalProtein || 0), 0);
  const totalCarbsVal = logs.reduce((sum, log) => sum + (log.totalCarbs || 0), 0);
  const totalFatsVal = logs.reduce((sum, log) => sum + (log.totalFat || 0), 0);

  const avgCals = totalLoggedMeals > 0 ? Math.round(totalCals / totalLoggedMeals) : 0;
  const avgPro = totalLoggedMeals > 0 ? Math.round(totalPro / totalLoggedMeals) : 0;
  const avgCarbs = totalLoggedMeals > 0 ? Math.round(totalCarbsVal / totalLoggedMeals) : 0;
  const avgFats = totalLoggedMeals > 0 ? Math.round(totalFatsVal / totalLoggedMeals) : 0;

  return (
    <div className="space-y-8 animate-[fade-in-up_0.6s_ease-out_forwards]">
      {/* Header Actions */}
      <div className="relative flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div className="absolute -top-10 -left-10 w-48 h-48 bg-emerald-500/10 rounded-full blur-[80px] pointer-events-none" />
        <div className="relative z-10">
          <Link to="/meals" className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-emerald-400 transition-colors mb-3">
            <ArrowLeft className="h-4 w-4" /> Back to Library
          </Link>
          <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white via-zinc-200 to-zinc-400">Meal History</h1>
          <p className="mt-1 text-zinc-400 text-sm">Monitor calorie intake and macronutrient profiles over time.</p>
        </div>
        <div className="relative z-10 flex gap-4 w-full sm:w-auto shrink-0">
          <Button onClick={() => setShowLogModal(true)} className="w-full sm:w-auto gap-2 bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-400 hover:to-emerald-500">
            <Plus className="h-4 w-4" />
            Log Meal
          </Button>
        </div>
      </div>

      {/* Statistics Row */}
      <div className="grid grid-cols-4 gap-6">
        <div className="rounded-2xl border border-white/5 bg-white/[0.01] p-6 text-center backdrop-blur-sm">
          <span className="text-zinc-550 text-xs uppercase tracking-wider block">Avg. Calories</span>
          <span className="text-2xl font-black text-white block mt-1">{avgCals} <span className="text-xs font-normal">kcal</span></span>
        </div>
        <div className="rounded-2xl border border-white/5 bg-white/[0.01] p-6 text-center backdrop-blur-sm">
          <span className="text-zinc-550 text-xs uppercase tracking-wider block">Avg. Protein</span>
          <span className="text-2xl font-black text-[#ff9800] block mt-1">{avgPro} <span className="text-xs font-normal text-zinc-400">g</span></span>
        </div>
        <div className="rounded-2xl border border-white/5 bg-white/[0.01] p-6 text-center backdrop-blur-sm">
          <span className="text-zinc-550 text-xs uppercase tracking-wider block">Avg. Carbs</span>
          <span className="text-2xl font-black text-[#00e676] block mt-1">{avgCarbs} <span className="text-xs font-normal text-zinc-400">g</span></span>
        </div>
        <div className="rounded-2xl border border-white/5 bg-white/[0.01] p-6 text-center backdrop-blur-sm">
          <span className="text-zinc-550 text-xs uppercase tracking-wider block">Avg. Fats</span>
          <span className="text-2xl font-black text-[#b200ff] block mt-1">{avgFats} <span className="text-xs font-normal text-zinc-400">g</span></span>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="rounded-[1.5rem] border border-white/5 bg-white/[0.02] p-5 backdrop-blur-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2">
          {['today', 'this_week', 'this_month', 'custom'].map((tf) => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                timeframe === tf
                  ? 'bg-white text-black shadow-lg'
                  : 'text-zinc-400 bg-white/5 hover:bg-white/10 hover:text-white border border-white/5'
              }`}
            >
              {tf === 'this_week' ? 'This Week' : tf === 'this_month' ? 'This Month' : tf === 'custom' ? 'Custom Range' : 'Today'}
            </button>
          ))}
        </div>

        {timeframe === 'custom' && (
          <div className="flex items-center gap-2 animate-[fade-in_0.3s_ease_out]">
            <input 
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="bg-black border border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-teal-500"
            />
            <span className="text-zinc-500 text-xs">to</span>
            <input 
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="bg-black border border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-teal-500"
            />
          </div>
        )}

        <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-sm">
          <input
            type="text"
            placeholder="Search meals, food items, etc..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-black/60 border border-white/10 rounded-xl pl-9 pr-4 py-2 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-teal-500/50 focus:border-teal-500/50"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-550" />
        </form>
      </div>

      {/* Meal logs Feed */}
      {loading ? (
        <div className="flex h-[20vh] flex-col items-center justify-center gap-4">
          <Loader2 className="h-8 w-8 text-teal-400 animate-spin" />
          <p className="text-zinc-500 text-sm">Parsing nutritional databases...</p>
        </div>
      ) : logs.length === 0 ? (
        <div className="text-center py-16 bg-white/[0.01] border border-white/5 rounded-[2rem]">
          <Info className="h-10 w-10 text-zinc-600 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-zinc-400">No meal logs found</h3>
          <p className="text-zinc-500 text-xs mt-1">Try another filter range or record a new meal above.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {logs.map((log) => {
            const isExpanded = !!expandedLogs[log._id];
            const dateStr = new Date(log.consumedAt).toLocaleDateString(undefined, {
              weekday: 'short',
              month: 'short',
              day: 'numeric',
              year: 'numeric'
            });

            return (
              <div 
                key={log._id}
                className="rounded-2xl border border-white/5 bg-white/[0.01] overflow-hidden backdrop-blur-md hover:bg-white/[0.02] transition-colors"
              >
                {/* Summary Header */}
                <div 
                  onClick={() => toggleExpand(log._id)}
                  className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer select-none"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-2.5 rounded-xl bg-white/5 text-teal-400 border border-white/5">
                      <Utensils className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-zinc-150 text-base">{log.mealName}</h4>
                      <div className="flex items-center gap-3 text-xs text-zinc-500 mt-0.5">
                        <span className="capitalize">{log.mealType}</span>
                        <span>•</span>
                        <span>{dateStr}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 text-sm shrink-0">
                    <div className="text-zinc-200">
                      <span className="font-black text-white text-base">{Math.round(log.totalCalories)}</span> kcal
                    </div>
                    <div className="grid grid-cols-3 gap-3 text-center text-xs text-zinc-450 border-l border-white/5 pl-6 pr-2">
                      <div>
                        <span className="block text-[10px] text-zinc-500 uppercase">Protein</span>
                        <span className="font-bold text-[#ff9800]">{Math.round(log.totalProtein || 0)}g</span>
                      </div>
                      <div>
                        <span className="block text-[10px] text-zinc-500 uppercase">Carbs</span>
                        <span className="font-bold text-[#00e676]">{Math.round(log.totalCarbs || 0)}g</span>
                      </div>
                      <div>
                        <span className="block text-[10px] text-zinc-500 uppercase">Fats</span>
                        <span className="font-bold text-[#b200ff]">{Math.round(log.totalFat || 0)}g</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 border-l border-white/5 pl-4">
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleStartEdit(log); }}
                        className="p-1.5 text-zinc-500 hover:text-white transition-colors"
                        title="Edit Macros"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleDeleteLog(log._id); }}
                        className="p-1.5 text-zinc-500 hover:text-red-400 transition-colors"
                        title="Delete Log"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <div className="text-zinc-505 ml-1">
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Expanded Food Details */}
                {isExpanded && (
                  <div className="px-5 pb-5 pt-4 border-t border-white/5 bg-black/40 animate-[fade-in_0.2s_ease-out] space-y-4">
                    
                    {/* Meal Log Details Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 p-4 rounded-xl border border-white/5 bg-white/[0.01] text-xs">
                      <div>
                        <span className="text-zinc-500 block uppercase font-bold text-[9px] mb-0.5">Logged Date & Time</span>
                        <span className="text-zinc-200 font-semibold">
                          {dateStr} at {new Date(log.consumedAt || log.createdAt).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <div>
                        <span className="text-zinc-500 block uppercase font-bold text-[9px] mb-0.5">Serving Size</span>
                        <span className="text-zinc-200 font-semibold">
                          {log.description || '1 serving'}
                        </span>
                      </div>
                      <div>
                        <span className="text-zinc-500 block uppercase font-bold text-[9px] mb-0.5">Fiber & Sodium</span>
                        <span className="text-zinc-200 font-semibold">
                          {log.totalFibre || 0}g Fiber • {log.totalSodium || 0}mg Sodium
                        </span>
                      </div>
                      <div>
                        <span className="text-zinc-500 block uppercase font-bold text-[9px] mb-0.5">Sugar</span>
                        <span className="text-zinc-200 font-semibold">
                          {log.totalSugar || 0}g Sugar
                        </span>
                      </div>
                      <div>
                        <span className="text-zinc-500 block uppercase font-bold text-[9px] mb-0.5">Total Calories</span>
                        <span className="text-zinc-200 font-semibold text-teal-400">
                          {Math.round(log.totalCalories)} kcal
                        </span>
                      </div>
                    </div>

                    {log.notes && (
                      <div className="text-xs text-zinc-400 bg-white/5 p-3 rounded-xl border border-white/5">
                        <strong className="text-zinc-300 block mb-0.5">Meal Notes:</strong>
                        {log.notes}
                      </div>
                    )}

                    <h5 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Ingredients / Foods Consumed</h5>
                    {log.foods?.length > 0 ? (
                      <div className="space-y-2">
                        {log.foods.map((food, foodIdx) => (
                          <div key={foodIdx} className="flex justify-between items-center bg-white/[0.01] p-3 rounded-xl border border-white/5">
                            <div>
                              <span className="font-bold text-zinc-200 text-xs">{food.name}</span>
                              <span className="text-[10px] text-zinc-550 block mt-0.5">{food.quantity} {food.unit}</span>
                            </div>
                            <div className="flex gap-4 text-xs text-zinc-400">
                              <span>{food.calories} kcal</span>
                              <span className="text-[#ff9800]">{food.protein}g P</span>
                              <span className="text-[#00e676]">{food.carbs}g C</span>
                              <span className="text-[#b200ff]">{food.fat}g F</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-zinc-550">No detailed ingredient breakdown logged.</p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Editing Dialog */}
      {editingLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="relative rounded-[2rem] border border-white/10 bg-zinc-950 p-8 shadow-2xl max-w-md w-full animate-[fade-in-up_0.3s_ease-out]">
            <h3 className="text-xl font-bold text-white mb-6">Edit Meal Nutrients</h3>
            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Input 
                  label="Calories (kcal)"
                  type="number"
                  value={editCalories}
                  onChange={(e) => setEditCalories(e.target.value)}
                  required
                />
                <Input 
                  label="Protein (g)"
                  type="number"
                  value={editProtein}
                  onChange={(e) => setEditProtein(e.target.value)}
                  required
                />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <Input 
                  label="Carbs (g)"
                  type="number"
                  value={editCarbs}
                  onChange={(e) => setEditCarbs(e.target.value)}
                  required
                />
                <Input 
                  label="Fat (g)"
                  type="number"
                  value={editFat}
                  onChange={(e) => setEditFat(e.target.value)}
                  required
                />
                <Input 
                  label="Fiber (g)"
                  type="number"
                  value={editFibre}
                  onChange={(e) => setEditFibre(e.target.value)}
                  required
                />
              </div>

              <Input 
                label="Serving Size" 
                value={editServingSize} 
                onChange={(e) => setEditServingSize(e.target.value)}
                required
              />

              <div className="flex flex-col space-y-1.5">
                <label className="text-xs font-semibold text-zinc-400">Meal Notes</label>
                <textarea 
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  className="flex min-h-[60px] w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  placeholder="Notes about this meal log..."
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="ghost" size="sm" onClick={() => setEditingLog(null)} className="cursor-pointer">Cancel</Button>
                <Button type="submit" size="sm" className="cursor-pointer">Save Changes</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Direct Logging Modal */}
      {showLogModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="relative rounded-[2rem] border border-white/10 bg-zinc-950 p-8 shadow-2xl max-w-2xl w-full my-8 animate-[fade-in-up_0.3s_ease-out]">
            <h3 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-emerald-500 mb-6">Log Eaten Meal</h3>
            
            <form onSubmit={handleLogCustomMeal} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input 
                  label="Meal Name" 
                  placeholder="e.g., Post-Workout Snack" 
                  value={logName} 
                  onChange={(e) => setLogName(e.target.value)}
                  required
                />
                
                <div className="flex flex-col space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-400">Meal Type</label>
                  <select 
                    value={logType}
                    onChange={(e) => setLogType(e.target.value)}
                    className="flex h-11 w-full rounded-xl border border-white/10 bg-black/40 px-3 text-xs text-white focus:outline-none"
                  >
                    <option value="breakfast">Breakfast</option>
                    <option value="lunch">Lunch</option>
                    <option value="dinner">Dinner</option>
                    <option value="snack">Snack</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input 
                  label="Log Date" 
                  type="date" 
                  value={logDate} 
                  onChange={(e) => setLogDate(e.target.value)}
                  required
                />
              </div>

              {/* Foods Item list */}
              <div className="space-y-3">
                <div className="flex justify-between items-center border-b border-white/5 pb-2">
                  <h4 className="text-sm font-bold text-zinc-300">Food Items / Ingredients</h4>
                  <button 
                    type="button" 
                    onClick={handleAddFoodRow}
                    className="text-xs text-teal-400 hover:text-teal-300 font-bold"
                  >
                    + Add Food
                  </button>
                </div>

                <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1 scrollbar-thin">
                  {logFoods.map((food, index) => (
                    <div key={index} className="grid grid-cols-12 gap-2 bg-white/[0.01] p-3 rounded-xl border border-white/5 items-end">
                      <div className="col-span-3">
                        <label className="text-[10px] text-zinc-550 font-bold block mb-1">Food Name</label>
                        <input 
                          type="text" 
                          placeholder="Chicken Breast"
                          value={food.name}
                          onChange={(e) => handleFoodChange(index, 'name', e.target.value)}
                          className="w-full bg-black border border-white/10 rounded-lg px-2 py-1 text-xs text-white focus:outline-none"
                        />
                      </div>
                      <div className="col-span-1.5">
                        <label className="text-[10px] text-zinc-550 font-bold block mb-1">Qty</label>
                        <input 
                          type="number" 
                          value={food.quantity}
                          onChange={(e) => handleFoodChange(index, 'quantity', e.target.value)}
                          className="w-full bg-black border border-white/10 rounded-lg px-1.5 py-1 text-xs text-white text-center focus:outline-none"
                        />
                      </div>
                      <div className="col-span-1.5">
                        <label className="text-[10px] text-zinc-555 font-bold block mb-1">Unit</label>
                        <input 
                          type="text" 
                          value={food.unit}
                          onChange={(e) => handleFoodChange(index, 'unit', e.target.value)}
                          className="w-full bg-black border border-white/10 rounded-lg px-1.5 py-1 text-xs text-white text-center focus:outline-none"
                        />
                      </div>
                      <div className="col-span-1.5">
                        <label className="text-[10px] text-zinc-550 font-bold block mb-1">Kcal</label>
                        <input 
                          type="number" 
                          value={food.calories}
                          onChange={(e) => handleFoodChange(index, 'calories', e.target.value)}
                          className="w-full bg-black border border-white/10 rounded-lg px-1 py-1 text-xs text-white text-center focus:outline-none"
                        />
                      </div>
                      <div className="col-span-1">
                        <label className="text-[10px] text-[#ff9800] font-bold block mb-1">Pro</label>
                        <input 
                          type="number" 
                          value={food.protein}
                          onChange={(e) => handleFoodChange(index, 'protein', e.target.value)}
                          className="w-full bg-black border border-white/10 rounded-lg px-1 py-1 text-xs text-white text-center focus:outline-none"
                        />
                      </div>
                      <div className="col-span-1">
                        <label className="text-[10px] text-[#00e676] font-bold block mb-1">Carb</label>
                        <input 
                          type="number" 
                          value={food.carbs}
                          onChange={(e) => handleFoodChange(index, 'carbs', e.target.value)}
                          className="w-full bg-black border border-white/10 rounded-lg px-1 py-1 text-xs text-white text-center focus:outline-none"
                        />
                      </div>
                      <div className="col-span-1">
                        <label className="text-[10px] text-[#b200ff] font-bold block mb-1">Fat</label>
                        <input 
                          type="number" 
                          value={food.fat}
                          onChange={(e) => handleFoodChange(index, 'fat', e.target.value)}
                          className="w-full bg-black border border-white/10 rounded-lg px-1 py-1 text-xs text-white text-center focus:outline-none"
                        />
                      </div>
                      <div className="col-span-1 flex justify-center pb-0.5">
                        <button 
                          type="button" 
                          onClick={() => handleRemoveFoodRow(index)}
                          className="text-zinc-500 hover:text-red-400 p-1.5 transition-colors"
                          title="Remove Food Item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
                <Button type="button" variant="ghost" onClick={() => setShowLogModal(false)}>Cancel</Button>
                <Button type="submit">Log Consumed Meal</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
