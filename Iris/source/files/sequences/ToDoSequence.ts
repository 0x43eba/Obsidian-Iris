import { IFetchableSequence } from "Iris/source/interfaces/ISequentialFiles";
import { Vault } from "obsidian";

export class ToDoSequence implements IFetchableSequence<string> {

    public Sequence: Array<string>;
    private _vault: Vault;
    private _dailyNote: string;

    constructor(vault: Vault, dailyNote: string) {
        this._vault = vault;
        this._dailyNote = dailyNote;
    }
    Populate(): void {
        if (this.Sequence) throw new Error("Sequence Already Populated");
        throw new Error("Method not implemented.");
    }
    Min(): string {
        if (!this.Sequence) throw new Error("Sequence Not Populated");
        throw new Error("Method not implemented.");
    }
    Max(): string {
        if (!this.Sequence) throw new Error("Sequence Not Populated");
        throw new Error("Method not implemented.");
    }
    Contains(t: string): boolean {
        if (!this.Sequence) throw new Error("Sequence Not Populated");
        throw new Error("Method not implemented.");
    }
}