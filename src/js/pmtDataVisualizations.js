var savedData;

// setting the constraints of the whole chart
var margin = {top: 10, right: 30, bottom: 30, left: 30},
    width = 350 - margin.left - margin.right,
    height = 200 - margin.top - margin.bottom;

var formatPercent = d3.format(".0%");


// setting up x,y scales
var x = d3.scale.ordinal()
    .rangeRoundBands([0, width], .1);

var y = d3.scale.linear()
    .range([height, 0]);

var y_percent = d3.scale.linear()
    .range([height, 0]);

var xAxis = d3.svg.axis()
    .scale(x)
    .orient("bottom");

var yAxisRight = d3.svg.axis()
    .scale(y_percent)
    .orient("right")
    .ticks(4)
    .tickSize(-width)
    .tickFormat(formatPercent);

var yAxisLeft = d3.svg.axis()
    .scale(y)
    .orient("left")
    .tickSize(4)
    .ticks(4);

//tooltips
var target_tip = d3.tip()
    .attr('class', 'd3-tip d3-tip-target')
    .offset([40, 0])
    .html(function(d) {
        return "Year: " + d.name + "<br>Target: " + d.value;
    });

var actual_tip = d3.tip()
    .attr('class', 'd3-tip d3-tip-actual')
    .offset([40, 0])
    .html(function(d) {
        return "Year: " + d.name + "<br>Actual: " + d.points;
    });

var line_tip = d3.tip()
    .attr('class', 'd3-tip d3-tip-line')
    .offset([40, 0])
    .html(function(d) {
        return "Year: " + d.name + "<br>Percent: " + d.percent;
    });
// setting up chart
var chart = d3.select(".chart")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
    .call(target_tip)
    .call(actual_tip)
    .call(line_tip);

// grabbing data for chart
d3.csv("data.csv", type, function (error, data) {

    savedData = data;
    //setting domain of chart
    x.domain(data.map(function (d) {
        return d.name;
    }));
    // setting up range 1
    y.domain([0, d3.max(data, function (d) {
        return d.value;
    })]);
    // setting up range 2
    y_percent.domain([0, 1.5]);

    //addding x axis
    chart.append("g")
        .attr("class", "xAxis axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis)
        .append("text")
        .attr("y", height)
        .attr("dy", ".71em")
        .style("text-anchor", "end")
        .text("Project");

    //adding y axis on the right
    chart.append("g")
        .attr("class", "yAxisRight axis")
        .attr("transform", "translate(" + width + ",0)")
        .call(yAxisRight)
        .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", ".71em")
        .style("text-anchor", "end");
        //.text("Percent");

    // adding y axis on the left
    chart.append("g")
        .attr("class", "yAxisLeft axis")
        .attr("transform", "translate(" + 0 + ",0)")
        .call(yAxisLeft)
        .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", -25)
        .attr("x", 0)
        .attr("dy", ".71em")
        .style("text-anchor", "end")
        .text("Number of People");

    //adding data for target bar
    chart.selectAll(".target_bar")
        .data(data)
        .enter().append("rect")
        .attr("class", "target_bar bar")
        .attr("y", function (d) {
            return y(d.value);
        })
        .attr("x", function (d) {
            return x(d.name)+5;
        })
        .attr("height", function (d) {
            return height - y(d.value);
        })
        .attr("width", 10)
        .on('mouseover', target_tip.show)
        .on('mouseout', target_tip.hide);

    // adding data for actual bar
    chart.selectAll(".actual_bar")
        .data(data)
        .enter().append("rect")
        .attr("class", "actual_bar bar")
        .attr("y", function (d) {
            return y(d.points);
        })
        .attr("x", function (d) {
            return x(d.name)+15;
        })
        .attr("height", function (d) {
            return height - y(d.points);
        })
        .attr("width", 10)
        .on('mouseover', actual_tip.show)
        .on('mouseout', actual_tip.hide);

    var bars = chart.selectAll(".bar");


    // adding line chart
    var line = d3.svg.line()
        .x(function(d) { return x(d.name)+15; })
        .y(function(d) { return y_percent(d.percent); });

    var svg = d3.select(".chart").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


    svg.append("path")
        .datum(data)
        .attr("class", "percentage_line")
        .attr("d", line)
        .on('mouseover', line_tip.show)
        .on('mouseout', line_tip.hide);


    // adding 100% line on chart
    var percentLine = d3.svg.line()
        .x(function(d) { return x(d.name)+15; })
        .y(54);


    svg.append("path")
        .datum(data)
        .attr("class", "percentageLine")
        .attr("d", percentLine);

});


function type(d) {
    d.value = +d.value; // coerce to number
    return d;
}




