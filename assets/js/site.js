// Shared accessible mobile navigation for every MAM Tours page.
const menuToggle = document.getElementById('menuToggle');
const navLinks = document.getElementById('navLinks');

if (menuToggle && navLinks) {
  function setMobileNavOpen(isOpen) {
    navLinks.classList.toggle('open', isOpen);
    menuToggle.setAttribute('aria-expanded', String(isOpen));
    menuToggle.setAttribute('aria-label', isOpen ? 'Close navigation' : 'Open navigation');
  }

  menuToggle.addEventListener('click', () => {
    setMobileNavOpen(!navLinks.classList.contains('open'));
  });

  navLinks.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => setMobileNavOpen(false));
  });

  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape' || !navLinks.classList.contains('open')) return;
    setMobileNavOpen(false);
    menuToggle.focus();
  });

  window.addEventListener('pageshow', () => setMobileNavOpen(false));
}
