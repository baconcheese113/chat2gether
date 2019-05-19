import axios from 'axios'

const YOUTUBE_SEARCH = 'https://www.youtube.com/results?search_query='
const PROXY_URL = 'https://cors-anywhere.herokuapp.com/'

class HtmlParse {
  // search query
  search = null

  // List of ids that will be pulled out of the parsed response
  videoIds = []

  constructor(search) {
    this.search = search
  }

  async parsePage() {
    console.log('parsing page')
    const response = await axios.get(PROXY_URL + YOUTUBE_SEARCH + this.search) // not needed due to proxy , {headers: {'Access-Control-Allow-Origin': '*'}})
    const parser = new DOMParser()
    const doc = parser.parseFromString(response.data, 'text/html')
    // console.log(response.data)
    const ulResults = doc.querySelector('#videoListSearchResults')
    if (!ulResults) {
      console.log('no results')
      return
    }
    const items = ulResults.getElementsByTagName('li')
    for (const i of items) {
      this.videoIds.push(i.firstElementChild.firstElementChild.firstElementChild.getAttribute('href').split('=')[1])
    }

    // console.log(doc.querySelector('#videoListSearchResults'))
  }

  getVideoIdAt(num) {
    return this.videoIds[num]
  }
}

export default HtmlParse
