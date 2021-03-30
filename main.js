// Add your JavaScript code here
const MAX_WIDTH = Math.max(1080, window.innerWidth);
const MAX_HEIGHT = 720;
const margin = {top: 40, right: 100, bottom: 40, left: 175};
const NUM_EXAMPLES = 10;
const tooltip = { width: 100, height: 100, x: 10, y: -30 };

// Assumes the same graph width, height dimensions as the example dashboard. Feel free to change these if you'd like
let graph_1_width = (MAX_WIDTH / 2) - 10, graph_1_height = 250;
let graph_2_width = (MAX_WIDTH / 2) - 10, graph_2_height = 275;
let graph_3_width = MAX_WIDTH / 2, graph_3_height = 575;

(function() {
    let svg = d3.select("#graph3")
        .append("svg")
        .attr("width", graph_3_width)     
        .attr("height", graph_3_height)     
        .append("g")
        .attr("transform", `translate(${margin.left}, ${margin.top})`);

    let countRef = svg.append("g");

    d3.csv("/data/netflix.csv").then(function(data) {
        data = congregateData(data, function (a, b) {
            return b - a;
        }, NUM_EXAMPLES)

        // linear scale for the x axis (number of occurrences)
        let max_val = d3.max(data, function(d) {return d.count})
        let x = d3.scaleLinear()
            .domain([0, max_val])
            .range([0, graph_1_width - margin.left - margin.right]);


        // a scale band for the y axis (director + actor pairs)
        let y = d3.scaleBand()
            .domain(data.map(function(d) {return d.director + " + " + d.actor}))
            .range([0, graph_3_height - margin.top - margin.bottom])
            .padding(0.1);  // Improves readability

        //  y-axis label
        svg.append("g")
            .call(d3.axisLeft(y).tickSize(0).tickPadding(10));

        let bars = svg.selectAll("rect").data(data);

        // color scale
        let color = d3.scaleOrdinal()
            .domain(data.map(function(d) { return d.director + " + " + d.actor}))
            .range(d3.quantize(d3.interpolateHcl("#66a0e2", "#81c2c3"), data.length));

        bars.enter()
            .append("rect")
            .merge(bars)
            .attr("fill", function(d) { return color(d.director + " + " + d.actor) }) // return fill colors based on the data point d
            .attr("x", x(0))
            .attr("y", function(d) { return y(d.director + " + " + d.actor) })               // apply styles based on the data point (d)
            .attr("width", function(d) { return x(d['count'])})
            .attr("height",  y.bandwidth());        // y.bandwidth() makes a reasonable display height
            
        let counts = countRef.selectAll("text").data(data);

        // Render the text elements on the DOM
        counts.enter()
            .append("text")
            .merge(counts)
            .attr("x", function(d) {return x(d.count) + 10})       
            .attr("y", function(d) {return y(d.director + " + " + d.actor) + 10})      
            .style("text-anchor", "start")
            .text(function(d) {return d.count});           


        //  x-axis label
        let middle = graph_3_width / 2.0 - margin.left
        svg.append("text")
            .attr("transform", `translate(${middle}, ${graph_3_height - margin.bottom - 20})`)       
            .style("text-anchor", "middle")
            .text("Count");

        //  y-axis label
        svg.append("text")
            .attr("transform", `translate(${-margin.right}, ${graph_3_height - margin.bottom - 20})`)       
            .style("text-anchor", "middle")
            .text("Director + Actor Pairs");

        // chart title
        svg.append("text")
            .attr("transform", `translate(${middle}, ${0})`)       
            .style("text-anchor", "middle")
            .style("font-size", 15)
            .text("Top 10 Director + Actor Pairs");
    });

    function congregateData(data, comparator, numExamples) {
        // creates director + actor pairs with frequency counts
        output = [];
        for (i = 0; i < data.length; i++) {
            directors = data[i].director.split(',')
            actors = data[i].cast.split(',')
            for (dir_i in directors) {
                for (actor_i in actors) {
                    director = directors[dir_i]
                    actor = actors[actor_i]
                    if (director != '' && actor != '') {
                        pair = {"director": director, "actor": actor}
                        ind = output.findIndex((element) => ((element.director == director) && (element.actor == actor)))
                        // new director + actor pair
                        if (ind < 0) {
                            output.push({"director": pair.director, "actor": pair.actor, "count": 1})
                        } else {
                            output[ind].count += 1
                        }
                    }
                }
            }
        }

        output.sort(function(a,b) {return comparator(a.count, b.count)})

        return output.slice(0, numExamples)
    }
})();