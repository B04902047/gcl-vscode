
import * as vscode from 'vscode';
import * as sysPath from 'path';
import { guabaoLabel } from "./utils"
import { FileState } from './data/FileState';
import renderError from './components/FileState/ErrorSection';
import renderProofObligation from './components/FileState/ProofObligation';
import renderWarning from './components/FileState/WarningSection';
import renderSpecification from './components/FileState/Specification';

export class Welcome {
	constructor() {}
}

export class PanelProvider {
	static panel: vscode.WebviewPanel;
	initiated(): boolean {
		return PanelProvider.panel !== undefined
	}
	createPanel(): void {
		PanelProvider.panel =
			vscode.window.createWebviewPanel(
				"gbCustom.guabao",
				guabaoLabel,
				{ preserveFocus: true, viewColumn: vscode.ViewColumn.Two },
				{ enableScripts: true }
			);
		
	}
	updateFileState(fileState: FileState): void {
		PanelProvider.panel.webview.html = renderFileState(fileState);
	}
	// Show either the welcome page or sections (likely from the LSP server).
	showWelcome(extPath: string): void {
		PanelProvider.panel.webview.html = renderWelcome(extPath);
	}
}


// The below renderXXXXX functions turn the parsed data structure into HTML.

function renderWelcome(extPath: string): string {
	const webview = PanelProvider.panel.webview;
	const stylePathOnDisk = vscode.Uri.file(sysPath.join(extPath, '/asset/bootstrap.min.css'));
	const styleUri = webview.asWebviewUri(stylePathOnDisk);
	
	return /* html */`
		<!DOCTYPE html>
		<html lang="en">
			<head>
				<title>${guabaoLabel}</title>
				<meta charset="UTF-8">
				<meta name="viewport" content="width=device-width, initial-scale=1.0">
				<link rel='stylesheet' type='text/css' href='${styleUri}'>
			</head>
			<body>
				<div class="container p-3">
					<h2 class="text-center">Guabao: Program and Prove with GCL.</h2>
				</div>
			</body>
		</html>
	`
}

export function renderFileState(fileState: FileState): string {
	return /* html */`
    	<!DOCTYPE html>
        <html lang="en">
            <head>
                <title>${guabaoLabel}</title>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
            </head>
            <body>
				${fileState.errors.map(renderError).join('')}
				${fileState.specs.map(renderSpecification).join('')}
				${fileState.pos.map(renderProofObligation).join('')}
				${fileState.warnings.map(renderWarning).join('')}
            </body>
        </html>
    `
}