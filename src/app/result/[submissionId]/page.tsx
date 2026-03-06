"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import type { Submission } from "@/types/submission";

export default function ResultPage() {
  const { submissionId } = useParams<{ submissionId: string }>();
  const router = useRouter();
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/api/submissions/${submissionId}`)
      .then((res) => {
        if (!res.ok) throw new Error("결과를 찾을 수 없습니다.");
        return res.json();
      })
      .then(setSubmission)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [submissionId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <p className="text-slate-500">결과를 불러오는 중...</p>
      </div>
    );
  }

  if (error || !submission) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error || "결과를 찾을 수 없습니다."}</p>
          <button
            onClick={() => router.push("/")}
            className="text-indigo-600 hover:underline"
          >
            홈으로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  const scorePercent = Math.round(
    (submission.score / submission.totalQuestions) * 100
  );
  const scoreColor =
    scorePercent >= 80
      ? "text-green-600"
      : scorePercent >= 60
        ? "text-yellow-600"
        : "text-red-600";

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <h1 className="text-lg font-bold text-indigo-600">
            {submission.examNumber}회 모의고사 결과
          </h1>
          <p className="text-sm text-slate-500">{submission.studentName}</p>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-6 space-y-6">
        {/* Score Summary */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 text-center">
          <p className="text-sm text-slate-500 mb-1">총점</p>
          <p className={`text-5xl font-bold ${scoreColor}`}>
            {submission.score}
            <span className="text-2xl text-slate-400">
              /{submission.totalQuestions}
            </span>
          </p>
          <p className={`text-lg font-medium mt-2 ${scoreColor}`}>
            {scorePercent}점
          </p>
          <p className="text-xs text-slate-400 mt-2">
            {new Date(submission.submittedAt).toLocaleString("ko-KR")}
          </p>
        </div>

        {/* Per-Question Results */}
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-slate-800">문항별 결과</h2>
          {submission.answers.map((a) => (
            <div
              key={a.questionId}
              className={`bg-white rounded-xl border p-4 ${
                a.isCorrect
                  ? "border-green-200"
                  : "border-red-200"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span
                    className={`w-7 h-7 rounded-full text-sm font-bold flex items-center justify-center ${
                      a.isCorrect
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {a.questionNumber}
                  </span>
                  <span
                    className={`text-sm font-medium ${
                      a.isCorrect ? "text-green-700" : "text-red-700"
                    }`}
                  >
                    {a.isCorrect ? "정답" : "오답"}
                  </span>
                </div>
                <span className="text-xs text-slate-400 capitalize">
                  {a.type === "mcq"
                    ? "객관식"
                    : a.type === "fill-in"
                      ? "주관식"
                      : "실습"}
                </span>
              </div>

              {a.type !== "action" && (
                <div className="text-sm space-y-1 ml-9">
                  <p className="text-slate-600">
                    <span className="text-slate-400">내 답: </span>
                    {a.studentAnswer !== null && a.studentAnswer !== ""
                      ? String(a.studentAnswer)
                      : "(미답변)"}
                  </p>
                  {!a.isCorrect && (
                    <p className="text-green-600">
                      <span className="text-slate-400">정답: </span>
                      {String(a.correctAnswer)}
                    </p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4 pb-12">
          <button
            onClick={() => router.push("/")}
            className="flex-1 py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-colors"
          >
            다른 모의고사 풀기
          </button>
        </div>
      </main>
    </div>
  );
}
