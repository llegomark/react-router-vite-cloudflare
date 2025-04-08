// FILE: app/components/quiz/ResultsAnalysis.tsx
import React from 'react';
import {
  Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle
} from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Progress } from '../../components/ui/progress';
import { Badge } from '../../components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '../../components/ui/alert';
import { Separator } from '../../components/ui/separator';
import DomainRadarChart from './DomainRadarChart';
import type { Question, QuizResults, DomainResult, CareerStageResult, RadarChartDataPoint } from '../../types/quiz'; // Ensure Question is imported
import { cn } from "../../lib/utils";
import { Terminal } from "lucide-react"; // Import icon used in Alert


// --- Helper Functions (as provided in the example) ---

const getDomainDescription = (domainName: string): string => {
  const descriptions: { [key: string]: string } = {
    "Leading Strategically": "Demonstrates capability in setting direction, establishing goals, and ensuring strategic alignment. Leadership in vision development is effective.",
    "Managing School Operations & Resources": "Shows ability in managing systems and processes efficiently and fairly. Resource management supports school operations effectively.",
    "Focusing on Teaching & Learning": "Excels at promoting quality teaching and learning through instructional leadership. Approaches improve teacher competence and learning outcomes.",
    "Developing Self & Others": "Demonstrates capability in nurturing professional development and supporting personnel welfare. Self-reflection practices contribute to ongoing improvement.",
    "Building Connections": "Shows strong engagement with stakeholders and effectively promotes shared responsibility for education. Community relationships foster productive partnerships."
  };
  // Handle potential shortening from radar chart (replace " & " back if needed)
  const normalizedDomainName = domainName.replace(" & ", " and ");
  return descriptions[normalizedDomainName] || "No detailed information available for this domain.";
};

const getStrengths = (domainName: string): string[] => {
  const strengths: { [key: string]: string[] } = {
    "Leading Strategically": ["Vision articulation", "Strategic planning", "Policy implementation", "Data-driven decisions"],
    "Managing School Operations & Resources": ["Financial practices", "Resource allocation", "Staff management", "Operational planning"],
    "Focusing on Teaching & Learning": ["Instructional leadership", "Curriculum implementation", "Assessment practices", "Teacher support"],
    "Developing Self & Others": ["Professional reflection", "Team development", "Performance management", "Staff recognition"],
    "Building Connections": ["Stakeholder engagement", "Community partnerships", "Communication", "Inclusive practices"]
  };
   const normalizedDomainName = domainName.replace(" & ", " and ");
  return strengths[normalizedDomainName] || [];
};

const getImprovements = (domainName: string): string[] => {
  const improvements: { [key: string]: string[] } = {
    "Leading Strategically": ["Research utilization", "M&E systems", "Learner voice integration", "Long-term visioning"],
    "Managing School Operations & Resources": ["Technology integration", "Disaster preparedness", "Resource tracking", "Facilities planning"],
    "Focusing on Teaching & Learning": ["Contextualization", "Career guidance", "Teaching innovations", "Cross-curricular integration"],
    "Developing Self & Others": ["Mentoring systems", "Succession planning", "PLCs", "Distributed leadership"],
    "Building Connections": ["Diversity initiatives", "Expanded partnerships", "Resource mobilization", "Cross-sector collaborations"]
  };
   const normalizedDomainName = domainName.replace(" & ", " and ");
  return improvements[normalizedDomainName] || [];
};

const getDomainStrengthCategory = (percentage: number): { label: string; color: string; textColor: string } => {
    if (percentage >= 90) return { label: "Expert", color: "bg-green-500", textColor: "text-white" };
    if (percentage >= 80) return { label: "Proficient", color: "bg-blue-500", textColor: "text-white" };
    if (percentage >= 70) return { label: "Developing", color: "bg-yellow-500", textColor: "text-black" };
    return { label: "Emerging", color: "bg-red-500", textColor: "text-white" };
};
// --- End Helper Functions ---


interface ResultsAnalysisProps {
  results: QuizResults;
  questions: Question[]; // Added questions prop
  onResetQuiz: () => void;
  selectedDomain: RadarChartDataPoint | null;
  onDomainClick: (domain: RadarChartDataPoint | null) => void; // Allow null to clear selection
}

const ResultsAnalysis: React.FC<ResultsAnalysisProps> = ({
  results,
  questions, // Received questions prop
  onResetQuiz,
  selectedDomain,
  onDomainClick,
}) => {
    const getStrengthsAndWeaknesses = () => {
        const strengths = results.domainResults
        .filter(domain => domain.percentage >= 80) // Using 80% as threshold for strength
        .sort((a, b) => b.percentage - a.percentage)
        .map(domain => ({
            type: 'domain' as const, // Add type literal for clarity
            name: domain.name,
            percentage: domain.percentage
        }));

        const weaknesses = results.domainResults
        .filter(domain => domain.percentage < 70) // Using 70% as threshold for improvement area
        .sort((a, b) => a.percentage - b.percentage)
        .map(domain => ({
            type: 'domain' as const, // Add type literal for clarity
            name: domain.name,
            percentage: domain.percentage
        }));

        return { strengths, weaknesses };
    };

    const { strengths, weaknesses } = getStrengthsAndWeaknesses();

    // Prepare data for charts
    const domainChartData = results.domainResults.map(domain => ({
        name: domain.name,
        score: parseFloat(domain.percentage.toFixed(1)) // Keep as number for chart
    }));

    const careerStageChartData = results.careerStageResults.sort((a,b) => a.stage - b.stage).map(stage => ({
        name: `Stage ${stage.stage}`,
        score: parseFloat(stage.percentage.toFixed(1))
    }));

    const radarChartData: RadarChartDataPoint[] = results.domainResults.map(domain => ({
        subject: domain.name.replace(" and ", " & "), // Abbreviate for better display
        A: parseFloat(domain.percentage.toFixed(1)),
        fullMark: 100
    }));

  return (
    <div className="container mx-auto p-4 max-w-7xl space-y-8">
      <Card className="shadow-lg border-primary/20">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold text-primary">PPSSH Quiz Results</CardTitle>
          <CardDescription className="text-lg text-muted-foreground">
            Overall Performance: {results.correctAnswers} / {results.totalQuestions} ({results.overallPercentage.toFixed(1)}%)
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
          <Progress value={results.overallPercentage} className="h-3 mb-6" />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <Card>
                 <CardHeader>
                    <CardTitle className="text-xl">Strengths</CardTitle>
                 </CardHeader>
                 <CardContent>
                    {strengths.length > 0 ? (
                        <ul className="space-y-2">
                        {strengths.map((strength, index) => (
                            <li key={index} className="flex items-center text-sm">
                            <Badge variant="default" className="bg-green-600 hover:bg-green-700 mr-2 py-0.5 px-2">
                                {strength.percentage.toFixed(1)}%
                            </Badge>
                            <span>{strength.name}</span>
                            </li>
                        ))}
                        </ul>
                    ) : (
                        <p className="text-sm text-muted-foreground">Keep practicing to identify key strengths!</p>
                    )}
                 </CardContent>
              </Card>

              <Card>
                 <CardHeader>
                    <CardTitle className="text-xl">Areas for Improvement</CardTitle>
                 </CardHeader>
                 <CardContent>
                    {weaknesses.length > 0 ? (
                        <ul className="space-y-2">
                        {weaknesses.map((weakness, index) => (
                            <li key={index} className="flex items-center text-sm">
                             <Badge variant="secondary" className="bg-yellow-500 hover:bg-yellow-600 text-yellow-900 mr-2 py-0.5 px-2">
                                {weakness.percentage.toFixed(1)}%
                            </Badge>
                            <span>{weakness.name}</span>
                            </li>
                        ))}
                        </ul>
                    ) : (
                       <p className="text-sm text-muted-foreground">Great job! No significant areas needing immediate improvement based on this quiz.</p>
                    )}
                 </CardContent>
              </Card>
            </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="overview">
        <TabsList className="grid w-full grid-cols-4 mb-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="domains">Domains</TabsTrigger>
          <TabsTrigger value="career-stages">Career Stages</TabsTrigger>
          <TabsTrigger value="detailed">Detailed Analysis</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview">
          <Card>
            <CardHeader>
              <CardTitle>PPSSH Competency Radar</CardTitle>
              <CardDescription>Performance across the five PPSSH domains. Click on a domain point or name for details.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
                <div className="lg:col-span-2 h-[450px] w-full">
                   <DomainRadarChart data={radarChartData} onDomainClick={onDomainClick} />
                </div>

                <div className="flex flex-col justify-center space-y-3">
                  <h3 className="text-lg font-semibold mb-2 text-center lg:text-left">Domain Strengths</h3>
                  {results.domainResults.map((domain, index) => {
                    const strength = getDomainStrengthCategory(domain.percentage);
                    // Match radar chart data point for selection check
                    const correspondingRadarPoint = radarChartData.find(rp => rp.subject === domain.name.replace(" and ", " & "));
                    const isSelected = selectedDomain?.subject === correspondingRadarPoint?.subject;

                    return (
                      <div
                        key={index}
                        className={cn(
                            "flex items-center justify-between p-3 rounded-lg border hover:bg-accent hover:text-accent-foreground cursor-pointer transition-all",
                            isSelected && "ring-2 ring-primary bg-primary/10"
                        )}
                        onClick={() => onDomainClick(correspondingRadarPoint || null)} // Use corresponding point or null
                       >
                        <div>
                          <p className="text-sm font-medium">{domain.name}</p>
                          <div className="flex items-center mt-1">
                            <Badge className={cn(strength.color, strength.textColor, "mr-2 text-xs py-0.5 px-1.5")}>
                              {strength.label}
                            </Badge>
                            <span className="text-xs text-muted-foreground">{domain.percentage.toFixed(1)}%</span>
                          </div>
                        </div>
                         <div className={cn("size-7 rounded-full flex items-center justify-center bg-muted text-muted-foreground", isSelected && "bg-primary text-primary-foreground")}>
                          <span className="text-xs font-semibold">{index + 1}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {selectedDomain && (
                <Card className="mt-6 border-primary/30 shadow-md">
                   <CardHeader className="flex flex-row items-center justify-between pb-2">
                     <CardTitle className="text-xl">{selectedDomain.subject}</CardTitle>
                     <Badge variant="default">{selectedDomain.A.toFixed(1)}%</Badge>
                   </CardHeader>
                   <CardContent>
                      <Separator className="mb-4" />
                      <p className="text-sm text-muted-foreground mb-4">
                      {getDomainDescription(selectedDomain.subject)}
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                              <h4 className="text-base font-medium mb-2">Key Strengths</h4>
                              <ul className="text-sm space-y-1 list-disc list-inside text-muted-foreground">
                              {getStrengths(selectedDomain.subject).map((item, idx) => (
                                  <li key={idx}>{item}</li>
                              ))}
                              </ul>
                          </div>
                          <div>
                              <h4 className="text-base font-medium mb-2">Potential Improvement Areas</h4>
                              <ul className="text-sm space-y-1 list-disc list-inside text-muted-foreground">
                              {getImprovements(selectedDomain.subject).map((item, idx) => (
                                  <li key={idx}>{item}</li>
                              ))}
                              </ul>
                          </div>
                      </div>
                   </CardContent>
                   <CardFooter>
                       <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onDomainClick(null)} // Pass null to clear selection
                            className="mt-2"
                            >
                            Close Details
                        </Button>
                   </CardFooter>
                </Card>
              )}

              <Alert className="mt-6">
                <Terminal className="h-4 w-4" /> {/* Added Icon */}
                <AlertTitle>Interpreting the Radar Chart</AlertTitle>
                <AlertDescription className="text-sm">
                  This chart shows your performance across PPSSH domains. Scores closer to the outer edge (100%) indicate higher competency. Click on domain points or names for detailed analysis, strengths, and improvement areas.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Domains Tab */}
         <TabsContent value="domains">
            <Card>
              <CardHeader>
                <CardTitle>Domain Performance Breakdown</CardTitle>
                <CardDescription>Your scores for each PPSSH domain.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[400px] w-full mb-8">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={domainChartData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis
                        dataKey="name"
                        tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
                        angle={-15}
                        textAnchor="end"
                        height={50}
                        interval={0} // Show all labels
                        tickLine={{ stroke: 'hsl(var(--border))' }}
                        axisLine={{ stroke: 'hsl(var(--border))' }}
                      />
                      <YAxis
                        domain={[0, 100]}
                        tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                        tickLine={{ stroke: 'hsl(var(--border))' }}
                        axisLine={{ stroke: 'hsl(var(--border))' }}
                      />
                      <Tooltip
                        cursor={{ fill: 'hsl(var(--accent))', fillOpacity: 0.3 }}
                        contentStyle={{ borderRadius: 'var(--radius)', border: '1px solid hsl(var(--border))', background: 'hsl(var(--popover))', color: 'hsl(var(--popover-foreground))' }}
                        formatter={(value: number) => [`${value.toFixed(1)}%`, "Score"]}
                      />
                      <Legend wrapperStyle={{ paddingTop: 20 }} />
                      <Bar
                        dataKey="score"
                        fill="hsl(var(--primary))"
                        name="Score (%)"
                        radius={[4, 4, 0, 0]}
                        barSize={40}
                        animationDuration={1500}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div className="space-y-4">
                  {results.domainResults.map((domain, index) => {
                    const strength = getDomainStrengthCategory(domain.percentage);
                    return (
                      <div key={index}>
                        <div className="flex justify-between items-center mb-1">
                          <div className="flex items-center">
                            <span className="font-medium text-sm">{domain.name}</span>
                             <Badge className={cn(strength.color, strength.textColor, "ml-2 text-xs py-0.5 px-1.5")}>
                              {strength.label}
                            </Badge>
                          </div>
                          <span className="text-sm font-medium">{domain.percentage.toFixed(1)}%</span>
                        </div>
                        <Progress value={domain.percentage} className="h-2" />
                        <p className="text-xs text-muted-foreground mt-1">
                          {domain.correct} correct out of {domain.total} questions
                        </p>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>


        {/* Career Stages Tab */}
        <TabsContent value="career-stages">
            <Card>
              <CardHeader>
                <CardTitle>Career Stage Readiness</CardTitle>
                <CardDescription>Your performance on questions related to different PPSSH career stages.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[400px] w-full mb-8">
                  <ResponsiveContainer width="100%" height="100%">
                     <BarChart data={careerStageChartData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis
                        dataKey="name"
                        tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                        tickLine={{ stroke: 'hsl(var(--border))' }}
                        axisLine={{ stroke: 'hsl(var(--border))' }}
                      />
                      <YAxis
                        domain={[0, 100]}
                        tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                        tickLine={{ stroke: 'hsl(var(--border))' }}
                        axisLine={{ stroke: 'hsl(var(--border))' }}
                      />
                      <Tooltip
                         cursor={{ fill: 'hsl(var(--accent))', fillOpacity: 0.3 }}
                        contentStyle={{ borderRadius: 'var(--radius)', border: '1px solid hsl(var(--border))', background: 'hsl(var(--popover))', color: 'hsl(var(--popover-foreground))' }}
                        formatter={(value: number) => [`${value.toFixed(1)}%`, "Score"]}
                      />
                      <Legend wrapperStyle={{ paddingTop: 20 }} />
                      <Bar
                        dataKey="score"
                        fill="hsl(var(--chart-2))" // Use a different color
                        name="Score (%)"
                        radius={[4, 4, 0, 0]}
                         barSize={60}
                        animationDuration={1500}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold mb-2">Career Stage Summary</h3>
                  {results.careerStageResults.map((stage, index) => (
                    <li key={index} className="list-none">
                        <div className="flex justify-between items-center mb-1">
                            <div>
                            <span className="font-medium text-sm">Career Stage {stage.stage}</span>
                            <span className="text-xs text-muted-foreground ml-2">
                                ({stage.stage === 1 ? "Aspiring" :
                                stage.stage === 2 ? "Practicing" :
                                stage.stage === 3 ? "Advanced" : "Expert"})
                            </span>
                            </div>
                            <span className="text-sm font-medium">{stage.percentage.toFixed(1)}%</span>
                        </div>
                        <Progress
                            value={stage.percentage}
                            className="h-2"
                            />
                         <p className="text-xs text-muted-foreground mt-1">
                           {stage.correct} correct out of {stage.total} questions at this level
                        </p>
                    </li>
                  ))}
                </div>

                 <Alert variant="default" className="mt-6">
                  <Terminal className="h-4 w-4" /> {/* Added Icon */}
                  <AlertTitle>Understanding Career Stages</AlertTitle>
                  <AlertDescription className="text-sm">
                    This analysis shows your performance on questions tagged for each PPSSH career stage. A score above 75% may suggest readiness for competencies typical of the next stage. Focus on domains where your scores are lower within relevant stages for targeted professional development.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </TabsContent>

        {/* Detailed Analysis Tab */}
        <TabsContent value="detailed">
            <Card>
              <CardHeader>
                <CardTitle>Detailed Question Analysis</CardTitle>
                <CardDescription>Review your answer for each question and the explanation.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {results.detailedAnswers.map((answer) => ( // Removed index, using ID for lookup
                    <Card key={answer.id} className={cn("shadow-sm", answer.isCorrect ? 'border-green-300 bg-green-50/30' : 'border-red-300 bg-red-50/30')}>
                       <CardHeader className="flex flex-row items-start justify-between pb-3">
                           <h4 className="font-semibold text-base">Question {answer.id}</h4>
                           <Badge variant={answer.isCorrect ? 'default' : 'destructive'} className={cn(answer.isCorrect ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700')}>
                             {answer.isCorrect ? 'Correct' : 'Incorrect'}
                            </Badge>
                       </CardHeader>
                       <CardContent className="space-y-3">
                            <p className="text-sm leading-relaxed">{answer.question}</p>
                            <Separator/>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                                {(() => {
                                    // Find the original question using the ID stored in the answer
                                    const originalQuestion = questions.find(q => q.id === answer.id);
                                    const userAnswerText = originalQuestion?.options.find(o => o.value === answer.userAnswer)?.text;
                                    const correctAnswerText = originalQuestion?.options.find(o => o.value === answer.correctAnswer)?.text;

                                    return (
                                        <>
                                        <p>
                                            <span className="font-medium text-muted-foreground">Your answer:</span> {answer.userAnswer || <span className="italic text-muted-foreground">Not answered</span>}
                                            {userAnswerText && ` (${userAnswerText})`}
                                        </p>
                                        <p>
                                            <span className="font-medium text-muted-foreground">Correct answer:</span> {answer.correctAnswer}
                                            {correctAnswerText && ` (${correctAnswerText})`}
                                        </p>
                                        </>
                                    );
                                })()}
                            </div>
                             {!answer.isCorrect && (
                                <Alert variant="destructive" className="mt-3">
                                    <Terminal className="h-4 w-4" /> {/* Added Icon */}
                                    <AlertTitle>Explanation</AlertTitle>
                                    <AlertDescription className="text-sm">
                                        {answer.explanation}
                                    </AlertDescription>
                                </Alert>
                             )}
                             {answer.isCorrect && (
                                <Alert variant="default" className="mt-3 bg-green-50 border-green-200">
                                    <Terminal className="h-4 w-4" /> {/* Added Icon */}
                                    <AlertTitle className="text-green-800">Explanation</AlertTitle>
                                    <AlertDescription className="text-sm text-green-700">
                                        {answer.explanation}
                                    </AlertDescription>
                                </Alert>
                             )}
                            <Separator/>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs text-muted-foreground">
                                <p><span className="font-medium">Domain:</span> {answer.domain}</p>
                                <p><span className="font-medium">Strand:</span> {answer.strand}</p>
                                <p><span className="font-medium">Stage:</span> {answer.careerStage}</p>
                                <p><span className="font-medium">SOLO:</span> {answer.soloLevel}</p>
                            </div>
                            {/* Display contentTags if they exist in detailedAnswers */}
                            {answer.contentTags && answer.contentTags.length > 0 && (
                                <div className="flex flex-wrap gap-1 pt-2">
                                    {answer.contentTags.map(tag => <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>)}
                                </div>
                            )}
                       </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

      </Tabs>

      <div className="flex justify-center mt-8">
        <Button onClick={onResetQuiz} size="lg">Start New Quiz</Button>
      </div>
    </div>
  );
};

export default ResultsAnalysis;