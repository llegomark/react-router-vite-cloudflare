// FILE: app/routes/home.tsx
import React from 'react';
import type { Route } from "./+types/home"; // Adjust if your type generation path differs
import PPSSHQuizApp from '../components/PPSSHQuizApp'; // Use correct path alias
import type { Question } from '../types/quiz'; // Use correct path alias
import { Alert, AlertDescription, AlertTitle } from "../components/ui/alert";
import { Terminal } from "lucide-react";

// --- Import the JSON data directly ---
// Vite allows direct JSON imports. This happens server-side (or build-time).
import allQuestions from '../data/ppssh-quiz-questions.json'; // Adjusted path

// --- Use server loader ---
// This runs on the server (or at build time for pre-rendering).
// The actual JSON file content (esp. answers) is NOT sent to the client bundle.
export async function loader() {
  try {
    // In a real scenario with dynamic loading or DB, you'd fetch here.
    // Since it's a static import, we just return it.
    // We *could* filter out the 'correctAnswer' here if we wanted the client
    // *never* to see it, even after loading. But for the quiz logic as written,
    // the client component needs the full question structure temporarily.
    // The key is that the *source* JSON isn't exposed.
    const questions: Question[] = allQuestions;
    return { questions };
  } catch (error) {
    console.error("Failed to load quiz questions from import:", error);
    // Return empty array or specific error structure
    return { questions: [], error: "Failed to load questions. Please try again later." };
  }
}
// --- REMOVE clientLoader and HydrateFallback ---
// export async function clientLoader() { /* ... */ }
// export function HydrateFallback() { /* ... */ }


export function meta() {
  return [
    { title: "PPSSH NQESH Reviewer" },
    { name: "description", content: "Interactive quiz for PPSSH competencies." },
  ];
}

// Main component for the home route
// It now receives data from the server `loader`
export default function HomePage({ loaderData }: Route.ComponentProps) {
   if (loaderData.error) {
     return (
       <div className="container mx-auto p-4 max-w-3xl">
          <Alert variant="destructive">
            <Terminal className="h-4 w-4" />
            <AlertTitle>Error Loading Quiz</AlertTitle>
            <AlertDescription>
              {loaderData.error}
            </AlertDescription>
          </Alert>
       </div>
     );
   }

   const questions = Array.isArray(loaderData.questions) ? loaderData.questions : [];

   if (questions.length === 0 && !loaderData.error) {
      return (
       <div className="container mx-auto p-4 max-w-3xl">
          <Alert>
            <Terminal className="h-4 w-4" />
            <AlertTitle>No Questions Found</AlertTitle>
            <AlertDescription>
              The quiz data could not be loaded or is empty. Please check the data source.
            </AlertDescription>
          </Alert>
       </div>
     );
   }

  // Render the quiz app with questions loaded via the server loader
  return <PPSSHQuizApp questions={questions} />;
}