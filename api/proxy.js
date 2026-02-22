export default async function handler(req, res) {
  const targetUrl = "https://example.com"; // まずはこれでテスト

  try {
    const response = await fetch(targetUrl);
    const html = await response.text();
    res.status(200).send(html);
  } catch (err) {
    res.status(500).send("取得に失敗しました");
  }
}
