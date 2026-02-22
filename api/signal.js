let offer = null;
let answer = null;

export default async function handler(req, res) {
  const { action } = req.query;

  if (req.method === "POST") {
    const body = JSON.parse(req.body);

    if (action === "offer") {
      offer = body;
      return res.status(200).json({ ok: true });
    }

    if (action === "answer") {
      answer = body;
      return res.status(200).json({ ok: true });
    }
  }

  if (req.method === "GET") {
    return res.status(200).json({ offer, answer });
  }

  res.status(405).end();
}
