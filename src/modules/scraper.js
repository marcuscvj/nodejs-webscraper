/**
 * Scraper module.
 *
 * @module src/modules/scraper
 * @author Marcus Cvjeticanin
 * @version 1.0.0
 */

const cheerio = require('cheerio')

/**
 * Scraper class.
 *
 * @class Scraper
 */
class Scraper {
  /**
   * Creates an instance of Scraper.
   *
   * @memberof Scraper
   * @param {string} url - The url to scrape.
   */
  constructor (url) {
    this._url = url
  }

  /**
   * Set new url to Scraper.
   *
   * @memberof Scraper
   * @param {string} url - The url to set.
   */
  set url (url) {
    this._url = url
  }

  /**
   * Get url to Scraper.
   *
   * @memberof Scraper
   * @returns {string} - Returns the current url.
   */
  get url () {
    return this._url
  }

  /**
   * Get links from passing html data.
   *
   * @memberof Scraper
   * @returns {string} - Returns list of links from html data.
   * @param {string} data - Html data to pass.
   */
  getLinks (data) {
    const $ = cheerio.load(data)
    const aTags = $('a')
    const links = []

    $(aTags).each((i, aTag) => {
      const href = $(aTag).attr('href')

      // checking if absolute URL
      if (href.indexOf('://') > 0 || href.indexOf('//') === 0) {
        links.push(href)
      } else {
        links.push(this._url + href)
      }
    })

    return links
  }

  /**
   * Get table data from passing html data.
   *
   * @memberof Scraper
   * @returns {string} - Returns list of table data from html.
   * @param {string} data - Html data to pass.
   */
  getTableInfo (data) {
    const $ = cheerio.load(data)
    const tdTags = $('td')
    const list = []

    $(tdTags).each((i, tdTag) => {
      const td = $(tdTag).text()
      list.push(td)
    })

    return list
  }

  /**
   * Get input tags data from passing html.
   *
   * @memberof Scraper
   * @returns {string} - Returns list of input tags data from html.
   * @param {string} data - Html data to pass.
   */
  getInputTags (data) {
    const $ = cheerio.load(data)
    const inputTags = $('input')
    const list = []

    $(inputTags).each((i, tag) => {
      const input = $(tag).attr('value')
      list.push(input)
    })

    return list
  }
}

module.exports = Scraper
