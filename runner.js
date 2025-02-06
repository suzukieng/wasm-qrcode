import {PopupScanner, StrichSDK} from "https://cdn.jsdelivr.net/npm/@pixelverse/strichjs-sdk@latest";

// prepare the canvas for output
const WIDTH = 256;
const HEIGHT = 256;
const CHANNELS = 4; // RGBA
const canvas = document.getElementById('playground');
canvas.width = WIDTH;
canvas.height = HEIGHT;

let nextTask = undefined;

// WASM memory is sized in pages, 64 KB (2 ** 16 bytes) each
const memory = new WebAssembly.Memory({
    initial: (WIDTH * HEIGHT * CHANNELS) / (2 ** 16)
});

// run the WASM function and render its output the canvas
function doWASM(wasmInstance) {
    wasmInstance.exports.go(WIDTH, HEIGHT);
    const pixelArray = new Uint8ClampedArray(
        memory.buffer, 0, WIDTH * HEIGHT * CHANNELS);
    const imageData = new ImageData(pixelArray, WIDTH, HEIGHT);
    const ctx = canvas.getContext('2d');
    ctx.putImageData(imageData, 0, 0);

    // schedule next pass
    nextTask = requestAnimationFrame(() => doWASM(wasmInstance));
}

// stop any running render task
function stopRunningTask() {
    if (nextTask !== undefined) {
        cancelAnimationFrame(nextTask);
        nextTask = undefined;
    }
}

// load from QR Code, using STRICH SDK (but any QR reader that can handle binary data will do)
const scanButton = document.getElementById('scan_qr');
scanButton.onclick = async () => {
    await StrichSDK.initialize('<license key required>');
    const qrCodes = await PopupScanner.scan({ symbologies: ['qr'] });
    if (qrCodes) {
        stopRunningTask();

        // load WASM module and instance from scanned QR Code
        const module = new WebAssembly.Module(qrCodes[0].rawData);
        const instance = new WebAssembly.Instance(module, {
            env: {
                memory: memory
            }
        });

        // start executing it in a loop
        requestAnimationFrame(() => doWASM(instance));
    }
}

// clear playground to black
const ctx = canvas.getContext('2d');
ctx.fillStyle = 'black';
ctx.fillRect(0, 0, canvas.width, canvas.height);
