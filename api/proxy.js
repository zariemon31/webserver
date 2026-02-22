export default async function handler(req, res) {
  // バージョン確認用ログ
  console.log("proxy.js ver5.0 が実行されました");

  // Wikipedia のメインページ
  const targetUrl = "https://ja.wikipedia.org/wiki/%E3%83%A1%E3%82%A4%E3%83%B3%E3%83%9A%E3%83%BC%E3%82%B8";

  try {
    const response = await fetch(targetUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0",
        "Accept-Language": "ja"
      }
    });

    if (!response.ok) {
      return res.status(500).send("取得に失敗しました（レスポンスエラー） ver5.0");
    }

    const html = await response.text();

    // HTML の先頭にバージョンを埋め込む（反映確認用）
    const modifiedHtml = `
      <!-- proxy.js ver5.0 -->
      ${html}
    `;

    res.status(200).send(modifiedHtml);

  } catch (err) {
    res.status(500).send("取得に失敗しました（例外エラー） ver5.0");
  }
}
