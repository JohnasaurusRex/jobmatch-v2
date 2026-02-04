import { AnalyzeResumeUseCase } from './AnalyzeResumeUseCase';
import { IAnalysisService } from '../../domain/services/IAnalysisService';
import { IJobRepository } from '../../domain/repositories/IJobRepository';
import { IPdfProcessor } from '../../domain/repositories/IPdfProcessor';
import { AnalyzeResumeRequest } from '../dto/AnalyzeResumeRequest';
import { JobStatusResponse } from '../dto/JobStatusResponse';
import { JobStatus } from '../../domain/entities/Job';
import { Analysis } from '../../domain/entities/Analysis';

describe('AnalyzeResumeUseCase', () => {
    let useCase: AnalyzeResumeUseCase;
    let mockAnalysisService: jest.Mocked<IAnalysisService>;
    let mockJobRepository: jest.Mocked<IJobRepository>;
    let mockPdfProcessor: jest.Mocked<IPdfProcessor>;

    beforeEach(() => {
        mockAnalysisService = {
            analyzeResume: jest.fn()
        };
        mockJobRepository = {
            save: jest.fn(),
            findById: jest.fn(),
            update: jest.fn(),
            delete: jest.fn()
        };
        mockPdfProcessor = {
            extractText: jest.fn(),
            validatePdf: jest.fn()
        };

        useCase = new AnalyzeResumeUseCase(
            mockAnalysisService,
            mockJobRepository,
            mockPdfProcessor
        );
    });

    it('should create a job with PROCESSING status and return jobId immediately', async () => {
        const request = new AnalyzeResumeRequest(
            Buffer.from('test'),
            'job description',
            'resume.pdf'
        );

        mockJobRepository.save.mockResolvedValue();
        // Mock background process to resolve or reject to avoid unhandled promises in test env?
        // Actually, since it's fire-and-forget, we might need to await a tick or mock return.
        // For this test, we just check the immediate return.
        
        // Mock extractText so the background process doesn't verify-fail immediately if it runs fast
        mockPdfProcessor.extractText.mockResolvedValue('Extracted Text');
        mockAnalysisService.analyzeResume.mockResolvedValue({} as Analysis); // Mock minimal analysis

        const response = await useCase.execute(request);

        expect(response).toBeInstanceOf(JobStatusResponse);
        expect(response.status).toBe(JobStatus.PROCESSING);
        expect(response.jobId).toBeDefined();
        
        // Verify job was saved
        expect(mockJobRepository.save).toHaveBeenCalledTimes(1); 
        // Note: The second save (completion) happens asynchronously.
    });

    it('should throw error if request is invalid', async () => {
        const request = new AnalyzeResumeRequest(
            Buffer.from(''), 
            '', 
            ''
        );
        // Assuming validation happens inside or before. 
        // The current implementation checks for resumeFile and jobDescription
        // But request DTO might not be fully validated yet.
        await expect(useCase.execute({ ...request, resumeFile: null as unknown as Buffer })).rejects.toThrow();
    });
});
