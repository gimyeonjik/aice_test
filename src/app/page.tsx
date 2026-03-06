"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getAllExamSummaries } from "@/lib/exam-loader";

const examSummaries = getAllExamSummaries();

const taskTypeLabel: Record<string, string> = {
  clustering: "비지도 학습 (군집화)",
  regression: "회귀분석",
  classification: "이진 분류",
};

const taskTypeColor: Record<string, string> = {
  clustering: "bg-purple-100 text-purple-700",
  regression: "bg-blue-100 text-blue-700",
  classification: "bg-green-100 text-green-700",
};

export default function HomePage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [selectedExam, setSelectedExam] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem("aice-student-name");
    if (saved) setName(saved);
  }, []);

  function handleStart() {
    if (!name.trim()) {
      alert("이름을 입력해주세요.");
      return;
    }
    if (!selectedExam) {
      alert("모의고사를 선택해주세요.");
      return;
    }
    localStorage.setItem("aice-student-name", name.trim());
    router.push(
      `/exam/${selectedExam}?name=${encodeURIComponent(name.trim())}`
    );
  }

  const selected = examSummaries.find((e) => e.id === selectedExam);

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <h1 className="text-2xl font-bold text-indigo-600">
            AICE Junior 모의고사
          </h1>
          <p className="text-slate-500 mt-1">
            실전 모의고사로 AICE 주니어 자격증을 준비하세요
          </p>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Name Input */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-8">
          <label
            htmlFor="student-name"
            className="block text-sm font-medium text-slate-700 mb-2"
          >
            이름을 입력하세요
          </label>
          <input
            id="student-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="홍길동"
            className="w-full max-w-xs px-4 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-base"
          />
        </div>

        {/* Exam Grid */}
        <h2 className="text-lg font-semibold text-slate-800 mb-4">
          모의고사 선택
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {examSummaries.map((exam) => (
            <button
              key={exam.id}
              onClick={() => setSelectedExam(exam.id)}
              className={`rounded-xl shadow-sm border-2 p-5 text-left transition-all group ${
                selectedExam === exam.id
                  ? "border-indigo-500 bg-indigo-50 shadow-md ring-1 ring-indigo-500"
                  : "border-slate-200 bg-white hover:shadow-md hover:border-slate-300"
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <span
                  className={`text-2xl font-bold ${
                    selectedExam === exam.id
                      ? "text-indigo-600"
                      : "text-slate-700"
                  }`}
                >
                  {exam.examNumber}회
                </span>
                <span
                  className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                    taskTypeColor[exam.dataset.taskType]
                  }`}
                >
                  {taskTypeLabel[exam.dataset.taskType]}
                </span>
              </div>
              <h3
                className={`font-medium mb-2 transition-colors ${
                  selectedExam === exam.id
                    ? "text-indigo-700"
                    : "text-slate-800 group-hover:text-indigo-600"
                }`}
              >
                {exam.title}
              </h3>
              <div className="text-sm text-slate-500 space-y-1">
                <p>데이터: {exam.dataset.filename}</p>
                <p>문항 수: {exam.questionCount}문제</p>
              </div>
              {selectedExam === exam.id && (
                <div className="mt-3 flex items-center gap-1.5 text-sm font-medium text-indigo-600">
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
                      clipRule="evenodd"
                    />
                  </svg>
                  선택됨
                </div>
              )}
            </button>
          ))}
        </div>

        {/* Start Button */}
        <div className="mt-8">
          {selected && (
            <p className="text-sm text-slate-500 mb-3 text-center">
              <span className="font-medium text-indigo-600">
                {selected.examNumber}회 - {selected.title}
              </span>
              을 선택하셨습니다.
            </p>
          )}
          <button
            onClick={handleStart}
            disabled={!name.trim() || !selectedExam}
            className="w-full max-w-md mx-auto block py-3.5 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed shadow-sm text-lg"
          >
            시험 시작하기
          </button>
          {(!name.trim() || !selectedExam) && (
            <p className="text-xs text-slate-400 text-center mt-2">
              {!name.trim() && !selectedExam
                ? "이름을 입력하고 모의고사를 선택해주세요"
                : !name.trim()
                  ? "이름을 입력해주세요"
                  : "모의고사를 선택해주세요"}
            </p>
          )}
        </div>
      </main>
    </div>
  );
}
