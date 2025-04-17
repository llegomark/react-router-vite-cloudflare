// FILE: app/components/quiz/QuestionCard.tsx
import React from 'react';
import { CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
// Badge import removed as it's no longer used
import type { Question } from '../../types/quiz';

interface QuestionCardProps {
  question: Question;
}

const QuestionCard: React.FC<QuestionCardProps> = ({ question }) => {
  return (
    <div className="mb-6">
      {/* --- REMOVED BADGES SECTION ---
       <div className="flex flex-wrap gap-2 mb-3">
          <Badge variant="outline" className="text-xs">
            Domain: {question.domain.name}
          </Badge>
          <Badge variant="secondary" className="text-xs">
            Strand: {question.strand.name}
          </Badge>
          <Badge variant="outline" className="text-xs">
            Stage: {question.careerStage}
          </Badge>
          <Badge variant="secondary" className="text-xs">
            SOLO: {question.soloLevel}
          </Badge>
           <Badge variant="outline" className="text-xs">
            Difficulty: {question.difficultyParams.category}
          </Badge>
        </div>
      */}
      <p className="text-lg font-medium leading-relaxed">{question.text}</p>
    </div>
  );
};

export default QuestionCard;