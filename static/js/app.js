// Set dimensions of SVG
let svgWidth = 960;
let svgHeight = 500;

// Set page margins
let margin = {
    top: 50,
    right: 40,
    bottom: 100,
    left: 100
};

let width = svgWidth - margin.left - margin.right;
let height = svgHeight - margin.top - margin.bottom;

// Create SVG wrapper, append an SVG group where chart will be placed, shift group by left and top margins
let svg = d3.select("#scatter")
            .append("svg")
            .attr("width", svgWidth)
            .attr("height", svgHeight);

// Append SVG group
let chartGroup = svg.append("g")
                    .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Initial parameters 
let chosenXAxis = "income";

// Function used to update x-scale dimensions upon click on axis label
function xScale(demographicData, chosenXAxis) {
    // create scales
    let xLinearScale = d3.scaleLinear()
                         .domain([d3.min(demographicData, d => d[chosenXAxis]) * 0.8, d3.max(demographicData, d => d[chosenXAxis]) *1.2]).range([0, width]);
    
    return xLinearScale;
}

// Function used to update x-axis upon click on axis label
function renderAxes(newXScale, xAxis) {
    let bottomAxis = d3.axisBottom(newXScale);

    xAxis.transition().duration(1000).call(bottomAxis);

    return xAxis;
}

// Function used to update circles to new circles
function renderCircles(circlesGroup, newXScale, chosenXAxis) {

    circlesGroup.transition().duration(1000).attr("cx", d => newXScale(d[chosenXAxis]));

    return circlesGroup;
}

// Function used for updating circles group with new tooltip
function updateToolTip(chosenXAxis, circlesGroup) {

    if(chosenXAxis === "income") {
        var label = "Household Income (Median)";
    } else if (chosenXAxis === "age"){
        var label = "Age (Median)";
    } else {
        var label = "In Poverty (%)";
    }

    let toolTip = d3.tip().attr("class", "tooltip").offset([80, -60]).html(function(d) {
        return (`${d.state}<br>${label} : ${d[chosenXAxis]}`);
    });

    circlesGroup.call(toolTip);

    // on mouseover event
    circlesGroup.on("mouseover", function(data){
        toolTip.show(data);
    })

    // on mouseout event
    .on("mouseout", function(data, index){
        toolTip.hide(data);
    });

    return circlesGroup;
}

// Retrieve data from CSV, build graph and execute functions
d3.csv("static/data/data.csv").then(function(demographicData){

    // Parse data
    demographicData.forEach(function(data) {
        data.poverty = +data.poverty;
        data.age = +data.age;
        data.income = +data.income;
        data.healthcare = +data.healthcare;
        data.obesity = +data.obesity;
        data.smokes = data.smokes;
    });

    // Update x-scale by calling xScale axis
    let xLinearScale = xScale(demographicData, chosenXAxis);

    // Create y scale function
    let yLinearScale = d3.scaleLinear().domain([d3.min(demographicData, d => d.obesity) - 5, d3.max(demographicData, d => d.obesity) + 5]).range([height, 0]);

    // Create initial axis functions 
    let bottomAxis = d3.axisBottom(xLinearScale);
    let leftAxis = d3.axisLeft(yLinearScale);

    // Append x axis 
    let xAxis = chartGroup.append("g").classed("x-axis", true).attr("transform", `translate(0, ${height})`).call(bottomAxis);

    // Append y axis
    chartGroup.append("g").call(leftAxis);

    // Append initial circles
    var circlesGroup = chartGroup.selectAll("circle")
    .data(demographicData)
    .enter()
    .append("circle")
    .attr("cx", d => xLinearScale(d[chosenXAxis]))
    .attr("cy", d => yLinearScale(d.obesity))
    .attr("r", 10)
    .attr("fill", "#9c9ede")
    .attr("opacity", "0.5");

    // Creat group for 3 x-axis labels
    let labelsGroup = chartGroup.append("g").attr("transform", `translate(${width / 2}, ${height + 20})`);

    let incomeLabel = labelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 25)
    .attr("value", "income")
    .classed("active", true)
    .text("Household Income (Median)");

    let povertyLabel = labelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 50)
    .attr("value", "poverty")
    .classed("inactive", true)
    .text("In Poverty (%)");

    let ageLabel = labelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 75)
    .attr("value", "age")
    .classed("inactive", true)
    .text("Age (Median)");

    // Append y axis
    chartGroup.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 0 - margin.left)
    .attr("x", 0 - height / 2)
    .attr("dy", "1em")
    .classed("axis-text", true)
    .text("Obesity (%)")

    // Call tooltip function
    var circlesGroup = updateToolTip(chosenXAxis, circlesGroup);

    // x axis labels event listener
    labelsGroup.selectAll("text").on("click", function(){
        let value = d3.select(this).attr("value");
        if (value !== chosenXAxis) {

            // Replace chosenXAxis with value
            chosenXAxis = value;

            // Update x scale for new data
            xLinearScale = xScale(demographicData, chosenXAxis);

            // Update x axis with transition
            xAxis = renderAxes(xLinearScale, xAxis);

            // Update circles with new x values
            circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis);

            // Update tooltips with new info
            circlesGroup = updateToolTip(chosenXAxis, circlesGroup);

            // Change classes to change bold text
            if (chosenXAxis === "income") {
                incomeLabel.classed("active", true).classed("inactive", false);
                povertyLabel.classed("active", false).classed("inactive", true);
                ageLabel.classed("active", false).classed("inactive", true);
            } else if (chosenXAxis === "poverty"){
                incomeLabel.classed("active", false).classed("inactive", true);
                povertyLabel.classed("active", true).classed("inactive", false);
                ageLabel.classed("active", false).classed("inactive", true);
            } else {
                incomeLabel.classed("active", false).classed("inactive", true);
                povertyLabel.classed("active", false).classed("inactive", true);
                ageLabel.classed("active", true).classed("inactive", false);
            }
        }
    });   
});