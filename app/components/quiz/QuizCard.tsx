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
  onNext: () => void;
  onPrev: () => void;
  isLastQuestion: boolean;
}

const QuizCard: React.FC<QuizCardProps> = ({
  question,
  currentQuestionIndex,
  totalQuestions,
  selectedAnswer,
  onAnswer,
  onNext,
  onPrev,
  isLastQuestion,
}) => {
  return (
    <Card className="w-full max-w-3xl mx-auto shadow-lg">
       <CardHeader>
          <CardTitle className="text-2xl text-center font-bold">PPSSH NQESH Reviewer</CardTitle>
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
        <Button
          variant="outline"
          onClick={onPrev}
          disabled={currentQuestionIndex === 0}
        >
          Previous
        </Button>
        <Button
          onClick={onNext}
          disabled={!selectedAnswer}
          className="bg-primary hover:bg-primary/90 text-primary-foreground"
        >
          {isLastQuestion ? 'Finish Quiz' : 'Next Question'}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default QuizCard;