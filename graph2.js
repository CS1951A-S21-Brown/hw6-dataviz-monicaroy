(function() {
    let svg = d3.select("#graph2")
    .append("svg")
    .attr("width", graph_2_width)     
    .attr("height", graph_2_height)     
    .append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

    let countRef = svg.append("g");

    d3.csv("/data/netflix.csv").then(function(data) {

        data = congregateData(data, function (a, b) {return a - b;})

        // time scale for the x axis (year)
        let years = d3.extent(data, function(d) { return d.year; })
        bottom = graph_2_height - 80
        let x = d3.scaleTime()
            .domain(years)
            .range([0, graph_2_width - margin.left - margin.right]);
        svg.append("g")
            .attr("transform", "translate(0," + bottom + ")")
            .call(d3.axisBottom(x).tickSize(5).tickPadding(10));

        // linear scale for the y axis (average runtime)
        let max_val = d3.max(data, function(d) { return d.time; })
        let y = d3.scaleLinear()
            .domain([0, max_val])
            .range([graph_2_height - margin.top - margin.bottom, 0]);  


        // Add y-axis label
        svg.append("g")
            .call(d3.axisLeft(y).tickSize(5).tickPadding(10));

        svg.append("path")
        .datum(data)
        .attr("fill", "none")
        .attr("stroke", "steelblue")
        .attr("stroke-width", 1.5)
        .attr("d", d3.line()
          .x(function(d) { return x(d.year) })
          .y(function(d) { return y(d.time) })
          )


        // x-axis label
        let middle = graph_2_width / 2.0 - margin.left
        svg.append("text")
            .attr("transform", `translate(${middle}, ${graph_2_height - margin.top})`)       
            .style("text-anchor", "middle")
            .text("Release Year");

        // y-axis label
        let center = graph_2_height / 2.0 - margin.top
        svg.append("text")
            .attr("transform", `translate(${-margin.right}, ${center})`)       
            .style("text-anchor", "middle")
            .text("Average Runtime");

        // chart title
        svg.append("text")
            .attr("transform", `translate(${middle}, ${0})`)       
            .style("text-anchor", "middle")
            .style("font-size", 15)
            .text("Average Runtime by Release Year");

        /* code for the tooltip */

        var focus = svg.append("g")
            .attr("class", "focus")
            .style("display", "none");

        focus.append("circle")
            .attr("r", 5);

        focus.append("rect")
            .attr("class", "tooltip")
            .attr("width", 100)
            .attr("height", 50)
            .attr("x", 10)
            .attr("y", -22)
            .attr("rx", 4)
            .attr("ry", 4);

        focus.append("text")
            .attr("class", "tooltip-year")
            .attr("x", 18)
            .attr("y", -2);

        focus.append("text")
            .attr("class", "tooltip-runtime")
            .attr("x", 18)
            .attr("y", 18);

        svg.append("rect")
            .attr("class", "overlay")
            .style("fill", "none")
            .attr("width", graph_2_width)
            .attr("height", graph_2_height)
            .style("pointer-events", "all")
            .on("mouseover", function() { focus.style("display", null); })
            .on("mouseout", function() { focus.style("display", "none"); })
            .on("mousemove", mousemove);

            function mousemove() {
                console.log(data)
                x0 = x.invert(d3.mouse(this)[0]);
                i = d3.bisector(function(d) { return d.year; }).left(data, x0, 1);
                console.log(i)
                d0 = data[i - 1];
                d1 = data[i];
                d = x0 - d0.year > d1.year - x0 ? d1 : d0;
                focus.attr("transform", "translate(" + x(d.year) + "," + y(d.time) + ")");
                focus.select(".tooltip-year").text(d3.timeFormat("%Y")(d.year));
                focus.select(".tooltip-runtime").text(parseInt(d.time));
            }

    });

    function congregateData(data, comparator) {
        // groups movies by release year and returns average runtime per year
        output = [];
        for (i = 0; i < data.length; i++) {
            ind = output.map(function(d) { return d.year;}).indexOf(data[i].release_year);
            // not in output yet (new year)
            if (ind < 0) {
                output.push({"year": data[i].release_year, "time": parseInt(data[i].duration), "count": 1})
            } else {
                // add to total duration and number of movies for that year
                output[ind].time += parseInt(data[i].duration)
                output[ind].count += 1
            }
        }

        // divide total time by number of movies to get average for each year
        output.map(function(d) {d.year = d3.timeParse("%Y")(d.year); d.time /= d.count})
        output.sort(function(a,b) {return comparator(a.year, b.year)})

        return output
    }

}) ();