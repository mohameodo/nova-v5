import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Github, Chrome, ArrowRight } from 'lucide-react';
import { YahooIcon } from '@/components/icons';
import { Link, useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

const Register = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    displayName: '',
    password: '',
    confirmPassword: ''
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const { signUp, signInWithGoogle, signInWithGithub, signInWithYahoo } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (step === 1) {
      if (!formData.displayName || !formData.username || !formData.email) {
        toast({
          title: "Error",
          description: "Please fill in all fields",
          variant: "destructive",
        });
        return;
      }
      setStep(2);
      return;
    }

    // Step 2: Password validation
    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      await signUp(formData.email, formData.password, formData.displayName, formData.username);
      toast({ title: "Success", description: "Account created successfully" });
      navigate('/');
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create account",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialSignUp = async (provider: 'google' | 'github' | 'yahoo') => {
    setIsLoading(true);
    try {
      const methods = {
        google: signInWithGoogle,
        github: signInWithGithub,
        yahoo: signInWithYahoo
      };
      await methods[provider]();
      navigate('/');
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to sign up",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col md:flex-row-reverse">
      {/* Form side */}
      <div className="flex-1 flex items-center justify-center p-4 md:p-8">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-2xl md:text-3xl font-bold text-white">Create Account</h2>
            <p className="text-sm text-gray-400">Join Nova AI today</p>
          </div>

          <div className="grid gap-3">
            <Button
              variant="outline"
              className="h-11 bg-transparent border-gray-700 hover:bg-gray-800"
              onClick={() => handleSocialSignUp('google')}
              disabled={isLoading}
            >
              <Chrome className="mr-2 h-5 w-5" />
              Continue with Google
            </Button>
            
            <Button
              variant="outline"
              className="h-11 bg-transparent border-gray-700 hover:bg-gray-800"
              onClick={() => handleSocialSignUp('github')}
              disabled={isLoading}
            >
              <Github className="mr-2 h-5 w-5" />
              Continue with GitHub
            </Button>

            <Button
              variant="outline"
              className="h-11 bg-transparent border-gray-700 hover:bg-gray-800"
              onClick={() => handleSocialSignUp('yahoo')}
              disabled={isLoading}
            >
              <YahooIcon className="mr-2 h-5 w-5 text-purple-500" />
              Continue with Yahoo
            </Button>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-gray-700" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-[#1d1e20] px-2 text-gray-500">Or continue with email</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {step === 1 ? (
              <>
                <Input
                  placeholder="Display Name"
                  value={formData.displayName}
                  onChange={e => setFormData({...formData, displayName: e.target.value})}
                  className="h-11 bg-gray-900/50 border-gray-700"
                  disabled={isLoading}
                />
                <Input
                  placeholder="Username"
                  value={formData.username}
                  onChange={e => setFormData({...formData, username: e.target.value})}
                  className="h-11 bg-gray-900/50 border-gray-700"
                  disabled={isLoading}
                />
                <Input
                  type="email"
                  placeholder="Email"
                  value={formData.email}
                  onChange={e => setFormData({...formData, email: e.target.value})}
                  className="h-11 bg-gray-900/50 border-gray-700"
                  disabled={isLoading}
                />
              </>
            ) : (
              <>
                <Input
                  type="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={e => setFormData({...formData, password: e.target.value})}
                  className="h-11 bg-gray-900/50 border-gray-700"
                  disabled={isLoading}
                />
                <Input
                  type="password"
                  placeholder="Confirm Password"
                  value={formData.confirmPassword}
                  onChange={e => setFormData({...formData, confirmPassword: e.target.value})}
                  className="h-11 bg-gray-900/50 border-gray-700"
                  disabled={isLoading}
                />
              </>
            )}

            <div className="flex items-center justify-between text-sm">
              <Link to="/login" className="text-blue-500 hover:text-blue-400">
                Already have an account?
              </Link>
            </div>

            <Button
              type="submit"
              className="w-full h-11 bg-blue-600 hover:bg-blue-700"
              disabled={isLoading}
            >
              {isLoading ? "Creating Account..." : step === 1 ? "Next" : "Create Account"}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </form>
        </div>
      </div>

      {/* Branding side */}
      <div className="hidden md:flex flex-1 bg-gradient-to-bl from-gray-900 to-black items-center justify-center p-8">
        <div className="max-w-md text-center space-y-6">
          <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-blue-600">
            Welcome to Nova AI
          </h1>
          <p className="text-gray-400">
            Experience the future of AI-powered conversations
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
