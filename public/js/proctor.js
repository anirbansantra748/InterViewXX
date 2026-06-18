/**
 * InterViewXX Assessment Proctoring Script
 * Tracks tab switching, focus loss, and copy-paste blocks.
 * Records values in hidden inputs to submit to the database.
 */

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('roundForm') || document.getElementById('aptitudeForm');
  if (!form) return;

  // 1. Create hidden fields to store proctoring data
  const metrics = {
    tabSwitches: 0,
    copyPasteAttempts: 0,
    windowBlurs: 0
  };

  Object.keys(metrics).forEach(key => {
    const input = document.createElement('input');
    input.type = 'hidden';
    input.name = `proctor_${key}`;
    input.id = `proctor_${key}`;
    input.value = '0';
    form.appendChild(input);
  });

  // Create style element for proctoring toasts
  const style = document.createElement('style');
  style.textContent = `
    .proctor-toast-container {
      position: fixed;
      top: 20px;
      left: 50%;
      transform: translateX(-50%);
      z-index: 99999;
      pointer-events: none;
      display: flex;
      flex-direction: column;
      gap: 10px;
      width: 90%;
      max-width: 450px;
    }
    .proctor-toast {
      background: #1f2226;
      border: 1.5px solid #4ad2b6;
      border-radius: 8px;
      color: #e5e7eb;
      padding: 12px 18px;
      font-size: 13px;
      font-family: 'JetBrains Mono', monospace;
      font-weight: 500;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.5), 0 0 15px rgba(74, 210, 182, 0.2);
      text-transform: uppercase;
      letter-spacing: 0.05em;
      opacity: 0;
      transform: translateY(-20px);
      transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    }
    .proctor-toast.show {
      opacity: 1;
      transform: translateY(0);
    }
  `;
  document.head.appendChild(style);

  // Toast container
  const container = document.createElement('div');
  container.className = 'proctor-toast-container';
  document.body.appendChild(container);

  function triggerProctorAlert(message) {
    const toast = document.createElement('div');
    toast.className = 'proctor-toast';
    toast.textContent = message;
    container.appendChild(toast);

    // Reflow
    toast.offsetHeight;

    // Show
    toast.classList.add('show');

    // Remove
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => {
        toast.remove();
      }, 300);
    }, 4000);
  }

  // 2. Track Tab Switch (visibilitychange)
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
      metrics.tabSwitches++;
      const el = document.getElementById('proctor_tabSwitches');
      if (el) el.value = metrics.tabSwitches.toString();
      
      triggerProctorAlert(`⚠️ Warning: Tab switch detected! Event logged. (Count: ${metrics.tabSwitches})`);
    }
  });

  // 3. Track Window Blurs (unfocused window)
  window.addEventListener('blur', () => {
    metrics.windowBlurs++;
    const el = document.getElementById('proctor_windowBlurs');
    if (el) el.value = metrics.windowBlurs.toString();

    triggerProctorAlert(`⚠️ Warning: Window lost focus! Event logged. (Count: ${metrics.windowBlurs})`);
  });

  // 4. Block Copy & Paste in Editor/Forms
  document.addEventListener('copy', (e) => {
    e.preventDefault();
    metrics.copyPasteAttempts++;
    const el = document.getElementById('proctor_copyPasteAttempts');
    if (el) el.value = metrics.copyPasteAttempts.toString();

    triggerProctorAlert(`⚠️ Warning: Copying text is restricted during test!`);
  });

  document.addEventListener('paste', (e) => {
    e.preventDefault();
    metrics.copyPasteAttempts++;
    const el = document.getElementById('proctor_copyPasteAttempts');
    if (el) el.value = metrics.copyPasteAttempts.toString();

    triggerProctorAlert(`⚠️ Warning: Pasting text is restricted during test!`);
  });
});
