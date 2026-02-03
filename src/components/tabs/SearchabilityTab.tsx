import React from 'react';
import { Search } from 'lucide-react';
import { ScoreGauge } from '@/components/Gauge';
import { Card } from '@/components/ui/card';

interface SearchabilityTabProps {
  data: {
    score: number;
    recommendations: string[];
    contactInfo: { present: boolean; missing: string[] };
    sections: { hasSummary: boolean; hasProperHeadings: boolean; properlyFormattedDates: boolean };
    jobTitleMatch: { score: number; explanation: string };
  };
}

export const SearchabilityTab: React.FC<SearchabilityTabProps> = ({ data }) => (
  <div className="space-y-6">
    <h1 className="text-3xl font-bold tracking-tight text-center lg:text-left">Searchability Analysis</h1>
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      <Card className="p-6 h-80 lg:col-span-1">
        <ScoreGauge score={data.score} label="Searchability Score" />
      </Card>
      <div className="lg:col-span-3 space-y-6">
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Search className="text-primary w-5 h-5" />
            <h3 className="text-xl font-bold">Contact Information Status</h3>
          </div>
          <p className="text-muted-foreground">
            {data.contactInfo.present 
              ? "All required contact information is present"
              : "Some contact information is missing"}
          </p>
          {data.contactInfo.missing.length > 0 && (
            <ul className="list-disc list-inside space-y-1 mt-2">
              {data.contactInfo.missing.map((item, index) => (
                <li key={index} className="text-muted-foreground">{item}</li>
              ))}
            </ul>
          )}
        </Card>

        <Card className="p-6">
          <h3 className="text-xl font-bold mb-4">Resume Structure</h3>
          <ul className="list-disc list-inside space-y-1">
            <li className="text-muted-foreground">
              Professional Summary: {data.sections.hasSummary ? 'Present ✓' : 'Missing ✗'}
            </li>
            <li className="text-muted-foreground">
              Section Headings: {data.sections.hasProperHeadings ? 'Well Formatted ✓' : 'Needs Improvement ✗'}
            </li>
            <li className="text-muted-foreground">
              Date Formatting: {data.sections.properlyFormattedDates ? 'Consistent ✓' : 'Inconsistent ✗'}
            </li>
          </ul>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Search className="text-primary w-5 h-5" />
            <h3 className="text-xl font-bold">Job Title Alignment</h3>
          </div>
          <div className="w-48 mx-auto mb-4">
            <ScoreGauge score={data.jobTitleMatch.score} label="Title Match Score" />
          </div>
          <p className="text-muted-foreground">{data.jobTitleMatch.explanation}</p>
        </Card>

        {data.recommendations.length > 0 && (
          <Card className="p-6">
            <h3 className="text-xl font-bold mb-4">Improvement Recommendations</h3>
            <ul className="list-disc list-inside space-y-1">
              {data.recommendations.map((recommendation, index) => (
                <li key={index} className="text-muted-foreground">{recommendation}</li>
              ))}
            </ul>
          </Card>
        )}
      </div>
    </div>
  </div>
);
