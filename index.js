const fetch = require('node-fetch')

const sendToChat = (chat_id, text) => {
  fetch(`https://api.telegram.org/bot${process.env.BOT_TOKEN}/sendMessage?chat_id=${chat_id}&text=${text}`)
    .then(res => res.text())
    .then(body => console.log(body))
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
        sendToChat(req.body.message.chat.chat_id, req.body.message.text);
      } else {
        sendToChat(req.body.message.chat.chat_id, req.body.message.text);
      }
    } catch (e) {
      console.log(e)
      return res.status(500).send('FAILED')
    }
    return res.status(200).send('OK');
  }

}

sendToChat('aaa1', 'aaaa2')

exports.telegram = handler;