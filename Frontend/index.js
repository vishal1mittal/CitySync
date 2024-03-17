let mapCode = 1;
let accuracy = 60;
let precision = 40;

function updateMap(mapCode) {
    var map = document.getElementById('map');
    var mapPrev = document.getElementById('mapPrev');
    map.style.backgroundImage = "url('/road_" + mapCode + ".png')";
    mapPrev.style.backgroundImage = "url('/road_" + mapCode + ".png')";
    map.style.backgroundSize = "cover";
    mapPrev.style.backgroundSize = "cover";
    // remove all the divs
    while (map.firstChild) {
        map.removeChild(map.firstChild);
    }
    scanCanvas();
}

function scanCanvas() {
    const map = document.getElementById('map');
    // empty the map
    while (map.firstChild) {
        map.removeChild(map.firstChild);
    }
    const scale = map.offsetHeight / accuracy;
    var canvas = document.createElement('canvas');
    canvas.width = map.offsetWidth;
    canvas.height = map.offsetHeight;
    var ctx = canvas.getContext('2d');
    var backgroundImage = new Image();
    const pathArray = [];
    backgroundImage.onload = function() {
        ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);
        for (var y = 0; y < canvas.height; y += scale) {
            for (var x = 0; x < canvas.width; x += scale) {
                var colorCount = 0;
                for (var dy = 0; dy < scale; dy++) {
                    for (var dx = 0; dx < scale; dx++) {
                        var pixelData = ctx.getImageData(x + dx, y + dy, 1, 1).data;
                        var red = pixelData[0];
                        var green = pixelData[1];
                        var blue = pixelData[2];
                        // Check if the color matches #D9D9D9
                        if (red === 217 && green === 217 && blue === 217) {
                            colorCount++;
                        }
                    }
                }
                // Calculate the percentage of pixels with the desired color
                var percentage = (colorCount / (scale * scale)) * 100;
                if (percentage >= precision) {
                    const xe = x + scale;
                    const ye = y + scale;
                    pathArray.push({xs: x, ys: y, xe: xe, ye: ye, isRoad: false});
                } else {
                    const xe = x + scale;
                    const ye = y + scale;
                    pathArray.push({xs: x, ys: y, xe: xe, ye: ye, isRoad: true});
                }
            }
        }
        generateVehiclePath(pathArray, scale);
    };
    
    // console.log(pathArray);
    backgroundImage.src = getComputedStyle(map).backgroundImage.replace(/url\(['"]?(.*?)['"]?\)/i, "$1");

}

function generateVehiclePath(pathArray, scale) {
    const isRoad = [];
    for (let i = 0; i < pathArray.length; i++) {
        if (pathArray[i].isRoad) {
            isRoad.push(pathArray[i]);
        }
    }

    const notRoad = [];
    for(let i = 0; i < pathArray.length; i++) {
        if (!pathArray[i].isRoad) {
            notRoad.push(pathArray[i]);
        }
    }

    // create divs for the road
    const map = document.getElementById('map');
    for (let i = 0; i < isRoad.length; i++) {
        const roadDiv = document.createElement('div');
        roadDiv.style.position = 'absolute';
        // transform orgin to top left
        roadDiv.style.transformOrigin = 'top left';
        roadDiv.style.width = scale + 'px';
        roadDiv.style.height = scale + 'px';
        roadDiv.style.left = isRoad[i].xs + 'px';
        roadDiv.style.top = isRoad[i].ys + 'px';
        roadDiv.style.backgroundColor = '#00ff00';
        // border radius 100% to make it a circle
        roadDiv.style.borderRadius = '100%';
        map.appendChild(roadDiv);
    }

    // console.log(isRoad);

    // if (mapCode == 1) {
    //     const startPoints = [{xs: 150, xe: 200}]
    // }
    
}



$(document).ready(function () {
    updateMap(mapCode);
    $("#sliderVal").text("Accuracy: " + accuracy);
    $("#slider").on("input", function () {
        accuracy = $(this).val();
        $("#sliderVal").text("Accuracy: " + accuracy);
        scanCanvas();
    });
    $("#precisionVal").text("Precision: " + precision);
    $("#precision").on("input", function () {
        precision = $(this).val();
        $("#precisionVal").text("Precision: " + precision);
        scanCanvas();
    });
    // scanCanvas();
});