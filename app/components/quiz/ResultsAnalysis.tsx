// FILE: app/components/quiz/ResultsAnalysis.tsx
import React, { useState } from 'react';
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
import type { Question, QuizResults, DomainResult, CareerStageResult, RadarChartDataPoint, StrandResult, SoloLevelResult, DifficultyResult } from '../../types/quiz';
import { cn } from "../../lib/utils";
import { Terminal, ChevronLeft } from "lucide-react";

// --- Helper Functions (keep existing ones) ---
const getDomainDescription = (domainName: string): string => {
  const descriptions: { [key: string]: string } = {
    "Leading Strategically": "Demonstrates capability in setting direction, establishing goals, and ensuring strategic alignment. Leadership in vision development is effective.",
    "Managing School Operations & Resources": "Shows ability in managing systems and processes efficiently and fairly. Resource management supports school operations effectively.",
    "Focusing on Teaching & Learning": "Excels at promoting quality teaching and learning through instructional leadership. Approaches improve teacher competence and learning outcomes.",
    "Developing Self & Others": "Demonstrates capability in nurturing professional development and supporting personnel welfare. Self-reflection practices contribute to ongoing improvement.",
    "Building Connections": "Shows strong engagement with stakeholders and effectively promotes shared responsibility for education. Community relationships foster productive partnerships."
  };
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
  questions: Question[];
  onResetQuiz: () => void;
  selectedDomain: RadarChartDataPoint | null; // For Radar Chart interaction
  onDomainClick: (domain: RadarChartDataPoint | null) => void;
}

// Function to truncate text
const truncateText = (text: string, maxLength: number = 25): string => {
    if (text.length <= maxLength) {
      return text;
    }
    return text.substring(0, maxLength) + '...';
};

const ResultsAnalysis: React.FC<ResultsAnalysisProps> = ({
  results,
  questions,
  onResetQuiz,
  selectedDomain, // This is for the radar chart interaction state, managed by the parent
  onDomainClick,  // This is the handler to update the radar chart state in the parent
}) => {
    // State specifically for showing strand breakdown within the Domains tab
    const [selectedDomainForStrands, setSelectedDomainForStrands] = useState<DomainResult | null>(null);

    const getStrengthsAndWeaknesses = () => {
        const strengths = results.domainResults
        .filter(domain => domain.percentage >= 80)
        .sort((a, b) => b.percentage - a.percentage)
        .map(domain => ({
            type: 'domain' as const,
            name: domain.name,
            percentage: domain.percentage
        }));

        const weaknesses = results.domainResults
        .filter(domain => domain.percentage < 70)
        .sort((a, b) => a.percentage - b.percentage)
        .map(domain => ({
            type: 'domain' as const,
            name: domain.name,
            percentage: domain.percentage
        }));
        return { strengths, weaknesses };
    };

    const { strengths, weaknesses } = getStrengthsAndWeaknesses();

    // --- Prepare data for charts ---
    const domainChartData = results.domainResults.map(domain => ({
        id: domain.id, // Include ID for filtering strands
        name: domain.name,
        score: parseFloat(domain.percentage.toFixed(1))
    }));

    const careerStageChartData = results.careerStageResults.sort((a,b) => a.stage - b.stage).map(stage => ({
        name: `Stage ${stage.stage}`,
        score: parseFloat(stage.percentage.toFixed(1))
    }));

    const radarChartData: RadarChartDataPoint[] = results.domainResults.map(domain => ({
        subject: domain.name.replace(" and ", " & "),
        A: parseFloat(domain.percentage.toFixed(1)),
        fullMark: 100
    }));

    // Data for SOLO Level Chart
    const soloLevelChartData = results.soloLevelResults.map(level => ({
        name: level.level,
        score: parseFloat(level.percentage.toFixed(1))
    }));

    // Data for Difficulty Chart
    const difficultyChartData = results.difficultyResults.map(diff => ({
        name: diff.category,
        score: parseFloat(diff.percentage.toFixed(1))
    }));

    // Filtered strands for the selected domain
    const filteredStrandResults = selectedDomainForStrands
        ? results.strandResults.filter(strand => strand.domainId === selectedDomainForStrands.id)
        : [];

    const strandChartData = filteredStrandResults.map(strand => ({
        name: strand.name,
        score: parseFloat(strand.percentage.toFixed(1))
    }));
    // --- End Chart Data Prep ---


  return (
    <div className="container mx-auto p-4 max-w-7xl space-y-8">
      {/* --- Overall Performance Card --- */}
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

      {/* --- Tabs --- */}
      <Tabs defaultValue="overview">
        {/* Updated Tabs List */}
        <TabsList className="grid w-full grid-cols-6 mb-6"> {/* Changed grid-cols-4 to grid-cols-6 */}
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="domains">Domains & Strands</TabsTrigger> {/* Updated Label */}
          <TabsTrigger value="career-stages">Career Stages</TabsTrigger>
          <TabsTrigger value="solo">SOLO Levels</TabsTrigger> {/* New Tab */}
          <TabsTrigger value="difficulty">Difficulty</TabsTrigger> {/* New Tab */}
          <TabsTrigger value="detailed">Detailed Analysis</TabsTrigger>
        </TabsList>

        {/* --- Overview Tab --- */}
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
                {/* Domain List for Radar Interaction */}
                <div className="flex flex-col justify-center space-y-3">
                    <h3 className="text-lg font-semibold mb-2 text-center lg:text-left">Domain Strengths</h3>
                     {results.domainResults.map((domain, index) => {
                       const strength = getDomainStrengthCategory(domain.percentage);
                       const correspondingRadarPoint = radarChartData.find(rp => rp.subject === domain.name.replace(" and ", " & "));
                       const isSelected = selectedDomain?.subject === correspondingRadarPoint?.subject;

                       return (
                         <div
                           key={index}
                           className={cn(
                               "flex items-center justify-between p-3 rounded-lg border hover:bg-accent hover:text-accent-foreground cursor-pointer transition-all",
                               isSelected && "ring-2 ring-primary bg-primary/10"
                           )}
                           onClick={() => onDomainClick(correspondingRadarPoint || null)}
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
              {/* Selected Domain Details Card (driven by parent state 'selectedDomain') */}
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
                             onClick={() => onDomainClick(null)} // Clear selection via parent handler
                             className="mt-2"
                             >
                             Close Details
                         </Button>
                    </CardFooter>
                </Card>
              )}
              {/* Radar Chart Alert */}
              <Alert className="mt-6">
                 <Terminal className="h-4 w-4" />
                 <AlertTitle>Interpreting the Radar Chart</AlertTitle>
                 <AlertDescription className="text-sm">
                   This chart shows your performance across PPSSH domains. Scores closer to the outer edge (100%) indicate higher competency. Click on domain points or names for detailed analysis, strengths, and improvement areas.
                 </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>

        {/* --- Domains & Strands Tab (Modified) --- */}
         <TabsContent value="domains">
            <Card>
              <CardHeader>
                {/* Conditionally change title based on view */}
                <CardTitle>
                    {selectedDomainForStrands
                        ? `Strand Breakdown for: ${selectedDomainForStrands.name}`
                        : "Domain Performance Breakdown"}
                </CardTitle>
                <CardDescription>
                    {selectedDomainForStrands
                        ? `Performance within the selected domain's strands.`
                        : `Your scores for each PPSSH domain. Click a bar to see strand details.`}
                </CardDescription>
                 {/* Add a back button if showing strands */}
                 {selectedDomainForStrands && (
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedDomainForStrands(null)}
                        className="mt-2 w-fit"
                    >
                        <ChevronLeft className="mr-2 h-4 w-4" /> Back to Domains
                    </Button>
                 )}
              </CardHeader>
              <CardContent>
                {/* Conditionally render Domain or Strand chart */}
                {!selectedDomainForStrands ? (
                    // Domain Chart
                    <div className="h-[400px] w-full mb-8">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={domainChartData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                          <XAxis
                            dataKey="name"
                            tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
                            angle={-15} textAnchor="end" height={50} interval={0}
                            tickLine={{ stroke: 'hsl(var(--border))' }} axisLine={{ stroke: 'hsl(var(--border))' }}
                          />
                          <YAxis
                            domain={[0, 100]}
                            tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                            tickLine={{ stroke: 'hsl(var(--border))' }} axisLine={{ stroke: 'hsl(var(--border))' }}
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
                            name="Domain Score (%)"
                            radius={[4, 4, 0, 0]} barSize={40} animationDuration={1500}
                            // Add onClick handler to the Bar - Find domain by name match
                            onClick={(data) => {
                                const domain = results.domainResults.find(d => d.name === data.name);
                                if (domain) {
                                    setSelectedDomainForStrands(domain);
                                }
                            }}
                            className="cursor-pointer"
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                ) : (
                    // Strand Chart
                    <div className="h-[400px] w-full mb-8">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={strandChartData} layout="vertical" margin={{ top: 5, right: 30, left: 120, bottom: 5 }}> {/* Increased left margin */}
                                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                                <XAxis
                                    type="number" domain={[0, 100]}
                                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                                    tickLine={{ stroke: 'hsl(var(--border))' }} axisLine={{ stroke: 'hsl(var(--border))' }}
                                />
                                <YAxis
                                    dataKey="name" type="category" width={180} // Increased width for longer names
                                    tickFormatter={(value) => truncateText(value, 30)} // Truncate long names
                                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
                                    tickLine={{ stroke: 'hsl(var(--border))' }} axisLine={{ stroke: 'hsl(var(--border))' }}
                                />
                                <Tooltip
                                    cursor={{ fill: 'hsl(var(--accent))', fillOpacity: 0.3 }}
                                    contentStyle={{ borderRadius: 'var(--radius)', border: '1px solid hsl(var(--border))', background: 'hsl(var(--popover))', color: 'hsl(var(--popover-foreground))' }}
                                    formatter={(value: number) => [`${value.toFixed(1)}%`, "Score"]}
                                    labelFormatter={(label) => truncateText(label, 50)} // Truncate label in tooltip too
                                />
                                <Legend wrapperStyle={{ paddingTop: 20 }} />
                                <Bar
                                    dataKey="score" fill="hsl(var(--chart-3))" // Different color for strands
                                    name="Strand Score (%)"
                                    radius={[0, 4, 4, 0]} barSize={20} animationDuration={1500}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                )}

                {/* Domain summary list (only show when viewing domains) */}
                {!selectedDomainForStrands && (
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
                 )}
              </CardContent>
            </Card>
          </TabsContent>

        {/* --- Career Stages Tab --- */}
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
                         fill="hsl(var(--chart-2))"
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
                   <Terminal className="h-4 w-4" />
                   <AlertTitle>Understanding Career Stages</AlertTitle>
                   <AlertDescription className="text-sm">
                     This analysis shows your performance on questions tagged for each PPSSH career stage. A score above 75% may suggest readiness for competencies typical of the next stage. Focus on domains where your scores are lower within relevant stages for targeted professional development.
                   </AlertDescription>
                 </Alert>
              </CardContent>
            </Card>
        </TabsContent>

        {/* --- NEW: SOLO Levels Tab --- */}
        <TabsContent value="solo">
            <Card>
              <CardHeader>
                <CardTitle>SOLO Taxonomy Level Performance</CardTitle>
                <CardDescription>Your performance distribution across SOLO levels.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[400px] w-full mb-8">
                  <ResponsiveContainer width="100%" height="100%">
                     <BarChart data={soloLevelChartData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis
                        dataKey="name"
                        tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                        tickLine={{ stroke: 'hsl(var(--border))' }} axisLine={{ stroke: 'hsl(var(--border))' }}
                      />
                      <YAxis
                        domain={[0, 100]}
                        tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                        tickLine={{ stroke: 'hsl(var(--border))' }} axisLine={{ stroke: 'hsl(var(--border))' }}
                      />
                      <Tooltip
                        cursor={{ fill: 'hsl(var(--accent))', fillOpacity: 0.3 }}
                        contentStyle={{ borderRadius: 'var(--radius)', border: '1px solid hsl(var(--border))', background: 'hsl(var(--popover))', color: 'hsl(var(--popover-foreground))' }}
                        formatter={(value: number) => [`${value.toFixed(1)}%`, "Score"]}
                      />
                      <Legend wrapperStyle={{ paddingTop: 20 }} />
                      <Bar
                        dataKey="score" fill="hsl(var(--chart-4))" // New color
                        name="Score (%)" radius={[4, 4, 0, 0]} barSize={60} animationDuration={1500}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <Alert variant="default" className="mt-6">
                  <Terminal className="h-4 w-4" />
                  <AlertTitle>Understanding SOLO Levels</AlertTitle>
                  <AlertDescription className="text-sm">
                    This chart shows your performance on questions based on the Structure of Observed Learning Outcomes (SOLO) taxonomy. Higher scores in Relational and Extended Abstract levels indicate a deeper understanding and ability to connect concepts.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
        </TabsContent>

        {/* --- NEW: Difficulty Tab --- */}
        <TabsContent value="difficulty">
            <Card>
              <CardHeader>
                <CardTitle>Performance by Question Difficulty</CardTitle>
                <CardDescription>How you performed on questions categorized by difficulty.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[400px] w-full mb-8">
                  <ResponsiveContainer width="100%" height="100%">
                     <BarChart data={difficultyChartData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis
                        dataKey="name"
                        tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                        tickLine={{ stroke: 'hsl(var(--border))' }} axisLine={{ stroke: 'hsl(var(--border))' }}
                      />
                      <YAxis
                        domain={[0, 100]}
                        tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                        tickLine={{ stroke: 'hsl(var(--border))' }} axisLine={{ stroke: 'hsl(var(--border))' }}
                      />
                      <Tooltip
                        cursor={{ fill: 'hsl(var(--accent))', fillOpacity: 0.3 }}
                        contentStyle={{ borderRadius: 'var(--radius)', border: '1px solid hsl(var(--border))', background: 'hsl(var(--popover))', color: 'hsl(var(--popover-foreground))' }}
                        formatter={(value: number) => [`${value.toFixed(1)}%`, "Score"]}
                      />
                      <Legend wrapperStyle={{ paddingTop: 20 }} />
                      <Bar
                        dataKey="score" fill="hsl(var(--chart-5))" // New color
                        name="Score (%)" radius={[4, 4, 0, 0]} barSize={60} animationDuration={1500}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                 <Alert variant="default" className="mt-6">
                  <Terminal className="h-4 w-4" />
                  <AlertTitle>Understanding Difficulty Levels</AlertTitle>
                  <AlertDescription className="text-sm">
                    This chart shows if your performance varies based on the estimated difficulty of the questions. Consistent performance across levels is ideal, while lower scores on harder questions might indicate areas needing deeper study.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
        </TabsContent>

        {/* --- Detailed Analysis Tab --- */}
        <TabsContent value="detailed">
             <Card>
              <CardHeader>
                <CardTitle>Detailed Question Analysis</CardTitle>
                <CardDescription>Review your answer for each question and the explanation.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {results.detailedAnswers.map((answer) => (
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
                                    <Terminal className="h-4 w-4" />
                                    <AlertTitle>Explanation</AlertTitle>
                                    <AlertDescription className="text-sm">
                                        {answer.explanation}
                                    </AlertDescription>
                                </Alert>
                             )}
                             {answer.isCorrect && (
                                <Alert variant="default" className="mt-3 bg-green-50 border-green-200">
                                    <Terminal className="h-4 w-4" />
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

      {/* --- Reset Button --- */}
      <div className="flex justify-center mt-8">
        <Button onClick={onResetQuiz} size="lg">Start New Quiz</Button>
      </div>
    </div>
  );
};

export default ResultsAnalysis;