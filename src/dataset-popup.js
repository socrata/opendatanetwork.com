
class DatasetPopup {
    static show(options) {
        const name = options.name || 'Untitled';
        const domain = options.domain || '';
        const description = options.description || '';
        const tags = options.tags || '';

        $('#dataset-lightbox h1').text(name);
        $('#dataset-lightbox .publisher').text(domain);
        $('#dataset-lightbox .publisher').attr('href', `https://${domain}`);
        $('#dataset-lightbox .tags span').text(tags);

        if (description.length === 0 && tags.length === 0) {
            $('#dataset-lightbox .description-container').hide(0);
            $('#dataset-lightbox .description').hide(0);
            $('#dataset-lightbox .tags').hide(0);
        } else {
            $('#dataset-lightbox .description-container').show(0);

            if (description.length > 0)
                $('#dataset-lightbox .description').html(description.replace('\n', '<br>')).show(0);
            else
                $('#dataset-lightbox .description').hide(0);

            if (tags.length > 0) {
                $('#dataset-lightbox .tags span').text(tags);
                $('#dataset-lightbox .tags').show(0);
            } else {
                $('#dataset-lightbox .tags').hide(0);
            }
        }

        $.featherlight('#dataset-lightbox');

        $.featherlight.defaults.afterClose = function() {
            window.history.back();
        };
    }
}
