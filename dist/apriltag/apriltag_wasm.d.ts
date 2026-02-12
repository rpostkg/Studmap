// TypeScript bindings for emscripten-generated code.  Automatically generated at compile time.
declare namespace RuntimeExports {
    /**
     * @param {string=} returnType
     * @param {Array=} argTypes
     * @param {Object=} opts
     */
    function cwrap(ident: any, returnType?: string | undefined, argTypes?: any[] | undefined, opts?: any | undefined): any;
    /**
     * @param {number} ptr
     * @param {string} type
     */
    function getValue(ptr: number, type?: string): any;
    /**
     * @param {number} ptr
     * @param {number} value
     * @param {string} type
     */
    function setValue(ptr: number, value: number, type?: string): void;
    let HEAPU8: any;
}
interface WasmModule {
  _free(_0: number): void;
  _atagjs_init(): number;
  _atagjs_destroy(): number;
  _atagjs_set_family(_0: number): number;
  _atagjs_set_detector_options(_0: number, _1: number, _2: number, _3: number, _4: number, _5: number, _6: number): number;
  _atagjs_set_pose_info(_0: number, _1: number, _2: number, _3: number): number;
  _atagjs_set_img_buffer(_0: number, _1: number, _2: number): number;
  _atagjs_set_tag_size(_0: number, _1: number): number;
  _atagjs_detect(): number;
}

export type MainModule = WasmModule & typeof RuntimeExports;
export default function MainModuleFactory (options?: unknown): Promise<MainModule>;
