const mdb_api_key = 'c3a54b08f36afeb83e13c3643c7c2acd';
const poster_path_base = 'http://image.tmdb.org/t/p/w185/';
const max_cast_display = 5;

//A function which adds the movie details to the main information area.
function writeMovieDetails(details) {
    let content = `<h2>${details.title}</h2>`;
    content += `<p>${details.release_date}</p>`;
    content += `<p>${details.overview}</p>`;
    content += `<img src="${poster_path_base + details.poster_path}">`;
    $('.main').html(content);
}

//A function which adds the movie cast details to the main information area.
function writeCastDetails(credits) {
    const cast = credits.cast;
    $('.main').append('<ul>')
    for (let i = 0; i < max_cast_display; i++) {
        $('.main ul').append(`<li>${cast[i].name} as ${cast[i].character}</li>`);
    }
    $('.main').append('</ul>')
}


//A function which returns responseJSON containing a given movie's details from The Movie Database.
function getMovieDetails(activeMovie) {
    const baseURL = 'https://api.themoviedb.org/3/movie/'
    let requestURL = baseURL + activeMovie + '?' + 'api_key=' + mdb_api_key;
    fetch(requestURL)
        .then(response => {
            if (response.ok) {
                return response.json();
            }
        })
        .then(responseJson => writeMovieDetails(responseJson));
}

//A funciton which returns responseJSON containing a given movie's cast/crew from The Movie Database.
function getMovieCredits(activeMovie) {
    const baseURL = 'https://api.themoviedb.org/3/movie/'
    let requestURL = baseURL + activeMovie + '/credits' + '?' + 'api_key=' + mdb_api_key;
    fetch(requestURL)
        .then(response => {
            if (response.ok) {
                return response.json();
            }
        })
        .then(responseJson => writeCastDetails(responseJson));
}

//A small helper function which calls the necessary functions to make a movie in the results the 'active' movie in view.
function makeActive(activeMovie) {
    getMovieDetails(activeMovie);
    getMovieCredits(activeMovie);
}

//A function which adds the search results to the DOM when provided response JSON from The Movie Database.
function renderResults(resultJson) {
    $('.results').html('');
    console.log(resultJson);
    let results = resultJson.results;
    console.log(results);
    for (let i = 0; i < results.length; i++) {
        let listEntry = `<div class="result ${i % 2 == 0 ? '' : 'odd'}">`;
        listEntry += `<span class="result-title">${results[i].title}</span><br>`;
        listEntry += `<span class="result-date">${results[i].release_date}</span>`;
        listEntry += `<span class="hidden movie-id">${results[i].id}</span>`;
        listEntry += '</div>';
        $('.results').append(listEntry);
    } 
}

//A function which accepts a user-provided search term and searches the The Movie Database for people, TV shows, and movies related to that term.
//Returns a JSON object containing the top 20 search results. 
function search(searchTerm) {
    const baseUrl = 'https://api.themoviedb.org/3/search/movie';
    let params = `api_key=${mdb_api_key}&query=${encodeURIComponent(searchTerm)}`;
    let requestURL = baseUrl + '?' + params;
    fetch(requestURL)
        .then(response => {
            if (response.ok) {
                return response.json();
            }
        })
        .then(responseJson => renderResults(responseJson));
}

function eventListener() {
    //Handles search submission
    $('#js-search').on('submit', function (event) {
        event.preventDefault();
        let query = $('#js-search-term').val();
        let resultsList = search(query);
    });

    //Handles clicking on a result for details -- not yet implemented
    $('.results').on('click', '.result', function (event) {
        let activeTitle = $(this).children('.movie-id').text();
        makeActive(activeTitle);
    })
}

$(eventListener);