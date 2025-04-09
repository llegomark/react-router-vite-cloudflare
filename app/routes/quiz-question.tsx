// FILE: app/routes/quiz-question.tsx
import React, { useEffect, useState } from 'react';
import { useRouteLoaderData, Link, useNavigate } from 'react-router'; // Added useNavigate
import type { Route } from "./+types/quiz-question"; // Use auto-generated type
import type { Question } from '../types/quiz';
import QuizCard from '../components/quiz/QuizCard';
import { getAnswer, saveAnswer } from '../lib/quiz-storage';
import { Alert, AlertDescription, AlertTitle } from "../components/ui/alert";
import { Button } from "../components/ui/button";

// Loader remains the same...
export async function loader({ params }: Route.LoaderArgs) { // Route.LoaderArgs is already using generated types
  if (typeof params.questionNumber !== 'string') {
     throw new Response("Invalid question number parameter", { status: 400 });
  }
  const questionNumber = parseInt(params.questionNumber, 10);

  // Dynamically import JSON data
  const allQuestionsData = await import('../data/ppssh-quiz-questions.json');
  const allQuestions: Question[] = allQuestionsData.default; // Access default export

  if (isNaN(questionNumber) || questionNumber < 1 || questionNumber > allQuestions.length) {
    throw new Response("Question not found", { status: 404 });
  }

  return {
    questionNumber: questionNumber,
    totalQuestions: allQuestions.length
   };
}

// Removed explicit interface QuizQuestionLoaderData

// Use Route.ComponentProps which includes typed loaderData and params
export default function QuizQuestionPage({ loaderData, params }: Route.ComponentProps) {

  // loaderData and params are now correctly typed via Route.ComponentProps
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
  const currentQuestion = allQuestions[questionNumber - 1]; // Use questionNumber directly

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
  const navigate = useNavigate(); // Added useNavigate hook

   useEffect(() => {
       if (currentQuestion?.id) {
           setSelectedAnswer(getAnswer(currentQuestion.id));
       }
   }, [currentQuestion?.id]);

  const handleAnswerSelect = (questionId: number, answer: string) => {
    setSelectedAnswer(answer);
    saveAnswer(questionId, answer);
  };

  const nextQuestionNumber = questionNumber + 1;
  const prevQuestionNumber = questionNumber - 1;
  const isLastQuestion = questionNumber === totalQuestions;

  // Optional: Could use navigate for Next/Prev for consistency, but Link is fine too
  // const handleNext = () => navigate(`/quiz/question/${nextQuestionNumber}`);
  // const handlePrev = () => navigate(`/quiz/question/${prevQuestionNumber}`);

  return (
    <QuizCard
      key={currentQuestion.id}
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