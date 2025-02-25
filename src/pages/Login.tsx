import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Github, Chrome, ArrowRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { signInWithGoogle, signInWithGithub, signInWithEmail } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      await signInWithEmail(email, password);
      toast({ title: "Success", description: "Signed in successfully" });
      navigate('/');
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.code === 'auth/wrong-password' 
          ? "Invalid email or password"
          : error.message || "Failed to sign in",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async (provider: 'google' | 'github') => {
    setIsLoading(true);
    try {
      await (provider === 'google' ? signInWithGoogle() : signInWithGithub());
      toast({ title: "Success", description: "Signed in successfully" });
      navigate('/');
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to sign in",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#1d1e20]">
      <div className="w-full max-w-md space-y-8 p-8 bg-[#1d1e20] rounded-lg border border-gray-800">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-white">Welcome to Nova</h2>
          <p className="mt-2 text-gray-400">Sign in to continue</p>
        </div>
        
        <form onSubmit={handleEmailSignIn} className="space-y-4">
          <Input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="bg-gray-900 border-gray-700"
            disabled={isLoading}
            required
          />
          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="bg-gray-900 border-gray-700"
            disabled={isLoading}
            required
            minLength={6}
          />
          <Button 
            type="submit"
            className="w-full bg-white/10 hover:bg-white/20 text-white"
            size="lg"
            disabled={isLoading}
          >
            {isLoading ? "Signing in..." : "Sign in with Email"}
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </form>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-gray-700" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-[#1d1e20] px-2 text-gray-500">Or continue with</span>
          </div>
        </div>

        <div className="space-y-4">
          <Button 
            className="w-full bg-white/10 hover:bg-white/20 text-white"
            size="lg"
            onClick={() => handleLogin('google')}
            disabled={isLoading}
          >
            <Chrome className="mr-2 h-5 w-5" />
            Continue with Google
          </Button>
          
          <Button
            className="w-full bg-white/10 hover:bg-white/20 text-white"
            size="lg"
            onClick={() => handleLogin('github')}
            disabled={isLoading}
          >
            <Github className="mr-2 h-5 w-5" />
            Continue with GitHub
          </Button>

          <div className="text-center space-y-2">
            <p className="text-sm text-gray-500">
              By continuing, you agree to our Terms of Service and Privacy Policy
            </p>
            <p className="text-sm text-gray-400">
              Don't have an account?{" "}
              <Link to="/register" className="text-blue-500 hover:text-blue-400">
                Register here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
