// FILE: app/components/PPSSHQuizApp.tsx
import React, { useState, useEffect, useCallback } from 'react';
import QuizCard from './quiz/QuizCard';
import ResultsAnalysis from './quiz/ResultsAnalysis';
import type { Question, QuizResults, DetailedAnswer, RadarChartDataPoint } from '../types/quiz';
import { Skeleton } from "../components/ui/skeleton"; // For loading state

interface PPSSHQuizAppProps {
  questions: Question[];
}

const PPSSHQuizApp: React.FC<PPSSHQuizAppProps> = ({ questions }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<{ [key: number]: string }>({});
  const [quizComplete, setQuizComplete] = useState(false);
  const [results, setResults] = useState<QuizResults | null>(null);
  const [selectedDomain, setSelectedDomain] = useState<RadarChartDataPoint | null>(null);
  const [isLoading, setIsLoading] = useState(true);

   useEffect(() => {
    if (questions && questions.length > 0) {
        setIsLoading(false);
    }
  }, [questions]);


  const handleAnswer = useCallback((questionId: number, selectedOption: string) => {
    setAnswers(prevAnswers => ({
      ...prevAnswers,
      [questionId]: selectedOption
    }));
  }, []);

  const handleNext = useCallback(() => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prevIndex => prevIndex + 1);
    } else {
      completeQuiz();
    }
  }, [currentQuestionIndex, questions.length]); // Added completeQuiz dependency

  const handlePrev = useCallback(() => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prevIndex => prevIndex - 1);
    }
  }, [currentQuestionIndex]);

  // Use useCallback for completeQuiz as well, depends on `answers` and `questions`
  const completeQuiz = useCallback(() => {
     // --- Calculation logic remains the same ---
    const domainResults: { [key: number]: { name: string; total: number; correct: number } } = {};
    const strandResults: { [key: string]: { name: string; domainId: number; domainName: string; total: number; correct: number } } = {};
    const careerStageResults: { [key: number]: { total: number; correct: number } } = {};
    const soloLevelResults: { [key: string]: { total: number; correct: number } } = {};
    let correctCount = 0;

    questions.forEach(question => {
      const isCorrect = answers[question.id] === question.correctAnswer;
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
      if (!soloLevelResults[soloLevel]) soloLevelResults[soloLevel] = { total: 0, correct: 0 };
      soloLevelResults[soloLevel].total++;
      if (isCorrect) soloLevelResults[soloLevel].correct++;
    });
     const detailedAnswers: DetailedAnswer[] = questions.map(q => ({
        id: q.id, question: q.text, userAnswer: answers[q.id], correctAnswer: q.correctAnswer,
        isCorrect: answers[q.id] === q.correctAnswer, explanation: q.explanation,
        domain: q.domain.name, strand: q.strand.name, indicator: q.indicator.text,
        careerStage: q.careerStage, soloLevel: q.soloLevel, contentTags: q.contentTags,
    }));
     const finalResults: QuizResults = {
      totalQuestions: questions.length, correctAnswers: correctCount,
      overallPercentage: (correctCount / questions.length) * 100,
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
     setResults(finalResults);
     setQuizComplete(true);
  }, [answers, questions]); // Added dependencies

  const resetQuiz = useCallback(() => {
    setCurrentQuestionIndex(0);
    setAnswers({});
    setQuizComplete(false);
    setResults(null);
    setSelectedDomain(null);
    setIsLoading(true);
     if (questions && questions.length > 0) {
         setIsLoading(false);
     }
  }, [questions]);

   const handleDomainClick = useCallback((domain: RadarChartDataPoint | null) => {
       setSelectedDomain(domain);
   }, []);

  // Loading State UI
  if (isLoading) {
    // ... (Skeleton Loading UI remains the same)
      return (
      <div className="container mx-auto p-4 max-w-3xl space-y-4">
         <Skeleton className="h-12 w-1/2 mx-auto" />
         <Skeleton className="h-8 w-1/4 mx-auto" />
         <Skeleton className="h-4 w-full" />
         <div className="space-y-4 mt-6">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
         </div>
          <div className="flex justify-between mt-6">
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-24" />
         </div>
      </div>
    );
  }


  // Results View
  if (quizComplete && results) {
    return (
      <ResultsAnalysis
        results={results}
        questions={questions}
        onResetQuiz={resetQuiz}
        selectedDomain={selectedDomain}
        onDomainClick={handleDomainClick}
      />
    );
  }

  // Quiz View
  const currentQuestion = questions[currentQuestionIndex];
  if (!currentQuestion) {
     return <div className="container mx-auto p-4 text-center">No questions available or error loading quiz.</div>;
  }


  return (
    <div className="flex justify-center items-start min-h-screen bg-muted/40 py-10">
        {/* --- ADD key PROP HERE --- */}
        <QuizCard
            key={currentQuestion.id} // <--- THIS IS THE FIX
            question={currentQuestion}
            currentQuestionIndex={currentQuestionIndex}
            totalQuestions={questions.length}
            selectedAnswer={answers[currentQuestion.id]}
            onAnswer={handleAnswer}
            onNext={handleNext}
            onPrev={handlePrev}
            isLastQuestion={currentQuestionIndex === questions.length - 1}
        />
        {/* --- END --- */}
    </div>
  );
};

export default PPSSHQuizApp;