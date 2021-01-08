import { App, Plugin, PluginSettingTab, Setting, TAbstractFile, TFile } from 'obsidian';

interface IIrisSettings {
	header: string;
	location: string,
}

const DEFAULT_SETTINGS: IIrisSettings = {
	header: '### _tasks',
	location: "Daily Notes"
}

export default class MyPlugin extends Plugin {

	public settings: IIrisSettings;
	private _dailyNoteLocation: string;
	private _header: string;

	private async updateFile(file: TAbstractFile): Promise<void> {

		if (!file.path.includes(this._dailyNoteLocation)) return Promise.resolve();

		const filteredFilers: Array<TFile> = Array.from(this.app.vault.getFiles())
			.filter((entry) => entry.path.includes(this._dailyNoteLocation))
			.filter((entry) => entry.basename.localeCompare(file.name) != 0)
			.filter((entry) => (this.parseDate(entry.name) < this.parseDate(file.name)));


		const outcomes: Array<number> = filteredFilers
			.map((entry) => this.parseDate(file.name) - this.parseDate(entry.name));


		const preceeding: TFile = filteredFilers[outcomes.indexOf(Math.min(...outcomes))];

		if (!preceeding) return;

		const textPrevious: string = await this.app.vault.read(preceeding);
		let text: string = await this.app.vault.read(this.app.workspace.getActiveFile());
		text = text.replace(this._header, `${this._header}\n${this.findMatches(textPrevious)}`);

		await this.app.vault.modify(this.app.workspace.getActiveFile(), text);

	}

	private findMatches(text: string): string {
		const unfinishedTodosRegex: RegExp = /- \[ \].*/g;
		const listedText: Array<string> = Array.from(text.split("\n"));
		let taskLines: Array<string> = [];
		let hasSeenHeadder: boolean = false;

		for (let x of listedText) {
			if (x.includes("#")) {
				if (x.includes(this.settings.header)) {
					hasSeenHeadder = true;
					continue;
				} else if (!hasSeenHeadder) continue;
				break;
			}
			if (x.match(unfinishedTodosRegex)) taskLines.push(x);
		}
		return taskLines.join('\n')
	}

	private parseDate(name: string): number {
		return (new Date(name.replace(".md", ""))).getTime()
	}

	public async onload(): Promise<void> {
		this.addSettingTab(new IrisSettings(this.app, this));
		await this.loadSettings();
		this._header = this.settings.header;
		this._dailyNoteLocation = this.settings.location;
		this.app.workspace.on("layout-ready", () => {
			this.app.vault.on("create", async (file) => {
				await this.updateFile(file);
			})
		});
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
	private _notes: string;
	private _tasks: string;

	constructor(app: App, plugin: MyPlugin) {
		super(app, plugin);
		this.plugin = plugin;
		this._notes = "";
		this._tasks = "";
	}

	
	public display(): void {

		this.containerEl.empty();
		this.addSettingsHeadding();
		this.addHeaddingSettings();
		this.addDailyNoteDirectorySettings();
		
	}

	private addHeaddingSettings() : void {

		new Setting(this.containerEl)
			.setName('To Do Headding')
			.setDesc('Enter the tag above your to-do list. (IE: ### To Do).')
			.addText(text => text
				.setPlaceholder('### To Do')
				.setValue(this.plugin.settings.header ? this.plugin.settings.header : DEFAULT_SETTINGS.header)
				.onChange(async (value) => {
					this.plugin.settings.header = value;
					this._tasks = value;
					await this.plugin.saveSettings();
				}));
	}

	private addDailyNoteDirectorySettings(): void {
		new Setting(this.containerEl)
			.setName('Daily Note Directory')
			.setDesc('Enter the directory you keep your Daily Notes in.')
			.addText(text => text
				.setPlaceholder('Daily Notes')
				.setValue(this.plugin.settings.location ? this.plugin.settings.location : DEFAULT_SETTINGS.location)
				.onChange(async (value) => {
					this.plugin.settings.location = value;
					this._notes = value;
					await this.plugin.saveSettings();
				}));
	}

	private addSettingsHeadding(): void {
		this.containerEl.createEl('h2', { text: 'Settings for Iris' });
	}
}