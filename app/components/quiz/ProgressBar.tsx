// FILE: app/components/quiz/ProgressBar.tsx
import React from 'react';
import { Progress } from '../../components/ui/progress';
import { cn } from "../../lib/utils";


interface ProgressBarProps {
  current: number;
  total: number;
  className?: string;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ current, total, className }) => {
  const progressPercentage = total > 0 ? ((current + 1) / total) * 100 : 0;

  return (
    <div className={cn("w-full", className)}>
      <p className="text-sm text-muted-foreground mb-1 text-center">
        Question {current + 1} of {total}
      </p>
      <Progress value={progressPercentage} className="h-2" />
    </div>
  );
};

export default ProgressBar;