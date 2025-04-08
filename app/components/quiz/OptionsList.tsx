// FILE: app/components/quiz/OptionsList.tsx
import React from 'react';
import { RadioGroup, RadioGroupItem } from '../../components/ui/radio-group';
import { Label } from '../../components/ui/label';
import type { QuestionOption } from '../../types/quiz';
import { cn } from "../../lib/utils";


interface OptionsListProps {
  options: QuestionOption[];
  questionId: number;
  selectedAnswer?: string;
  onAnswer: (questionId: number, answer: string) => void;
  className?: string;
}

const OptionsList: React.FC<OptionsListProps> = ({
  options,
  questionId,
  selectedAnswer,
  onAnswer,
  className
}) => {
  return (
      <RadioGroup
        value={selectedAnswer}
        onValueChange={(value) => onAnswer(questionId, value)}
        className={cn("space-y-3", className)}
      >
        {options.map((option) => (
          <Label
            key={option.value}
            htmlFor={`${questionId}-${option.value}`}
            className={cn(
                "flex items-center space-x-3 p-4 rounded-lg border border-border cursor-pointer transition-colors hover:bg-accent hover:text-accent-foreground",
                selectedAnswer === option.value && "border-primary bg-primary/10 ring-2 ring-primary"
            )}
          >
            <RadioGroupItem value={option.value} id={`${questionId}-${option.value}`} className="size-5"/>
            <span className="text-sm leading-normal flex-1">{option.text}</span>
          </Label>
        ))}
      </RadioGroup>
  );
};

export default OptionsList;