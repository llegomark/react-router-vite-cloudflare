// FILE: app/routes/quiz-results.tsx
import React, { useState, useCallback } from 'react';
// Make sure useLoaderData is imported if using the hook, but we'll use props
import { useRouteLoaderData, Link } from 'react-router';
import type { Route } from "./+types/quiz-results";
import type { Question, QuizResults, DetailedAnswer, RadarChartDataPoint } from '../types/quiz';
import ResultsAnalysis from '../components/quiz/ResultsAnalysis';
import { getAnswers, clearAnswers } from '../lib/quiz-storage';
import { Alert, AlertDescription, AlertTitle } from "../components/ui/alert";
import { Button } from "../components/ui/button";


// Loader calculates results based on stored answers and parent question data
export async function loader() {
    // --- Calculation Logic (remains the same) ---
    const allQuestionsData = await import('../data/ppssh-quiz-questions.json');
    const allQuestions: Question[] = allQuestionsData.default;
    const answers = getAnswers();

    const domainResults: { [key: number]: { name: string; total: number; correct: number } } = {};
    const strandResults: { [key: string]: { name: string; domainId: number; domainName: string; total: number; correct: number } } = {};
    const careerStageResults: { [key: number]: { total: number; correct: number } } = {};
    const soloLevelResults: { [key: string]: { total: number; correct: number } } = {};
    let correctCount = 0;

    allQuestions.forEach(question => {
        const userAnswer = answers[question.id];
        const isCorrect = userAnswer === question.correctAnswer;
        if (isCorrect) correctCount++;
        // ... (rest of calculation logic) ...
        const domainId = question.domain.id;
            if (!domainResults[domainId]) domainResults[domainId] = { name: question.domain.name, total: 0, correct: 0 };
            domainResults[domainId].total++;
            if (isCorrect) domainResults[domainId].correct++;
            // Strand
            const strandId = question.strand.id;
            if (!strandResults[strandId]) strandResults[strandId] = { name: question.strand.name, domainId: domainId, domainName: question.domain.name, total: 0, correct: 0 };
            strandResults[strandId].total++;
            if (isCorrect) strandResults[strandId].correct++;
            // Career Stage
            const careerStage = question.careerStage;
            if (!careerStageResults[careerStage]) careerStageResults[careerStage] = { total: 0, correct: 0 };
            careerStageResults[careerStage].total++;
            if (isCorrect) careerStageResults[careerStage].correct++;
            // SOLO Level
            const soloLevel = question.soloLevel;
            if (!soloLevelResults[soloLevel]) soloLevelResults[soloLevel] = { total: 0, correct: 0 };
            soloLevelResults[soloLevel].total++;
            if (isCorrect) soloLevelResults[soloLevel].correct++;
    });
     const detailedAnswers: DetailedAnswer[] = allQuestions.map(q => ({
        id: q.id, question: q.text, userAnswer: answers[q.id], correctAnswer: q.correctAnswer,
        isCorrect: answers[q.id] === q.correctAnswer, explanation: q.explanation,
        domain: q.domain.name, strand: q.strand.name, indicator: q.indicator.text,
        careerStage: q.careerStage, soloLevel: q.soloLevel, contentTags: q.contentTags,
    }));
     const finalResults: QuizResults = {
        totalQuestions: allQuestions.length, correctAnswers: correctCount,
        overallPercentage: (correctCount / allQuestions.length) * 100,
        domainResults: Object.entries(domainResults).map(([id, data]) => ({
            id: Number(id), name: data.name, total: data.total, correct: data.correct,
            percentage: (data.correct / data.total) * 100 || 0,
        })),
        strandResults: Object.entries(strandResults).map(([id, data]) => ({
            id: id, name: data.name, domainId: data.domainId, domainName: data.domainName,
            total: data.total, correct: data.correct, percentage: (data.correct / data.total) * 100 || 0,
        })),
        careerStageResults: Object.entries(careerStageResults).map(([stage, data]) => ({
            stage: Number(stage), total: data.total, correct: data.correct,
            percentage: (data.correct / data.total) * 100 || 0,
        })),
         soloLevelResults: Object.entries(soloLevelResults).map(([level, data]) => ({
            level: level, total: data.total, correct: data.correct,
            percentage: (data.correct / data.total) * 100 || 0,
        })),
        detailedAnswers: detailedAnswers,
    };
    // --- End Calculation Logic ---

    return { results: finalResults }; // Ensure loader returns object with 'results' key
}

// Explicitly type loaderData if auto-generation isn't working
interface QuizResultsLoaderData {
    results: QuizResults | null; // Loader might fail, handle null case
}

// Use the interface or rely on Route.ComponentProps if typegen works
// export default function QuizResultsPage({ loaderData }: Route.ComponentProps) { // OLD - Relies on typegen
export default function QuizResultsPage({ loaderData }: { loaderData: QuizResultsLoaderData }) { // NEW - Explicit type

  const { results } = loaderData; // Now correctly typed (or null)

  // Type assertion is okay here, assuming route ID is correct and data loaded
  const layoutData = useRouteLoaderData('routes/quiz-layout') as { questions: Question[] } | undefined;
  const questions = layoutData?.questions || []; // Default to empty array

  const [selectedDomain, setSelectedDomain] = useState<RadarChartDataPoint | null>(null);
  const handleDomainClick = useCallback((domain: RadarChartDataPoint | null) => {
      setSelectedDomain(domain);
  }, []);

  const handleResetQuiz = () => {
    clearAnswers();
    window.location.href = '/quiz/question/1'; // Consider using navigate() hook if preferred
  };

  // Add a check for results being null or undefined
   if (!results) {
     return (
        <Alert variant="destructive">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>Could not load or calculate quiz results.</AlertDescription>
        </Alert>
     );
   }

   // Add check for questions being empty if needed by ResultsAnalysis
   if (questions.length === 0) {
        return (
            <Alert variant="destructive">
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>Quiz question data is missing for results display.</AlertDescription>
            </Alert>
        );
   }

  return (
    <ResultsAnalysis
      results={results} // results is now potentially null, but we checked above
      questions={questions}
      onResetQuiz={handleResetQuiz}
      selectedDomain={selectedDomain}
      onDomainClick={handleDomainClick}
    />
  );
}