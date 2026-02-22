import iconv from "iconv-lite";

export default async function handler(req, res) {
  const targetUrl = req.query.url || "http://abehiroshi.la.coocan.jp/";
  console.log("proxy.js ver14.0:", targetUrl);

  let urlObj;
  try {
    urlObj = new URL(targetUrl);
  } catch (e) {
    return res.status(400).send("不正な URL です ver14.0");
  }

  try {
    const response = await fetch(targetUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0",
        "Accept-Language": "ja"
      }
    });

    if (!response.ok) {
      return res.status(500).send("取得に失敗しました（レスポンスエラー） ver14.0");
    }

    const contentType = response.headers.get("content-type") || "";
    res.setHeader("Content-Type", contentType);

    // HTML 以外はそのまま返す（画像・CSS・JS）
    if (!contentType.includes("text/html")) {
      const buffer = await response.arrayBuffer();
      return res.status(200).send(Buffer.from(buffer));
    }

    // 文字コード判定
    const charsetMatch = contentType.match(/charset=([^;]+)/i);
    const charset = charsetMatch ? charsetMatch[1].toLowerCase() : "utf-8";

    // バイナリ取得
    const buffer = Buffer.from(await response.arrayBuffer());

    // Shift_JIS → UTF-8 に変換
    let html;
    if (charset.includes("shift_jis") || charset.includes("sjis")) {
      html = iconv.decode(buffer, "shift_jis");
    } else {
      html = buffer.toString("utf-8");
    }

    const origin = urlObj.origin;

    // ---- ここからリンク書き換え（前の ver13.0 と同じ） ----

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

    html = html.replace(/src="\/([^"]*)"/g, (m, path) => {
      return `src="${origin}/${path}"`;
    });

    html = html.replace(/src="\/\/([^"]*)"/g, (m, host) => {
      return `src="https://${host}"`;
    });

    res.status(200).send(`<!-- proxy.js ver14.0 -->\n${html}`);

  } catch (err) {
    console.error(err);
    res.status(500).send("取得に失敗しました（例外エラー） ver14.0");
  }
}
