
maps.tooltip = function(container) {
    const tooltipDiv = container
        .append("div")
        .attr("class", "tooltip");

    const name = tooltipDiv
        .append("div")
        .attr("class", "name");

    const value = tooltipDiv
        .append("div")
        .attr("class", "value");

    const valueName = value
        .append("span")
        .attr("class", "value-name");

    const valueFormatted = value
        .append("span")
        .attr("class", "value-formatted");

    function show(region) {
        tooltipDiv.style("display", "inline");

        name.text(region.name);
        valueName.text(region.valueName);
        valueFormatted.text(region.valueFormatted);
    }

    function hide() {
        tooltipDiv.style("display", "none");
    }

    hide();

    return {show, hide};
}
