"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import type { ExamForClient } from "@/types/exam";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FileText, 
  Database, 
  CheckCircle2, 
  HelpCircle, 
  Send,
  Info,
  Lightbulb,
  AlertCircle
} from "lucide-react";

interface Props {
  exam: ExamForClient;
  studentName: string;
}

export default function ExamForm({ exam, studentName }: Props) {
  const router = useRouter();
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

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

  const progressPercentage = (answeredCount / exam.questions.length) * 100;

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-[#FAFAFC] font-sans text-slate-900 pb-20">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-slate-200/60 shadow-[0_4px_30px_rgba(0,0,0,0.02)]">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-md shadow-indigo-500/20">
              {exam.examNumber}
            </div>
            <div>
              <h1 className="text-sm font-bold text-slate-800">
                {exam.title}
              </h1>
              <p className="text-xs text-slate-500 font-medium">응시자: {studentName}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex flex-col items-end">
              <span className="text-xs font-bold text-indigo-600 mb-1">
                진행률 {Math.round(progressPercentage)}%
              </span>
              <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <motion.div 
                  className="h-full bg-gradient-to-r from-indigo-500 to-blue-500 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercentage}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 rounded-full border border-indigo-100">
              <CheckCircle2 className="w-4 h-4 text-indigo-600" />
              <span className="text-sm font-bold text-indigo-700">
                {answeredCount} / {exam.questions.length}
              </span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8 space-y-8">
        {/* Scenario Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl p-6 shadow-xl shadow-slate-200/40 border border-slate-100 overflow-hidden relative"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-bl-full -z-10 opacity-50" />
          <div className="flex items-center gap-2 mb-4">
            <FileText className="w-5 h-5 text-indigo-500" />
            <h2 className="text-lg font-bold text-slate-800">과제 시나리오</h2>
          </div>
          <p className="text-slate-700 leading-relaxed font-medium bg-slate-50 p-4 rounded-2xl border border-slate-100">
            {exam.scenario}
          </p>
          
          <div className="mt-6 flex flex-col sm:flex-row gap-4">
            <div className="flex-1 bg-gradient-to-br from-indigo-50 to-blue-50 rounded-2xl p-5 border border-indigo-100/50 relative overflow-hidden">
              <Database className="w-24 h-24 text-indigo-100 absolute -bottom-4 -right-4 -rotate-12" />
              <div className="relative z-10">
                <p className="text-xs font-bold text-indigo-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <Database className="w-4 h-4" /> 데이터셋 정보
                </p>
                <ul className="space-y-2 text-sm text-slate-700 font-medium">
                  <li className="flex items-center justify-between">
                    <span className="text-slate-500">파일명</span>
                    <span className="bg-white px-2 py-0.5 rounded-md shadow-sm border border-slate-100">{exam.dataset.filename}</span>
                  </li>
                  <li className="flex items-center justify-between">
                    <span className="text-slate-500">데이터 수</span>
                    <span>{exam.dataset.rowCount.toLocaleString()} rows</span>
                  </li>
                  <li className="flex flex-col gap-1 mt-2">
                    <span className="text-slate-500 text-xs">Target 변수</span>
                    <div className="bg-white/60 p-2 rounded-lg text-xs border border-indigo-100/50">
                      <span className="font-bold text-indigo-700">{exam.dataset.target ?? "없음"}</span>
                      {exam.dataset.targetDescription && <span className="text-slate-500 ml-1">({exam.dataset.targetDescription})</span>}
                    </div>
                  </li>
                </ul>
              </div>
            </div>
            
            <div className="flex-1 bg-white border border-slate-200 rounded-2xl p-5">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">사용 가능한 Features</p>
              <div className="flex flex-wrap gap-1.5">
                {exam.dataset.features.map(f => (
                  <span key={f} className="text-[11px] font-medium px-2 py-1 bg-slate-100 text-slate-600 rounded-md border border-slate-200">
                    {f}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Questions */}
        {exam.parts.map((part, partIndex) => (
          <motion.div 
            key={part.partNumber}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: partIndex * 0.1 + 0.1 }}
          >
            <div className="flex items-center gap-3 mb-6 mt-12">
              <div className="h-px flex-1 bg-slate-200" />
              <div className="flex items-center gap-2 px-4 py-1.5 bg-white border border-slate-200 rounded-full shadow-sm">
                <span className={`w-2 h-2 rounded-full ${part.partNumber === 1 ? 'bg-blue-500' : 'bg-purple-500'}`} />
                <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wider">
                  Part {part.partNumber}. {part.title}
                </h2>
              </div>
              <div className="h-px flex-1 bg-slate-200" />
            </div>

            <div className="space-y-6">
              {exam.questions
                .filter((q) => q.partNumber === part.partNumber)
                .map((q, qIndex) => (
                  <motion.div
                    key={q.id}
                    initial={{ opacity: 0, scale: 0.98 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true, margin: "-50px" }}
                    transition={{ duration: 0.4 }}
                    className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200/60 hover:shadow-md transition-shadow relative overflow-hidden group"
                  >
                    {/* Active Indicator Line */}
                    <div className={`absolute top-0 left-0 bottom-0 w-1.5 transition-colors duration-300 ${answers[q.id] || q.type === 'action' ? 'bg-indigo-500' : 'bg-transparent group-hover:bg-slate-200'}`} />
                    
                    <div className="flex gap-4">
                      {/* Question Number */}
                      <div className="shrink-0">
                        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-lg shadow-sm transition-colors duration-300 ${
                          answers[q.id] || q.type === 'action' 
                            ? 'bg-indigo-600 text-white shadow-indigo-500/30' 
                            : 'bg-slate-100 text-slate-500'
                        }`}>
                          {q.questionNumber}
                        </div>
                      </div>

                      <div className="flex-1 space-y-4">
                        {/* Prompt */}
                        <div className="text-lg font-medium text-slate-800 leading-relaxed whitespace-pre-line">
                          {q.prompt}
                        </div>

                        {/* Additional Info */}
                        <div className="space-y-2">
                          {q.type !== "action" && "hint" in q && q.hint && (
                            <div className="flex items-start gap-2 text-sm text-slate-500 bg-slate-50/50 p-3 rounded-xl border border-slate-100">
                              <Lightbulb className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                              <p>{q.hint}</p>
                            </div>
                          )}

                          {"guide" in q && q.guide && (
                            <div className="flex items-start gap-2 text-sm bg-amber-50 border border-amber-200/60 text-amber-800 p-3.5 rounded-xl whitespace-pre-line">
                              <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                              <div>
                                <span className="font-bold block mb-1">작업 가이드</span>
                                {q.guide}
                              </div>
                            </div>
                          )}

                          {"inputValues" in q && q.inputValues && (
                            <div className="flex items-start gap-2 text-sm bg-slate-50 border border-slate-200 text-slate-700 p-3.5 rounded-xl whitespace-pre-line font-mono text-[13px]">
                              <Database className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                              <div>
                                <span className="font-bold block mb-1 font-sans text-slate-500">입력값</span>
                                {q.inputValues}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Inputs */}
                        <div className="pt-4 mt-4 border-t border-slate-100">
                          {q.type === "mcq" && "options" in q && (
                            <div className="grid gap-2">
                              {q.options?.map((opt, idx) => {
                                const isChecked = answers[q.id] === String(idx + 1);
                                return (
                                  <label
                                    key={idx}
                                    className={`relative flex items-center p-4 rounded-2xl cursor-pointer transition-all duration-200 border-2 ${
                                      isChecked
                                        ? "border-indigo-500 bg-indigo-50/50 shadow-sm"
                                        : "border-slate-100 hover:border-indigo-200 hover:bg-slate-50"
                                    }`}
                                  >
                                    <div className="flex items-center gap-3 w-full">
                                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                                        isChecked ? "border-indigo-600" : "border-slate-300"
                                      }`}>
                                        {isChecked && <div className="w-2.5 h-2.5 bg-indigo-600 rounded-full" />}
                                      </div>
                                      <input
                                        type="radio"
                                        name={q.id}
                                        value={String(idx + 1)}
                                        checked={isChecked}
                                        onChange={(e) => setAnswer(q.id, e.target.value)}
                                        className="sr-only"
                                      />
                                      <span className={`text-base font-medium ${isChecked ? "text-indigo-900" : "text-slate-700"}`}>
                                        <span className="font-bold mr-2 text-slate-400">{opt.label}</span>
                                        {opt.text}
                                      </span>
                                    </div>
                                  </label>
                                );
                              })}
                            </div>
                          )}

                          {q.type === "fill-in" && !("subFields" in q && q.subFields) && (
                            <div className="flex items-center gap-3">
                              <div className="relative flex-1 max-w-sm">
                                <input
                                  type="text"
                                  value={answers[q.id] ?? ""}
                                  onChange={(e) => setAnswer(q.id, e.target.value)}
                                  placeholder="정답을 입력하세요"
                                  className="w-full px-4 py-3.5 rounded-xl border-2 border-slate-200 focus:border-indigo-500 focus:ring-0 text-base font-medium transition-colors bg-slate-50 focus:bg-white"
                                />
                                {answers[q.id] && (
                                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-500">
                                    <CheckCircle2 className="w-5 h-5" />
                                  </motion.div>
                                )}
                              </div>
                              {"unit" in q && q.unit && (
                                <span className="text-slate-500 font-medium bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
                                  {q.unit as React.ReactNode}
                                </span>
                              )}
                            </div>
                          )}

                          {q.type === "fill-in" && "subFields" in q && Array.isArray(q.subFields) && (
                            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                              {q.subFields.map((sf: { label: string; unit?: string }, idx: number) => {
                                const subAnswers = answers[q.id]
                                  ? (() => {
                                      try { return JSON.parse(answers[q.id]); } catch { return []; }
                                    })()
                                  : [];
                                return (
                                  <div key={idx} className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                                    <label className="block text-xs font-bold text-slate-500 mb-1.5">
                                      {sf.label}
                                    </label>
                                    <div className="flex items-center gap-2">
                                      <input
                                        type="text"
                                        value={subAnswers[idx] ?? ""}
                                        onChange={(e) => {
                                          const newSub = [...subAnswers];
                                          newSub[idx] = e.target.value;
                                          setAnswer(q.id, JSON.stringify(newSub));
                                        }}
                                        placeholder="값 입력"
                                        className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-sm font-medium bg-white"
                                      />
                                      {sf.unit && <span className="text-xs font-medium text-slate-500 shrink-0">{sf.unit}</span>}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}

                          {q.type === "action" && (
                            <div className="bg-emerald-50/50 border-2 border-emerald-100 rounded-2xl p-5 flex items-start gap-4">
                              <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                              </div>
                              <div>
                                <h4 className="font-bold text-emerald-800 mb-1">실습 수행 문항</h4>
                                <p className="text-sm text-emerald-700 leading-relaxed mb-3">
                                  {"instruction" in q && q.instruction as React.ReactNode}
                                </p>
                                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-full">
                                  <CheckCircle2 className="w-3.5 h-3.5" /> 자동 만점 처리
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
            </div>
          </motion.div>
        ))}

        {/* Submit Section */}
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="pt-12 pb-8"
        >
          <div className="bg-white rounded-3xl p-8 shadow-xl shadow-indigo-500/5 border border-indigo-100 text-center relative overflow-hidden">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-1 bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-50" />
            
            <h3 className="text-2xl font-bold text-slate-800 mb-2">모든 문항을 작성하셨나요?</h3>
            <p className="text-slate-500 mb-8">제출 후에는 답안을 수정할 수 없습니다.</p>
            
            <button
              onClick={() => setShowConfirm(true)}
              disabled={submitting}
              className="relative inline-flex items-center justify-center gap-2 px-8 py-4 bg-slate-900 text-white font-bold rounded-2xl hover:bg-indigo-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed group overflow-hidden shadow-lg shadow-slate-900/20"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <Send className="relative z-10 w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              <span className="relative z-10 text-lg">{submitting ? "제출 처리 중..." : "최종 답안 제출하기"}</span>
            </button>
            
            <div className="mt-6 flex items-center justify-center gap-2 text-sm">
              <span className="text-slate-400 font-medium">현재 응답률:</span>
              <span className={`font-bold ${progressPercentage === 100 ? 'text-emerald-500' : 'text-indigo-600'}`}>
                {answeredCount} / {exam.questions.length} ({Math.round(progressPercentage)}%)
              </span>
            </div>
          </div>
        </motion.div>
      </main>

      {/* Confirm Modal */}
      <AnimatePresence>
        {showConfirm && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl shadow-2xl max-w-sm w-full p-6 border border-slate-100"
            >
              <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center mb-4 mx-auto">
                <AlertCircle className="w-6 h-6 text-amber-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 text-center mb-2">
                답안을 제출하시겠습니까?
              </h3>
              <div className="bg-slate-50 rounded-xl p-4 mb-6 text-center border border-slate-100">
                <p className="text-sm font-bold text-slate-700 mb-1">응답 현황</p>
                <p className="text-2xl font-black text-indigo-600">
                  {answeredCount}<span className="text-slate-400 text-base font-medium">/{exam.questions.length}</span>
                </p>
                {progressPercentage < 100 && (
                  <p className="text-xs text-amber-600 mt-2 font-medium">아직 풀지 않은 문항이 있습니다!</p>
                )}
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowConfirm(false)}
                  className="flex-1 py-3 bg-white border-2 border-slate-200 rounded-xl text-slate-700 font-bold hover:bg-slate-50 hover:border-slate-300 transition-colors"
                >
                  취소
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <span className="animate-pulse">제출 중...</span>
                  ) : (
                    <>
                      <Send className="w-4 h-4" /> 제출하기
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}