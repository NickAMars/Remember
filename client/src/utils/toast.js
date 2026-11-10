let activeToast = null;

export function showToast(message, duration = 3000) {
  if (activeToast) {
    activeToast.remove();
  }
  const el = document.createElement('div');
  el.className = 'toast';
  el.textContent = message;
  document.body.appendChild(el);
  activeToast = el;
  setTimeout(() => {
    if (el.parentNode) el.remove();
    if (activeToast === el) activeToast = null;
  }, duration);
}
