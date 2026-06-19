import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useLocation, useNavigate } from 'react-router-dom';
import { User, Scale, Target, Apple } from 'lucide-react';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { api } from '../../utils/api';

export default function Profile() {
  const location = useLocation();
  const navigate = useNavigate();
  const needSetup = location.state?.needSetup;
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const { register, handleSubmit, reset } = useForm({
    defaultValues: {
      fullName: "",
      age: 20,
      weight: 70,
      targetWeight: 70,
      height: 170,
      activityLevel: "moderate",
      goal: "muscle_building",
      dietPreference: "Non-Vegetarian"
    }
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get('/profile');
        if (res.data && res.data.data) {
          const profile = res.data.data;
          const userStr = localStorage.getItem('user');
          const user = userStr ? JSON.parse(userStr) : {};

          reset({
            fullName: user.fullName || "User",
            age: profile.age || 20,
            weight: profile.weight || 70,
            targetWeight: profile.targetWeight || 70,
            height: profile.height || 170,
            activityLevel: profile.activityLevel || "moderate",
            goal: profile.goal || "muscle_building",
            dietPreference: profile.dietPreference || "Non-Vegetarian"
          });
        }
      } catch (err) {
        console.log("No profile found or error fetching profile:", err);
        // Fallback to localStorage user name if profile doesn't exist yet
        const userStr = localStorage.getItem('user');
        if (userStr) {
          const user = JSON.parse(userStr);
          reset({
            fullName: user.fullName || "User",
            age: 20,
            weight: 70,
            targetWeight: 70,
            height: 170,
            activityLevel: "moderate",
            goal: "muscle_building",
            dietPreference: "Non-Vegetarian"
          });
        }
      }
    };
    fetchProfile();
  }, [reset]);

  const onSubmit = async (data) => {
    console.log("onSubmit called with:", data);
    setIsLoading(true);
    setMessage('');
    setErrorMessage('');
    
    try {
      const profilePayload = {
        height: Number(data.height),
        weight: Number(data.weight),
        targetWeight: Number(data.targetWeight),
        activityLevel: data.activityLevel,
        goal: data.goal,
        dietPreference: data.dietPreference,
      };

      console.log("Sending profile payload:", profilePayload);
      await api.patch('/profile', profilePayload);
      setMessage('Profile updated successfully!');
      
      // Redirect to dashboard on success
      setTimeout(() => {
        navigate('/dashboard');
      }, 1000);
    } catch (err) {
      console.error("API error during profile update:", err);
      setErrorMessage(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl space-y-8 animate-[fade-in-up_0.6s_ease-out_forwards]">
      <div className="relative">
        <div className="absolute -top-10 -left-10 w-48 h-48 bg-teal-500/10 rounded-full blur-[80px] pointer-events-none" />
        <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-500">Profile Settings</h1>
        <p className="mt-2 text-zinc-400">Manage your personal metrics and application preferences.</p>
      </div>

      {needSetup && (
        <div className="rounded-[1.5rem] bg-amber-500/10 p-5 text-sm text-amber-400 border border-amber-500/20 backdrop-blur-md animate-[fade-in-up_0.4s_ease-out_forwards]">
          <h4 className="font-bold mb-1">Onboarding Required</h4>
          Please enter your height, weight, and target weight to complete your profile setup. This initializes your calorie metrics and unlocks your AI meal and workout plan generators!
        </div>
      )}

      {message && (
        <div className="rounded-md bg-emerald-500/10 p-4 text-sm text-emerald-400 border border-emerald-500/20">
          {message}
        </div>
      )}

      {errorMessage && (
        <div className="rounded-md bg-red-500/10 p-4 text-sm text-red-400 border border-red-500/20">
          {errorMessage}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit, (err) => console.error("Form validation errors:", err))} className="space-y-8">
        {/* Personal Info Card */}
        <div className="group relative rounded-[2rem] border border-zinc-800/60 bg-zinc-900/40 p-8 shadow-xl backdrop-blur-xl transition-all hover:border-emerald-500/30 overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl group-hover:bg-emerald-500/10 transition-colors pointer-events-none" />
          <div className="relative z-10 flex items-center gap-4 mb-8 border-b border-zinc-800/50 pb-4">
            <div className="p-3 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
              <User className="h-6 w-6 text-emerald-400" />
            </div>
            <h2 className="text-xl font-bold text-white">Personal Information</h2>
          </div>
          
          <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-8">
            <Input label="Full Name" disabled {...register('fullName')} />
            <Input label="Age" type="number" {...register('age')} />
          </div>
        </div>

        {/* Body Metrics Card */}
        <div className="group relative rounded-[2rem] border border-zinc-800/60 bg-zinc-900/40 p-8 shadow-xl backdrop-blur-xl transition-all hover:border-teal-500/30 overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/5 rounded-full blur-3xl group-hover:bg-teal-500/10 transition-colors pointer-events-none" />
          <div className="relative z-10 flex items-center gap-4 mb-8 border-b border-zinc-800/50 pb-4">
            <div className="p-3 bg-teal-500/10 rounded-xl border border-teal-500/20">
              <Scale className="h-6 w-6 text-teal-400" />
            </div>
            <h2 className="text-xl font-bold text-white">Body Metrics</h2>
          </div>
          
          <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-8">
            <Input label="Current Weight (kg)" type="number" {...register('weight')} />
            <Input label="Target Weight (kg)" type="number" {...register('targetWeight')} />
            <Input label="Height (cm)" type="number" {...register('height')} />
          </div>
        </div>

        {/* Goals & Preferences Card */}
        <div className="group relative rounded-[2rem] border border-zinc-800/60 bg-zinc-900/40 p-8 shadow-xl backdrop-blur-xl transition-all hover:border-blue-500/30 overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl group-hover:bg-blue-500/10 transition-colors pointer-events-none" />
          <div className="relative z-10 flex items-center gap-4 mb-8 border-b border-zinc-800/50 pb-4">
            <div className="p-3 bg-blue-500/10 rounded-xl border border-blue-500/20">
              <Target className="h-6 w-6 text-blue-400" />
            </div>
            <h2 className="text-xl font-bold text-white">Fitness Goals & Preferences</h2>
          </div>
          
          <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex flex-col space-y-1.5 w-full">
              <label className="text-sm font-medium text-zinc-300">Primary Goal</label>
              <select className="flex h-11 w-full rounded-xl border border-zinc-800/80 bg-zinc-900/50 backdrop-blur-md px-4 py-2 text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all duration-300" {...register('goal')}>
                <option value="weight_loss">Weight Loss</option>
                <option value="weight_gain">Weight Gain</option>
                <option value="muscle_building">Muscle Building</option>
                <option value="running">Running</option>
                <option value="strength_training">Strength Training</option>
                <option value="endurance">Endurance</option>
              </select>
            </div>

            <div className="flex flex-col space-y-1.5 w-full">
              <label className="text-sm font-medium text-zinc-300">Activity Level</label>
              <select className="flex h-11 w-full rounded-xl border border-zinc-800/80 bg-zinc-900/50 backdrop-blur-md px-4 py-2 text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all duration-300" {...register('activityLevel')}>
                <option value="sedentary">Sedentary</option>
                <option value="light">Lightly Active</option>
                <option value="moderate">Moderately Active</option>
                <option value="active">Active</option>
                <option value="very_active">Very Active</option>
              </select>
            </div>

            <div className="flex flex-col space-y-1.5 w-full">
              <label className="text-sm font-medium text-zinc-300">Diet Preference</label>
              <select className="flex h-11 w-full rounded-xl border border-zinc-800/80 bg-zinc-900/50 backdrop-blur-md px-4 py-2 text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all duration-300" {...register('dietPreference')}>
                <option value="Vegetarian">Vegetarian</option>
                <option value="Non-Vegetarian">Non-Vegetarian</option>
                <option value="Vegan">Vegan</option>
                <option value="Eggetarian">Eggetarian</option>
              </select>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <Button type="submit" size="lg" disabled={isLoading} className="px-10">
            {isLoading ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </form>
    </div>
  );
}