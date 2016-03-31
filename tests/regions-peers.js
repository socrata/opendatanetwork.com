
casper.test.begin('regions-peers', function checkHomepage(test) {

    casper.start('http://localhost:3002/region/8600000US98117/98117_ZIP_Code');

    casper.then(function() {

        test.assertNotVisible('.similar-regions', 'similar-regions is not visible');
    });

    casper.run(function() {
        test.done();
    });
});

