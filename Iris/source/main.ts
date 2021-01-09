import { App, Plugin, PluginSettingTab, Setting, TAbstractFile, Tasks, TFile } from 'obsidian';
import { NoteOperation } from './files/notes/operations/NoteOperation';
import { DailySequence } from './files/sequences/DailySequence';
import { IFetchableSequence } from './interfaces/IFetchableSequence';
import { INoteOperation } from './interfaces/INoteOperation'

interface IIrisSettings {
	header: string;
	location: string,
}

const DEFAULT_SETTINGS: IIrisSettings = {
	header: '### Tasks',
	location: "Daily Notes"
}

export default class MyPlugin extends Plugin {

	public settings: IIrisSettings;
	private _dailyNoteLocation: string;
	private _weeklyNoteLocation: string;
	private _coLocated: boolean;
	private _heading: string; // Clean this up

	public async onload(): Promise<void> {
		this.addSettingTab(new IrisSettings(this.app, this));
		this.registerFileListner();
		await this.loadSettings();
		this._coLocated = (this._dailyNoteLocation == this._weeklyNoteLocation);
	}

	private registerFileListner() {
		this.app.workspace.on("layout-ready", () => {
			this.app.vault.on("create", async (file: TAbstractFile) => {
				await this.fileHandler(file);
			});
		});
	}

	private async weeklyRunner(file: TAbstractFile): Promise<void> {
		let sequenceWeek: IFetchableSequence<TFile> = new DailySequence(this.app.vault, file);
		await sequenceWeek.Populate();
		let operationWeek: INoteOperation = new NoteOperation(
			sequenceWeek, 
			this.app.vault, 
			this.app.workspace, 
			this._heading);
		await operationWeek.Run();
	}

	private async dailyRunner(file: TAbstractFile): Promise<void> {
		let sequenceDaily: IFetchableSequence<TFile> = new DailySequence(this.app.vault, file);
		await sequenceDaily.Populate();
		let operationDaily: INoteOperation = new NoteOperation(
			sequenceDaily, 
			this.app.vault, 
			this.app.workspace, 
			this._heading);
		await operationDaily.Run();
	}

	private async fileHandler(file: TAbstractFile): Promise<void> {
		if (!this._coLocated) {
			switch (file.path) {
				case this._dailyNoteLocation:
					await this.dailyRunner(file);
					break;
				case this._weeklyNoteLocation:
					this.weeklyRunner(file);
					break;
				default: break;
			}
		} else {
			if (file.name.includes("-w") && (file.path.includes(this._weeklyNoteLocation))) {
				await this.weeklyRunner(file);
			} else if (file.path.includes(this._weeklyNoteLocation)) {
				await this.dailyRunner(file);
			}
		}
	}

	public async loadSettings(): Promise<void> {
		this.settings = Object.assign(DEFAULT_SETTINGS, await this.loadData());
	}

	public async saveSettings(): Promise<void> {
		await this.saveData(this.settings);
	}
}

class IrisSettings extends PluginSettingTab {
	public plugin: MyPlugin;

	constructor(app: App, plugin: MyPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	public display(): void {
	}
}
