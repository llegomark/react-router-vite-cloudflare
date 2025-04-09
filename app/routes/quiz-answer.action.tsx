// FILE: app/routes/quiz-answer.action.tsx
import { data } from 'react-router';
import type { ActionFunctionArgs } from 'react-router';
import { saveAnswer } from '../lib/quiz-storage'; // Helper for localStorage

// This is a resource route, only exports an action
export async function action({ request }: ActionFunctionArgs) {
    try {
        const formData = await request.formData();
        const questionId = Number(formData.get('questionId'));
        const answer = formData.get('answer') as string; // Assume answer is string

        if (!questionId || answer === null || answer === undefined) {
             return data({ ok: false, error: 'Missing questionId or answer' }, { status: 400 });
        }

        saveAnswer(questionId, answer); // Save to localStorage

        // Return simple success response. Fetcher receives this in fetcher.data
        return data({ ok: true }, { status: 200 });

    } catch (error) {
         console.error("Failed to save answer:", error);
         return data({ ok: false, error: 'Failed to save answer' }, { status: 500 });
    }
}