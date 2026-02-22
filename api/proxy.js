export default async function handler(req, res) {
  console.log("proxy.js ver8.0 実行");

  const targetUrl = req.query.url || "https://ja.wikipedia.org/wiki/メインページ";

  try {
    const response = await fetch(targetUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0",
        "Accept-Language": "ja"
      }
    });

    if (!response.ok) {
      return res.status(500).send("取得に失敗しました（レスポンスエラー） ver8.0");
    }

    let html = await response.text();

    // 画像・CSS・JS などはそのまま返す
    const contentType = response.headers.get("content-type") || "";
    if (!contentType.includes("text/html")) {
      const buffer = await response.arrayBuffer();
      res.setHeader("Content-Type", contentType);
      return res.status(200).send(Buffer.from(buffer));
    }

    // HTML のリンクを書き換える
    html = html.replace(/href="\/([^"]*)"/g, (match, path) => {
      const newUrl = "https://ja.wikipedia.org/" + path;
      return `href="/api/proxy?url=${encodeURIComponent(newUrl)}"`;
    });

    // 絶対URLのリンクも書き換える
    html = html.replace(/href="https:\/\/([^"]*)"/g, (match, url) => {
      return `href="/api/proxy?url=${encodeURIComponent("https://" + url)}"`;
    });

    // HTML を返す
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.status(200).send(`<!-- proxy.js ver8.0 -->\n${html}`);

  } catch (err) {
    res.status(500).send("取得に失敗しました（例外エラー） ver8.0");
  }
}
