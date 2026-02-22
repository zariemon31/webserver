export default async function handler(req, res) {
  console.log("proxy.js ver9.0 実行");

  const targetUrl = req.query.url || "https://ja.wikipedia.org/wiki/メインページ";

  try {
    const response = await fetch(targetUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0",
        "Accept-Language": "ja"
      }
    });

    if (!response.ok) {
      return res.status(500).send("取得に失敗しました（レスポンスエラー） ver9.0");
    }

    let html = await response.text();
    const contentType = response.headers.get("content-type") || "";

    // HTML 以外（画像・CSS・JS）はそのまま返す
    if (!contentType.includes("text/html")) {
      const buffer = await response.arrayBuffer();
      res.setHeader("Content-Type", contentType);
      return res.status(200).send(Buffer.from(buffer));
    }

    // ① 相対リンクを proxy に書き換え
    html = html.replace(/href="\/([^"]*)"/g, (match, path) => {
      const newUrl = "https://ja.wikipedia.org/" + path;
      return `href="/api/proxy?url=${encodeURIComponent(newUrl)}"`;
    });

    // ② 絶対リンクも proxy に書き換え
    html = html.replace(/href="https:\/\/([^"]*)"/g, (match, url) => {
      return `href="/api/proxy?url=${encodeURIComponent("https://" + url)}"`;
    });

    // ③ 画像 src="//..." を https:// に変換
    html = html.replace(/src="\/\/([^"]*)"/g, (match, url) => {
      return `src="https://${url}"`;
    });

    // ④ 画像 src="/..." を絶対 URL に変換
    html = html.replace(/src="\/([^"]*)"/g, (match, path) => {
      return `src="https://ja.wikipedia.org/${path}"`;
    });

    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.status(200).send(`<!-- proxy.js ver9.0 -->\n${html}`);

  } catch (err) {
    res.status(500).send("取得に失敗しました（例外エラー） ver9.0");
  }
}
