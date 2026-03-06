import { Redis } from "@upstash/redis";
import type { Submission } from "@/types/submission";

function getRedis(): Redis {
  const url = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;

  if (!url || !token) {
    throw new Error(
      "Redis 환경변수가 설정되지 않았습니다. " +
      "Vercel 대시보드에서 Upstash Redis 통합을 추가하고 " +
      "KV_REST_API_URL, KV_REST_API_TOKEN 환경변수를 확인하세요."
    );
  }

  return new Redis({ url, token });
}

// ─── Submissions ───

export async function saveSubmission(submission: Submission): Promise<void> {
  const redis = getRedis();
  const pipeline = redis.pipeline();

  pipeline.set(`submission:${submission.id}`, JSON.stringify(submission));
  pipeline.zadd("submissions:index", {
    score: new Date(submission.submittedAt).getTime(),
    member: submission.id,
  });
  pipeline.sadd(`submissions:exam:${submission.examNumber}`, submission.id);

  await pipeline.exec();
}

export async function getSubmission(id: string): Promise<Submission | null> {
  const redis = getRedis();
  const data = await redis.get<string>(`submission:${id}`);
  if (!data) return null;
  return typeof data === "string"
    ? JSON.parse(data)
    : (data as unknown as Submission);
}

export async function getAllSubmissions(): Promise<Submission[]> {
  const redis = getRedis();
  const ids = await redis.zrange("submissions:index", 0, -1, { rev: true });
  if (!ids.length) return [];

  const pipeline = redis.pipeline();
  for (const id of ids) {
    pipeline.get(`submission:${id}`);
  }
  const results = await pipeline.exec();

  return results
    .filter(Boolean)
    .map((r) => {
      if (typeof r === "string") return JSON.parse(r) as Submission;
      return r as unknown as Submission;
    });
}

export async function deleteSubmission(id: string): Promise<void> {
  const submission = await getSubmission(id);
  if (!submission) return;

  const redis = getRedis();
  const pipeline = redis.pipeline();
  pipeline.del(`submission:${id}`);
  pipeline.zrem("submissions:index", id);
  pipeline.srem(`submissions:exam:${submission.examNumber}`, id);
  await pipeline.exec();
}

// ─── Answer Overrides ───

export async function getAnswerOverrides(
  examId: string
): Promise<Record<string, string>> {
  try {
    const redis = getRedis();
    const data = await redis.get<string>(`answers:override:${examId}`);
    if (!data) return {};
    return typeof data === "string"
      ? JSON.parse(data)
      : (data as unknown as Record<string, string>);
  } catch {
    // Redis가 설정되지 않은 경우 기본 정답 사용
    return {};
  }
}

export async function setAnswerOverrides(
  examId: string,
  overrides: Record<string, string>
): Promise<void> {
  const redis = getRedis();
  await redis.set(`answers:override:${examId}`, JSON.stringify(overrides));
}
