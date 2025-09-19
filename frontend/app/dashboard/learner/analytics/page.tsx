'use client';

import { useEffect, useState } from 'react';
import { WeeklyActivityChart, LearnerDistributionChart } from '@/components/dashboard/ProgressChart';
import { learnerDashboardApi } from '@/lib/api';

interface WeeklyActivity { day: string; hours: number; }
interface LearnerDistribution { level: string; count: number; }

export default function LearnerAnalyticsPage() {
  const [weekly, setWeekly] = useState<WeeklyActivity[]>([]);
  const [distribution, setDistribution] = useState<LearnerDistribution[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetch = async () => {
      try {
        setLoading(true);
        const [wa, sd] = await Promise.all([
          learnerDashboardApi.getWeeklyActivity(),
          learnerDashboardApi.getLearnerDistribution(),
        ]);
        setWeekly(wa?.weekly_activity || []);
        setDistribution(sd?.learner_distribution || []);
      } catch (e) {
        setError('Failed to load analytics.');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  if (loading) return <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">Loading...</div>;
  if (error) return <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-red-600">{error}</div>;

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h1 className="text-xl font-semibold text-gray-900 mb-2">Analytics</h1>
        <p className="text-gray-600 text-sm">Your study activity and distribution.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <WeeklyActivityChart activities={weekly} />
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <LearnerDistributionChart learners={distribution} />
        </div>
      </div>
    </div>
  );
}


