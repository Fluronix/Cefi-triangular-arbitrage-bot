import { L2Point } from "./L2Point";
import { L3Point } from "./L3Point";
export declare class L3PointStore {
    points: Map<string, L3Point>;
    constructor();
    get(orderId: string): L3Point;
    set(point: L3Point): void;
    delete(orderId: string): void;
    has(orderId: string): boolean;
    clear(): void;
    snapshot(depth: number, dir: "asc" | "desc"): L2Point[];
}
