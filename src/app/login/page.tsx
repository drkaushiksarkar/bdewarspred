"use client";

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { AlertCircle, Biohazard, ArrowRight } from 'lucide-react';
import PartnerLogos from '@/components/layout/partner-logos';

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showLoginCard, setShowLoginCard] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const result = await signIn('credentials', {
        username,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError('Invalid username or password');
      } else if (result?.ok) {
        router.push('/');
        router.refresh();
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-gray-50 to-gray-100 flex">
      {/* Left Side - Information Panel */}
      <div className="flex-1 flex flex-col justify-between p-12 lg:p-16">
        {/* Logo Banner */}
        <div className="space-y-8">
          <div className="flex items-center gap-3">
            <Biohazard className="h-10 w-10 text-black" />
            <span className="font-headline text-2xl font-bold text-black">
              EWARS Bangladesh
            </span>
          </div>

          {/* Main Content */}
          <div className="space-y-6 max-w-xl">
            <div>
              <h1 className="text-4xl lg:text-5xl font-bold tracking-tight text-gray-900 mb-3">
                Bangladesh EWARS
              </h1>
              <h2 className="text-xl lg:text-2xl text-gray-700 font-medium">
                Early Warning Alert and Response System
              </h2>
            </div>

            <p className="text-gray-600 text-lg leading-relaxed">
              A comprehensive disease surveillance platform for Bangladesh, providing real-time monitoring,
              predictive analytics, and outbreak simulations. Track disease patterns, analyze trends,
              and make data-driven public health decisions to protect communities across the nation.
            </p>

            {/* Go to Dashboard Button */}
            <Button
              size="lg"
              className="bg-black text-white hover:bg-gray-800 text-base px-6 py-6 group"
              onClick={() => setShowLoginCard(true)}
            >
              Go to Dashboard
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        </div>

        {/* Partner Logos */}
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Developed with support from:
          </p>
          <PartnerLogos />
          <p className="text-xs text-gray-500">
            © 2025 Bangladesh EWARS. All rights reserved.
          </p>
        </div>
      </div>

      {/* Right Side - Login Card (Slides in) */}
      <div
        className={`w-full lg:w-[500px] bg-white shadow-2xl flex items-center justify-center p-8 lg:p-12 transition-transform duration-500 ease-in-out ${
          showLoginCard ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="w-full max-w-md">
          <Card className="shadow-none border-0">
            <CardHeader className="space-y-1 pb-6">
              <CardTitle className="text-2xl font-bold">Welcome back</CardTitle>
              <CardDescription className="text-base">
                Enter your credentials to access the dashboard
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    type="text"
                    placeholder="Enter your username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    disabled={isLoading}
                    className="h-11"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={isLoading}
                    className="h-11"
                  />
                </div>

                {error && (
                  <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 p-3 rounded-md">
                    <AlertCircle className="h-4 w-4" />
                    <span>{error}</span>
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full h-11 bg-black text-white hover:bg-gray-800"
                  disabled={isLoading}
                >
                  {isLoading ? 'Signing in...' : 'Sign in'}
                </Button>

                {/* <div className="mt-6 pt-4 border-t border-gray-200"> */}
                  {/* <p className="text-xs text-center text-gray-500">
                    Demo Credentials: <span className="font-medium">demo / demo123</span>
                  </p> */}
                {/* </div> */}
              </form>
            </CardContent>
          </Card>

          {/* Back button */}
          <Button
            variant="ghost"
            className="w-full mt-4"
            onClick={() => setShowLoginCard(false)}
          >
            ← Back
          </Button>
        </div>
      </div>
    </div>
  );
}
