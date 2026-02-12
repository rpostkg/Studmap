import * as Comlink from "./comlink.mjs";
import AprilTagWasm from "./apriltag_wasm.js";

/**
 * Diagnostic Worker for AprilTag detection
 */
class Apriltag {
    constructor(onDetectorReadyCallback) {
        this.onDetectorReadyCallback = onDetectorReadyCallback;
        this._opt = {
            quad_decimate: 2.0,
            quad_sigma: 0.0,
            nthreads: 1,
            refine_edges: 1,
            max_detections: 0,
            return_pose: 1,
            return_solutions: 1
        }

        let _this = this;
        console.log("[Worker] Initializing WASM module...");

        AprilTagWasm().then(function (Module) {
            _this.onWasmInit(Module);
        }).catch(function (err) {
            console.error("[Worker] WASM failed to load:", err);
        });
    }

    onWasmInit(Module) {
        try {
            this._Module = Module;
            this._init = Module.cwrap('atagjs_init', 'number', []);
            this._set_detector_options = Module.cwrap('atagjs_set_detector_options', 'number', ['number', 'number', 'number', 'number', 'number', 'number', 'number']);
            this._set_img_buffer = Module.cwrap('atagjs_set_img_buffer', 'number', ['number', 'number', 'number']);
            this._detect = Module.cwrap('atagjs_detect', 'number', []);

            const res = this._init();
            console.log("[Worker] atagjs_init result:", res);

            this._set_detector_options(
                this._opt.quad_decimate,
                this._opt.quad_sigma,
                this._opt.nthreads,
                this._opt.refine_edges,
                this._opt.max_detections,
                this._opt.return_pose,
                this._opt.return_solutions);

            console.log("[Worker] Detector ready.");
            this.onDetectorReadyCallback();
        } catch (err) {
            console.error("[Worker] onWasmInit error:", err);
        }
    }

    detect(grayscaleImg, imgWidth, imgHeight) {
        try {
            if (!this._detect) return [];

            // Diagnostic: Check input data
            if (!(grayscaleImg instanceof Uint8Array)) {
                console.error("[Worker] Input is not Uint8Array!", typeof grayscaleImg);
                // Convert if proxy or other object
                grayscaleImg = new Uint8Array(grayscaleImg);
            }

            if (Math.random() < 0.01) {
                console.log("[Worker] Frame diag - Size:", imgWidth, "x", imgHeight, "Buffer:", grayscaleImg.length);
                console.log("[Worker] Pixel samples:", grayscaleImg.slice(0, 10));
            }

            let imgBuffer = this._set_img_buffer(imgWidth, imgHeight, imgWidth);
            this._Module.HEAPU8.set(grayscaleImg, imgBuffer);

            let strJsonPtr = this._detect();
            if (!strJsonPtr) return [];

            let strJsonLen = this._Module.getValue(strJsonPtr, "i32");
            if (strJsonLen == 0) return [];

            let strJsonStrPtr = this._Module.getValue(strJsonPtr + 4, "i32");
            const strJsonView = new Uint8Array(this._Module.HEAPU8.buffer, strJsonStrPtr, strJsonLen);

            let detectionsJson = '';
            for (let i = 0; i < strJsonLen; i++) {
                detectionsJson += String.fromCharCode(strJsonView[i]);
            }

            if (detectionsJson !== "[]" && Math.random() < 0.1) {
                console.log("[Worker] Detected JSON:", detectionsJson);
            }

            return JSON.parse(detectionsJson);
        } catch (err) {
            console.error("[Worker] Detect error:", err);
            return [];
        }
    }
}

Comlink.expose(Apriltag);
