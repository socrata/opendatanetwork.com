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
        'population_value' : { format : '0,0', suffix : '', name : 'Population', column : 'population', years : _.range(2009, 2014), index : 0 },
        'population_change' : { format : '0.00', suffix : '%', name : 'Population Change', column : 'population_percent_change', years : _.range(2010, 2014), index : 1 },
    },
    'education' : {
        'percent_high_school_graduate_or_higher' : { format : '0.0', suffix : '%', name : 'High School Graduation Rate', column : 'percent_high_school_graduate_or_higher', years : [2013], index : 0 },
        'percent_bachelors_degree_or_higher' : { format : '0.0', suffix : '%', name : 'College Graduation Rate', column : 'percent_bachelors_degree_or_higher', years : [2013], index : 1 },
    },
    'earnings' : {
        'median_earnings' : { format : '$0,0', suffix : '', name : 'Median Earnings', column : 'median_earnings', years : [2013], index : 0 },
        'female_median_earnings' : { format : '$0,0', suffix : '', name : 'Median Female Earnings', column : 'female_median_earnings', years : [2013], index : 1 },
        'male_median_earnings' : { format : '$0,0', suffix : '', name : 'Median Male Earnings', column : 'male_median_earnings', years : [2013], index : 2 },
        'female_full_time_median_earnings' : { format : '$0,0', suffix : '', name : 'Median Female Earnings (Full Time)', column : 'female_full_time_median_earnings', years : [2013], index : 3 },
        'male_full_time_median_earnings' : { format : '$0,0', suffix : '', name : 'Median Male Earnings (Full Time)', column : 'male_full_time_median_earnings', years : [2013], index : 4 },
        'percent_with_earnings_1_to_9999' : { format : '0.0', suffix : '%', name : 'Percent Earning Less Than $10,000', column : 'percent_with_earnings_1_to_9999', years : [2013], index : 5 },
        'percent_with_earnings_10000_to_14999' : { format : '0.0', suffix : '%', name : 'Percent Earning $10,000 to $14,999', column : 'percent_with_earnings_10000_to_14999', years : [2013], index : 6 },
        'percent_with_earnings_15000_to_24999' : { format : '0.0', suffix : '%', name : 'Percent Earning $15,000 to $24,999', column : 'percent_with_earnings_15000_to_24999', years : [2013], index : 7 },
        'percent_with_earnings_25000_to_34999' : { format : '0.0', suffix : '%', name : 'Percent Earning $25,000 to $34,999', column : 'percent_with_earnings_25000_to_34999', years : [2013], index : 8 },
        'percent_with_earnings_35000_to_49999' : { format : '0.0', suffix : '%', name : 'Percent Earning $35,000 to $49,999', column : 'percent_with_earnings_35000_to_49999', years : [2013], index : 9 },
        'percent_with_earnings_50000_to_64999' : { format : '0.0', suffix : '%', name : 'Percent Earning $50,000 to $64,999', column : 'percent_with_earnings_50000_to_64999', years : [2013], index : 10 },
        'percent_with_earnings_65000_to_74999' : { format : '0.0', suffix : '%', name : 'Percent Earning $65,000 to $74,999', column : 'percent_with_earnings_65000_to_74999', years : [2013], index : 11 },
        'percent_with_earnings_75000_to_99999' : { format : '0.0', suffix : '%', name : 'Percent Earning $75,000 to $99,999', column : 'percent_with_earnings_75000_to_99999', years : [2013], index : 12 },
        'percent_with_earnings_over_100000' : { format : '0.0', suffix : '%', name : 'Percent Earning Over $100,000', column : 'percent_with_earnings_over_100000', years : [2013], index : 13 },
    },
    'gdp' : {
        'per_capita_gdp' : { format : '$0,0', suffix : '', name : 'GDP per Capita', column : 'per_capita_gdp', years : _.range(2002, 2014), index : 0 },
        'per_capita_gdp_change' : { format : '0.0', suffix : '%', name : 'Annual Change in GDP', column : 'per_capita_gdp_percent_change', years : _.range(2002, 2014), index : 1 },
    },
    'health' : {
        'adult_smoking_rate' : { format : '0.0%', suffix : '', name : 'Adult Smoking Rate', column : 'adult_smoking_value', years : [2015], index : 0 },
        'adult_obesity_rate' : { format : '0.0%', suffix : '', name : 'Adult Obesity Rate', column : 'adult_obesity_value', years : [2015], index : 1 },
        'physical_inactivity_rate' : { format : '0.0%', suffix : '', name : 'Physical Inactivity Rate', column : 'physical_inactivity_value', years : [2015], index : 2 },
        'excessive_drinking_rate' : { format : '0.0%', suffix : '', name : 'Excessive Drinking Rate', column : 'excessive_drinking_value', years : [2015], index : 3 },
    },
    'cost_of_living' : {
        'all' : { format : '0,0.0', suffix : '', name : 'Cost Of Living Index', column : 'index', years : _.range(2008, 2014), index : 0 },
        'goods' : { format : '0,0.0', suffix : '', name : 'Cost Of Living Index for Goods', column : 'index', years : _.range(2008, 2014), index : 1 },
        'rents' : { format : '0,0.0', suffix : '', name : 'Cost Of Living Index for Rents', column : 'index', years : _.range(2008, 2014), index : 2 },
        'other' : { format : '0,0.0', suffix : '', name : 'Cost Of Living Index for Other', column : 'index', years : _.range(2008, 2014), index : 3 },
    },
    'occupations' : {
        'business_and_finance' : { format : '0.0', suffix : '%', name : 'Percent Working in Business and Finance', column : 'percent_employed', criterion : 'Business and Finance', years : [2013], index : 0 },
        'computers_and_math' : { format : '0.0', suffix : '%', name : 'Percent Working in Computers and Math', column : 'percent_employed', criterion : 'Computers and Math', years : [2013], index : 1 },
        'construction_and_extraction' : { format : '0.0', suffix : '%',name : 'Percent Working in Construction and Extraction', column : 'percent_employed', criterion : 'Construction and Extraction', years : [2013], index : 2 },
        'education' : { format : '0.0', suffix : '%', name : 'Percent Working in Eduction', column : 'percent_employed', criterion : 'Education', years : [2013], index : 3 },
        'engineering' : { format : '0.0', suffix : '%', name : 'Percent Working in Engineering',  column : 'percent_employed', criterion : 'Engineering', years : [2013], index : 4 },
        'farming_fishing_foresty' : { format : '0.0', suffix : '%', name : 'Percent Working in Farming, Fishing and Forestry', column : 'percent_employed', criterion : 'Farming, Fishing, Foresty', years : [2013], index : 5 },
        'fire_fighting' : { format : '0.0', suffix : '%', name : 'Percent Working in Fire Fighting', column : 'percent_employed', criterion : 'Fire Fighting', years : [2013], index : 6 },
        'food_service' : { format : '0.0', suffix : '%', name : 'Percent Working in Food Service', column : 'percent_employed', criterion : 'Food Service', years : [2013], index : 7 },
        'healthcare' : { format : '0.0', suffix : '%', name : 'Percent Working in Healthcare', column : 'percent_employed', criterion : 'Healthcare', years : [2013], index : 8 },
        'health_support' : { format : '0.0', suffix : '%', name : 'Percent Working in Health Support', column : 'percent_employed', criterion : 'Health Support', years : [2013], index : 9 },
        'health_technicians' : { format : '0.0', suffix : '%', name : 'Percent Working in Health Technicians', column : 'percent_employed', criterion : 'Health Technicians', years : [2013], index : 10 },
        'janitorial' : { format : '0.0', suffix : '%', name : 'Percent Working in Janitorial', column : 'percent_employed', criterion : 'Janitorial', years : [2013], index : 11 },
        'law_enforcement' : { format : '0.0', suffix : '%', name : 'Percent Working in Law Enforcement', column : 'percent_employed', criterion: 'Law Enforcement', years : [2013], index : 12 },
        'legal' : { format : '0.0', suffix : '%', name : 'Percent Working in Legal', column : 'percent_employed', criterion : 'Legal', years : [2013], index : 13 },
        'management' : { format : '0.0', suffix : '%', name : 'Percent Working in Management', column : 'percent_employed', criterion : 'Management', years : [2013], index : 14 },
        'material_moving' : { format : '0.0', suffix : '%', name : 'Percent Working in Material Moving', column : 'percent_employed', criterion : 'Material Moving', years : [2013], index : 15 },
        'media' : { format : '0.0', suffix : '%', name : 'Percent Working in Media', column : 'percent_employed', criterion : 'Media', years : [2013], index : 16 },
        'office_and_administration' : { format : '0.0', suffix : '%', name : 'Percent Working in Office and Administration', column : 'percent_employed', criterion : 'Office and Administration', years : [2013], index : 17 },
        'personal_care' : { format : '0.0', suffix : '%', name : 'Percent Working in Personal Care', column : 'percent_employed', criterion : 'Personal Care', years : [2013], index : 18 },
        'production' : { format : '0.0', suffix : '%', name : 'Percent Working in Production', column : 'percent_employed', criterion : 'Production', years : [2013], index : 19 },
        'repair' : { format : '0.0', suffix : '%', name : 'Percent Working in Repair', column : 'percent_employed', criterion : 'Repair', years : [2013], index : 20 },
        'sales' : { format : '0.0', suffix : '%', name : 'Percent Working in Sales', column : 'percent_employed', criterion : 'Sales', years : [2013], index : 21 },
        'social_sciences' : { format : '0.0', suffix : '%', name : 'Percent Working in Social Sciences', column : 'percent_employed', criterion : 'Social Sciences', years : [2013], index : 22 },
        'social_services' : { format : '0.0', suffix : '%', name : 'Percent Working in Social Services', column : 'percent_employed', criterion : 'Social Services', years : [2013], index : 23 },
        'transportation' : { format : '0.0', suffix : '%', name : 'Percent Working in Transportation', column : 'percent_employed', criterion : 'Transportation', years : [2013], index : 24 }
    }
};

module.exports = MetricsController;

function MetricsController() {
}

// Public methods
//
MetricsController.prototype.getMapVariables = (params) => {

    const formatter = getFormatterOrDefault(params);
    const year = parseInt(params.year);

    var yearSelectedIndex = formatter.years.length - 1;
    
    if (!isNaN(year)) {
        var i = formatter.years.indexOf(year)
        if (i > -1) yearSelectedIndex = i;
    }

    return {
        variableSelectedIndex : formatter.index,
        yearSelectedIndex : yearSelectedIndex,
    };
}

MetricsController.prototype.getMapSummaryLinks = (params) => {

    const vector = params.vector || defaultVector;
    const formatterGroup = getFormatterGroup(vector);    
    const metric = params.metric || getDefaultMetric(vector);
    const filteredMetrics = _.filter(_.keys(formatterGroup), key => key != metric);
    
    const rg = filteredMetrics.map(metric => {
        return { url : getUrl(params, metric), text : formatterGroup[metric].name }
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
                params.metric || 'adult_smoking_rate',
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

function getFormatterOrDefault(params) {

    var vector = params.vector || defaultVector; // if the vector is missing, assign to the default vector
    var formatterGroup = getFormatterGroup(vector)

    // If the formatterGroup is not found for the vector, look it up by the defaultVector.
    //
    if (formatterGroup == null) {
        vector = defaultVector;
        formatterGroup = getFormatterGroup(vector);
    }

    // If the formatter is not found for the metric, look it up by the default metric.
    //
    var metric = params.metric || getDefaultMetric(vector);
    var formatter = formatterGroup[metric];

    if (formatter == undefined) {
        metric = getDefaultMetric(vector);
        formatter = formatterGroup[metric];
    }

    return formatter;
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
        const value = datum[formatter.column];

        if (value == undefined) {
            console.log(
                'The formatter.column is not found in the data. formatter.column: {0} \ndata: {1}'.format(
                    formatter.column,
                    JSON.stringify(data[index])));
            return '';
        }

        return format.format(
            formatter.name.toLowerCase(),
            year,
            region.name,
            numeral(datum[formatter.column]).format(formatter.format) + formatter.suffix);
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
