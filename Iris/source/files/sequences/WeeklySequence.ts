import { IFetchableSequence } from "Iris/source/interfaces/ISequentialFiles";
import { TFile } from "obsidian";

export class WeeklySequence implements IFetchableSequence<TFile> {
    
    Sequence: Array<TFile>;

    constructor() {
        
    }

    Populate(): void {
        throw new Error("Method not implemented.");
    }
    Min(): TFile {
        throw new Error("Method not implemented.");
    }
    Max(): TFile {
        throw new Error("Method not implemented.");
    }
    Containes(t: TFile): boolean {
        throw new Error("Method not implemented.");
    }

}