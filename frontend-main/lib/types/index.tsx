// Enum for Track - matches your smart contract enum
export enum Track {
  FRONTEND = 0,
  BACKEND = 1,
  BLOCKCHAIN = 2,
  MOBILE = 3,
  DESIGN = 4,
  DATA_SCIENCE = 5,
  DEVOPS = 6,
  FULLSTACK = 7
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