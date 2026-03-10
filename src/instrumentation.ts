export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { startPrefetch } = await import("@/lib/prefetch");
    startPrefetch();
  }
}
