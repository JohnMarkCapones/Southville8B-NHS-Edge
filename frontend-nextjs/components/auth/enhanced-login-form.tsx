/**
 * Enhanced Login Form with Progressive Rate Limiting
 * 
 * Features:
 * - Progressive rate limiting (5→1min, 8→5min, 10→15min)
 * - React Hook Form + Zod validation
 * - Beautiful UI with lockout warnings
 * - Loading states and error handling
 * - Mobile responsive design
 */

'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AnimatedButton } from '@/components/ui/animated-button';
import { RateLimitWarning } from './rate-limit-warning';
import { useProgressiveRateLimit } from '@/lib/hooks/use-progressive-rate-limit';
import { loginAction } from '@/app/actions/auth';
import { Eye, EyeOff, LogIn, User, Users, GraduationCap, Shield, Sparkles, Zap, Star, Loader2, AlertCircle } from 'lucide-react';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';
import { useRouter, useSearchParams } from 'next/navigation';

// Validation schema
const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormData = z.infer<typeof loginSchema>;

interface LoginType {
  id: string;
  title: string;
  description: string;
  icon: any;
  color: string;
  gamingColor: string;
}

interface EnhancedLoginFormProps {
  className?: string;
}

export function EnhancedLoginForm({ className }: EnhancedLoginFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [activeTab, setActiveTab] = useState('student');
  const [isLoading, setIsLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const { theme } = useTheme();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const isGamingTheme = theme === 'gaming';
  const redirectTo = searchParams.get('redirect') || '/student/dashboard';

  // Progressive rate limiting
  const {
    isLockedOut,
    remainingTime,
    lockoutLevel,
    attemptCount,
    canAttempt,
    recordFailedAttempt,
    recordSuccessfulLogin,
    resetAttempts,
  } = useProgressiveRateLimit();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const loginTypes: LoginType[] = [
    {
      id: 'student',
      title: 'Student Portal',
      description: 'Access your grades, assignments, and school resources',
      icon: User,
      color: 'from-blue-500 to-blue-600',
      gamingColor: 'from-gaming-neon-blue to-gaming-neon-cyan',
    },
    {
      id: 'parent',
      title: 'Parent Portal',
      description: 'Monitor your child\'s progress and school activities',
      icon: Users,
      color: 'from-green-500 to-green-600',
      gamingColor: 'from-gaming-neon-green to-gaming-neon-blue',
    },
    {
      id: 'staff',
      title: 'Staff Portal',
      description: 'Access teaching tools and administrative resources',
      icon: GraduationCap,
      color: 'from-purple-500 to-purple-600',
      gamingColor: 'from-gaming-neon-purple to-gaming-neon-pink',
    },
  ];

  const onSubmit = async (data: LoginFormData) => {
    if (!canAttempt) {
      setLoginError('Account is temporarily locked. Please wait before trying again.');
      return;
    }

    setIsLoading(true);
    setLoginError(null);

    try {
      const result = await loginAction({
        email: data.email,
        password: data.password,
      });

      if (result.success) {
        // Record successful login (clears failed attempts)
        recordSuccessfulLogin();
        
        // Redirect to appropriate dashboard
        router.push(redirectTo);
      } else {
        // Record failed attempt
        recordFailedAttempt();
        setLoginError(result.error || 'Login failed. Please check your credentials.');
      }
    } catch (error) {
      // Record failed attempt
      recordFailedAttempt();
      setLoginError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const currentLoginType = loginTypes.find(type => type.id === activeTab) || loginTypes[0];

  return (
    <div className={cn('w-full max-w-4xl mx-auto', className)}>
      {/* Header Section */}
      <div className="text-center mb-8">
        <div
          className={cn(
            'inline-flex items-center justify-center w-20 h-20 rounded-2xl mb-6 shadow-2xl',
            isGamingTheme
              ? 'bg-gradient-to-br from-gaming-neon-green to-gaming-neon-blue animate-gamingPulse'
              : 'bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600',
          )}
        >
          <Shield className="w-10 h-10 text-white" />
        </div>
        <h1
          className={cn(
            'text-4xl md:text-5xl font-bold mb-4',
            isGamingTheme
              ? 'text-gaming-neon-green animate-neonGlow'
              : 'bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent',
          )}
        >
          Welcome Back
        </h1>
        <p
          className={cn(
            'text-xl max-w-2xl mx-auto',
            isGamingTheme ? 'text-gaming-neon-blue' : 'text-muted-foreground',
          )}
        >
          Access your personalized portal to stay connected with Southville 8B NHS
        </p>
      </div>

      {/* Rate Limit Warning */}
      <div className="mb-6">
        <RateLimitWarning
          isLockedOut={isLockedOut}
          remainingTime={remainingTime}
          lockoutLevel={lockoutLevel}
          attemptCount={attemptCount}
          onReset={resetAttempts}
        />
      </div>

      {/* Login Tabs */}
      <div className="grid grid-cols-3 gap-2 mb-8 h-14">
        {loginTypes.map((type) => (
          <button
            key={type.id}
            onClick={() => setActiveTab(type.id)}
            className={cn(
              'flex items-center justify-center space-x-2 text-sm font-medium transition-all duration-300 rounded-lg',
              activeTab === type.id
                ? isGamingTheme
                  ? 'bg-gaming-neon-green/20 text-gaming-neon-green border border-gaming-neon-green/30'
                  : 'bg-primary text-primary-foreground'
                : isGamingTheme
                  ? 'bg-gaming-accent border border-gaming-neon-green/20 text-gaming-neon-blue hover:bg-gaming-neon-green/10'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80',
            )}
          >
            <type.icon className="w-4 h-4" />
            <span className="hidden sm:inline">{type.title}</span>
            <span className="sm:hidden">{type.id.charAt(0).toUpperCase() + type.id.slice(1)}</span>
          </button>
        ))}
      </div>

      {/* Login Form */}
      <Card
        className={cn(
          'shadow-2xl border-0 backdrop-blur-xl',
          isGamingTheme ? 'bg-gaming-dark/90 border border-gaming-neon-green/20' : 'bg-background/95',
        )}
      >
        <CardHeader className="text-center pb-8">
          <div
            className={cn(
              'inline-flex items-center justify-center w-16 h-16 rounded-xl mb-4 mx-auto',
              isGamingTheme
                ? `bg-gradient-to-r ${currentLoginType.gamingColor} animate-gamingPulse`
                : `bg-gradient-to-r ${currentLoginType.color}`,
            )}
          >
            <currentLoginType.icon className="w-8 h-8 text-white" />
          </div>
          <CardTitle className={cn('text-2xl font-bold', isGamingTheme && 'text-gaming-neon-green')}>
            {currentLoginType.title}
          </CardTitle>
          <CardDescription className={cn('text-base', isGamingTheme && 'text-gaming-neon-blue')}>
            {currentLoginType.description}
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-6">
            {/* Email Field */}
            <div className="space-y-2">
              <Label
                htmlFor="email"
                className={cn('text-sm font-medium', isGamingTheme && 'text-gaming-neon-green')}
              >
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email address"
                className={cn(
                  'h-12 text-base',
                  isGamingTheme &&
                    'bg-gaming-accent border-gaming-neon-green/30 text-gaming-neon-green placeholder:text-gaming-neon-green/50 focus:border-gaming-neon-green',
                  errors.email && 'border-red-500 focus:border-red-500',
                )}
                disabled={isLoading || !canAttempt}
                {...register('email')}
              />
              {errors.email && (
                <p className="text-sm text-red-500 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div className="space-y-2 relative">
              <Label
                htmlFor="password"
                className={cn('text-sm font-medium', isGamingTheme && 'text-gaming-neon-green')}
              >
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  className={cn(
                    'h-12 text-base pr-12',
                    isGamingTheme &&
                      'bg-gaming-accent border-gaming-neon-green/30 text-gaming-neon-green placeholder:text-gaming-neon-green/50 focus:border-gaming-neon-green',
                    errors.password && 'border-red-500 focus:border-red-500',
                  )}
                  disabled={isLoading || !canAttempt}
                  {...register('password')}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading || !canAttempt}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <EyeOff className={cn('h-4 w-4', isGamingTheme && 'text-gaming-neon-blue')} />
                  ) : (
                    <Eye className={cn('h-4 w-4', isGamingTheme && 'text-gaming-neon-blue')} />
                  )}
                </Button>
              </div>
              {errors.password && (
                <p className="text-sm text-red-500 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Error Message */}
            {loginError && (
              <Alert className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950">
                <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                <AlertDescription className="text-red-700 dark:text-red-300">
                  {loginError}
                </AlertDescription>
              </Alert>
            )}

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="remember"
                  className={cn('rounded border-gray-300', isGamingTheme && 'accent-gaming-neon-green')}
                  disabled={isLoading || !canAttempt}
                />
                <Label
                  htmlFor="remember"
                  className={cn('cursor-pointer', isGamingTheme && 'text-gaming-neon-blue')}
                >
                  Remember me
                </Label>
              </div>
              <button
                type="button"
                className={cn(
                  'font-medium hover:underline transition-colors duration-300',
                  isGamingTheme
                    ? 'text-gaming-neon-pink hover:text-gaming-neon-purple'
                    : 'text-primary hover:text-primary/80',
                )}
                disabled={isLoading || !canAttempt}
              >
                Forgot password?
              </button>
            </div>
          </CardContent>

          <CardFooter className="flex flex-col gap-4 pt-6">
            <AnimatedButton
              type="submit"
              disabled={isLoading || !canAttempt}
              className={cn(
                'w-full h-12 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300',
                isGamingTheme
                  ? `bg-gradient-to-r ${currentLoginType.gamingColor} hover:scale-105 animate-gamingPulse`
                  : `bg-gradient-to-r ${currentLoginType.color} hover:scale-105`,
                (!canAttempt || isLoading) && 'opacity-50 cursor-not-allowed',
              )}
              animation={isGamingTheme ? 'neonGlow' : 'glow'}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Signing In...
                </>
              ) : (
                <>
                  <LogIn className="w-5 h-5 mr-2" />
                  Sign In to {currentLoginType.title}
                  {isGamingTheme ? <Zap className="w-4 h-4 ml-2" /> : <Sparkles className="w-4 h-4 ml-2" />}
                </>
              )}
            </AnimatedButton>

            <div className="text-center">
              <p className={cn('text-sm', isGamingTheme ? 'text-gaming-neon-blue' : 'text-muted-foreground')}>
                Need help accessing your account?{' '}
                <button
                  type="button"
                  className={cn(
                    'font-medium hover:underline transition-colors duration-300',
                    isGamingTheme
                      ? 'text-gaming-neon-green hover:text-gaming-neon-blue'
                      : 'text-primary hover:text-primary/80',
                  )}
                  disabled={isLoading || !canAttempt}
                >
                  Contact Support
                </button>
              </p>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
