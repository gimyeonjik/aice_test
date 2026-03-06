import { NextRequest, NextResponse } from "next/server";
import { getSubmission } from "@/lib/kv";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const submission = await getSubmission(id);
    if (!submission) {
      return NextResponse.json(
        { error: "결과를 찾을 수 없습니다." },
        { status: 404 }
      );
    }
    return NextResponse.json(submission);
  } catch (error) {
    console.error("Get submission error:", error);
    return NextResponse.json(
      { error: "데이터 조회 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
