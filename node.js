const webpush = require('web-push');
const subscriptions = []; // Aboneleri burada saklayabilirsin

webpush.setVapidDetails(
  'mailto:ottomaninci@gmail.com',
  '<BNUy6DXN6O4UUTXr1lPb-KhLhgHb7plTk_r1y0mjpCfBweF9MUG4vwvnR25FKENAd9FvC87icQ-gQQHIN3GaETY>',
  '<58itBGV_dP-TzQYwZ0VqxprkDK00X8ECy8bqZdZ1T0k>'
);

const messages = [
  'LIGHT niyeti: Saflık',
  'LIGHT niyeti: Sabır',
  'LIGHT niyeti: Şükür',
  'LIGHT niyeti: Arınma',
  'LIGHT niyeti: Teslimiyet'
];

let index = 0;

setInterval(() => {
  const payload = JSON.stringify({
