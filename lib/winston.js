const { format, transports, createLogger } = require('winston')
const lodash = require('lodash')

/**
 * @param {Object} config
 * @returns {Logger}
 */
module.exports.createLogger = (config = {}) => {
  return createLogger(
    lodash.merge(
      {
        level: 'info',
        transports: [
          new transports.Console({
            format: format.combine(
              format.simple(),
              format.colorize({ all: true }),
              format.printf((info) => `${info.message}`)
            ),
          }),
        ],
      },
      config
    )
  )
}
