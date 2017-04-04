'use strict';

const _ = require('lodash');
const htmlencode = require('htmlencode').htmlEncode;
const moment = require('moment');
const numeral = require('numeral');

const Dataset = require('../models/dataset');
const Category = require('../models/category');
const Place = require('../models/place');

const Request = require('../lib/request');
const DatasetHelper = require('../lib/dataset-helper');
const ParamsHelper = require('../lib/params-helper');
const ErrorHandler = require('../lib/error-handler');

const GlobalConfig = require('../../src/config');

//TODO: Same var in search/home controller. Extract it out.
const quickLinksCount = 15;

class DatasetController {
    static show(req, res) {
        const domain = req.params.domain;
        const id = req.params.id;

        // We can have a dataset that exists on the old backend or the new backend.  Unfortunately all the "sample values"
        // exist in the cachedContents nodes of the old backend dataset JSON.  Also we want the "view top 100" link to use the
        // new dataset.
        //
        const originalDatasetPromise = Dataset.datasetSummary(domain, id);
        const datasetMigrationsPromise = Dataset.datasetMigrations(domain, id);

        const promises = Promise.all([
            originalDatasetPromise,
            // We swallow the 404 error that comes from the migrations service
            datasetMigrationsPromise.catch(function(){})
        ]);

        promises.then(data => {
            const originalDataset = data[0];
            const migrations = data[1];

            var nbeId = null;
            var obeId = null;

            if (migrations == null || migrations.error) {
                if (originalDataset.newBackend)
                    nbeId = originalDataset.id;
                else
                    obeId = originalDataset.id;
            }
            else {
                nbeId = originalDataset.newBackend ? originalDataset.id : migrations.nbeId;
                obeId = originalDataset.newBackend ? migrations.obeId : originalDataset.id;
            }

            // Remaining promises
            //
            const paramsPromise = ParamsHelper.parameters(req, res);
            const categoriesPromise = Category.categories(quickLinksCount);
            const domainsPromise = Category.domains(quickLinksCount);
            const locationsPromise = Place.locations();

            var rg = [paramsPromise, categoriesPromise, domainsPromise, locationsPromise];

            // If we have a new backend dataset, fetch the old backend dataset to get cachedContents "sample values".
            //
            if ((originalDataset.newBackend) && obeId) {
                rg.push(Dataset.datasetSummary(domain, obeId)); // old dataset
            }

            // Execute remaining promises
            //
            const allPromise = Promise.all(rg);

            allPromise.then(data => {

                try {
                    var oldDataset;

                    // If we add promises above, we need to keep these indices correct.
                    //
                    if (data.length == 5)
                        oldDataset = data[4];
                    else if (!originalDataset.newBackend)
                        oldDataset = originalDataset;
                    else
                        oldDataset = null;

                    const params = data[0];
                    const originalColumns = _.filter(originalDataset.columns, DatasetHelper.isNotComputedField);

                    if (oldDataset) {

                        const oldColumns = _.filter(oldDataset.columns, DatasetHelper.isNotComputedField);

                        // If the original columns do not have cacheContents, get the cached contents of the matching
                        // field name from the old dataset and attach it to the original column.
                        //
                        originalColumns.forEach(originalColumn => {

                            if (!originalColumn.cachedContents) {

                                var rg = _.filter(oldColumns, o => originalColumn.fieldName == o.fieldName);

                                if (rg.length > 0)
                                    originalColumn.cachedContents = rg[0].cachedContents;
                            }
                        });
                    }

                    const columnsWithDescriptions = _.filter(originalColumns, column => !_.isEmpty(column.description));
                    const hasDescriptions = (columnsWithDescriptions.length > 0);

                    const columnsWithSampleValues = _.filter(originalColumns, column => {
                        return column.cachedContents && column.cachedContents.top;
                    });
                    const hasSampleValues = (columnsWithSampleValues.length > 0);

                    const templateParams = {
                        GlobalConfig,
                        params,
                        title: originalDataset.name,
                        dataset: {
                            domain,
                            id,
                            descriptionHtml: htmlencode(originalDataset.description).replace('\n', '<br>'),
                            name: originalDataset.name,
                            tags: originalDataset.tags || [],
                            columns: originalColumns,
                            hasDescriptions,
                            hasSampleValues,
                            nbeId,
                            updatedAtString: moment(new Date(originalDataset.viewLastModified * 1000)).format('D MMM YYYY')
                        },
                        debugInfo: {
                            id,
                            nbeId,
                            obeId,
                            newBackend: originalDataset.newBackend,
                            migrationsError: migrations == null || migrations.error,
                        },
                        quickLinks: {
                            categories: data[1],
                            domains: data[1].results,
                            ref: 'dp',
                            regions: data[3].slice(0, quickLinksCount),
                        },
                        css: [
                            '/styles/dataset.css'
                        ],
                        scripts: [
                            '/lib/third-party/jquery.dotdotdot.min.js',
                            '/lib/third-party/lodash.min.js',
                            '/lib/third-party/d3.min.js',
                            '/lib/third-party/d3.promise.min.js',
                            '/lib/third-party/js.cookie-2.1.1.min.js',
                            '/lib/dataset.min.js'
                        ]
                    };

                    res.render('dataset.ejs', templateParams);
                } catch (error) {
                    ErrorHandler.error(req, res)(error);
                }
            }, ErrorHandler.error(req, res, 404, 'Dataset not found'));
        }, ErrorHandler.error(req, res, 404, 'Dataset not found'));
    }

}

module.exports = DatasetController;
