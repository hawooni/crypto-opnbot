const request = require('request-promise')
const TelebotAPI = require('node-telegram-bot-api')
const errors = require('node-telegram-bot-api/src/errors')

/**
 * override _request() to handle 403 with message
 * ref: https://github.com/yagop/node-telegram-bot-api/issues/798
 */
class TeleBotExt extends TelebotAPI {
  _request(_path, options = {}) {
    if (!this.token) {
      return Promise.reject(new errors.FatalError('Telegram Bot Token not provided!'))
    }
    if (this.options.request) {
      Object.assign(options, this.options.request)
    }
    if (options.form) {
      this._fixReplyMarkup(options.form)
    }
    if (options.qs) {
      this._fixReplyMarkup(options.qs)
    }

    options.method = 'POST'
    options.url = this._buildURL(_path)
    options.simple = false
    options.resolveWithFullResponse = true
    options.forever = true

    return request(options)
      .then((resp) => {
        let data
        try {
          data = resp.body = JSON.parse(resp.body)
        } catch (err) {
          throw new errors.ParseError(`Error parsing response: ${resp.body}`, resp)
        }

        if (data.ok) {
          return data.result
        }
        // override 403 to send out message
        if (data.error_code === 403) {
          const form = {
            chat_id: options.qs.chat_id,
            text: "Bot can't initiate a conversation with the user. Use a command to start again.",
            show_alert: true,
          }
          return super._request('sendMessage', { form })
        } else {
          throw new errors.TelegramError(`${data.error_code} ${data.description}`, resp)
        }
      })
      .catch((error) => {
        if (error.response) throw error
        throw new errors.FatalError(error)
      })
  }
}

module.exports = TeleBotExt
