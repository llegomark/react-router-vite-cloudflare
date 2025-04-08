// FILE: app/routes/quiz-question.tsx
import React, { useEffect } from 'react';
// Make sure useLoaderData is imported if using the hook, but we'll use props
import { useRouteLoaderData, useParams, Link, useFetcher } from 'react-router';
import type { Route } from "./+types/quiz-question";
import type { Question } from '../types/quiz';
import QuizCard from '../components/quiz/QuizCard';
import { getAnswer } from '../lib/quiz-storage'; // Removed saveAnswer, action handles it
import { Alert, AlertDescription, AlertTitle } from "../components/ui/alert";
import { Button } from "../components/ui/button";
// Import json util if needed for action return type hinting
// import { data } from 'react-router';

// Loader for this specific question route
export async function loader({ params }: Route.LoaderArgs) {
  // Ensure params.questionNumber exists before parsing
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

// Explicitly type loaderData if auto-generation isn't working
interface QuizQuestionLoaderData {
    questionNumber: number;
    totalQuestions: number;
}

// Use the interface or rely on Route.ComponentProps if typegen works
// export default function QuizQuestionPage({ loaderData }: Route.ComponentProps) { // OLD - Relies on typegen
export default function QuizQuestionPage({ loaderData }: { loaderData: QuizQuestionLoaderData }) { // NEW - Explicit type

  // const params = useParams(); // params.questionNumber is available in loaderData now
  const { questionNumber, totalQuestions } = loaderData; // Now correctly typed

  // Type assertion is still okay here, assuming the route ID is correct
  const layoutData = useRouteLoaderData('routes/quiz-layout') as { questions: Question[] } | undefined;
  const fetcher = useFetcher();

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

  const [selectedAnswer, setSelectedAnswer] = React.useState<string | undefined>(() => getAnswer(currentQuestion.id));

   useEffect(() => {
       // Ensure currentQuestion.id exists before accessing localStorage
       if (currentQuestion?.id) {
           setSelectedAnswer(getAnswer(currentQuestion.id));
       }
   }, [currentQuestion?.id]); // Depend on currentQuestion.id

  const handleAnswerSelect = (questionId: number, answer: string) => {
    setSelectedAnswer(answer);
    fetcher.submit(
        { questionId: questionId.toString(), answer: answer },
        { method: 'post', action: `/quiz/question/${questionNumber}/answer` }
    );
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