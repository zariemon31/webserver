const pc = new RTCPeerConnection();
let channel;

// ★ マウス座標を viewer に送る
function setupMouseControl() {
  const video = document.getElementById("remote");

  video.addEventListener("mousemove", e => {
    if (!channel || channel.readyState !== "open") return;

    const rect = video.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;

    channel.send(JSON.stringify({ type:"move", x, y }));
  });

  video.addEventListener("click", () => {
    if (!channel || channel.readyState !== "open") return;
    channel.send(JSON.stringify({ type:"click" }));
  });
}

async function poll() {
  const res = await fetch("/api/signal");
  const data = await res.json();

  if (data.offer && !pc.currentRemoteDescription) {
    await pc.setRemoteDescription(data.offer);

    // ★ 映像を受け取る
    pc.ontrack = e => {
      document.getElementById("remote").srcObject = e.streams[0];
    };

    // ★ DataChannel を受け取る
    pc.ondatachannel = ev => {
      channel = ev.channel;
      console.log("datachannel open");
      setupMouseControl();
    };

    // ★ answer を返す
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
