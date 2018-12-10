const mdb_api_key = 'c3a54b08f36afeb83e13c3643c7c2acd';
const yt_api_key = 'AIzaSyB_4uvbCh9aPAl1-dOQ5klTEQ7FnvxZfjo';
const poster_path_base = 'https://image.tmdb.org/t/p/w185/';
const max_cast_display = 5;
const errorBox = $('.header').children('.error');


//Accepts an array of film credits and returns the most popular one. 
function randomMovie(movies) {
    return movies[Math.floor(Math.random() * (movies.length))];
}

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

//Accepts JSON related to a youtube video and displays it on the page.
function displayYoutubeVideo(video) {
    $('.right').html(`<iframe title="YouTube Video Player" class="youtube-player" type="text/html" 
    src="//www.youtube.com/embed/${video.items[0].id.videoId}&origin=https://balzua.github.io/WhatToWatch/"
    width="420" height="315" frameborder="0" allowFullScreen></iframe>`);
    $('.right').removeClass('hidden');
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
    $('.main').removeClass('hidden');
}

//A function which adds the movie cast details to the main information area.
function writeCastDetails(credits, alsoIn) {
    const cast = credits.cast;
    $('.main').append('<ul class="cast">')
    for (let i = 0; i < max_cast_display; i++) {
        const otherFilm = randomMovie(alsoIn[i].cast);
        $('.main ul').append(`<li><a href="https://www.themoviedb.org/person/${cast[i].id}" target="_blank">${cast[i].name}</a> as ${cast[i].character}<br>Also appeared in: <a href="#" data="${otherFilm.id}">${otherFilm.title}</a></li>`);
    }
    $('.main').append('</ul>')
}

function getCastDetails(credits) {
    let castInfo = [];
    for (let i = 0; i < max_cast_display; i++) {
        const baseURL = `https://api.themoviedb.org/3/person/${credits.cast[i].id}/movie_credits`;
        const requestURL = baseURL + '?api_key=' + mdb_api_key;
        castInfo[i] = fetch(requestURL).then(response => {
            if (response.ok) {
                return response.json();
            }
        })
    }
    Promise.all(castInfo).then(responseJson => writeCastDetails(credits, responseJson));
}

//A function which returns responseJSON containing a given movie's details from The Movie Database.
function getMovieDetails(activeMovie) {
    const baseURL = 'https://api.themoviedb.org/3/movie/'
    const requestURL = baseURL + activeMovie + '?' + 'api_key=' + mdb_api_key;
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
    const movieCast = fetch(requestURL)
        .then(response => {
            if (response.ok) {
                return response.json();
            }
        })
        .then(responseJson => getCastDetails(responseJson));
}

//A small helper function which calls the necessary functions to make a movie in the results the 'active' movie in view.
function makeActive(activeMovieID, activeMovieTitle) {
    getMovieDetails(activeMovieID);
    getMovieCredits(activeMovieID);
    getYoutube(activeMovieTitle);
}

//A function which adds the search results to the DOM when provided response JSON from The Movie Database.
function writeResults(resultJson) {
    $('.results').html('<span class="results-header">Similar Titles</span><ul></ul>');
    let results = resultJson.results;
    for (let i = 0; i < results.length; i++) {
        let listEntry = `<li data="${results[i].id}" ${i % 2 == 0 ? '' : 'class="odd"'}>`;
        listEntry += `<a href="#">${results[i].title}</a>`;
        listEntry += '</li>';
        $('.results ul').append(listEntry);
    }
    if (results.length == 0) {
        errorBox.text('No Results Found- Please Try Again!');
        errorBox.removeClass('hidden');
    } else {
        errorBox.addClass('hidden');
        $('.results').removeClass('hidden');
        makeActive(results[0].id, results[0].title); 
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
        .then(responseJson => writeResults(responseJson));
}

function eventListener() {
    //Handles search submission
    $('#js-search').on('submit', function (event) {
        event.preventDefault();
        let query = $('#js-search-term').val();
        let resultsList = search(query);
    });

    //Handles clicking on a result for details
    $('.results').on('click', 'li', function (event) {
        let activeMovieID = $(this).attr('data');
        let activeMovieTitle = $(this).children('a').text();
        makeActive(activeMovieID, activeMovieTitle);
    })

    //Handles clicking on another movie in the "also appeared in" section for an actor
    $('.main').on('click', 'li > a', function (event) {
        let activeMovieID = $(this).attr('data');
        let activeMovieTitle = $(this).text();
        makeActive(activeMovieID, activeMovieTitle);
    })
}

$(eventListener);