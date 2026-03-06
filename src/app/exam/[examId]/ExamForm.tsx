"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { ExamForClient } from "@/types/exam";

interface Props {
  exam: ExamForClient;
  studentName: string;
}

export default function ExamForm({ exam, studentName }: Props) {
  const router = useRouter();
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  function setAnswer(questionId: string, value: string) {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  }

  async function handleSubmit() {
    setSubmitting(true);
    try {
      const res = await fetch("/api/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentName,
          examId: exam.id,
          answers,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        router.push(`/result/${data.submissionId}`);
      } else {
        alert(data.error ?? "제출에 실패했습니다.");
      }
    } catch {
      alert("네트워크 오류가 발생했습니다.");
    } finally {
      setSubmitting(false);
      setShowConfirm(false);
    }
  }

  const answeredCount = exam.questions.filter(
    (q) => q.type === "action" || (answers[q.id] && answers[q.id].trim() !== "")
  ).length;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-indigo-600">
              {exam.examNumber}회 모의고사
            </h1>
            <p className="text-sm text-slate-500">{studentName}</p>
          </div>
          <span className="text-sm font-medium text-slate-600 bg-slate-100 px-3 py-1.5 rounded-full">
            {answeredCount} / {exam.questions.length} 답변
          </span>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-6 space-y-6">
        {/* Scenario */}
        <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-5">
          <h2 className="font-semibold text-indigo-800 mb-2">
            과제 시나리오
          </h2>
          <p className="text-sm text-indigo-700 leading-relaxed">
            {exam.scenario}
          </p>
          <div className="mt-4 bg-white rounded-lg p-4 text-sm text-slate-700">
            <p className="font-medium mb-2">데이터셋 정보</p>
            <ul className="space-y-1 text-slate-600">
              <li>파일명: {exam.dataset.filename}</li>
              <li>크기: {exam.dataset.rowCount}</li>
              <li>
                Target: {exam.dataset.target ?? "없음"}{" "}
                <span className="text-slate-400">
                  ({exam.dataset.targetDescription})
                </span>
              </li>
              <li>Features: {exam.dataset.features.join(", ")}</li>
            </ul>
          </div>
        </div>

        {/* Questions by Part */}
        {exam.parts.map((part) => (
          <div key={part.partNumber}>
            <div className="flex items-center gap-3 mb-4 mt-8">
              <div
                className={`w-1 h-8 rounded-full ${
                  part.partNumber === 1 ? "bg-blue-500" : "bg-purple-500"
                }`}
              />
              <h2 className="text-lg font-bold text-slate-800">
                Part {part.partNumber}: {part.title}
              </h2>
            </div>

            <div className="space-y-4">
              {exam.questions
                .filter((q) => q.partNumber === part.partNumber)
                .map((q) => (
                  <div
                    key={q.id}
                    className="bg-white rounded-xl shadow-sm border border-slate-200 p-5"
                  >
                    <div className="flex items-start gap-3 mb-3">
                      <span className="shrink-0 w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 font-bold text-sm flex items-center justify-center">
                        {q.questionNumber}
                      </span>
                      <p className="text-slate-800 leading-relaxed whitespace-pre-line">
                        {q.prompt}
                      </p>
                    </div>

                    {q.type !== "action" && "hint" in q && q.hint && (
                      <p className="text-xs text-slate-400 mb-3 ml-11">
                        {q.hint}
                      </p>
                    )}

                    {"guide" in q && q.guide && (
                      <div className="ml-11 mb-3 bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-800 whitespace-pre-line">
                        <span className="font-medium">가이드: </span>
                        {q.guide}
                      </div>
                    )}

                    {"inputValues" in q && q.inputValues && (
                      <div className="ml-11 mb-3 bg-slate-50 border border-slate-200 rounded-lg p-3 text-sm text-slate-700 whitespace-pre-line">
                        <span className="font-medium">입력값:</span>
                        {"\n"}
                        {q.inputValues}
                      </div>
                    )}

                    {/* Answer Input */}
                    <div className="ml-11">
                      {q.type === "mcq" && "options" in q && (
                        <div className="space-y-2">
                          {q.options.map((opt, idx) => (
                            <label
                              key={idx}
                              className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                                answers[q.id] === String(idx + 1)
                                  ? "border-indigo-500 bg-indigo-50"
                                  : "border-slate-200 hover:bg-slate-50"
                              }`}
                            >
                              <input
                                type="radio"
                                name={q.id}
                                value={String(idx + 1)}
                                checked={answers[q.id] === String(idx + 1)}
                                onChange={(e) =>
                                  setAnswer(q.id, e.target.value)
                                }
                                className="accent-indigo-600"
                              />
                              <span className="text-sm text-slate-700">
                                {opt.label} {opt.text}
                              </span>
                            </label>
                          ))}
                        </div>
                      )}

                      {q.type === "fill-in" && !("subFields" in q && q.subFields) && (
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={answers[q.id] ?? ""}
                            onChange={(e) =>
                              setAnswer(q.id, e.target.value)
                            }
                            placeholder="정답을 입력하세요"
                            className="flex-1 max-w-xs px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                          />
                          {"unit" in q && q.unit && (
                            <span className="text-sm text-slate-500">
                              {q.unit}
                            </span>
                          )}
                        </div>
                      )}

                      {q.type === "fill-in" && "subFields" in q && q.subFields && (
                        <div className="space-y-2">
                          {q.subFields.map(
                            (
                              sf: { label: string; unit?: string },
                              idx: number
                            ) => {
                              const subAnswers = answers[q.id]
                                ? (() => {
                                    try {
                                      return JSON.parse(answers[q.id]);
                                    } catch {
                                      return [];
                                    }
                                  })()
                                : [];
                              return (
                                <div
                                  key={idx}
                                  className="flex items-center gap-2"
                                >
                                  <span className="text-sm text-slate-600 w-24">
                                    {sf.label}:
                                  </span>
                                  <input
                                    type="text"
                                    value={subAnswers[idx] ?? ""}
                                    onChange={(e) => {
                                      const newSub = [...subAnswers];
                                      newSub[idx] = e.target.value;
                                      setAnswer(
                                        q.id,
                                        JSON.stringify(newSub)
                                      );
                                    }}
                                    placeholder="정답 입력"
                                    className="flex-1 max-w-[160px] px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                                  />
                                  {sf.unit && (
                                    <span className="text-sm text-slate-500">
                                      {sf.unit}
                                    </span>
                                  )}
                                </div>
                              );
                            }
                          )}
                        </div>
                      )}

                      {q.type === "action" && (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-sm text-green-700">
                          <p className="font-medium mb-1">실습 문항</p>
                          <p>{"instruction" in q && q.instruction}</p>
                          <p className="mt-2 text-xs text-green-500">
                            이 문항은 실습으로 진행되며 자동으로 만점
                            처리됩니다.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        ))}

        {/* Submit Button */}
        <div className="pt-6 pb-12">
          <button
            onClick={() => setShowConfirm(true)}
            disabled={submitting}
            className="w-full py-3.5 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
          >
            {submitting ? "제출 중..." : "답안 제출하기"}
          </button>
          <p className="text-center text-xs text-slate-400 mt-2">
            {answeredCount}/{exam.questions.length} 문항 답변 완료
          </p>
        </div>
      </main>

      {/* Confirm Modal */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-6">
            <h3 className="text-lg font-bold text-slate-800 mb-2">
              답안을 제출하시겠습니까?
            </h3>
            <p className="text-sm text-slate-500 mb-6">
              {answeredCount}/{exam.questions.length} 문항에 답변하셨습니다.
              제출 후에는 수정할 수 없습니다.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 py-2.5 border border-slate-300 rounded-lg text-slate-700 font-medium hover:bg-slate-50 transition-colors"
              >
                취소
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="flex-1 py-2.5 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50"
              >
                {submitting ? "제출 중..." : "제출"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
