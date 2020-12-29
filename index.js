const fetch = require('node-fetch')

const sendToChat = (chatId, text) => {
  fetch(`https://api.telegram.org/bot${process.env.BOT_TOKEN}/sendMessage?chat_id=${chatId}&text=${text}`)
    .then(res => res.text())
    .then(body => console.log(body))
}

const BUZZSPROUT_PODCAST_ID = 1319524

const fetchPodcastEpisodes = () => {
  fetch(`https://www.buzzsprout.com/api/${BUZZSPROUT_PODCAST_ID}/episodes.json`, {
    "method": "GET",
    "headers": {
      "Authorization": `Token token=${process.env.BUZZSPROUT_PODCAST_TOKEN}`,
    }
  })
    .then((res) => res.json())
    .catch(console.error.bind(console));
}

const createMessageResponse = async (text) => {
  switch (text.toLowerCase()) {
    case 'stats':
      const podcastEpisodes = await fetchPodcastEpisodes();
      return JSON.stringify(podcastEpisodes);
    default:
      return `ne demek ${text}?`
  }
}

const handler = (req, res) => {
  res.set('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') {
    res.set('Access-Control-Allow-Methods', 'GET');
    res.set('Access-Control-Allow-Headers', 'Content-Type');
    res.set('Access-Control-Max-Age', '3600');
    return res.status(204).send('');
  } else {
    try {
      const text = req.body.message.text;
      const chatId = req.body.message.chat.id
      if (text) {
        sendToChat(chatId, await createMessageResponse(text));
      } else {
        sendToChat(chatId, 'ne?');
      }
    } catch (e) {
      console.log(e)
      return res.status(500).send('FAILED')
    }
    return res.status(200).send('OK');
  }
}

exports.telegram = handler;