export interface IFetchableSequence<T> {
    
    Sequence: Array<T>;
    
    Populate(): void;
    Min(): T;
    Max(): T;
    Containes(t: T): boolean;
    
}