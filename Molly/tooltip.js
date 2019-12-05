"use-strict";

let data = "";
let svgContainer = ""; // keep SVG reference in global scope
let popChartContainer = "";
const msm = {
    width: 1000,
    height: 800,
    marginAll: 50,
    marginLeft: 50,
}
// For tooltip
const small_msm = {
    width: 500,
    height: 500,
    marginAll: 60,
    marginLeft: 70
}

const margin = {top: 100, right: 100, bottom: 100, left: 100}
, width = 1500 - margin.left - margin.right // Use the window's width 
, height = 1500 - margin.top - margin.bottom // Use the window's height

d3.csv('../seattle_01.csv').then((data) => {
    // make an svg and append it to body
    const svg = d3.select('body').append("svg")
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)

    // get year min and max for us
    const bedroomsLimits = d3.extent(data, d => d['bedrooms'])
    // get scaling function for years (x axis)
    const xScale = d3.scaleLinear()
        .domain([bedroomsLimits[0] - 1,  + bedroomsLimits[1]])
        .range([margin.left, width + margin.left])

    // make x axis
    const xAxis = svg.append("g")
        .style('font', '20px times')
        .attr("transform", "translate(0," + (height + margin.top) + ")")
        .call(d3.axisBottom(xScale))


    const priceLimits = d3.extent(data, d => d['price']) 
    // get scaling function for y axis
    const yScale = d3.scaleLinear()
    .domain([priceLimits[1], priceLimits[0] - 100])
    .range([margin.top, margin.top + height])


    // make y axis
    const yAxis = svg.append("g")
        .style('font', '20px times')
        .attr("transform", "translate(" + margin.left + ",0)")
        .call(d3.axisLeft(yScale))

    // append the div which will be the tooltip
    const div = d3.select('body').append('div')
    .attr('class', 'tooltip')
    .style('opacity', 0)

    // let toolTipChart = div.append("div").attr("id", "tipChart")
    let toolChart = div.append('svg')
    .attr('width', small_msm.width)
    .attr('height', small_msm.height)

    let price_data = data.map((row) => +row["price"]);
    let price_limits = d3.extent(price_data);
    // make size scaling function for population
    let price_map_func = d3.scaleLinear()
      .domain([price_limits[0], price_limits[1]])
      .range([5, 45]);

    makeLabels();

    svg.selectAll('.dot').data(data)
        .enter()
        .append('circle')
            .attr('cx', d => xScale(d['bedrooms']))
            .attr('cy', d => yScale(d['price']))
            .attr('r',  (d) => price_map_func(d["price"]))
            .attr('fill', 'transparent')
            .attr('stroke', "#4874B7")
            // on mouseover of a particular plot
            .on("mouseover", function(d) {
                toolChart.selectAll("*").remove()
                div.transition()
                    .duration(200)
                    .style("opacity", .9);
                plotPopulation(d.room_id, toolChart)
                div//.html("Fertility:       " + d.fertility + "<br/>" +
                        // "Life Expectancy: " + d.life_expectancy + "<br/>" +
                        // "Population:      " + numberWithCommas(d["population"]) + "<br/>" +
                        // "Year:            " + d.year + "<br/>" +
                        // "Country:         " + d.country)
                    .style("left", (d3.event.pageX) + "px")
                    .style("top", (d3.event.pageY - 28) + "px");
            })
            .on("mouseout", function(d) {
                div.transition()
                    .duration(300)
                    .style('opacity', 0)
            })

    function makeLabels() {
        svg.append('text')
            .attr('x', 30)
            .attr('y', 40)
            .style('font-size', '30pt')
            .text('Price vs Bedroom');
    
        svg.append('text')
            .attr('x', 650)
            .attr('y', 1450)
            .style('font-size', '20pt')
            .text('Bedrooms');
    
        svg.append('text')
            .attr('transform', 'translate(30, 800)rotate(-90)')
            .style('font-size', '20pt')
            .text('Price');
        }

    
// Takes in room id to identify the current datapoint at hand. Plots the tooltip data
function plotPopulation(room_id, toolChart) {
    // get's only the data point that we are looking at by using unique room id
    let roomData = data.filter((row) => {return row.room_id == room_id})
    // Parses the accommodates data to go from string to an int
    let accommodates = roomData.map((row) => parseInt(row["accommodates"]));
    // Parses the bathroom data to go from string to a float
    let bathrooms = roomData.map((row) => parseFloat(row["bathrooms"]));
    // Gets the min and max of the two variables we are looking at
    let axesLimits = findMinMax(accommodates, bathrooms);
    console.log("accommodates", accommodates)
    console.log("bathrooms", bathrooms)
    // sets mapFunctions to the proper scales based on size of the tooltip
    let mapFunctions = drawAxes(axesLimits, "accommodates", "bathrooms", toolChart, small_msm);
    // Adds to the tooltip SVG a plot of the accomdates vs the bathrooms
    toolChart
        .append('rect')
            .attr('x', 220)
            .attr('y', mapFunctions.yScale(bathrooms) - 60)
            .attr('width', 30)
            .attr('height', 500 - mapFunctions.yScale(bathrooms))
            // .attr('r',  20)
            .attr('fill', 'transparent')
            .attr('stroke', "black")


    toolChart
    .append('rect')
    .append('text')
    .style('font-size', '18pt')
    .text(accommodates)
   

    makeToolKitLabels(toolChart, small_msm, "Number of Accommodates Vs. Number of Bathroom", 'Number of Accommodates', 'Number of Bathrooms');
}

function makeToolKitLabels(svgContainer, msm, title, x, y) {
    svgContainer.append('text')
        .attr('x', (msm.width / 2) - 250)
        .attr('y', msm.marginAll / 2 + 10)
        .style('font-size', '18pt')
        .text(title);

    svgContainer.append('text')
        .attr('x', (msm.width / 2) - 100)
        .attr('y', msm.height - 10)
        .style('font-size', '16pt')
        .text(x);

    svgContainer.append('text')
        .attr('transform', 'translate( 15,' + (msm.height / 2 + 100) + ') rotate(-90)')
        .style('font-size', '16pt')
        .text(y);
    

}



// draw the axes and ticks
function drawAxes(limits, x, y, svgContainer, msm) {
    // return x value from a row of data
    let xValue = function (d) {
        return +d[x];
    }

    // function to scale x value
    let xScale = d3.scaleLinear()
        .domain([limits.xMin - 0.5, limits.xMax + 0.5]) // give domain buffer room
        .range([0 + msm.marginAll, msm.width - msm.marginAll])

    // xMap returns a scaled x value from a row of data
    let xMap = function (d) {
        return xScale(xValue(d));
    };

    // plot x-axis at bottom of SVG
    let xAxis = d3.axisBottom().scale(xScale);
    svgContainer.append("g")
        .attr('transform', 'translate(0, ' + (msm.height - msm.marginAll) + ')')
        .call(xAxis);

    // return y value from a row of data
    let yValue = function (d) {
        return +d[y]
    }

    // function to scale y
    let yScale = d3.scaleLinear()
        .domain([limits.yMax + 5, limits.yMin - 5]) // give domain buffer
        .range([0 + msm.marginAll, msm.height - msm.marginAll])

    // yMap returns a scaled y value from a row of data
    let yMap = function (d) {
        return yScale(yValue(d));
    };

    // plot y-axis at the left of SVG
    let yAxis = d3.axisLeft().scale(yScale);
    svgContainer.append('g')
        .attr('transform', 'translate(' + msm.marginAll + ', 0)')
        .call(yAxis);

    // return mapping and scaling functions
    return {
        x: xMap,
        y: yMap,
        xScale: xScale,
        yScale: yScale
    };
}

// find min and max for arrays of x and y
function findMinMax(x, y) {

    // get min/max x values
    let xMin = d3.min(x);
    let xMax = d3.max(x);

    // get min/max y values
    let yMin = d3.min(y);
    let yMax = d3.max(y);

    // return formatted min/max data as an object
    return {
        xMin: xMin,
        xMax: xMax,
        yMin: yMin,
        yMax: yMax
    }
}

// format numbers
function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

    })