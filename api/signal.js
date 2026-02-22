let offer = null;
let answer = null;

let candidates_viewer = [];
let candidates_client = [];

export default async function handler(req) {
  const url = new URL(req.url);
  const action = url.searchParams.get("action");

  const body = req.method === "POST" ? await req.text() : null;

  if (action === "offer") {
    offer = JSON.parse(body);
    answer = null;
    candidates_viewer = [];
    candidates_client = [];
    return new Response("ok");
  }

  if (action === "answer") {
    answer = JSON.parse(body);
    return new Response("ok");
  }

  if (action === "candidate_viewer") {
    candidates_viewer.push(JSON.parse(body));
    return new Response("ok");
  }

  if (action === "candidate_client") {
    candidates_client.push(JSON.parse(body));
    return new Response("ok");
  }

  return Response.json({
    offer,
    answer,
    candidates_viewer,
    candidates_client
  });
}
