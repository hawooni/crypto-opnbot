require('dotenv').config()
require('module-alias/register')

const yargs = require('yargs')
const winston = require('@lib/winston')
const srvTelegram = require('@src/telegram')
const config = require('@config/setting')
const { version } = require('./package.json')

const log = winston.createLogger({ level: process.env.LOG })

const argv = yargs
  .usage('Usage: npm start -- --options')
  .option('telegramToken', {
    describe: 'Set telegram API Token',
    demandOption: true,
    type: 'string',
    default: process.env.TELEGRAM_TOKEN || null,
  })
  .option('exchange', {
    describe: 'Set default exchange',
    type: 'string',
    default: config.DEFAULT_EXCHANGE,
  })
  .option('symbol', {
    describe: 'Set default symbol',
    type: 'string',
    default: config.DEFAULT_SYMBOL,
  })
  .option('rateLimit', {
    describe: 'Set request rate limit',
    type: 'number',
    default: config.TELEGRAM_RATE_LIMIT_USER || 0,
  }).argv

log.info(`CryptOpnBot version ${version} (https://crypto.opnbot.com)`)

// node-telegram-bot-api suppress warnings
process.env.NTBA_FIX_319 = 1
process.env.NTBA_FIX_350 = 1

srvTelegram(log, argv, version)
