import { IFetchableSequence } from "Iris/source/interfaces/ISequentialFiles";
import { TFile, Vault } from "obsidian";

export class WeeklySequence implements IFetchableSequence<TFile> {
    
    public Sequence: Array<TFile>;
    private _vault: Vault;
    private _weeklyNote: TFile;

    constructor(vault: Vault, weeklyNote: TFile) {
        this._vault = vault;
        this._weeklyNote = weeklyNote;
    }

    public Populate(): void {
        if (this.Sequence) throw new Error("Sequence Already Populated");
        this.Sequence = Array.from(this._vault.getFiles())
            .filter((entry) => entry.path.includes(this._weeklyNote.path))
            .filter((entry) => entry.name != this._weeklyNote.name)
            .filter((entry) => entry.name.includes("-w"));
    }

    public Min(): TFile {
        if (!this.Sequence) throw new Error("Sequence Not Populated");
        const outcomes: Array<number> = this.Sequence
            .map((entry) => 
                entry.name.split("-w").map( x => parseInt(x)).reduce((sum, value) => sum+value));
        return this.Sequence[outcomes.indexOf(Math.min(...outcomes))];
    }

    public Max(): TFile {
        if (!this.Sequence) throw new Error("Sequence Not Populated");
        const outcomes: Array<number> = this.Sequence
            .map((entry) => 
                entry.name.split("-w").map( x => parseInt(x)).reduce((sum, value) => sum+value))
            .filter((x) => 
                x < this._weeklyNote.name.split("-w").map( x => parseInt(x)).reduce((sum, value) => sum+value));
        return this.Sequence[outcomes.indexOf(Math.max(...outcomes))];
    }

    public Contains(file: TFile): boolean {
        if (!this.Sequence) throw new Error("Sequence Not Populated");
        return (this.Sequence.indexOf(file) != -1)
    }

}