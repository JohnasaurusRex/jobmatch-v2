import { JobId } from '../value-objects/JobId';
import { Analysis } from './Analysis';

export enum JobStatus {
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  ERROR = 'error'
}

/**
 * Job entity representing an analysis job in progress or completed.
 * Now holds the analysis result directly for in-memory retrieval.
 */
export class Job {
  constructor(
    private readonly _id: JobId,
    private _status: JobStatus,
    private readonly _createdAt: Date,
    private _completedAt?: Date,
    private _errorMessage?: string,
    private _analysisId?: string,
    private _analysisResult?: Analysis
  ) {}

  get id(): JobId { return this._id; }
  get status(): JobStatus { return this._status; }
  get createdAt(): Date { return this._createdAt; }
  get completedAt(): Date | undefined { return this._completedAt; }
  get errorMessage(): string | undefined { return this._errorMessage; }
  get analysisId(): string | undefined { return this._analysisId; }
  get analysisResult(): Analysis | undefined { return this._analysisResult; }

  /**
   * Mark job as completed and store the analysis result.
   */
  public markAsCompleted(analysis: Analysis): void {
    this._status = JobStatus.COMPLETED;
    this._completedAt = new Date();
    this._analysisId = analysis.id;
    this._analysisResult = analysis;
  }

  public markAsError(errorMessage: string): void {
    this._status = JobStatus.ERROR;
    this._errorMessage = errorMessage;
  }

  public isCompleted(): boolean {
    return this._status === JobStatus.COMPLETED;
  }

  public hasError(): boolean {
    return this._status === JobStatus.ERROR;
  }
}
