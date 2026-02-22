let answer = null;

export default async function handler(req, res) {
  if (req.method === "POST") {
    answer = JSON.parse(req.body);
    res.status(200).json({ ok: true });
  } else {
    res.status(200).json({ answer });
  }
}
