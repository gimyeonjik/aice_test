import { NextResponse } from "next/server";

export async function GET() {
  const adminPw = process.env.ADMIN_PASSWORD;
  return NextResponse.json({
    ADMIN_PASSWORD_SET: !!adminPw,
    ADMIN_PASSWORD_LENGTH: adminPw?.length ?? 0,
    ADMIN_PASSWORD_FIRST_CHAR: adminPw ? adminPw[0] + "***" : "(not set)",
    KV_REST_API_URL_SET: !!process.env.KV_REST_API_URL,
    KV_REST_API_TOKEN_SET: !!process.env.KV_REST_API_TOKEN,
    NODE_ENV: process.env.NODE_ENV,
  });
}
