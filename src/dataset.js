
$(document).ready(function() {

    // Multi-complete
    //
    multiComplete('#q', '.region-list').listen();

    // Fetch sample values
    //
    d3.promise.json(_datasetMeta.viewsUrl)
        .then(data => {

            // For each field row in the table, get the matching column from the data
            //
            $('.columns-container table tr.column-row').each(function() {

                const row = $(this);
                const fieldName = row.attr('data-field-name');
                const dataType = row.attr('data-type');
                const columns = _.filter(data.columns, column => column.fieldName == fieldName);

                if ((columns == null) || (columns.length == 0))
                    return;

                const column = columns[0]; 

                if ((column == null) || (column.cachedContents == null) || (column.cachedContents.top == null))
                    return;

                const rg = _.slice(column.cachedContents.top, 0, 5);
                const items = _.map(rg, o => {
                    return '<div>' + ((dataType == 'location') ?  JSON.stringify(o.item) : o.item) + '</div>';
                });

                var s = items.join('');
                s += '<a class="view-top-100" rel="nofollow">view top 100</a>';

                row.find('.popular-values').html(s);
            });
            
            $('.view-top-100').click(event => {

                const row = $(event.currentTarget).parent().parent();
                const fieldName = row.attr('data-field-name');

                d3.promise.json(_datasetMeta.migrationsUrl)
                    .then(
                        data => { 
                            window.location.href = _datasetMeta.nbeResourceUrl.format(data.nbeId, fieldName); 
                        }, 
                        console.error);
            });
        }, 
        console.error);
});

