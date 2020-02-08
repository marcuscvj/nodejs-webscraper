/**
 * Starting point of application.
 *
 * @module src/app
 * @author Marcus Cvjeticanin
 * @version 1.0.0
 */

const Main = require('./modules/main')

try {
  const args = process.argv
  const main = new Main(args[2])
  main.start()
} catch (err) {
  console.error('Try with a different URL!')
}
