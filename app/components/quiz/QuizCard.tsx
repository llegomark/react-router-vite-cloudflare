// FILE: app/components/quiz/QuizCard.tsx
import React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import ProgressBar from './ProgressBar';
import QuestionCard from './QuestionCard';
import OptionsList from './OptionsList';
import type { Question } from '../../types/quiz';

interface QuizCardProps {
  question: Question;
  currentQuestionIndex: number;
  totalQuestions: number;
  selectedAnswer?: string;
  onAnswer: (questionId: number, answer: string) => void;
  onNextClick: () => void; // New callback for next/finish
  onPrevClick: () => void; // New callback for previous
  isLastQuestion: boolean;
  canGoNext: boolean; // Flag to enable/disable next/finish button
  canGoPrev: boolean; // Flag to enable/disable previous button
}

const QuizCard: React.FC<QuizCardProps> = ({
  question,
  currentQuestionIndex,
  totalQuestions,
  selectedAnswer,
  onAnswer,
  onNextClick,
  onPrevClick,
  isLastQuestion,
  canGoNext,
  canGoPrev,
}) => {
  return (
    <Card className="w-full max-w-3xl mx-auto shadow-lg">
       <CardHeader>
          <CardTitle className="text-2xl text-center font-bold text-primary">PPSSH NQESH Reviewer</CardTitle>
          <ProgressBar current={currentQuestionIndex} total={totalQuestions} className="mt-4"/>
        </CardHeader>
      <CardContent>
        <QuestionCard question={question} />
        <OptionsList
          options={question.options}
          questionId={question.id}
          selectedAnswer={selectedAnswer}
          onAnswer={onAnswer}
          className="mt-6"
        />
      </CardContent>
      <CardFooter className="flex justify-between border-t pt-6">
         {/* Use internal buttons calling the callbacks */}
         <Button
            variant="outline"
            onClick={onPrevClick}
            disabled={!canGoPrev}
         >
            Previous
         </Button>
         <Button
            onClick={onNextClick}
            disabled={!canGoNext} // Disable based on whether an answer is selected
         >
            {isLastQuestion ? 'Finish Quiz' : 'Next Question'}
         </Button>
      </CardFooter>
    </Card>
  );
};

export default QuizCard;
