import axios from 'axios'

const DOMAIN = process.env.REACT_APP_SEARCH_DOMAIN || 'youtube'
const SEARCH_URL = `https://www.${DOMAIN}.com/video/search?search=`
const PROXY_URL = 'https://cors-anywhere.herokuapp.com/'

class HtmlParse {
  // search query
  search = null

  // List of ids that will be pulled out of the parsed response
  videos = []

  constructor(search) {
    this.search = search
  }

  static getUrl() {
    return `https://www.${DOMAIN}.com/embed/`
  }

  async parsePage() {
    console.log('parsing page')
    const response = await axios.get(PROXY_URL + SEARCH_URL + this.search) // not needed due to proxy , {headers: {'Access-Control-Allow-Origin': '*'}})
    const parser = new DOMParser()
    const doc = parser.parseFromString(response.data, 'text/html')
    // videoSearchResult on full web, videoListSearchResults on mobile
    const ulResults = doc.querySelector('#videoSearchResult') || doc.querySelector('#videoListSearchResults')
    const isMobile = !!doc.querySelector('#videoListSearchResults')
    if (!ulResults) {
      console.log('no results')
      return
    }
    const items = ulResults.getElementsByTagName('li')
    for (const i of items) {
      if (i.hasAttribute('_vkey') || isMobile) {
        const newItem = {}
        newItem.id = isMobile
          ? i
              .querySelector('.imageLink')
              .getAttribute('href')
              .split('=')[1]
          : i.getAttribute('_vkey')
        newItem.title = i.querySelector('img').getAttribute('alt')
        newItem.img = i.querySelector('img').getAttribute('data-thumb_url')
        newItem.duration = isMobile ? i.querySelector('.time').textContent : i.querySelector('.duration').textContent
        this.videos.push(newItem)
      }
    }
  }
}

export default HtmlParse
