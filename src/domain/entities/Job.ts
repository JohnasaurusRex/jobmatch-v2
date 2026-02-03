import { JobId } from '../value-objects/JobId';

export enum JobStatus {
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  ERROR = 'error'
}

export class Job {
  constructor(
    private readonly _id: JobId,
    private _status: JobStatus,
    private readonly _createdAt: Date,
    private _completedAt?: Date,
    private _errorMessage?: string,
    private _analysisId?: string
  ) {}

  get id(): JobId { return this._id; }
  get status(): JobStatus { return this._status; }
  get createdAt(): Date { return this._createdAt; }
  get completedAt(): Date | undefined { return this._completedAt; }
  get errorMessage(): string | undefined { return this._errorMessage; }
  get analysisId(): string | undefined { return this._analysisId; }

  public markAsCompleted(analysisId: string): void {
    this._status = JobStatus.COMPLETED;
    this._completedAt = new Date();
    this._analysisId = analysisId;
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
