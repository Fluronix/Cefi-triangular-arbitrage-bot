export declare type Fn = (...args: any[]) => void;
export declare type CancelableFn = {
    (...args: any[]): void;
    cancel: () => void;
};
