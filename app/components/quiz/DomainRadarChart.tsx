// FILE: app/components/quiz/DomainRadarChart.tsx
import React from 'react';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  Tooltip,
  Legend
} from 'recharts';
import type { RadarChartDataPoint } from '../../types/quiz';
import { Card, CardContent } from '../../components/ui/card';

// Custom tooltip as requested
const CustomRadarTooltip: React.FC<any> = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <Card className="p-3 shadow-md border border-border">
          <CardContent className="p-0">
              <p className="font-medium text-sm text-popover-foreground">{payload[0].payload.subject}</p>
              <p className="text-sm text-muted-foreground">
              <span className="font-semibold text-primary">Score: </span>
              <span>{payload[0].value}%</span>
              </p>
          </CardContent>
      </Card>
    );
  }
  return null;
};


interface DomainRadarChartProps {
  data: RadarChartDataPoint[];
  onDomainClick: (data: RadarChartDataPoint) => void;
}

const DomainRadarChart: React.FC<DomainRadarChartProps> = ({ data, onDomainClick }) => {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <RadarChart outerRadius="80%" data={data}>
        <PolarGrid stroke="hsl(var(--border))" />
        <PolarAngleAxis
            dataKey="subject"
            tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
            />
        <PolarRadiusAxis
            angle={30}
            domain={[0, 100]}
            tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
            tickCount={6} // 0, 20, 40, 60, 80, 100
            stroke="hsl(var(--border))"
            />
        <Radar
            name="Competency Score"
            dataKey="A"
            stroke="hsl(var(--primary))"
            fill="hsl(var(--primary))"
            fillOpacity={0.5}
            dot={{ r: 4, fill: "hsl(var(--primary))", strokeWidth: 0 }}
            activeDot={{
                r: 6,
                fill: "hsl(var(--primary))",
                stroke: "hsl(var(--background))",
                strokeWidth: 2,
                cursor: 'pointer',
                onClick: (event, payload: any) => {
                    if (payload && payload.payload) {
                        onDomainClick(payload.payload as RadarChartDataPoint);
                    }
                }
            }}
            />
        <Tooltip content={<CustomRadarTooltip />} cursor={{ stroke: 'hsl(var(--primary))', strokeWidth: 1, strokeDasharray: '3 3' }}/>
        <Legend
            wrapperStyle={{ paddingTop: 20 }}
            iconType="circle"
            />
      </RadarChart>
    </ResponsiveContainer>
  );
};

export default DomainRadarChart;