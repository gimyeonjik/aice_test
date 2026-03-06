import { NextRequest, NextResponse } from "next/server";
import { getExam } from "@/lib/exam-loader";
import { gradeAnswer } from "@/lib/grading";
import { saveSubmission, getAllSubmissions, getAnswerOverrides } from "@/lib/kv";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { studentName, examId, answers } = body;

    if (
      !studentName ||
      typeof studentName !== "string" ||
      !studentName.trim()
    ) {
      return NextResponse.json(
        { error: "이름을 입력해주세요." },
        { status: 400 }
      );
    }

    if (!examId || !/^exam-[4-8]$/.test(examId)) {
      return NextResponse.json(
        { error: "유효하지 않은 시험입니다." },
        { status: 400 }
      );
    }

    const exam = getExam(examId);
    if (!exam) {
      return NextResponse.json(
        { error: "시험을 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    // Get answer overrides from KV (gracefully falls back to {} if Redis not configured)
    const overrides = await getAnswerOverrides(examId);

    // Grade each question
    const gradedAnswers = exam.questions.map((question) => {
      const studentAnswer = answers?.[question.id] ?? null;
      const override = overrides[question.id];
      const isCorrect = gradeAnswer(question, studentAnswer, override);

      let correctAnswer: string | number;
      if (question.type === "action") {
        correctAnswer = "실습 완료";
      } else if (override) {
        correctAnswer = override;
      } else {
        correctAnswer = question.answer;
      }

      return {
        questionId: question.id,
        questionNumber: question.questionNumber,
        type: question.type,
        studentAnswer,
        correctAnswer,
        isCorrect,
      };
    });

    const score = gradedAnswers.filter((a) => a.isCorrect).length;
    const totalQuestions = exam.questions.length;

    const submission = {
      id: crypto.randomUUID(),
      studentName: studentName.trim(),
      examId,
      examNumber: exam.examNumber,
      answers: gradedAnswers,
      score,
      totalQuestions,
      submittedAt: new Date().toISOString(),
    };

    await saveSubmission(submission);

    return NextResponse.json({
      submissionId: submission.id,
      score,
      totalQuestions,
    });
  } catch (error) {
    console.error("Submission error:", error);

    const message =
      error instanceof Error && error.message.includes("환경변수")
        ? "서버 설정이 완료되지 않았습니다. 관리자에게 문의하세요."
        : "제출 처리 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const adminAuth = request.cookies.get("admin-auth")?.value;
  if (adminAuth !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json(
      { error: "인증이 필요합니다." },
      { status: 401 }
    );
  }

  try {
    const submissions = await getAllSubmissions();
    return NextResponse.json(submissions);
  } catch (error) {
    console.error("Get submissions error:", error);
    return NextResponse.json(
      { error: "데이터 조회 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
