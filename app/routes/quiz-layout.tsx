// FILE: app/quiz-layout.tsx
import React from 'react';
// Remove useLoaderData if it's not used directly here
import { Outlet, useNavigation } from 'react-router';
import type { Route } from "./+types/quiz-layout";
import type { Question } from '../types/quiz'; // Keep type import if needed elsewhere or for loader
import allQuestions from '../data/ppssh-quiz-questions.json';
import { cn } from "../lib/utils";

// Server loader loads all questions once
export async function loader() {
  try {
    const questions: Question[] = allQuestions;
    return { questions };
  } catch (error) {
    console.error("Failed to load quiz questions:", error);
    throw new Response("Failed to load quiz data", { status: 500 });
  }
}

// Remove loaderData from props if not used directly in this component
// export default function QuizLayout({ loaderData }: Route.ComponentProps) { // OLD
export default function QuizLayout() { // NEW - No props needed here directly
  // const { questions } = loaderData; // REMOVE THIS LINE
  const navigation = useNavigation();

  // Pass all questions down via Outlet context if needed, or rely on useRouteLoaderData
  // For simplicity, we'll rely on useRouteLoaderData in child routes.

  return (
    <div className="flex flex-col min-h-screen bg-muted/40">
      {/* Main content area */}
      <main className={cn(
            "flex-grow flex justify-center items-start py-10 px-4",
            navigation.state === "loading" ? "opacity-75 transition-opacity duration-200" : ""
        )}>
         <Outlet />
      </main>
    </div>
  );
}