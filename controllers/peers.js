'use strict';

const request = require('request');
const _ = require('lodash');

class Peers {
    static fromParams(params) {
        const regions = params.regions;

        return new Promise((resolve, reject) => {
            if (regions.length === 0) {
                resolve([]);
            } else {
                const uid = regions[0].id;
                const url = `https://odn-peers.herokuapp.com/peers/${uid}?n=10`;
                request.get(url, (error, response, body) => {
                    if (error || response.statusCode != 200) {
                        console.log(`error ${response.statusCode} for ${url}`);
                        resolve([]);
                    } else {
                        const uids = regions.map(region => region.id);
                        const vector = params.vector;
                        resolve(JSON.parse(body).peers.filter(peer => {
                            return uids.indexOf(peer.id) < 0;
                        }).map(peer => {
                            const uidString = uids.concat(peer.id).join('-');
                            const url =`/region/${uidString}/${vector}`;
                            return _.extend({}, peer, {url});
                        }).slice(0, 5));
                    }
                });
            }
        });
    }
}

module.exports = Peers;
