const width = 320;
const height = 240;

let uploadedImage = null;
let isSelectingColor = false;

const downloadButton = $('#download-button')
const colorBox = $('#color-box');

const redSlider = $('#red-slider');
const greenSlider = $('#green-slider');
const blueSlider = $('#blue-slider');
const brightnessSlider = $('#brightness-slider');
const toleranceSlider = $('#tolerance-slider')

const leftPanel = document.querySelector('#left');
const rightPanel = document.querySelector('#right');

const presetSelect = $('#preset-select');

let sc_r = 0, sc_g = 0, sc_b = 0;


function setup() {
    pixelDensity();

    createCanvas(0, 0).parent('canvas-container');

    const htmlDropzone = select('#dropzone');
    const htmlCanvas = select('#canvas-container');

    htmlDropzone.dragOver(function() {
        htmlDropzone.addClass('dragover');
    })

    htmlDropzone.dragLeave(function() {
        htmlDropzone.removeClass('dragover');
    })

    htmlDropzone.drop(function(file) {
        uploadedImage = loadImage(file.data);
        resizeCanvas(width, height);

        rightPanel.style.display = "flex";
        gsap.to('#left, #right', {
            duration: 2,
            width: "50vw"
        })

        

        htmlDropzone.removeClass('dragover');
    })
}

function draw() {
    background(100, 0);
    //console.log(mouseInCanvas());
    if (uploadedImage === null) return;

    let canvasRatio = width/height;

    let imageWidth = uploadedImage.width;
    let imageHeight = uploadedImage.height;
    let imageRatio = imageWidth/imageHeight;

    let x = 0, y = 0, h, w;

    if (imageRatio > canvasRatio) {
        w = width;
        h = w/imageRatio;
        y = (height - h)/2;
    } else {
        h = height;
        w = imageRatio * h;
        x = (width - w)/2;
    }

    image(uploadedImage, x, y, w, h);

    // Filters

    loadPixels();

    if (isSelectingColor && mouseInCanvas()) {
        x = Math.round(mouseX);
        y = Math.round(mouseY);
        let index = (y*width + x)*4;
        sc_r = pixels[index];
        sc_g = pixels[index+1];
        sc_b = pixels[index+2];
        colorBox.css('background-color', `rgb(${sc_r}, ${sc_g}, ${sc_b})`);
    }

    if(presetSelect.val() === 'grayscale') grayscale(pixels);
    else if (presetSelect.val() === 'bnw') bnw(pixels);
    else if (presetSelect.val() === 'sc') singleColor(pixels)
    else defaultFilter(pixels);

    updatePixels();
} 

downloadButton.click(function() {
    let pixelBackup = []

    uploadedImage.loadPixels();

    for (let i = 0; i < uploadedImage.pixels.length; i++) { 
        pixelBackup.push(uploadedImage.pixels[i]);
    }

    if(presetSelect.val() === 'grayscale') grayscale(uploadedImage.pixels);
    else if (presetSelect.val() === 'bnw') bnw(uploadedImage.pixels);
    else if (presetSelect.val() === 'sc') singleColor(uploadedImage.pixels)
    else defaultFilter(uploadedImage.pixels);

    uploadedImage.updatePixels();
    save(uploadedImage, 'edit.png')

    uploadedImage.loadPixels();

    for (let i = 0; i < uploadedImage.pixels.length; i++) { 
        uploadedImage.pixels[i] = pixelBackup[i];
    }
    uploadedImage.updatePixels();
});

colorBox.click(function() {
    isSelectingColor = true;
});

function mouseInCanvas() {
    return (mouseX >= 0 && mouseX <= width && mouseY >= 0 && mouseY <= height);
}

function mouseClicked() {
    if (mouseInCanvas()) isSelectingColor = false;
}

// FILTERS //

function singleColor(pixels) {
    for (let pixel = 0; pixel < pixels.length/4; pixel++) {
        let i = pixel*4;

        let tolerance = Number(toleranceSlider.val());
        let diff = Math.abs(pixels[i] - sc_r) + Math.abs(pixels[i+1] - sc_g) + Math.abs(pixels[i+2] - sc_b);

        if (diff < tolerance) continue;

        let average = (pixels[i] + pixels[i+1] + pixels[i+2])/3;
        pixels[i] = average;
        pixels[i+1] = average;
        pixels[i+2] = average;

    }
}

function grayscale(pixels) {
    for (let pixel = 0; pixel < pixels.length/4; pixel++) {
        let i = pixel*4;
        let average = (pixels[i] + pixels[i+1] + pixels[i+2])/3;
        pixels[i] = average;
        pixels[i+1] = average;
        pixels[i+2] = average;

    }
}

function bnw(pixels) {
    for (let pixel = 0; pixel < pixels.length/4; pixel++) {
        let i = pixel*4;
        let average = (pixels[i] + pixels[i+1] + pixels[i+2])/3;
        let color = 0;

        if (average > 127) color = 255;

        pixels[i] = color;

        pixels[i+1] = color;

        pixels[i+2] = color;
    }
}

function defaultFilter(pixels) {
    let r = Number(redSlider.val());
    let g = Number(greenSlider.val());
    let b = Number(blueSlider.val());
    let brightness = Number(brightnessSlider.val());

    for (let pixel = 0; pixel < pixels.length/4; pixel++) {
        let i = pixel*4;
        pixels[i] = pixels[i] + r + brightness;
        pixels[i+1] = pixels[i+1] + g + brightness;
        pixels[i+2] = pixels[i+2] + b + brightness;

    }
}