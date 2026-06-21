import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { CheckCircle2, XCircle, Loader2, ArrowLeft, BrainCircuit } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { api } from '../../utils/api';

export default function VerifyEmail() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('loading'); // 'loading' | 'success' | 'error'
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const verifyUserEmail = async () => {
      if (!token) {
        setStatus('error');
        setErrorMessage('Invalid verification token.');
        return;
      }

      try {
        await api.get(`/auth/verify-email/${token}`);
        setStatus('success');
      } catch (err) {
        console.error("Email verification failed:", err);
        setStatus('error');
        setErrorMessage(err.response?.data?.message || 'Verification link is invalid or has expired.');
      }
    };

    verifyUserEmail();
  }, [token]);

  return (
    <div className="relative flex min-h-dvh items-center justify-center bg-zinc-950 p-4 overflow-hidden selection:bg-emerald-500/30">
      {/* Background Glows */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative z-10 w-full max-w-md rounded-[2rem] border border-zinc-800/60 bg-zinc-900/40 p-8 text-center shadow-2xl shadow-emerald-500/10 backdrop-blur-xl animate-[fade-in-up_0.6s_ease-out_forwards]">
        <div className="mb-8 text-center flex flex-col items-center">
          <BrainCircuit className="w-10 h-10 text-emerald-400 mb-4" />
          <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-500">Email Verification</h1>
        </div>

        {status === 'loading' && (
          <div className="flex flex-col items-center justify-center py-8 gap-4">
            <Loader2 className="h-12 w-12 text-emerald-400 animate-spin" />
            <p className="text-zinc-300 font-medium">Verifying your email address...</p>
            <p className="text-zinc-500 text-sm">This will take just a second.</p>
          </div>
        )}

        {status === 'success' && (
          <div className="space-y-6">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10 border border-emerald-500/20 shadow-[0_0_20px_rgba(16,185,129,0.2)]">
              <CheckCircle2 className="h-8 w-8 text-emerald-400" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-white">Verification Complete!</h2>
              <p className="text-zinc-400 text-sm leading-relaxed">
                Thank you! Your email has been verified successfully. You can now log in to start your fitness journey.
              </p>
            </div>
            <Button className="w-full" onClick={() => navigate('/login')}>
              Go to Login
            </Button>
          </div>
        )}

        {status === 'error' && (
          <div className="space-y-6">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10 border border-red-500/20 shadow-[0_0_20px_rgba(239,68,68,0.2)]">
              <XCircle className="h-8 w-8 text-red-400" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-white">Verification Failed</h2>
              <p className="text-red-400/80 text-sm font-medium">
                {errorMessage}
              </p>
              <p className="text-zinc-500 text-xs leading-relaxed pt-2">
                If you believe this is an error, please try signing up again or request a new verification token.
              </p>
            </div>
            <div className="flex gap-4">
              <Button className="flex-1" variant="outline" onClick={() => navigate('/login')}>
                Back to Login
              </Button>
              <Button className="flex-1" onClick={() => navigate('/signup')}>
                Sign Up Again
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
