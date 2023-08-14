import { ClientOptions } from "../ClientOptions";
import { HuobiBase } from "./HuobiBase";
export declare class HuobiSwapsClient extends HuobiBase {
    constructor({ wssPath, watcherMs }?: ClientOptions);
}
