(function() {
    var d3 = require('d3'),
        $ = require('jquery');

    $(document).ready(init);

    var width = 900,
        height = 500;

    var margin = {
        top: 50,
        right: 100,
        bottom: 50,
        left: 50
    };

    var innerWidth = width - margin.left - margin.right,
        innerHeight = height - margin.top - margin.bottom;

    var x = d3.scale.linear()
            .range([0, innerWidth]),
        y = d3.scale.linear()
            .range([0, innerHeight]);

    x = d3.time.scale.utc()
        .rangeRound([0, innerWidth]);

    var xAxis = d3.svg.axis()
        .scale(x)
        .orient('bottom')
        .ticks(d3.time.second, 10);

    var chart,
        innerChart;

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
            d3.min(data, function(d) { return new Date(d.Seconds*1000); }),
            d3.max(data, function(d) { return new Date(d.Seconds*1000); })
        ]);
        console.log(x.domain());

        y.domain([
            d3.min(data, function(d) { return d.Place; }),
            d3.max(data, function(d) { return d.Place; })
        ]);

        var groups = innerChart.selectAll('g').data(data)
            .enter().append('g')
            .attr('transform', function(d) { return 'translate(' + x(new Date(d.Seconds*1000)) + ', ' + y(d.Place) + ')'; });

        groups.append('circle')
            .attr('cx', 0)
            .attr('cy', 0)
            .attr('r', 5)
            .classed('doping', function(d) { return d.Doping.length > 0;});

        groups.append('text')
            .attr('transform', 'translate(7, 4)')
            .text(function(d) { return d.Name; });

        innerChart.append('g')
            .attr('class', 'x axis')
            .attr('transform', 'translate(0, ' + (innerHeight + 10) + ')')
            .call(xAxis);
    }

    function downloadError(jqXHR, textStatus, error) {
        console.error('Error while loading data', jqXHR, textStatus, error);
        $('.chart-wrapper').html('Sorry, there\'s been an error - data cannot be downloaded from the server. Please, try again later.');
    }
})();