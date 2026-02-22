export default async function handler(req, res) {
  console.log("proxy.js ver6.0 実行");

  // URL パラメータから取得
  const targetUrl = req.query.url || "https://ja.wikipedia.org/wiki/メインページ";

  try {
    const response = await fetch(targetUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0",
        "Accept-Language": "ja"
      }
    });

    if (!response.ok) {
      return res.status(500).send("取得に失敗しました（レスポンスエラー） ver6.0");
    }

    const html = await response.text();

    const modifiedHtml = `
      <!-- proxy.js ver6.0 -->
      ${html}
    `;

    res.status(200).send(modifiedHtml);

  } catch (err) {
    res.status(500).send("取得に失敗しました（例外エラー） ver6.0");
  }
}
