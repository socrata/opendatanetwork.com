
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

    // region name filled in if missing
    redirects('/region/0400000US53/', '/region/0400000US53/Washington/');

    // invalid vector redirects to default
    redirects('/region/0400000US53/Washington/invalid-vector/',
              '/region/0400000US53/Washington/population');
    redirects('/region/0400000US53/Washington/invalid-vector/invalid-variable/invalid-year',
              '/region/0400000US53/Washington/population');

    // if there is no data for the selected vector, redirect to default
    redirects('/region/310M200US17200/Claremont_Micro_Area_(NH-VT)/gdp',
              '/region/310M200US17200/Claremont_Micro_Area_(NH-VT)/population');

    casper.run(function() {
        test.done();
    });
});

