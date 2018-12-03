const mdb_api_key = 'c3a54b08f36afeb83e13c3643c7c2acd';

//A function which accepts a user-provided search term and searches the The Movie Database for people, TV shows, and movies related to that term.
//Returns a JSON object containing the top 20 search results. 
function search(searchTerm) {
    const baseUrl = 'https://api.themoviedb.org/3/search/multi';
    let params = `api_key=${mdb_api_key}&query=${encodeURIComponent(searchTerm)}`;
    let requestURL = baseUrl + '?' + params;
    fetch(requestURL)
        .then(response => response.json())
        .then(responseJson => console.log(responseJson));
    return 'ok'
}

function submitListener() {
    $('#js-search').on('submit', function (event) {
        event.preventDefault();
        let query = $('#js-search-term').val();
        let resultsList = search(query);
    });
}

$(submitListener);