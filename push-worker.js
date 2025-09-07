self[`appKey`] = `d6eb7a943621d59a3e0b4d431ea12266`;
self[`hostUrl`] = `https://cdn.gravitec.net/sw`;
self.importScripts(`${self[`hostUrl`]}/worker.js`);
// uncomment and set path to your service worker
// if you have one with precaching functionality (has oninstall, onactivate event listeners)
// self.importScripts('path-to-your-sw-with-precaching')

// Dakikalık bildirim tetikleyici (yalnızca aktifken çalışır)
self.addEventListener('activate', () => {
  startMinuteLoop();
});

function startMinuteLoop() {
  setInterval(() => {
    self.registration.showNotification('Dakikalık Bildirim', {
      body: 'Her dakika bir niyet, bir hatırlatma.',
      icon: '/icon.png',
      badge: '/badge.png'
    });
  }, 60000); // 60 saniye
}
