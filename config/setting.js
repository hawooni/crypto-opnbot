// ref to doc: https://doc.chart-img.com/

module.exports = {
  DEFAULT_SYMBOL: 'BTCUSDT',
  DEFAULT_EXCHANGE: 'BINANCE',
  DEFAULT_PRICE_INTERVAL: '3M', // 1d,1M,3M,1Y,5Y,all
  DEFAULT_CHART_INTERVAL: '1d', // 1m,3m,5m,15m,30m,45m,1h,2h,3h,4h,1d,1w
  DEFAULT_CHART_STUDIES: ['EMA:50', 'EMA:200', 'RSI'],
  DEFAULT_TIMEZONE: 'Etc/UTC',

  BOT_NAME: '@CryptoOpnBot',

  THEME_IMG: 'dark', // dark,light

  PRICE_IMG_WIDTH: 550,
  PRICE_IMG_HEIGHT: 300,

  CHART_IMG_WIDTH: 800,
  CHART_IMG_HEIGHT: 600,

  INPUT_CHECK_CHAR: '✓',
  INPUT_SYMBOLS_COLUMN: 4,
  CHART_INPUT_STUDIES_COLUMN: 3,
  CHART_INPUT_STUDIES_SPLIT: ';',

  INPUT_SYMBOLS: [
    {
      text: 'BTCUSDT',
      value: 'BINANCE:BTCUSDT',
    },
    {
      text: 'ETHUSDT',
      value: 'BINANCE:ETHUSDT',
    },
    {
      text: 'BNBUSDT',
      value: 'BINANCE:BNBUSDT',
    },
    {
      text: 'SOLUSDT',
      value: 'BINANCE:SOLUSDT',
    },
    {
      text: 'ADAUSDT',
      value: 'BINANCE:ADAUSDT',
    },
    {
      text: 'XRPUSDT',
      value: 'BINANCE:XRPUSDT',
    },
    {
      text: 'DOTUSDT',
      value: 'BINANCE:DOTUSDT',
    },
    {
      text: 'DOGEUSDT',
      value: 'BINANCE:DOGEUSDT',
    },
    {
      text: 'AVAXUSDT',
      value: 'BINANCE:AVAXUSDT',
    },
    {
      text: 'SHIBUSDT',
      value: 'BINANCE:SHIBUSDT',
    },
    {
      text: 'CROUSD',
      value: 'COINBASE:CROUSD',
    },
    {
      text: 'LUNAUSDT',
      value: 'BINANCE:LUNAUSDT',
    },
    {
      text: 'LTCUSDT',
      value: 'BINANCE:LTCUSDT',
    },
    {
      text: 'MATICUSDT',
      value: 'BINANCE:MATICUSDT',
    },
    {
      text: 'LINKUSDT',
      value: 'BINANCE:LINKUSDT',
    },
    {
      text: 'BATUSDT',
      value: 'BINANCE:BATUSDT',
    },
  ],

  CHART_INPUT_INTERVALS: ['1m', '5m', '15m', '1h', '4h', '1d'],
  CHART_INPUT_STUDIES: [
    {
      text: 'EMA,RSI',
      value: ['EMA:50', 'EMA:200', 'RSI'],
    },
    {
      text: 'EMA,MACD',
      value: ['EMA:50', 'EMA:200', 'MACD'],
    },
    {
      text: 'EMA,STOCH',
      value: ['EMA:50', 'EMA:200', 'STOCH'],
    },
    {
      text: 'MA,RSI',
      value: ['MA:50', 'MA:200', 'RSI'],
    },
    {
      text: 'MA,MACD',
      value: ['MA:50', 'MA:200', 'MACD'],
    },
    {
      text: 'MA,STOCH',
      value: ['MA:50', 'MA:200', 'STOCH'],
    },
    {
      text: 'BB,RSI',
      value: ['BB', 'RSI'],
    },
    {
      text: 'BB,MACD',
      value: ['BB', 'MACD'],
    },
    {
      text: 'BB,STOCH',
      value: ['BB', 'STOCH'],
    },
    {
      text: 'IC,RSI',
      value: ['IC', 'RSI'],
    },
    {
      text: 'IC,MACD',
      value: ['IC', 'MACD'],
    },
    {
      text: 'IC,STOCH',
      value: ['IC', 'STOCH'],
    },
  ],

  API_CHART_IMG_BASE_URL: 'https://api.chart-img.com/v1',

  TELEGRAM_ALLOW_BOT: false, // talk to another bot or ignore
  TELEGRAM_WHITE_LIST_IDS: [], // only respond to from ids here (empty array to disable)
  TELEGRAM_RATE_LIMIT_USER: 15, // set each user max request rate limit per minute (set 0 to disable)
}
