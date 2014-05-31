 var request = require('superagent');

 request
    .get('http://sworlphotoapp.com')
    .end(function(res){

        if (res.ok) 
        {
            console.log(res.status + " " + res.body.version);
        } 
        else 
        {
            console.log(res.status);
        }
   });