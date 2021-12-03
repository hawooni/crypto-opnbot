module.exports = {
  TELEGRAM_START: 'Hello! I am {{botName}} 🤖\n\nCommand:\n/price &lt;symbol&gt; &lt;interval&gt;\n/chart &lt;symbol&gt; &lt;interval&gt; &lt;studies&gt;\n/overview\n/performance\n/oscillators\n/moving_avgs\n/example\n\nFollow me on Twitter:\n<a href="https://twitter.com/cryptoOpnBot">@CryptoOpnBot</a>\n\nWebSite:\n<a href="https://crypto.opnbot.com">crypto.opnbot.com</a>\n\nGitHub:\n<a href="https://github.com/hawooni/crypto-opn-bot">source code</a>\n',
  TELEGRAM_EXAMPLE: 'Example:\n\n/price\n/price tsla\n/price goog\n/price btcusdt\n/price btcusdt 3M\n/price bitfinex:ethusd\n/price bitfinex:ethusd all\n/price &lt;symbol&gt; &lt;interval&gt;\n\n/chart\n/chart aapl\n/chart msft\n/chart btcusdt\n/chart btcusdt 15m\n/chart btcusdt 4h RSI,MA:50,MA:200\n/chart coinbase:ethusd 30m\n/chart coinbase:ethusd 1h MACD\n/chart &lt;symbol&gt; &lt;interval&gt; &lt;studies&gt;\n\nSupport TradingView Symbols.\n',
  TOO_MANY_REQUEST: 'Too many request. Please try again later.',
  INVALID_REQUEST: 'Invalid request. Try /example.',
}
