import { IUseCase } from '../interfaces/IUseCase';
import { AnalysisResponse } from '../dto/AnalysisResponse';
import { IAnalysisRepository } from '../../domain/repositories/IAnalysisRepository';

export class GetAnalysisResultUseCase implements IUseCase<string, AnalysisResponse> {
  constructor(private readonly analysisRepository: IAnalysisRepository) {}

  async execute(analysisId: string): Promise<AnalysisResponse> {
    const analysis = await this.analysisRepository.findById(analysisId);

    if (!analysis) {
      throw new Error('Analysis not found');
    }

    return AnalysisResponse.fromDomain(analysis);
  }
}
