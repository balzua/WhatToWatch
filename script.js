const mdb_api_key = 'c3a54b08f36afeb83e13c3643c7c2acd';
const yt_api_key = 'AIzaSyB_4uvbCh9aPAl1-dOQ5klTEQ7FnvxZfjo';
const poster_path_base = 'http://image.tmdb.org/t/p/w185/';
const max_cast_display = 5;

//Accepts a date in the form YYYY-MM-DD and converts to "Month Day, Year" string format
function dateConversion(dateJson) {
    const monthList = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const date = new Date(dateJson);
    const day = date.getDate();
    let dateSuffix = "";
    if (day == '1' || day == '21' || day == '31') {
        dateSuffix = "st";
    } else if (day == '2' || day == '22') {
        dateSuffix = "nd";
    } else {
        dateSuffix = "th";
    }
    return `${monthList[date.getMonth()]} ${date.getDate()}<sup>${dateSuffix}</sup>, ${date.getFullYear()}`;
}

function displayYoutubeVideo(video) {
    $('.right').html(`<iframe title="YouTube Video Player" class="youtube-player" type="text/html" 
    src="http://www.youtube.com/embed/${video.items[0].id.videoId}"
    width="420" height="315" frameborder="0" allowFullScreen></iframe>`);
}

//A function which returns responseJSON containing the top Youtube video for a movie.
function getYoutube(activeMovie) {
    const baseURL = 'https://www.googleapis.com/youtube/v3/search';
    let queryParams = {
        q: activeMovie,
        type: 'video',
        part: 'snippet',
        maxResults: 1,
        videoEmbeddable: true,
        key: yt_api_key
    }
    let queryArray = Object.keys(queryParams).map(key => `${encodeURIComponent(key)}=${encodeURIComponent(queryParams[key])}`);
    const query = queryArray.join('&');
    const requestURL = baseURL + '?' + query;
    fetch(requestURL)
        .then(response => response.json())
        .then(responseJson => displayYoutubeVideo(responseJson));
}


//A function which adds the movie details to the main information area.
function writeMovieDetails(details) {
    const releaseDate = dateConversion(details.release_date);
    let content = `<img src="${poster_path_base + details.poster_path}" class="poster">`;
    content += '<div class="movie-content">';
    content += `<h2>${details.title}</h2>`;
    content += `<span class="release-date">${releaseDate}</span><br>`;
    const genres = details.genres;
    for (let i = 0; i < genres.length; i++) {
        genreName = details.genres[i].name.replace(/\s+/g, '-').toLowerCase();
        content += `<div class="genre ${genreName}">${genreName}</div>`;
    }
    content += `<p>${details.overview}</p>`;
    content += '</div>';
    $('.main').html(content);
}

//A function which adds the movie cast details to the main information area.
function writeCastDetails(credits) {
    const cast = credits.cast;
    $('.main').append('<ul class="cast">')
    for (let i = 0; i < max_cast_display; i++) {
        $('.main ul').append(`<li><a href="${cast[i].profile_path}">${cast[i].name}</a> as ${cast[i].character}</li>`);
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
function makeActive(activeMovieID, activeMovieTitle) {
    getMovieDetails(activeMovieID);
    getMovieCredits(activeMovieID);
    getYoutube(activeMovieTitle);
}

//A function which adds the search results to the DOM when provided response JSON from The Movie Database.
function renderResults(resultJson) {
    $('.results').html('<h2>Similar Titles</h2><ul></ul>');
    let results = resultJson.results;
    for (let i = 0; i < results.length; i++) {
        let listEntry = `<li ${i % 2 == 0 ? '' : 'class="odd"'}>`;
        listEntry += `<a href="#">${results[i].title}</a>`;
        listEntry += `<span class="hidden movie-id">${results[i].id}</span>`;
        listEntry += '</li>';
        $('.results ul').append(listEntry);
    }
    makeActive(results[0].id, results[0].title); 
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
    $('.results').on('click', 'li', function (event) {
        let activeMovieID = $(this).children('.movie-id').text();
        let activeMovieTitle = $(this).children('a').text();
        makeActive(activeMovieID, activeMovieTitle);
    })
}

$(eventListener);