(function() {
    var d3 = require('d3'),
        $ = require('jquery');

    $(document).ready(init);

    var width = 900,
        height = 500,
        tooltipBottomMargin = 50,
        tooltipTextHeight = 20;

    var margin = {
        top: 50,
        right: 100,
        bottom: 50,
        left: 50
    };

    var innerWidth = width - margin.left - margin.right,
        innerHeight = height - margin.top - margin.bottom;

    var x = d3.time.scale()
            .range([0, innerWidth]),
        y = d3.scale.linear()
            .range([0, innerHeight]);


    var xAxis = d3.svg.axis()
            .scale(x)
            .orient('bottom')
            .ticks(d3.time.second, 15)
            .tickFormat(d3.time.format.utc('%M:%S')),
        yAxis = d3.svg.axis()
            .scale(y)
            .orient('left');

    var chart,
        innerChart,
        tooltip;

    function init() {
        $('.copyrightDate').text(new Date().getFullYear());

        // Fetch data
        $.ajax({
            url: 'cyclist-data.json',
            success: downloadSuccessful,
            error: downloadError
        });

        chart = d3.select('.chart')
            .attr('width', width)
            .attr('height', height);

        innerChart = chart.append('g')
            .attr('transform', 'translate(' + margin.left + ', ' + margin.top + ')');
    }

    function downloadSuccessful(data) {

        x.domain([
            Math.ceil(d3.min(data, function(d) { return d.Seconds; })*1000),
            Math.ceil(d3.max(data, function(d) { return d.Seconds; })*1000)
        ]);

        y.domain([
            d3.min(data, function(d) { return d.Place; }),
            d3.max(data, function(d) { return d.Place; })
        ]);

        var groups = innerChart.selectAll('g').data(data)
            .enter().append('g')
            .attr('transform', function(d) { return 'translate(' + x(d.Seconds*1000) + ', ' + y(d.Place) + ')'; });

        groups.append('circle')
            .attr('cx', 0)
            .attr('cy', 0)
            .attr('r', 5)
            .classed('doping', function(d) { return d.Doping.length > 0;});

        groups.append('text')
            .attr('transform', 'translate(7, 4)')
            .text(function(d) { return d.Name; })
            .classed('clickable', function(d) { return d.URL.length > 0;});

        groups.on('mouseover', displayTooltip)
            .on('mouseout', hideTooltip)
            .on('click', redirectToWiki);

        innerChart.append('g')
            .attr('class', 'x axis')
            .attr('transform', 'translate(0, ' + (innerHeight + 10) + ')')
            .call(xAxis);

        innerChart.append('g')
            .attr('class', 'y axis')
            .attr('transform', 'translate(-10, 0)')
            .call(yAxis);

        tooltip = innerChart.append('g')
            .attr('class', 'chart-tooltip')
            .attr('transform', 'translate(' + margin.left + ', ' + (innerHeight - tooltipBottomMargin) + ')');

        // Legend info

        var legend = innerChart.append('g')
                .attr('transform', 'translate(' + margin.left + ', ' + (innerHeight - tooltipBottomMargin - 100) + ')');

        legend.append('circle')
            .attr('cx', 0)
            .attr('cy', 0)
            .attr('r', 5)
            .attr('class', 'doping');

        legend.append('text')
            .attr('transform', 'translate(10, 3)')
            .text('Accused of doping');

        legend.append('circle')
            .attr('cx', 0)
            .attr('cy', tooltipTextHeight)
            .attr('r', 5);

        legend.append('text')
            .attr('transform', 'translate(10, ' + (tooltipTextHeight + 3) + ')')
            .text('Doping free');
    }

    function downloadError(jqXHR, textStatus, error) {
        console.error('Error while loading data', jqXHR, textStatus, error);
        $('.chart-wrapper').html('Sorry, there\'s been an error - data cannot be downloaded from the server. Please, try again later.');
    }

    function displayTooltip(d) {
        d3.select(this)
            .classed('highlighted', true);

        tooltip.append('text')
            .text(d.Name + ' (' + d.Nationality + ') - ' + d.Time);

        tooltip.append('text')
            .attr('transform', 'translate(0, ' + tooltipTextHeight + ')')
            .text('Place: ' + d.Place);

        tooltip.append('text')
            .attr('transform', 'translate(0, ' + (tooltipTextHeight*2) + ')')
            .text('Doping: ' + (d.Doping.length > 0 ? d.Doping : 'none'));
    }

    function hideTooltip() {
        d3.select(this)
            .classed('highlighted', false);

        tooltip.selectAll('text')
            .remove();
    }

    function redirectToWiki(d) {
        if(d.URL.length > 0)
            window.location.href = d.URL;
    }
})();