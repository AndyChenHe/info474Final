
const colors = {

    "98136": "#c9ea15",

    "98144": "#81d12e",

    "98109" : '#81ba45',

    "98195": "#99f20d",

    "98199": "#85bd42",

    "98101" : '#8cf906',

    "98102": "#85b24d",

    "98121": "#9bc738",

    "98154" : '#86a956',

    "98164": "#a89e57",

    "98116": "#cad827",

    "98126" : '#d2ff00',

    "98107": "#0af577",

    "98119": "#0ef1b7",

    "98133" : '#53ac66',

    "98108": "#0df2d7",

    "98178": "#5bb34c",

    "98105" : '#05fac2',

    "98155": "#3da4c2",

    "98177": "#81af50",

    "98103" : '#65b54a',

    "98104": "#35ca4e",

    "98112": "#3ed22d",

    "98115" : '#61ea15',

    "98118": "#24db41",

    "98122" : '#18e781',

    "98125": "#29d657",

    "98134": "#69e31c",

    "98146" : '#2bd728',

    "98106": "#1bea15",

    "98117": "#69f708",

    "98115" : '#91e817',

    "98168" : '#03fc48'

}


var width = 600,
    height = 1200;

d3.json("zip-codes.json", function(data) {
//   var center = d3.geo.centroid(data)
  var offset = [width/2, height/2];
  let zip_code_json = data;
  var svg = d3.select('body')
  .append('svg')
  .attr('width', width)
  .attr('height', height);

    console.log(zip_code_json.features[1].properties.GEOID10)
    var zip_codes = svg.append('g');

    var albersProjection = d3.geoAlbers()
    .scale(200000)
    .rotate([122.3321, 0])
    .center([0, 47.6062])
    .translate([width/2, height/2]);

    var geoPath = d3.geoPath()
        .projection(albersProjection);

    var points = svg.append( "g" ).attr( "id", "points" );

    zip_codes.selectAll('path')
    .data(zip_code_json.features)
    .enter()
    .append('path')
    .attr('fill', function(d) { return colors[d.properties.GEOID10]; })
    // .style("fill", function (d) { return colors[d['Type 1']]; })
    .attr('d', geoPath);

    // make tooltip
    let div = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

  d3.json('test.json', function(pointData)  {
    // console.log(pointData.features[1].properties.price)
    
    zip_codes.selectAll('circle').data(pointData.features)
      .enter()
      .append('path')
      .attr('class', 'coord')
      .attr('fill', '#1fbae0')
      .attr('fill-opacity', 0.5)
      .attr("stroke", "#002e74")
      .attr('d', geoPath)

    
      .on("mouseover", function(d) {
        console.log(d.properties.price);
        div.transition()
          .duration(200)
          .style("opacity", .9);
        div.html('Name: ' + d.properties['name'] + "<br/>" + 'Price: ' + '$' + d.properties['price'] + '<br/>' + 'Bathrooms: ' + d.properties['bathrooms'] + '<br/>' + 'Beds: ' + d.properties['bedrooms'])
          .style("left", (d3.event.pageX) + "px")
          .style("top", (d3.event.pageY - 28) + "px");
      })
      .on("mouseout", (d) => {
        div.transition()
          .duration(500)
          .style("opacity", 0);
      });

    })




  });
