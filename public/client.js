document.getElementById("jsStatus").textContent = "OK";
document.getElementById("jsStatus").className = "ok";

const pc = new RTCPeerConnection();
let channel;

// ★ DataChannel を受信
pc.ondatachannel = ev => {
  channel = ev.channel;
  console.log("datachannel open");
};

// ★ 映像を受信したら表示
pc.ontrack = e => {
  document.getElementById("remote").srcObject = e.streams[0];
  document.getElementById("videoStatus").textContent = "OK";
  document.getElementById("videoStatus").className = "ok";
};

// ★ WebRTC 接続状態を監視
pc.onconnectionstatechange = () => {
  if (pc.connectionState === "connected") {
    document.getElementById("rtcStatus").textContent = "OK";
    document.getElementById("rtcStatus").className = "ok";
  }
};

async function poll() {
  const res = await fetch("/api/signal");
  const data = await res.json();

  if (data.offer && !pc.currentRemoteDescription) {
    await pc.setRemoteDescription(data.offer);

    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);

    await fetch("/api/signal?action=answer", {
      method: "POST",
      body: JSON.stringify(answer)
    });
  }

  requestAnimationFrame(poll);
}

poll();
