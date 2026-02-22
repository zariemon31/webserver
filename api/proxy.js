export default async function handler(req, res) {
  console.log("proxy.js ver7.0 実行");

  const targetUrl = req.query.url || "https://ja.wikipedia.org/wiki/メインページ";

  try {
    const response = await fetch(targetUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0",
        "Accept-Language": "ja"
      }
    });

    if (!response.ok) {
      return res.status(500).send("取得に失敗しました（レスポンスエラー） ver7.0");
    }

    // Content-Type をそのまま返す（画像対応のため）
    const contentType = response.headers.get("content-type");
    res.setHeader("Content-Type", contentType);

    // バイナリも扱えるようにする
    const buffer = await response.arrayBuffer();
    res.status(200).send(Buffer.from(buffer));

  } catch (err) {
    res.status(500).send("取得に失敗しました（例外エラー） ver7.0");
  }
}
