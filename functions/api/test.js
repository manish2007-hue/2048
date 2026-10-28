export async function onRequest(context) {
  return new Response(JSON.stringify({ status: "ok", message: "API functions are active!" }), {
    headers: { "Content-Type": "application/json" }
  });
}
