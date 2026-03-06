import { NextRequest, NextResponse } from "next/server";
import { getAnswerOverrides, setAnswerOverrides } from "@/lib/kv";

function checkAuth(request: NextRequest): boolean {
  return request.cookies.get("admin-auth")?.value === process.env.ADMIN_PASSWORD;
}

export async function GET(request: NextRequest) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: "인증이 필요합니다." }, { status: 401 });
  }

  const examId = request.nextUrl.searchParams.get("examId");
  if (!examId) {
    return NextResponse.json({ error: "examId가 필요합니다." }, { status: 400 });
  }

  try {
    const overrides = await getAnswerOverrides(examId);
    return NextResponse.json(overrides);
  } catch (error) {
    console.error("Get answer overrides error:", error);
    return NextResponse.json({ error: "조회 중 오류 발생" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: "인증이 필요합니다." }, { status: 401 });
  }

  try {
    const { examId, overrides } = await request.json();
    if (!examId || !overrides) {
      return NextResponse.json({ error: "잘못된 요청입니다." }, { status: 400 });
    }

    await setAnswerOverrides(examId, overrides);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Set answer overrides error:", error);
    return NextResponse.json({ error: "저장 중 오류 발생" }, { status: 500 });
  }
}
