import { IFetchableSequence } from "Iris/source/interfaces/IFetchableSequence";
import { INoteOperation } from "Iris/source/interfaces/INoteOperation";
import { TFile, Vault, Workspace } from "obsidian";
import { ToDoSequence } from "../../sequences/ToDoSequence";

export class NoteOperation implements INoteOperation {

    private _sequence: IFetchableSequence<TFile>;
    private _vault: Vault;
    private _workspace: Workspace;
    private _header: string;
    private _min: boolean;

    constructor(
        sequence: IFetchableSequence<TFile>, 
        vault: Vault, workspace: Workspace, 
        header: string, min: boolean = true) {
            this._sequence = sequence;
            this._header = header;
            this._vault = vault;
            this._workspace = workspace;
            this._min = min;
    }

    public async Run(): Promise<void> {
        await this._sequence.Populate();
        let previous: string = await this._vault.read(this._min ? this._sequence.Min() : this._sequence.Max());
        let todo: ToDoSequence = new ToDoSequence(previous, this._header);
        await todo.Populate();
        let section: string = todo.ToString();
        let file: TFile = this._workspace.getActiveFile();
        let fileText: string = await this._vault.read(file);
        let updatedText: string =  fileText.replace(this._header, `${this._header}\n${section}`);
        console.log(previous);
        console.log(updatedText);
        await this._vault.modify(file, updatedText);
    }
    
}