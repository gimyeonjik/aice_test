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

  useEffect(() => {
    const saved = localStorage.getItem("aice-student-name");
    if (saved) setName(saved);
  }, []);

  function handleStart(examId: string) {
    if (!name.trim()) {
      alert("이름을 입력해주세요.");
      return;
    }
    localStorage.setItem("aice-student-name", name.trim());
    router.push(`/exam/${examId}?name=${encodeURIComponent(name.trim())}`);
  }

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
              onClick={() => handleStart(exam.id)}
              className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 text-left hover:shadow-md hover:border-indigo-300 transition-all group"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-2xl font-bold text-indigo-600">
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
              <h3 className="font-medium text-slate-800 mb-2 group-hover:text-indigo-600 transition-colors">
                {exam.title}
              </h3>
              <div className="text-sm text-slate-500 space-y-1">
                <p>데이터: {exam.dataset.filename}</p>
                <p>문항 수: {exam.questionCount}문제</p>
              </div>
            </button>
          ))}
        </div>
      </main>
    </div>
  );
}
