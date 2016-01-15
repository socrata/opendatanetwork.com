'use strict';

const _ = require('lodash');
const ApiController = require('./api-controller');
const numeral = require('numeral');

const apiController = new ApiController();
const defaultYear = '2013';
const defaultHealthYear = '2015';

const formatters = {

    'population' : { format : '0,0', suffix : '', display : 'population', metric : 'population' },
    'population_percent_change' : { format : '0.00', suffix : '%', display : 'population change', metric : 'population_percent_change' },
    'percent_high_school_graduate_or_higher' : { format : '0.0', suffix : '%', display : 'high school graduation rate', metric : 'percent_high_school_graduate_or_higher' },
    'percent_bachelors_degree_or_higher' : { format : '0.0', suffix : '%', display : 'college graduation rate', metric : 'percent_bachelors_degree_or_higher' },
    'median_earnings' : { format : '$0,0', suffix : '', display : 'median earnings', metric : 'median_earnings' },
    'female_median_earnings' : { format : '$0,0', suffix : '', display : 'median female earnings', metric : 'female_median_earnings' },
    'male_median_earnings' : { format : '$0,0', suffix : '', display : 'median male earnings', metric : 'male_median_earnings' },
    'female_full_time_median_earnings' : { format : '$0,0', suffix : '', display : 'median female earnings (full time)', metric : 'female_full_time_median_earnings' },
    'male_full_time_median_earnings' : { format : '$0,0', suffix : '', display : 'median male earnings (full time)', metric : 'male_full_time_median_earnings' },
    'percent_with_earnings_1_to_9999' : { format : '0.0', suffix : '%', display : 'percent earning less than $10,000', metric : 'percent_with_earnings_1_to_9999' },
    'percent_with_earnings_10000_to_14999' : { format : '0.0', suffix : '%', display : 'percent earning $10,000 to $14,999', metric : 'percent_with_earnings_10000_to_14999' },
    'percent_with_earnings_15000_to_24999' : { format : '0.0', suffix : '%', display : 'percent earning $15,000 to $24,999', metric : 'percent_with_earnings_15000_to_24999' },
    'percent_with_earnings_25000_to_34999' : { format : '0.0', suffix : '%', display : 'percent earning $25,000 to $34,999', metric : 'percent_with_earnings_25000_to_34999' },
    'percent_with_earnings_35000_to_49999' : { format : '0.0', suffix : '%', display : 'percent earning $35,000 to $49,999', metric : 'percent_with_earnings_35000_to_49999' },
    'percent_with_earnings_50000_to_64999' : { format : '0.0', suffix : '%', display : 'percent earning $50,000 to $64,999', metric : 'percent_with_earnings_50000_to_64999' },
    'percent_with_earnings_65000_to_74999' : { format : '0.0', suffix : '%', display : 'percent earning $65,000 to $74,999', metric : 'percent_with_earnings_65000_to_74999' },
    'percent_with_earnings_75000_to_99999' : { format : '0.0', suffix : '%', display : 'percent earning $75,000 to $99,999', metric : 'percent_with_earnings_75000_to_99999' },
    'percent_with_earnings_over_100000' : { format : '0.0', suffix : '%', display : 'percent earning over $100,000', metric : 'percent_with_earnings_over_100000' },
    'percent_employed' : { format : '0.0', suffix : '%' },
    'per_capita_gdp' : { format : '$0,0', suffix : '', display : 'gdp per capita', metric : 'per_capita_gdp' },
    'per_capita_gdp_percent_change' : { format : '0.0', suffix : '%', display : 'annual change in gdp', metric : 'per_capita_gdp_percent_change' },
    'adult_smoking_value' : { format : '0.0%', suffix : '', display : 'adult smoking rate', metric : 'adult_smoking_value' },
    'adult_obesity_value' : { format : '0.0%', suffix : '', display : 'adult obesity rate', metric : 'adult_obesity_value' },
    'physical_inactivity_value' : { format : '0.0%', suffix : '', display : 'physical inactivity rate', metric : 'physical_inactivity_value' },
    'excessive_drinking_value' : { format : '0.0%', suffix : '', display : 'excessive drinking rate', metric : 'excessive_drinking_value' },
    'all' : { format : '0,0.0', suffix : '', display : 'cost of living index', metric : 'index' },
    'goods' : { format : '0,0.0', suffix : '', display : 'cost of living index for goods', metric : 'index' },
    'rents' : { format : '0,0.0', suffix : '', display : 'cost of living index for rents', metric : 'index' },
    'other' : { format : '0,0.0', suffix : '', display : 'cost of living index for other', metric : 'index' },
    'business_and_finance' : { format : '0.0', suffix : '%', display : 'percent working in business and finance', metric : 'percent_employed', criterion : 'Business and Finance' },
    'computers_and_math' : { format : '0.0', suffix : '%', display : 'percent working in computers and math', metric : 'percent_employed', criterion : 'Computers and Math' },
    'construction_and_extraction' : { format : '0.0', suffix : '%',display : 'percent working in construction and extraction', metric : 'percent_employed', criterion : 'Construction and Extraction' },
    'education' : { format : '0.0', suffix : '%', display : 'percent working in eduction', metric : 'percent_employed', criterion : 'Education' },
    'engineering' : { format : '0.0', suffix : '%', display : 'percent working in engineering',  metric : 'percent_employed', criterion : 'Engineering' },
    'farming_fishing_foresty' : { format : '0.0', suffix : '%', display : 'percent farming, fishing and forestry in management', metric : 'percent_employed', criterion : 'Farming, Fishing, Foresty' },
    'fire_fighting' : { format : '0.0', suffix : '%', display : 'percent working in fire fighting', metric : 'percent_employed', criterion : 'Fire Fighting' },
    'food_service' : { format : '0.0', suffix : '%', display : 'percent working in food service', metric : 'percent_employed', criterion : 'Food Service' },
    'healthcare' : { format : '0.0', suffix : '%', display : 'percent working in healthcare', metric : 'percent_employed', criterion : 'Healthcare' },
    'health_support' : { format : '0.0', suffix : '%', display : 'percent working in health support', metric : 'percent_employed', criterion : 'Health Support' },
    'health_technicians' : { format : '0.0', suffix : '%', display : 'percent working in health technicians', metric : 'percent_employed', criterion : 'Health Technicians' },
    'janitorial' : { format : '0.0', suffix : '%', display : 'percent working in janitorial', metric : 'percent_employed', criterion : 'Janitorial' },
    'law_enforcement' : { format : '0.0', suffix : '%', display : 'percent working in law enforcement', metric : 'percent_employed', criterion: 'Law Enforcement' },
    'legal' : { format : '0.0', suffix : '%', display : 'percent working in legal', metric : 'percent_employed', criterion : 'Legal' },
    'management' : { format : '0.0', suffix : '%', display : 'percent working in management', metric : 'percent_employed', criterion : 'Management' },
    'material_moving' : { format : '0.0', suffix : '%', display : 'percent working in material moving', metric : 'percent_employed', criterion : 'Material Moving' },
    'media' : { format : '0.0', suffix : '%', display : 'percent working in media', metric : 'percent_employed', criterion : 'Media' },
    'office_and_administration' : { format : '0.0', suffix : '%', display : 'percent working in office and administration', metric : 'percent_employed', criterion : 'Office and Administration' },
    'personal_care' : { format : '0.0', suffix : '%', display : 'percent working in personal care', metric : 'percent_employed', criterion : 'Personal Care' },
    'production' : { format : '0.0', suffix : '%', display : 'percent working in production', metric : 'percent_employed', criterion : 'Production' },
    'repair' : { format : '0.0', suffix : '%', display : 'percent working in repair', metric : 'percent_employed', criterion : 'Repair' },
    'sales' : { format : '0.0', suffix : '%', display : 'percent working in sales', metric : 'percent_employed', criterion : 'Sales' },
    'social_sciences' : { format : '0.0', suffix : '%', display : 'percent working in social sciences', metric : 'percent_employed', criterion : 'Social Sciences' },
    'social_services' : { format : '0.0', suffix : '%', display : 'percent working in social services', metric : 'percent_employed', criterion : 'Social Services' },
    'transportation' : { format : '0.0', suffix : '%', display : 'percent working in transportation', metric : 'percent_employed', criterion : 'Transportation' }
};

module.exports = MetricsController;

function MetricsController() {
}

// Public methods
//
MetricsController.prototype.getMetricSummary = (params, data) => {

    switch (params.vector) {

        case 'cost_of_living':

            const costOfLivingMetric = params.metric || 'all';
            const costOfLivingYear = params.year || defaultYear;

            return getSummaryString(
                params.regions,
                costOfLivingMetric,
                costOfLivingYear,
                data.costOfLivingData,
                value => (value.year == costOfLivingYear) && (value.component.toLowerCase() == costOfLivingMetric));

        case 'earnings':

            return getSummaryString(
                params.regions,
                params.metric || 'median_earnings', 
                params.year || defaultYear, 
                data.earningsData);

        case 'education':

            return getSummaryString(
                params.regions,
                params.metric || 'percent_high_school_graduate_or_higher',
                params.year || defaultYear,
                data.educationData);

        case 'gdp':

            return getSummaryString(
                params.regions,
                params.metric || 'per_capita_gdp',
                params.year || defaultYear,
                data.gdpData);

        case 'health':

            return getSummaryString(
                params.regions,
                params.metric || 'adult_smoking_value',
                params.year || defaultHealthYear,
                data.healthData);

        case 'occupations':

            return getOccupationsString(params, data.occupationsData);

        case 'population':

            return getSummaryString(
                params.regions,
                params.metric || 'population',
                params.year || defaultYear,
                data.populationData);

        default:

            return getSummaryString(
                params.regions,
                params.metric || 'population',
                params.year || defaultYear,
                data.populationData);
    }
};

// Private functions
//
function getOccupationsString(params, data) {

    const occupationsMetricKey = params.metric || 'management';
    const occupationsYear = params.year || defaultYear;
    const formatter = formatters[occupationsMetricKey];

    if (formatter == undefined) {
        console.log('The formatter is undefined. \nmetricKey: {0}'.format(occupationsMetricKey));
        return '';
    }

    return getSummaryString(
        params.regions,
        occupationsMetricKey,
        occupationsYear,
        data,
        value => (value.year == occupationsYear) && (value.occupation == formatter.criterion));
}

function getSummaryString(regions, metricKey, year, data, filter, format) {

    filter = filter || (value => year == value.year);
    format = format || 'The {0} in {1} for {2} was {3}.';

    const rg = regions.map((region, index) => {

        const filteredData = _.filter(data[index], filter);

        if (filteredData.length == 0) {
            console.log(
                'Filter produced no results. \nmetricKey: {0}\nyear: {1}\nfilter: {2}\ndata: {2}'.format(
                    metricKey, 
                    year, 
                    filter.toString(),
                    JSON.stringify(data[index])));
            return '';
        }

        if (filteredData.length > 1) {
            console.log(
                'Filter produced more than one result. \nmetricKey: {0}\nyear: {1}\ndata: {2}'.format(
                    metricKey, 
                    year, 
                    JSON.stringify(data[index])));
        }

        const datum = filteredData[0];
        const formatter = formatters[metricKey];

        if (formatter == undefined) {
            console.log('The formatter is undefined. \nmetricKey: {0}'.format(metricKey));
            return '';
        }

        const value = datum[formatter.metric];

        if (value == undefined) {
            console.log(
                'The formatter.metric is not found in the data. \nformatter.metric: {0} \ndata: {1}'.format(
                    formatter.metric,
                    JSON.stringify(data[index])));
            return '';
        }

        return format.format(
            formatter.display,
            year,
            region.name,
            numeral(datum[formatter.metric]).format(formatter.format) + formatter.suffix);
    });

    return rg.join(' ');
}
