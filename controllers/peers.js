'use strict';

const request = require('request-promise');
const _ = require('lodash');
const NodeCache = require('node-cache');

const peerCache = new NodeCache({stdTTL: 0});


class Peers {
    static get(uid) {
        const n = 10;

        return new Promise((resolve, reject) => {
            const key = `${uid}-${n}`;

            peerCache.get(key, (error, value) => {
                if (value === undefined) {
                    const url = `https://odn-peers.herokuapp.com/peers/${uid}?n=${n}`;
                    request(url).then(body => {
                        const peers = JSON.parse(body).peers;
                        peerCache.set(key, peers);
                        resolve(peers);
                    }).catch(error => { throw error; });
                } else {
                    resolve(value);
                }
            });
        });
    }

    static fromParams(params) {
        return new Promise((resolve, reject) => {
            const regions = params.regions;
            if (regions.length === 0) {
                resolve([]);
            } else {
                const uid = regions[0].id;
                Peers.get(uid).then(peers => {
                    const uids = regions.map(region => region.id);
                    const names = regions.map(region => region.name);
                    const vector = params.vector;

                    resolve(peers.filter(peer => {
                        return uids.indexOf(peer.id) < 0;
                    }).map(peer => {
                        const uidString = uids.concat(peer.id).join('-');
                        const nameString = names.concat(peer.name).map(name => {
                            return name.replace(/ /g, '_').replace(/,/g, '');
                        }).join('-');

                        const url =`/region/${uidString}/${nameString}/${vector}`;
                        return _.extend({}, peer, {url});
                    }).slice(0, 5));
                }, error => { throw error; });

            }
        });
    }
}

module.exports = Peers;
