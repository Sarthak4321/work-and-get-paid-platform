import type { NextPage } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { ArrowRight, Briefcase, Clock, DollarSign, Globe, Shield, TrendingUp, Users } from 'lucide-react';

const Home: NextPage = () => {
  return (
    <div className="min-h-screen">
      <Head>
        <title>Cehpoint - Project-Based Work Platform | Earn Weekly with Flexible Projects</title>
        <meta name="description" content="Join Cehpoint's world-class platform for flexible project-based work. Weekly payouts, global opportunities, and quality projects in software development, video editing, and more." />
      </Head>

      <nav className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20 items-center">
            <div className="text-3xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Cehpoint
            </div>
            <div className="flex space-x-3">
              <Link href="/login">
                <button className="px-6 py-2.5 text-gray-700 hover:text-indigo-600 font-medium transition-all duration-200 hover:bg-gray-50 rounded-lg">
                  Login
                </button>
              </Link>
              <Link href="/signup">
                <button className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-medium hover:shadow-lg hover:scale-105 transition-all duration-300 shadow-md">
                  Sign Up
                </button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <section className="gradient-bg text-white py-32 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="animate-fade-in">
            <div className="inline-block mb-6 px-4 py-2 bg-white/20 backdrop-blur-md rounded-full text-sm font-medium">
              🚀 Join 10,000+ professionals earning on their terms
            </div>
            <h1 className="text-6xl md:text-7xl font-black mb-6 leading-tight tracking-tight">
              Work on Your Terms,<br />
              <span className="bg-gradient-to-r from-white via-purple-100 to-pink-100 bg-clip-text text-transparent">
                Get Paid Weekly
              </span>
            </h1>
            <p className="text-xl md:text-2xl mb-10 text-white/90 max-w-3xl mx-auto font-medium leading-relaxed">
              Join Cehpoint's project-based work platform. No long-term commitments, 
              flexible schedules, and weekly payouts for quality work.
            </p>
            <Link href="/signup">
              <button className="group px-10 py-5 bg-white text-indigo-600 rounded-2xl font-bold text-lg hover:shadow-2xl transition-all duration-300 flex items-center mx-auto space-x-3 hover:scale-105 shadow-xl">
                <span>Start Your Journey</span>
                <ArrowRight className="group-hover:translate-x-1 transition-transform" />
              </button>
            </Link>
          </div>
          
          <div className="mt-16 flex justify-center gap-8 text-sm">
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full">
              <Users size={16} />
              <span>10,000+ Workers</span>
            </div>
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full">
              <DollarSign size={16} />
              <span>$2M+ Paid Out</span>
            </div>
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full">
              <TrendingUp size={16} />
              <span>98% Satisfaction</span>
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 animate-fade-in">
            <h2 className="text-5xl font-black text-gray-900 mb-4">
              Why Choose Cehpoint?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Everything you need to succeed as a freelance professional
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="group text-center p-8 card-hover bg-white rounded-2xl premium-shadow">
              <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:shadow-xl transition-shadow animate-float">
                <Clock className="text-white" size={36} />
              </div>
              <h3 className="text-2xl font-bold mb-3 text-gray-900">Flexible Schedule</h3>
              <p className="text-gray-600 leading-relaxed">
                Work from any timezone, choose your projects, and maintain complete control over your schedule.
              </p>
            </div>

            <div className="group text-center p-8 card-hover bg-white rounded-2xl premium-shadow">
              <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:shadow-xl transition-shadow">
                <DollarSign className="text-white" size={36} />
              </div>
              <h3 className="text-2xl font-bold mb-3 text-gray-900">Weekly Payouts</h3>
              <p className="text-gray-600 leading-relaxed">
                Get paid based on completed projects. No waiting for monthly cycles, withdraw anytime.
              </p>
            </div>

            <div className="group text-center p-8 card-hover bg-white rounded-2xl premium-shadow">
              <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:shadow-xl transition-shadow">
                <TrendingUp className="text-white" size={36} />
              </div>
              <h3 className="text-2xl font-bold mb-3 text-gray-900">Career Growth</h3>
              <p className="text-gray-600 leading-relaxed">
                Top performers get opportunities for full-time positions and higher-paying projects.
              </p>
            </div>

            <div className="group text-center p-8 card-hover bg-white rounded-2xl premium-shadow">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:shadow-xl transition-shadow">
                <Briefcase className="text-white" size={36} />
              </div>
              <h3 className="text-2xl font-bold mb-3 text-gray-900">Diverse Projects</h3>
              <p className="text-gray-600 leading-relaxed">
                Software development, video editing, design, and more. Find projects matching your skills.
              </p>
            </div>

            <div className="group text-center p-8 card-hover bg-white rounded-2xl premium-shadow">
              <div className="w-20 h-20 bg-gradient-to-br from-red-500 to-rose-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:shadow-xl transition-shadow">
                <Shield className="text-white" size={36} />
              </div>
              <h3 className="text-2xl font-bold mb-3 text-gray-900">Secure Platform</h3>
              <p className="text-gray-600 leading-relaxed">
                Advanced verification, AI-powered quality checks, and secure payment processing.
              </p>
            </div>

            <div className="group text-center p-8 card-hover bg-white rounded-2xl premium-shadow">
              <div className="w-20 h-20 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:shadow-xl transition-shadow">
                <Globe className="text-white" size={36} />
              </div>
              <h3 className="text-2xl font-bold mb-3 text-gray-900">Global Opportunities</h3>
              <p className="text-gray-600 leading-relaxed">
                Work with an international IT company from anywhere in the world.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center mb-12 text-gray-900 animate-fade-in">
            How It Works
          </h2>
          <div className="grid md:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <div className="text-3xl font-bold text-indigo-600 mb-4">1</div>
              <h3 className="text-lg font-semibold mb-2">Sign Up</h3>
              <p className="text-gray-600">
                Complete our knowledge check to verify your skills and prevent fake registrations.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm">
              <div className="text-3xl font-bold text-indigo-600 mb-4">2</div>
              <h3 className="text-lg font-semibold mb-2">Demo Task</h3>
              <p className="text-gray-600">
                Complete a demo task to showcase your abilities and qualify for projects.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm">
              <div className="text-3xl font-bold text-indigo-600 mb-4">3</div>
              <h3 className="text-lg font-semibold mb-2">Accept Projects</h3>
              <p className="text-gray-600">
                Browse and accept weekly projects that match your skills and schedule.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm">
              <div className="text-3xl font-bold text-indigo-600 mb-4">4</div>
              <h3 className="text-lg font-semibold mb-2">Get Paid</h3>
              <p className="text-gray-600">
                Complete tasks, earn money, and withdraw anytime to your verified account.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-indigo-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold mb-6">
            Ready to Start Earning?
          </h2>
          <p className="text-xl mb-8 text-indigo-100">
            Join thousands of professionals working flexibly on Cehpoint
          </p>
          <Link href="/signup">
            <button className="px-8 py-4 bg-white text-indigo-600 rounded-lg font-semibold text-lg hover:bg-gray-100 transition">
              Create Your Account
            </button>
          </Link>
        </div>
      </section>

      <footer className="bg-gray-900 text-gray-300 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-white text-lg font-semibold mb-4">Cehpoint</h3>
              <p className="text-sm">
                Connecting skilled professionals with project-based work opportunities worldwide.
              </p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Platform</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/signup">Sign Up</Link></li>
                <li><Link href="/login">Login</Link></li>
                <li><Link href="/policies/terms">Terms of Service</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Policies</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/policies/privacy">Privacy Policy</Link></li>
                <li><Link href="/policies/payment">Payment Policy</Link></li>
                <li><Link href="/policies/termination">Termination Policy</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="mailto:support@cehpoint.com">Contact Us</a></li>
                <li><Link href="/faq">FAQ</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm">
            <p>&copy; 2024 Cehpoint. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
