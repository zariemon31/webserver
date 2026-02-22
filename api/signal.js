import { put, del, get } from '@vercel/blob';

export const config = {
  runtime: 'edge'
};

export default async function handler(req) {
  const url = new URL(req.url);
  const action = url.searchParams.get("action");

  if (req.method === "POST") {
    const body = await req.text();

    if (action === "offer") {
      await put("offer.json", body, { contentType: "application/json" });
      await del("answer.json");
      await del("candidates_viewer.json");
      await del("candidates_client.json");
      return new Response("ok");
    }

    if (action === "answer") {
      await put("answer.json", body, { contentType: "application/json" });
      return new Response("ok");
    }

    if (action === "candidate_viewer") {
      const old = await get("candidates_viewer.json").catch(() => null);
      const arr = old ? JSON.parse(await old.text()) : [];
      arr.push(JSON.parse(body));
      await put("candidates_viewer.json", JSON.stringify(arr), { contentType: "application/json" });
      return new Response("ok");
    }

    if (action === "candidate_client") {
      const old = await get("candidates_client.json").catch(() => null);
      const arr = old ? JSON.parse(await old.text()) : [];
      arr.push(JSON.parse(body));
      await put("candidates_client.json", JSON.stringify(arr), { contentType: "application/json" });
      return new Response("ok");
    }
  }

  const offer = await get("offer.json").catch(() => null);
  const answer = await get("answer.json").catch(() => null);
  const candidates_viewer = await get("candidates_viewer.json").catch(() => null);
  const candidates_client = await get("candidates_client.json").catch(() => null);

  return Response.json({
    offer: offer ? JSON.parse(await offer.text()) : null,
    answer: answer ? JSON.parse(await answer.text()) : null,
    candidates_viewer: candidates_viewer ? JSON.parse(await candidates_viewer.text()) : [],
    candidates_client: candidates_client ? JSON.parse(await candidates_client.text()) : []
  });
}
