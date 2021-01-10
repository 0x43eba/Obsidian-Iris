import { App, Plugin, PluginSettingTab, Setting, TAbstractFile, Tasks, TFile } from 'obsidian';
import { NoteOperation } from './files/notes/operations/NoteOperation';
import { DailySequence } from './files/sequences/DailySequence';
import { WeeklySequence } from './files/sequences/WeeklySequence';
import { IFetchableSequence } from './interfaces/IFetchableSequence';
import { INoteOperation } from './interfaces/INoteOperation'

interface IIrisSettings {
	headerDay: string;
	locationDay: string;
	headerWeek: string;
	locationWeek: string;
}

const DEFAULT_SETTINGS: IIrisSettings = {
	headerDay: "#### Tasks",
	locationDay: "Notes",
	headerWeek: "#### Tasks",
	locationWeek: "Notes",
}

export default class MyPlugin extends Plugin {

//#region private varables
	public settings: IIrisSettings;
	private _dailyNoteLocation: string;
	private _weeklyNoteLocation: string;
	private _coLocated: boolean;
	private _headingWeek: string;
	private _headingDay: string;

//#endregion

//#region File Orchestration
	private async weeklyRunner(file: TAbstractFile): Promise<void> {
		let sequenceWeek: IFetchableSequence<TFile> = new WeeklySequence(this.app.vault, file, this._weeklyNoteLocation);
		let operationWeek: INoteOperation = new NoteOperation(
			sequenceWeek, 
			this.app.vault, 
			this.app.workspace, 
			this._headingWeek,
			false);
		await operationWeek.Run();
	}

	private async dailyRunner(file: TAbstractFile): Promise<void> {
		let sequenceDaily: IFetchableSequence<TFile> = new DailySequence(this.app.vault, file, this._dailyNoteLocation);
		let operationDaily: INoteOperation = new NoteOperation(
			sequenceDaily, 
			this.app.vault, 
			this.app.workspace, 
			this._headingDay);
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
//#endregion

//#region Setup

	public async loadSettings(): Promise<void> {
		this.settings = Object.assign(DEFAULT_SETTINGS, await this.loadData());
	}

	public async saveSettings(): Promise<void> {
		await this.saveData(this.settings);
	}

	private registerFileListner() {
		this.app.workspace.on("layout-ready", () => {
			this.app.vault.on("create", async (file: TAbstractFile) => {
				await this.fileHandler(file);
			});
		});
	}
//#endregion

//#region Lifecycle
	public async onload(): Promise<void> {
		this.addSettingTab(new IrisSettings(this.app, this));
		await this.loadSettings();

		this._dailyNoteLocation = this.settings.locationWeek;
		this._weeklyNoteLocation = this.settings.locationWeek;
		this._headingDay = this.settings.headerDay;
		this._headingWeek = this.settings.headerWeek;
		this._coLocated = (this._dailyNoteLocation == this._weeklyNoteLocation);
		
		this.registerFileListner();
	}
//#endregion
}

class IrisSettings extends PluginSettingTab {

//#region Variables
	plugin: MyPlugin;
//#endregion


	constructor(app: App, plugin: MyPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

//#region Daily Setting Pannels

	private dailyNoteHeading(): void {
		new Setting(this.containerEl)
		.setName('To Do Headding')
		.setDesc('Enter the tag above your to-do list. (IE: ### To Do).')
		.addText(text => text
			.setPlaceholder('### To Do')
			.setValue(this.plugin.settings.headerDay ? this.plugin.settings.headerDay : DEFAULT_SETTINGS.headerDay)
			.onChange(async (value) => {
				this.plugin.settings.headerDay = value;
				await this.plugin.saveSettings();
			}));
	}

	private dailyNoteLocation(): void {
		new Setting(this.containerEl)
		.setName('Daily Note Directory')
		.setDesc('Enter the directory you keep your Daily Notes in.')
		.addText(text => text
			.setPlaceholder('Daily Notes')
			.setValue(this.plugin.settings.locationDay ? this.plugin.settings.locationDay : DEFAULT_SETTINGS.locationDay)
			.onChange(async (value) => {
				this.plugin.settings.locationDay = value;
				await this.plugin.saveSettings();
			}));
	}
//#endregion

//#region Weekly Settings Pannels
	private weeklyNoteHeading(): void {
		new Setting(this.containerEl)
		.setName('Weekly Note Heading')
		.setDesc('Enter the tag above your to-do list. (IE: ### To Do).')
		.addText(text => text
			.setPlaceholder('Daily Notes')
			.setValue(this.plugin.settings.headerWeek ? this.plugin.settings.headerWeek : DEFAULT_SETTINGS.headerWeek)
			.onChange(async (value) => {
				this.plugin.settings.headerWeek = value;
				await this.plugin.saveSettings();
			}));
	}

	private weeklyNoteLocation(): void {
		new Setting(this.containerEl)
		.setName('Weekly Note Directory')
		.setDesc('Enter the directory you keep your Weekly Notes in.')
		.addText(text => text
			.setPlaceholder('Daily Notes')
			.setValue(this.plugin.settings.locationWeek ? this.plugin.settings.locationWeek : DEFAULT_SETTINGS.locationWeek)
			.onChange(async (value) => {
				this.plugin.settings.locationWeek = value;
				await this.plugin.saveSettings();
			}));	
	}
//#endregion

//#region Lifecycle

	public display(): void {

		this.containerEl.empty();

		this.containerEl.createEl('h2', { text: 'Settings for Iris' });
		
		this.dailyNoteHeading();
		this.dailyNoteLocation();

		this.weeklyNoteHeading();
		this.weeklyNoteLocation();
	}

//#endregion
}