
casper.test.begin('routes', function testRoutes(test) {
    function url(path) {
        path = path || '';
        return 'http://localhost:3002' + path;
    }

    casper.start(url());

    function urlExists(path) {
        casper.thenOpen(url(path), function(response) {
            test.assert(response.status < 400, path + ' exists');
        });
    }

    function redirects(path, destination) {
        casper.thenOpen(url(path), function(response) {
            test.assert(response.status < 400, path + ' exists');
            test.assertUrlMatch(destination, path + ' redirects to ' + destination);
        });
    }


    urlExists('/');
    redirects('/region/0400000US53/', '/region/0400000US53/Washington/');
    urlExists('/region/0400000US53/Washington/');
    redirects('/region/0400000US53/Washington/invalid-vector/', '/region/0400000US53/Washington/population');
    redirects('/region/0400000US53/Washington/invalid-vector/invalid-variable/invalid-year', '/region/0400000US53/Washington/population');

    casper.run(function() {
        test.done();
    });
});

