import { IFetchableSequence } from "Iris/source/interfaces/IFetchableSequence";
import { TFile, Vault } from "obsidian";

export class DailySequence implements IFetchableSequence<TFile> {

    public Sequence: Array<TFile>;
    private _vault: Vault;
    private _dailyNote: TFile;

    constructor(vault: Vault, dailyNote: TFile) {
        this._vault = vault;
        this._dailyNote = dailyNote;
    }

    public Populate(): void {
        if (this.Sequence) throw new Error("Sequence Already Populated");
        this.Sequence = Array.from(this._vault.getFiles())
            .filter((entry) => entry.path.includes(this._dailyNote.path))
            .filter((entry) => entry.name != this._dailyNote.name)
            .filter((entry) => (this.parseDate(entry.name) < this.parseDate(this._dailyNote.name)));
    }

    public Min(): TFile {
        if (!this.Sequence) throw new Error("Sequence Not Populated");
        const outcomes: Array<number> = this.Sequence
            .map((entry) => this.parseDate(this._dailyNote.name) - this.parseDate(entry.name));
        return this.Sequence[outcomes.indexOf(Math.min(...outcomes))];
    }

    public Max(): TFile {
        if (!this.Sequence) throw new Error("Sequence Not Populated");
        const outcomes: Array<number> = this.Sequence
            .map((entry) => this.parseDate(this._dailyNote.name) - this.parseDate(entry.name));
        return this.Sequence[outcomes.indexOf(Math.max(...outcomes))];
    }

    public Contains(file: TFile): boolean {
        if (!this.Sequence) throw new Error("Sequence Not Populated");
        return (this.Sequence.indexOf(file) != -1);
    }

    private parseDate(name: string): number {
		return (new Date(name.replace(".md", ""))).getTime();
	}
}