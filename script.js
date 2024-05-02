// Get the full width and height of the browser's viewport
const width = window.innerWidth;
const height = window.innerHeight;

const nodeHeight = 100;
const nodeWidth = 25;
const verticalSeparation = 40;
const horizontalSeparation = 10;

// Make sure there is no margin or padding that could offset the SVG element
d3.select("body").style("margin", "0").style("padding", "0");
d3.select("html").style("margin", "0").style("padding", "0");

// Select the container and append the SVG element to it
const svg = d3.select("#tree-container").append("svg")
    .attr("width", width)
    .attr("height", height)
    .call(d3.zoom().on("zoom", (event) => {
        svgGroup.attr("transform", event.transform);
    }))
    .append("g");

// Create the base SVG group
const svgGroup = svg.append("g");

// Tooltip for image display
const tooltip = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("position", "absolute")
    .style("z-index", "10")
    .style("visibility", "hidden");

// Load the tree data
d3.json("data/tree.json").then(function(data) {
    const root = d3.hierarchy(data);
    const treeLayout = d3.tree()
    .nodeSize([nodeWidth+horizontalSeparation, nodeHeight+verticalSeparation])  // [width, height] of each node]
    .separation(function(a, b) { return (a.parent == b.parent ? 1 : 1); });
    treeLayout(root);

    // Draw links
    const link = svgGroup.selectAll(".link")
        .data(root.links())
        .enter().append("path")
        .attr("class", "link")
        .attr("d", d3.linkVertical() // Use linkVertical instead of linkHorizontal
            .x(d => d.x)
            .y(d => d.y));

    // Draw nodes
    const node = svgGroup.selectAll(".node")
        .data(root.descendants())
        .enter().append("g")
        .attr("class", "node")
        .attr("transform", d => `translate(${d.x},${d.y})`); // Swap x and y for vertical orientation

        node.append("circle")
        .attr("r", 10)
        .attr("fill", d => d.data.centroid != null ? "red" : "#999")
        .on("mouseover", function(event, d) {
            tooltip.html(`<div>Loading images...</div>`)
                   .style("visibility", "visible")
                   .style("left", (event.pageX + 20) + "px")
                   .style("top", (event.pageY + 20) + "px");
    
            displayImagesForNode(`images/node_${d.data.id}`);
        })
        .on("mousemove", function(event) {
            tooltip.style("left", (event.pageX + 20) + "px")
                   .style("top", (event.pageY + 20) + "px");
        })
        .on("mouseout", function() {
            tooltip.style("visibility", "hidden");
        });

    // Add centroid labels if not null
    node.filter(d => d.data.centroid != null)
    .append("text")
    .attr("x", 20) // Position the text right of the node
    .attr("y", 5) // Center text vertically with the node
    .text(d => `Centroid: ${d.data.centroid}`)
    .attr("font-family", "sans-serif")
    .attr("font-size", "10px")
    .attr("fill", "black");
    
        function displayImagesForNode(nodePath) {
            tooltip.html(''); // Clear existing content
            tooltip.style('display', 'inline-block'); // Set display to inline-block
            const maxImages = 10; // Assuming up to 10 images per node as specified
            const imagesPerRow = 5; // Number of images per row
            const rowWidth = imagesPerRow * 110; // Calculate row width to hold 5 images considering the margins
            tooltip.style('max-width', rowWidth + 'px'); // Set the maximum width of the tooltip
        
            let imageCounter = 0; // Keep track of how many images have been added to the current row
            let rowDiv = tooltip.append('div').style('white-space', 'nowrap'); // Create a row and prevent wrapping
        
            for (let i = 1; i <= maxImages; i++) {
                let img = new Image();
                img.src = `${nodePath}/image${i}.jpg`;
                img.style.maxWidth = '100px';
                img.style.margin = '5px';
                img.onerror = function() {
                    this.style.display = 'none'; // Hide image on error
                };
                img.onload = function() {
                    imageCounter++;
                    if (imageCounter > imagesPerRow) { // When the row is full, create a new row
                        imageCounter = 1; // Reset counter for the new row
                        rowDiv = tooltip.append('div').style('white-space', 'nowrap'); // Create a new row and prevent wrapping
                    }
                    rowDiv.node().appendChild(img); // Append image to the current row
                };
            }
        }
        
    })        