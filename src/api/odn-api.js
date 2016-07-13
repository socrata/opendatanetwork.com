class OdnApi {

    constructor() {

        this.DATA_AVAILABILITY_URL = 'http://odn-backend.herokuapp.com/data/v1/availability';
        this.DATA_CONSTRAINT_URL = 'http://odn-backend.herokuapp.com/data/v1/constraint/{0}';
        this.DATA_VALUES_URL = 'http://odn-backend.herokuapp.com/data/v1/values';
    }

    getDataAvailability(regions) {

        return new Promise((resolve, reject) => {

            const url = this.buildUrl(this.DATA_AVAILABILITY_URL, {
                entity_id: regions.map(region => region.id).join(','),
            });

            resolve(d3.promise.json(url));
        });
    }

    getDataContraint(regions, variable, constraint) {

        return new Promise((resolve, reject) => {

            const url = this.buildUrl(this.DATA_CONSTRAINT_URL.format(variable.id), {
                entity_id: regions.map(region => region.id).join(','),
                constraint: constraint
            });

            resolve(d3.promise.json(url));
        });
    }

    getDataValues(regions, variable) {

       return new Promise((resolve, reject) => {

            const url = this.buildUrl(this.DATA_VALUES_URL, {
                entity_id: regions.map(region => region.id).join(','),
                variable: variable.id
            });

            resolve(d3.promise.json(url));
        });
    };

    buildUrl(path, params) {

        const validParams = _.omit(params, param => param == []);
        const paramString = $.param(validParams);
        const url = `${path}${path[path.length - 1] == '?' ? '' : '?'}${paramString}`;

        console.log(url);
        
        return url;
    }
}
