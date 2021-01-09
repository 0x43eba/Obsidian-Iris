import { IFetchableSequence } from "Iris/source/interfaces/IFetchableSequence";
import { INoteOperation } from "Iris/source/interfaces/INoteOperation";
import { TFile, Vault, Workspace } from "obsidian";
import { ToDoSequence } from "../../sequences/ToDoSequence";

export class NoteOperation implements INoteOperation {

    private _sequence: IFetchableSequence<TFile>;
    private _vault: Vault;
    private _workspace: Workspace;
    private _header: string;

    constructor(
        sequence: IFetchableSequence<TFile>, 
        vault: Vault, workspace: Workspace, 
        header: string) {
            this._sequence = sequence;
            this._header = header;
            this._vault = vault;
            this._workspace = workspace;
    }

    public async Run(): Promise<void> {
        this._sequence.Populate();
        let previous: string = await this._vault.read(this._sequence.Min());
        let todo: ToDoSequence = new ToDoSequence(previous, this._header);
        todo.Populate();
        let section: string = todo.ToString();
        let updatedText: string =  previous.replace(this._header, `${this._header}\n${section}`);
        await this._vault.modify(this._workspace.getActiveFile(), updatedText);
    }
    
}