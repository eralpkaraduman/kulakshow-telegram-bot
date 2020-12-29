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


/**
 * Responds to any HTTP request.
 *
 * @param {!express:Request} req HTTP request context.
 * @param {!express:Response} res HTTP response context.
 */
exports.telegram = (req, res) => {
  const body = JSON.parse(req.body);
  const { chat, text } = body.message;
  if (text) {
    sendToChat(chat.chat_id, text);
  } else {
    sendToChat(chat.chat_id, "huh?");
  }
  res.send('OK')
};
