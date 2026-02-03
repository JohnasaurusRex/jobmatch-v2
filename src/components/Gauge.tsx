interface ScoreGaugeProps {
  score: number;
  label: string;
}

export const ScoreGauge: React.FC<ScoreGaugeProps> = ({ score, label }) => (
  <div className="flex flex-col items-center p-4">
    <div className="relative w-48 h-48"> {/* Increased size */}
      <div
        className="absolute inset-0 rounded-full border-8"
        style={{
          borderColor: `hsl(${score * 1.2}, 70%, 50%)`,
          transform: 'rotate(-90deg)',
          transformOrigin: '50% 50%',
        }}
      />
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-2xl font-bold">{score.toFixed(1)}%</span> {/* Increased font size */}
      </div>
    </div>
    <span className="mt-2 text-sm font-medium">{label}</span>
  </div>
);
