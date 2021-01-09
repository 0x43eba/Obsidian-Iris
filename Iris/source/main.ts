import { App, Plugin, PluginSettingTab, Setting, TAbstractFile, TFile } from 'obsidian';
import { DailySequence } from './files/sequences/DailySequence';
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

	public async onload(): Promise<void> {
		this.addSettingTab(new IrisSettings(this.app, this));
		this.registerFileListner();
		await this.loadSettings();
		this._coLocated = (this._dailyNoteLocation == this._weeklyNoteLocation);
	}

	private registerFileListner() {
		this.app.workspace.on("layout-ready", () => {
			this.app.vault.on("create", async (file: TAbstractFile) => {
			});
		});
	}

	private fileHandler(file: TAbstractFile) {
		if (!this._coLocated) {
			// Classical Case
			switch (file.path) {
				case this._dailyNoteLocation:
					console.log("Daily Note");
					break;
				case this._weeklyNoteLocation:
					console.log("Weekly Note");
					break;
				default: break;
			}
		} else {
			if (file.name.includes("-w")) {

			} else {
				
			}
		}


		// Pathological Case

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
