// FILE: app/quiz-question.tsx
import React, { useEffect, useState, useCallback } from 'react';
import { useRouteLoaderData, useNavigate } from 'react-router';
import type { MetaFunction } from 'react-router';
import type { Route } from "./+types/quiz-question";
import type { Question } from '../types/quiz';
import QuizCard from '../components/quiz/QuizCard';
import { getAnswer, saveAnswer, getAnswers } from '../lib/quiz-storage';
import { Alert, AlertDescription, AlertTitle } from "../components/ui/alert";
import { Button } from "../components/ui/button";
import { toast } from "sonner";

// Define the expected shape of the loader data explicitly
type QuestionLoaderData = {
  questionNumber: number;
  totalQuestions: number;
};

// Loader function (no changes needed here)
export async function loader({ params }: Route.LoaderArgs): Promise<QuestionLoaderData> {
  if (typeof params.questionNumber !== 'string') {
     throw new Response("Invalid question number parameter", { status: 400 });
  }
  const questionNumber = parseInt(params.questionNumber, 10);

  // TODO: Ideally, fetch only the required question, not all of them here.
  // For now, we keep loading all as the layout depends on it.
  const allQuestionsData = await import('../data/ppssh-quiz-questions.json');
  const allQuestions: Question[] = allQuestionsData.default;

  if (isNaN(questionNumber) || questionNumber < 1 || questionNumber > allQuestions.length) {
    throw new Response("Question not found", { status: 404 });
  }

  return {
    questionNumber: questionNumber,
    totalQuestions: allQuestions.length
   };
}

// --- Meta Function ---
export const meta: MetaFunction = ({ matches }) => {
    const currentRouteMatch = matches[matches.length - 1];
    const loaderData = currentRouteMatch?.data as QuestionLoaderData | undefined;

    if (!loaderData || typeof loaderData.questionNumber !== 'number' || typeof loaderData.totalQuestions !== 'number') {
        return [
            { title: "PPSSH Quiz Question" },
            { name: "description", content: "Answer PPSSH NQESH reviewer questions." },
        ];
    }

    const { questionNumber, totalQuestions } = loaderData;
    const parentMatch = matches.find(m => m.id === 'routes/quiz-layout');
    const questions = (parentMatch?.data as { questions: Question[] } | undefined)?.questions;
    const currentQuestion = questions?.[questionNumber - 1];
    const domainName = currentQuestion?.domain?.name ?? 'PPSSH';

    return [
        { title: `Question ${questionNumber}/${totalQuestions} - PPSSH Quiz` },
        { name: "description", content: `Answer question ${questionNumber} about the ${domainName} domain for the PPSSH NQESH reviewer.` },
    ];
};
// --- End Meta Function ---


export default function QuizQuestionPage({ loaderData }: Route.ComponentProps) { // Removed params as it's in loaderData
  const { questionNumber, totalQuestions } = loaderData;
  const layoutData = useRouteLoaderData('routes/quiz-layout') as { questions: Question[] } | undefined;
  const navigate = useNavigate();

  // --- State ---
  const [selectedAnswer, setSelectedAnswer] = useState<string | undefined>(undefined);

  // --- Derived Data ---
  const allQuestions = layoutData?.questions;
  const currentQuestion = allQuestions?.[questionNumber - 1];
  const nextQuestionNumber = questionNumber + 1;
  const prevQuestionNumber = questionNumber - 1;
  const isLastQuestion = questionNumber === totalQuestions;
  const canGoPrev = prevQuestionNumber > 0;
  // Enable next/finish only if an answer is selected for the *current* question
  const canGoNext = !!selectedAnswer;

  // --- Effects ---
  useEffect(() => {
    // Load saved answer for the current question when the question changes
    if (currentQuestion?.id) {
      setSelectedAnswer(getAnswer(currentQuestion.id));
    } else {
      setSelectedAnswer(undefined); // Reset if question ID is somehow missing
    }
  }, [currentQuestion?.id]); // Depend only on the question ID

  // --- Callbacks ---
  const handleAnswerSelect = useCallback((questionId: number, answer: string) => {
    setSelectedAnswer(answer);
    saveAnswer(questionId, answer);
  }, []); // No dependencies needed as saveAnswer is stable

  const handleNextClick = useCallback(() => {
    if (!canGoNext) return; // Should not happen if button is disabled, but safety check

    if (isLastQuestion) {
        // Check if all questions are answered before finishing
        const answers = getAnswers();
        const answeredCount = Object.keys(answers).length;

        if (answeredCount === totalQuestions) {
            navigate('/quiz/results');
        } else {
            // Use sonner toast for notification
            toast.warning("Incomplete Quiz", {
                description: `Please answer all ${totalQuestions} questions before finishing. You have answered ${answeredCount}.`,
            });
        }
    } else {
        navigate(`/quiz/question/${nextQuestionNumber}`);
    }
  }, [navigate, isLastQuestion, nextQuestionNumber, totalQuestions, canGoNext]);

  const handlePrevClick = useCallback(() => {
    if (!canGoPrev) return; // Safety check
    navigate(`/quiz/question/${prevQuestionNumber}`);
  }, [navigate, prevQuestionNumber, canGoPrev]);

  // --- Render Logic ---
  if (!allQuestions) {
     return (
        <Alert variant="destructive">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>Could not load quiz questions data.</AlertDescription>
        </Alert>
     );
  }

  if (!currentQuestion) {
       return (
           <div className="text-center">
               <Alert variant="destructive">
                   <AlertTitle>Error</AlertTitle>
                   <AlertDescription>Invalid question data for question number {questionNumber}.</AlertDescription>
               </Alert>
               {/* Provide a way back if something goes wrong */}
               <Button variant="link" onClick={() => navigate('/quiz/question/1', { replace: true })} className="mt-4">
                   Go to First Question
               </Button>
           </div>
       );
   }

  return (
    <div className="w-full max-w-3xl"> {/* Added wrapper div for width control */}
        <QuizCard
          key={currentQuestion.id} // Force remount/update if needed
          question={currentQuestion}
          currentQuestionIndex={questionNumber - 1}
          totalQuestions={totalQuestions}
          selectedAnswer={selectedAnswer}
          onAnswer={handleAnswerSelect}
          isLastQuestion={isLastQuestion}
          onNextClick={handleNextClick} // Use callback
          onPrevClick={handlePrevClick} // Use callback
          canGoNext={canGoNext}         // Pass disabled state logic
          canGoPrev={canGoPrev}         // Pass disabled state logic
        />
    </div>
  );
}