require('dotenv').config()
require('module-alias/register')

const yargs = require('yargs')
const winston = require('@lib/winston')
const srvTelegram = require('@src/telegram')
const setting = require('@config/setting')
const { version } = require('./package.json')

const argv = yargs
  .usage('Usage: npm start -- --options')
  .option('telegramToken', {
    type: 'string',
    describe: 'Set Telegram API Token',
    default: process.env.TELEGRAM_TOKEN || null,
    demandOption: true,
  })
  .option('rateLimit', {
    type: 'number',
    describe: 'Set request rate limit',
    default: () =>
      parseInt(process.env.TELEGRAM_RATE_LIMIT_USER || setting.TELEGRAM_RATE_LIMIT_USER),
  })
  .option('log', {
    type: 'string',
    describe: 'Set log level',
    default: process.env.LOG || 'verbose',
  }).argv

const log = winston.createLogger({ level: argv.log })

log.info(`CryptOpnBot version ${version} (https://crypto.opnbot.com)`)

// node-telegram-bot-api suppress warnings
process.env.NTBA_FIX_319 = 1
process.env.NTBA_FIX_350 = 1

if (!Array.isArray(setting.CHART_INPUT_STUDIES?.[0]?.value)) {
  log.warn('\nWarning: config/setting CHART_INPUT_STUDIES String value is deprecated in v0.2.0+')
}

if (!setting.INPUT_CHECK_CHAR) {
  log.warn('\nWarning: config/setting INPUT_CHECK_CHAR is required in v0.2.0+')
  setting.INPUT_CHECK_CHAR = '✓'
}

if (!setting.CHART_INPUT_STUDIES_SPLIT) {
  log.warn('\nWarning: config/setting CHART_INPUT_STUDIES_SPLIT is required in v0.2.0+')
  setting.CHART_INPUT_STUDIES_SPLIT = ';'
}

if (!setting.MKT_SCREENER_LIST) {
  log.warn('\nWarning: config/setting MKT_SCREENER_LIST is required in v0.3.0+')
  setting.MKT_SCREENER_LIST = 25
}

if (!setting.MKT_SCREENER_CURRENCY) {
  log.warn('\nWarning: config/setting MKT_SCREENER_CURRENCY is required in v0.3.0+')
  setting.MKT_SCREENER_CURRENCY = 'USD'
}

srvTelegram(log, argv, version, setting)
