function drawRadialBarChart(csv) {
    "use strict";

    let margin = 0,
        width = 750,
        height = 750,
        maxBarHeight = height / 2 - (margin + 70);

    let innerRadius = 0.15 * maxBarHeight; // innermost circle

    let svg = d3.select('body')
        .append("svg")
        .attr("width", width)
        .attr("height", height)
        .append("g")
        .attr("class", "chart")
        .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

    let defs = svg.append("defs");

    let gradients = defs
        .append("linearGradient")
        .attr("id", "gradient-chart-area")
        .attr("x1", "50%")
        .attr("y1", "0%")
        .attr("x2", "50%")
        .attr("y2", "100%")
        .attr("spreadMethod", "pad");

    gradients.append("stop")
        .attr("offset", "0%")
        .attr("stop-color", "#EDF0F0")
        .attr("stop-opacity", 1);

    gradients.append("stop")
        .attr("offset", "100%")
        .attr("stop-color", "#ACB7BE")
        .attr("stop-opacity", 1);

    gradients = defs
        .append("linearGradient")
        .attr("id", "gradient-questions")
        .attr("x1", "50%")
        .attr("y1", "0%")
        .attr("x2", "50%")
        .attr("y2", "100%")
        .attr("spreadMethod", "pad");

    gradients.append("stop")
        .attr("offset", "0%")
        .attr("stop-color", "#F6F8F9")
        .attr("stop-opacity", 1);

    gradients.append("stop")
        .attr("offset", "100%")
        .attr("stop-color", "#D4DAE0")
        .attr("stop-opacity", 1);

    gradients = defs
        .append("radialGradient")
        .attr("id", "gradient-bars")
        .attr("gradientUnits", "userSpaceOnUse")
        .attr("cx", "0")
        .attr("cy", "0")
        .attr("r", maxBarHeight)
        .attr("spreadMethod", "pad");

    gradients.append("stop")
        .attr("offset", "0%")
        .attr("stop-color", "#00BCD4");

    gradients.append("stop")
        .attr("offset", "50%")
        .attr("stop-color", "#00838F");

    gradients.append("stop")
        .attr("offset", "100%")
        .attr("stop-color", "#3F51B5");

    svg.append("circle")
        .attr("r", maxBarHeight + 70)
        .classed("category-circle", true);

    svg.append("circle")
        .attr("r", maxBarHeight + 40)
        .classed("question-circle", true);

    svg.append("circle")
        .attr("r", maxBarHeight)
        .classed("chart-area-circle", true);

    svg.append("circle")
        .attr("r", innerRadius)
        .classed("center-circle", true);

    d3.csv(csv, function(error, data) {

        let cats = data.map(function(d, i) {
            return d.category_label;
        });

        let catCounts = {};
        for (let i = 0; i < cats.length; i++) {
            let num = cats[i];
            catCounts[num] = catCounts[num] ? catCounts[num] + 1 : 1;
        }
        // remove dupes (not exactly the fastest)
        cats = cats.filter(function(v, i) {
            return cats.indexOf(v) === i;
        });
        let numCatBars = cats.length;

        let angle = 0,
            rotate = 0;

        data.forEach(function(d, i) {
            // bars start and end angles
            d.startAngle = angle;
            angle += (2 * Math.PI) / numCatBars / catCounts[d.category_label];
            d.endAngle = angle;

            // y axis minor lines (i.e. questions) rotation
            d.rotate = rotate;
            rotate += 360 / numCatBars / catCounts[d.category_label];
        });

        // category_label
        let arc_category_label = d3.svg.arc()
            .startAngle(function(d, i) {
                return (i * 2 * Math.PI) / numCatBars;
            })
            .endAngle(function(d, i) {
                return ((i + 1) * 2 * Math.PI) / numCatBars;
            })
            .innerRadius(maxBarHeight + 40)
            .outerRadius(maxBarHeight + 64);

        let category_text = svg.selectAll("path.category_label_arc")
            .data(cats)
            .enter().append("path")
            .classed("category-label-arc", true)
            .attr("id", function(d, i) {
                return "category_label_" + i;
            }) //Give each slice a unique ID
            .attr("fill", "none")
            .attr("d", arc_category_label);

        category_text.each(function(d, i) {
            //Search pattern for everything between the start and the first capital L
            let firstArcSection = /(^.+?)L/;

            //Grab everything up to the first Line statement
            let newArc = firstArcSection.exec(d3.select(this).attr("d"))[1];
            //Replace all the commas so that IE can handle it
            newArc = newArc.replace(/,/g, " ");

            //If the whole bar lies beyond a quarter of a circle (90 degrees or pi/2)
            // and less than 270 degrees or 3 * pi/2, flip the end and start position
            let startAngle = (i * 2 * Math.PI) / numCatBars,
                endAngle = ((i + 1) * 2 * Math.PI) / numCatBars;

            if (startAngle > Math.PI / 2 && startAngle < 3 * Math.PI / 2 && endAngle > Math.PI / 2 && endAngle < 3 * Math.PI / 2) {
                let startLoc = /M(.*?)A/, //Everything between the capital M and first capital A
                    middleLoc = /A(.*?)0 0 1/, //Everything between the capital A and 0 0 1
                    endLoc = /0 0 1 (.*?)$/; //Everything between the 0 0 1 and the end of the string (denoted by $)
                //Flip the direction of the arc by switching the start and end point (and sweep flag)
                let newStart = endLoc.exec(newArc)[1];
                let newEnd = startLoc.exec(newArc)[1];
                let middleSec = middleLoc.exec(newArc)[1];

                //Build up the new arc notation, set the sweep-flag to 0
                newArc = "M" + newStart + "A" + middleSec + "0 0 0 " + newEnd;
            }

            // modifying existing arc instead
            d3.select(this).attr("d", newArc);
        });

        svg.selectAll(".category-label-text")
            .data(cats)
            .enter().append("text")
            .attr("class", "category-label-text")
            //Move the labels below the arcs for those slices with an end angle greater than 90 degrees
            .attr("dy", function(d, i) {
                let startAngle = (i * 2 * Math.PI) / numCatBars,
                    endAngle = ((i + 1) * 2 * Math.PI) / numCatBars;
                return (startAngle > Math.PI / 2 && startAngle < 3 * Math.PI / 2 && endAngle > Math.PI / 2 && endAngle < 3 * Math.PI / 2 ? -4 : 14);
            })
            .append("textPath")
            .attr("startOffset", "50%")
            .style("text-anchor", "middle")
            .attr("xlink:href", function(d, i) {
                return "#category_label_" + i;
            })
            .text(function(d) {
                return d;
            });

        // livestock
        let arc_livestock = d3.svg.arc()
            .startAngle(function(d, i) {
                return d.startAngle;
            })
            .endAngle(function(d, i) {
                return d.endAngle;
            })
            //.innerRadius(maxBarHeight + 2)
            .outerRadius(maxBarHeight + 2);

        let question_text = svg.selectAll("path.livestock")
            .data(data)
            .enter().append("path")
            .classed("question-label-arc", true)
            .attr("id", function(d, i) {
                return "livestock_" + i;
            }) //Give each slice a unique ID
            .attr("fill", "none")
            .attr("d", arc_livestock);

        question_text.each(function(d, i) {
            //Search pattern for everything between the start and the first capital L
            let firstArcSection = /(^.+?)L/;

            //Grab everything up to the first Line statement
            let newArc = firstArcSection.exec(d3.select(this).attr("d"))[1];
            //Replace all the commas so that IE can handle it
            newArc = newArc.replace(/,/g, " ");

            //If the end angle lies beyond a quarter of a circle (90 degrees or pi/2)
            //flip the end and start position
            if (d.startAngle > Math.PI / 2 && d.startAngle < 3 * Math.PI / 2 && d.endAngle > Math.PI / 2 && d.endAngle < 3 * Math.PI / 2) {
                let startLoc = /M(.*?)A/, //Everything between the capital M and first capital A
                    middleLoc = /A(.*?)0 0 1/, //Everything between the capital A and 0 0 1
                    endLoc = /0 0 1 (.*?)$/; //Everything between the 0 0 1 and the end of the string (denoted by $)
                //Flip the direction of the arc by switching the start and end point (and sweep flag)
                let newStart = endLoc.exec(newArc)[1];
                let newEnd = startLoc.exec(newArc)[1];
                let middleSec = middleLoc.exec(newArc)[1];

                //Build up the new arc notation, set the sweep-flag to 0
                newArc = "M" + newStart + "A" + middleSec + "0 0 0 " + newEnd;
            }

            // modifying existing arc instead
            d3.select(this).attr("d", newArc);
        });

        question_text = svg.selectAll(".question-label-text")
            .data(data)
            .enter().append("text")
            .attr("class", "question-label-text")
            .append("textPath")
            .style('font-size', '7px')
            .style('font-family', 'sans-serif')
            .attr("xlink:href", function(d, i) {
                return "#livestock_" + i;
            })
            .text(function(d) {
                return d.livestock.toUpperCase();
            })
            .call(wrapTextOnArc, maxBarHeight);

        // adjust dy (labels vertical start) based on number of lines (i.e. tspans)
        question_text.each(function(d, i) {
            //console.log(d3.select(this)[0]);
            let textPath = d3.select(this)[0][0],
                tspanCount = textPath.childNodes.length;

            if (d.startAngle > Math.PI / 2 && d.startAngle < 3 * Math.PI / 2 && d.endAngle > Math.PI / 2 && d.endAngle < 3 * Math.PI / 2) {
                // set baseline for one line and adjust if greater than one line
                d3.select(textPath.childNodes[0]).attr("dy", 3 + (tspanCount - 1) * -0.6 + 'em');
            } else {
                d3.select(textPath.childNodes[0]).attr("dy", -2.1 + (tspanCount - 1) * -0.6 + 'em');
            }
        });

        /* bars */
        let arc = d3.svg.arc()
            .startAngle(function(d, i) {
                return d.startAngle;
            })
            .endAngle(function(d, i) {
                return d.endAngle;
            })
            .innerRadius(innerRadius);

        let bars = svg.selectAll("path.bar")
            .data(data)
            .enter().append("path")
            .classed("bars", true)
            .each(function(d) {
                d.outerRadius = innerRadius;
            })
            .attr("d", arc);

        bars.transition().ease("elastic").duration(1000).delay(function(d, i) {
            return i * 100;
        })
            .attrTween("d", function(d, index) {
                let i = d3.interpolate(d.outerRadius, x_scale(+d.value));
                return function(t) {
                    d.outerRadius = i(t);
                    return arc(d, index);
                };
            });

        let div = d3.select("body").append("div")
            .attr("class", "tooltip")
            .style("opacity", 0);

        console.log(data);

        // TOOLTIP
        bars.on("mouseover", function(d, index) {
            div.transition()
                .duration(200)
                .style("opacity", .9);
            div.html("<h4>" + data[index].category_label + "</h4><br/>" + data[index].livestock + "<br/>")
                .style("left", (d3.event.pageX) + "px")
                .style("top", (d3.event.pageY - 28) + "px");
        }).on("mouseout", function(d) {
                div.transition()
                    .duration(200)
                    .style("opacity", 0);
        });

        let x_scale = d3.scale.log()
            .domain([1, 2500])
            .range([innerRadius, maxBarHeight]);


        let y_scale = d3.scale.log()
            .domain([1, 2500])
            .range([-innerRadius, -maxBarHeight]);

        svg.selectAll("circle.x.minor")
            .data(y_scale.ticks(10))
            .enter().append("circle")
            .classed("gridlines minor", true)
            .attr("r", function(d) {
                return x_scale(d);
            });

        // question lines
        svg.selectAll("line.y.minor")
            .data(data)
            .enter().append("line")
            .classed("gridlines minor", true)
            .attr("y1", -innerRadius)
            .attr("y2", -maxBarHeight - 40)
            .attr("transform", function(d, i) {
                return "rotate(" + (d.rotate) + ")";
            });

        // category lines
        svg.selectAll("line.y.major")
            .data(cats)
            .enter().append("line")
            .classed("gridlines major", true)
            .attr("y1", -innerRadius)
            .attr("y2", -maxBarHeight - 70)
            .attr("transform", function(d, i) {
                return "rotate(" + (i * 360 / numCatBars) + ")";
            });
    });
}

function drawBarChart(csv) {

    d3.csv(csv, function (error, data) {

    });

}


function wrapTextOnArc(text, radius) {
    // note getComputedTextLength() doesn't work correctly for text on an arc,
    // hence, using a hidden text element for measuring text length.
    let temporaryText = d3.select('svg')
        .append("text")
        .attr("class", "temporary-text") // used to select later
        .style("font", "7px sans-serif")
        .style("opacity", 0); // hide element

    let getTextLength = function(string) {
        temporaryText.text(string);
        return temporaryText.node().getComputedTextLength();
    };

    text.each(function(d) {
        let text = d3.select(this),
            words = text.text().split(/[ \f\n\r\t\v]+/).reverse(), //Don't cut non-breaking space (\xA0), as well as the Unicode characters \u00A0 \u2028 \u2029)
            word,
            wordCount = words.length,
            line = [],
            textLength,
            lineHeight = 1.1, // ems
            x = 0,
            y = 0,
            dy = 0,
            tspan = text.text(null).append("tspan").attr("x", x).attr("y", y).attr("dy", dy + "em"),
            arcLength = ((d.endAngle - d.startAngle) / (2 * Math.PI)) * (2 * Math.PI * radius),
            paddedArcLength = arcLength - 16;

        while (word = words.pop()) {
            line.push(word);
            tspan.text(line.join(" "));
            textLength = getTextLength(tspan.text());
            tspan.attr("x", (arcLength - textLength) / 2);

            if (textLength > paddedArcLength && line.length > 1) {
                // remove last word
                line.pop();
                tspan.text(line.join(" "));
                textLength = getTextLength(tspan.text());
                tspan.attr("x", (arcLength - textLength) / 2);

                // start new line with last word
                line = [word];
                tspan = text.append("tspan").attr("dy", lineHeight + dy + "em").text(word);
                textLength = getTextLength(tspan.text());
                tspan.attr("x", (arcLength - textLength) / 2);
            }
        }
    });

    d3.selectAll("text.temporary-text").remove()
}