'use strict';

class OdnApi {

    getDataAvailability(regions) {

        return new Promise((resolve, reject) => {

            const url = this.buildUrl(GlobalConstants.DATA_AVAILABILITY_URL, {
                app_token: GlobalConstants.APP_TOKEN,
                entity_id: regions.map(region => region.id).join(','),
            });

            resolve(d3.promise.json(url));
        });
    }

    getDataConstraint(regions, variable, constraint) {

        return new Promise((resolve, reject) => {

            const url = this.buildUrl(GlobalConstants.DATA_CONSTRAINT_URL.format(variable.id), {
                app_token: GlobalConstants.APP_TOKEN,
                entity_id: regions.map(region => region.id).join(','),
                constraint: constraint
            });

            resolve(d3.promise.json(url));
        });
    }

    getDataValues(regions, variable, constraint, forecast) {

       return new Promise((resolve, reject) => {

            const params = {
                app_token: GlobalConstants.APP_TOKEN,
                entity_id: regions.map(region => region.id).join(','),
                format: 'google',
                variable: variable,
            };

            if (constraint)
                _.extend(params, constraint);

            if (forecast)
                params.forecast = forecast;

            const url = this.buildUrl(GlobalConstants.DATA_VALUES_URL, params);

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
