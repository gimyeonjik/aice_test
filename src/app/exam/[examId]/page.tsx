import { getExamForClient } from "@/lib/exam-loader";
import { notFound } from "next/navigation";
import ExamForm from "./ExamForm";

interface PageProps {
  params: Promise<{ examId: string }>;
  searchParams: Promise<{ name?: string }>;
}

export default async function ExamPage({ params, searchParams }: PageProps) {
  const { examId } = await params;
  const { name } = await searchParams;
  const exam = getExamForClient(examId);

  if (!exam) notFound();

  return <ExamForm exam={exam} studentName={name ?? ""} />;
}
