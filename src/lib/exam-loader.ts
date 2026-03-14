import type { Exam, ExamForClient, Question } from "@/types/exam";

import exam1 from "@/data/exams/exam-1.json";
import exam2 from "@/data/exams/exam-2.json";
import exam3 from "@/data/exams/exam-3.json";
import exam4 from "@/data/exams/exam-4.json";
import exam5 from "@/data/exams/exam-5.json";
import exam6 from "@/data/exams/exam-6.json";
import exam7 from "@/data/exams/exam-7.json";
import exam8 from "@/data/exams/exam-8.json";
import exam9 from "@/data/exams/exam-9.json";
import exam10 from "@/data/exams/exam-10.json";

const exams: Record<string, Exam> = {
  "exam-1": exam1 as unknown as Exam,
  "exam-2": exam2 as unknown as Exam,
  "exam-3": exam3 as unknown as Exam,
  "exam-4": exam4 as unknown as Exam,
  "exam-5": exam5 as unknown as Exam,
  "exam-6": exam6 as unknown as Exam,
  "exam-7": exam7 as unknown as Exam,
  "exam-8": exam8 as unknown as Exam,
  "exam-9": exam9 as unknown as Exam,
  "exam-10": exam10 as unknown as Exam,
};

export function getExam(examId: string): Exam | null {
  return exams[examId] ?? null;
}

export function getAllExamSummaries() {
  return Object.values(exams).map((exam) => ({
    id: exam.id,
    examNumber: exam.examNumber,
    title: exam.title,
    dataset: exam.dataset,
    questionCount: exam.questions.length,
  }));
}

/** Strip answers before sending to the client */
export function getExamForClient(examId: string): ExamForClient | null {
  const exam = getExam(examId);
  if (!exam) return null;

  return {
    ...exam,
    questions: exam.questions.map(stripAnswer),
  };
}

function stripAnswer(q: Question) {
  if (q.type === "action") return q;

  if (q.type === "mcq") {
    const { answer: _, ...rest } = q;
    return rest;
  }

  // fill-in
  const { answer: _, tolerance: _t, ...rest } = q;
  if (rest.subFields) {
    rest.subFields = rest.subFields.map(({ answer: _a, ...sf }) => sf) as typeof rest.subFields;
  }
  return rest;
}
