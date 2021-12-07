const qs = require('qs')
const axios = require('axios')
const lodash = require('lodash')
const NodeCache = require('node-cache')

const MESSAGE = require('@config/message')

const CB_ACTION_PRICE_SYMBOL = 'price-symbol'
const CB_ACTION_CHART_SYMBOL = 'chart-symbol'
const CB_ACTION_CHART_INTERVAL = 'chart-interval'
const CB_ACTION_CHART_STUDIES = 'chart-studies'

module.exports = (log, argv, version, setting) => {
  const TelegramBot = require('@lib/telegram')

  const chatLimit = new NodeCache({ stdTTL: 60 }) // rate limit ttl per minute
  const teleBot = new TelegramBot(argv.telegramToken, { polling: true })

  const BOT_NAME = process.env.BOT_NAME || setting.BOT_NAME
  const CHART_IMG_API_KEY = process.env.CHART_IMG_API_KEY || null

  log.verbose('\nRunning Telegram Server ✓')

  if (CHART_IMG_API_KEY) {
    axios.defaults.headers.common['authorization'] = `Bearer ${CHART_IMG_API_KEY}`
  }

  axios.defaults.headers.common['user-agent'] = `cryptoOpnBot/${version}`

  teleBot.setMyCommands([
    {
      command: '/start',
      description: 'Start Message.',
    },
    {
      command: '/price',
      description: 'Mini Price Chart.',
    },
    {
      command: '/chart',
      description: 'Advanced Chart.',
    },
    {
      command: '/overview',
      description: 'Market Overview.',
    },
    {
      command: '/performance',
      description: 'Market Performance.',
    },
    {
      command: '/oscillators',
      description: 'Market Oscillators.',
    },
    {
      command: '/moving_avgs',
      description: 'Market Moving Averages.',
    },
    {
      command: '/example',
      description: 'Command examples.',
    },
  ])

  teleBot.on('message', (payload) => {
    const { from, text, chat } = payload
    const eSymbol = `${setting.DEFAULT_EXCHANGE}:${setting.DEFAULT_SYMBOL}`

    incrementChatCountLimit(from)

    Promise.resolve()
      .then(() => {
        if (isRateLimitExceed(from)) {
          log.debug(`:: debug :: ${from.first_name} :: ${MESSAGE.TOO_MANY_REQUEST}`)
          return teleBot.sendMessage(chat.id, MESSAGE.TOO_MANY_REQUEST)
        } else if (isOkayToChat(from)) {
          if (text === '/start') {
            return teleBot.sendMessage(
              chat.id,
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
                teleBot.sendPhoto(chat.id, res.data, {
                  caption: getPriceCaption(eSymbol),
                  parse_mode: 'HTML',
                  reply_markup: {
                    inline_keyboard: getChunkInputObjs(
                      CB_ACTION_PRICE_SYMBOL,
                      setting.INPUT_SYMBOLS,
                      setting.INPUT_SYMBOLS_COLUMN,
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
                teleBot.sendPhoto(chat.id, res.data, {
                  caption: getChartCaption(eSymbol),
                  parse_mode: 'HTML',
                  reply_markup: {
                    inline_keyboard: getChunkInputObjs(
                      CB_ACTION_CHART_SYMBOL,
                      setting.INPUT_SYMBOLS,
                      setting.INPUT_SYMBOLS_COLUMN,
                      eSymbol
                    ),
                  },
                })
              )
          } else if (text === '/overview') {
            return axios
              .get(getMktScreenerImgApiUrl('overview'), {
                responseType: 'arraybuffer',
              })
              .then((res) =>
                teleBot.sendPhoto(chat.id, res.data, {
                  caption: getMktScreenerCaption('overview'),
                  parse_mode: 'HTML',
                })
              )
          } else if (text === '/performance') {
            return axios
              .get(getMktScreenerImgApiUrl('performance'), {
                responseType: 'arraybuffer',
              })
              .then((res) =>
                teleBot.sendPhoto(chat.id, res.data, {
                  caption: getMktScreenerCaption('performance'),
                  parse_mode: 'HTML',
                })
              )
          } else if (text === '/oscillators') {
            return axios
              .get(getMktScreenerImgApiUrl('oscillators'), {
                responseType: 'arraybuffer',
              })
              .then((res) =>
                teleBot.sendPhoto(chat.id, res.data, {
                  caption: getMktScreenerCaption('oscillators'),
                  parse_mode: 'HTML',
                })
              )
          } else if (text === '/moving_avgs') {
            return axios
              .get(getMktScreenerImgApiUrl('moving_averages'), {
                responseType: 'arraybuffer',
              })
              .then((res) =>
                teleBot.sendPhoto(chat.id, res.data, {
                  caption: getMktScreenerCaption('moving_averages'),
                  parse_mode: 'HTML',
                })
              )
          } else if (text?.startsWith('/price')) {
            const [eSymbol, interval] = text.split(' ').slice(1)

            return axios
              .get(getPriceImgApiUrl(eSymbol, interval), {
                responseType: 'arraybuffer',
              })
              .then((res) =>
                teleBot.sendPhoto(chat.id, res.data, {
                  caption: getPriceCaption(eSymbol, interval),
                  parse_mode: 'HTML',
                })
              )
          } else if (text?.startsWith('/chart')) {
            const [eSymbol, interval, studies] = text.split(' ').slice(1)
            const splitStudies = studies?.split(setting.CHART_INPUT_STUDIES_SPLIT)

            return axios
              .get(getChartImgApiUrl(eSymbol, interval, splitStudies), {
                responseType: 'arraybuffer',
              })
              .then((res) =>
                teleBot.sendPhoto(chat.id, res.data, {
                  caption: getChartCaption(eSymbol, interval, splitStudies),
                  parse_mode: 'HTML',
                })
              )
          } else if (text?.startsWith('/example')) {
            return teleBot.sendMessage(chat.id, MESSAGE.TELEGRAM_EXAMPLE, {
              parse_mode: 'HTML',
            })
          } else {
            log.debug(`:: debug :: ${from.first_name} :: invalid request`)
            return teleBot.sendMessage(chat.id, MESSAGE.INVALID_REQUEST)
          }
        } else {
          log.debug(`:: debug :: ${from.first_name} :: ignore message`)
        }
      })
      .catch((error) => handleError(error, from, text))
  })

  teleBot.on('callback_query', (cbQuery) => {
    const { from, message, data } = cbQuery
    const { chat, message_id } = message
    const [cbKey, symbol, interval, studies] = data.split('|')

    incrementChatCountLimit(from)

    Promise.resolve()
      .then(() => {
        if (isRateLimitExceed(from)) {
          return teleBot.sendMessage(chat.id, MESSAGE.TOO_MANY_REQUEST)
        } else if (isOkayToChat(from)) {
          if (symbol) {
            if (cbKey === CB_ACTION_CHART_SYMBOL) {
              const inputs = getChunkInputValues(
                `${CB_ACTION_CHART_INTERVAL}|${symbol}`,
                setting.CHART_INPUT_INTERVALS,
                undefined,
                interval || setting.DEFAULT_CHART_INTERVAL
              )
              return reqChartEditMsgPhoto(chat.id, message_id, [symbol, interval], inputs)
            } else if (cbKey === CB_ACTION_CHART_INTERVAL) {
              const inputs = getChunkInputObjs(
                `${CB_ACTION_CHART_STUDIES}|${symbol}|${interval}`,
                setting.CHART_INPUT_STUDIES,
                setting.CHART_INPUT_STUDIES_COLUMN,
                setting.DEFAULT_CHART_STUDIES
              )
              return reqChartEditMsgPhoto(
                chat.id,
                message_id,
                [symbol, interval],
                getInputsInludeBack(inputs, `${CB_ACTION_CHART_SYMBOL}|${symbol}|${interval}`)
              )
            } else if (cbKey === CB_ACTION_CHART_STUDIES) {
              const arrStudies = studies.split(setting.CHART_INPUT_STUDIES_SPLIT)
              const inputs = getChunkInputObjs(
                `${CB_ACTION_CHART_STUDIES}|${symbol}|${interval}`,
                setting.CHART_INPUT_STUDIES,
                setting.CHART_INPUT_STUDIES_COLUMN,
                arrStudies
              )
              return reqChartEditMsgPhoto(
                chat.id,
                message_id,
                [symbol, interval, arrStudies],
                getInputsInludeBack(inputs, `${CB_ACTION_CHART_SYMBOL}|${symbol}|${interval}`)
              )
            } else if (cbKey === CB_ACTION_PRICE_SYMBOL) {
              return reqPriceEditMsgPhoto(
                chat.id,
                message_id,
                [symbol],
                getChunkInputObjs(
                  CB_ACTION_PRICE_SYMBOL,
                  setting.INPUT_SYMBOLS,
                  setting.INPUT_SYMBOLS_COLUMN,
                  symbol
                )
              )
            }
          } else {
            throw Error('Unable to get symbol from callback query.')
          }
        }
      })
      .catch((error) => handleError(error, from, data))
      .finally(() => teleBot.answerCallbackQuery(cbQuery.id))
  })

  teleBot.on('polling_error', (error) => {
    log.error(error.message)
    destruct()
  })

  teleBot.on('error', (error) => {
    log.error(error.message)
    destruct()
  })

  process.on('unhandledRejection', (error) => {
    log.error(error.message)
    log.level === 'debug' && console.error(error)
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
    if (!setting.TELEGRAM_ALLOW_BOT && from.is_bot) {
      return false
    }
    if (
      setting.TELEGRAM_WHITE_LIST_IDS.length > 0 &&
      !setting.TELEGRAM_WHITE_LIST_IDS.includes(from.id)
    ) {
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
   * @param {Boolean|true} size
   * @returns {String}
   */
  function getPriceImgApiUrl(eSymbol, interval = null, size = true) {
    const query = {
      symbol: eSymbol,
      interval: interval || setting.DEFAULT_PRICE_INTERVAL,
      theme: setting.THEME_IMG,
    }
    if (size) {
      query.width = setting.PRICE_IMG_WIDTH
      query.height = setting.PRICE_IMG_HEIGHT
    }
    return `${setting.API_CHART_IMG_BASE_URL}/tradingview/mini-chart?${qs.stringify(query)}`
  }

  /**
   * @param {String} eSymbol eg. 'BINANCE:BTCUSDT'
   * @param {String|null} interval  eg. '4h'
   * @param {String[]|null} studies eg. ['RSI', 'MACD', ...]
   * @param {Boolean|true} size
   * @returns {String}
   */
  function getChartImgApiUrl(eSymbol, interval = null, studies = null, size = true) {
    const query = {
      symbol: eSymbol,
      interval: interval || setting.DEFAULT_CHART_INTERVAL,
      studies: studies || setting.DEFAULT_CHART_STUDIES,
      theme: setting.THEME_IMG,
      timezone: setting.DEFAULT_TIMEZONE,
    }
    if (size) {
      query.width = setting.CHART_IMG_WIDTH
      query.height = setting.CHART_IMG_HEIGHT
    }
    return `${setting.API_CHART_IMG_BASE_URL}/tradingview/advanced-chart?${qs.stringify(query)}`
  }

  /**
   * @param {String} type
   * @returns {Object}
   */
  function getMktScreenerImgApiUrl(type) {
    return `${setting.API_CHART_IMG_BASE_URL}/tradingview/mkt-screener?${qs.stringify({
      type: type,
      list: setting.MKT_SCREENER_LIST,
      currency: setting.MKT_SCREENER_CURRENCY,
      theme: setting.THEME_IMG,
    })}`
  }

  /**
   * @param {String} eSymbol
   * @param {String} interval
   * @returns {String} price image caption
   */
  function getPriceCaption(eSymbol, interval = null) {
    const url = getPriceImgApiUrl(eSymbol, interval, false) // external to use default size
    return `<a href="${url}">${eSymbol.toUpperCase()} ${interval || setting.DEFAULT_PRICE_INTERVAL}</a>` // prettier-ignore
  }

  /**
   * @param {String} eSymbol
   * @param {String} interval
   * @param {String[]} studies
   * @returns {String} chart image caption
   */
  function getChartCaption(eSymbol, interval = null, studies = null) {
    const url = getChartImgApiUrl(eSymbol, interval, studies, false) // external to use default size
    const dInterval = interval || setting.DEFAULT_CHART_INTERVAL
    const dStudies = studies || setting.DEFAULT_CHART_STUDIES
    const studyIds = lodash.uniq(dStudies.map((dStudy) => dStudy.split(':')[0]))
    return `<a href="${url}">${eSymbol.toUpperCase()} ${dInterval} ${studyIds.toString()}</a>`
  }

  /**
   * @param {String} type
   * @returns {String}
   */
  function getMktScreenerCaption(type) {
    const url = getMktScreenerImgApiUrl(type)

    if (type === 'moving_averages') {
      return `<a href="${url}">Market Moving Averages Top ${setting.MKT_SCREENER_LIST}</a>`
    }
    return `<a href="${url}">Market ${ucfirst(type)} Top ${setting.MKT_SCREENER_LIST}</a>`
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
    const apiUrl = getPriceImgApiUrl(...inputs)

    return axios
      .get(apiUrl, {
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
   * @param {Object[]|null} inputKeys
   * @returns {Promise}
   */
  function reqChartEditMsgPhoto(chatId, msgId, inputs, inputKeys = null) {
    const apiUrl = getChartImgApiUrl(...inputs)

    return axios
      .get(apiUrl, {
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
   * @param {Object[]} inputs
   * @param {String} cbKey
   * @returns {Array}
   */
  function getInputsInludeBack(inputs, cbKey) {
    return [
      ...inputs,
      [
        {
          text: '« BACK',
          callback_data: cbKey,
        },
      ],
    ]
  }

  /**
   * generate inline keyboard inputs
   *
   * @param {String} cbKeys callback query keys
   * @param {String[]} values input texts
   * @param {Integer|null} limit inline keyboard column limit
   * @param {String|null} checkValue insert check char beside text value if match
   * @returns {Object[]} eg. [{ text: 'BTCUSDT', callback_data: 'price-symbol|BINANCE:BTCUSDT|...' }, ...]
   */
  function getChunkInputValues(cbKeys, values, limit = null, checkValue = null) {
    const inputs = values.map((value) => {
      return {
        text: checkValue === value ? `${value} ${setting.INPUT_CHECK_CHAR}` : value,
        callback_data: `${cbKeys}|${value}`,
      }
    })
    return limit > 0 ? lodash.chunk(inputs, limit) : [inputs]
  }

  /**
   * generate inline keyboard input objects
   *
   * @param {String} cbKey
   * @param {Object[]} objs
   * @param {Integer|null} limit
   * @param {String|null} checkValue
   * @returns {Object[]}
   */
  function getChunkInputObjs(cbKey, objs, limit = null, checkValue = null) {
    const inputs = objs.map((obj) => {
      if (Array.isArray(obj.value)) {
        return {
          text: checkValue.toString() === obj.value.toString() ? `${obj.text} ${setting.INPUT_CHECK_CHAR}` : obj.text, // prettier-ignore
          callback_data: `${cbKey}|${obj.value.join(setting.CHART_INPUT_STUDIES_SPLIT)}`,
        }
      } else {
        return {
          text: checkValue === obj.value ? `${obj.text} ${setting.INPUT_CHECK_CHAR}` : obj.text,
          callback_data: `${cbKey}|${obj.value}`,
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
   * capitalize first letter
   *
   * @param {String} string
   * @returns {String}
   */
  function ucfirst(string) {
    return string.charAt(0).toUpperCase() + string.slice(1)
  }

  /**
   * @param {Error} error
   * @param {Object} from
   * @param {*|null} data
   * @returns {Promise}
   */
  function handleError(error, from, data = null) {
    const logErrMsg = `${from.first_name} :: ${error.message}`

    data && log.debug(`:: debug :: ${data}`)

    return Promise.resolve().then(() => {
      if (error.response?.statusCode === 400) {
        log.debug(`:: debug :: ${logErrMsg}`) // telebot.req bad request by the user
      } else if (error.response?.status === 422) {
        log.debug(`:: debug :: ${logErrMsg} :: ${error.response?.data?.toString()}`)
        return teleBot.sendMessage(from.id, MESSAGE.INVALID_REQUEST) // axios.req invalid request
      } else {
        log.error(logErrMsg)
        return teleBot.sendMessage(from.id, 'Something Went Wrong. Please try again later.')
      }
    })
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
