// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as path from 'path';
import { PanelProvider } from './gbEditor';
import { start, stop, sendRequest } from "./connection";
import { getSpecs } from './spec'
import { getSections } from './section'

let response: unknown;

let editor: vscode.TextEditor | undefined;

export async function activate(context: vscode.ExtensionContext) {
	console.log('GuaBao VLang Mode is now active!');
	const panelProvider = new PanelProvider();

	vscode.languages.registerInlayHintsProvider(
		{ scheme: 'file', language: 'guabao' },
		{
			provideInlayHints(document, range, token): vscode.InlayHint[] {
				if (editor === vscode.window.activeTextEditor) {
					const specs = getSpecs(response);
					let inlayHints = specs.flatMap(s => [new vscode.InlayHint(s.range.start, s.pre), new vscode.InlayHint(s.range.end, s.post)])
					return inlayHints;
				} else {
					return [];
				}
			}
		}
	)

	const startDisposable = vscode.commands.registerCommand('guabaovlang.start', () => {
		editor = vscode.window.activeTextEditor;
		if(vscode.window.tabGroups.all.flatMap(group => group.tabs).filter(tab => tab.label === "GB Webview").length === 0) {
			panelProvider.createPanel();
			panelProvider.format(vscode.window.activeTextEditor?.document.getText() || "", context.extensionPath);
		}
	});
	context.subscriptions.push(startDisposable);

	const reloadDisposable = vscode.commands.registerCommand('guabaovlang.reload', async () => {
		editor = vscode.window.activeTextEditor;
		const path = vscode.window.activeTextEditor?.document.uri.fsPath;
		response = await sendRequest("guabao", [path, { "tag": "ReqReload" }]);
		const parsedResponse = getSections(response);
		if(panelProvider.initiated()) {
			panelProvider.format(parsedResponse, context.extensionPath);
		} else {
			vscode.window.showInformationMessage("Please run 'Guabao start' first!");
		}
	});
	context.subscriptions.push(reloadDisposable);

	const inspectDisposable = vscode.commands.registerCommand('guabaovlang.inspect', async () => {

		const editor = vscode.window.activeTextEditor
		const path = editor?.document.uri.fsPath;
		const selection = editor?.selection;
		const startLine = (selection?.start.line ?? 0) + 1;
		const startChar = (selection?.start.character ?? 0) + 1;
		const startOff = editor?.document.offsetAt(selection?.start || new vscode.Position(0, 0));
		const endLine = (selection?.end.line ?? 0) + 1;
		const endChar = (selection?.end.character ?? 0) + 1;
		const endOff = editor?.document.offsetAt(selection?.end || new vscode.Position(0, 0));

		await sendRequest("guabao", [
			path, { "tag": "ReqInspect",
				"contents": [
					[path, startLine, startChar, startOff],
					[path, endLine, endChar, endOff]
				]
			}
		]);
		
	});
	context.subscriptions.push(inspectDisposable);

	const refineDisposable = vscode.commands.registerCommand('guabaovlang.refine', async () => {

		const editor = vscode.window.activeTextEditor
		const path = editor?.document.uri.fsPath;
		const selection = editor?.selection;
		const startLine = (selection?.start.line ?? 0) + 1;
		const startChar = (selection?.start.character ?? 0) + 1;
		const startOff = editor?.document.offsetAt(selection?.start || new vscode.Position(0, 0));
		const endLine = (selection?.end.line ?? 0) + 1;
		const endChar = (selection?.end.character ?? 0) + 1;
		const endOff = editor?.document.offsetAt(selection?.end || new vscode.Position(0, 0));

		const response = await sendRequest("guabao", [
			path, { "tag": "ReqRefine2",
				"contents": [
					[
						[path, startLine, startChar, startOff],
						[path, endLine, endChar, endOff],
					],
					"GARBAGE"
				]
			}
		]);

		const parsedResponse = getSections(response);
		if(panelProvider.initiated()) {
			panelProvider.format(parsedResponse, context.extensionPath);
		} else {
			vscode.window.showInformationMessage("Please run 'Guabao start' first!");
		}
		
	});
	context.subscriptions.push(refineDisposable);

	const helloWorldDisposable = vscode.commands.registerCommand('guabaovlang.helloworld', async () => {

		const editor = vscode.window.activeTextEditor
		const path = editor?.document.uri.fsPath;
		const selection = editor?.selection;
		const startLine = (selection?.start.line ?? 0) + 1;
		const startChar = (selection?.start.character ?? 0) + 1;
		const startOff = editor?.document.offsetAt(selection?.start || new vscode.Position(0, 0));
		const endLine = (selection?.end.line ?? 0) + 1;
		const endChar = (selection?.end.character ?? 0) + 1;
		const endOff = editor?.document.offsetAt(selection?.end || new vscode.Position(0, 0));

		await sendRequest("guabao", [
			path, { "tag": "ReqHelloWorld",
				"contents": [
					[path, startLine, startChar, startOff],
					[path, endLine, endChar, endOff]
				]
			}
		]);

	});
	context.subscriptions.push(helloWorldDisposable);

	// TODO Create a SERVER MODULE path and pass to connection.start() as arg
	let server_module = context.asAbsolutePath("");
	start(server_module);
}

export function deactivate() {
	console.log('Deactivating GuaBao VLang Mode');
	// TODO Send termination signal to backend LSP server
	// "Connection.stop()"

	/* [OLD] Connection.stop()
	 * return Client__LSP$LanguageServerMule.destroy()
	 */
	stop()
	console.log('Bye!');
}

