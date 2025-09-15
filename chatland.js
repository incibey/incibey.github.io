const uuid = 'user-' + Math.random().toString(36).substring(2, 8);
const ably = new Ably.Realtime('fp6SRg.uNydAw:PEDz1j6S5SqoyWDYbN3zJBreUqTB1CsVUxsmmiT2t88');
const kanal = ably.channels.get('chatland-mesajlar');

kanal.subscribe('mesaj', function(message) {
  const mesaj = message.data.text || '[Mesaj boş]';
  const kim = message.data.uuid || 'Anonim';
  const timestamp = new Date().toLocaleTimeString();

  const div = document.createElement('div');
  div.className = (kim === 'chatland') ? 'msg bot-msg' : 'msg';
  div.innerHTML = `<div>🧵 <b>${kim}</b>: ${mesaj}</div><div class="timestamp">${timestamp}</div>`;
  document.getElementById('chat-box').prepend(div);

  // 🤖 Chatland botu: GPT ile cevap üretimi
  if (kim !== 'chatland') {
    fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": "Bearer sk-proj-v1usiDDaFrzwLOEyKQqAdNhB-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: "Sen Chatland botusun. Türkçe konuşur, sembolik ve manevi cevaplar verirsin." },
          { role: "user", content: mesaj }
        ]
      })
    })
    .then(res => res.json())
    .then(data => {
      const botMesaj = data.choices?.[0]?.message?.content || '[Bot cevabı alınamadı]';
      kanal.publish('mesaj', {
        text: botMesaj,
        uuid: 'chatland'
      });
    })
    .catch(err => console.error("Bot hatası:", err));
  }
});

function mesajGonder() {
  const mesaj = document.getElementById('mesajInput').value.trim();
  if (!mesaj) return;

  kanal.publish('mesaj', {
    text: mesaj,
    uuid: uuid
  });

  document.getElementById('mesajInput').value = '';
           }
