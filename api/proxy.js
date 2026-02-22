export default async function handler(req, res) {
  const targetUrl =
    req.query.url || "https://paypayfleamarket.yahoo.co.jp/";
  console.log("proxy.js ver16.0:", targetUrl);

  let urlObj;
  try {
    urlObj = new URL(targetUrl);
  } catch {
    return res.status(400).send("不正な URL です ver16.0");
  }

  try {
    const response = await fetch(targetUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0",
        "Accept-Language": "ja"
      }
    });

    if (!response.ok) {
      return res.status(500).send("取得に失敗しました ver16.0");
    }

    const contentType = response.headers.get("content-type") || "";
    res.setHeader("Content-Type", contentType);

    const isHtml = contentType.includes("text/html");
    const buffer = Buffer.from(await response.arrayBuffer());

    // HTML 以外はそのまま返す（画像・CSS・JS・フォントなど）
    if (!isHtml) {
      return res.status(200).send(buffer);
    }

    // Shift_JIS などは「まず開ける」ことを優先してそのまま返す
    const charsetMatch = contentType.match(/charset=([^;]+)/i);
    const charset = charsetMatch ? charsetMatch[1].toLowerCase() : "utf-8";
    if (charset.includes("shift_jis") || charset.includes("sjis")) {
      // Abe のサイトなど：リンク書き換えは諦めて、とにかく表示させる
      return res.status(200).send(buffer);
    }

    // UTF-8 系だけリンクを書き換える
    let html = buffer.toString("utf-8");
    const origin = urlObj.origin;

    // 相対リンク href="/xxx" → proxy 経由
    html = html.replace(/href="\/([^"]*)"/g, (m, path) => {
      const abs = origin + "/" + path;
      return `href="/api/proxy?url=${encodeURIComponent(abs)}"`;
    });

    // プロトコル省略 href="//xxx" → https://xxx → proxy
    html = html.replace(/href="\/\/([^"]*)"/g, (m, host) => {
      const abs = "https://" + host;
      return `href="/api/proxy?url=${encodeURIComponent(abs)}"`;
    });

    // 絶対URL href="https://xxx" → proxy
    html = html.replace(/href="https?:\/\/([^"]*)"/g, (m) => {
      const url = m.slice(6, -1);
      return `href="/api/proxy?url=${encodeURIComponent(url)}"`;
    });

    // 画像 src="/xxx" → 絶対URL
    html = html.replace(/src="\/([^"]*)"/g, (m, path) => {
      return `src="${origin}/${path}"`;
    });

    // 画像 src="//xxx" → https://xxx
    html = html.replace(/src="\/\/([^"]*)"/g, (m, host) => {
      return `src="https://${host}"`;
    });

    res.status(200).send(`<!-- proxy.js ver16.0 -->\n${html}`);
  } catch (err) {
    console.error(err);
    res.status(500).send("取得に失敗しました ver16.0");
  }
}
