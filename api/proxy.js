export default async function handler(req, res) {
  const targetUrl =
    req.query.url || "https://www.yahoo.co.jp/";
  console.log("proxy.js ver21.0:", targetUrl);

  let urlObj;
  try {
    urlObj = new URL(targetUrl);
  } catch {
    return res.status(400).send("不正な URL です ver21.0");
  }

  try {
    const response = await fetch(targetUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0",
        "Accept-Language": "ja"
      }
    });

    if (!response.ok) {
      return res.status(500).send("取得に失敗しました ver21.0");
    }

    const contentType = response.headers.get("content-type") || "";
    res.setHeader("Content-Type", contentType);

    const isHtml = contentType.includes("text/html");
    const buffer = Buffer.from(await response.arrayBuffer());

    // HTML 以外はそのまま返す
    if (!isHtml) {
      return res.status(200).send(buffer);
    }

    // Shift_JIS は書き換えせずそのまま返す（まず開けることを優先）
    const charsetMatch = contentType.match(/charset=([^;]+)/i);
    const charset = charsetMatch ? charsetMatch[1].toLowerCase() : "utf-8";
    if (charset.includes("shift_jis") || charset.includes("sjis")) {
      return res.status(200).send(buffer);
    }

    // UTF-8 の HTML を書き換え
    let html = buffer.toString("utf-8");
    const origin = urlObj.origin;

    // -------------------------
    // ① Yahoo検索フォームの action を proxy に書き換え
    // -------------------------
    html = html.replace(
      /<form([^>]*?)action="\/([^"]*)"/g,
      (m, before, path) => {
        const abs = origin + "/" + path;
        return `<form${before}action="/api/proxy?url=${encodeURIComponent(abs)}"`;
      }
    );

    // -------------------------
    // ② 相対リンク href="/xxx"
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
    // ⑤ 画像 src="/xxx"
    // -------------------------
    html = html.replace(/src="\/([^"]*)"/g, (m, path) => {
      return `src="${origin}/${path}"`;
    });

    // -------------------------
    // ⑥ 画像 src="//xxx"
    // -------------------------
    html = html.replace(/src="\/\/([^"]*)"/g, (m, host) => {
      return `src="https://${host}"`;
    });

    res.status(200).send(`<!-- proxy.js ver21.0 -->\n${html}`);
  } catch (err) {
    console.error(err);
    res.status(500).send("取得に失敗しました ver21.0");
  }
}
