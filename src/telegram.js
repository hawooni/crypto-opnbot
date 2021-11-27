const qs = require('qs')
const axios = require('axios')
const lodash = require('lodash')
const NodeCache = require('node-cache')

const MESSAGE = require('@config/message')
const SETTING = require('@config/setting')

const CB_ACTION_PRICE_SYMBOL = 'price-symbol'
const CB_ACTION_CHART_SYMBOL = 'chart-symbol'
const CB_ACTION_CHART_INTERVAL = 'chart-interval'
const CB_ACTION_CHART_STUDIES = 'chart-studies'

const CHART_IMG_API_KEY = process.env.CHART_IMG_API_KEY || null
const BOT_NAME = process.env.BOT_NAME || SETTING.BOT_NAME
const {
  THEME_IMG,
  DEFAULT_EXCHANGE,
  DEFAULT_SYMBOL,
  DEFAULT_PRICE_INTERVAL,
  DEFAULT_CHART_INTERVAL,
  DEFAULT_CHART_STUDIES,
  DEFAULT_TIMEZONE,
  INPUT_SYMBOLS,
  INPUT_SYMBOLS_COLUMN,
  PRICE_IMG_WIDTH,
  PRICE_IMG_HEIGHT,
  CHART_IMG_WIDTH,
  CHART_IMG_HEIGHT,
  CHART_INPUT_INTERVALS,
  CHART_INPUT_STUDIES,
  CHART_INPUT_STUDIES_COLUMN,
  API_CHART_IMG_BASE_URL,
} = SETTING

module.exports = (log, argv, version) => {
  const TelegramBot = require('node-telegram-bot-api')

  const chatLimit = new NodeCache({ stdTTL: 60 }) // rate limit ttl per minute
  const teleBot = new TelegramBot(argv.telegramToken, { polling: true })

  log.verbose('\nRunning Telegram Server ✓')

  if (CHART_IMG_API_KEY) {
    axios.defaults.headers.common['authorization'] = `Bearer ${CHART_IMG_API_KEY}`
  }

  axios.defaults.headers.common['user-agent'] = `cryptoOpnBot/${version}`

  teleBot.setMyCommands([
    {
      command: '/start',
      description: 'The introduction of CryptoOpnBot.',
    },
    {
      command: '/price',
      description: 'Show TradingView Mini Chart.',
    },
    {
      command: '/chart',
      description: 'Show TradingView Advanced Chart',
    },
    {
      command: '/example',
      description: 'Show examples of how to use each command.',
    },
  ])

  teleBot.on('message', (payload, meta) => {
    const { from, text } = payload
    const eSymbol = `${DEFAULT_EXCHANGE}:${DEFAULT_SYMBOL}`

    incrementChatCountLimit(from)

    Promise.resolve()
      .then(() => {
        if (meta.type === 'text') {
          if (isRateLimitExceed(from)) {
            log.debug(`:: debug :: ${from.first_name} :: ${MESSAGE.TOO_MANY_REQUEST}`)
            return teleBot.sendMessage(from.id, MESSAGE.TOO_MANY_REQUEST)
          } else if (isOkayToChat(from)) {
            if (text === '/start') {
              return teleBot.sendMessage(
                from.id,
                MESSAGE.TELEGRAM_START.replace('{{botName}}', BOT_NAME),
                {
                  parse_mode: 'HTML',
                }
              )
            } else if (text === '/price') {
              return axios
                .get(getPriceImgApiUrl(eSymbol), {
                  responseType: 'arraybuffer',
                })
                .then((res) =>
                  teleBot.sendPhoto(from.id, res.data, {
                    caption: getPriceCaption(eSymbol),
                    parse_mode: 'HTML',
                    reply_markup: {
                      inline_keyboard: getChunkInputKeys(
                        `${CB_ACTION_PRICE_SYMBOL}|`,
                        INPUT_SYMBOLS,
                        INPUT_SYMBOLS_COLUMN,
                        eSymbol
                      ),
                    },
                  })
                )
            } else if (text === '/chart') {
              return axios
                .get(getChartImgApiUrl(eSymbol), {
                  responseType: 'arraybuffer',
                })
                .then((res) =>
                  teleBot.sendPhoto(from.id, res.data, {
                    caption: getChartCaption(eSymbol),
                    parse_mode: 'HTML',
                    reply_markup: {
                      inline_keyboard: getChunkInputKeys(
                        `${CB_ACTION_CHART_SYMBOL}|`,
                        INPUT_SYMBOLS,
                        INPUT_SYMBOLS_COLUMN,
                        eSymbol
                      ),
                    },
                  })
                )
            } else if (text.startsWith('/price')) {
              const [eSymbol, interval] = text.split(' ').slice(1)

              return axios
                .get(getPriceImgApiUrl(eSymbol, interval), {
                  responseType: 'arraybuffer',
                })
                .then((res) =>
                  teleBot.sendPhoto(from.id, res.data, {
                    caption: getPriceCaption(eSymbol, interval),
                    parse_mode: 'HTML',
                  })
                )
            } else if (text.startsWith('/chart')) {
              const [eSymbol, interval, studies] = text.split(' ').slice(1)
              const splitStudies = studies?.split(',')

              return axios
                .get(getChartImgApiUrl(eSymbol, interval, splitStudies), {
                  responseType: 'arraybuffer',
                })
                .then((res) =>
                  teleBot.sendPhoto(from.id, res.data, {
                    caption: getChartCaption(eSymbol, interval, splitStudies),
                    parse_mode: 'HTML',
                  })
                )
            } else if (text.startsWith('/example')) {
              return teleBot.sendMessage(from.id, MESSAGE.TELEGRAM_EXAMPLE, {
                parse_mode: 'HTML',
              })
            } else {
              return teleBot.sendMessage(from.id, MESSAGE.INVALID_REQUEST)
            }
          } else {
            log.debug(`:: debug :: ${from.first_name} :: ignore message`)
          }
        } else {
          log.debug(`:: debug :: ${from.first_name} :: ignore non-text message`)
        }
      })
      .catch((error) => {
        log.error(error.message)
        if (error.response?.status === 422) {
          teleBot.sendMessage(from.id, MESSAGE.INVALID_REQUEST)
        } else {
          teleBot.sendMessage(from.id, error.message)
        }
      })
  })

  teleBot.on('callback_query', (cbQuery) => {
    const { from, message, data } = cbQuery
    const { chat, message_id } = message
    const inputArray = data.split('|')
    const [inputAction, inputExchangeSymbol] = inputArray

    incrementChatCountLimit(from)

    Promise.resolve()
      .then(() => {
        if (isRateLimitExceed(from)) {
          return teleBot.answerCallbackQuery(cbQuery.id, {
            text: MESSAGE.TOO_MANY_REQUEST,
            show_alert: true,
          })
        } else if (isOkayToChat(from)) {
          if (inputAction.startsWith('chart')) {
            const [inputInterval, inputStudies] = inputArray.slice(2)

            if (inputAction === CB_ACTION_CHART_SYMBOL) {
              return reqChartEditMsgPhoto(
                chat.id,
                message_id,
                [inputExchangeSymbol],
                getChunkInputKeys(
                  `${CB_ACTION_CHART_INTERVAL}|${inputExchangeSymbol}|`,
                  CHART_INPUT_INTERVALS,
                  undefined,
                  DEFAULT_CHART_INTERVAL
                )
              )
            } else if (inputAction === CB_ACTION_CHART_INTERVAL) {
              return reqChartEditMsgPhoto(
                chat.id,
                message_id,
                [inputExchangeSymbol, inputInterval],
                getChunkInputKeys(
                  `${CB_ACTION_CHART_STUDIES}|${inputExchangeSymbol}|${inputInterval}|`,
                  CHART_INPUT_STUDIES,
                  CHART_INPUT_STUDIES_COLUMN,
                  DEFAULT_CHART_STUDIES.toString()
                )
              )
            } else if (inputAction === CB_ACTION_CHART_STUDIES) {
              return reqChartEditMsgPhoto(
                chat.id,
                message_id,
                [inputExchangeSymbol, inputInterval, inputStudies.split(',')],
                getChunkInputKeys(
                  `${CB_ACTION_CHART_STUDIES}|${inputExchangeSymbol}|${inputInterval}|`,
                  CHART_INPUT_STUDIES,
                  CHART_INPUT_STUDIES_COLUMN,
                  inputStudies
                )
              )
            }
          } else if (inputAction.startsWith('price')) {
            return reqPriceEditMsgPhoto(
              chat.id,
              message_id,
              [inputExchangeSymbol],
              getChunkInputKeys(
                `${CB_ACTION_PRICE_SYMBOL}|`,
                INPUT_SYMBOLS,
                INPUT_SYMBOLS_COLUMN,
                inputExchangeSymbol
              )
            )
          }
        }
      })
      .catch((error) => {
        log.error(error.message)
        if (error.response?.status === 422) {
          teleBot.answerCallbackQuery(cbQuery.id, {
            text: MESSAGE.INVALID_REQUEST,
            show_alert: true,
          })
        } else {
          teleBot.answerCallbackQuery(cbQuery.id, { text: error.message, show_alert: true })
        }
      })
      .finally(() => {
        teleBot.answerCallbackQuery(cbQuery.id)
      })
  })

  teleBot.on('polling_error', (error) => {
    log.error(error.message)
    destruct()
  })

  teleBot.on('error', (error) => {
    log.error(error.message)
    destruct()
  })

  process.on('SIGINT', () => {
    log.debug(':: debug :: telegram server :: sigint')
    destruct()
  })

  /**
   * @param {Object} from eg. { id: 1234, is_bot: false, first_name: guest, language_code: 'en' }
   * @returns {Boolean}
   */
  function isOkayToChat(from) {
    const { TELEGRAM_ALLOW_BOT, TELEGRAM_WHITE_LIST_IDS } = SETTING

    if (!TELEGRAM_ALLOW_BOT && from.is_bot) {
      return false
    }
    if (TELEGRAM_WHITE_LIST_IDS.length > 0 && !TELEGRAM_WHITE_LIST_IDS.includes(from.id)) {
      return false
    }
    return true
  }

  /**
   * @param {Object} from
   * @returns {boolean}
   */
  function isRateLimitExceed(from) {
    return argv.rateLimit > 0 && chatLimit.get(from.id) > argv.rateLimit
  }

  /**
   * @param {String} eSymbol eg. 'BINANCE:BTCUSDT'
   * @param {String|null} interval  eg. '4h'
   * @param {String[]|null} studies eg. ['RSI', 'MACD', ...]
   * @returns
   */
  function getPriceImgApiUrl(eSymbol, interval = null) {
    return `${API_CHART_IMG_BASE_URL}/tradingview/mini-chart?${qs.stringify({
      symbol: eSymbol,
      interval: interval || DEFAULT_PRICE_INTERVAL,
      width: PRICE_IMG_WIDTH,
      height: PRICE_IMG_HEIGHT,
      theme: THEME_IMG,
    })}`
  }

  /**
   * @param {String} eSymbol eg. 'BINANCE:BTCUSDT'
   * @param {String|null} interval  eg. '4h'
   * @param {String[]|null} studies eg. ['RSI', 'MACD', ...]
   * @returns
   */
  function getChartImgApiUrl(eSymbol, interval = null, studies = null) {
    return `${API_CHART_IMG_BASE_URL}/tradingview/advanced-chart?${qs.stringify({
      symbol: eSymbol,
      interval: interval || DEFAULT_CHART_INTERVAL,
      studies: studies || DEFAULT_CHART_STUDIES,
      width: CHART_IMG_WIDTH,
      height: CHART_IMG_HEIGHT,
      theme: THEME_IMG,
      timezone: DEFAULT_TIMEZONE,
    })}`
  }

  /**
   * @param {String} eSymbol
   * @param {String} interval
   * @returns {String} price image caption
   */
  function getPriceCaption(eSymbol, interval = null) {
    return `${eSymbol.toUpperCase()} ${interval || DEFAULT_PRICE_INTERVAL}`
  }

  /**
   * @param {String} eSymbol
   * @param {String} interval
   * @param {String[]} studies
   * @returns {String} chart image caption
   */
  function getChartCaption(eSymbol, interval = null, studies = null) {
    const dInterval = interval || DEFAULT_CHART_INTERVAL
    const dStudies = studies || DEFAULT_CHART_STUDIES
    return `${eSymbol.toUpperCase()} ${dInterval} ${dStudies.toString()}`
  }

  /**
   * customized teleBot.editMessageMedia() to edit photo directly
   * ref: https://github.com/yagop/node-telegram-bot-api/issues/876
   *
   * @param {Integer} chatId
   * @param {Integer} msgId
   * @param {Array} inputs
   * @param {Object[]} inputKeys
   * @returns {Promise}
   */
  function reqPriceEditMsgPhoto(chatId, msgId, inputs, inputKeys) {
    const priceImgApiUrl = getPriceImgApiUrl(...inputs)

    return axios
      .get(priceImgApiUrl, {
        responseType: 'arraybuffer',
      })
      .then((res) => {
        const opt = getEditMsgPhotoOpt(chatId, msgId, res.data, {
          caption: getPriceCaption(...inputs),
          parse_mode: 'HTML',
        })
        if (inputKeys) {
          opt.qs.reply_markup = {
            inline_keyboard: inputKeys,
          }
        }
        return teleBot._request('editMessageMedia', opt)
      })
  }

  /**
   * @param {Integer} chatId
   * @param {Integer} msgId
   * @param {Array} inputs
   * @param {Object[]} inputKeys
   * @returns {Promise}
   */
  function reqChartEditMsgPhoto(chatId, msgId, inputs, inputKeys) {
    const chartImgApiUrl = getChartImgApiUrl(...inputs)

    return axios
      .get(chartImgApiUrl, {
        responseType: 'arraybuffer',
      })
      .then((res) => {
        const opt = getEditMsgPhotoOpt(chatId, msgId, res.data, {
          caption: getChartCaption(...inputs),
          parse_mode: 'HTML',
        })
        if (inputKeys) {
          opt.qs.reply_markup = {
            inline_keyboard: inputKeys,
          }
        }
        return teleBot._request('editMessageMedia', opt)
      })
  }

  /**
   * generate customized teleBot.editMessagePhotoOption
   *
   * @param {Integer} chatId
   * @param {Integer} msgId
   * @param {Data} photo
   * @param {Object} media
   * @returns {Object}
   */
  function getEditMsgPhotoOpt(chatId, msgId, photo, media) {
    const attachName = '0'
    const [formData] = teleBot._formatSendData(attachName, photo, {})

    return {
      qs: {
        chat_id: chatId,
        message_id: msgId,
        media: JSON.stringify(
          Object.assign(
            {
              type: 'photo',
              media: `attach://${attachName}`,
            },
            media
          )
        ),
      },
      formData: {
        [attachName]: formData[attachName],
      },
    }
  }

  /**
   * generate inline keyboard inputs
   *
   * @param {String} cbKey callback query data
   * @param {String[]|Object[]} values input text values
   * @param {Integer|null} limit inline keyboard column limit
   * @param {String|null} checkValue insert check char beside text value if match
   * @param {String} checkChar
   * @returns {Object[]} eg. [{ text: 'BTCUSDT', callback_data: 'chart-symbol|...|BTCUSDT' }]
   */
  function getChunkInputKeys(cbKey, values, limit = null, checkValue = null, checkChar = '✓') {
    const inputs = values.map((value) => {
      if (typeof value === 'object') {
        return {
          text: checkValue === value.value ? `${value.text} ${checkChar}` : value.text,
          callback_data: `${cbKey}${value.value}`,
        }
      } else {
        return {
          text: checkValue === value ? `${value} ${checkChar}` : value,
          callback_data: `${cbKey}${value}`,
        }
      }
    })
    return limit > 0 ? lodash.chunk(inputs, limit) : [inputs]
  }

  /**
   * @param {Object} from eg. { id: 1234, is_bot: false, first_name: guest, language_code: 'en' }
   */
  function incrementChatCountLimit(from) {
    const lastCount = chatLimit.get(from.id)

    if (lastCount) {
      chatLimit.set(from.id, lastCount + 1)
      log.debug(`:: debug :: ${from.first_name} :: increment chat count rateLimit :: ${lastCount + 1}`) // prettier-ignore
    } else {
      chatLimit.set(from.id, 1)
      log.debug(`:: debug :: ${from.first_name} :: increment chat count rateLimit :: 1`)
    }
  }

  /**
   * @returns {Promise}
   */
  function destruct() {
    log.debug(':: debug :: destruct()')
    log.warn('Closing Telegram Server...')
    return teleBot.stopPolling()
  }
}
