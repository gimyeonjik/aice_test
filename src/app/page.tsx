"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getAllExamSummaries } from "@/lib/exam-loader";
import { motion } from "framer-motion";
import { BrainCircuit, BookOpen, Database, Target, CheckCircle2, ChevronRight, User } from "lucide-react";

const examSummaries = getAllExamSummaries();

const taskTypeLabel: Record<string, string> = {
  clustering: "비지도 학습 (군집화)",
  regression: "회귀분석",
  classification: "이진 분류",
};

const taskTypeColor: Record<string, string> = {
  clustering: "bg-purple-100/80 text-purple-700 ring-1 ring-purple-500/20",
  regression: "bg-blue-100/80 text-blue-700 ring-1 ring-blue-500/20",
  classification: "bg-emerald-100/80 text-emerald-700 ring-1 ring-emerald-500/20",
};

// Group exams by set: 1-10 → 1회, 11-20 → 2회, 21-30 → 3회
function getSetNumber(examNumber: number): number {
  return Math.ceil(examNumber / 10);
}

const examSets = (() => {
  const sets = new Map<number, typeof examSummaries>();
  for (const exam of examSummaries) {
    const setNum = getSetNumber(exam.examNumber);
    if (!sets.has(setNum)) sets.set(setNum, []);
    sets.get(setNum)!.push(exam);
  }
  // Sort exams within each set by examNumber
  for (const exams of sets.values()) {
    exams.sort((a, b) => a.examNumber - b.examNumber);
  }
  return Array.from(sets.entries()).sort(([a], [b]) => a - b);
})();

const setColors = [
  { tab: "bg-indigo-600 text-white", tabInactive: "bg-slate-100 text-slate-600 hover:bg-slate-200", badge: "bg-indigo-100 text-indigo-700" },
  { tab: "bg-violet-600 text-white", tabInactive: "bg-slate-100 text-slate-600 hover:bg-slate-200", badge: "bg-violet-100 text-violet-700" },
  { tab: "bg-cyan-600 text-white", tabInactive: "bg-slate-100 text-slate-600 hover:bg-slate-200", badge: "bg-cyan-100 text-cyan-700" },
];

export default function HomePage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [selectedExam, setSelectedExam] = useState<string | null>(null);
  const [activeSet, setActiveSet] = useState(examSets[0]?.[0] ?? 1);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
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
    router.push(`/exam/${selectedExam}?name=${encodeURIComponent(name.trim())}`);
  }

  const selected = examSummaries.find((e) => e.id === selectedExam);
  const currentSetExams = examSets.find(([n]) => n === activeSet)?.[1] ?? [];

  if (!isMounted) return null;

  return (
    <div className="min-h-screen bg-[#FAFAFC] selection:bg-indigo-100 selection:text-indigo-900 font-sans text-slate-900">
      {/* Abstract Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-200/40 blur-[100px]" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[50%] h-[50%] rounded-full bg-blue-100/40 blur-[120px]" />
      </div>

      {/* Header */}
      <header className="relative z-10 sticky top-0 bg-white/70 backdrop-blur-xl border-b border-white/20 shadow-[0_4px_30px_rgba(0,0,0,0.03)]">
        <div className="max-w-5xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-blue-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <BrainCircuit className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                AICE Junior
              </h1>
              <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Practice Platform</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-500 font-medium">
            <BookOpen className="w-4 h-4" />
            <span>{examSummaries.length} Exams Available</span>
          </div>
        </div>
      </header>

      <main className="relative z-10 max-w-5xl mx-auto px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 mb-4">
            실전처럼 완벽하게,<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-blue-500">
              AICE 주니어 모의고사
            </span>
          </h2>
          <p className="text-lg text-slate-500 max-w-2xl mx-auto">
            실제 시험과 동일한 환경에서 AI 모델링 역량을 점검해보세요.
            데이터 분석부터 모델 학습, 결과 해석까지 실전 감각을 키울 수 있습니다.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8">
          {/* Left Column: Exams Grid */}
          <div className="space-y-6">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <Target className="w-5 h-5 text-indigo-500" />
                모의고사 선택
              </h3>
            </div>

            {/* Set Tabs */}
            <div className="flex gap-2">
              {examSets.map(([setNum, exams], idx) => {
                const isActive = activeSet === setNum;
                const colors = setColors[idx % setColors.length];
                return (
                  <button
                    key={setNum}
                    onClick={() => setActiveSet(setNum)}
                    className={`px-4 py-2 rounded-xl text-sm font-bold transition-all duration-200 ${
                      isActive ? colors.tab + " shadow-md" : colors.tabInactive
                    }`}
                  >
                    {setNum}회 세트
                    <span className={`ml-1.5 text-xs px-1.5 py-0.5 rounded-md ${
                      isActive ? "bg-white/20" : "bg-slate-200/80"
                    }`}>
                      {exams.length}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {currentSetExams.map((exam, index) => {
                const isSelected = selectedExam === exam.id;
                return (
                  <motion.button
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.05 }}
                    key={exam.id}
                    onClick={() => setSelectedExam(exam.id)}
                    className={`group relative text-left rounded-2xl p-5 transition-all duration-300 ${
                      isSelected
                        ? "bg-white border-2 border-indigo-500 shadow-xl shadow-indigo-500/10 scale-[1.02]"
                        : "bg-white/80 border-2 border-transparent hover:border-slate-200 shadow-sm hover:shadow-md hover:bg-white"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <span className={`flex items-center justify-center w-8 h-8 rounded-lg font-bold text-sm ${
                          isSelected ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-700 group-hover:bg-slate-200"
                        }`}>
                          {exam.examNumber}
                        </span>
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${taskTypeColor[exam.dataset.taskType]}`}>
                          {taskTypeLabel[exam.dataset.taskType]}
                        </span>
                      </div>
                      {isSelected && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="text-indigo-500"
                        >
                          <CheckCircle2 className="w-6 h-6" />
                        </motion.div>
                      )}
                    </div>

                    <h4 className={`text-lg font-bold mb-2 ${isSelected ? "text-indigo-900" : "text-slate-800"}`}>
                      {exam.title}
                    </h4>

                    <div className="space-y-1.5 mt-4">
                      <div className="flex items-center gap-2 text-sm text-slate-500">
                        <Database className="w-4 h-4 text-slate-400" />
                        <span className="truncate">{exam.dataset.filename}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-slate-500">
                        <BookOpen className="w-4 h-4 text-slate-400" />
                        <span>{exam.questionCount} 문항</span>
                      </div>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </div>

          {/* Right Column: User Info & Actions */}
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-white rounded-3xl p-6 shadow-xl shadow-slate-200/50 border border-slate-100"
            >
              <div className="mb-6">
                <label htmlFor="student-name" className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-3">
                  <User className="w-4 h-4" /> 응시자 이름
                </label>
                <input
                  id="student-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="홍길동"
                  className="w-full bg-slate-50 px-4 py-3.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 text-base font-medium transition-all"
                />
              </div>

              <div className="bg-slate-50 rounded-2xl p-4 mb-6 border border-slate-100">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">선택된 시험</h4>
                {selected ? (
                  <div>
                    <div className="font-bold text-slate-800">{selected.examNumber}회 모의고사</div>
                    <div className="text-sm text-slate-500 mt-1 line-clamp-2">{selected.title}</div>
                  </div>
                ) : (
                  <div className="text-sm text-slate-400 italic">왼쪽 목록에서 시험을 선택해주세요.</div>
                )}
              </div>

              <button
                onClick={handleStart}
                disabled={!name.trim() || !selectedExam}
                className="group relative w-full flex items-center justify-center gap-2 py-4 bg-slate-900 text-white font-bold rounded-xl hover:bg-indigo-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-slate-900 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <span className="relative z-10">시험 시작하기</span>
                <ChevronRight className="relative z-10 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  );
}
