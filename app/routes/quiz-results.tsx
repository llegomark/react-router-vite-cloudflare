// FILE: app/quiz-results.tsx
import React, { useState, useCallback, useEffect } from 'react';
import { useRouteLoaderData, Link, useNavigate } from 'react-router';
import type { MetaFunction } from 'react-router'; // Import MetaFunction
import type { Question, QuizResults, DetailedAnswer, RadarChartDataPoint, DifficultyResult, SoloLevelResult } from '../types/quiz'; // Make sure QuizResults is imported
import ResultsAnalysis from '../components/quiz/ResultsAnalysis';
import { getAnswers, clearAnswers } from '../lib/quiz-storage'; // Import clearAnswers
import { Alert, AlertDescription, AlertTitle } from "../components/ui/alert";
import { Button } from "../components/ui/button";
import { Skeleton } from "../components/ui/skeleton";
import { Card, CardContent, CardHeader } from "../components/ui/card";

// --- Meta Function ---
export const meta: MetaFunction = () => {
  return [
    { title: "PPSSH Quiz Results" },
    { name: "description", content: "Review your performance on the PPSSH NQESH reviewer quiz, including domain, strand, and detailed analysis." },
  ];
};
// --- End Meta Function ---

// --- Helper Function for Difficulty Points ---
const getDifficultyPoints = (category?: string): number => {
  switch (category?.toLowerCase()) {
    case 'easy': return 1;
    case 'medium': return 2;
    case 'difficult': return 3;
    // Add 'very difficult' if you use it, e.g., return 4;
    default: return 1; // Default points for unknown/missing category
  }
};
// --- End Helper Function ---


export default function QuizResultsPage() {

  const [results, setResults] = useState<QuizResults | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate(); // Initialize useNavigate

  const layoutData = useRouteLoaderData('routes/quiz-layout') as { questions: Question[] } | undefined;
  const questions = layoutData?.questions || [];

  const [selectedDomain, setSelectedDomain] = useState<RadarChartDataPoint | null>(null);
  const handleDomainClick = useCallback((domain: RadarChartDataPoint | null) => {
      setSelectedDomain(domain);
  }, []);

  const handleResetQuiz = () => {
    // Clear answers explicitly here too, in case the user resets before the effect runs or if the effect failed.
    clearAnswers();
    navigate('/quiz/question/1', { replace: true }); // Use navigate instead of window.location
  };

  useEffect(() => {
      // Calculate results on the client after mount
      if (questions.length > 0) { // Ensure questions are loaded
          const answers = getAnswers(); // Get answers from localStorage

          // --- Prevent rendering results if not all questions are answered ---
          // We check this here to handle cases where the user might manually navigate
          // This doesn't prevent the navigation itself, but prevents showing incomplete results.
          // The navigation prevention will be handled on the question page.
          const answeredCount = Object.keys(answers).length;
          if (answeredCount < questions.length) {
              console.warn("Attempted to load results page with incomplete answers.");
              // Optionally, redirect back to the last question or show an error.
              // For now, we'll prevent calculation and show the error state later.
              setIsLoading(false); // Stop loading to trigger error display below
              return; // Exit useEffect early
          }
          // --- End incomplete answers check ---


          // --- Calculation Logic ---
          const domainResults: { [key: number]: { name: string; total: number; correct: number } } = {};
          const strandResults: { [key: string]: { name: string; domainId: number; domainName: string; total: number; correct: number } } = {};
          const careerStageResults: { [key: number]: { total: number; correct: number } } = {};
          const soloLevelResultsAcc: { [key: string]: { total: number; correct: number } } = {};
          const difficultyResultsAcc: { [key: string]: { total: number; correct: number } } = {};

          let correctCount = 0;
          let userWeightedScore = 0;
          let totalPossibleWeightedScore = 0;

          questions.forEach(question => {
              const userAnswer = answers[question.id];
              const isCorrect = userAnswer === question.correctAnswer;
              if (isCorrect) correctCount++;

              // --- Calculate Weighted Score ---
              const difficultyPoints = getDifficultyPoints(question.difficultyParams.category);
              totalPossibleWeightedScore += difficultyPoints;
              if (isCorrect) {
                userWeightedScore += difficultyPoints;
              }
              // --- End Weighted Score Calc ---

              // Domain
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
              if (!soloLevelResultsAcc[soloLevel]) soloLevelResultsAcc[soloLevel] = { total: 0, correct: 0 };
              soloLevelResultsAcc[soloLevel].total++;
              if (isCorrect) soloLevelResultsAcc[soloLevel].correct++;

              // Difficulty Level
              const difficultyCat = question.difficultyParams.category;
              if (!difficultyResultsAcc[difficultyCat]) difficultyResultsAcc[difficultyCat] = { total: 0, correct: 0 };
              difficultyResultsAcc[difficultyCat].total++;
              if (isCorrect) difficultyResultsAcc[difficultyCat].correct++;
          });

          const detailedAnswers: DetailedAnswer[] = questions.map(q => ({
              id: q.id, question: q.text, userAnswer: answers[q.id], correctAnswer: q.correctAnswer,
              isCorrect: answers[q.id] === q.correctAnswer, explanation: q.explanation,
              domain: q.domain.name, strand: q.strand.name, indicator: q.indicator.text,
              careerStage: q.careerStage, soloLevel: q.soloLevel, contentTags: q.contentTags,
              difficulty: q.difficultyParams.category
          }));

          // Process difficulty results
          const finalDifficultyResults: DifficultyResult[] = Object.entries(difficultyResultsAcc).map(([category, data]) => ({
              category: category,
              total: data.total,
              correct: data.correct,
              percentage: (data.correct / data.total) * 100 || 0,
          })).sort((a, b) => {
              const order = { 'Easy': 1, 'Medium': 2, 'Difficult': 3 };
              return (order[a.category as keyof typeof order] || 99) - (order[b.category as keyof typeof order] || 99);
          });

          // Process SOLO Level results
          const finalSoloLevelResults: SoloLevelResult[] = Object.entries(soloLevelResultsAcc).map(([level, data]) => ({
                level: level, total: data.total, correct: data.correct,
                percentage: (data.correct / data.total) * 100 || 0,
            })).sort((a, b) => {
                const order = { 'Unistructural': 1, 'Multistructural': 2, 'Relational': 3, 'Extended Abstract': 4 };
                return (order[a.level as keyof typeof order] || 99) - (order[b.level as keyof typeof order] || 99);
            });

          // --- Calculate Final Estimated Ability and Category ---
          const estimatedAbilityScore = totalPossibleWeightedScore > 0 ? (userWeightedScore / totalPossibleWeightedScore) * 100 : 0;

          // Define thresholds (Adjust these based on desired strictness/distribution)
          const THRESHOLD_A = 85.0; // Score >= 85% for Category A
          const THRESHOLD_B = 70.0; // Score >= 70% and < 85% for Category B

          let eligibilityCategory: 'A' | 'B' | 'C';
          if (estimatedAbilityScore >= THRESHOLD_A) {
            eligibilityCategory = 'A';
          } else if (estimatedAbilityScore >= THRESHOLD_B) {
            eligibilityCategory = 'B';
          } else {
            eligibilityCategory = 'C';
          }
          // --- End Ability/Category Calculation ---


          const finalResults: QuizResults = {
              totalQuestions: questions.length, correctAnswers: correctCount,
              overallPercentage: (correctCount / questions.length) * 100 || 0,
              domainResults: Object.entries(domainResults).map(([id, data]) => ({
                  id: Number(id), name: data.name, total: data.total, correct: data.correct,
                  percentage: (data.correct / data.total) * 100 || 0,
              })),
              strandResults: Object.entries(strandResults).map(([id, data]) => ({
                  id: id, name: data.name, domainId: data.domainId, domainName: data.domainName,
                  total: data.total, correct: data.correct, percentage: (data.correct / data.total) * 100 || 0,
              })).sort((a, b) => a.id.localeCompare(b.id)),
              careerStageResults: Object.entries(careerStageResults).map(([stage, data]) => ({
                  stage: Number(stage), total: data.total, correct: data.correct,
                  percentage: (data.correct / data.total) * 100 || 0,
              })).sort((a, b) => a.stage - b.stage),
              soloLevelResults: finalSoloLevelResults, // Use the calculated finalSoloLevelResults
              difficultyResults: finalDifficultyResults, // Use the calculated finalDifficultyResults
              detailedAnswers: detailedAnswers,
              // --- Add new fields ---
              estimatedAbilityScore: estimatedAbilityScore,
              eligibilityCategory: eligibilityCategory,
              // --- End new fields ---
          };

          setResults(finalResults);
          setIsLoading(false);

          // --- Clear local storage after results are calculated and set ---
          clearAnswers();
          console.log("Quiz answers cleared from local storage.");
          // --- End clearing local storage ---

      } else if (layoutData === undefined) {
          // Still waiting for layout data to load questions
          setIsLoading(true);
      } else {
          // layoutData is loaded, but questions array is empty or incomplete answers detected earlier
          console.error("Questions data is empty, failed to load, or not all questions were answered.");
          setIsLoading(false); // Stop loading, will show error state
      }
  }, [questions, layoutData]); // Dependencies // Removed navigate from dependencies as it's stable


  // --- Loading State ---
  if (isLoading) {
      return (
          <div className="container mx-auto p-4 max-w-7xl space-y-8">
              <Card className="shadow-lg border-primary/20">
                  <CardHeader className="text-center">
                      <Skeleton className="h-8 w-3/4 mx-auto" />
                      <Skeleton className="h-6 w-1/2 mx-auto mt-2" />
                  </CardHeader>
                  <CardContent className="pt-4">
                      <Skeleton className="h-3 w-full mb-6" />
                      <Skeleton className="h-40 w-full mt-6" />
                  </CardContent>
              </Card>
              {/* Add skeletons for other potential sections if desired */}
          </div>
      );
  }
  // --- End Loading State ---

   // --- Error State ---
   // Check for results being null or questions empty after loading attempt
   // Also handles the case where useEffect exited early due to incomplete answers
   if (!results || questions.length === 0) {
     return (
        <div className="container mx-auto p-4 max-w-lg mt-10">
            <Alert variant="destructive">
                <AlertTitle>Error Calculating Results</AlertTitle>
                <AlertDescription>
                    Could not calculate quiz results. This might happen if the quiz data failed to load correctly, or if not all questions were answered before attempting to view results.
                    Please try taking the quiz again.
                </AlertDescription>
                <div className="mt-4">
                    {/* Use Link component for client-side navigation */}
                    <Link to="/quiz/question/1">
                        <Button variant="destructive" onClick={clearAnswers}>Restart Quiz</Button> {/* Ensure storage is cleared on manual restart too */}
                    </Link>
                </div>
            </Alert>
        </div>
     );
   }
   // --- End Error State ---

  // Render the analysis component with the full results object
  return (
    <div className="w-full max-w-5xl"> {/* Added wrapper div for width control */}
        <ResultsAnalysis
          results={results}
          questions={questions}
          onResetQuiz={handleResetQuiz} // Pass the corrected reset handler
          selectedDomain={selectedDomain}
          onDomainClick={handleDomainClick}
        />
    </div>
  );
}
// --- END OF FILE app/routes/quiz-results.tsx ---