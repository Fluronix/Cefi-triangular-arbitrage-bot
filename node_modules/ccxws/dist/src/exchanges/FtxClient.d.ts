import { ClientOptions } from "../ClientOptions";
import { FtxBaseClient } from "./FtxBase";
export declare class FtxClient extends FtxBaseClient {
    constructor({ wssPath, watcherMs }?: ClientOptions);
}
