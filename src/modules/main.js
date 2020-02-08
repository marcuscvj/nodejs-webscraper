/**
 * Main module.
 *
 * @module src/modules/main
 * @author Marcus Cvjeticanin
 * @version 1.0.0
 */

const rp = require('request-promise')
const Calendar = require('./calendar')
const Scraper = require('./scraper')
const Cinema = require('./cinema')
const Dinner = require('./dinner')

/**
 * Main class to handle the scraper.
 *
 * @class Main
 */
class Main {
  /**
   * Creates an instance of Main.
   *
   * @memberof Main
   * @param {string} url - The url to start scrape.
   */
  constructor (url) {
    this._url = url
  }

  /**
   * Starts the application.
   *
   * @memberof Main
   */
  start () {
    const scraper = new Scraper(this._url)
    const calendar = new Calendar()
    const cinema = new Cinema()
    const dinner = new Dinner()

    // getting startpage links
    rp(this._url)
      .then(html => {
        return scraper.getLinks(html)
      }).then(links => {
        console.log('Scraping links...OK')
        calendar.url = links[0]
        cinema.url = links[1]
        dinner.url = links[2]

        // scraping the calendar
        rp(calendar.url)
          .then(html => {
            return calendar.getDays(html)
          }).then(calendarDays => {
            return cinema.getShowtimes(calendarDays)
          }).then(cinemaData => {
            dinner.getAvailableReservations(cinemaData)
          }).catch(err => {
            console.error(err)
          })
      }).catch(err => {
        console.error(err)
      })
  }
}

module.exports = Main
