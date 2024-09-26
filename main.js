const { Plugin, TFolder } = require('obsidian');
const { exec } = require('child_process');
const path = require('path');

// Full path to the Terraform binary
const fullTerraformPath = '/opt/homebrew/bin/terraform';

module.exports = class TerraformPlugin extends Plugin {
    onload() {
        // Register the event to modify the context menu for folders
        this.registerEvent(
            this.app.workspace.on('file-menu', (menu, file) => {
                // Check if the clicked item is a folder (TFolder)
                if (file instanceof TFolder) {
                    // Add "Run Terraform Apply" option
                    menu.addItem((item) => {
                        item.setTitle('Run Terraform Apply')
                            .setIcon('checkmark')
                            .onClick(() => {
                                const absoluteFolderPath = this.getAbsoluteFolderPath(file.path);
                                this.runInTerminal('apply', absoluteFolderPath);
                            });
                    });

                    // Add "Run Terraform Destroy" option
                    menu.addItem((item) => {
                        item.setTitle('Run Terraform Destroy')
                            .setIcon('trash')
                            .onClick(() => {
                                const absoluteFolderPath = this.getAbsoluteFolderPath(file.path);
                                this.runInTerminal('destroy', absoluteFolderPath);
                            });
                    });
                }
            })
        );
    }

    // Function to resolve the full absolute path of the folder
    getAbsoluteFolderPath(folderPath) {
        return path.resolve(this.app.vault.adapter.basePath, folderPath); // Combine the vault path and folder path
    }

    // Function to run the Terraform command in iTerm or default terminal on macOS
    runInTerminal(commandType, folderPath) {
        const command = `${fullTerraformPath} ${commandType}`; // Removed the -auto-approve flag

        // AppleScript to run in iTerm
        const script = `
            tell application "iTerm"
                create window with default profile
                tell current session of current window
                    write text "cd '${folderPath}' && ${command}"
                end tell
            end tell
        `;

        // Execute the AppleScript to run the command in iTerm
        exec(`osascript -e "${script.replace(/"/g, '\\"')}"`, (error, stdout, stderr) => {
            if (error) {
                console.error(`Error opening iTerm: ${stderr}`);
            } else {
                console.log(`iTerm opened and running Terraform: ${stdout}`);
            }
        });
    }

    onunload() {
        console.log('TerraformPlugin unloaded');
    }
};

