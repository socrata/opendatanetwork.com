
$(document).ready(function() {

    // Multi-complete
    //
    multiComplete('#q', '.region-list').listen();

    // for each row (each of which represent a dataset column)
    //
    $('.columns-container table tr.column-row').each(function() {

        const row = $(this);
        const fieldName = row.attr('data-field-name');

        // Find first 5 unique values
        //
        const urlForUniqueValues = _datasetMeta.resourceUrl + 
            '?$group=' + fieldName + 
            '&$select=' + fieldName + ' as value,count(*)' + 
            '&$order=count desc';

        $.getJSON(urlForUniqueValues + '&$limit=6', function(results) {

            const resultsToShow = (results.length == 6) ? _.initial(results, 5) : results;
            const valuesToShow = _.map(resultsToShow, function(result) {

                if (!result.value)
                    result.value = '<em>blank</em>';

                if (_.isObject(result.value))
                    result.value = JSON.stringify(result.value);

                return result.value + ' <small>(' + numeral(result.count).format(',') + ')</small>';
            });

            var s = valuesToShow.join('<br>');

            if (results.length == 6)
                s += '<br><a target="blank" href="' + urlForUniqueValues + '&$limit=1000000000" rel="nofollow">view all</a>';

            row.find('.popular-values').html(s);
        });
    });
});

