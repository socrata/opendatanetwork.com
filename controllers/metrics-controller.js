'use strict';

const _ = require('lodash');
const ApiController = require('./api-controller');
const numeral = require('numeral');

const apiController = new ApiController();
const defaultYear = '2013';
const defaultHealthYear = '2015';
const defaultVector = 'population';

const formatterGroups = {

    'population' : {
        'population_value' : { format : '0,0', suffix : '', display : 'Population', dataKey : 'population' },
        'population_change' : { format : '0.00', suffix : '%', display : 'Population Change', dataKey : 'population_percent_change' },
    },
    'education' : {
        'percent_high_school_graduate_or_higher' : { format : '0.0', suffix : '%', display : 'High School Graduation Rate', dataKey : 'percent_high_school_graduate_or_higher' },
        'percent_bachelors_degree_or_higher' : { format : '0.0', suffix : '%', display : 'College Graduation Rate', dataKey : 'percent_bachelors_degree_or_higher' },
    },
    'earnings' : {
        'median_earnings' : { format : '$0,0', suffix : '', display : 'Median Earnings', dataKey : 'median_earnings' },
        'female_median_earnings' : { format : '$0,0', suffix : '', display : 'Median Female Earnings', dataKey : 'female_median_earnings' },
        'male_median_earnings' : { format : '$0,0', suffix : '', display : 'Median Male Earnings', dataKey : 'male_median_earnings' },
        'female_full_time_median_earnings' : { format : '$0,0', suffix : '', display : 'Median Female Earnings (Full Time)', dataKey : 'female_full_time_median_earnings' },
        'male_full_time_median_earnings' : { format : '$0,0', suffix : '', display : 'Median Male Earnings (Full Time)', dataKey : 'male_full_time_median_earnings' },
        'percent_with_earnings_1_to_9999' : { format : '0.0', suffix : '%', display : 'Percent Earning Less Than $10,000', dataKey : 'percent_with_earnings_1_to_9999' },
        'percent_with_earnings_10000_to_14999' : { format : '0.0', suffix : '%', display : 'Percent Earning $10,000 to $14,999', dataKey : 'percent_with_earnings_10000_to_14999' },
        'percent_with_earnings_15000_to_24999' : { format : '0.0', suffix : '%', display : 'Percent Earning $15,000 to $24,999', dataKey : 'percent_with_earnings_15000_to_24999' },
        'percent_with_earnings_25000_to_34999' : { format : '0.0', suffix : '%', display : 'Percent Earning $25,000 to $34,999', dataKey : 'percent_with_earnings_25000_to_34999' },
        'percent_with_earnings_35000_to_49999' : { format : '0.0', suffix : '%', display : 'Percent Earning $35,000 to $49,999', dataKey : 'percent_with_earnings_35000_to_49999' },
        'percent_with_earnings_50000_to_64999' : { format : '0.0', suffix : '%', display : 'Percent Earning $50,000 to $64,999', dataKey : 'percent_with_earnings_50000_to_64999' },
        'percent_with_earnings_65000_to_74999' : { format : '0.0', suffix : '%', display : 'Percent Earning $65,000 to $74,999', dataKey : 'percent_with_earnings_65000_to_74999' },
        'percent_with_earnings_75000_to_99999' : { format : '0.0', suffix : '%', display : 'Percent Earning $75,000 to $99,999', dataKey : 'percent_with_earnings_75000_to_99999' },
        'percent_with_earnings_over_100000' : { format : '0.0', suffix : '%', display : 'Percent Earning Over $100,000', dataKey : 'percent_with_earnings_over_100000' },
    },
    'gdp' : {
        'per_capita_gdp' : { format : '$0,0', suffix : '', display : 'GDP per Capita', dataKey : 'per_capita_gdp' },
        'per_capita_gdp_change' : { format : '0.0', suffix : '%', display : 'Annual Change in GDP', dataKey : 'per_capita_gdp_percent_change' },
    },
    'health' : {
        'adult_smoking_percent' : { format : '0.0%', suffix : '', display : 'Adult Smoking Rate', dataKey : 'adult_smoking_value' },
        'adult_obesity_percent' : { format : '0.0%', suffix : '', display : 'Adult Obesity Rate', dataKey : 'adult_obesity_value' },
        'physical_inactivity_percent' : { format : '0.0%', suffix : '', display : 'Physical Inactivity Rate', dataKey : 'physical_inactivity_value' },
        'excessive_drinking_percent' : { format : '0.0%', suffix : '', display : 'Excessive Drinking Rate', dataKey : 'excessive_drinking_value' },
    },
    'cost_of_living' : {
        'all' : { format : '0,0.0', suffix : '', display : 'Cost Of Living Index', dataKey : 'index' },
        'goods' : { format : '0,0.0', suffix : '', display : 'Cost Of Living Index for Goods', dataKey : 'index' },
        'rents' : { format : '0,0.0', suffix : '', display : 'Cost Of Living Index for Rents', dataKey : 'index' },
        'other' : { format : '0,0.0', suffix : '', display : 'Cost Of Living Index for Other', dataKey : 'index' },
    },
    'occupations' : {
        'business_and_finance' : { format : '0.0', suffix : '%', display : 'Percent Working in Business and Finance', dataKey : 'percent_employed', criterion : 'Business and Finance' },
        'computers_and_math' : { format : '0.0', suffix : '%', display : 'Percent Working in Computers and Math', dataKey : 'percent_employed', criterion : 'Computers and Math' },
        'construction_and_extraction' : { format : '0.0', suffix : '%',display : 'Percent Working in Construction and Extraction', dataKey : 'percent_employed', criterion : 'Construction and Extraction' },
        'education' : { format : '0.0', suffix : '%', display : 'Percent Working in Eduction', dataKey : 'percent_employed', criterion : 'Education' },
        'engineering' : { format : '0.0', suffix : '%', display : 'Percent Working in Engineering',  dataKey : 'percent_employed', criterion : 'Engineering' },
        'farming_fishing_foresty' : { format : '0.0', suffix : '%', display : 'Percent Working in Farming, Fishing and Forestry', dataKey : 'percent_employed', criterion : 'Farming, Fishing, Foresty' },
        'fire_fighting' : { format : '0.0', suffix : '%', display : 'Percent Working in Fire Fighting', dataKey : 'percent_employed', criterion : 'Fire Fighting' },
        'food_service' : { format : '0.0', suffix : '%', display : 'Percent Working in Food Service', dataKey : 'percent_employed', criterion : 'Food Service' },
        'healthcare' : { format : '0.0', suffix : '%', display : 'Percent Working in Healthcare', dataKey : 'percent_employed', criterion : 'Healthcare' },
        'health_support' : { format : '0.0', suffix : '%', display : 'Percent Working in Health Support', dataKey : 'percent_employed', criterion : 'Health Support' },
        'health_technicians' : { format : '0.0', suffix : '%', display : 'Percent Working in Health Technicians', dataKey : 'percent_employed', criterion : 'Health Technicians' },
        'janitorial' : { format : '0.0', suffix : '%', display : 'Percent Working in Janitorial', dataKey : 'percent_employed', criterion : 'Janitorial' },
        'law_enforcement' : { format : '0.0', suffix : '%', display : 'Percent Working in Law Enforcement', dataKey : 'percent_employed', criterion: 'Law Enforcement' },
        'legal' : { format : '0.0', suffix : '%', display : 'Percent Working in Legal', dataKey : 'percent_employed', criterion : 'Legal' },
        'management' : { format : '0.0', suffix : '%', display : 'Percent Working in Management', dataKey : 'percent_employed', criterion : 'Management' },
        'material_moving' : { format : '0.0', suffix : '%', display : 'Percent Working in Material Moving', dataKey : 'percent_employed', criterion : 'Material Moving' },
        'media' : { format : '0.0', suffix : '%', display : 'Percent Working in Media', dataKey : 'percent_employed', criterion : 'Media' },
        'office_and_administration' : { format : '0.0', suffix : '%', display : 'Percent Working in Office and Administration', dataKey : 'percent_employed', criterion : 'Office and Administration' },
        'personal_care' : { format : '0.0', suffix : '%', display : 'Percent Working in Personal Care', dataKey : 'percent_employed', criterion : 'Personal Care' },
        'production' : { format : '0.0', suffix : '%', display : 'Percent Working in Production', dataKey : 'percent_employed', criterion : 'Production' },
        'repair' : { format : '0.0', suffix : '%', display : 'Percent Working in Repair', dataKey : 'percent_employed', criterion : 'Repair' },
        'sales' : { format : '0.0', suffix : '%', display : 'Percent Working in Sales', dataKey : 'percent_employed', criterion : 'Sales' },
        'social_sciences' : { format : '0.0', suffix : '%', display : 'Percent Working in Social Sciences', dataKey : 'percent_employed', criterion : 'Social Sciences' },
        'social_services' : { format : '0.0', suffix : '%', display : 'Percent Working in Social Services', dataKey : 'percent_employed', criterion : 'Social Services' },
        'transportation' : { format : '0.0', suffix : '%', display : 'Percent Working in Transportation', dataKey : 'percent_employed', criterion : 'Transportation' }
    }
};

module.exports = MetricsController;

function MetricsController() {
}

// Public methods
//
MetricsController.prototype.getMapSummaryLinks = (params) => {

    const vector = params.vector || defaultVector;
    const formatterGroup = getFormatterGroup(vector);    
    const metric = params.metric || getDefaultMetric(vector);
    const filteredMetrics = _.filter(_.keys(formatterGroup), key => key != metric);
    
    const rg = filteredMetrics.map(metric => {
        return { url : getUrl(params, metric), text : formatterGroup[metric].display }
    });

    return rg;
}

MetricsController.prototype.getMapSummary = (params, data) => {

    switch (params.vector) {

        case 'cost_of_living':

            const costOfLivingMetric = params.metric || 'all';
            const costOfLivingYear = params.year || defaultYear;

            return getSummary(
                params.vector,
                costOfLivingMetric,
                costOfLivingYear,
                params.regions,
                data.costOfLivingData,
                value => (value.year == costOfLivingYear) && (value.component.toLowerCase() == costOfLivingMetric));

        case 'earnings':

            return getSummary(
                params.vector,
                params.metric || 'median_earnings', 
                params.year || defaultYear, 
                params.regions,
                data.earningsData);

        case 'education':

            return getSummary(
                params.vector,
                params.metric || 'percent_high_school_graduate_or_higher',
                params.year || defaultYear,
                params.regions,
                data.educationData);

        case 'gdp':

            return getSummary(
                params.vector,
                params.metric || 'per_capita_gdp',
                params.year || defaultYear,
                params.regions,
                data.gdpData);

        case 'health':

            return getSummary(
                params.vector,
                params.metric || 'adult_smoking_value',
                params.year || defaultHealthYear,
                params.regions,
                data.healthData);

        case 'occupations':

            return getOccupationsSummary(params, data.occupationsData);

        case 'population':

            return getSummary(
                params.vector,
                params.metric || 'population_value',
                params.year || defaultYear,
                params.regions,
                data.populationData);

        default:

            return getSummary(
                defaultVector,
                params.metric || 'population_value',
                params.year || defaultYear,
                params.regions,
                data.populationData);
    }
};

// Private functions
//
function getDefaultMetric(vector) {

    const formatterGroup = getFormatterGroup(vector);
    return _.keys(formatterGroup)[0];
}

function getFormatter(vector, metric) {

    const formatterGroup = getFormatterGroup(vector);

    if (formatterGroup == undefined)
        return null;

    const formatter = formatterGroup[metric];

    if (formatter == undefined) {
        console.log('The formatter is undefined. metric: {0}'.format(metric));
        return null;
    }
    
    return formatter;
}

function getFormatterGroup(vector) {

    const formatterGroup = formatterGroups[vector];

    if (formatterGroup == undefined) {
        console.log('The formatterGroup is undefined. vector: {0}'.format(vector));
        return null;
    }

    return formatterGroup;
}

function getOccupationsSummary(params, data) {

    const occupationsMetric = params.metric || 'management';
    const occupationsYear = params.year || defaultYear;
    const formatter = getFormatter('occupations', occupationsMetric);
    
    if (formatter == null)
        return '';

    return getSummary(
        'occupations',
        occupationsMetric,
        occupationsYear,
        params.regions,
        data,
        value => (value.year == occupationsYear) && (value.occupation == formatter.criterion));
}

function getSummary(vector, metric, year, regions, data, filter, format) {

    filter = filter || (value => year == value.year);
    format = format || 'The {0} in {1} for {2} was {3}.';

    const formatter = getFormatter(vector, metric);
    
    if (formatter == null)
        return '';

    const rg = regions.map((region, index) => {

        const filteredData = _.filter(data[index], filter);

        if (filteredData.length == 0) {
            console.log(
                'Filter produced no results. metricKey: {0} year: {1} filter: {2} \ndata: {2}'.format(
                    metric, 
                    year, 
                    filter.toString(),
                    JSON.stringify(data[index])));
            return '';
        }

        if (filteredData.length > 1) {
            console.log(
                'Filter produced more than one result. metricKey: {0} year: {1} \ndata: {2}'.format(
                    metric, 
                    year, 
                    JSON.stringify(data[index])));
        }

        const datum = filteredData[0];
        const value = datum[formatter.dataKey];

        if (value == undefined) {
            console.log(
                'The formatter.dataKey is not found in the data. formatter.dataKey: {0} \ndata: {1}'.format(
                    formatter.dataKey,
                    JSON.stringify(data[index])));
            return '';
        }

        return format.format(
            formatter.display.toLowerCase(),
            year,
            region.name,
            numeral(datum[formatter.dataKey]).format(formatter.format) + formatter.suffix);
    });

    return rg.join(' ');
}

function getUrl(params, metric) {

    var url = '/region';

    // Region ids
    //
    const regionIds = params.regions.map(region => region.id);
    url += '/' + regionIds.join('-');

    // Region names
    //
    const regionNames = params.regions.map(region => region.name.replace(/ /g, '_').replace(/,/g, ''));
    url += '/' + regionNames.join('-');
    url += '/' + (params.vector || defaultVector);
    url += '/' + metric;

    return url;
}
