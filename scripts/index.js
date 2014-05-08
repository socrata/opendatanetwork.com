    var unslider = $('#slides').unslider();
  
    $('.slide-arrow').click(function() {
        var fn = this.className.split(' ')[1];
        unslider.data('unslider')[fn]();
    });
