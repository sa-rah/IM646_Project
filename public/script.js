function draw(csv) {
    "use strict";

    let margin = 0,
        width = 600,
        height = 600,
        maxBarHeight = height / 2 - (margin + 70);

    let innerRadius = 0.1 * maxBarHeight; // innermost circle

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
        .attr("stop-color", "#F3D5AA");

    gradients.append("stop")
        .attr("offset", "50%")
        .attr("stop-color", "#F4A636");

    gradients.append("stop")
        .attr("offset", "100%")
        .attr("stop-color", "#AF4427");

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

    d3.csv(csv, function (error, data) {

        let cats = data.map(function (d, i) {
            return d.category_label;
        });

        let catCounts = {};
        for (var i = 0; i < cats.length; i++) {
            var num = cats[i];
            catCounts[num] = catCounts[num] ? catCounts[num] + 1 : 1;
        }
        // remove dupes (not exactly the fastest)
        cats = cats.filter(function (v, i) {
            return cats.indexOf(v) == i;
        });
        let numCatBars = cats.length;

        let angle = 0,
            rotate = 0,
            startOffset = 0;

        data.forEach(function (d, i) {
            // bars start and end angles
            d.startAngle = angle;
            angle += (2 * Math.PI) / numCatBars / catCounts[d.category_label];
            d.endAngle = angle;

            // y axis minor lines (i.e. questions) rotation
            d.rotate = rotate;
            rotate += 360 / numCatBars / catCounts[d.category_label];

            // y axis labels (i.e. question labels) offset
            d.startOffset = startOffset + (50 / numCatBars / catCounts[d.category_label]);
            startOffset += 100 / numCatBars / catCounts[d.category_label];
        });

        /* bars */
        let arc = d3.arc()
            .startAngle(function (d, i) {
                return d.startAngle;
            })
            .endAngle(function (d, i) {
                return d.endAngle;
            })
            .innerRadius(innerRadius);

        let bars = svg.selectAll("path.bar")
            .data(data)
            .enter().append("path")
            .classed("bars", true)
            .each(function (d) {
                d.outerRadius = innerRadius;
            })
            .attr("d", arc);

        let x_scale = d3.scaleLinear()
            .domain([0, 100])
            .range([innerRadius, maxBarHeight]);


        let y_scale = d3.scaleLinear()
            .domain([0, 100])
            .range([-innerRadius, -maxBarHeight]);

        bars.transition().ease(d3.easeElastic).duration(1000).delay(function (d, i) {
            return i * 100;
        })
            .attrTween("d", function (d, index) {
                var i = d3.interpolate(d.outerRadius, x_scale(+d.value));
                return function (t) {
                    d.outerRadius = i(t);
                    return arc(d, index);
                };
            });

        svg.selectAll("circle.x.minor")
            .data(y_scale.ticks(10))
            .enter().append("circle")
            .classed("gridlines minor", true)
            .attr("r", function (d) {
                return x_scale(d);
            });

        // question lines
        svg.selectAll("line.y.minor")
            .data(data)
            .enter().append("line")
            .classed("gridlines minor", true)
            .attr("y1", -innerRadius)
            .attr("y2", -maxBarHeight - 40)
            .attr("transform", function (d, i) {
                return "rotate(" + (d.rotate) + ")";
            });

        // category lines
        svg.selectAll("line.y.major")
            .data(cats)
            .enter().append("line")
            .classed("gridlines major", true)
            .attr("y1", -innerRadius)
            .attr("y2", -maxBarHeight - 70)
            .attr("transform", function (d, i) {
                return "rotate(" + (i * 360 / numCatBars) + ")";
            });
    });
}