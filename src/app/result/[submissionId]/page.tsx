"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import type { Submission } from "@/types/submission";
import { motion } from "framer-motion";
import { 
  Trophy, 
  CheckCircle2, 
  XCircle, 
  ArrowRight,
  Home,
  RefreshCcw,
  Medal,
  Target
} from "lucide-react";

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
      <div className="min-h-screen flex items-center justify-center bg-[#FAFAFC]">
        <div className="flex flex-col items-center gap-4">
          <RefreshCcw className="w-8 h-8 text-indigo-500 animate-spin" />
          <p className="text-slate-500 font-medium animate-pulse">결과를 분석하고 있습니다...</p>
        </div>
      </div>
    );
  }

  if (error || !submission) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAFAFC]">
        <div className="bg-white p-8 rounded-3xl shadow-xl shadow-slate-200/50 text-center max-w-sm w-full mx-4 border border-slate-100">
          <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-slate-800 mb-2">오류가 발생했습니다</h2>
          <p className="text-slate-500 mb-8">{error || "결과를 찾을 수 없습니다."}</p>
          <button
            onClick={() => router.push("/")}
            className="w-full py-3.5 bg-slate-900 text-white font-bold rounded-xl hover:bg-indigo-600 transition-colors flex items-center justify-center gap-2"
          >
            <Home className="w-4 h-4" /> 홈으로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  const scorePercent = Math.round((submission.score / submission.totalQuestions) * 100);
  
  let scoreTheme = {
    color: "text-emerald-600",
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    gradient: "from-emerald-400 to-teal-500",
    shadow: "shadow-emerald-500/20",
    message: "훌륭합니다! 완벽에 가까운 결과네요.",
    icon: Trophy
  };

  if (scorePercent < 60) {
    scoreTheme = {
      color: "text-red-600",
      bg: "bg-red-50",
      border: "border-red-200",
      gradient: "from-red-400 to-rose-500",
      shadow: "shadow-red-500/20",
      message: "조금 더 연습이 필요해 보입니다. 다시 도전해보세요!",
      icon: Target
    };
  } else if (scorePercent < 80) {
    scoreTheme = {
      color: "text-amber-600",
      bg: "bg-amber-50",
      border: "border-amber-200",
      gradient: "from-amber-400 to-orange-500",
      shadow: "shadow-amber-500/20",
      message: "잘하셨습니다! 조금만 더 보완하면 완벽하겠어요.",
      icon: Medal
    };
  }

  const ScoreIcon = scoreTheme.icon;

  return (
    <div className="min-h-screen bg-[#FAFAFC] font-sans text-slate-900 pb-20">
      {/* Background Decor */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className={`absolute top-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-gradient-to-br ${scoreTheme.gradient} opacity-10 blur-[120px]`} />
      </div>

      {/* Header */}
      <header className="relative z-10 sticky top-0 bg-white/80 backdrop-blur-xl border-b border-slate-200/60 shadow-[0_4px_30px_rgba(0,0,0,0.02)]">
        <div className="max-w-3xl mx-auto px-6 h-16 flex items-center justify-between">
          <div>
            <h1 className="text-sm font-bold text-slate-800">
              {submission.examNumber}회 모의고사 결과
            </h1>
            <p className="text-xs text-slate-500 font-medium">{submission.studentName}님의 리포트</p>
          </div>
          <div className="text-xs font-medium text-slate-400 bg-slate-100 px-3 py-1.5 rounded-full">
            {new Date(submission.submittedAt).toLocaleDateString("ko-KR", { 
              year: 'numeric', month: 'long', day: 'numeric'
            })}
          </div>
        </div>
      </header>

      <main className="relative z-10 max-w-3xl mx-auto px-6 py-8 space-y-8">
        {/* Score Summary Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, type: "spring", bounce: 0.4 }}
          className="bg-white rounded-[2rem] p-8 shadow-xl shadow-slate-200/50 border border-slate-100 text-center relative overflow-hidden"
        >
          <div className={`absolute top-0 left-0 w-full h-2 bg-gradient-to-r ${scoreTheme.gradient}`} />
          
          <div className={`w-20 h-20 mx-auto rounded-2xl ${scoreTheme.bg} flex items-center justify-center mb-6 shadow-lg ${scoreTheme.shadow} rotate-3`}>
            <ScoreIcon className={`w-10 h-10 ${scoreTheme.color}`} />
          </div>

          <h2 className="text-slate-500 font-bold tracking-wider uppercase text-sm mb-2">Total Score</h2>
          
          <div className="flex items-baseline justify-center gap-2 mb-2">
            <span className={`text-6xl font-black tracking-tight bg-gradient-to-br ${scoreTheme.gradient} bg-clip-text text-transparent`}>
              {submission.score}
            </span>
            <span className="text-2xl font-bold text-slate-300">
              / {submission.totalQuestions}
            </span>
          </div>

          <div className="inline-flex items-center justify-center px-4 py-1.5 rounded-full bg-slate-50 border border-slate-100 mb-6">
            <span className={`font-bold ${scoreTheme.color}`}>환산 점수: {scorePercent}점</span>
          </div>

          <p className="text-lg font-medium text-slate-700 max-w-md mx-auto">
            "{scoreTheme.message}"
          </p>
        </motion.div>

        {/* Analytics/Per-Question Results */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
            <Target className="w-5 h-5 text-indigo-500" />
            문항별 상세 분석
          </h3>
          
          <div className="space-y-4">
            {submission.answers.map((a, index) => {
              const isCorrect = a.isCorrect;
              return (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * index + 0.3 }}
                  key={a.questionId}
                  className={`bg-white rounded-2xl p-5 border-2 transition-all duration-300 hover:shadow-md ${
                    isCorrect
                      ? "border-emerald-100 hover:border-emerald-200"
                      : "border-red-100 hover:border-red-200"
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 pb-4 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg shadow-sm ${
                        isCorrect ? "bg-emerald-500 text-white shadow-emerald-500/20" : "bg-red-500 text-white shadow-red-500/20"
                      }`}>
                        {a.questionNumber}
                      </div>
                      <div>
                        <div className={`flex items-center gap-1.5 font-bold text-base ${isCorrect ? "text-emerald-700" : "text-red-700"}`}>
                          {isCorrect ? <CheckCircle2 className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                          {isCorrect ? "정답입니다" : "오답입니다"}
                        </div>
                      </div>
                    </div>
                    <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-slate-100 text-slate-500 text-xs font-bold uppercase tracking-wider self-start sm:self-auto">
                      {a.type === "mcq" ? "객관식" : a.type === "fill-in" ? "주관식" : "실습"}
                    </span>
                  </div>

                  {a.type !== "action" && (
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                        <span className="block text-xs font-bold text-slate-400 mb-1.5 uppercase tracking-wider">제출한 답안</span>
                        <div className="font-medium text-slate-700 break-all">
                          {a.studentAnswer !== null && a.studentAnswer !== ""
                            ? String(a.studentAnswer)
                            : <span className="text-slate-400 italic">미답변</span>}
                        </div>
                      </div>
                      
                      {!isCorrect && (
                        <div className="bg-emerald-50/50 rounded-xl p-4 border border-emerald-100">
                          <span className="block text-xs font-bold text-emerald-600 mb-1.5 uppercase tracking-wider">정답</span>
                          <div className="font-bold text-emerald-700 break-all">
                            {String(a.correctAnswer)}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {a.type === "action" && (
                    <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-100 flex items-center gap-3">
                      <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                      <span className="text-sm font-bold text-emerald-700">실습 문항으로 자동 만점 처리되었습니다.</span>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Actions */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="pt-8"
        >
          <button
            onClick={() => router.push("/")}
            className="w-full sm:w-auto mx-auto flex items-center justify-center gap-2 py-4 px-8 bg-slate-900 text-white font-bold rounded-2xl hover:bg-indigo-600 transition-all duration-300 shadow-lg shadow-slate-900/20 group"
          >
            <span>다른 모의고사 풀기</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </motion.div>
      </main>
    </div>
  );
}