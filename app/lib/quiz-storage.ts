// FILE: app/lib/quiz-storage.ts

const STORAGE_KEY = 'ppsshQuizAnswers';

interface Answers {
  [key: number]: string; // questionId: answerValue
}

// Function to get all answers from localStorage
export function getAnswers(): Answers {
  if (typeof window === 'undefined') {
    return {}; // Return empty object on server
  }
  try {
    const storedAnswers = window.localStorage.getItem(STORAGE_KEY);
    return storedAnswers ? JSON.parse(storedAnswers) : {};
  } catch (error) {
    console.error("Error reading answers from localStorage:", error);
    return {};
  }
}

// Function to get a single answer
export function getAnswer(questionId: number): string | undefined {
    const answers = getAnswers();
    return answers[questionId];
}


// Function to save a single answer to localStorage
export function saveAnswer(questionId: number, answer: string): void {
   if (typeof window === 'undefined') {
     return; // Do nothing on server
   }
  try {
    const currentAnswers = getAnswers();
    const updatedAnswers = {
      ...currentAnswers,
      [questionId]: answer,
    };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedAnswers));
  } catch (error) {
    console.error("Error saving answer to localStorage:", error);
  }
}

// Function to clear all answers from localStorage
export function clearAnswers(): void {
   if (typeof window === 'undefined') {
     return; // Do nothing on server
   }
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error("Error clearing answers from localStorage:", error);
  }
}