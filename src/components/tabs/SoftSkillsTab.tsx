import React from 'react';
import { AnimatedGauge } from '@/components/AnimatedGauge';
import { GlassCard } from '@/components/ui/GlassCard';

interface SoftSkillsTabProps {
  data: {
    score: number;
    recommendations: string[];
    matchedSkills: string[];
    missingSkills: string[];
    leadershipIndicators: string[];
  };
}

export const SoftSkillsTab: React.FC<SoftSkillsTabProps> = ({ data }) => (
  <div className="space-y-6">
    <h1 className="text-3xl font-bold tracking-tight text-center lg:text-left text-white">Soft Skills Analysis</h1>
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      <GlassCard className="p-6 h-80 lg:col-span-1 flex items-center justify-center">
        <AnimatedGauge score={data.score} label="Soft Skills Score" />
      </GlassCard>
      <div className="lg:col-span-3 space-y-6">
        <GlassCard className="p-6">
          <h3 className="text-xl font-bold mb-4">Matched Skills</h3>
          <ul className="list-disc list-inside space-y-2">
            {data.matchedSkills.map((skill, index) => (
              <li key={index} className="text-slate-400">{skill}</li>
            ))}
          </ul>
        </GlassCard>

        <GlassCard className="p-6">
          <h3 className="text-xl font-bold mb-4">Missing Skills</h3>
          <ul className="list-disc list-inside space-y-2">
            {data.missingSkills.map((skill, index) => (
              <li key={index} className="text-slate-400">{skill}</li>
            ))}
          </ul>
        </GlassCard>

        <GlassCard className="p-6">
          <h3 className="text-xl font-bold mb-4">Leadership Indicators</h3>
          <ul className="list-disc list-inside space-y-2">
            {data.leadershipIndicators.map((indicator, index) => (
              <li key={index} className="text-slate-400">{indicator}</li>
            ))}
          </ul>
        </GlassCard>

        <GlassCard className="p-6">
          <h3 className="text-xl font-bold mb-4">Recommendations</h3>
          <ul className="list-disc list-inside space-y-2">
            {data.recommendations.map((rec, index) => (
              <li key={index} className="text-slate-400">{rec}</li>
            ))}
          </ul>
        </GlassCard>
      </div>
    </div>
  </div>
);
