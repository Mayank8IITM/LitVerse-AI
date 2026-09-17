"use client";

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Legend, AreaChart, Area
} from 'recharts';
import { BookOpen, Star, Target, TrendingUp, ArrowLeft } from 'lucide-react';

const weeklyData = [
  { day: 'Mon', words: 120, accuracy: 85 },
  { day: 'Tue', words: 250, accuracy: 88 },
  { day: 'Wed', words: 180, accuracy: 82 },
  { day: 'Thu', words: 300, accuracy: 91 },
  { day: 'Fri', words: 350, accuracy: 95 },
  { day: 'Sat', words: 400, accuracy: 94 },
  { day: 'Sun', words: 450, accuracy: 96 },
];

const categoryData = [
  { name: 'Vocabulary', score: 85 },
  { name: 'Comprehension', score: 92 },
  { name: 'Pronunciation', score: 78 },
  { name: 'Fluency', score: 88 },
];

export default function Dashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (!loading && !user) {
      router.push('/');
    }
  }, [user, loading, router]);

  if (loading || !user || !mounted) return null;

  return (
    <main style={{ minHeight: '100vh', backgroundColor: '#0f172a', color: '#f8fafc', padding: '2rem' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        
        {/* Header */}
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
          <div>
            <button 
              onClick={() => router.push('/play')}
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', marginBottom: '1rem', fontFamily: 'var(--font-inter), sans-serif' }}
            >
              <ArrowLeft size={16} /> Back to Game
            </button>
            <h1 style={{ fontFamily: 'var(--font-outfit), sans-serif', fontSize: '2.5rem', margin: 0, color: '#fbbf24' }}>
              Parent Dashboard
            </h1>
            <p style={{ color: '#94a3b8', fontFamily: 'var(--font-inter), sans-serif', marginTop: '0.5rem' }}>
              Tracking progress for <span style={{ color: '#e2e8f0', fontWeight: 'bold' }}>Pip</span>
            </p>
          </div>
          <div style={{ backgroundColor: '#1e293b', padding: '1rem', borderRadius: '12px', border: '1px solid #334155' }}>
            <span style={{ fontSize: '0.875rem', color: '#94a3b8' }}>Total Reading Time</span>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#10b981' }}>4h 23m</div>
          </div>
        </header>

        {/* KPI Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
          {[
            { title: "Words Read", value: "2,050", trend: "+12%", icon: <BookOpen color="#3b82f6" />, color: "#3b82f6" },
            { title: "Average Accuracy", value: "90%", trend: "+5%", icon: <Target color="#10b981" />, color: "#10b981" },
            { title: "Current Streak", value: "7 Days", trend: "🔥", icon: <Star color="#fbbf24" />, color: "#fbbf24" },
            { title: "Reading Level", value: "Level 3", trend: "Leveling up soon!", icon: <TrendingUp color="#8b5cf6" />, color: "#8b5cf6" }
          ].map((kpi, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              style={{ backgroundColor: '#1e293b', padding: '1.5rem', borderRadius: '16px', border: '1px solid #334155' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <div style={{ padding: '10px', backgroundColor: `${kpi.color}20`, borderRadius: '12px' }}>
                  {kpi.icon}
                </div>
                <span style={{ color: '#10b981', fontSize: '0.875rem', fontWeight: '600' }}>{kpi.trend}</span>
              </div>
              <h3 style={{ color: '#94a3b8', fontSize: '0.875rem', margin: '0 0 0.5rem 0', fontWeight: '500' }}>{kpi.title}</h3>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#f8fafc', fontFamily: 'var(--font-outfit), sans-serif' }}>
                {kpi.value}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Charts Section */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))', gap: '2rem' }}>
          
          {/* Activity Chart */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            style={{ backgroundColor: '#1e293b', padding: '2rem', borderRadius: '16px', border: '1px solid #334155' }}
          >
            <h3 style={{ fontFamily: 'var(--font-outfit), sans-serif', color: '#f8fafc', marginBottom: '2rem' }}>Weekly Reading Activity</h3>
            <div style={{ height: '300px', width: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={weeklyData}>
                  <defs>
                    <linearGradient id="colorWords" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                  <XAxis dataKey="day" stroke="#94a3b8" axisLine={false} tickLine={false} />
                  <YAxis stroke="#94a3b8" axisLine={false} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '8px' }}
                    itemStyle={{ color: '#fbbf24' }}
                  />
                  <Area type="monotone" dataKey="words" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorWords)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* AI Insights */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            style={{ backgroundColor: '#1e293b', padding: '2rem', borderRadius: '16px', border: '1px solid #334155', display: 'flex', flexDirection: 'column' }}
          >
            <h3 style={{ fontFamily: 'var(--font-outfit), sans-serif', color: '#f8fafc', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span>✨</span> Pip's AI Insights
            </h3>
            
            <div style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)', borderLeft: '4px solid #3b82f6', padding: '1.5rem', borderRadius: '0 8px 8px 0', marginBottom: '1.5rem' }}>
              <p style={{ margin: 0, color: '#e2e8f0', lineHeight: '1.6', fontFamily: 'var(--font-inter), sans-serif' }}>
                "Pip had a fantastic week! They are showing great improvement in <strong>comprehension</strong>, successfully answering 92% of story questions correctly. However, they hesitated slightly on multi-syllable words ending in <em>-tion</em>."
              </p>
            </div>

            <div style={{ flex: 1 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryData} layout="vertical" margin={{ top: 0, right: 0, left: 30, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" horizontal={true} vertical={false} />
                  <XAxis type="number" domain={[0, 100]} hide />
                  <YAxis dataKey="name" type="category" stroke="#94a3b8" axisLine={false} tickLine={false} width={100} />
                  <Tooltip cursor={{fill: '#334155'}} contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '8px' }} />
                  <Bar dataKey="score" fill="#10b981" radius={[0, 4, 4, 0]} barSize={24} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

        </div>
      </div>
    </main>
  );
}
