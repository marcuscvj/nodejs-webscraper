/**
 * Calendar module.
 *
 * @module src/modules/calendar
 * @author Marcus Cvjeticanin
 * @version 1.0.0
 */

const rp = require('request-promise')
const Scraper = require('./scraper')

/**
 * Calendar class.
 *
 * @class Calendar
 */
class Calendar {
  /**
   * Creates an instance of Calendar.
   *
   * @memberof Calendar
   */
  constructor () {
    this._url = ''
  }

  /**
   * Set new url to Calendar.
   *
   * @memberof Calendar
   * @param {string} url - The url to set.
   */
  set url (url) {
    this._url = url
  }

  /**
   * Get url to Calendar.
   *
   * @memberof Calendar
   * @returns {string} - Returns the current url.
   */
  get url () {
    return this._url
  }

  /**
   * Get the available days of friends.
   *
   * @memberof Calendar
   * @param {string} html - Html data.
   * @returns {Promise} Promises - Returns all promises.
   */
  getDays (html) {
    const scraper = new Scraper(this._url)
    const calLinks = scraper.getLinks(html)
    const promises = []

    // going through all pages
    calLinks.forEach(link => {
      const promise = rp(link).then(html => { return scraper.getTableInfo(html) })
      promises.push(promise)
    })

    console.log('Scraping available days...OK')

    return Promise.all(promises).then(results => { return this.bestWeekDays(results) })
  }

  /**
   * Get the best week days.
   *
   * @memberof Calendar
   * @param {object} data - Html data.
   * @returns {Array} Array - Returns list of days.
   */
  bestWeekDays (data) {
    let fri = 0
    let sat = 0
    let sun = 0
    const days = []

    data.forEach(list => {
      list.forEach((element, index) => {
        if (element.toLowerCase() === 'ok' && index === 0) {
          fri++
        } else if (element.toLowerCase() === 'ok' && index === 1) {
          sat++
        } else if (element.toLowerCase() === 'ok' && index === 2) {
          sun++
        }
      })
    })

    if (fri === 3) {
      days.push(5)
    }
    if (sat === 3) {
      days.push(6)
    }
    if (sun === 3) {
      days.push(7)
    }

    if (days.length === 0) {
      throw new Error('No available days!')
    }

    return days
  }
}

module.exports = Calendar
