'use strict';

(function() {

  let data = "no data";
  let svgContainer = ""; // keep SVG reference in global scope
  const colors = {

    "Entire home/apt": "#4E79A7",

    "Private room": "darkred",

    "Shared room" : 'Orange'

}
  // load data and make scatter plot after window loads
  window.onload = function() {
    svgContainer = d3.select('#graph')
      .append('svg')
      .attr('width', 2000)
      .attr('height', 800);
    // d3.csv is basically fetch but it can be be passed a csv file as a parameter
    d3.csv("seattle_01.csv")
      .then((data) => makeScatterPlot(data));
      
  }

  // make scatter plot with trend line
  function makeScatterPlot(csvData) {
    data = csvData // assign data as global variable
    // let def = data.map((row) => parseFloat(row["Sp. Def"]));
    // let total = data.map((row) => parseFloat(row["Total"]));
    let price = data.map((row) => parseFloat(row["price"]));
    let rating = data.map((row) => parseFloat(row["overall_satisfaction"]));
    console.log(price);
    // find data limits
    let axesLimits = findMinMax(price, rating);

    // draw axes and return scaling + mapping functions
    let mapFunctions = drawAxes(axesLimits, "price", "overall_satisfaction");

    // plot data as points and add tooltip functionality
    plotData(mapFunctions);

    // draw title and axes labels
    makeLabels();

    // draw legend
    drawlegend();

    // create filter generation
    var dropDown = d3.select("#filter").append("select")
      .attr("name", "Gen");


    let types = []
    types.push({type : 'all'});
    types.push({type : 'Entire home/apt'});
    types.push({type : 'Private room'});
    types.push({type : 'Shared room'});

      var options = dropDown.selectAll("option")
           .data(types)
            .enter()
           .append("option");

      options.text(function (d) { 
        return d.type; })
      .attr("value", function (d) { return d.type; });
      


      // enable filter control
      dropDown.on("change", function() {
        var displayOthers = this.checked ? "inline" : "none";
        var display = this.checked ? "none" : "inline";
        let filter = this.value;
        console.log(filter);
        svgContainer.selectAll("circle")
            .filter(function(d) {return true ;})
            .attr("display", displayOthers);
            
        svgContainer.selectAll("circle")
            .filter(function(d) {return (filter == d.room_type) || (filter == 'all');})
            .attr("display", display)
        });

  }



  // make title and axes labels
  function makeLabels() {
    svgContainer.append('text')
      .attr('x', 300)
      .attr('y', 100)
      .style('font-size', '20pt')
      .text("Seattle Airbnb: Price VS Rating");

    svgContainer.append('text')
      .attr('x', 500)
      .attr('y', 600)
      .style('font-size', '15pt')
      .text('Price per night');

    svgContainer.append('text')
      .attr('transform', 'translate(30, 300)rotate(-90)')
      .style('font-size', '15pt')
      .text('Rating');
  }

  // plot all the data points on the SVG
  // and add tooltip functionality
  function plotData(map) {
    
    // get population data as array
    let xMap = map.x;
    let yMap = map.y;
    let colorMapFunc = function (d) { return colors[d['room_type']];}; 

    // make tooltip
    let div = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);



    // append data to SVG and plot as points
    svgContainer.selectAll('.dot')
      .data(data)
      .enter()
      .append('circle')
        .transition()
        .delay(function(d ,i){return(i* 0.5)})
        .duration(2000)
        .attr('cx', xMap)
        .attr('cy', yMap)
        .attr('r', 10)
        .style('fill', colorMapFunc)
        .style('stroke', "black")



        // add tooltip functionality to points
        svgContainer.selectAll("circle")
        .on("mouseover", (d) => {
            if (d['overall_satisfaction'] == ""){
              div.transition()
              .duration(10)
              .style("opacity", .9);
              div.html('Room Info' + "<br/>" + 'Price: ' + '$' + d['price']
                      + "<br/>" + 'Rating: ' + 'No info'
                      )
              .style("left", (d3.event.pageX) + "px")
              .style("top", (d3.event.pageY - 28) + "px");
            } else {
              div.transition()
              .duration(10)
              .style("opacity", .9);
              div.html('Room Info' + "<br/>" + 'Price: ' + '$' + d['price']
                      + "<br/>" + 'Rating: ' +d['overall_satisfaction'] 
                      )
              .style("left", (d3.event.pageX) + "px")
              .style("top", (d3.event.pageY - 28) + "px");
            }
     
        })
        .on("mouseout", (d) => {
          div.transition()
            .duration(500)
            .style("opacity", 0);
        })


        

    
  }

  // show legend

function drawlegend(){
  // Handmade legend
  svgContainer.selectAll(".legendDot")
  .data(Object.values(colors))
  .enter()
  .append("rect")
    .attr("x", 1000)
    .attr("y", function(d,i){ return 100 + 30 * i}) // 100 is where the first dot appears. 25 is the distance between dots
    .attr("width", 20)
    .attr("height", 20)
    .style("fill", function(d){return d})
    .style('stroke', "rgb(93,120,124)")
  
  svgContainer.selectAll(".legendName")
  .data(Object.keys(colors))
  .enter()
  .append("text")
    .attr("x", 1030)
    .attr("y", function(d,i){ return 117 + 30 * i}) 
    .text(function(d){return d})
    .style("font-size", "18px")

}



  // draw the axes and ticks
  function drawAxes(limits, x, y) {
    // return x value from a row of data
    let xValue = function(d) { return +d[x]; }
    
    // function to scale x value
    let xScale = d3.scaleLinear()
      .domain([limits.xMin - 100, limits.xMax + 100]) // give domain buffer room
      .range([100, 1000]);

    // xMap returns a scaled x value from a row of data
    let xMap = function(d) { return xScale(xValue(d)); };

    // plot x-axis at bottom of SVG
    let xAxis = d3.axisBottom().scale(xScale);
    svgContainer.append("g")
      .attr('transform', 'translate(0, 550)')
      .call(xAxis);

    // return y value from a row of data
    let yValue = function(d) {return +d[y]}

    // function to scale y
    let yScale = d3.scaleLinear()
      .domain([limits.yMax + 0.5, limits.yMin - 3]) // give domain buffer
      .range([100, 550]);

    // yMap returns a scaled y value from a row of data
    let yMap = function (d) { return yScale(yValue(d)); };
    // plot y-axis at the left of SVG
    let yAxis = d3.axisLeft().scale(yScale);
    svgContainer.append('g')
      .attr('transform', 'translate(100, 0)')
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
      xMin : xMin,
      xMax : xMax,
      yMin : yMin,
      yMax : yMax
    }
  }

  // format numbers
  function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }

})();
