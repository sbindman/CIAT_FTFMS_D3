




// grabbing data for chart

d3.json("./data/data_sample.json", function(error, project_data) {


    var num_indicators = dataByProject(project_data).indicators.length;

    for (var i=0; 0 < num_indicators; i++) {
        createIndicatorChart(i);
    }


    function createIndicatorChart(indicator_id) {


// setting the constraints of the whole chart
        var margin = {top: 20, right: 30, bottom: 30, left:30},
            width = 435 - margin.left - margin.right,
            height = 180 - margin.top - margin.bottom;

        var formatPercent = d3.format(".0%");
        var formatLargeNumber = d3.format("s");


// setting up x,y scales
        var x = d3.scale.ordinal()
            .rangeRoundBands([0, width], .1);

        var y = d3.scale.linear()
            .range([height, 0]);

        var y_percent = d3.scale.linear()
            .range([height, 0]);

        var xAxis = d3.svg.axis()
            .scale(x)
            .orient("bottom")
            .tickSize(0);

        var yAxisRight = d3.svg.axis()
            .scale(y_percent)
            .orient("right")
            .ticks(2)
            .tickSize(-width)
            .tickFormat(formatPercent);

        var yAxisLeft = d3.svg.axis()
            .scale(y)
            .orient("left")
            .tickSize(4)
            .ticks(4)
            .tickFormat(formatLargeNumber);

//tooltips
        var target_tip = d3.tip()
            .attr('class', 'd3-tip d3-tip-target')
            .offset([40, 0])
            .html(function(d) {
                return "Year: " + d.year + "<br>Target: " + d.data.target;
            });

        var actual_tip = d3.tip()
            .attr('class', 'd3-tip d3-tip-actual')
            .offset([40, 0])
            .html(function(d) {
                return "Year: " + d.year + "<br>Actual: " + d.data.actual;
            });

        //var line_tip = d3.tip()
        //    .attr('class', 'd3-tip d3-tip-line')
        //    .offset([40, 0])
        //    .html(function(d) {
        //        return "Year: " + d.year + "<br>Percent: " + d.percent;
        //    });

        var dot_tip = d3.tip()
            .attr('class', 'd3-tip d3-tip-dot')
            .offset([0, 0])
            .html(function(d) {
                return "Year: " + d.year + "<br>Percent: " + (d.data.actual /d.data.target) * 100;
            });

// setting up chart
        var chart = d3.selectAll(".chart")
            .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .attr("class", "indicator_chart")
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
            .call(target_tip)
            .call(actual_tip)
            .call(dot_tip);


        var indicator = dataByProject(project_data).indicators[indicator_id];
        var data = dataByProject(project_data).indicators[indicator_id].measures[0];

        //setting domain of chart
        x.domain(data.editions.map(function (d) {
            return d.year;})
        );

        // setting up range 1
        y.domain([0, d3.max(data.editions.map(function (d) {
            return Math.max(d.data.target, d.data.actual);}))]
        );

        // setting up range 2
        y_percent.domain([0, 2]);

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
            .call(yAxisRight);

        // adding y axis on the left
        chart.append("g")
            .attr("class", "yAxisLeft axis")
            .attr("transform", "translate(" + 0 + ",0)")
            .call(yAxisLeft);

        //adding data for target bar
        chart.selectAll(".target_bar")
            .data(data.editions)
            .enter().append("rect")
            .attr("class", "target_bar bar")
            .attr("y", function (d) {
                return y(d.data.target);
            })
            .attr("x", function (d) {
                return x(d.year)+5;
            })
            .attr("height", function (d) {
                return height - y(d.data.target);
            })
            .attr("width", 10)
            .on('mouseover', target_tip.show)
            .on('mouseout', target_tip.hide);



        // adding data for actual bar
        chart.selectAll(".actual_bar")
            .data(data.editions)
            .enter().append("rect")
            .attr("class", "actual_bar bar")
            .attr("y", function (d) {
                return y(d.data.actual);
            })
            .attr("x", function (d) {
                return x(d.year)+15;
            })
            .attr("height", function (d) {
                return height - y(d.data.actual);
            })
            .attr("width", 10)
            .on('mouseover', actual_tip.show)
            .on('mouseout', actual_tip.hide);


        chart.append("text")
            .attr("x", (width / 2))
            .attr("y", 0 - (margin.top / 2))
            .attr("text-anchor", "middle")
            .text(function() {
                return indicator.indicator_title;
            });


        // draw scatterdots
        chart.selectAll(".dot")
            .data(data.editions)
            .enter().append("circle")

            .attr("class", "dot")
            .attr("r", function(d) {
                return (d.data.actual && d.data.target) ? 3.5 : 0;
            })
            .attr("cx", function(d) {
                return x(d.year) + 15;
            })
            .attr("cy", function(d) {
                var percent = d.data.actual / d.data.target;
                //will show percent at 200% if more than 200%
                var percentToGraph = Math.min(2, percent);
                return y_percent(percentToGraph);
            })
            .on('mouseover', function(d){
                dot_tip.show(d);
                d3.select(this).attr("r", 6);
            } )
            .on('mouseout', function(d){
                dot_tip.hide();
                d3.select(this).attr("r", 3.5);
            });




        //// adding line chart
        //var line = d3.svg.line()
        //    .defined(function(d) { return (d.data.actual && d.data.target); })
        //    .x(function(d) { return x(d.year)+15; })
        //    .y(function(d) {
        //            return y_percent(d.data.actual / d.data.target)
        //    });
        //
        //var svg = d3.select(".indicator_chart");
        //
        //    .append("svg")
        //    .attr("width", width + margin.left + margin.right)
        //    .attr("height", height + margin.top + margin.bottom)
        //    .append("g")
        //    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
        //
        //
        //svg.append("path")
        //    .datum(data.editions)
        //    .attr("class", "percentage_line")
        //    .attr("d", line)
        //    .on('mouseover', line_tip.show)
        //    .on('mouseout', line_tip.hide);

    }
});



function dataByProject(project_data) {

    projectData = {};
    projectData.indicators = [];

    project_data.features.forEach(function(row) {

        var indicatorObject = {};
        indicatorObject.indicator_id = row.properties.indicator_id;
        indicatorObject.indicator_title = row.properties.indicator_title;
        indicatorObject.measures = [];

        var measureObject = {};
        measureObject.measure_id = row.properties.measure_id;
        measureObject.measure_title = row.properties.measure_title;
        measureObject.editions = [];

        var editionObject = {};
        editionObject.edition_id = row.properties.edition_id;
        editionObject.year = row.properties.year;
        editionObject.data = {};

        editionObject.data.baseline = null;
        editionObject.data.target = null;
        editionObject.data.actual = null;


        // returns index of indicator or -1 if not in array
        var indicatorIndex = containsIndicator(projectData.indicators, indicatorObject);

        //if indicator has not been
        if ( indicatorIndex === -1) {
            //add a new indicator to the list of indicators
            projectData.indicators.push(indicatorObject);

            //add measure to last indicator in array that has just been pushed
            var last_indicator_index = (projectData.indicators.length) - 1;
            projectData.indicators[last_indicator_index].measures.push(measureObject);

            //add edition data to the last measure added
            var last_measure_index = projectData.indicators[last_indicator_index].measures.length - 1;
            projectData.indicators[last_indicator_index].measures[last_measure_index].editions.push(editionObject);

            //add data to the last edition added
            var last_edition_index = projectData.indicators[last_indicator_index].measures[last_measure_index].editions.length - 1;

            if (row.properties.value_title == 'Target') {
                projectData.indicators[last_indicator_index].measures[last_measure_index].editions[last_edition_index].data.target = row.properties.data;
            }
            else if (row.properties.value_title == 'Actual') {
                projectData.indicators[last_indicator_index].measures[last_measure_index].editions[last_edition_index].data.actual = row.properties.data;

            }
            else if (row.properties.value_title == 'Baseline') {
                projectData.indicators[last_indicator_index].measures[last_measure_index].editions[last_edition_index].data.baseline = row.properties.data;

            }
        }
        // if indicator is already in list
        else {
            //check if measure exists
            // returns index of measure or -1 if not in array
            var measureIndex = containsMeasure(projectData.indicators[indicatorIndex].measures, measureObject);

            //if measure doesn't exist
            if ( measureIndex === -1) {
                //add measure to indicator
                projectData.indicators[indicatorIndex].measures.push(measureObject);

                //add edition data to the last measure added
                var last_measure_index = projectData.indicators[indicatorIndex].measures.length - 1;
                projectData.indicators[indicatorIndex].measures[last_measure_index].editions.push(editionObject);

                //add data to the last edition added
                var last_edition_index = projectData.indicators[indicatorIndex].measures[last_measure_index].editions.length - 1;

                if (row.properties.value_title == 'Target') {
                    projectData.indicators[indicatorIndex].measures[last_measure_index].editions[last_edition_index].data.target = row.properties.data;
                }
                else if (row.properties.value_title == 'Actual') {
                    projectData.indicators[indicatorIndex].measures[last_measure_index].editions[last_edition_index].data.actual = row.properties.data;

                }
                else if (row.properties.value_title == 'Baseline') {
                    projectData.indicators[indicatorIndex].measures[last_measure_index].editions[last_edition_index].data.baseline = row.properties.data;

                }


            }
            else {
                //check if edition exists
                // returns index of edition or -1 if not in array
                var editionIndex = containsEdition(projectData.indicators[indicatorIndex].measures[measureIndex].editions, editionObject);

                //if edition doesn't exist
                if (editionIndex === -1) {
                    projectData.indicators[indicatorIndex].measures[measureIndex].editions.push(editionObject);

                    //add data to the last edition added
                    var last_edition_index = projectData.indicators[indicatorIndex].measures[measureIndex].editions.length - 1;

                    if (row.properties.value_title == 'Target') {
                        projectData.indicators[indicatorIndex].measures[measureIndex].editions[last_edition_index].data.target = row.properties.data;
                    }
                    else if (row.properties.value_title == 'Actual') {
                        projectData.indicators[indicatorIndex].measures[measureIndex].editions[last_edition_index].data.actual = row.properties.data;

                    }
                    else if (row.properties.value_title == 'Baseline') {
                        projectData.indicators[indicatorIndex].measures[measureIndex].editions[last_edition_index].data.baseline = row.properties.data;

                    }
                }
                //if edition does exist
                else {
                    if (row.properties.value_title == 'Target') {
                        projectData.indicators[indicatorIndex].measures[measureIndex].editions[editionIndex].data.target = row.properties.data;
                    }
                    else if (row.properties.value_title == 'Actual') {
                        projectData.indicators[indicatorIndex].measures[measureIndex].editions[editionIndex].data.actual = row.properties.data;

                    }
                    else if (row.properties.value_title == 'Baseline') {
                        projectData.indicators[indicatorIndex].measures[measureIndex].editions[editionIndex].data.baseline = row.properties.data;

                    }
                }
            };

        }


    });

    return projectData;
}


function containsIndicator(array, object) {
    var exists = -1;
    for(var i = 0; i < array.length; i++) {
        if (array[i].indicator_id == object.indicator_id ) {
            exists = i;
            break;
        }
    }
    return exists;
}


function containsMeasure(array, object) {
    var exists = -1;
    for(var i = 0; i < array.length; i++) {
        if (array[i].measure_id == object.measure_id ) {
            exists = i;
            break;
        }
    }
    return exists;
}


function containsEdition(array, object) {
    var exists = -1;
    for(var i = 0; i < array.length; i++) {
        if (array[i].edition_id == object.edition_id ) {
            exists = i;
            break;
        }
    }
    return exists;
}



