import { NextRequest, NextResponse } from 'next/server';
import { AnalyzeResumeUseCase } from '../../application/use-cases/AnalyzeResumeUseCase';
import { AnalyzeResumeRequest } from '../../application/dto/AnalyzeResumeRequest';
import { ResumeUploadValidator } from '../validators/ResumeUploadValidator';

export class AnalysisController {
  constructor(private readonly analyzeResumeUseCase: AnalyzeResumeUseCase) {}

  async analyze(request: NextRequest): Promise<NextResponse> {
    try {
      const formData = await request.formData();
      const resumeFile = formData.get('resume') as File;
      const jobDescription = formData.get('jobDescription') as string;

      // Validate request
      const validation = ResumeUploadValidator.validate({
        resumeFile,
        jobDescription,
      });

      if (!validation.success) {
        return NextResponse.json(
          { error: validation.error },
          { status: 400 }
        );
      }

      // Convert File to Buffer
      const resumeBuffer = Buffer.from(await resumeFile.arrayBuffer());

      // Create request DTO
      const analyzeRequest = AnalyzeResumeRequest.fromFormData(
        resumeBuffer,
        jobDescription,
        resumeFile.name
      );

      // Execute use case
      const response = await this.analyzeResumeUseCase.execute(analyzeRequest);

      return NextResponse.json(response.toJSON(), { status: 200 });
    } catch (error: unknown) {
      console.error('Analysis error:', error);
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
