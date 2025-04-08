// FILE: app/routes/home.tsx
import React from 'react';
import { Link } from 'react-router';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';

export function meta() {
  return [
    { title: "PPSSH NQESH Reviewer - Start" },
    { name: "description", content: "Start the PPSSH NQESH Reviewer Quiz." },
  ];
}

export default function StartPage() {
  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-primary/10 via-background to-background">
      <Card className="w-full max-w-md text-center shadow-xl border-primary/20">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-primary">PPSSH NQESH Reviewer</CardTitle>
          <CardDescription className="text-lg text-muted-foreground pt-2">
            Test your knowledge on the Philippine Professional Standards for School Heads.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="mb-6 text-muted-foreground">
            Ready to begin? Click the button below to start the interactive quiz.
          </p>
          {/* Link to the first question */}
          <Link to="/quiz/question/1">
            <Button size="lg" className="w-full">Start Quiz</Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}