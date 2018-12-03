


function submitListener() {
    $('#js-search').on('submit', function (event) {
        event.preventDefault();
        console.log("Form Submitted");
    });
}

$(submitListener);