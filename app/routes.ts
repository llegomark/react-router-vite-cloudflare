// FILE: app/routes.ts
import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  // Index route - Simple start page
  index("routes/home.tsx"), // Renamed from previous home, now just a start page

  // Quiz Layout Route
  route("quiz", "routes/quiz-layout.tsx", [
    // Index for the quiz (could redirect or show first question)
    index("routes/quiz-index.tsx"), // Handles /quiz path

    // Specific Question Route (dynamic segment)
    route("question/:questionNumber", "routes/quiz-question.tsx", [
        // Action route for submitting an answer for a specific question
        route("answer", "routes/quiz-answer.action.tsx")
    ]),

    // Results Route
    route("results", "routes/quiz-results.tsx"),
  ]),

  // Keep other potential top-level routes if needed
  // route("about", "routes/about.tsx"),

] satisfies RouteConfig;