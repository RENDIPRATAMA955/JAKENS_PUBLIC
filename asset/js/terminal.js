/* ==================== */
/* TERMINAL MODAL       */
/* ==================== */

function openTerminalModal() {
  const modal = document.getElementById('terminalModal');
  if (modal) {
    modal.classList.remove('hidden');
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
  }
}

function closeTerminalModal() {
  const modal = document.getElementById('terminalModal');
  if (modal) {
    modal.style.display = 'none';
    document.body.style.overflow = '';
  }
}

// Tutup modal saat klik di luar konten
document.addEventListener('click', function(e) {
  const modal = document.getElementById('terminalModal');
  if (modal && e.target === modal) {
    closeTerminalModal();
  }
});

// Tutup modal dengan tombol ESC
document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') {
    closeTerminalModal();
  }
});
