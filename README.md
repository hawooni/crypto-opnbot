# CryptoOpnBot

It is a simple crypto Telegram Bot based on [CHART-IMG](https://chart-img.com) API. It supports all TradingView symbols and is not limited to only crypto symbols. However, the focus will be on the crypto market in future updates.

## Live Telegram Bot

http://t.me/CryptoOpnBot

You can use this bot if you don't want to customize your own. It will always run with the latest version.

## Setup

Customize preset settings by modifying `config/setting.js`. Refer to CHART-IMG [Documentation](https://doc.chart-img.com) for a more detailed configuration.

### Limitation

- Currently, [CHART-IMG](https://doc.chart-img.com) only supports screenshot image resolution only up to `800x600` with `15` req/min. It will support a higher resolution and rate limit in the future with API-Key.

### .env file

You should create .env file with the following variable(s):

```
TELEGRAM_TOKEN=<your_telegram_token>
```

Optional:

```
BOT_NAME=@CryptoOpnBot
CHART_IMG_API_KEY=<your_chart_img_api_key>
```

## Quick Run

### NPM

```
git clone https://github.com/hawooni/crypto-opnbot

cd crypto-opnbot

npm i
npm start -- --telegramToken=<your_telegram_token>
```

### Docker

```
docker run -it --name crypto-opnbot \
-e TELEGRAM_TOKEN=<your_telegram_token> \
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
