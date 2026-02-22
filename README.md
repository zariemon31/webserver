# velcel - WebRTC Signaling Server on Vercel

velcel は、Vercel 上で動作する WebRTC 用の軽量シグナリングサーバーです。  
WebSocket を使わず、Vercel の API Routes（HTTP）だけで Offer/Answer を交換します。

- クライアントは **HTML 1ファイルだけで動作**
- 操作される側（Viewer）は **なんでもOK（HTML/アプリ/ブラウザ）**
- 中継サーバーは **Vercel にデプロイ可能**
- WebRTC の Offer/Answer を **自動交換**
- GitHub にそのまま公開できる構成

---

## 📁 プロジェクト構成
