self.addEventListener('push', function(event) {
  const data = event.data?.json() || {};
  const title = data.title || 'Dakikalık Niyet';
  const options = {
    body: data.body || 'Her dakika bir hatırlatma.',
    icon: '/icon.png',
    badge: '/badge.png'
  };
  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});
