import { IFetchableSequence } from "Iris/source/interfaces/IFetchableSequence";
import { TAbstractFile, TFile, Vault } from "obsidian";

export class WeeklySequence implements IFetchableSequence<TAbstractFile> {
    
    public Sequence: Array<TFile>;
    private _vault: Vault;
    private _weeklyNote: TAbstractFile;
    private _location: string;

    constructor(vault: Vault, weeklyNote: TAbstractFile, location: string) {
        this._vault = vault;
        this._weeklyNote = weeklyNote;
        this._location = location;
    }

    public Populate(): void {
        if (!(this.Sequence == undefined)) throw new Error("Sequence Already Populated");
        this.Sequence = Array.from(this._vault.getFiles())
            .filter((entry) => entry.path.includes(this._location))
            .filter((entry) => entry.name.includes("-w"))
            .filter((entry) =>  entry.name != this._weeklyNote.name);
    }

    public Min(): TFile {
        if (this.Sequence.length == 0) throw new Error("Sequence Not Populated");
        const outcomes: Array<number> = this.Sequence
            .map((entry) => 
                entry.name.split("-w").map( x => parseInt(x)).reduce((sum, value) => sum+value));
        return this.Sequence[outcomes.indexOf(Math.min(...outcomes))];
    }

    public Max(): TFile {
        if (this.Sequence.length == 0) throw new Error("Sequence Not Populated");
        const outcomes: Array<number> = this.Sequence
            .map((entry) => 
                entry.name.split("-w").map( x => parseInt(x)).reduce((sum, value) => sum+value))
            .filter((x) => 
                x < this._weeklyNote.name.split("-w").map( x => parseInt(x)).reduce((sum, value) => sum+value));
        return this.Sequence[outcomes.indexOf(Math.max(...outcomes))];
    }

    public Contains(file: TFile): boolean {
        if (this.Sequence.length == 0) throw new Error("Sequence Not Populated");
        return (this.Sequence.indexOf(file) != -1);
    }

}