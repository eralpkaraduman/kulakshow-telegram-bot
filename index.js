const fetch = require('node-fetch');
const bunyan = require('bunyan');
const { LoggingBunyan } = require('@google-cloud/logging-bunyan');

const loggingBunyan = new LoggingBunyan();

const logger = bunyan.createLogger({
  name: 'kulakshow-telegram-bot-node-logger',
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

const fetchPodcastEpisodes = () =>
  fetch(`https://www.buzzsprout.com/api/${process.env.BUZZSPROUT_PODCAST_ID}/episodes.json`, {
    "method": "GET",
    "headers": {
      "Content-Type": "application/json",
      "Authorization": `Token token=${process.env.BUZZSPROUT_PODCAST_TOKEN}`,
    }
  }).then(res => {
      if (res.status !== 200) {
        logger.error(`resposnse status code ${res.status}`)
      }
      return res
    })
    .then((res) => res.json())
    .catch(err => logger.error(err));


const createMessageResponse = (text) => {
  return new Promise((resolve) => {
    const filteredCommand = text
      .split(`@${process.env.BOT_NAME}`).join('')
      .split('/').join('');
    logger.info({
      text,
      filteredCommand
    })
    switch (filteredCommand) {
      case 'stats':
        fetchPodcastEpisodes()
          .then(podcast => `Total ${podcast.reduce((sum, {total_plays}) => sum + total_plays, 0)} 👂\n` + podcast.map(
            ({ title, total_plays }) => `${title}\n${total_plays} 👂`)
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
      const message = req.body.message || req.body.edited_message || {}
      if (!text) text = message.text;
      if (!chat) chat = message.chat;
      if (text) {
        sendToChat(chat.id, 'bakıyorum...')
        createMessageResponse(text).then(messageResponse => sendToChat(chat.id, messageResponse))
      } else {
        sendToChat(chat.id, 'ne?');
      }
    } catch (e) {
      sendToChat(chat.id, 'sıkıntı oldu')
      logger.error(e)
      return res.status(500).send('FAILED')
    }
    return res.status(200).send('OK');
  }
}

exports.telegram = handler;
exports.fetchPodcastEpisodes = () => fetchPodcastEpisodes().then(console.log)
