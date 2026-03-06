import type { Question } from "@/types/exam";

export function gradeAnswer(
  question: Question,
  studentAnswer: string | number | null,
  answerOverride?: string
): boolean {
  if (question.type === "action") return true;

  if (studentAnswer === null || studentAnswer === "") return false;

  if (question.type === "mcq") {
    const correctAnswer = answerOverride
      ? parseInt(answerOverride, 10)
      : question.answer;
    const student =
      typeof studentAnswer === "string"
        ? parseInt(studentAnswer.trim(), 10)
        : studentAnswer;
    return student === correctAnswer;
  }

  if (question.type === "fill-in") {
    // Handle sub-fields (e.g., exam-7 q2 with data count + variable count)
    if (question.subFields && typeof studentAnswer === "string") {
      try {
        const subAnswers: string[] = JSON.parse(studentAnswer);
        return question.subFields.every((field, index) => {
          const overrideKey = answerOverride
            ? JSON.parse(answerOverride)[index]
            : undefined;
          return gradeNumeric(
            subAnswers[index],
            overrideKey ?? field.answer,
            field.answerType,
            0
          );
        });
      } catch {
        return false;
      }
    }

    const correctAnswer = answerOverride ?? question.answer;

    if (question.answerType === "integer") {
      return gradeNumeric(studentAnswer, correctAnswer, "integer", 0);
    }

    if (question.answerType === "float") {
      return gradeNumeric(
        studentAnswer,
        correctAnswer,
        "float",
        question.tolerance ?? 0
      );
    }

    if (question.answerType === "text") {
      const normalize = (s: string) =>
        s.toString().trim().toLowerCase().replace(/\s+/g, "");
      return normalize(studentAnswer.toString()) === normalize(correctAnswer);
    }
  }

  return false;
}

function gradeNumeric(
  student: string | number,
  correct: string,
  type: "integer" | "float",
  tolerance: number
): boolean {
  const studentNum = parseFloat(
    student.toString().replace(/,/g, "").trim()
  );
  const correctNum = parseFloat(correct.replace(/,/g, ""));

  if (isNaN(studentNum) || isNaN(correctNum)) return false;

  if (type === "integer") {
    return Math.round(studentNum) === Math.round(correctNum);
  }

  const absDiff = Math.abs(studentNum - correctNum);
  if (tolerance > 0) return absDiff <= tolerance;
  return absDiff < 0.0001;
}
