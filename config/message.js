module.exports = {
  TELEGRAM_START: 'Hello! I am {{botName}} 🤖\n\nCommand:\n/price &lt;symbol&gt; &lt;interval&gt;\n/chart &lt;symbol&gt; &lt;interval&gt; &lt;studies&gt;\n/fear_greed_index\n/example\n\nFollow me on Twitter:\n<a href="https://twitter.com/cryptoOpnBot">@CryptoOpnBot</a>\n\nWebSite:\n<a href="https://crypto.opnbot.com">crypto.opnbot.com</a>\n\nGitHub:\n<a href="https://github.com/hawooni/crypto-opnbot">source code</a>\n',
  TELEGRAM_EXAMPLE: 'Example:\n\n/price\n/price tsla\n/price goog\n/price btcusdt\n/price btcusdt 1M\n/price bitfinex:ethusd\n/price bitfinex:ethusd all\n/price &lt;symbol&gt; &lt;interval&gt;\n\nSupport Intervals: 1d,1M,3M,1Y,5Y,all\n\n/chart\n/chart aapl\n/chart msft\n/chart btcusdt\n/chart btcusdt 15m\n/chart btcusdt 4h RSI;MA:50;MA:200\n/chart coinbase:ethusd 30m\n/chart coinbase:ethusd 1h MACD\n/chart &lt;symbol&gt; &lt;interval&gt; &lt;studies&gt;\n\nSupport Intervals: 1m,3m,5m,15m,30m,45m,1h,2h,3h,4h,1d,1w\n',
  TOO_MANY_REQUEST: 'Too many request. Please try again later.',
  INVALID_REQUEST: 'Invalid request. Try /example.',
}
