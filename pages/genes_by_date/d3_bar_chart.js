function getLines(data) {
    /*
     * Find the changes in references between successive years.
     *
     * Return an array of from-to pairs which will represent the lines
     * that need to be drawn to link the genes and their expression
     * changes.
     */
    var years = d3.set(data.map(function(d) { return d.year; })).values().sort();
    var yearEntries = {};

    var links = [];
    filterYear = function(d) { return d.year === years[i]; };

    // create a reverse lookup for each of the yearly entries
    for (var i = 0; i < years.length; i++) {
        yearEntries[i] = data.filter(filterYear);
    }

    console.log('yearEntries:', yearEntries);
    for (i = 1; i < years.length; i++) {
        for (var j = 0; j < yearEntries[i-1].length; j++) {
            var found = false;
            for (var k = 0; k < yearEntries[i].length; k++) {
                if (yearEntries[i-1][j].geneid == yearEntries[i][k].geneid) {
                    //found the same gene in two consecutive years
                    links.push({'from': yearEntries[i-1][j], 
                                'to': yearEntries[i][k], 
                                //'val': yearEntries[i][k].count / yearEntries[i-1][j].count});
                                'val': 1});
                    found = true;
                }
            }

            if (!found) {
                //
            }
        }
    }

    console.log('links', links);
    return links;
}

function renderGeneCountsChart() {
    d3.tsv('genes_by_year.csv', function(error, data) {
        var barHeight = 35;
        var barWidth = 35;
        data = data.filter(function(d) { return d.pos <= 10; });

        console.log('data', data);

        var years = d3.set(data.map(function(d) { return d.year; })).values().sort();
        var poss = d3.set(data.map(function(d) { return d.pos; })).
            values().sort(function(a,b) { return a-b; });

        var margin = {top: 40, right: 50, bottom: 30, left: 120},
        width = 1000 - margin.left - margin.right,
        height = 400;

        maxRadius = d3.min([width / years.length, height / poss.length]) / 2;
        maxCount = d3.max(data.map(function(d) { return +d.count; }));
        maxPossibleRadius = Math.sqrt(maxCount);

        links = getLines(data);

        console.log('maxPossibleRadius:', maxPossibleRadius);

        // height = 450 - margin.top - margin.bottom;
        console.log('maxRadius:', maxRadius, 'maxCount:', maxCount);

        var y = d3.scale.ordinal()
        .rangePoints([0, height], 1)
        .domain(poss);

        var x = d3.scale.ordinal()
        .rangePoints([0, width], 1)
        .domain(years);


        xAxis = d3.svg.axis()
        .scale(x)
        .orient('top');

        yAxis = d3.svg.axis()
        .scale(y)
        .orient("left");

        var chart = d3.select("#gene-counts-chart").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom);

        var svg = chart
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        svg.append("g")
        .attr('class', 'y axis')
        .call(yAxis);

        svg.append("g")
        .attr('class', 'x axis')
        .call(xAxis);

        /* X-axis label */

        chart.append('text')
        .attr('class', 'x label')
        .attr('x', margin.left + width / 2)
        .attr('text-anchor', 'middle')
        .style('font-weight', 'bold')
        .attr('y', 10)
        .text('Year');

        /* Y-axis label */

        chart.append('g')
        .attr('transform', 'translate(' + 40 + "," + (margin.top + (barHeight * data.length + 5) / 2) + ")")
        .append('text')
        .attr('transform', 'rotate(-90)')
        .attr('class', 'y label')
        .style('font-weight', 'bold')
        .attr('text-anchor', 'middle')
        .text('Gene name');

        maxLineWidth = 2;
        maxVal = d3.max(links.map(function(d) { return +d.val; }));

        console.log('links', links);
        // Create the lines connecting the circles and indicating how the 
        // gene ranks have changed
        
        lines_enter = svg.selectAll('.line')
                                    .data(links)
                                    .enter();

        highlight_lines = lines_enter
                .append('line')
                .attr('x1', function(d) { return x(d.from.year); })
                .attr('y1', function(d) { return y(d.from.pos); })
                .attr('x2', function(d) { return x(d.to.year); })
                .attr('y2', function(d) { return y(d.to.pos); })
                .attr('gene_line', function(d) { return "g" + d.from.geneid; })
                .style('stroke-width', 0 )
                .style('stroke', 'red');

            /*
        lines = lines_enter
                .append('line')
                .attr('x1', function(d) { return x(d.from.year); })
                .attr('y1', function(d) { return y(d.from.pos); })
                .attr('x2', function(d) { return x(d.to.year); })
                .attr('y2', function(d) { return y(d.to.pos); })
                .style('stroke-width', 2 )
                .style('stroke', 'black');
                */


        var nodeRadius = function(d) {return (maxRadius - 5) * ((Math.sqrt(d.count) / maxPossibleRadius)); };

        var highlight = function(d) {
            svg.selectAll('[gene_circle=g' + d.geneid + ']').style('stroke-width', 5);
            svg.selectAll('[gene_line=g' + d.geneid + ']').style('stroke-width', 5);
        };

        var unhighlight = function(d) {
            svg.selectAll('[gene_circle=g' + d.geneid + ']').style('stroke-width', 0);    
            svg.selectAll('[gene_line=g' + d.geneid + ']').style('stroke-width', 0);
        };

        /* Create the actual bars with the full name of the gene on the inside
         * and the symbol for the gene on the outside */
        circles = svg.selectAll('.gcircle')
        .data(data)
        .enter()
        .append('circle')
        .attr('cx', function(d) { return x(d.year); })
        .attr('cy', function(d) { return y(d.pos); })
        .attr('r', nodeRadius)
        .attr('gene_circle', function(d) { return "g" + d.geneid; })
        .style('stroke-width', 0)
        .style('fill', 'black')
        .style('stroke', 'red')
        .on("mouseover", highlight)
        .on("mouseout", unhighlight)
        .append('title')
        .text(function(d) { return d.name; });
        

    });
}
