import { JobStatusController } from '../../../../presentation/controllers/JobStatusController';
import { createGetJobStatusUseCase } from '../../../../lib/di-container';
import { NextRequest } from 'next/server';


const jobStatusController = new JobStatusController(createGetJobStatusUseCase());

export async function GET(request: NextRequest, { params }: { params: Promise<{ jobId: string }> }) {
  const resolvedParams = await params;
  return jobStatusController.getStatus(request, { params: resolvedParams });
}
