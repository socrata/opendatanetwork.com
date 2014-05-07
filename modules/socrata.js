module.exports = {

	test : function(response) {

		console.log('fluffy called');

		var req = require('request');

		req.get({
				url : 'https://opendata.socrata.com/resource/ipcf-wxrw.json/',
				headers : {	'X-App-Token' : 'w2mkQq1qqrz41LVCYJQvRumgA'	}
			},		    
		    function(error, resp, body) {

		    	console.log('error: ' + error);
		    	console.log('resp: ' + resp);
		    	console.log('resp.statusCode: ' + resp.statusCode);

				 if (!error && resp.statusCode == 200) {
					 console.log(body);
				 }
  		    } 
		);
	}
};