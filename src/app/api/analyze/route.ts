import { AnalysisController } from '../../../presentation/controllers/AnalysisController';
import { createAnalyzeResumeUseCase } from '../../../lib/di-container';
import { NextRequest } from 'next/server';

const analysisController = new AnalysisController(createAnalyzeResumeUseCase());

export async function POST(request: NextRequest) {
  return analysisController.analyze(request);
}
