import React, { useState } from 'react';
import { useNavigate, Link, Navigate } from 'react-router-dom';
import { Shield, Loader2, Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const GoogleIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="w-5 h-5">
    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.7 17.74 9.5 24 9.5z"/>
    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
  </svg>
);

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) return toast.error("Please fill in all fields");
    
    setIsSubmitting(true);
    try {
      await login(email, password);
      toast.success("Welcome back!");
      navigate('/');
    } catch (error) {
      toast.error(error.response?.data?.message || "Invalid credentials. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0d1117] flex items-center justify-center p-4 font-sans text-slate-300 relative">
      
      {/* Helper dots menu in upper right like in the image */}
      <div className="absolute top-6 right-6">
        <button className="p-2 bg-[#161b22] hover:bg-slate-800 rounded-lg border border-slate-700/50 text-slate-400 transition-colors">
           <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>
        </button>
      </div>

      <div className="w-full max-w-[400px]">
        {/* Header Area */}
        <div className="flex flex-col items-center mb-10">
          <div className="p-3 bg-[#0d1117] border border-slate-700/60 rounded-2xl mb-5 shadow-sm">
            <Shield className="w-8 h-8 text-[#6c5ce7]" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Crisora AI</h1>
          <p className="text-slate-400 mt-2 text-sm font-medium">Sign in to your account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email Input */}
          <div className="space-y-1.5">
            <label className="block text-[11px] font-bold text-slate-400 tracking-wider uppercase">Email</label>
            <div className="flex items-center bg-[#161b22] border border-slate-700/80 rounded-xl focus-within:border-[#6c5ce7] focus-within:shadow-[0_0_0_1px_#6c5ce7] transition-all overflow-hidden group">
              <div className="pl-4 pr-2 py-3 flex items-center justify-center">
                <Mail className="w-5 h-5 text-slate-500 group-focus-within:text-[#6c5ce7] transition-colors" />
              </div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 bg-transparent border-none text-slate-200 focus:outline-none focus:ring-0 py-3.5 pr-4 text-sm placeholder-slate-500"
                placeholder="name@example.com"
              />
            </div>
          </div>

          {/* Password Input */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="block text-[11px] font-bold text-slate-400 tracking-wider uppercase">Password</label>
              <button type="button" className="text-[11px] font-bold text-[#6c5ce7] hover:text-[#5a4bcf] transition-colors">
                Forgot password?
              </button>
            </div>
            <div className="flex items-center bg-[#161b22] border border-slate-700/80 rounded-xl focus-within:border-[#6c5ce7] focus-within:shadow-[0_0_0_1px_#6c5ce7] transition-all overflow-hidden group">
              <div className="pl-4 pr-2 py-3 flex items-center justify-center">
                <Lock className="w-5 h-5 text-slate-500 group-focus-within:text-[#6c5ce7] transition-colors" />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="flex-1 bg-transparent border-none text-slate-200 focus:outline-none focus:ring-0 py-3.5 pr-2 text-sm placeholder-slate-500"
                placeholder="••••••••"
              />
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)}
                className="pr-4 pl-2 py-3 text-slate-500 hover:text-slate-300 transition-colors focus:outline-none flex items-center justify-center"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 px-4 bg-[#6c5ce7] hover:bg-[#7b6ced] active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100 disabled:cursor-not-allowed rounded-xl font-bold text-white transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#6c5ce7]/20 mt-4"
          >
            {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : (
              <>
                Sign in <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="mt-8 mb-6 relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-800"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-3 bg-[#0d1117] text-slate-500 font-medium text-xs">or</span>
          </div>
        </div>

        {/* Google OAuth Button */}
        <button
          type="button"
          onClick={() => toast("Google OAuth coming soon!")}
          className="w-full py-3 px-4 bg-[#0d1117] border border-slate-700/80 hover:bg-slate-800/50 hover:border-slate-600 rounded-xl font-semibold text-slate-300 transition-all flex items-center justify-center gap-3 active:scale-[0.98]"
        >
          <GoogleIcon />
          Continue with Google
        </button>

        {/* Footer */}
        <p className="mt-8 text-center text-slate-400 text-sm font-medium">
          Don't have an account?{' '}
          <Link to="/register" className="text-[#6c5ce7] hover:text-[#5a4bcf] font-bold transition-colors">
            Sign up
          </Link>
        </p>

      </div>
    </div>
  );
};

export default LoginPage;
