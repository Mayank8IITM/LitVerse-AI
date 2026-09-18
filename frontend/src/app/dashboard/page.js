"use client";

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { LineChart as LineChartIcon, Sparkles, BookOpen, Trophy, Brain, PieChart as PieChartIcon, Target } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import api from '@/lib/api';

export default function Dashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();
  
  const [reportData, setReportData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!loading && !user) router.push('/');
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      fetchReport();
    }
  }, [user]);

  const fetchReport = async () => {
    try {
      const response = await api.get('/api/coach/report');
      setReportData(response.data);
    } catch (e) {
      console.error("Failed to fetch report", e);
    } finally {
      setIsLoading(false);
    }
  };

  if (loading || !user) return null;

  // Format stats for Recharts with distinct beautiful colors
  const chartData = reportData && reportData.stats ? [
    { name: 'Vocabulary', score: reportData.stats.vocabulary, color: 'var(--primary)' },
    { name: 'Inference', score: reportData.stats.inference, color: 'var(--accent)' },
    { name: 'Literal', score: reportData.stats.literal_comprehension, color: 'var(--secondary)' }
  ] : [];
  
  const vocabData = reportData?.vocab_distribution || [];
  const wordsToPractice = reportData?.words_to_practice || [];

  return (
    <main className="page-enter" style={{ minHeight: 'calc(100vh - 64px)', padding: 'var(--space-2xl) var(--space-xl)' }}>
      <div className="container-narrow stagger-children">
        
        <header style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: 'var(--space-2xl)' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--bg-base)' }}>
            <LineChartIcon size={32} />
          </div>
          <div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2.5rem', margin: 0, color: 'var(--text-primary)' }}>Parent Portal</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '1rem', margin: '0.25rem 0 0 0' }}>Real-time performance data & AI insights</p>
          </div>
        </header>

        {isLoading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem 0' }}>
            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}>
              <Sparkles size={32} color="var(--accent)" />
            </motion.div>
          </div>
        ) : reportData ? (
          <>
            {/* Quick Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-lg)', marginBottom: 'var(--space-2xl)' }}>
              
              <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'var(--success-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--success)' }}>
                  <BookOpen size={24} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.5rem', margin: 0, fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>{reportData.lexile}L</h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', margin: 0 }}>Current Lexile</p>
                </div>
              </div>

              <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'var(--warning-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--warning)' }}>
                  <Trophy size={24} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.5rem', margin: 0, fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>{reportData.sessions}</h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', margin: 0 }}>Total Sessions</p>
                </div>
              </div>

            </div>

            {/* Performance Charts Row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: 'var(--space-lg)', marginBottom: 'var(--space-2xl)' }}>
              
              {/* Skill Mastery Bar Chart */}
              {chartData.length > 0 && (
                <div className="card">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                    <Brain size={24} color="var(--primary)" />
                    <h3 style={{ fontSize: '1.25rem', margin: 0, color: 'var(--text-primary)' }}>Skill Mastery Metrics</h3>
                  </div>
                  
                  <div style={{ height: '250px', width: '100%' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={chartData}
                        layout="vertical"
                        margin={{ top: 10, right: 30, left: 20, bottom: 5 }}
                        barSize={32}
                      >
                        <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="var(--border)" opacity={0.4} />
                        <XAxis type="number" domain={[0, 100]} stroke="var(--text-muted)" tick={{fill: 'var(--text-muted)'}} />
                        <YAxis dataKey="name" type="category" stroke="var(--text-muted)" width={90} tick={{fill: 'var(--text-primary)', fontWeight: 500}} />
                        <Tooltip 
                          contentStyle={{ backgroundColor: 'var(--bg-card)', borderRadius: '12px', border: '1px solid var(--border)', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                          itemStyle={{ color: 'var(--text-primary)', fontWeight: 'bold' }}
                          cursor={{fill: 'var(--bg-base)', opacity: 0.5}}
                        />
                        <Bar dataKey="score" radius={[0, 12, 12, 0]}>
                          {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}

              {/* Vocab Distribution Donut */}
              <div className="card">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                  <PieChartIcon size={24} color="var(--accent)" />
                  <h3 style={{ fontSize: '1.25rem', margin: 0, color: 'var(--text-primary)' }}>Vocabulary Distribution</h3>
                </div>
                
                {vocabData.reduce((acc, item) => acc + item.value, 0) > 0 ? (
                  <div style={{ height: '250px', width: '100%' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={vocabData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {vocabData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip 
                          contentStyle={{ backgroundColor: 'var(--bg-card)', borderRadius: '8px', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem', marginTop: '1rem' }}>
                      {vocabData.map((item, idx) => (
                        <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                          <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: item.color }}></div>
                          {item.name}: {item.value}
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div style={{ height: '250px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                    No vocabulary data collected yet.
                  </div>
                )}
              </div>
            </div>

            {/* Words to Practice Focus List */}
            {wordsToPractice.length > 0 && (
              <div className="card" style={{ marginBottom: 'var(--space-2xl)', backgroundColor: 'var(--error-soft)', border: '1px solid var(--error)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                  <Target size={24} color="var(--error)" />
                  <h3 style={{ fontSize: '1.25rem', margin: 0, color: 'var(--error)' }}>Focus Words to Practice</h3>
                </div>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
                  These are the words your child has struggled with the most recently. Try practicing them together!
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
                  {wordsToPractice.map((word, idx) => (
                    <div key={idx} style={{ backgroundColor: 'var(--bg-card)', padding: '0.75rem 1.5rem', borderRadius: '999px', fontFamily: 'var(--font-display)', fontSize: '1.25rem', color: 'var(--text-primary)', border: '1px solid var(--border)' }}>
                      {word}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* AI Report Card at the very bottom */}
            <div className="card" style={{ borderTop: '4px solid var(--accent)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                <Sparkles size={24} color="var(--accent)" />
                <h3 style={{ fontSize: '1.25rem', margin: 0, color: 'var(--text-primary)' }}>Pip's AI Assessment</h3>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                {reportData.report.split('\n\n').map((paragraph, idx) => (
                  <p key={idx} style={{ margin: 0 }}>{paragraph}</p>
                ))}
              </div>
            </div>
          </>
        ) : (
          <div className="card" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
            <p style={{ color: 'var(--text-muted)', fontSize: '1.125rem' }}>
              No reading data yet! Have your child play a few sessions to generate their first report.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
