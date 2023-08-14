/// <reference types="node" />
import { IncomingMessage } from "http";
/**
 * Maks an HTTPS GET request to the specified URI and returns the parsed JSON
 * body data.
 */
export declare function get<T>(uri: string): Promise<T>;
/**
 * Make an HTTPS GET request to the specified URI and returns the parsed JSON
 * body data as well as the full response.
 */
export declare function getResponse<T>(uri: string): Promise<{
    data: T;
    response: IncomingMessage;
}>;
export declare function post<T>(uri: string, postData?: string): Promise<T>;
