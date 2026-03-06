"use client";

import { useState, useEffect, useCallback } from "react";
import type { Submission } from "@/types/submission";
import { formatDate } from "@/lib/utils";
import { getAllExamSummaries } from "@/lib/exam-loader";

const examSummaries = getAllExamSummaries();

export default function AdminPage() {
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(false);
  const [filterExam, setFilterExam] = useState<string>("all");
  const [tab, setTab] = useState<"results" | "answers">("results");
  const [selectedExam, setSelectedExam] = useState("exam-4");
  const [overrides, setOverrides] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const loadSubmissions = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/submissions");
      if (res.ok) {
        const data = await res.json();
        setSubmissions(data);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  const loadOverrides = useCallback(async (examId: string) => {
    try {
      const res = await fetch(`/api/admin/answers?examId=${examId}`);
      if (res.ok) {
        const data = await res.json();
        setOverrides(data);
      }
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    if (authenticated) {
      loadSubmissions();
    }
  }, [authenticated, loadSubmissions]);

  useEffect(() => {
    if (authenticated && tab === "answers") {
      loadOverrides(selectedExam);
    }
  }, [authenticated, tab, selectedExam, loadOverrides]);

  async function handleLogin() {
    setAuthError("");
    const res = await fetch("/api/admin/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    if (res.ok) {
      setAuthenticated(true);
    } else {
      setAuthError("비밀번호가 올바르지 않습니다.");
    }
  }

  async function handleSaveOverrides() {
    setSaving(true);
    try {
      await fetch("/api/admin/answers", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ examId: selectedExam, overrides }),
      });
      alert("정답이 저장되었습니다.");
    } catch {
      alert("저장 중 오류가 발생했습니다.");
    } finally {
      setSaving(false);
    }
  }

  function exportCSV() {
    const filtered = filteredSubmissions;
    if (!filtered.length) return;

    const header = "이름,회차,점수,총문항,제출일시\n";
    const rows = filtered
      .map(
        (s) =>
          `${s.studentName},${s.examNumber}회,${s.score},${s.totalQuestions},${formatDate(s.submittedAt)}`
      )
      .join("\n");

    const blob = new Blob(["\uFEFF" + header + rows], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `aice_results_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const filteredSubmissions =
    filterExam === "all"
      ? submissions
      : submissions.filter((s) => s.examId === filterExam);

  // ─── Login Screen ───
  if (!authenticated) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 max-w-sm w-full">
          <h1 className="text-xl font-bold text-slate-800 mb-6">
            관리자 로그인
          </h1>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
            placeholder="비밀번호"
            className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 mb-4"
          />
          {authError && (
            <p className="text-sm text-red-500 mb-4">{authError}</p>
          )}
          <button
            onClick={handleLogin}
            className="w-full py-2.5 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors"
          >
            로그인
          </button>
        </div>
      </div>
    );
  }

  // ─── Admin Dashboard ───
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold text-indigo-600">관리자 대시보드</h1>
          <div className="flex gap-2">
            <button
              onClick={() => setTab("results")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                tab === "results"
                  ? "bg-indigo-100 text-indigo-700"
                  : "text-slate-500 hover:bg-slate-100"
              }`}
            >
              결과 조회
            </button>
            <button
              onClick={() => setTab("answers")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                tab === "answers"
                  ? "bg-indigo-100 text-indigo-700"
                  : "text-slate-500 hover:bg-slate-100"
              }`}
            >
              정답 관리
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6">
        {tab === "results" && (
          <>
            {/* Filters */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <select
                  value={filterExam}
                  onChange={(e) => setFilterExam(e.target.value)}
                  className="px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="all">전체 회차</option>
                  {examSummaries.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.examNumber}회
                    </option>
                  ))}
                </select>
                <span className="text-sm text-slate-500">
                  {filteredSubmissions.length}건
                </span>
              </div>
              <button
                onClick={exportCSV}
                className="px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
              >
                CSV 내보내기
              </button>
            </div>

            {/* Results Table */}
            {loading ? (
              <p className="text-center text-slate-500 py-12">로딩 중...</p>
            ) : filteredSubmissions.length === 0 ? (
              <p className="text-center text-slate-400 py-12">
                제출된 결과가 없습니다.
              </p>
            ) : (
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="text-left px-4 py-3 font-medium text-slate-600">
                        이름
                      </th>
                      <th className="text-center px-4 py-3 font-medium text-slate-600">
                        회차
                      </th>
                      <th className="text-center px-4 py-3 font-medium text-slate-600">
                        점수
                      </th>
                      <th className="text-left px-4 py-3 font-medium text-slate-600">
                        제출일시
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredSubmissions.map((s) => {
                      const pct = Math.round(
                        (s.score / s.totalQuestions) * 100
                      );
                      return (
                        <tr key={s.id} className="hover:bg-slate-50">
                          <td className="px-4 py-3 font-medium text-slate-800">
                            {s.studentName}
                          </td>
                          <td className="px-4 py-3 text-center text-slate-600">
                            {s.examNumber}회
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span
                              className={`font-semibold ${
                                pct >= 80
                                  ? "text-green-600"
                                  : pct >= 60
                                    ? "text-yellow-600"
                                    : "text-red-600"
                              }`}
                            >
                              {s.score}/{s.totalQuestions}
                            </span>
                            <span className="text-slate-400 ml-1 text-xs">
                              ({pct}%)
                            </span>
                          </td>
                          <td className="px-4 py-3 text-slate-500">
                            {formatDate(s.submittedAt)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}

        {tab === "answers" && (
          <div className="space-y-6">
            {/* Exam Selector */}
            <div className="flex items-center gap-3">
              <select
                value={selectedExam}
                onChange={(e) => {
                  setSelectedExam(e.target.value);
                  setOverrides({});
                }}
                className="px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {examSummaries.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.examNumber}회 - {e.title}
                  </option>
                ))}
              </select>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h2 className="font-semibold text-slate-800 mb-4">
                정답 오버라이드
              </h2>
              <p className="text-sm text-slate-500 mb-6">
                모델 학습 결과에 따라 달라지는 문항의 정답을 여기서 수정하세요.
                비워두면 기본 정답이 사용됩니다.
              </p>

              <div className="space-y-3">
                {examSummaries
                  .find((e) => e.id === selectedExam)
                  ? Array.from(
                      { length: examSummaries.find((e) => e.id === selectedExam)!.questionCount },
                      (_, i) => {
                        const qId = `${selectedExam}-q${i + 1}`;
                        return (
                          <div key={qId} className="flex items-center gap-3">
                            <span className="w-16 text-sm font-medium text-slate-600">
                              문항 {i + 1}
                            </span>
                            <input
                              type="text"
                              value={overrides[qId] ?? ""}
                              onChange={(e) =>
                                setOverrides((prev) => ({
                                  ...prev,
                                  [qId]: e.target.value,
                                }))
                              }
                              placeholder="기본값 사용"
                              className="flex-1 max-w-xs px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                          </div>
                        );
                      }
                    )
                  : null}
              </div>

              <button
                onClick={handleSaveOverrides}
                disabled={saving}
                className="mt-6 px-6 py-2.5 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
              >
                {saving ? "저장 중..." : "정답 저장"}
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
