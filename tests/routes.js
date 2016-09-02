
casper.test.begin('routes', function testRoutes(test) {
    function url(path) {
        path = path || '';
        return 'http://localhost:3002' + path;
    }

    function exists(path, message) {
        message = message || path + ' exists';
        casper.thenOpen(url(path), function(response) {
            test.assert(response.status < 400, message);
        });
    }

    function redirects(path, destination, message) {
        message = message || path + ' redirects to ' + destination;
        casper.thenOpen(url(), function(response) {
            test.assertUrlMatch(destination, message);
        });
    }

    casper.start(url());

    exists('/', 'homepage exists');

    // Looks like Casper isn't the tool to test these redirects.
    // Will look into using Chakram like in the ODN Backend.

    /*
    redirects(
        '/region/0500000US53033/King_County_WA/population/population/2013?',
        '/entity/0500000US53033/King_County_WA/demographics.population.count?year=2013');
    redirects(
        '/region/0500000US53033/King_County_WA/population/population_change/2013?',
        '/entity/0500000US53033/King_County_WA/demographics.population.change?year=2013');
    redirects(
        '/region/310M200US42660/Seattle_Metro_Area_(WA)/cost_of_living/all/2013?',
        '/entity/310M200US42660/Seattle_Metro_Area_WA/economy.cost_of_living.index?year=2013&component=all');
    redirects(
        '/region/0400000US53/Washington/health_indicators/heart_attack_rate/2013?',
        '/entity/0400000US53/Washington/health.health_indicators.data_value?year=2013&question=ever_told_you_had_a_heart_attack_myocardial_infarction');
    */

    casper.run(function() {
        test.done();
    });
});

