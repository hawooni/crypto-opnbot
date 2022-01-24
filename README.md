# CryptoOpnBot

It is a simple crypto Telegram Bot based on [CHART-IMG](https://chart-img.com) API. It supports all TradingView symbols and is not limited to only crypto symbols. However, the focus will be on the crypto market in future updates.

## Live Telegram Bot

http://t.me/CryptoOpnBot

You can use this bot if you don't want to customize your own. It will always run with the latest version.

## Notice

CHART-IMG API key is required.

## Setup

Get your free personal API key at [https://chart-img.com](https://chart-img.com).

### Clone the repo

```
git clone https://github.com/hawooni/crypto-opnbot

cd crypto-opnbot
```

### Setting

Customize preset settings by modifying `config/setting.js`. Refer to CHART-IMG [Documentation](https://doc.chart-img.com) for a more detailed configuration.

```
module.exports = {
  DEFAULT_SYMBOL: 'BTCUSDT',
  DEFAULT_EXCHANGE: 'BINANCE',
  DEFAULT_PRICE_INTERVAL: '3M',
  DEFAULT_CHART_INTERVAL: '1d',
  DEFAULT_CHART_STUDIES: ['EMA:50', 'EMA:200', 'RSI'],
  DEFAULT_TIMEZONE: 'Etc/UTC',
  ...
}
```

### Environment Variable

You should create .env file with the following variable(s):

```
TELEGRAM_TOKEN=<your_telegram_token>
CHART_IMG_API_KEY=<your_chart_img_api_key>
```

Optional:

```
BOT_NAME=@CryptoOpnBot

CHART_IMG_WIDTH=1024
CHART_IMG_HEIGHT=768
```

## Quick Run

### NPM

```
npm install
npm start -- --telegramToken=<your_telegram_token> --apiKey=<your_chart_img_api_key>
```

### Docker

```
docker run -d --restart=always --name crypto-opnbot \
-e TELEGRAM_TOKEN=<your_telegram_token> \
-e CHART_IMG_API_KEY=<your_chart_img_api_key> \
hawooni/crypto-opnbot:latest
```

## Commands

### /start

![/start](doc/image/start.png?raw=true)

### /example

![/chart](doc/image/example.png?raw=true)

### /price

![/price](doc/image/price.png?raw=true)

### /chart

![/chart](doc/image/chart.png?raw=true)

![/chart](doc/image/chart-interval.png?raw=true)

![/chart](doc/image/chart-indicator.png?raw=true)

### /fear_greed_index

![/fear_greed_index](doc/image/fear_greed_index.png?raw=true)
