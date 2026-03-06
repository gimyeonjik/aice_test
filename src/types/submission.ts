export interface StudentAnswer {
  questionId: string;
  questionNumber: number;
  type: "mcq" | "fill-in" | "action";
  studentAnswer: string | number | null;
  correctAnswer: string | number;
  isCorrect: boolean;
}

export interface Submission {
  id: string;
  studentName: string;
  examId: string;
  examNumber: number;
  answers: StudentAnswer[];
  score: number;
  totalQuestions: number;
  submittedAt: string; // ISO 8601
}
