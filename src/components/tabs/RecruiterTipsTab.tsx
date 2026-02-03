import React from 'react';
import { AnimatedGauge } from '@/components/AnimatedGauge';
import { GlassCard } from '@/components/ui/GlassCard';

interface RecruiterTipsTabProps {
  data: {
    score: number;
    recommendations?: string[];
    jobLevelMatch: { assessment: string; recommendation: string };
    measurableResults: { present: string[]; missing: string[] };
    resumeTone: { assessment: string; improvements: string[] };
    webPresence: { mentioned: string[]; recommended: string[] };
  };
}

export const RecruiterTipsTab: React.FC<RecruiterTipsTabProps> = ({ data }) => {
  if (!data) {
    return <div>No recruiter tips data available</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight text-center lg:text-left text-white">Recruiter Tips</h1>
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <GlassCard className="p-6 h-80 lg:col-span-1 flex items-center justify-center">
          <AnimatedGauge score={data.score} label="Recruiter Tips" />
        </GlassCard>
        <div className="lg:col-span-3 space-y-6">
          <GlassCard className="p-6">
            <h4 className="text-xl font-bold mb-4">Job Level Match</h4>
            <p className="text-slate-400"><strong>Assessment:</strong> {data.jobLevelMatch.assessment}</p>
            <p className="text-slate-400"><strong>Recommendation:</strong> {data.jobLevelMatch.recommendation}</p>
          </GlassCard>

          <GlassCard className="p-6">
            <h4 className="text-xl font-bold mb-4">Measurable Results</h4>
            <h5 className="text-lg font-semibold mt-4 mb-2">Present:</h5>
            <ul className="list-disc list-inside space-y-2">
              {Array.isArray(data.measurableResults) ? (
                data.measurableResults.map((result: string, index) => (
                  <li key={index} className="text-slate-400">{result}</li>
                ))
              ) : data.measurableResults?.present?.map((result, index) => (
                <li key={index} className="text-slate-400">{result}</li>
              ))}
            </ul>
            <h5 className="text-lg font-semibold mt-4 mb-2">Missing:</h5>
            <ul className="list-disc list-inside space-y-2">
              {Array.isArray(data.measurableResults?.missing) && 
                data.measurableResults.missing.map((result, index) => (
                  <li key={index} className="text-slate-400">{result}</li>
                ))}
            </ul>
          </GlassCard>

          <GlassCard className="p-6">
            <h4 className="text-xl font-bold mb-4">Resume Tone</h4>
            <p className="text-slate-400"><strong>Assessment:</strong> {data.resumeTone.assessment}</p>
            <h5 className="text-lg font-semibold mt-4 mb-2">Improvements:</h5>
            <ul className="list-disc list-inside space-y-2">
              {Array.isArray(data.resumeTone.improvements) &&
                data.resumeTone.improvements.map((improvement, index) => (
                  <li key={index} className="text-slate-400">{improvement}</li>
                ))}
            </ul>
          </GlassCard>

          <GlassCard className="p-6">
            <h4 className="text-xl font-bold mb-4">Web Presence</h4>
            <h5 className="text-lg font-semibold mt-4 mb-2">Mentioned:</h5>
            <ul className="list-disc list-inside space-y-2">
              {Array.isArray(data.webPresence.mentioned) &&
                data.webPresence.mentioned.map((mention, index) => (
                  <li key={index} className="text-slate-400">{mention}</li>
                ))}
            </ul>
            <h5 className="text-lg font-semibold mt-4 mb-2">Recommended:</h5>
            <ul className="list-disc list-inside space-y-2">
              {Array.isArray(data.webPresence.recommended) &&
                data.webPresence.recommended.map((recommend, index) => (
                  <li key={index} className="text-slate-400">{recommend}</li>
                ))}
            </ul>
          </GlassCard>
        </div>
      </div>
    </div>
    );
};
