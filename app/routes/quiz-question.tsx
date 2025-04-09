// FILE: app/routes/quiz-question.tsx
import React, { useEffect, useState } from 'react';
import { useRouteLoaderData, Link, useNavigate } from 'react-router';
import type { MetaFunction } from 'react-router';
import type { Route } from "./+types/quiz-question";
import type { Question } from '../types/quiz';
import QuizCard from '../components/quiz/QuizCard';
import { getAnswer, saveAnswer } from '../lib/quiz-storage';
import { Alert, AlertDescription, AlertTitle } from "../components/ui/alert";
import { Button } from "../components/ui/button";

// Define the expected shape of the loader data explicitly
type QuestionLoaderData = {
  questionNumber: number;
  totalQuestions: number;
};

// Loader function (no changes needed here)
export async function loader({ params }: Route.LoaderArgs): Promise<QuestionLoaderData> { // Explicit return type
  if (typeof params.questionNumber !== 'string') {
     throw new Response("Invalid question number parameter", { status: 400 });
  }
  const questionNumber = parseInt(params.questionNumber, 10);

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
// Note: We remove <typeof loader> here as we'll get data from matches
export const meta: MetaFunction = ({ matches }) => {
    // Find the match for the current route itself
    // The last match in the array is typically the deepest/current one
    const currentRouteMatch = matches[matches.length - 1];
    // Get the loader data from this route's match, asserting its type
    const loaderData = currentRouteMatch?.data as QuestionLoaderData | undefined;

    // Check if the loader data exists and has the expected properties
    if (!loaderData || typeof loaderData.questionNumber !== 'number' || typeof loaderData.totalQuestions !== 'number') {
        // Return default meta if data is missing or invalid
        return [
            { title: "PPSSH Quiz Question" },
            { name: "description", content: "Answer PPSSH NQESH reviewer questions." },
        ];
    }

    // --- Data is valid, access properties directly ---
    const { questionNumber, totalQuestions } = loaderData;

    // Access parent loader data for additional context
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


// Component remains the same...
export default function QuizQuestionPage({ loaderData, params }: Route.ComponentProps) {
  const { questionNumber, totalQuestions } = loaderData;
  const layoutData = useRouteLoaderData('routes/quiz-layout') as { questions: Question[] } | undefined;

  if (!layoutData?.questions) {
     return (
        <Alert variant="destructive">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>Could not load quiz layout data.</AlertDescription>
        </Alert>
     );
  }

  const allQuestions = layoutData.questions;
  const currentQuestion = allQuestions[questionNumber - 1];

   if (!currentQuestion) {
       return (
           <div className="text-center">
               <Alert variant="destructive">
                   <AlertTitle>Error</AlertTitle>
                   <AlertDescription>Invalid question data retrieved.</AlertDescription>
               </Alert>
               <Link to="/quiz/question/1" className="mt-4 inline-block">
                   <Button variant="link">Go to First Question</Button>
               </Link>
           </div>
       );
   }

  const [selectedAnswer, setSelectedAnswer] = useState<string | undefined>(undefined);
  const navigate = useNavigate();

   useEffect(() => {
       if (currentQuestion?.id) {
           setSelectedAnswer(getAnswer(currentQuestion.id));
       } else {
           setSelectedAnswer(undefined);
       }
   }, [currentQuestion?.id]);

  const handleAnswerSelect = (questionId: number, answer: string) => {
    setSelectedAnswer(answer);
    saveAnswer(questionId, answer);
  };

  const nextQuestionNumber = questionNumber + 1;
  const prevQuestionNumber = questionNumber - 1;
  const isLastQuestion = questionNumber === totalQuestions;

  return (
    <QuizCard
      key={currentQuestion.id} // Force remount when question ID changes
      question={currentQuestion}
      currentQuestionIndex={questionNumber - 1}
      totalQuestions={totalQuestions}
      selectedAnswer={selectedAnswer}
      onAnswer={handleAnswerSelect}
      isLastQuestion={isLastQuestion}
      NextLinkComponent={isLastQuestion
          ? <Link to="/quiz/results"><Button disabled={!selectedAnswer}>Finish Quiz</Button></Link>
          : <Link to={`/quiz/question/${nextQuestionNumber}`}><Button disabled={!selectedAnswer}>Next Question</Button></Link>
      }
      PrevLinkComponent={prevQuestionNumber > 0
          ? <Link to={`/quiz/question/${prevQuestionNumber}`}><Button variant="outline">Previous</Button></Link>
          : <Button variant="outline" disabled>Previous</Button>
      }
    />
  );
}