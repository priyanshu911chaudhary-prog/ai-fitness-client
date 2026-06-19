import { useState  } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, BrainCircuit } from 'lucide-react';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';

// 1. Define the validation schema
const loginSchema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export default function Login() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState('');

  // 2. Initialize React Hook Form
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(loginSchema),
  });

  // 3. Handle the form submission
  const onSubmit = async (data) => {
    setIsLoading(true);
    setServerError('');
    
    try {
      console.log('Submitting payload:', data);
      
      // MOCK API CALL - Replace with real call later
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay

      localStorage.setItem('accessToken', 'ock-demo-token-123');
      
      // Redirect to dashboard on success
      navigate('/dashboard');
    } catch (error) {
      setServerError(error.response?.data?.message || "Invalid credentials. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-zinc-950 p-4 overflow-hidden selection:bg-emerald-500/30">
      {/* Background Glows */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-[120px] pointer-events-none" />
      
      <Link to="/" className="absolute top-8 left-8 flex items-center gap-2 text-sm font-medium text-zinc-400 hover:text-white transition-colors z-10">
        <ArrowLeft className="w-4 h-4" /> Home
      </Link>

      <div className="relative z-10 w-full max-w-md rounded-[2rem] border border-zinc-800/60 bg-zinc-900/40 p-8 shadow-2xl shadow-emerald-500/10 backdrop-blur-xl animate-[fade-in-up_0.6s_ease-out_forwards]">
        <div className="mb-8 text-center flex flex-col items-center">
          <BrainCircuit className="w-10 h-10 text-emerald-400 mb-4" />
          <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-500">Welcome Back</h1>
          <p className="mt-2 text-sm text-zinc-400">Enter your credentials to access your fitness hub.</p>
        </div>

        {serverError && (
          <div className="mb-4 rounded-md bg-red-500/10 p-3 text-sm text-red-400 border border-red-500/20">
            {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <Input 
            label="Email Address"
            type="email"
            placeholder="you@example.com"
            error={errors.email?.message}
            {...register('email')}
          />
          
          <div className="space-y-1">
            <Input 
              label="Password"
              type="password"
              placeholder="••••••••"
              error={errors.password?.message}
              {...register('password')}
            />
            <div className="flex justify-end">
              <Link to="/forgot-password" className="text-xs text-emerald-500 hover:text-emerald-400">
                Forgot password?
              </Link>
            </div>
          </div>

          <Button 
            type="submit" 
            className="w-full mt-2" 
            disabled={isLoading}
          >
            {isLoading ? 'Authenticating...' : 'Log In'}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-zinc-400">
          Don't have an account?{' '}
          <Link to="/signup" className="font-medium text-emerald-500 hover:text-emerald-400 transition-colors">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}