'use strict';

// Needs to be in client-side script until we get promises on the server
//
$(document).ready(function() {
    
    // Locations by state
    //
    const controller = new ApiController();
    
    controller.getMostPopulousStates(100) // there's 51 with district of columbia
        .then(states => {

            const rg = states.map(result => { return { name : result.child_name, id : result.child_id, msas : [], cities : [], counties : [] }; });
            const promises = [];

            for (var i = 0; i < rg.length; i++) {

                promises.push(getMsaPromise(rg[i]));
                promises.push(getCityPromise(rg[i]));
                promises.push(getCountyPromise(rg[i]));
            }

            Promise.all(promises).then(results => console.log(JSON.stringify(rg)));
       });
});

function getMsaPromise(state) {

    const controller = new ApiController();

    return controller.getMetrosInState(state.id, 10)
        .then(results => {
            state.msas = results.map(result => { 
                return { 
                    name : result.child_name, 
                    id : result.child_id,
                    url : '/region/' + result.child_id + '/' + result.child_name.replace(/ /g, '_').replace(/,/g, ''),
                } 
            });
        });
}

function getCityPromise(state) {

    const controller = new ApiController();

    return controller.getCitiesInState(state.id, 10)
        .then(results => {
            state.cities = results.map(result => { 
                return { 
                    name : result.child_name, 
                    id : result.child_id, 
                    url : '/region/' + result.child_id + '/' + result.child_name.replace(/ /g, '_').replace(/,/g, '')
                } 
            });
        });
}

function getCountyPromise(state) {

    const controller = new ApiController();

    return controller.getCountiesInState(state.id, 10)
        .then(results => {
            state.counties = results.map(result => { 
                return { 
                    name : result.child_name, 
                    id : result.child_id,
                    url : '/region/' + result.child_id + '/' + result.child_name.replace(/ /g, '_').replace(/,/g, '')
                } 
            });
        });
}


