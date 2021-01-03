import { App, Modal, Plugin, PluginSettingTab, Setting, TAbstractFile, TFile } from 'obsidian';

interface IIrisSettings {
	header: string;
	location: string,
}

const DEFAULT_SETTINGS: IIrisSettings = {
	header: '### Tasks',
	location: "Daily Notes"
}

export default class MyPlugin extends Plugin {
	settings: IIrisSettings;

	private _files: Array<TFile>;
	private _dailyNoteLocation: string;

	async onload() {
		console.log('IRIS!');
		this.addSettingTab(new IrisSettings(this.app, this));
		await this.loadSettings();
		this._dailyNoteLocation = this.settings.location;
		this.app.workspace.on("layout-ready", () => {
			this._files = Array.from(this.app.vault
				.getFiles()
				.filter((entry) => entry.path.includes(this._dailyNoteLocation)));
			console.log(this._files);
			this.app.vault.on("create", async (file) => {
				const heading = this.settings.header;
				if (file.path.includes(this._dailyNoteLocation)) {
					const thisFileDate = this.parseDate(file.name);
					let outcome = this._files
						.map((existingFile) => thisFileDate - this.parseDate(existingFile.name))
					const min = outcome.reduce((min, val) => (min > val) ? min : val);
					const preceeding = this._files[outcome.indexOf(min)];
					const textPrevious = await this.app.vault.read(preceeding);
					let text = await this.app.vault.read(this.app.workspace.getActiveFile());
					const unfinishedTodosRegex = /- \[ \].*/g
					const unfinishedTodos = Array.from(textPrevious.matchAll(unfinishedTodosRegex)).map((entry) => entry[0]);
					console.log(`${heading}${unfinishedTodos.join('\n')}\n`);
					text = text.replace(heading, `${heading}\n${unfinishedTodos.join('\n')}`);
					console.log(text);
					await this.app.vault.modify(this.app.workspace.getActiveFile(), text);
				}
			})
		});
	}

	parseDate(name: string) {
		return (new Date(name.replace(".md", ""))).getTime()
	}

	async loadSettings() {
		this.settings = Object.assign(DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
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

	display(): void {
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
