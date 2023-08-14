import { ClientOptions } from "../ClientOptions";
import { HuobiBase } from "./HuobiBase";
export declare class HuobiFuturesClient extends HuobiBase {
    constructor({ wssPath, watcherMs }?: ClientOptions);
}
