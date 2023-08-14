import { ClientOptions } from "../ClientOptions";
import { HuobiBase } from "./HuobiBase";
export declare class HuobiClient extends HuobiBase {
    constructor({ wssPath, watcherMs }?: ClientOptions);
}
