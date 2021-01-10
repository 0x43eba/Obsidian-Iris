import { App, Plugin, PluginSettingTab, Setting, TAbstractFile, Tasks, TFile } from 'obsidian';
import { NoteOperation } from './files/notes/operations/NoteOperation';
import { DailySequence } from './files/sequences/DailySequence';
import { WeeklySequence } from './files/sequences/WeeklySequence';
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

//#region private varables
	public settings: IIrisSettings;
	private _dailyNoteLocation: string;
	private _weeklyNoteLocation: string;
	private _coLocated: boolean;
	private _heading: string; // Clean this up
//#endregion

	public async onload(): Promise<void> {
		this.addSettingTab(new IrisSettings(this.app, this));
		await this.loadSettings();

		this._dailyNoteLocation = this.settings.location;
		this._weeklyNoteLocation = this.settings.location;
		this._heading = this.settings.header;
		this._coLocated = (this._dailyNoteLocation == this._weeklyNoteLocation);
		
		this.registerFileListner();
	}

	private registerFileListner() {
		this.app.workspace.on("layout-ready", () => {
			this.app.vault.on("create", async (file: TAbstractFile) => {
				await this.fileHandler(file);
			});
		});
	}

	private async weeklyRunner(file: TAbstractFile): Promise<void> {
		let sequenceWeek: IFetchableSequence<TFile> = new WeeklySequence(this.app.vault, file, this._weeklyNoteLocation);
		let operationWeek: INoteOperation = new NoteOperation(
			sequenceWeek, 
			this.app.vault, 
			this.app.workspace, 
			this._heading);
		await operationWeek.Run();
	}

	private async dailyRunner(file: TAbstractFile): Promise<void> {
		let sequenceDaily: IFetchableSequence<TFile> = new DailySequence(this.app.vault, file, this._dailyNoteLocation);
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
					console.log("Day");
					await this.dailyRunner(file);
					break;
				case this._weeklyNoteLocation:
					console.log("Week");
					await this.weeklyRunner(file);
					break;
				default: break;
			}
		} else {
			if (file.name.includes("-w") && (file.path.includes(this._weeklyNoteLocation))) {
				console.log("Week2");
				await this.weeklyRunner(file);
			} else if (file.path.includes(this._weeklyNoteLocation)) {
				console.log("Day2");
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
	plugin: MyPlugin;
	private notes: string;
	private tasks: string;

	constructor(app: App, plugin: MyPlugin) {
		super(app, plugin);
		this.plugin = plugin;
		this.notes = "";
		this.tasks = "";
	}

	public display(): void {
		let { containerEl } = this;

		containerEl.empty();

		containerEl.createEl('h2', { text: 'Settings for Iris' });

		new Setting(containerEl)
			.setName('To Do Headding')
			.setDesc('Enter the tag above your to-do list. (IE: ### To Do).')
			.addText(text => text
				.setPlaceholder('### To Do')
				.setValue(this.plugin.settings.header ? this.plugin.settings.header : DEFAULT_SETTINGS.header)
				.onChange(async (value) => {
					this.plugin.settings.header = value;
					this.tasks = value;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName('Daily Note Directory')
			.setDesc('Enter the directory you keep your Daily Notes in.')
			.addText(text => text
				.setPlaceholder('Daily Notes')
				.setValue(this.plugin.settings.location ? this.plugin.settings.location : DEFAULT_SETTINGS.location)
				.onChange(async (value) => {
					this.plugin.settings.location = value;
					this.notes = value;
					await this.plugin.saveSettings();
				}));

	}
}