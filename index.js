const fetch = require('node-fetch');
const { send } = require('process');

const sendToChat = (chatId, text) => {
  fetch(`https://api.telegram.org/bot${process.env.BOT_TOKEN}/sendMessage?chat_id=${chatId}&text=${encodeURIComponent(text)}`)
    .then(res => res.text())
    .then(body => console.log(body));
}

const BUZZSPROUT_PODCAST_ID = 1319524

const fetchPodcastEpisodes = () =>
  fetch(`https://www.buzzsprout.com/api/${BUZZSPROUT_PODCAST_ID}/episodes.json`, {
    "method": "GET",
    "headers": {
      "Authorization": `Token token=${process.env.BUZZSPROUT_PODCAST_TOKEN}`,
    }
  })
    .then((res) => res.json())
    .catch(console.error.bind(console));


const createMessageResponse = (text) => {
  return new Promise((resolve, reject) => {
    switch (text.toLowerCase().split('/').join('')) {
      case 'stats':
        fetchPodcastEpisodes()
          .then(podcast => podcast.map(
            ({ title, total_plays }) => `${title} bölümü, ${total_plays} kere dinlenmiş.`)
            .join('\n')
          )
          .then(resolve)
        break;
      default:
        resolve(`ne demek ${text}?`);
        break;
    }
  })
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
      console.log(JSON.stringify(req.body, null, 2))
      const message = req.body.message || req.body.channel_post
      const text = message.text;
      const chatId = message.chat.id;
      if (text) {
        createMessageResponse(text).then(messageResponse => sendToChat(chatId, messageResponse))
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