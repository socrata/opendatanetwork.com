    var unslider = $('#slides').unslider({
            fluid: false
        });
  
    $('.slide-arrow').click(function() {
        var fn = this.className.split(' ')[1];
        unslider.data('unslider')[fn]();
    });
