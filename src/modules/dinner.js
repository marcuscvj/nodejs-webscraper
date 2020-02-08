/**
 * Dinner module.
 *
 * @module src/modules/dinner
 * @author Marcus Cvjeticanin
 * @version 1.0.0
 */

const rp = require('request-promise')
const tg = require('tough-cookie')
const Scraper = require('./scraper')

/**
 * Dinner class.
 *
 * @class Dinner
 */
class Dinner {
  /**
   * Creates an instance of Dinner.
   *
   * @memberof Dinner
   */
  constructor () {
    this._url = ''
  }

  /**
   * Set new url to Dinner.
   *
   * @memberof Dinner
   * @param {string} url - The url to set.
   */
  set url (url) {
    this._url = url
  }

  /**
   * Get url to Dinner.
   *
   * @memberof Scraper
   * @returns {string} - Returns the current url.
   */
  get url () {
    return this._url
  }

  /**
   * Get the available reserverations.
   *
   * @memberof Dinner
   * @param {object} cinemaData - The data from cinema.
   */
  getAvailableReservations (cinemaData) {
    rp(this._url)
      .then(() => {
        const urlArr = this._url.split('/')
        const domain = urlArr[2]
        const domainWithoutPort = urlArr[2].split(':').shift()

        // https://github.com/request/request-promise#include-a-cookie
        const cookie = new tg.Cookie({
          key: 'zeke',
          value: 'coys',
          domain: domainWithoutPort,
          httpOnly: true,
          maxAge: 31536000
        })

        const cookiejar = rp.jar()
        cookiejar._jar.rejectPublicSuffixes = false
        cookiejar.setCookie(cookie.toString(), `http://${domain}`)

        const options = {
          method: 'POST',
          simple: false,
          uri: this._url + '/login',
          jar: cookiejar,
          form: {
            username: 'zeke',
            password: 'coys'
          }
        }

        rp(options)
          .then(() => {
            const options = {
              method: 'GET',
              uri: this._url + '/login/booking',
              jar: cookiejar
            }

            rp(options)
              .then(data => {
                const newScraper = new Scraper(this._url + '/login/booking')
                const dinnerData = newScraper.getInputTags(data)
                console.log('Scraping possible reservations...OK')

                this.recommendations(cinemaData, dinnerData)
              })
          })
      })
  }

  /**
   * Get the recommendation based on calendar, cinema and dinner data.
   *
   * @memberof Dinner
   * @param {object} cinemaData - The data from cinema.
   * @param {object} dinnerData - The data from dinner.
   */
  recommendations (cinemaData, dinnerData) {
    const movies = cinemaData[0]
    const movieDates = []
    const availableMovies = []
    const dinnerTimes = []

    for (let i = 1; i < cinemaData.length; i++) { movieDates.push(JSON.parse(cinemaData[i])) }

    movieDates.forEach(d => {
      for (let i = 0; i < d.length; i++) {
        // if 1, the movie is available to book
        if (d[i].status === 1) {
          const movie = d[i].movie
          const mNum = parseInt(movie.substring(1, 2))
          let day

          if (d[i].day === '05') {
            day = 'Friday'
          } else if (d[i].day === '06') {
            day = 'Saturday'
          } else if (d[i].day === '07') {
            day = 'Sunday'
          }

          const obj = {
            movie: movies[mNum - 1],
            time: d[i].time,
            day: day
          }
          availableMovies.push(obj)
        }
      }
    })

    const friday = availableMovies.find(element => { return element.day === 'Friday' })
    const saturday = availableMovies.find(element => { return element.day === 'Saturday' })
    const sunday = availableMovies.find(element => { return element.day === 'Sunday' })

    dinnerData.forEach(dd => {
      if (friday && dd.substring(0, 3) === 'fri') { dinnerTimes.push(parseInt(dd.substring(3, 5))) }
      if (saturday && dd.substring(0, 3) === 'sat') { dinnerTimes.push(parseInt(dd.substring(3, 5))) }
      if (sunday && dd.substring(0, 3) === 'sun') { dinnerTimes.push(parseInt(dd.substring(3, 5))) }
    })

    console.log('\nRecommendations\n===============')

    availableMovies.forEach(m => {
      if (dinnerTimes.includes(parseInt(m.time.substring(0, 2)) + 2)) {
        const dinnerTime = dinnerTimes.find(time => { return time === parseInt(m.time.substring(0, 2)) + 2 })
        const convertedTime = dinnerTime.toString() + ':00'
        const convertedToTime = (dinnerTime + 2).toString() + ':00'
        console.log(`* On ${m.day} the movie "${m.movie}" starts at ${m.time} and there is a free table between ${convertedTime}-${convertedToTime}.`)
      }
    })
  }
}

module.exports = Dinner
