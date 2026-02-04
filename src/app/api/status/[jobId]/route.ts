import { NextRequest, NextResponse } from 'next/server';
import { createGetJobStatusUseCase } from '../../../../lib/di-container';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ jobId: string }> } // Next.js 15 params are async
) {
  try {
    const { jobId } = await params;
    
    if (!jobId) {
      return NextResponse.json({ error: 'Job ID is required' }, { status: 400 });
    }

    const useCase = createGetJobStatusUseCase();
    const result = await useCase.execute(jobId);

    return NextResponse.json(result.toJSON(), { status: 200 });
  } catch (error: unknown) {
    if (error instanceof Error && error.message === 'Job not found') {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }
    
    console.error('Status check error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
