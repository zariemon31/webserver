document.getElementById("js").textContent = "OK";
document.getElementById("js").className = "ok";

const pc = new RTCPeerConnection();

pc.onicecandidate = e => {
  if (e.candidate) {
    fetch("/api/signal?action=candidate_client", {
      method: "POST",
      body: JSON.stringify(e.candidate)
    });
  }
};

pc.ontrack = e => {
  document.getElementById("remote").srcObject = e.streams[0];
  document.getElementById("video").textContent = "OK";
  document.getElementById("video").className = "ok";
};

pc.onconnectionstatechange = () => {
  if (pc.connectionState === "connected") {
    document.getElementById("rtc").textContent = "OK";
    document.getElementById("rtc").className = "ok";
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

  if (data.candidates_viewer) {
    for (const c of data.candidates_viewer) {
      pc.addIceCandidate(c);
    }
  }

  requestAnimationFrame(poll);
}

poll();
