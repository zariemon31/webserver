export default async function handler(req, res) {
  const targetUrl = req.query.url || "https://www.yahoo.co.jp/";
  console.log("proxy.js ver13.0:", targetUrl);

  let urlObj;
  try {
    urlObj = new URL(targetUrl);
  } catch (e) {
    return res.status(400).send("不正な URL です ver13.0");
  }

  try {
    const response = await fetch(targetUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0",
        "Accept-Language": "ja"
      }
    });

    if (!response.ok) {
      return res.status(500).send("取得に失敗しました（レスポンスエラー） ver13.0");
    }

    const contentType = response.headers.get("content-type") || "";
    res.setHeader("Content-Type", contentType);

    // HTML 以外はそのまま返す
    if (!contentType.includes("text/html")) {
      const buffer = await response.arrayBuffer();
      return res.status(200).send(Buffer.from(buffer));
    }

    let html = await response.text();
    const origin = urlObj.origin;

    // -------------------------
    // ① Yahoo検索フォームの action を書き換え
    // -------------------------
    html = html.replace(/<form([^>]*?)action="\/([^"]*)"/g, (m, before, path) => {
      const abs = origin + "/" + path;
      return `<form${before}action="/api/proxy?url=${encodeURIComponent(abs)}"`;
    });

    // -------------------------
    // ② 通常の相対リンク href="/xxx"
    // -------------------------
    html = html.replace(/href="\/([^"]*)"/g, (m, path) => {
      const abs = origin + "/" + path;
      return `href="/api/proxy?url=${encodeURIComponent(abs)}"`;
    });

    // -------------------------
    // ③ プロトコル省略 href="//xxx"
    // -------------------------
    html = html.replace(/href="\/\/([^"]*)"/g, (m, host) => {
      const abs = "https://" + host;
      return `href="/api/proxy?url=${encodeURIComponent(abs)}"`;
    });

    // -------------------------
    // ④ 絶対URL href="https://xxx"
    // -------------------------
    html = html.replace(/href="https?:\/\/([^"]*)"/g, (m) => {
      const url = m.slice(6, -1);
      return `href="/api/proxy?url=${encodeURIComponent(url)}"`;
    });

    // -------------------------
    // ⑤ onclick="location.href='/xxx'"
    // -------------------------
    html = html.replace(/location\.href='\/([^']*)'/g, (m, path) => {
      const abs = origin + "/" + path;
      return `location.href='/api/proxy?url=${encodeURIComponent(abs)}'`;
    });

    // -------------------------
    // ⑥ data-href="/xxx"
    // -------------------------
    html = html.replace(/data-href="\/([^"]*)"/g, (m, path) => {
      const abs = origin + "/" + path;
      return `data-href="/api/proxy?url=${encodeURIComponent(abs)}"`;
    });

    // -------------------------
    // ⑦ 画像 src="/xxx"
    // -------------------------
    html = html.replace(/src="\/([^"]*)"/g, (m, path) => {
      return `src="${origin}/${path}"`;
    });

    // -------------------------
    // ⑧ 画像 src="//xxx"
    // -------------------------
    html = html.replace(/src="\/\/([^"]*)"/g, (m, host) => {
      return `src="https://${host}"`;
    });

    res.status(200).send(`<!-- proxy.js ver13.0 -->\n${html}`);

  } catch (err) {
    console.error(err);
    res.status(500).send("取得に失敗しました（例外エラー） ver13.0");
  }
}
