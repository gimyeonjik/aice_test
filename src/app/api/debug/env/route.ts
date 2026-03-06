import { NextResponse } from "next/server";

export async function GET() {
  const adminPw = process.env.ADMIN_PASSWORD;
  return NextResponse.json({
    ADMIN_PASSWORD_SET: !!adminPw,
    ADMIN_PASSWORD_LENGTH: adminPw?.length ?? 0,
    ADMIN_PASSWORD_VALUE: adminPw ?? "(not set)",
    KV_REST_API_URL_SET: !!process.env.KV_REST_API_URL,
  });
}
