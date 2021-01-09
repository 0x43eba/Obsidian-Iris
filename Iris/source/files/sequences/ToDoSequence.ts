import { IFetchableSequence } from "Iris/source/interfaces/IFetchableSequence";

export class ToDoSequence implements IFetchableSequence<string> {

    public Sequence: Array<string>;
    private _dailyNote: string;
    private _header: string;

    constructor(dailyNote: string, header: string) {
        this._header = header;
        this._dailyNote = dailyNote;
        this.Sequence = new Array<string>();
    }
    
    public Populate(): void {
        if (this.Sequence) throw new Error("Sequence Already Populated");

		const unfinishedTodosRegex: RegExp = /- \[ \].*/g;
		const listedText: Array<string> = Array.from(this._dailyNote.split("\n"));
		let hasSeenHeadder: boolean = false;

		for (let x of listedText) {
			if (x.includes("#")) {
				if (x.includes(this._header)) {
					hasSeenHeadder = true;
					continue;
				} else if (!hasSeenHeadder) continue;
				break;
			}
			if (x.match(unfinishedTodosRegex)) this.Sequence.push(x);
        }
        
        throw new Error("Method not implemented.");
    }

    public Min(): string {
        if (!this.Sequence) throw new Error("Sequence Not Populated");
        throw new Error("Method not implemented.");
    }

    public Max(): string {
        if (!this.Sequence) throw new Error("Sequence Not Populated");
        throw new Error("Method not implemented.");
    }

    public Contains(task: string): boolean {
        if (!this.Sequence) throw new Error("Sequence Not Populated");
        return this.Sequence.contains(task);
    }

    public ToString(): string {
        return this.Sequence.join("\n");
    }
}