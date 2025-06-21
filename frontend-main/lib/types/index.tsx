// Enum for Track - matches your smart contract enum
export enum Track {
  WEB2 = 0,
  WEB3 = 1
}

export interface RegisterStudentParams {
  firstname: string;
  lastname: string;
  twitter: string;
  linkedin: string;
  github: string;
  track: Track;
  cohort: number;
  studentAddress: string;
}

export interface RegisterStudentState {
  isLoading: boolean;
  isSuccess: boolean;
  error: string | null;
  transactionHash: string | undefined;
}