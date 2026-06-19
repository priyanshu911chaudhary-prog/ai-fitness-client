import { useForm } from 'react-hook-form';
import { User, Scale, Target } from 'lucide-react';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';

export default function Profile() {
  const { register, handleSubmit } = useForm({
    defaultValues: {
      fullName: "Dev",
      age: 20,
      weight: 72,
      targetWeight: 75,
      height: 178,
      activityLevel: "Active",
      goal: "Muscle Gain"
    }
  });

  const onSubmit = (data) => {
    console.log("Profile updated:", data);
    // Future integration: PATCH request to /api/v1/users/profile
  };

  return (
    <div className="max-w-4xl space-y-8 animate-[fade-in-up_0.6s_ease-out_forwards]">
      <div className="relative">
        <div className="absolute -top-10 -left-10 w-48 h-48 bg-teal-500/10 rounded-full blur-[80px] pointer-events-none" />
        <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-500">Profile Settings</h1>
        <p className="mt-2 text-zinc-400">Manage your personal metrics and application preferences.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
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
            <Input label="Full Name" {...register('fullName')} />
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

        {/* Goals Card */}
        <div className="group relative rounded-[2rem] border border-zinc-800/60 bg-zinc-900/40 p-8 shadow-xl backdrop-blur-xl transition-all hover:border-blue-500/30 overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl group-hover:bg-blue-500/10 transition-colors pointer-events-none" />
          <div className="relative z-10 flex items-center gap-4 mb-8 border-b border-zinc-800/50 pb-4">
            <div className="p-3 bg-blue-500/10 rounded-xl border border-blue-500/20">
              <Target className="h-6 w-6 text-blue-400" />
            </div>
            <h2 className="text-xl font-bold text-white">Fitness Goals</h2>
          </div>
          
          <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="flex flex-col space-y-1.5 w-full">
              <label className="text-sm font-medium text-zinc-300">Primary Goal</label>
              <select className="flex h-11 w-full rounded-xl border border-zinc-800/80 bg-zinc-900/50 backdrop-blur-md px-4 py-2 text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all duration-300" {...register('goal')}>
                <option value="Fat Loss">Fat Loss</option>
                <option value="Maintenance">Maintenance</option>
                <option value="Muscle Gain">Muscle Gain</option>
              </select>
            </div>

            <div className="flex flex-col space-y-1.5 w-full">
              <label className="text-sm font-medium text-zinc-300">Activity Level</label>
              <select className="flex h-11 w-full rounded-xl border border-zinc-800/80 bg-zinc-900/50 backdrop-blur-md px-4 py-2 text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all duration-300" {...register('activityLevel')}>
                <option value="Sedentary">Sedentary</option>
                <option value="Lightly Active">Lightly Active</option>
                <option value="Active">Active</option>
                <option value="Very Active">Very Active</option>
              </select>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <Button type="submit" size="lg" className="px-10">Save Changes</Button>
        </div>
      </form>
    </div>
  );
}