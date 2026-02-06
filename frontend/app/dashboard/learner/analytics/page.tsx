'use client';

import { useEffect, useState } from 'react';
import { WeeklyActivityChart, LearnerDistributionChart } from '@/components/dashboard/ProgressChart';
import { learnerDashboardApi } from '@/features/dashboard/services/learner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface WeeklyActivity { day: string; hours: number; }
interface LearnerDistribution { level: string; count: number; }

function AnalyticsSkeleton() {
  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="pt-6">
          <Skeleton className="h-8 w-32 mb-2" />
          <Skeleton className="h-5 w-64" />
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Skeleton className="h-80 rounded-xl" />
        <Skeleton className="h-80 rounded-xl" />
      </div>
    </div>
  );
}

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
      } catch {
        setError('Failed to load analytics.');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  if (loading) {
    return <AnalyticsSkeleton />;
  }

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Analytics</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 text-sm">Your study activity and distribution.</p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardContent className="pt-6">
            <WeeklyActivityChart activities={weekly} />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <LearnerDistributionChart learners={distribution} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
