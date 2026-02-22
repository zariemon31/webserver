export default async function handler(req, res) {
  const targetUrl = req.query.url || "https://www.yahoo.co.jp/";
  console.log("proxy.js ver11.0:", targetUrl);

  let urlObj;
  try {
    urlObj = new URL(targetUrl);
  } catch (e) {
    return res.status(400).send("不正な URL です ver11.0");
  }

  try {
    const response = await fetch(targetUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0",
        "Accept-Language": "ja"
      }
    });

    if (!response.ok) {
      return res.status(500).send("取得に失敗しました（レスポンスエラー） ver11.0");
    }

    const contentType = response.headers.get("content-type") || "";
    res.setHeader("Content-Type", contentType);

    // HTML 以外（画像・CSS・JS・フォントなど）はそのまま返す
    if (!contentType.includes("text/html")) {
      const buffer = await response.arrayBuffer();
      return res.status(200).send(Buffer.from(buffer));
    }

    let html = await response.text();
    const origin = urlObj.origin; // https://www.yahoo.co.jp

    // -------------------------
    // ① href="/xxx" → 絶対URL → proxy
    // -------------------------
    html = html.replace(/href="\/([^"]*)"/g, (match, path) => {
      const abs = origin + "/" + path;
      return `href="/api/proxy?url=${encodeURIComponent(abs)}"`;
    });

    // -------------------------
    // ② href="//xxx" → https://xxx → proxy
    // -------------------------
    html = html.replace(/href="\/\/([^"]*)"/g, (match, host) => {
      const abs = "https://" + host;
      return `href="/api/proxy?url=${encodeURIComponent(abs)}"`;
    });

    // -------------------------
    // ③ href="https://xxx" → proxy
    // -------------------------
    html = html.replace(/href="https?:\/\/([^"]*)"/g, (match) => {
      const url = match.slice(6, -1); // href=" と " を除く
      return `href="/api/proxy?url=${encodeURIComponent(url)}"`;
    });

    // -------------------------
    // ④ 画像 src="/xxx" → 絶対URL
    // -------------------------
    html = html.replace(/src="\/([^"]*)"/g, (match, path) => {
      return `src="${origin}/${path}"`;
    });

    // -------------------------
    // ⑤ 画像 src="//xxx" → https://xxx
    // -------------------------
    html = html.replace(/src="\/\/([^"]*)"/g, (match, host) => {
      return `src="https://${host}"`;
    });

    res.status(200).send(`<!-- proxy.js ver11.0 -->\n${html}`);

  } catch (err) {
    console.error(err);
    res.status(500).send("取得に失敗しました（例外エラー） ver11.0");
  }
}
