/**
 * Cinema module.
 *
 * @module src/modules/cinema
 * @author Marcus Cvjeticanin
 * @version 1.0.0
 */

const rp = require('request-promise')
const cheerio = require('cheerio')

/**
 * Cinema class.
 *
 * @class Cinema
 */
class Cinema {
  /**
   * Creates an instance of Cinema.
   *
   * @memberof Cinema
   */
  constructor () {
    this._url = ''
  }

  /**
   * Set new url to Cinema.
   *
   * @memberof Cinema
   * @param {string} url - The url to set.
   */
  set url (url) {
    this._url = url
  }

  /**
   * Get url to Cinema.
   *
   * @memberof Cinema
   * @returns {string} - Returns the current url.
   */
  get url () {
    return this._url
  }

  /**
   * Get the showtimes.
   *
   * @memberof Cinema
   * @param {object} days - Get all days to look through.
   * @returns {Promise} Promises - Returns all the promises for showtimes.
   */
  getShowtimes (days) {
    const uriList = []
    const promises = []

    const movieTitles = rp(this._url).then(html => { return this.getMovieTitles(html) })
    promises.push(movieTitles)

    // available movies for the days is pushed to uriList
    days.forEach(day => {
      for (let i = 1; i < 4; i++) {
        uriList.push(this._url + `/check?day=0${day}&movie=0${i}`)
      }
    })

    uriList.forEach(uri => {
      const promise = rp(uri).then(data => { return data })
      promises.push(promise)
    })

    console.log('Scraping showtimes...OK')

    return Promise.all(promises).then(results => { return results })
  }

  /**
   * Get the movie titles.
   *
   * @memberof Cinema
   * @param {string} data - Html data.
   * @returns {Array} Array - Returns all the movie titles for given day(s).
   */
  getMovieTitles (data) {
    const $ = cheerio.load(data)
    const div = $('#movie option')
    const list = []

    $(div).each((i, element) => {
      const el = $(element).text()
      if (el !== '--- Pick a Movie ---') {
        list.push(el)
      }
    })

    return list
  }
}

module.exports = Cinema
