//*/ Variables and initialization
let svg = document.getElementById("svg");
let polygon = document.getElementById("polygon");
let path = document.getElementById("path");

let pointAmount = document.getElementById("pointAmount");
let rotation = document.getElementById("rotation");
let minDistance = document.getElementById("minDistance");
let maxDistance = document.getElementById("maxDistance");
let smoothing = document.getElementById("smoothing");;
let autoGenerate = document.getElementById("autoGenerate");
let generateOnUpdate = document.getElementById("generateOnUpdate");
let generateOnInterval = document.getElementById("generateOnInterval");
let generateInterval = document.getElementById("generateInterval");

let innerRing = document.getElementById("innerRing");
let outerRing = document.getElementById("outerRing");


let ringClamping = true;
let generatorInputs = [pointAmount, rotation, minDistance, maxDistance, smoothing, autoGenerate, generateOnUpdate, generateOnInterval, generateInterval];
let latestPoints = [];


let timer = setInterval(() => {
    ShapeGenerator();
}, generateInterval.value);

Math.clamp = function(value, min, max) {
    return Math.max(min, Math.min(max, value));
}

ResetInputs()
ShapeGenerator();
//*/

//*/ Event handlers
pointAmount.oninput = () => {
    UpdateGenerationInputsLogic();
    UpdateGenerationInputsDisplay();
};
rotation.oninput = () => {
    svg.style.transform = `rotate(${Number(rotation.value)}deg)`;
    //UpdateGenerationInputsLogic();
    UpdateGenerationInputsDisplay();
}
minDistance.oninput = () => {
    innerRing.r.baseVal.value = minDistance.value;

    UpdateOuterRing();
    UpdateGenerationInputsLogic();
    UpdateGenerationInputsDisplay();
};
maxDistance.oninput = () => {
    outerRing.r.baseVal.value = maxDistance.value;

    UpdateInnerRing();
    UpdateGenerationInputsLogic();
    UpdateGenerationInputsDisplay();
};
smoothing.oninput = () => {
    if (smoothing.value > 0) {
        SmoothSVG(latestPoints);
        polygon.style.display = "none";
        path.style.display = "inline";
    } else {
        polygon.style.display = "inline";
        path.style.display = "none";
    }
    
    // UpdateGenerationInputsLogic();
    UpdateGenerationInputsDisplay();
}
autoGenerate.oninput = () => {
    UpdateGenerationInputsLogic(true);
    UpdateGenerationInputsDisplay();
};
generateOnUpdate.oninput = () =>  {
    UpdateGenerationInputsLogic(true);
    UpdateGenerationInputsDisplay();
};
generateOnInterval.oninput = () => {
    UpdateGenerationInputsLogic(true);
    UpdateGenerationInputsDisplay();
};
generateInterval.oninput = () => {
    UpdateGenerationInputsLogic(true);
    UpdateGenerationInputsDisplay();
};
generateShapeButton.onclick = () => ShapeGenerator();
randomizeButton.onclick = () => {
    let rings = [];

    for (generatorInput in generatorInputs) {
        switch (Number(generatorInput)) {
            case 0:
                generatorInputs[generatorInput].value = Math.round((Math.random() * (generatorInputs[generatorInput].max - generatorInputs[generatorInput].min)) + generatorInputs[generatorInput].min);
                break;
            case 2:
            case 3:
                rings.push(Math.round((Math.random() * (generatorInputs[generatorInput].max - generatorInputs[generatorInput].min)) + generatorInputs[generatorInput].min));
                break;
        }
    }

    generatorInputs[2].value = Math.min(rings[0], rings[1]);
    generatorInputs[3].value = Math.max(rings[0], rings[1]);

    if (autoGenerate.checked && generateOnUpdate.checked) {
        ShapeGenerator();
    }

    UpdateGenerationInputsLogic(true);
    UpdateGenerationInputsDisplay();
    UpdateInnerRing();
    UpdateOuterRing();
};
resetButton.onclick = () => {
    ResetInputs();
};
//*/

//*/ Functions
function ShapeGenerator() {
    polygon.points.clear();
    latestPoints = [];
    
    let pointAmountNumber = Number(document.getElementById("pointAmount").value);
    let minDistanceNumber = Number(document.getElementById("minDistance").value);
    let maxDistanceNumber = Number(document.getElementById("maxDistance").value);
    
    for (let i = 0; i < pointAmountNumber; i++) {
        let point = svg.createSVGPoint();
        let degrees = (360 / pointAmountNumber) * (i + 1);
        let distance = (Math.random() * (maxDistanceNumber - minDistanceNumber)) + minDistanceNumber;
        let radians = degrees * 2 * Math.PI / 360;
        point.x = (Math.cos(radians) * distance) + 160;
        point.y = (Math.sin(radians) * distance) + 160;

        polygon.points.appendItem(point);
        latestPoints.push([point.x, point.y]);
    }

    if (smoothing.value > 0) {
        SmoothSVG(latestPoints);
        polygon.style.display = "none";
        path.style.display = "inline";
    } else {
        polygon.style.display = "inline";
        path.style.display = "none";
    }
}

function UpdateGenerationInputsLogic(intervalChanged = false) {
    if (intervalChanged) {
        clearInterval(timer);
    }

    if (autoGenerate.checked) {
        if (intervalChanged && generateOnInterval.checked) {
            timer = setInterval(() => {
                ShapeGenerator();
            }, generateInterval.value);
        } else if (generateOnUpdate.checked) {
            ShapeGenerator();
        }
    }
}

function UpdateGenerationInputsDisplay() {
    if (autoGenerate.checked) {
        autoGenerateMethodsContainer.style.display = "block";
        if (generateOnInterval.checked) {
            generateIntervalContainer.style.display = "block";
        } else {
            generateIntervalContainer.style.display = "none";
        }
        generateShapeButton.style.display = "none";
    } else {
        autoGenerateMethodsContainer.style.display = "none";
        generateIntervalContainer.style.display = "none";
        generateShapeButton.style.display = "inline-block";
    }

    pointAmountDisplay.innerHTML = pointAmount.value;
    rotationDisplay.innerHTML = rotation.value;
    minDistanceDisplay.innerHTML = minDistance.value;
    maxDistanceDisplay.innerHTML = maxDistance.value;
    smoothingDisplay.innerHTML = smoothing.value;
    generateIntervalDisplay.innerHTML = generateInterval.value
}

function UpdateInnerRing() {
    if (ringClamping) {
        let clampedRingSize = Math.clamp(minDistance.value, minDistance.min, maxDistance.value);
        minDistance.value = clampedRingSize;
        innerRing.r.baseVal.value = clampedRingSize;
    } else {
        innerRing.r.baseVal.value = minDistance.value;
    }
}

function UpdateOuterRing() {
    if (ringClamping) {
        let clampedRingSize = Math.clamp(maxDistance.value, minDistance.value, maxDistance.max);
        maxDistance.value = clampedRingSize;
        outerRing.r.baseVal.value = clampedRingSize;
    } else {
        outerRing.r.baseVal.value = maxDistance.value;
    }
}

function ResetInputs() {
    for (generatorInput in generatorInputs) {
        switch(Number(generatorInput)) {
            case 0:
                generatorInputs[generatorInput].value = 10;// Point amount
                break;
            case 1:
                generatorInputs[generatorInput].value = 0;// Rotation
                break;
            case 2:
                generatorInputs[generatorInput].value = 50;// Minimum distance
                break;
            case 3:
                generatorInputs[generatorInput].value = 150;// Maximum distance
                break;
            case 4:
                generatorInputs[generatorInput].value = 0;// Smoothing
                break;
            case 5:
                generatorInputs[generatorInput].checked = true;// Auto generation
                break;
            case 6:
                generatorInputs[generatorInput].checked = false;// Generate on update
                break;
            case 7:
                generatorInputs[generatorInput].checked = true;// Generate on interval
                break;
            case 8:
                generatorInputs[generatorInput].value = 1000;// Generation interval
                break;
        }
    }

    UpdateGenerationInputsLogic(true);
    UpdateGenerationInputsDisplay();
    UpdateInnerRing();
    UpdateOuterRing();
}


// Smooth a SVG path with cubic bezier curves: https://francoisromain.medium.com/smooth-a-svg-path-with-cubic-bezier-curves-e37b49d46c74

// Properties of a line 
// I:  - pointA (array) [x,y]: coordinates
//     - pointB (array) [x,y]: coordinates
// O:  - (object) { length: l, angle: a }: properties of the line
function line(pointA, pointB) {
    const lengthX = pointB[0] - pointA[0]
    const lengthY = pointB[1] - pointA[1]
    return {
        length: Math.sqrt(Math.pow(lengthX, 2) + Math.pow(lengthY, 2)),
        angle: Math.atan2(lengthY, lengthX)
    }
}

// Position of a control point 
// I:  - current (array) [x, y]: current point coordinates
//     - previous (array) [x, y]: previous point coordinates
//     - next (array) [x, y]: next point coordinates
//     - reverse (boolean, optional): sets the direction
// O:  - (array) [x,y]: a tuple of coordinates
function controlPoint(current, previous, next, reverse) {
    // When 'current' is the first or last point of the array
    // 'previous' or 'next' don't exist.
    // Replace with 'current'
    const p = previous || current
    const n = next || current

    // Properties of the opposed-line
    const o = line(p, n)

    // If is end-control-point, add PI to the angle to go backward
    const angle = o.angle + (reverse ? Math.PI : 0)
    const length = o.length * smoothing.value

    // The control point position is relative to the current point
    const x = current[0] + Math.cos(angle) * length
    const y = current[1] + Math.sin(angle) * length
    return [x, y]
}

// Create the bezier curve command 
// I:  - point (array) [x,y]: current point coordinates
//     - i (integer): index of 'point' in the array 'a'
//     - a (array): complete array of points coordinates
// O:  - (string) 'C x2,y2 x1,y1 x,y': SVG cubic bezier C command
function bezierCommand(point, i, a) {
    /*/
    // start control point
    const cps = controlPoint(a[i - 1], a[i - 2], point)

    // end control point
    const cpe = controlPoint(point, a[i - 1], a[i + 1], true)
    return `C ${cps[0]},${cps[1]} ${cpe[0]},${cpe[1]} ${point[0]},${point[1]}`
    //*/

    const len = a.length

    const prev = a[(i - 1 + len) % len]
    const prevPrev = a[(i - 2 + len) % len]
    const next = a[(i + 1) % len]

    // start control point
    const cps = controlPoint(prev, prevPrev, point)

    // end control point
    const cpe = controlPoint(point, prev, next, true)

    return `C ${cps[0]},${cps[1]} ${cpe[0]},${cpe[1]} ${point[0]},${point[1]}`
}

// Render the svg <path> element 
// I:  - points (array): points coordinates
//     - command (function)
//       I:  - point (array) [x,y]: current point coordinates
//           - i (integer): index of 'point' in the array 'a'
//           - a (array): complete array of points coordinates
//       O:  - (string) a svg path command
// O:  - (string): a Svg <path> element
function svgPath(points, command) {
    const len = points.length

    let d = `M ${points[0][0]},${points[0][1]}`

    // draw curves to every point INCLUDING the first
    for (let i = 1; i <= len; i++) {
        const point = points[i % len]
        d += ` ${command(point, i % len, points)}`
    }

    return d;
}

function SmoothSVG(points) {
    path.setAttribute('d', svgPath(points, bezierCommand));
}
//*/