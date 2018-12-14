const mdb_api_key = 'c3a54b08f36afeb83e13c3643c7c2acd';
const yt_api_key = 'AIzaSyB_4uvbCh9aPAl1-dOQ5klTEQ7FnvxZfjo';
const max_cast_display = 5;

//Accepts JSON related to a Youtube video and embeds it on the page.
function displayYoutubeVideo(video) {
    $('.right').html(`<iframe title="YouTube Video Player" class="youtube-player" type="text/html" 
    src="https://www.youtube.com/embed/${video.items[0].id.videoId}"
    width="420" height="315" frameborder="0" allowFullScreen></iframe>`);
    $('.right').removeClass('hidden');
}

//A function which fetches responseJSON containing the top Youtube video for a movie.
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
    //Build the query URL from parameters array above.
    let queryArray = Object.keys(queryParams).map(key => `${encodeURIComponent(key)}=${encodeURIComponent(queryParams[key])}`);
    const query = queryArray.join('&');
    const requestURL = baseURL + '?' + query;
    fetch(requestURL)
    .then(response => {
        if (response.ok) {
            return response.json();
        }
        throw new Error(response.statusText);
    })
    .then(responseJson => displayYoutubeVideo(responseJson))
    .catch(err => {
        $('.error').text(`An error occurred: ${err.message}`);
        $('.error').removeClass('hidden');
    });
}

//A function which adds the movie cast details to the main information area.
function writeCastDetails(credits, alsoIn) {
    const cast = credits.cast;
    $('.main').append('<ul class="cast">')
    for (let i = 0; i < max_cast_display; i++) {
        //Fetch a random movie from each actor's filmography:
        const otherFilm = randomMovie(alsoIn[i].cast);
        $('.main ul').append(`<li>
            <a href="https://www.themoviedb.org/person/${cast[i].id}" target="_blank">${cast[i].name}</a> as ${cast[i].character}
            <br>Also appeared in: <a href="#" class="other-film" data="${otherFilm.id}">${otherFilm.title}</a></li>`);
    }
    $('.main').append('</ul>')
}

//Accepts an array of movies and returns a random one. 
function randomMovie(movies) {
    return movies[Math.floor(Math.random() * (movies.length))];
}

//A function which accepts an array of actors and fetches response JSON containing each actor's filmography.
function getCastDetails(credits) {
    let castInfo = [];
    for (let i = 0; i < max_cast_display; i++) {
        const baseURL = `https://api.themoviedb.org/3/person/${credits.cast[i].id}/movie_credits`;
        const requestURL = baseURL + '?api_key=' + mdb_api_key;
        castInfo[i] = fetch(requestURL).then(response => {
            if (response.ok) {
                return response.json();
            }
            throw new Error(response.statusText);
        })
        .catch(err => {
            $('.error').text(`An error occurred: ${err.message}`);
            $('.error').removeClass('hidden');
        });
    }
    Promise.all(castInfo).then(responseJson => writeCastDetails(credits, responseJson))
    .catch(err => {
        $('.error').text(`An error occurred: ${err.message}`);
        $('.error').removeClass('hidden');
    });
}

//A function which returns responseJSON containing a given movie's cast/crew from The Movie Database.
function getMovieCredits(activeMovie) {
    const baseURL = 'https://api.themoviedb.org/3/movie/'
    let requestURL = baseURL + activeMovie + '/credits' + '?' + 'api_key=' + mdb_api_key;
    fetch(requestURL)
        .then(response => {
            if (response.ok) {
                return response.json();
            }
            throw new Error(response.statusText);
        })
        .then(responseJson => getCastDetails(responseJson))
        .catch(err => {
            $('.error').text(`An error occurred: ${err.message}`);
            $('.error').removeClass('hidden');
        });
}

//A function which adds the movie details to the main information area.
function writeMovieDetails(details) {
    const releaseDate = dateConversion(details.release_date);
    const posterPathBase = 'https://image.tmdb.org/t/p/w185/';
    let content = `<img src="${posterPathBase + details.poster_path}" class="poster">`;
    content += '<div class="movie-content">';
    content += `<h2>${details.title}</h2>`;
    content += `<span class="release-date">${releaseDate}</span><br>`;
    const genres = details.genres;
    for (let i = 0; i < genres.length; i++) {
        //Convert genre name to a form suitable for a CSS class by replacing spaces with dashes and converting to lowercase.
        genreName = details.genres[i].name.replace(/\s+/g, '-').toLowerCase();
        content += `<div class="genre ${genreName}">${genreName}</div>`;
    }
    content += `<p>${details.overview}</p>`;
    content += '</div>';
    $('.main').html(content);
    $('.main').removeClass('hidden');
}

//Accepts a date in the form YYYY-MM-DD and converts to "Month Day, Year" string format. If date is undefined, returns an empty string.
function dateConversion(dateJson) {
    if (!dateJson) {
        return '';
    }
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

//A function which fetches response JSON containing a given movie's details from The Movie Database.
function getMovieDetails(activeMovie) {
    const baseURL = 'https://api.themoviedb.org/3/movie/'
    const requestURL = baseURL + activeMovie + '?' + 'api_key=' + mdb_api_key;
    fetch(requestURL)
    .then(response => {
        if (response.ok) {
            return response.json();
        }
        throw new Error(response.statusText);
    })
    .then(responseJson => writeMovieDetails(responseJson))
    .catch(err => {
        $('.error').text(`An error occurred: ${err.message}`)
        $('.error').removeClass('hidden');
    });
}

//A function which adds the search results to the DOM when provided response JSON from The Movie Database.
function writeSearchResults(resultJson) {
    const results = resultJson.results;
    const errorBox = $('.header').children('.error');
    if (results.length == 0) { // No results found. Display error message.
        errorBox.text('No Results Found- Please Try Again!');
        errorBox.removeClass('hidden');
    } else { // Results found: display other results and make the top result the active movie.
        errorBox.addClass('hidden');
        makeActive(results[0].id, results[0].title); 
        $('.results').html('<span class="results-header">Similar Titles</span><ul></ul>');
        for (let i = 0; i < results.length; i++) {
            //Colors each alternating list entry a darker color
            let listEntry = `<li data="${results[i].id}" ${i % 2 == 0 ? '' : 'class="odd"'}>`;
            listEntry += `<a href="#">${results[i].title}</a>`;
            listEntry += '</li>';
            $('.results ul').append(listEntry);
        }
        $('.results').removeClass('hidden');
    }
}

//A function which calls the necessary functions to make a movie in the results the 'active' movie in view.
function makeActive(activeMovieID, activeMovieTitle) {
    getMovieDetails(activeMovieID);
    getMovieCredits(activeMovieID);
    getYoutube(activeMovieTitle);
}

//A function which accepts a user-provided search term and searches the The Movie Database for people, TV shows, and movies related to that term.
//Returns a JSON object containing the top 20 search results (API default maximum is 20)
function search(searchTerm) {
    const baseUrl = 'https://api.themoviedb.org/3/search/movie';
    let params = `api_key=${mdb_api_key}&query=${encodeURIComponent(searchTerm)}`;
    let requestURL = baseUrl + '?' + params;
    fetch(requestURL)
        .then(response => {
            if (response.ok) {
                return response.json();
            }
            throw new Error(response.statusText);
        })
        .then(responseJson => writeSearchResults(responseJson))
        .catch(err => {
            $('.error').text(`An error occurred: ${err.message}`);
            $('.error').removeClass('hidden');
        });
}

function eventListener() {
    //Handles search submission
    $('#js-search').on('submit', function (event) {
        event.preventDefault();
        //Clear error message
        errorBox.text('');
        errorBox.addClass('hidden');
        let query = $('#js-search-term').val();
        search(query);
    });

    //Handles clicking on a result for details
    $('.results').on('click', 'li', function (event) {
        event.preventDefault();
        //Clear error message
        errorBox.text('');
        errorBox.addClass('hidden');
        let activeMovieID = $(this).attr('data');
        let activeMovieTitle = $(this).children('a').text();
        makeActive(activeMovieID, activeMovieTitle);
    })

    //Handles clicking on another movie in the "also appeared in" section for an actor
    $('.main').on('click', '.other-film', function (event) {
        event.preventDefault();
        //Clear error message
        errorBox.text('');
        errorBox.addClass('hidden');
        let activeMovieID = $(this).attr('data');
        let activeMovieTitle = $(this).text();
        makeActive(activeMovieID, activeMovieTitle);
    })
}

$(eventListener);