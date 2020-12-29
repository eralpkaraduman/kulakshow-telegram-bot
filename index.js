const rp = require('request-promise');

const sendToChat = (chat_id, text) => {
  return rp({
    method: 'GET',
    uri: `https://api.telegram.org/bot${process.env.BOT_TOKEN}/sendMessage`,
    qs: {
      chat_id,
      text
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
      if (text) {
        sendToChat(body.message.chat.chat_id, body.message.text);
      } else {
        sendToChat(body.message.chat.chat_id, body.message.text);
      }
    } catch (e) {
      return res.status(500).send(JSON.stringify(e))
    }
    return res.status(200).send('OK');
  }

}


exports.telegram = handler;