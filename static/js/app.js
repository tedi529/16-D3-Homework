// Set dimensions of SVG
let svgWidth = 960;
let svgHeight = 500;

// Set page margins
let margin = {
    top: 40,
    right: 100,
    bottom: 100,
    left: 100
};

let width = svgWidth - margin.left - margin.right;
let height = svgHeight - margin.top - margin.bottom;

// Create SVG wrapper, append an SVG group where chart will be placed, shift group by left and top margins
let svg = d3.select("#scatter")
            .append("svg")
            .attr("width", svgWidth)
            .attr("height", svgHeight)
            .classed("chart", true);

// Append SVG group
let chartGroup = svg.append("g")
                    .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Initial parameters 
let chosenXAxis = "income";
let chosenYAxis = "healthcare";

// Function used to update x-scale dimensions upon click on axis label
function xScale(demographicData, chosenXAxis) {
    // create scales
    let xLinearScale = d3.scaleLinear()
                        .domain([d3.min(demographicData, d => d[chosenXAxis]) * 0.9, 
                        d3.max(demographicData, d => d[chosenXAxis]) *1.1]).range([0, width]);
    
    return xLinearScale;
}

// Function used to update y-scale dimensions upon click on axis label
function yScale(demographicData, chosenYAxis) {
    // crate scales
    let YLinearScale = d3.scaleLinear()
                        .domain([d3.min(demographicData, d => d[chosenYAxis]) * 0.8, 
                        d3.max(demographicData, d => d[chosenYAxis]) * 1.2]).range([height, 0]);

    return YLinearScale;
}

// Function used to update x-axis upon click on axis label
function renderAxes(newXScale, xAxis) {
    let bottomAxis = d3.axisBottom(newXScale);

    xAxis.transition().duration(1000).call(bottomAxis);

    return xAxis;
}

// Function used to update y-axis upon click on axis label
function renderYAxes(newYScale, yAxis) {
    let leftAxis = d3.axisLeft(newYScale);

    yAxis.transition().duration(1000).call(leftAxis);

    return yAxis;
}

// Function used to update circles to new circles
function renderCircles(circlesGroup, newXScale, chosenXAxis, newYScale, chosenYAxis) {

    circlesGroup.transition().duration(1000)
                .attr("cx", d => newXScale(d[chosenXAxis])).attr("cy", d => newYScale(d[chosenYAxis]));

    return circlesGroup;
}

// Function used to bind state abbreviations to circles
function renderLabels(circlesLabels, newXScale, chosenXAxis, newYScale, chosenYAxis) { 
    
    circlesLabels.transition().duration(1000)
                 .attr("x", d => newXScale(d[chosenXAxis])).attr("y", d => newYScale(d[chosenYAxis])).text(d => d.abbr);
    
    return circlesLabels;
}

// Function used for updating circles group with new tooltip
function updateToolTip(chosenXAxis, chosenYAxis, circlesGroup) {

    if (chosenXAxis === "income") {
        var xLabel = "Household Income (Median)";
    } else if (chosenXAxis === "age"){
        var xLabel = "Age (Median)";
    } else {
        var xLabel = "In Poverty (%)";
    }

    if (chosenYAxis === "healthcare") {
        var yLabel = "Lacks Healthcare (%)";
    } else if (chosenYAxis === "obesity"){
        var yLabel = "Obesity (%)";
    } else {
        var yLabel = "Smokes (%)";
    }

    let toolTip = d3.tip().attr("class", "d3-tip").offset([80, -60]).html(function(d) {
        return (`<strong>${d.state}</strong><br>${xLabel} : ${d[chosenXAxis]}<br>${yLabel} : ${d[chosenYAxis]}`);
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

    // Parse data and change to numerical
    demographicData.forEach(function(data) {
        data.poverty = +data.poverty;
        data.age = +data.age;
        data.income = +data.income;
        data.healthcare = +data.healthcare;
        data.obesity = +data.obesity;
        data.smokes = +data.smokes;
    });

    // Update x-scale by calling xScale axis
    let xLinearScale = xScale(demographicData, chosenXAxis);

    // Update y-scale by calling yScale axis
    let yLinearScale = yScale(demographicData, chosenYAxis);

    // Create initial axis functions 
    let bottomAxis = d3.axisBottom(xLinearScale);
    let leftAxis = d3.axisLeft(yLinearScale);

    // Append x axis 
    let xAxis = chartGroup.append("g").classed("x-axis", true).attr("transform", `translate(0, ${height})`).call(bottomAxis);

    // Append y axis
    let yAxis = chartGroup.append("g").classed("y-axis", true).attr("transform", `translate(${95 - margin.left}, 0)`).call(leftAxis);

    // Append initial circles
    var circlesGroup = chartGroup.selectAll("circle")
    .data(demographicData)
    .enter()
    .append("circle")
    .attr("cx", d => xLinearScale(d[chosenXAxis]))
    .attr("cy", d => yLinearScale(d[chosenYAxis]))
    .attr("r", 11)
    .attr("opacity", "0.7")
    .classed("stateCircle", true);

    //Append state abbreviations inside circles
    var circlesLabels = chartGroup.selectAll(null)
    .data(demographicData)
    .enter()
    .append("text")

    circlesLabels.attr("x", d => xLinearScale(d[chosenXAxis]))
    .attr("y", d => yLinearScale(d[chosenYAxis]))
    .text(d => d.abbr)
    .attr("font-size", "10px")
    .classed("stateText", true);

    // Create group for 3 x-axis labels
    let labelsGroup = chartGroup.append("g").classed("aText", true).attr("transform", `translate(${width / 2}, ${height + 20})`);

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

    // Creat group for 3 y-axis labels
    let labelsYGroup = chartGroup.append("g").classed("aText", true).attr("transform", `translate(${45 - margin.left}, ${height/2 - 35})`)

    let healthcareLabel = labelsYGroup.append("text")
    .attr("transform", "rotate(-90)")
    .attr("x", 0)
    .attr("y", -50)
    .attr("value", "healthcare")
    .attr("dy", "1em")
    .classed("active", true)
    .text("Lacks Healthcare (%)");

    let obesityLabel = labelsYGroup.append("text")
    .attr("transform", "rotate(-90)")
    .attr("x", 0)
    .attr("y", -25)
    .attr("value", "obesity")
    .attr("dy", "1em")
    .classed("inactive", true)
    .text("Obesity (%)");

    let smokesLabel = labelsYGroup.append("text")
    .attr("transform", "rotate(-90)")
    .attr("x", 0)
    .attr("y", 0)
    .attr("value", "smokes")
    .attr("dy", "1em")
    .classed("inactive", true)
    .text("Smokes (%)");

    // Call tooltip function
    circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

    // x axis labels event listener
    labelsGroup.selectAll("text").on("click", function(){
        let yvalue = d3.select(this).attr("value");
        if (yvalue !== chosenXAxis) {

            // Replace chosenXAxis with value
            chosenXAxis = yvalue;

            // Update x scale for new data
            xLinearScale = xScale(demographicData, chosenXAxis);

            // Update x axis with transition
            xAxis = renderAxes(xLinearScale, xAxis);

            // Update circles with new x values
            circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

            // Update tooltips with new info
            circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

            // Update position of state abbreviations
            circlesLabels = renderLabels(circlesLabels, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

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

    // y axis labels event listener
    labelsYGroup.selectAll("text").on("click", function(){
        let value = d3.select(this).attr("value");
        if (value !== chosenYAxis) {
    
            // Replace chosenYAxis with value
            chosenYAxis = value;
    
            // Update y scale for new data
            yLinearScale = yScale(demographicData, chosenYAxis);
    
            // Update y axis with transition
            yAxis = renderYAxes(yLinearScale, yAxis);
    
            // Update circles with new y values
            circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);
    
            // Update tooltips with new info
            circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

            // Update position of state abbreviations
            circlesLabels = renderLabels(circlesLabels, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);
    
            // Change classes to change bold text
            if (chosenYAxis === "healthcare") {
                healthcareLabel.classed("active", true).classed("inactive", false);
                obesityLabel.classed("active", false).classed("inactive", true);
                smokesLabel.classed("active", false).classed("inactive", true);
            } else if (chosenYAxis === "obesity"){
                healthcareLabel.classed("active", false).classed("inactive", true);
                obesityLabel.classed("active", true).classed("inactive", false);
                smokesLabel.classed("active", false).classed("inactive", true);
            } else {
                healthcareLabel.classed("active", false).classed("inactive", true);
                obesityLabel.classed("active", false).classed("inactive", true);
                smokesLabel.classed("active", true).classed("inactive", false);
            }
        }
    });  
});

