const vscode = require('vscode');

function activate(context) {
    console.log('Local installer activated - ready to install malicious extension');
}

function deactivate() {}

module.exports = {
    activate,
    deactivate
};