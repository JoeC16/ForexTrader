const STORAGE_KEY = "_nr_uid";

function canvasHash(): string {
  try {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return "no-canvas";
    ctx.textBaseline = "top";
    ctx.font = "14px Arial";
    ctx.fillText("NeuralRender", 2, 2);
    return canvas.toDataURL().slice(-32);
  } catch {
    return "canvas-err";
  }
}

function fallbackFingerprint(): string {
  const parts = [
    canvasHash(),
    screen.width,
    screen.height,
    screen.colorDepth,
    new Date().getTimezoneOffset(),
    navigator.language,
    navigator.hardwareConcurrency ?? 0,
  ].join("|");
  let hash = 0;
  for (let i = 0; i < parts.length; i++) {
    hash = ((hash << 5) - hash + parts.charCodeAt(i)) | 0;
  }
  return `fp_${Math.abs(hash).toString(36)}`;
}

export function getOrCreateAnonId(): string {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return stored;

    const id = `nr_${crypto.randomUUID ? crypto.randomUUID().replace(/-/g, "") : Math.random().toString(36).slice(2)}`;
    localStorage.setItem(STORAGE_KEY, id);
    return id;
  } catch {
    return `nr_${fallbackFingerprint()}`;
  }
}

export function getSessionId(): string {
  const SESSION_KEY = "_nr_sid";
  try {
    const stored = sessionStorage.getItem(SESSION_KEY);
    if (stored) return stored;
    const id = `s_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
    sessionStorage.setItem(SESSION_KEY, id);
    return id;
  } catch {
    return `s_${Date.now().toString(36)}`;
  }
}
