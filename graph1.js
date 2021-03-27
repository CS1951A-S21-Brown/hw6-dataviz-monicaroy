/* these are the static parts of the graph */
let svg = d3.select("#graph1")
    .append("svg")
    .attr("width", graph_1_width)     
    .attr("height", graph_1_height)     
    .append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top + 20})`);

let countRef = svg.append("g");

let y_axis_label = svg.append("g");

let x = d3.scaleLinear()
        .range([0, graph_1_width - margin.left - margin.right]);

let y = d3.scaleBand()
    .range([0, graph_1_height - margin.top - margin.bottom])
    .padding(0.1);  // Improves readability

    // x-axis label
let middle = graph_1_width / 2.0 - margin.left
svg.append("text")
    .attr("transform", `translate(${middle}, ${graph_1_height - margin.bottom - 20})`)       
    .style("text-anchor", "middle")
    .text("Count");

// y-axis label
svg.append("text")
    .attr("transform", `translate(${0}, ${graph_1_height - margin.bottom - 20})`)       
    .style("text-anchor", "middle")
    .text("Genre");

// chart title
svg.append("text")
    .attr("transform", `translate(${middle}, ${0})`)       
    .style("text-anchor", "middle")
    .style("font-size", 15)
    .text("Titles Per Genre on Netflix");

setGenres();

function setGenres() {

    let NUM_GENRES = document.getElementById("num_genres").value

    d3.csv("/data/netflix.csv").then(function(data) {
        data = congregateData(data, function (a, b) {
            return b - a;
            }, NUM_GENRES)


    // set domain for the x axis (number of occurrences)
        let max_val = d3.max(data, function(d) {return d.count})
        x.domain([0, max_val])

    // set domain for the y axis (genre)
        y.domain(data.map(function(d) {return d.genre}))


    // add y-axis label
        y_axis_label.call(d3.axisLeft(y).tickSize(0).tickPadding(10));

        let bars = svg.selectAll("rect").data(data);

    // color scale
        let color = d3.scaleOrdinal()
            .domain(data.map(function(d) { return d["genre"] }))
            .range(d3.quantize(d3.interpolateHcl("#66a0e2", "#81c2c3"), data.length));

        bars.enter()
            .append("rect")
            .merge(bars)
            .attr("fill", function(d) { return color(d['genre']) }) // return fill colors based on the data point d
            .attr("x", x(0))
            .attr("y", function(d) { return y(d['genre']) })               // HINT: apply styles based on the data point (d)
            .attr("width", function(d) { return x(d['count'])})
            .attr("height",  y.bandwidth());        // y.bandwidth() makes a reasonable display height
        
        let counts = countRef.selectAll("text").data(data);

    // Render the text elements on the DOM
        counts.enter()
            .append("text")
            .merge(counts)
            .attr("x", function(d) {return x(d.count) + 10})       
            .attr("y", function(d) {return y(d.genre) + 10})       
            .style("text-anchor", "start")
            .text(function(d) {return d.count});           

        bars.exit().remove();
        counts.exit().remove();
    });

    function congregateData(data, comparator, numExamples) {
    // groups movies by genre and returns count per genre
        output = [];
        for (i = 0; i < data.length; i++) {
            ind = output.map(function(d) { return d.genre;}).indexOf(data[i].listed_in);
            // not in output yet (new genre)
            if (ind < 0) {
                output.push({"genre": data[i].listed_in, "count": 1})
            } else {
                output[ind].count += 1
            }
        }

        output.sort(function(a,b) {return comparator(a.count, b.count)})

        return output.slice(0, numExamples)
    }
};