import React from 'react';
import { ThumbsUp, InfoIcon } from 'lucide-react';
import { ScoreGauge } from '@/components/Gauge';
import { Card } from '@/components/ui/card';

interface OverviewTabProps {
  data: {
    totalScore: number;
    applyingFor: { jobTitle: string; explanation: string };
    shortlistRecommendation: { decision: string; explanation: string };
    criticalImprovements: string[];
    keyStrengths: string[];
  };
}

export const OverviewTab: React.FC<OverviewTabProps> = ({ data }) => (
  <div className="space-y-6">
    <h1 className="text-3xl font-bold tracking-tight text-center lg:text-left">Overview Analysis</h1>
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      <Card className="p-6 h-80 lg:col-span-1">
        <ScoreGauge score={data.totalScore} label="Overall Score" />
      </Card>
      <div className="lg:col-span-3 space-y-6">
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <InfoIcon className="text-primary w-5 h-5" />
            <h3 className="text-xl font-bold">{data.applyingFor.jobTitle}</h3>
          </div>
          <p className="text-muted-foreground">{data.applyingFor.explanation}</p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <ThumbsUp className="text-primary w-5 h-5" />
            <h3 className="text-xl font-bold">Shortlist Recommendation</h3>
          </div>
          <p className="text-muted-foreground">{data.shortlistRecommendation.explanation}</p>
        </Card>

        <Card className="p-6">
          <h3 className="text-xl font-bold mb-4">Key Strengths</h3>
          <ul className="list-disc list-inside space-y-2">
            {data.keyStrengths.map((strength, index) => (
              <li key={index} className="text-muted-foreground">{strength}</li>
            ))}
          </ul>
        </Card>

        <Card className="p-6">
          <h3 className="text-xl font-bold mb-4">Critical Improvements</h3>
          <ul className="list-disc list-inside space-y-2">
            {data.criticalImprovements.map((improvement, index) => (
              <li key={index} className="text-muted-foreground">{improvement}</li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  </div>
);
