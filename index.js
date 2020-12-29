const fetch = require('node-fetch');
const { send } = require('process');
const bunyan = require('bunyan');
const { LoggingBunyan } = require('@google-cloud/logging-bunyan');

const loggingBunyan = new LoggingBunyan();

const logger = bunyan.createLogger({
  name: 'kulakshot-telegram-bot-node-logger',
  streams: [
    { stream: process.stdout, level: 'info' },
    loggingBunyan.stream('info'),
  ],
});


const sendToChat = (chatId, text) => {
  fetch(`https://api.telegram.org/bot${process.env.BOT_TOKEN}/sendMessage?chat_id=${chatId}&text=${encodeURIComponent(text)}`)
    .then(res => res.text())
    .then(body => logger.info(body));
}

const BUZZSPROUT_PODCAST_ID = 1319524
const BOT_NAME = 'KulakShowBot'

const fetchPodcastEpisodes = () =>
  fetch(`https://www.buzzsprout.com/api/${BUZZSPROUT_PODCAST_ID}/episodes.json`, {
    "method": "GET",
    "headers": {
      "Authorization": `Token token=${process.env.BUZZSPROUT_PODCAST_TOKEN}`,
    }
  })
    .then((res) => res.json())
    .catch(err => logger.error(err));


const createMessageResponse = (text) => {
  return new Promise((resolve, reject) => {
    const commandWithoutBotName = text.split(`@${BOT_NAME}`).join('').trim()
    switch (commandWithoutBotName) {
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
      logger.info(req.body)
      let text = req.body.text
      let chat = req.body.chat
      const message = req.body.message || {}
      if (!text) text = message.text;
      if (!chat) chat = message.chat;
      if (text) {
        createMessageResponse(text).then(messageResponse => sendToChat(chat.id, messageResponse))
      } else {
        sendToChat(chat.id, 'ne?');
      }
    } catch (e) {
      logger.error(e)
      return res.status(500).send('FAILED')
    }
    return res.status(200).send('OK');
  }
}

exports.telegram = handler;