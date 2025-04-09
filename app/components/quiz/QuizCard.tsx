// FILE: app/components/quiz/QuizCard.tsx
import React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button'; // Keep Button for structure if needed, Links handle clicks
import ProgressBar from './ProgressBar';
import QuestionCard from './QuestionCard';
import OptionsList from './OptionsList';
import type { Question } from '../../types/quiz';

interface QuizCardProps {
  question: Question;
  currentQuestionIndex: number; // Still useful for ProgressBar
  totalQuestions: number;
  selectedAnswer?: string;
  onAnswer: (questionId: number, answer: string) => void;
  // Removed onNext, onPrev
  isLastQuestion: boolean;
  NextLinkComponent: React.ReactNode; // Accept Link/Button as Node
  PrevLinkComponent: React.ReactNode; // Accept Link/Button as Node
}

const QuizCard: React.FC<QuizCardProps> = ({
  question,
  currentQuestionIndex,
  totalQuestions,
  selectedAnswer,
  onAnswer,
  isLastQuestion, // Keep for button text logic if needed within Link
  NextLinkComponent,
  PrevLinkComponent,
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
          onAnswer={onAnswer} // Pass down the handler
          className="mt-6"
        />
      </CardContent>
      <CardFooter className="flex justify-between border-t pt-6">
         {/* Render the Link components passed as props */}
         {PrevLinkComponent}
         {NextLinkComponent}
      </CardFooter>
    </Card>
  );
};

export default QuizCard;