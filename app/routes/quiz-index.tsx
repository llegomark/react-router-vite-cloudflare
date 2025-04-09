// FILE: app/routes/quiz-index.tsx
import { redirect } from 'react-router';

// Redirects from /quiz to the first question
export function loader() {
    return redirect('/quiz/question/1');
}

// This component will likely not render due to the redirect
export default function QuizIndexRedirect() {
    return null;
}