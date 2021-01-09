import { IDescriptor } from "Iris/source/interfaces/IDescriptor";
import { IFetchableSequence } from "Iris/source/interfaces/ISequentialFiles";
import { TFile, Vault } from "obsidian";

export class DailySequence implements IFetchableSequence<TFile> {

    public Sequence: Array<TFile>;
    private _vault: Vault;
    private _dailyNote: IDescriptor<TFile>;

    constructor(vault: Vault, dailyNote: IDescriptor<TFile>) {
        this._vault = vault;
        this._dailyNote = dailyNote;
    }

    public Populate(): void {
        this.Sequence = Array.from(this._vault.getFiles())
            .filter((entry) => entry.path.includes(this._dailyNote.Location))
            .filter((entry) => entry.basename.localeCompare(this._dailyNote.Object.name) != 0)
            .filter((entry) => (this.parseDate(entry.name) < this.parseDate(this._dailyNote.Object.name)));
    }

    public Min(): TFile {
        if (!this.Sequence) throw new Error("Sequence Not Populated")
        const outcomes: Array<number> = this.Sequence
            .map((entry) => this.parseDate(this._dailyNote.Object.name) - this.parseDate(entry.name));
        return this.Sequence[outcomes.indexOf(Math.min(...outcomes))];

    }

    public Max(): TFile {
        if (!this.Sequence) throw new Error("Sequence Not Populated")
        const outcomes: Array<number> = this.Sequence
            .map((entry) => this.parseDate(this._dailyNote.Object.name) - this.parseDate(entry.name));
        return this.Sequence[outcomes.indexOf(Math.max(...outcomes))];
    }

    public Containes(file: TFile): boolean {
        if (!this.Sequence) throw new Error("Sequence Not Populated")
        return (this.Sequence.indexOf(file) != -1)
    }

    private parseDate(name: string): number {
		return (new Date(name.replace(".md", ""))).getTime()
	}
}