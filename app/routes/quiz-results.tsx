// FILE: app/routes/quiz-results.tsx
import React, { useState, useCallback, useEffect } from 'react';
import { useRouteLoaderData, Link, useNavigate } from 'react-router'; // Added useNavigate
import type { Question, QuizResults, DetailedAnswer, RadarChartDataPoint, DifficultyResult, SoloLevelResult } from '../types/quiz';
import ResultsAnalysis from '../components/quiz/ResultsAnalysis';
import { getAnswers, clearAnswers } from '../lib/quiz-storage';
import { Alert, AlertDescription, AlertTitle } from "../components/ui/alert";
import { Button } from "../components/ui/button";
import { Skeleton } from "../components/ui/skeleton";
import { Card, CardContent, CardHeader } from "../components/ui/card";

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
    clearAnswers();
    navigate('/quiz/question/1', { replace: true }); // Use navigate instead of window.location
  };

  useEffect(() => {
      // ... (calculation logic remains the same) ...
       if (questions.length > 0) {
          const answers = getAnswers();
          const domainResults: { [key: number]: { name: string; total: number; correct: number } } = {};
          const strandResults: { [key: string]: { name: string; domainId: number; domainName: string; total: number; correct: number } } = {};
          const careerStageResults: { [key: number]: { total: number; correct: number } } = {};
          const soloLevelResultsAcc: { [key: string]: { total: number; correct: number } } = {};
          const difficultyResultsAcc: { [key: string]: { total: number; correct: number } } = {};
          let correctCount = 0;

          questions.forEach(question => {
              const userAnswer = answers[question.id];
              const isCorrect = userAnswer === question.correctAnswer;
              if (isCorrect) correctCount++;

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

          const finalDifficultyResults: DifficultyResult[] = Object.entries(difficultyResultsAcc).map(([category, data]) => ({
              category: category,
              total: data.total,
              correct: data.correct,
              percentage: (data.correct / data.total) * 100 || 0,
          })).sort((a, b) => {
              const order = { 'Easy': 1, 'Medium': 2, 'Difficult': 3 };
              return (order[a.category as keyof typeof order] || 99) - (order[b.category as keyof typeof order] || 99);
          });

          const finalSoloLevelResults: SoloLevelResult[] = Object.entries(soloLevelResultsAcc).map(([level, data]) => ({
                level: level, total: data.total, correct: data.correct,
                percentage: (data.correct / data.total) * 100 || 0,
            })).sort((a, b) => {
                const order = { 'Unistructural': 1, 'Multistructural': 2, 'Relational': 3, 'Extended Abstract': 4 };
                return (order[a.level as keyof typeof order] || 99) - (order[b.level as keyof typeof order] || 99);
            });


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
              soloLevelResults: finalSoloLevelResults,
              difficultyResults: finalDifficultyResults,
              detailedAnswers: detailedAnswers,
          };

          setResults(finalResults);
          setIsLoading(false);
      } else if (layoutData === undefined) {
          setIsLoading(true);
      } else {
          console.error("Questions data is empty.");
          setIsLoading(false);
      }
  }, [questions, layoutData]);

  // ... (loading and error states remain the same) ...
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
          </div>
      );
  }

   if (!results || questions.length === 0) {
     return (
        <div className="container mx-auto p-4 max-w-lg">
            <Alert variant="destructive">
                <AlertTitle>Error Calculating Results</AlertTitle>
                <AlertDescription>
                    Could not calculate quiz results. This might happen if no answers were recorded.
                    Please try taking the quiz again.
                </AlertDescription>
                <div className="mt-4">
                    <Link to="/quiz/question/1">
                        <Button variant="destructive">Restart Quiz</Button>
                    </Link>
                </div>
            </Alert>
        </div>
     );
   }

  return (
    <ResultsAnalysis
      results={results}
      questions={questions}
      onResetQuiz={handleResetQuiz}
      selectedDomain={selectedDomain}
      onDomainClick={handleDomainClick}
    />
  );
}