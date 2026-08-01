if (window.location.protocol === 'file:') {
  const banner = document.createElement('div');
  banner.setAttribute('role', 'alert');
  banner.style.cssText =
    'position:fixed;inset:0;z-index:9999;background:#101216;color:#f3f1ea;' +
    'font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:0.95rem;' +
    'line-height:1.7;padding:2rem;overflow:auto;';
  banner.innerHTML =
    '<strong>This page needs to be served over http, not opened directly as a file.</strong><br><br>' +
    'In the project folder, run:<br>' +
    '<code style="color:#25f4ee;">npm run serve</code><br><br>' +
    'Then open <a href="http://localhost:4173" style="color:#25f4ee;">http://localhost:4173</a> in your browser.';
  document.body.appendChild(banner);
}
