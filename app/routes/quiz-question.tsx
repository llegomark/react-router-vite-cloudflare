// FILE: app/routes/quiz-question.tsx
import React, { useEffect, useState } from 'react'; // Added useState
import { useRouteLoaderData, Link } from 'react-router'; // Removed useFetcher
import type { Route } from "./+types/quiz-question";
import type { Question } from '../types/quiz';
import QuizCard from '../components/quiz/QuizCard';
import { getAnswer, saveAnswer } from '../lib/quiz-storage'; // Import saveAnswer
import { Alert, AlertDescription, AlertTitle } from "../components/ui/alert";
import { Button } from "../components/ui/button";

// Loader remains the same...
export async function loader({ params }: Route.LoaderArgs) {
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

// Explicitly type loaderData if auto-generation isn't working
interface QuizQuestionLoaderData {
    questionNumber: number;
    totalQuestions: number;
}

// Use the interface or rely on Route.ComponentProps if typegen works
export default function QuizQuestionPage({ loaderData }: { loaderData: QuizQuestionLoaderData }) {

  const { questionNumber, totalQuestions } = loaderData; // Now correctly typed

  // Type assertion is still okay here, assuming the route ID is correct
  const layoutData = useRouteLoaderData('routes/quiz-layout') as { questions: Question[] } | undefined;

  // Better check for layoutData
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

   // Check if currentQuestion exists after indexing
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

  const [selectedAnswer, setSelectedAnswer] = useState<string | undefined>(undefined); // Initialize as undefined

   useEffect(() => {
       // Load answer from storage when component mounts or question changes
       if (currentQuestion?.id) {
           setSelectedAnswer(getAnswer(currentQuestion.id));
       }
   }, [currentQuestion?.id]); // Depend on currentQuestion.id

  const handleAnswerSelect = (questionId: number, answer: string) => {
    setSelectedAnswer(answer);
    saveAnswer(questionId, answer); // Save directly to localStorage
  };

  const nextQuestionNumber = questionNumber + 1;
  const prevQuestionNumber = questionNumber - 1;
  const isLastQuestion = questionNumber === totalQuestions;

  return (
    <QuizCard
      key={currentQuestion.id} // Keep the key for resetting state
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