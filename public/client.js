const pc = new RTCPeerConnection();

async function poll() {
  const res = await fetch("/api/signal");
  const data = await res.json();

  if (data.offer && !pc.currentRemoteDescription) {
    await pc.setRemoteDescription(data.offer);

    pc.ontrack = e => {
      document.getElementById("remote").srcObject = e.streams[0];
    };

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
