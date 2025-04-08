// FILE: app/components/quiz/StrandAnalysis.tsx
// NOTE: This component is currently not used directly but kept for potential future use.
// The functionality is integrated within ResultsAnalysis for now.
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import type { StrandResult } from '../../types/quiz';

interface StrandAnalysisProps {
  strandResults: StrandResult[];
}

const StrandAnalysis: React.FC<StrandAnalysisProps> = ({ strandResults }) => {
  const chartData = strandResults.map(strand => ({
    name: strand.name,
    score: parseFloat(strand.percentage.toFixed(1)),
    domain: strand.domainName
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Strand Performance</CardTitle>
        <CardDescription>Your performance within specific strands.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis
                dataKey="name"
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
                angle={-30}
                textAnchor="end"
                height={70}
                interval={0}
              />
              <YAxis domain={[0, 100]} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}/>
              <Tooltip
                  contentStyle={{ borderRadius: 'var(--radius)', border: '1px solid hsl(var(--border))' }}
                  formatter={(value: number, name, props) => [`${value}% (${props.payload.domain})`, "Score"]}
              />
              <Legend />
              <Bar dataKey="score" fill="hsl(var(--chart-3))" name="Score (%)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default StrandAnalysis;