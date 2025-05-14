import { up } from "@auth/d1-adapter";
import { getCloudflareContext } from "@opennextjs/cloudflare";

export const runtime = "edge";

export async function GET() {
  try {
    const context = await getCloudflareContext({ async: true });
    await up(context.env.DB);
    return new Response("Auth.js database tables created successfully", {
      status: 200,
    });
  } catch (e: unknown) {
    if (e instanceof Error) {
      const causeMessage = e.cause instanceof Error ? e.cause.message : String(e.cause);
      console.error("Database migration error:", causeMessage, e.message);
      return new Response(`Error creating Auth.js database tables: ${e.message}`, {
        status: 500,
      });
    }
    return new Response("Unknown error occurred", { status: 500 });
  }
}
