import { NextRequest, NextResponse } from 'next/server';
import { GetJobStatusUseCase } from '../../application/use-cases/GetJobStatusUseCase';

export class JobStatusController {
  constructor(private readonly getJobStatusUseCase: GetJobStatusUseCase) {}

  async getStatus(request: NextRequest, { params }: { params: { jobId: string } }): Promise<NextResponse> {
    try {
      const { jobId } = params;

      if (!jobId) {
        return NextResponse.json(
          { error: 'Job ID is required' },
          { status: 400 }
        );
      }

      const response = await this.getJobStatusUseCase.execute(jobId);

      return NextResponse.json(response.toJSON(), { status: 200 });
    } catch (error: unknown) {
      if (error instanceof Error && error.message === 'Job not found') {
        return NextResponse.json(
          { error: 'Job not found' },
          { status: 404 }
        );
      }

      console.error('Get status error:', error);
      if (error instanceof Error) {
        return NextResponse.json(
          { error: error.message || 'Internal server error' },
          { status: 500 }
        );
      }
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  }
}
