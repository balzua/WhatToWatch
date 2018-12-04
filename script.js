const mdb_api_key = 'c3a54b08f36afeb83e13c3643c7c2acd';

function renderResults(resultJson) {
    $('.results').html('');
    console.log(resultJson);
    let results = resultJson.results;
    console.log(results);
    for (let i = 0; i < results.length; i++) {
        let listEntry = `<div class="result ${i % 2 == 0 ? '' : 'odd'}">`;
        listEntry += `<span class="result-title">${results[i].title}</span><br>`;
        listEntry += `<span class="result-date">${results[i].release_date}</span>`;
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
    $('#results').on('click', '.result', function (event) {
        console.log($(this).html());
    })
}

$(eventListener);