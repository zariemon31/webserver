// vercal - WebRTC signaling server
const WebSocket = require("ws");
const wss = new WebSocket.Server({ port: 8080 });

let viewer = null;
let controller = null;

wss.on("connection", ws => {
  ws.on("message", msg => {
    const data = JSON.parse(msg);

    // 役割登録
    if (data.role === "viewer") viewer = ws;
    if (data.role === "controller") controller = ws;

    // viewer → controller
    if (data.to === "controller" && controller) {
      controller.send(JSON.stringify(data));
    }

    // controller → viewer
    if (data.to === "viewer" && viewer) {
      viewer.send(JSON.stringify(data));
    }
  });
});
