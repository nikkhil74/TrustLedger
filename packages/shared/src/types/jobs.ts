export enum PipelineStage {
  FETCH_AA_DATA = 'fetch-aa-data',
  FETCH_ONCHAIN_DATA = 'fetch-onchain-data',
  COMPUTE_SCORE = 'compute-score',
  ATTEST_ONCHAIN = 'attest-onchain',
  NOTIFY_USER = 'notify-user',
}

export interface JobPayload {
  userId: string;
  walletAddress: string;
  consentId?: string;
  stage: PipelineStage;
}

export interface JobStatus {
  jobId: string;
  stage: PipelineStage;
  status: 'waiting' | 'active' | 'completed' | 'failed';
  progress: number;
  result?: unknown;
  error?: string;
}
