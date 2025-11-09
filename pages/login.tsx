import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { storage } from '../utils/storage';
import { initializeTestData, resetToTestData } from '../utils/testData';
import Button from '../components/Button';

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    initializeTestData();
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const users = storage.getUsers();
    const user = users.find(u => u.email === email);

    if (!user) {
      setError('Invalid email or password');
      return;
    }

    if (user.password !== password) {
      setError('Invalid email or password');
      return;
    }

    storage.setCurrentUser(user);

    if (user.role === 'admin') {
      router.push('/admin');
    } else {
      router.push('/dashboard');
    }
  };

  const createDemoAdmin = () => {
    const users = storage.getUsers();
    const existingAdmin = users.find(u => u.email === 'admin@cehpoint.com');
    
    if (!existingAdmin) {
      const adminUser = {
        id: 'admin-1',
        email: 'admin@cehpoint.com',
        password: 'admin123',
        fullName: 'Admin User',
        phone: '+1234567890',
        skills: [],
        experience: 'expert',
        timezone: 'UTC',
        preferredWeeklyPayout: 0,
        accountStatus: 'active' as const,
        role: 'admin' as const,
        knowledgeScore: 100,
        demoTaskCompleted: true,
        createdAt: new Date().toISOString(),
        balance: 0,
      };
      storage.setUsers([...users, adminUser]);
      alert('Demo admin created!\nEmail: admin@cehpoint.com\nPassword: admin123');
    } else {
      alert('Admin already exists!\nEmail: admin@cehpoint.com\nPassword: admin123');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-indigo-50/30 flex items-center justify-center py-12 px-4">
      <Head>
        <title>Login - Cehpoint</title>
      </Head>

      <div className="max-w-md w-full animate-fade-in">
        <div className="text-center mb-10">
          <Link href="/">
            <span className="text-4xl font-black bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent cursor-pointer hover:scale-110 inline-block transition-transform">
              Cehpoint
            </span>
          </Link>
          <h1 className="text-4xl font-black mt-6 text-gray-900">Welcome Back</h1>
          <p className="text-gray-600 mt-3 text-lg">Login to continue your journey</p>
        </div>

        <div className="glass-card rounded-3xl premium-shadow p-10">
          <form onSubmit={handleLogin} className="space-y-6">
            {error && (
              <div className="bg-red-50 border-2 border-red-200 text-red-700 px-5 py-4 rounded-xl font-medium animate-fade-in">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-bold mb-3 text-gray-700">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-5 py-4 premium-input rounded-xl text-base font-medium"
                placeholder="your@email.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-bold mb-3 text-gray-700">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-5 py-4 premium-input rounded-xl text-base font-medium"
                placeholder="••••••••"
                required
              />
            </div>

            <Button type="submit" fullWidth>
              Login to Continue
            </Button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-base text-gray-600">
              Don't have an account?{' '}
              <Link href="/signup" className="text-indigo-600 font-bold hover:text-indigo-700 hover:underline transition-all">
                Sign Up Free
              </Link>
            </p>
          </div>

          <div className="mt-8 pt-8 border-t-2 border-gray-100">
            <div className="space-y-3">
              <button
                onClick={createDemoAdmin}
                className="w-full text-sm text-gray-600 hover:text-gray-900 font-medium transition-colors"
              >
                Create Demo Admin Account
              </button>
              <button
                onClick={resetToTestData}
                className="w-full px-5 py-3.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white border-none rounded-xl text-sm font-bold hover:shadow-xl hover:scale-105 transition-all duration-300 shadow-lg"
              >
                🚀 Load Test Accounts & Data
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
