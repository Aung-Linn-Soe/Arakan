// SupabaseのエラーはErrorのインスタンスとは限らず、{message: "..."}という
// 素のオブジェクトの場合があるため、String()だけだと「[object Object]」になってしまう。
export function errorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  if (typeof err === "object" && err !== null && "message" in err) {
    return String((err as { message: unknown }).message);
  }
  return String(err);
}
