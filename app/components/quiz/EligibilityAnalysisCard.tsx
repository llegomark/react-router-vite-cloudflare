// FILE: app/components/quiz/EligibilityAnalysisCard.tsx
import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../../components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '../../components/ui/alert';
import { Separator } from '../../components/ui/separator';
import { cn } from "../../lib/utils";
import { CheckCircle, AlertTriangle, XCircle, Info } from "lucide-react"; // Icons

interface EligibilityAnalysisCardProps {
  score: number; // The estimated ability score (percentage)
  category: 'A' | 'B' | 'C';
}

const EligibilityAnalysisCard: React.FC<EligibilityAnalysisCardProps> = ({ score, category }) => {
  let title: string;
  let description: string;
  let recommendations: string[];
  let cardBorderColor: string;
  let titleColor: string;
  let IconComponent: React.ElementType;

  switch (category) {
    case 'A':
      title = "Category A: Eligible";
      description = "You are ELIGIBLE to proceed to the next stage in the selection process for Principal 1 positions.";
      recommendations = [
        "Prepare for and proceed to the next stage of the selection process."
      ];
      cardBorderColor = "border-green-500";
      titleColor = "text-green-700";
      IconComponent = CheckCircle;
      break;
    case 'B':
      title = "Category B: Conditional Eligibility";
      description = "You MAY TAKE the next NQESH examination, but this is contingent upon participation in coaching and mentoring. You may also be prioritized for OIC/TIC roles if needed.";
      recommendations = [
        "Actively participate in coaching and mentoring sessions with an experienced Principal.",
        "Focus on strengthening areas identified in the domain/strand analysis.",
        "Prepare for the next NQESH examination following mentorship.",
        "Be prepared for potential designation as OIC/TIC if applicable."
      ];
      cardBorderColor = "border-yellow-500";
      titleColor = "text-yellow-700";
      IconComponent = AlertTriangle;
      break;
    case 'C':
    default:
      title = "Category C: Needs Development";
      description = "You MUST UNDERTAKE an intensive School Heads Development Program (SHDP) before retaking the NQESH.";
      recommendations = [
        "Enroll and diligently complete the required SHDP through NEAP or an authorized provider.",
        "Focus on building foundational knowledge and skills across all PPSSH domains.",
        "Reflect on feedback received during the SHDP.",
        "Retake the NQESH only after successful completion of the SHDP."
      ];
      cardBorderColor = "border-red-500";
      titleColor = "text-red-700";
      IconComponent = XCircle;
      break;
  }

  return (
    <Card className={cn("shadow-md", cardBorderColor)}>
      <CardHeader>
        <div className="flex items-center space-x-2">
           <IconComponent className={cn("h-6 w-6", titleColor)} />
           <CardTitle className={cn("text-2xl", titleColor)}>{title}</CardTitle>
        </div>
        <CardDescription className="pt-1">{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
            <p className="text-sm text-muted-foreground">Estimated Ability Score (Weighted by Difficulty):</p>
            <p className="text-xl font-semibold">{score.toFixed(1)}%</p>
        </div>
        <Separator className="my-4" />
        <h4 className="font-semibold mb-2 text-base">Recommendations:</h4>
        <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
          {recommendations.map((rec, i) => <li key={i}>{rec}</li>)}
        </ul>
        <Alert variant="default" className="mt-6 bg-blue-50 border-blue-200 text-blue-800">
           <Info className="h-4 w-4 !text-blue-800" />
           <AlertTitle>Important Disclaimer</AlertTitle>
           <AlertDescription className="text-sm !text-blue-700">
             This eligibility category is based on an **estimated ability score** derived from your performance on questions weighted by difficulty. It serves as an indicator and is **not** a formal NQESH result or a substitute for official DepEd assessment processes which may use a calibrated Rasch model.
           </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
};

export default EligibilityAnalysisCard;