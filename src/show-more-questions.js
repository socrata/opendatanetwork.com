
function showMoreQuestions() {
    let more = true;

    const collapsible = d3.selectAll('li.question.collapsible');

    const link = d3.selectAll('a#questions');

    link.on('click', () => {
        more = !more;
        collapsible.classed('collapsed', more);

        link.text(`show ${more ? 'more' : 'less'}`);
    });
}

