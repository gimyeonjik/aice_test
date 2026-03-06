export interface ExamDataset {
  filename: string;
  rowCount: string;
  target: string | null;
  targetDescription: string;
  taskType: "clustering" | "regression" | "classification";
  features: string[];
  excludeColumns: string[];
}

export interface ExamPart {
  partNumber: number;
  title: string;
  questionRange: [number, number];
}

export interface MCQQuestion {
  type: "mcq";
  id: string;
  questionNumber: number;
  partNumber: number;
  prompt: string;
  hint?: string;
  options: { label: string; text: string }[];
  answer: number; // 1-based index
}

export interface FillInQuestion {
  type: "fill-in";
  id: string;
  questionNumber: number;
  partNumber: number;
  prompt: string;
  hint?: string;
  guide?: string;
  inputValues?: string;
  answerType: "integer" | "float" | "text";
  answer: string;
  tolerance?: number;
  unit?: string;
  subFields?: {
    label: string;
    answerType: "integer" | "float";
    answer: string;
    unit?: string;
  }[];
}

export interface ActionQuestion {
  type: "action";
  id: string;
  questionNumber: number;
  partNumber: number;
  prompt: string;
  instruction: string;
}

export type Question = MCQQuestion | FillInQuestion | ActionQuestion;

export interface Exam {
  id: string;
  examNumber: number;
  title: string;
  scenario: string;
  dataset: ExamDataset;
  parts: ExamPart[];
  questions: Question[];
}

// Client-safe version with answers stripped
export type QuestionWithoutAnswer =
  | Omit<MCQQuestion, "answer">
  | Omit<FillInQuestion, "answer" | "tolerance"> & {
      subFields?: Omit<FillInQuestion["subFields"], never>;
    }
  | ActionQuestion;

export interface ExamForClient {
  id: string;
  examNumber: number;
  title: string;
  scenario: string;
  dataset: ExamDataset;
  parts: ExamPart[];
  questions: QuestionWithoutAnswer[];
}
