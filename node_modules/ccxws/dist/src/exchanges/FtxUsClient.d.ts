import { ClientOptions } from "../ClientOptions";
import { FtxBaseClient } from "./FtxBase";
export declare class FtxUsClient extends FtxBaseClient {
    constructor({ wssPath, watcherMs }?: ClientOptions);
}
