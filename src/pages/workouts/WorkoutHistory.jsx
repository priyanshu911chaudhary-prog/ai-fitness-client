import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Search, Calendar, Timer, Flame, ChevronDown, ChevronUp, Edit2, Trash2, Plus, Dumbbell, Sparkles, Loader2, Info } from 'lucide-react';
import { api } from '../../utils/api';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';

export default function WorkoutHistory() {
  const navigate = useNavigate();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Filters
  const [timeframe, setTimeframe] = useState('this_month'); // today, this_week, this_month, custom, all
  const [searchQuery, setSearchQuery] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  
  // Expanded log IDs (to show exercises details)
  const [expandedLogs, setExpandedLogs] = useState({});

  // Editing state
  const [editingLog, setEditingLog] = useState(null);
  const [editDuration, setEditDuration] = useState(0);
  const [editCalories, setEditCalories] = useState(0);
  const [editNotes, setEditNotes] = useState('');

  // Direct Logging state
  const [showLogModal, setShowLogModal] = useState(false);
  const [logName, setLogName] = useState('');
  const [logType, setLogType] = useState('Strength');
  const [logGoal, setLogGoal] = useState('');
  const [logDifficulty, setLogDifficulty] = useState('intermediate');
  const [logDuration, setLogDuration] = useState(45);
  const [logCalories, setLogCalories] = useState(300);
  const [logNotes, setLogNotes] = useState('');
  const [logDate, setLogDate] = useState(new Date().toISOString().split('T')[0]);
  const [logExercises, setLogExercises] = useState([
    { exerciseName: '', sets: 3, reps: 10, weight: 0, restTime: 60, caloriesBurned: 50, notes: '' }
  ]);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      setError(null);
      
      let url = `/workouts/history?timeframe=${timeframe}&search=${encodeURIComponent(searchQuery)}`;
      if (timeframe === 'custom' && startDate && endDate) {
        url += `&startDate=${startDate}&endDate=${endDate}`;
      }
      
      const res = await api.get(url);
      setLogs(res.data.data || []);
    } catch (err) {
      console.error("Failed to load workout history:", err);
      setError(err.response?.data?.message || "Failed to load workout history.");
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
    if (!window.confirm("Are you sure you want to permanently delete this workout session log?")) return;
    try {
      await api.delete(`/workouts/history/${logId}`);
      setLogs(prev => prev.filter(log => log._id !== logId));
    } catch (err) {
      console.error("Failed to delete log:", err);
      alert("Failed to delete log. Please try again.");
    }
  };

  const handleStartEdit = (log) => {
    setEditingLog(log);
    setEditDuration(log.duration);
    setEditCalories(log.caloriesBurned);
    setEditNotes(log.notes || '');
    setEditStatus(log.status || 'completed');
    setEditCompletionPercentage(log.completionPercentage || 100);
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/workouts/history/${editingLog._id}`, {
        duration: Number(editDuration),
        caloriesBurned: Number(editCalories),
        notes: editNotes,
        status: editStatus,
        completionPercentage: Number(editCompletionPercentage)
      });
      
      // Update local state
      setLogs(prev => prev.map(log => {
        if (log._id === editingLog._id) {
          return {
            ...log,
            duration: Number(editDuration),
            caloriesBurned: Number(editCalories),
            notes: editNotes,
            status: editStatus,
            completionPercentage: Number(editCompletionPercentage)
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

  // Log Custom Workout logic
  const handleAddExerciseRow = () => {
    setLogExercises(prev => [...prev, { exerciseName: '', sets: 3, reps: 10, weight: 0, restTime: 60, caloriesBurned: 50, notes: '' }]);
  };

  const handleRemoveExerciseRow = (index) => {
    if (logExercises.length === 1) return;
    setLogExercises(prev => prev.filter((_, i) => i !== index));
  };

  const handleExerciseChange = (index, field, value) => {
    setLogExercises(prev => prev.map((ex, i) => {
      if (i === index) {
        return {
          ...ex,
          [field]: field === 'exerciseName' || field === 'notes' ? value : Number(value)
        };
      }
      return ex;
    }));
  };

  const handleLogCustomWorkout = async (e) => {
    e.preventDefault();
    if (!logName.trim()) {
      alert("Please enter a workout name.");
      return;
    }
    
    // Validate exercises
    const validExercises = logExercises.filter(ex => ex.exerciseName.trim() !== '');
    if (validExercises.length === 0) {
      alert("Please add at least one exercise.");
      return;
    }

    try {
      const payload = {
        workoutName: logName,
        workoutType: logType,
        goal: logGoal,
        difficulty: logDifficulty,
        duration: Number(logDuration),
        caloriesBurned: Number(logCalories),
        notes: logNotes,
        completedAt: logDate,
        exercises: validExercises
      };

      const res = await api.post('/workouts/history', payload);
      setLogs(prev => [res.data.data, ...prev]);
      setShowLogModal(false);
      
      // Reset form
      setLogName('');
      setLogType('Strength');
      setLogGoal('');
      setLogDuration(45);
      setLogCalories(300);
      setLogNotes('');
      setLogExercises([{ exerciseName: '', sets: 3, reps: 10, weight: 0, restTime: 60, caloriesBurned: 50, notes: '' }]);
    } catch (err) {
      console.error("Failed to log custom workout:", err);
      alert("Failed to log workout.");
    }
  };

  // Stats calculations
  const totalWorkouts = logs.length;
  const totalCalories = logs.reduce((sum, log) => sum + (log.caloriesBurned || 0), 0);
  const totalDuration = logs.reduce((sum, log) => sum + (log.duration || 0), 0);
  const averageDuration = totalWorkouts > 0 ? Math.round(totalDuration / totalWorkouts) : 0;

  return (
    <div className="space-y-8 animate-[fade-in-up_0.6s_ease-out_forwards]">
      {/* Header Actions */}
      <div className="relative flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div className="absolute -top-10 -left-10 w-48 h-48 bg-emerald-500/10 rounded-full blur-[80px] pointer-events-none" />
        <div className="relative z-10">
          <Link to="/workouts" className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-emerald-400 transition-colors mb-3">
            <ArrowLeft className="h-4 w-4" /> Back to Library
          </Link>
          <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white via-zinc-200 to-zinc-400">Workout History</h1>
          <p className="mt-1 text-zinc-400 text-sm">Review, edit, and audit all of your past training sessions.</p>
        </div>
        <div className="relative z-10 flex gap-4 w-full sm:w-auto shrink-0">
          <Button onClick={() => setShowLogModal(true)} className="w-full sm:w-auto gap-2">
            <Plus className="h-4 w-4" />
            Log Session
          </Button>
        </div>
      </div>

      {/* Statistics Row */}
      <div className="grid grid-cols-3 gap-6">
        <div className="rounded-2xl border border-white/5 bg-white/[0.01] p-6 text-center backdrop-blur-sm">
          <span className="text-zinc-500 text-xs uppercase tracking-wider block">Sessions Logged</span>
          <span className="text-3xl font-black text-white block mt-1">{totalWorkouts}</span>
        </div>
        <div className="rounded-2xl border border-white/5 bg-white/[0.01] p-6 text-center backdrop-blur-sm">
          <span className="text-zinc-500 text-xs uppercase tracking-wider block">Est. Calories Burned</span>
          <span className="text-3xl font-black text-rose-500 block mt-1">{Math.round(totalCalories)} <span className="text-xs font-normal">kcal</span></span>
        </div>
        <div className="rounded-2xl border border-white/5 bg-white/[0.01] p-6 text-center backdrop-blur-sm">
          <span className="text-zinc-500 text-xs uppercase tracking-wider block">Avg. Session Duration</span>
          <span className="text-3xl font-black text-emerald-400 block mt-1">{averageDuration} <span className="text-xs font-normal">min</span></span>
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
              className="bg-black border border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
            />
            <span className="text-zinc-500 text-xs">to</span>
            <input 
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="bg-black border border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
            />
          </div>
        )}

        <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-sm">
          <input
            type="text"
            placeholder="Search by routine, exercise, notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-black/60 border border-white/10 rounded-xl pl-9 pr-4 py-2 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 focus:border-emerald-500/50"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
        </form>
      </div>

      {/* History Feed */}
      {loading ? (
        <div className="flex h-[20vh] flex-col items-center justify-center gap-4">
          <Loader2 className="h-8 w-8 text-emerald-400 animate-spin" />
          <p className="text-zinc-500 text-sm">Retrieving log files...</p>
        </div>
      ) : logs.length === 0 ? (
        <div className="text-center py-16 bg-white/[0.01] border border-white/5 rounded-[2rem]">
          <Info className="h-10 w-10 text-zinc-600 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-zinc-400">No matching logs in this range</h3>
          <p className="text-zinc-500 text-xs mt-1">Try expanding your timeframe filter or log a direct session.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {logs.map((log) => {
            const isExpanded = !!expandedLogs[log._id];
            const dateStr = new Date(log.completedAt || log.createdAt).toLocaleDateString(undefined, {
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
                {/* Log Summary Header Row */}
                <div 
                  onClick={() => toggleExpand(log._id)}
                  className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer select-none"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-2.5 rounded-xl bg-white/5 text-emerald-400 border border-white/5">
                      <Dumbbell className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-zinc-150 text-base">{log.workoutName}</h4>
                      <div className="flex items-center gap-3 text-xs text-zinc-500 mt-0.5">
                        <span>{log.workoutType}</span>
                        <span>•</span>
                        <span>{dateStr}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 text-sm shrink-0">
                    <div className="flex items-center gap-1.5 text-zinc-300">
                      <Timer className="w-4 h-4 text-emerald-500" />
                      <span>{log.duration} min</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-zinc-300">
                      <Flame className="w-4 h-4 text-rose-500" />
                      <span>{Math.round(log.caloriesBurned)} kcal</span>
                    </div>
                    
                    <div className="flex items-center gap-2 border-l border-white/5 pl-4">
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleStartEdit(log); }}
                        className="p-1.5 text-zinc-500 hover:text-white transition-colors"
                        title="Edit Session details"
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
                      <div className="text-zinc-500 ml-1">
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Expanded Exercises detail */}
                {isExpanded && (
                  <div className="px-5 pb-5 pt-3 border-t border-white/5 bg-black/40 animate-[fade-in_0.2s_ease-out] space-y-4">
                    
                    {/* Workout Summary Details Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 rounded-xl border border-white/5 bg-white/[0.01] text-xs">
                      <div>
                        <span className="text-zinc-500 block uppercase font-bold text-[9px] mb-0.5">Logged Date & Time</span>
                        <span className="text-zinc-200 font-semibold">
                          {dateStr} at {new Date(log.completedAt || log.createdAt).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <div>
                        <span className="text-zinc-500 block uppercase font-bold text-[9px] mb-0.5">Completion Status</span>
                        <span className={`font-semibold capitalize ${log.status === 'completed' || !log.status ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {log.status || 'completed'}
                        </span>
                      </div>
                      <div>
                        <span className="text-zinc-500 block uppercase font-bold text-[9px] mb-0.5">Completion Percentage</span>
                        <span className="text-zinc-200 font-semibold">
                          {log.completionPercentage || 100}%
                        </span>
                      </div>
                      <div>
                        <span className="text-zinc-500 block uppercase font-bold text-[9px] mb-0.5">Est. Calories & Duration</span>
                        <span className="text-zinc-200 font-semibold">
                          {Math.round(log.caloriesBurned)} kcal • {log.duration} min
                        </span>
                      </div>
                    </div>

                    {log.notes && (
                      <div className="text-xs text-zinc-400 bg-white/5 p-3 rounded-xl border border-white/5">
                        <strong className="text-zinc-300 block mb-0.5">Workout Notes:</strong>
                        {log.notes}
                      </div>
                    )}
                    
                    <h5 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2.5">Exercises Completed</h5>
                    {log.exercises?.length > 0 ? (
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs border-collapse">
                          <thead>
                            <tr className="border-b border-white/5 text-zinc-500 font-bold">
                              <th className="py-2 pr-4">Exercise</th>
                              <th className="py-2 pr-4">Sets</th>
                              <th className="py-2 pr-4">Reps</th>
                              <th className="py-2 pr-4">Weight</th>
                              <th className="py-2 pr-4">Rest Time</th>
                              <th className="py-2 pr-4">Calories</th>
                              <th className="py-2">Notes</th>
                            </tr>
                          </thead>
                          <tbody>
                            {log.exercises.map((ex, exIdx) => (
                              <tr key={exIdx} className="border-b border-white/5 text-zinc-350 hover:text-white transition-colors">
                                <td className="py-2.5 pr-4 font-semibold text-zinc-200">{ex.exerciseName}</td>
                                <td className="py-2.5 pr-4">{ex.sets || 0}</td>
                                <td className="py-2.5 pr-4">{ex.reps || 0}</td>
                                <td className="py-2.5 pr-4">{ex.weight || 0} kg</td>
                                <td className="py-2.5 pr-4">{ex.restTime || 0}s</td>
                                <td className="py-2.5 pr-4 text-orange-400">{ex.caloriesBurned || 0} kcal</td>
                                <td className="py-2.5 text-zinc-500 italic max-w-xs truncate">{ex.notes || '-'}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <p className="text-xs text-zinc-500">No exercise detail recorded for this session.</p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Editing Drawer / Modal */}
      {editingLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="relative rounded-[2rem] border border-white/10 bg-zinc-950 p-8 shadow-2xl max-w-md w-full animate-[fade-in-up_0.3s_ease-out]">
            <h3 className="text-xl font-bold text-white mb-6">Edit Workout Log</h3>
            <form onSubmit={handleSaveEdit} className="space-y-4">
              <Input 
                label="Duration (minutes)"
                type="number"
                value={editDuration}
                onChange={(e) => setEditDuration(e.target.value)}
                required
              />
              <Input 
                label="Calories Burned (kcal)"
                type="number"
                value={editCalories}
                onChange={(e) => setEditCalories(e.target.value)}
                required
              />
              
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-400">Completion Status</label>
                  <select 
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value)}
                    className="flex h-10 w-full rounded-xl border border-white/10 bg-black/40 px-3 text-xs text-white focus:outline-none"
                  >
                    <option value="completed">Completed</option>
                    <option value="missed">Missed</option>
                  </select>
                </div>
                <Input 
                  label="Completion %" 
                  type="number" 
                  value={editCompletionPercentage} 
                  onChange={(e) => setEditCompletionPercentage(e.target.value)}
                  required
                />
              </div>

              <div className="flex flex-col space-y-1.5">
                <label className="text-xs font-semibold text-zinc-400">Session Notes</label>
                <textarea 
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  className="flex min-h-[80px] w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  placeholder="How did this workout feel?"
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
            <h3 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-500 mb-6">Log Workout Session</h3>
            
            <form onSubmit={handleLogCustomWorkout} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input 
                  label="Workout Name" 
                  placeholder="e.g., Fast Cardio Run" 
                  value={logName} 
                  onChange={(e) => setLogName(e.target.value)}
                  required
                />
                
                <div className="flex flex-col space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-400">Workout Type</label>
                  <select 
                    value={logType}
                    onChange={(e) => setLogType(e.target.value)}
                    className="flex h-11 w-full rounded-xl border border-white/10 bg-black/40 px-3 text-xs text-white focus:outline-none"
                  >
                    <option value="Strength">Strength</option>
                    <option value="Cardio">Cardio</option>
                    <option value="Flexibility">Flexibility</option>
                    <option value="Hybrid">Hybrid</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <Input 
                  label="Duration (m)" 
                  type="number" 
                  value={logDuration} 
                  onChange={(e) => setLogDuration(e.target.value)}
                  required
                />
                <Input 
                  label="Calories (kcal)" 
                  type="number" 
                  value={logCalories} 
                  onChange={(e) => setLogCalories(e.target.value)}
                  required
                />
                <Input 
                  label="Log Date" 
                  type="date" 
                  value={logDate} 
                  onChange={(e) => setLogDate(e.target.value)}
                  required
                />
              </div>

              {/* Exercises Segment */}
              <div className="space-y-3">
                <div className="flex justify-between items-center border-b border-white/5 pb-2">
                  <h4 className="text-sm font-bold text-zinc-300">Exercises Completed</h4>
                  <button 
                    type="button" 
                    onClick={handleAddExerciseRow}
                    className="text-xs text-emerald-400 hover:text-emerald-300 font-bold"
                  >
                    + Add Exercise
                  </button>
                </div>

                <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1 scrollbar-thin">
                  {logExercises.map((ex, index) => (
                    <div key={index} className="grid grid-cols-12 gap-2 bg-white/[0.01] p-3 rounded-xl border border-white/5 items-end">
                      <div className="col-span-4">
                        <label className="text-[10px] text-zinc-500 font-bold block mb-1">Name</label>
                        <input 
                          type="text" 
                          placeholder="Bench Press"
                          value={ex.exerciseName}
                          onChange={(e) => handleExerciseChange(index, 'exerciseName', e.target.value)}
                          className="w-full bg-black border border-white/10 rounded-lg px-2 py-1 text-xs text-white focus:outline-none"
                        />
                      </div>
                      <div className="col-span-1">
                        <label className="text-[10px] text-zinc-500 font-bold block mb-1">Sets</label>
                        <input 
                          type="number" 
                          value={ex.sets}
                          onChange={(e) => handleExerciseChange(index, 'sets', e.target.value)}
                          className="w-full bg-black border border-white/10 rounded-lg px-1 py-1 text-xs text-white text-center focus:outline-none"
                        />
                      </div>
                      <div className="col-span-1">
                        <label className="text-[10px] text-zinc-500 font-bold block mb-1">Reps</label>
                        <input 
                          type="number" 
                          value={ex.reps}
                          onChange={(e) => handleExerciseChange(index, 'reps', e.target.value)}
                          className="w-full bg-black border border-white/10 rounded-lg px-1 py-1 text-xs text-white text-center focus:outline-none"
                        />
                      </div>
                      <div className="col-span-2">
                        <label className="text-[10px] text-zinc-500 font-bold block mb-1">Weight(kg)</label>
                        <input 
                          type="number" 
                          value={ex.weight}
                          onChange={(e) => handleExerciseChange(index, 'weight', e.target.value)}
                          className="w-full bg-black border border-white/10 rounded-lg px-1 py-1 text-xs text-white text-center focus:outline-none"
                        />
                      </div>
                      <div className="col-span-1.5">
                        <label className="text-[10px] text-zinc-500 font-bold block mb-1">Rest(s)</label>
                        <input 
                          type="number" 
                          value={ex.restTime}
                          onChange={(e) => handleExerciseChange(index, 'restTime', e.target.value)}
                          className="w-full bg-black border border-white/10 rounded-lg px-1 py-1 text-xs text-white text-center focus:outline-none"
                        />
                      </div>
                      <div className="col-span-1.5">
                        <label className="text-[10px] text-zinc-500 font-bold block mb-1">Kcal</label>
                        <input 
                          type="number" 
                          value={ex.caloriesBurned}
                          onChange={(e) => handleExerciseChange(index, 'caloriesBurned', e.target.value)}
                          className="w-full bg-black border border-white/10 rounded-lg px-1 py-1 text-xs text-white text-center focus:outline-none"
                        />
                      </div>
                      <div className="col-span-1 flex justify-center pb-0.5">
                        <button 
                          type="button" 
                          onClick={() => handleRemoveExerciseRow(index)}
                          className="text-zinc-500 hover:text-red-400 p-1.5 transition-colors"
                          title="Remove Exercise"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex flex-col space-y-1">
                <label className="text-xs font-semibold text-zinc-400">Notes / Details</label>
                <textarea 
                  placeholder="Workout comments..." 
                  value={logNotes} 
                  onChange={(e) => setLogNotes(e.target.value)}
                  className="flex min-h-[60px] w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
                <Button type="button" variant="ghost" onClick={() => setShowLogModal(false)}>Cancel</Button>
                <Button type="submit">Log Workout Session</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
