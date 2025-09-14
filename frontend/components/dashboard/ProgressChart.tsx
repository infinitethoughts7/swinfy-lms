'use client';

import { useEffect, useRef } from 'react';

interface ProgressData {
  label: string;
  value: number;
  color?: string;
}

interface ProgressChartProps {
  data: ProgressData[];
  type: 'line' | 'bar' | 'pie' | 'doughnut';
  title?: string;
  height?: number;
  showLegend?: boolean;
  animated?: boolean;
}

// Simple chart implementation without external dependencies
// In a real project, you might want to use Chart.js, Recharts, or similar

const ProgressChart = ({ 
  data, 
  type, 
  title, 
  height = 300, 
  showLegend = true,
  animated = true 
}: ProgressChartProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const colors = [
    '#3B82F6', // blue
    '#10B981', // green
    '#F59E0B', // yellow
    '#EF4444', // red
    '#8B5CF6', // purple
    '#06B6D4', // cyan
    '#F97316', // orange
    '#84CC16', // lime
  ];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = canvas.offsetWidth * window.devicePixelRatio;
    canvas.height = height * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    // Clear canvas
    ctx.clearRect(0, 0, canvas.offsetWidth, height);

    if (type === 'pie' || type === 'doughnut') {
      drawPieChart(ctx, data, canvas.offsetWidth, height, type === 'doughnut');
    } else if (type === 'bar') {
      drawBarChart(ctx, data, canvas.offsetWidth, height);
    } else if (type === 'line') {
      drawLineChart(ctx, data, canvas.offsetWidth, height);
    }
  }, [data, type, height]);

  const drawPieChart = (
    ctx: CanvasRenderingContext2D, 
    data: ProgressData[], 
    width: number, 
    height: number, 
    isDoughnut: boolean
  ) => {
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) / 2 - 40;
    const innerRadius = isDoughnut ? radius * 0.6 : 0;

    const total = data.reduce((sum, item) => sum + item.value, 0);
    let currentAngle = -Math.PI / 2; // Start from top

    data.forEach((item, index) => {
      const sliceAngle = (item.value / total) * 2 * Math.PI;
      const color = item.color || colors[index % colors.length];

      // Draw slice
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + sliceAngle);
      if (isDoughnut) {
        ctx.arc(centerX, centerY, innerRadius, currentAngle + sliceAngle, currentAngle, true);
      } else {
        ctx.lineTo(centerX, centerY);
      }
      ctx.closePath();
      ctx.fillStyle = color;
      ctx.fill();

      currentAngle += sliceAngle;
    });

    // Draw center text for doughnut
    if (isDoughnut) {
      ctx.fillStyle = '#374151';
      ctx.font = 'bold 20px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(`${total}%`, centerX, centerY);
    }
  };

  const drawBarChart = (
    ctx: CanvasRenderingContext2D, 
    data: ProgressData[], 
    width: number, 
    height: number
  ) => {
    const padding = 40;
    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;
    const barWidth = chartWidth / data.length * 0.7;
    const barSpacing = chartWidth / data.length * 0.3;

    const maxValue = Math.max(...data.map(item => item.value));

    data.forEach((item, index) => {
      const barHeight = (item.value / maxValue) * chartHeight;
      const x = padding + index * (barWidth + barSpacing) + barSpacing / 2;
      const y = height - padding - barHeight;

      const color = item.color || colors[index % colors.length];

      // Draw bar
      ctx.fillStyle = color;
      ctx.fillRect(x, y, barWidth, barHeight);

      // Draw value label
      ctx.fillStyle = '#374151';
      ctx.font = '12px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(item.value.toString(), x + barWidth / 2, y - 5);

      // Draw label
      ctx.fillText(item.label, x + barWidth / 2, height - padding + 20);
    });
  };

  const drawLineChart = (
    ctx: CanvasRenderingContext2D, 
    data: ProgressData[], 
    width: number, 
    height: number
  ) => {
    const padding = 40;
    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;

    const maxValue = Math.max(...data.map(item => item.value));
    const stepX = chartWidth / (data.length - 1);

    // Draw line
    ctx.beginPath();
    ctx.strokeStyle = colors[0];
    ctx.lineWidth = 3;

    data.forEach((item, index) => {
      const x = padding + index * stepX;
      const y = height - padding - (item.value / maxValue) * chartHeight;

      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }

      // Draw points
      ctx.save();
      ctx.fillStyle = colors[0];
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, 2 * Math.PI);
      ctx.fill();
      ctx.restore();

      // Draw labels
      ctx.fillStyle = '#374151';
      ctx.font = '12px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(item.label, x, height - padding + 20);
      ctx.fillText(item.value.toString(), x, y - 10);
    });

    ctx.stroke();
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      {title && (
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      )}
      
      <div className="relative">
        <canvas
          ref={canvasRef}
          style={{ width: '100%', height: `${height}px` }}
          className="block"
        />
      </div>

      {showLegend && (type === 'pie' || type === 'doughnut') && (
        <div className="mt-4 flex flex-wrap gap-4 justify-center">
          {data.map((item, index) => {
            const color = item.color || colors[index % colors.length];
            return (
              <div key={item.label} className="flex items-center space-x-2">
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: color }}
                ></div>
                <span className="text-sm text-gray-600">
                  {item.label}: {item.value}%
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

// Predefined chart components for common use cases
export const CourseProgressChart = ({ progress }: { progress: number }) => (
  <ProgressChart
    data={[
      { label: 'Completed', value: progress, color: '#10B981' },
      { label: 'Remaining', value: 100 - progress, color: '#E5E7EB' }
    ]}
    type="doughnut"
    title="Course Progress"
    height={200}
    showLegend={false}
  />
);

export const PerformanceChart = ({ data }: { data: { month: string; score: number }[] }) => (
  <ProgressChart
    data={data.map(item => ({ label: item.month, value: item.score }))}
    type="line"
    title="Performance Over Time"
    height={250}
    showLegend={false}
  />
);

export const StudentDistributionChart = ({ students }: { 
  students: { level: string; count: number }[] 
}) => (
  <ProgressChart
    data={(students || []).map(item => ({ label: item.level, value: item.count }))}
    type="pie"
    title="Students by Level"
    height={300}
  />
);

export const WeeklyActivityChart = ({ activities }: { 
  activities: { day: string; hours: number }[] 
}) => (
  <ProgressChart
    data={(activities || []).map(item => ({ label: item.day, value: item.hours }))}
    type="bar"
    title="Weekly Activity"
    height={250}
    showLegend={false}
  />
);

export default ProgressChart;
