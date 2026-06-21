import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, BrainCircuit, CheckCircle } from 'lucide-react';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { api } from '../../utils/api'; 
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import { PublicClientApplication } from "@azure/msal-browser";

// 1. Define the validation schema with password confirmation
const signupSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  email: z.string().min(1, "Email is required").email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().min(1, "Please confirm your password"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"], // Attaches the error to the confirmPassword input
});

export default function Signup() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  // 2. Initialize React Hook Form
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(signupSchema),
  });

  // 3. Handle the form submission
  const onSubmit = async (data) => {
    setIsLoading(true);
    setServerError('');
    
    try {
      console.log('Submitting signup payload:', data);
      
      // Real API CALL 
      await api.post('/auth/signup', {
        fullName: data.fullName,
        email: data.email,
        password: data.password
      }); 
      
      // Show success state instead of immediately redirecting
      setIsSuccess(true);
    } catch (error) {
      setServerError(error.response?.data?.message || "Registration failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleMicrosoftLogin = async () => {
    setIsLoading(true);
    setServerError('');
    try {
      const pca = new PublicClientApplication({
        auth: {
          clientId: "537f1e34-78ee-4f6e-816e-a8cea6552c56",
          authority: "https://login.microsoftonline.com/common",
          redirectUri: window.location.origin,
        },
      });
      await pca.initialize();
      const response = await pca.loginPopup({
        scopes: ["openid", "profile", "email"],
      });
      const idToken = response.idToken;

      const res = await api.post('/auth/microsoft', { idToken });
      localStorage.setItem('accessToken', res.data.data.accessToken);
      localStorage.setItem('user', JSON.stringify(res.data.data.user));
      navigate('/dashboard');
    } catch (err) {
      console.error("Microsoft login error:", err);
      setServerError(err.response?.data?.message || err.message || "Microsoft login failed.");
    } finally {
      setIsLoading(false);
    }
  };

  // Render success message for email verification
  if (isSuccess) {
    return (
      <div className="relative flex min-h-dvh items-center justify-center bg-zinc-950 p-4 overflow-hidden selection:bg-emerald-500/30">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-[120px] pointer-events-none" />
        
        <div className="relative z-10 w-full max-w-md rounded-[2rem] border border-zinc-800/60 bg-zinc-900/40 p-8 text-center shadow-2xl shadow-emerald-500/10 backdrop-blur-xl animate-[fade-in-up_0.6s_ease-out_forwards]">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10 border border-emerald-500/20 shadow-[0_0_20px_rgba(16,185,129,0.2)]">
            <CheckCircle className="h-8 w-8 text-emerald-400" />
          </div>
          <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-500">Check your email</h2>
          <p className="mt-3 text-zinc-400 leading-relaxed">
            We've sent a verification link. Please verify your email to continue.
          </p>
          <Button 
            className="w-full mt-6" 
            onClick={() => navigate('/login')}
          >
            Go to Login
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-dvh items-center justify-center bg-zinc-950 p-4 overflow-hidden selection:bg-emerald-500/30">
      {/* Background Glows */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-[120px] pointer-events-none" />
      
      <Link to="/" className="absolute top-8 left-8 flex items-center gap-2 text-sm font-medium text-zinc-400 hover:text-white transition-colors z-10">
        <ArrowLeft className="w-4 h-4" /> Home
      </Link>

      <div className="relative z-10 w-full max-w-md rounded-[2rem] border border-zinc-800/60 bg-zinc-900/40 p-8 shadow-2xl shadow-emerald-500/10 backdrop-blur-xl animate-[fade-in-up_0.6s_ease-out_forwards]">
        <div className="mb-8 text-center flex flex-col items-center">
          <BrainCircuit className="w-10 h-10 text-emerald-400 mb-4" />
          <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-500">Create Account</h1>
          <p className="mt-2 text-sm text-zinc-400">Start your fitness journey today.</p>
        </div>

        {serverError && (
          <div className="mb-4 rounded-md bg-red-500/10 p-3 text-sm text-red-400 border border-red-500/20">
            {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input 
            label="Full Name"
            placeholder="John Doe"
            error={errors.fullName?.message}
            {...register('fullName')}
          />

          <Input 
            label="Email Address"
            type="email"
            placeholder="you@example.com"
            error={errors.email?.message}
            {...register('email')}
          />
          
          <Input 
            label="Password"
            type="password"
            placeholder="••••••••"
            error={errors.password?.message}
            {...register('password')}
          />

          <Input 
            label="Confirm Password"
            type="password"
            placeholder="••••••••"
            error={errors.confirmPassword?.message}
            {...register('confirmPassword')}
          />

          <Button 
            type="submit" 
            className="w-full mt-2" 
            disabled={isLoading}
          >
            {isLoading ? 'Creating Account...' : 'Sign Up'}
          </Button>
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-zinc-850"></div>
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-zinc-950 px-2 text-zinc-550">Or continue with</span>
          </div>
        </div>

        <div className="flex flex-col gap-4 items-center">
          <div className="flex justify-center w-full">
            <GoogleOAuthProvider clientId="946927389105-5ji6kuvvtbnkvqubinabock014v26gsl.apps.googleusercontent.com">
              <GoogleLogin
                onSuccess={async (credentialResponse) => {
                  const idToken = credentialResponse.credential;
                  setIsLoading(true);
                  setServerError('');
                  try {
                    const response = await api.post('/auth/google', { idToken });
                    if (response && response.data && response.data.data) {
                      const authData = response.data.data;
                      localStorage.setItem('accessToken', authData.accessToken);
                      localStorage.setItem('user', JSON.stringify(authData.user));
                      navigate('/dashboard');
                    }
                  } catch (err) {
                    console.error("Google login error:", err);
                    setServerError(err.response?.data?.message || "Google login failed.");
                  } finally {
                    setIsLoading(false);
                  }
                }}
                onError={() => {
                  console.log('Login Failed');
                  setServerError("Google login failed. Please try again.");
                }}
                theme="filled_dark"
                shape="pill"
                size="large"
                width="280px"
              />
            </GoogleOAuthProvider>
          </div>
          
          <button
            type="button"
            onClick={handleMicrosoftLogin}
            disabled={isLoading}
            className="flex items-center justify-center gap-2 rounded-full border border-zinc-800 bg-zinc-900/50 hover:bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-zinc-300 hover:text-white transition-all duration-300 active:scale-95 disabled:opacity-50 w-[280px]"
          >
            <svg className="h-5 w-5" viewBox="0 0 23 23">
              <rect x="0" y="0" width="11" height="11" fill="#F25022" />
              <rect x="12" y="0" width="11" height="11" fill="#7FBA00" />
              <rect x="0" y="12" width="11" height="11" fill="#00A4EF" />
              <rect x="12" y="12" width="11" height="11" fill="#FFB900" />
            </svg>
            Continue with Microsoft
          </button>
        </div>

        <p className="mt-6 text-center text-sm text-zinc-400">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-emerald-500 hover:text-emerald-400 transition-colors">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}