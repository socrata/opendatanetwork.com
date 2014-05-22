$(document).ready(function() {
    
    // Init slides
    //
    $('#slides-list').slidesjs({
        width: 1280,
        height: 528,
        play: {
            active: true,
            effect: 'slide',
            interval: 10000,
            auto: true,
            pauseOnHover: false
        }
    });

    // Init popovers
    //
    var originalUrl = document.URL;

    $('#article-modal').on('shown.bs.modal', function(e) {
        
        console.log('shown.bs.modal');

        var url = $(e.relatedTarget).attr('href');
        window.history.pushState({}, null, url);

        var script = 'http://s7.addthis.com/js/250/addthis_widget.js#domready=1';

        if (window.addthis) {
            window.addthis = null;
            window._adr = null;
            window._atc = null;
            window._atd = null;
            window._ate = null;
            window._atr = null;
            window._atw = null;
        }

        $.getScript(script, function() {
            addthis.init();
        });
    })

    $('#article-modal').on('hide.bs.modal', function() {
        
        console.log('hide.bs.modal');
        console.log(originalUrl);

        window.history.replaceState({}, null, originalUrl);
        $(this).removeData();
    })

    $(window).bind('popstate', function(event) {

        console.log('popstate');
        $('#article-modal').modal('hide');
    });
});