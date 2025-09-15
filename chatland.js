<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="UTF-8">
  <title>🧵 Chatland Ably Mesaj Kutusu</title>
  <script src="https://cdn.ably.io/lib/ably.min-1.js"></script>
  <style>
    body { background: #111; color: #fff; font-family: monospace; padding: 20px; }
    #chat-box { max-width: 700px; margin: auto; border: 1px solid #333; padding: 10px; border-radius: 8px; background: #1a1a1a; min-height: 300px; overflow-y: auto; }
    .msg { margin: 10px 0; padding: 10px; border-radius: 5px; background: #222; color: #00FFAA; animation: fadeIn 0.4s ease; }
    .timestamp { font-size: 0.8em; color: #aaa; margin-top: 4px; }
    input, button { padding: 10px; margin: 10px 5px; font-family: monospace; border-radius: 5px; border: none; }
    input { width: 60%; background: #222; color: #fff; }
    button { background: #00FFAA; color: #111; cursor: pointer; }
    .bot-msg { background: #330033; color: #FF00AA; }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
  </style>
</head>
<body>
  <h2>🧵 Chatland Ably Mesaj Kutusu</h2>
  <input type="text" id="mesajInput" placeholder="Mesajını yaz..." />
  <button onclick="mesajGonder()">Gönder</button>
  <div id="chat-box"></div>

  <script src="chatland.js"></script>
</body>
</html>
