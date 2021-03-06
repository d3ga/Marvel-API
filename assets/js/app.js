// focus the text field on load
$('#input-name').focus()

$('#search-form').submit((e) => {
    e.preventDefault()
})

class marvelAPI {
  constructor() {
    this.apiKey = '8eb4391075c9034247c1cc9b86743ffc'
    this.apiUrl = 'https://gateway.marvel.com:443/v1/public'

    this.params = {
      'orderBy': 'name',
      'limit': 30,
      'offset': 0,
      'apikey': this.apiKey
    }
  }

  setLimit(amount) {
    this.params.limit = amount
  }

  setOffset(offset) {
    this.params.offset = offset
  }

  setParams(params) {
    this.params = $.extend(this.params, params)
  }

  callApi(endpoint, params, callback) {
    const apiParams = $.extend(this.params, params)

    $.getJSON(`${this.apiUrl}${endpoint}`, apiParams)
      .done((data) => {
        // console.log('getJSON', data)
        callback(data)

      })
      .fail((response) => {
        callback(null)
        console.error('Response', response)
      })
  }

  searchByName(name, callback) {
    this.callApi(
      '/characters',

      {
        'name': name,
      },
      callback
    )
  }

  nameStartsWith(name, callback) {
    delete this.params.name

    this.callApi(
      '/characters',
      {
        'nameStartsWith': name,
      },
      callback
    )
  }
}

class CharacterSearch {
  constructor() {
    this.marvelAPI = new marvelAPI()
    this.elements = {
      'form': $('#search-form'),
      'input': $('#search-input'),
      'results': $('#results'),
      'characterList': $('.character-list'),
      'searchButton' : $('.btn')
    }

    this.registerEvents()
  }

  registerEvents() {
    this.elements.form.on('submit', (e) => {
      e.preventDefault()
      const name = this.elements.input.val().trim()

      this.marvelAPI.searchByName(
        name,
        (data) => {
          if (data.data.results.length !== 0) {
            this.showResults(data.data.results)
          } else {
            this.marvelAPI.nameStartsWith(
              name,
              (data) => {
              this.showResults(data.data.results)
            })
          }
        }
      )
    })
  }

  showResults(results) {
    this.elements.characterList.html('')
    if (results.length === 0) {

      this.showError('Character not found in database!')

    } else {
      $('#error').remove()
      results.forEach((item) => {

        let comics = `<ul class="comics-list">`

        item.comics.items.forEach((comic) => {
          comics+= `<li class="list-item">${comic.name}</li>`
        })

        comics+=`</ul>`

        this.elements.characterList.append(`
          <li class="list-item" data-id="${item.id}">
              <div class="name">${item.name}</div>
              <div class="thumbnail">
                  <img src="${item.thumbnail.path}.${item.thumbnail.extension}"
                      width="250"
                      height="250">
              </div>
              <div class="description text-center">
                  ${item.description}
              </div>

              <a href="#title-comics" class="title-comics">Comics</a>

              <div class="comics text-center hidden">
                  ${comics}
              </div>
          </li>
        `)
     })

     $('.list-item').on('click', (e) => {
       $(e.currentTarget).find('.comics').toggleClass('hidden')
     })
    }
  }

  showError(message) {
    let alert = $('#error')

    if (alert.length === 0) {
      this.elements.form.before('<div class="alert alert-danger" id="error"></div>')
      alert = $('#error')
    }

    alert.text(message)
  }
}

const characterForm = new CharacterSearch()
