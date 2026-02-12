(() => {
  const TOTAL = 6;

  const NOTES = [
    "I remember my b'day bcoz of you, you make it special 💗",
    "I love how your smile brightens me up 😊",
    "Seeing your pic, makes me calm 🌿",
    "Even small moments with you feel like home 🫶",
    "You’re effortlessly adorable… the most beautiful ever 😌",
    "Your eyes when angry, are the prettiest they can ever be 🌸"
  ];

  const foundCountEl = document.getElementById("foundCount");
  const statusLine = document.getElementById("statusLine");
  const ctaLetter = document.getElementById("ctaLetter");
  const resetNotesBtn = document.getElementById("resetNotes");

  const modal = document.getElementById("noteModal");
  const backdrop = document.getElementById("modalBackdrop");
  const closeModalBtn = document.getElementById("closeModal");
  const okModalBtn = document.getElementById("okModal");
  const noteText = document.getElementById("noteText");

  const leafButtons = Array.from(document.querySelectorAll(".leafBtn"));

  // Use shared storage helpers if present
  const hasStore = (typeof getState === "function") && (typeof setState === "function");
  const readState = () => (hasStore ? getState() : {});
  const writeState = (patch) => (hasStore ? setState(patch) : patch);

  function getFoundSet() {
    const st = readState();
    const arr = Array.isArray(st.leafNotesFound) ? st.leafNotesFound : [];
    return new Set(arr.map(Number));
  }

  function saveFoundSet(set) {
    writeState({ leafNotesFound: Array.from(set).sort((a, b) => a - b) });
  }

  function updateUI() {
    if (!foundCountEl || !statusLine) return;

    const found = getFoundSet();
    const count = found.size;

    foundCountEl.textContent = `${count}/${TOTAL}`;

    leafButtons.forEach(btn => {
      const id = Number(btn.dataset.id);
      btn.classList.toggle("is-found", found.has(id));
    });

    if (ctaLetter) {
      if (count >= TOTAL) ctaLetter.classList.remove("is-hidden");
      else ctaLetter.classList.add("is-hidden");
    }

    if (count >= TOTAL) {
      statusLine.textContent = "All notes found ✅ A letter is waiting… 💌";
      writeState({ leafNotesDone: true });
    } else {
      statusLine.textContent = "Tap a leaf to find a message 🍃";
      writeState({ leafNotesDone: false });
    }
  }

  function openModal(text) {
    // If modal markup is missing, fallback to status text
    if (!modal || !noteText) {
      if (statusLine) statusLine.textContent = text;
      return;
    }
    noteText.textContent = text;
    modal.classList.remove("is-hidden");
  }

  function closeModal() {
    if (!modal) return;
    modal.classList.add("is-hidden");
  }

  // Click leaf → show note + mark found
  leafButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      const id = Number(btn.dataset.id);
      const found = getFoundSet();

      openModal(NOTES[id] || "💗");

      if (!found.has(id)) {
        found.add(id);
        saveFoundSet(found);
        updateUI();
      }
    });
  });

  // Modal close listeners (only if elements exist)
  backdrop?.addEventListener("click", closeModal);
  closeModalBtn?.addEventListener("click", closeModal);
  okModalBtn?.addEventListener("click", closeModal);

  // Reset notes
  resetNotesBtn?.addEventListener("click", () => {
    saveFoundSet(new Set());
    writeState({ leafNotesDone: false });
    updateUI();
    if (statusLine) statusLine.textContent = "Reset ✅ Start finding the notes again 🍃";
  });

  updateUI();
})();