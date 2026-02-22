export default async function handler(req, res) {
  const targetUrl = req.query.url;
  if (!targetUrl) return res.status(400).send("URL がありません ver22.0");

  console.log("proxy.js ver22.0:", targetUrl);

  let urlObj;
  try {
    urlObj = new URL(targetUrl);
  } catch {
    return res.status(400).send("不正な URL です ver22.0");
  }

  try {
    const response = await fetch(targetUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0",
        "Accept-Language": "ja"
      }
    });

    const contentType = response.headers.get("content-type") || "";
    res.setHeader("Content-Type", contentType);

    const isHtml = contentType.includes("text/html");
    const buffer = Buffer.from(await response.arrayBuffer());

    // HTML 以外はそのまま返す
    if (!isHtml) {
      return res.status(200).send(buffer);
    }

    // Shift_JIS は書き換えせずそのまま返す（まず表示優先）
    const charsetMatch = contentType.match(/charset=([^;]+)/i);
    const charset = charsetMatch ? charsetMatch[1].toLowerCase() : "utf-8";
    if (charset.includes("shift_jis") || charset.includes("sjis")) {
      return res.status(200).send(buffer);
    }

    let html = buffer.toString("utf-8");
    const origin = urlObj.origin;

    // -------------------------
    // ① Yahoo検索フォームの action を強制書き換え
    // -------------------------
    html = html.replace(/<form([^>]*?)action="([^"]*)"/g, (m, before, action) => {
      let abs = action;

      // 相対パス → 絶対URL
      if (action.startsWith("/")) {
        abs = origin + action;
      }

      // プロトコル省略
      if (action.startsWith("//")) {
        abs = "https:" + action;
      }

      return `<form${before}action="/api/proxy?url=${encodeURIComponent(abs)}"`;
    });

    // -------------------------
    // ② 通常のリンク書き換え
    // -------------------------
    html = html.replace(/href="\/([^"]*)"/g, (m, path) => {
      const abs = origin + "/" + path;
      return `href="/api/proxy?url=${encodeURIComponent(abs)}"`;
    });

    html = html.replace(/href="\/\/([^"]*)"/g, (m, host) => {
      const abs = "https://" + host;
      return `href="/api/proxy?url=${encodeURIComponent(abs)}"`;
    });

    html = html.replace(/href="https?:\/\/([^"]*)"/g, (m) => {
      const url = m.slice(6, -1);
      return `href="/api/proxy?url=${encodeURIComponent(url)}"`;
    });

    // -------------------------
    // ③ 画像 src の補正
    // -------------------------
    html = html.replace(/src="\/([^"]*)"/g, (m, path) => {
      return `src="${origin}/${path}"`;
    });

    html = html.replace(/src="\/\/([^"]*)"/g, (m, host) => {
      return `src="https://${host}"`;
    });

    res.status(200).send(`<!-- proxy.js ver22.0 -->\n${html}`);

  } catch (err) {
    console.error(err);
    res.status(500).send("取得に失敗しました ver22.0");
  }
}
