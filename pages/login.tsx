import { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { storage } from '../utils/storage';
import Button from '../components/Button';

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

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
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
      <Head>
        <title>Login - Cehpoint</title>
      </Head>

      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <Link href="/">
            <span className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent cursor-pointer">
              Cehpoint
            </span>
          </Link>
          <h1 className="text-3xl font-bold mt-4">Welcome Back</h1>
          <p className="text-gray-600 mt-2">Login to your account</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border p-8">
          <form onSubmit={handleLogin} className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
                placeholder="your@email.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
                placeholder="••••••••"
                required
              />
            </div>

            <Button type="submit" fullWidth>
              Login
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{' '}
              <Link href="/signup" className="text-indigo-600 font-medium">
                Sign Up
              </Link>
            </p>
          </div>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <button
              onClick={createDemoAdmin}
              className="w-full text-sm text-gray-600 hover:text-gray-800"
            >
              Create Demo Admin Account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
