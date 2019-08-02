import axios from 'axios'

const DOMAIN = process.env.REACT_APP_SEARCH_DOMAIN || 'youtube'
const SEARCH_URL = `https://www.${DOMAIN}.com/videos/search?q=`
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
    return `https://www.${DOMAIN}.com/videos/embed/`
  }

  async parsePage() {
    console.log('parsing page')
    const response = await axios.get(PROXY_URL + SEARCH_URL + this.search) // not needed due to proxy , {headers: {'Access-Control-Allow-Origin': '*'}})
    const parser = new DOMParser()
    const doc = parser.parseFromString(response.data, 'text/html')
    console.log(doc)
    // videoSearchResult on full web, videoListSearchResults on mobile
    const ulResults = doc.querySelector('.videos') || doc.querySelector('#videoListSearchResults')
    const isMobile = true || !!doc.querySelector('#videoListSearchResults')
    console.log(ulResults)
    if (!ulResults) {
      console.log('no results')
      return
    }
    const items = ulResults.getElementsByClassName('item')
    for (const i of items) {
      if (i.querySelector('a').hasAttribute('_vkey') || isMobile) {
        const newItem = {}
        newItem.id = isMobile
          ? i
              .querySelector('a')
              .getAttribute('href')
              // .split('/videos/')[1]
              .split('-')
              .slice(-1)[0]
          : i.getAttribute('_vkey')
        newItem.title = i.querySelector('img').getAttribute('alt')
        newItem.img = i.querySelector('img').getAttribute('src')
        newItem.duration = isMobile
          ? i.querySelector('.meta p').lastChild.textContent
          : i.querySelector('.duration').textContent
        this.videos.push(newItem)
      }
    }
  }
}

export default HtmlParse
