(() => {
  const envelope = document.getElementById("envelope");
  const stage = document.getElementById("stage");
  const lockedCard = document.getElementById("lockedCard");
  const subText = document.getElementById("subText");
  const statusLine = document.getElementById("statusLine");
  const replayBtn = document.getElementById("replayBtn");

  const petals = Array.from(document.querySelectorAll(".petal"));
  const petalTexts = Array.from(document.querySelectorAll(".petal .petalText"));

  const LINES = [
    "Waiting to cook for you 💗",
    "Waiting to feed you with my hands 😊",
    "Waiting to massage your legs 🫶",
    "Waiting to massage your hair ☀️",
    "Waiting to see Auroras with you 😌",
    "Waiting to share every moment wth you 🌸"
  ];

  const hasStore = typeof getState === "function";
  const readState = () => (hasStore ? getState() : {});

  function isUnlocked() {
    const st = readState();
    return !!st.leafNotesDone; // set by leaf-notes.js [1](https://microsoftapc-my.sharepoint.com/personal/ajithsareddy_microsoft_com/Documents/Microsoft%20Copilot%20Chat%20Files/leaf-notes.js)
  }

  function setStatus(msg) {
    statusLine.textContent = msg || "";
  }

  function openEnvelope() {
    envelope.classList.add("is-open");
    subText.textContent = "Tap each petal to unfold it 🌸";
    setStatus("Tap a petal to reveal a line…");
  }

  function closeEnvelope() {
    envelope.classList.remove("is-open");
    subText.textContent = "Tap the envelope to open it 💌";
    setStatus("");
  }

  function resetAll() {
    closeEnvelope();
    stage.classList.remove("is-complete");
    petals.forEach((p) => p.classList.remove("is-open"));
    setStatus("Reset ✅ Tap the envelope to open it again");
  }

  if (!envelope || !stage) return;

  // Gate
  if (!isUnlocked()) {
    stage.classList.add("is-hidden");
    lockedCard.classList.remove("is-hidden");
    subText.textContent = "One small step before the letter…";
    return;
  } else {
    lockedCard.classList.add("is-hidden");
    stage.classList.remove("is-hidden");
  }

  // Set text lines
  petalTexts.forEach((el, i) => (el.textContent = LINES[i] || "💗"));

  // Envelope open
  envelope.addEventListener("click", () => {
    if (!envelope.classList.contains("is-open")) openEnvelope();
  });

  envelope.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      if (!envelope.classList.contains("is-open")) openEnvelope();
    }
  });

  // Petal clicks
  petals.forEach((p) => {
    p.addEventListener("click", (e) => {
      e.stopPropagation();
      if (!envelope.classList.contains("is-open")) openEnvelope();

      p.classList.add("is-open");

      const opened = petals.filter((x) => x.classList.contains("is-open")).length;
      setStatus(`Petals opened: ${opened}/${petals.length}`);

      if (opened >= petals.length) {
        stage.classList.add("is-complete");
        setStatus("All petals opened 💗");
      }
    });
  });

  replayBtn?.addEventListener("click", resetAll);
})();