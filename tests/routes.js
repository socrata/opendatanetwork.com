
casper.test.begin('routes', function testRoutes(test) {
    function url(path) {
        path = path || '';
        return 'http://localhost:3002' + path;
    }

    casper.start(url());

    function exists(path, message) {
        message = message || path + ' exists';
        casper.thenOpen(url(path), function(response) {
            test.assert(response.status < 400, message);
        });
    }

    function redirects(path, destination, message) {
        message = message || path + ' redirects to ' + destination;
        casper.thenOpen(url(path), function(response) {
            test.assertUrlMatch(destination, message);
        });
    }

    exists('/',
        'homepage exists');
    redirects('/region/0400000US53/',
        '/region/0400000US53/Washington/',
        'one region name filled in if missing');
    redirects('/region/0400000US53/Washington/invalid-vector/',
        '/region/0400000US53/Washington/population',
        'one region with invalid vector redirects to default vector');
    redirects('/region/0400000US53/Washington/invalid-vector/invalid-variable/invalid-year',
        '/region/0400000US53/Washington/population',
        'one region invalid vector, variable, and year redirects to default vector');
    redirects('/region/310M200US17200/Claremont_Micro_Area_(NH-VT)/gdp',
        '/region/310M200US17200/Claremont_Micro_Area_(NH-VT)/population',
        'one region redirects to default vector if no data is available');
    exists('/region/310M200US42660-310M200US33460/Seattle_Metro_Area_(WA)-Minneapolis_Metro_Area_(MN-WI)/',
        'two regions same type');
    exists('/region/310M200US42660-1600000US5363000/Seattle_Metro_Area_(WA)-Seattle_WA/',
        'two regions different types');
    exists('/region/310M200US42660-310M200US33460/',
        'two regions name filled in if missing');
    redirects('/region/310M200US42660-310M200US33460/Seattle_Metro_Area_(WA)-Minneapolis_Metro_Area_(MN-WI)/invalid-vector',
        '/region/310M200US42660-310M200US33460/Seattle_Metro_Area_(WA)-Minneapolis_Metro_Area_(MN-WI)/population',
        'two regions with invalid vector redirects to default vector');
    exists('/region/310M200US42660-1600000US5363000/Seattle_Metro_Area_(WA)-Seattle_WA/gdp',
        'two regions work with data for only one');


    casper.run(function() {
        test.done();
    });
});

