// server.js
import http from "http";

let offer = null;
let answer = null;
let candidates_viewer = [];
let candidates_client = [];

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, "http://localhost");
  const action = url.searchParams.get("action");

  if (req.method === "POST") {
    const body = await new Promise(r => {
      let d = "";
      req.on("data", c => d += c);
      req.on("end", () => r(d));
    });

    if (action === "offer") {
      offer = JSON.parse(body);
      answer = null;
      candidates_viewer = [];
      candidates_client = [];
      res.writeHead(200); res.end("ok"); return;
    }

    if (action === "answer") {
      answer = JSON.parse(body);
      res.writeHead(200); res.end("ok"); return;
    }

    if (action === "candidate_viewer") {
      candidates_viewer.push(JSON.parse(body));
      res.writeHead(200); res.end("ok"); return;
    }

    if (action === "candidate_client") {
      candidates_client.push(JSON.parse(body));
      res.writeHead(200); res.end("ok"); return;
    }
  }

  // GET /signal
  if (url.pathname === "/signal") {
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({
      offer,
      answer,
      candidates_viewer,
      candidates_client
    }));
    return;
  }

  res.writeHead(404); res.end("not found");
});

server.listen(3000, () => {
  console.log("signaling server on http://localhost:3000");
});
