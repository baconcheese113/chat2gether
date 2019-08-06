import axios from 'axios'

const DOMAIN = process.env.REACT_APP_SEARCH_DOMAIN || 'youtube'
const SEARCH_URL = `https://www.${DOMAIN}.com/?search=`
const PROXY_URL = 'https://cors-anywhere.herokuapp.com/'

class HtmlParse {
  // search query
  search = null

  // List of ids that will be pulled out of the parsed response
  videos = []

  constructor(search) {
    this.search = search
  }

  static async getUrl(id) {
    const videoResponse = await axios.get(`${PROXY_URL}https://www.${DOMAIN}.com/${id}`)
    const parser = new DOMParser()
    const doc = parser.parseFromString(videoResponse.data, 'text/html')
    const videoUrl = doc
      .getElementById(`${DOMAIN}-player`)
      .innerHTML.match(/videoUrl":"(.*?)"}/)[1]
      .replace(/\\/g, '')
    return videoUrl
  }

  async parsePage() {
    console.log('parsing page')
    const response = await axios.get(PROXY_URL + SEARCH_URL + this.search) // not needed due to proxy , {headers: {'Access-Control-Allow-Origin': '*'}})
    const parser = new DOMParser()
    const doc = parser.parseFromString(response.data, 'text/html')
    const ulResults = doc.querySelectorAll('.tm_video_block')
    if (!ulResults) {
      console.log('no results')
      return
    }

    const regex = /\//g
    for (const i of ulResults) {
      const newItem = {}
      newItem.id = i
        .querySelector('.video_link')
        .getAttribute('href')
        .replace(regex, '')
      newItem.title = i.querySelector('img').getAttribute('alt')
      newItem.img = i.querySelector('img').getAttribute('data-src')
      newItem.duration = i.querySelector('.duration').innerText
      this.videos.push(newItem)
    }
  }
}

export default HtmlParse
