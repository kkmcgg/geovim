import { view, markers } from './map.js';
import { SetMarker } from './actions.js';
import { PanLeft, PanDown, PanUp, PanRight, ZoomIn, ZoomOut, GoHome, GoWorld, SetMapView, JumpToMarker } from './motions.js';
import * as CommandHandlers from './cmds.js';
import { ui as uiConfig } from './config.js';

// --- DOM Elements ---
export const mapElement = document.getElementById('map');
export const modeIndicatorElement = document.getElementById('modeIndicator');
export const commandBufferDisplayElement = document.getElementById('commandBufferDisplay');
export const messageAreaElement = document.getElementById('messageArea');
export const helpPanelElement = document.getElementById('helpPanel');
export const helpContentElement = document.getElementById('helpContent');
export const closeHelpButton = document.getElementById('closeHelpButton');

// --- UI Update Functions ---
export function updateModeIndicator(currentMode, keyBuffer, commandLineInput) {
    const mode = currentMode ? currentMode.toUpperCase() : 'NORMAL';
    modeIndicatorElement.textContent = `-- ${mode} --`;
    if (currentMode === 'COMMAND_LINE') {
        commandBufferDisplayElement.textContent = `:${commandLineInput}`;
    } else {
        commandBufferDisplayElement.textContent = keyBuffer;
    }
}

export function showMessage(text, duration = uiConfig.defaultMessageDuration, isError = false) {
    messageAreaElement.textContent = text;

    if (duration > 0) {
        setTimeout(() => {
            if (messageAreaElement.textContent === text) {
                messageAreaElement.textContent = '';
                updateMapCoordinates();
            }
        }, duration);
    }
}

export function clearMessage() {
    messageAreaElement.textContent = '';
    updateMapCoordinates();
}

export function updateMapCoordinates() {
    if (!view) return;

    if (messageAreaElement.textContent === '' || messageAreaElement.textContent.startsWith('Lat:')) {
        const center = ol.proj.toLonLat(view.getCenter());
        const zoom = view.getZoom();
        const coordText = `Lat: ${center[1].toFixed(4)}, Lon: ${center[0].toFixed(4)}, Zoom: ${zoom.toFixed(1)}`;
        if (messageAreaElement.textContent !== coordText) {
            messageAreaElement.textContent = coordText;
        }
    }
}

export function populateHelpPanel(commands) {
    let html = '';
    for (const mode in commands) {
        if (mode === 'COMMAND_LINE') continue;
        html += `<h3 class="text-lg font-semibold text-blue-300 mt-3 mb-1">${mode} Mode</h3>`;
        html += '<ul class="list-disc list-inside ml-4 space-y-1">';
        for (const keyCombo in commands[mode]) {
            const cmd = commands[mode][keyCombo];
            let displayKey = keyCombo;
            if (keyCombo === 'Escape') displayKey = 'Esc';
            if (keyCombo === 'Enter') displayKey = 'Enter';
            if (keyCombo === "'") displayKey = "'";
            let description = cmd.description;
            if (cmd.isPrefix && cmd.next) {
                for (const subKey in cmd.next) {
                    const subCmd = cmd.next[subKey];
                    html += `<li><strong>${displayKey}${subKey}</strong>: ${subCmd.description}</li>`;
                }
            } else if (cmd.isPrefix && cmd.acceptsChar) {
                html += `<li><strong>${displayKey}{a-z}</strong>: ${description}</li>`;
            } else {
                html += `<li><strong>${displayKey}</strong>: ${description}</li>`;
            }
        }
        html += '</ul>';
    }
    html += `<h3 class="text-lg font-semibold text-blue-300 mt-3 mb-1">COMMAND_LINE Mode (via ':')</h3>`;
    html += '<ul class="list-disc list-inside ml-4 space-y-1">';
    html += `<li><strong>:set zoom &lt;level&gt;</strong> - Set map zoom level</li>`;
    html += `<li><strong>:goto &lt;lon&gt; &lt;lat&gt;</strong> - Go to specified coordinates</li>`;
    html += `<li><strong>:q / :quit</strong> - Quit (placeholder)</li>`;
    html += `<li><strong>:w / :write</strong> - Write/Save (placeholder)</li>`;
    html += `<li><strong>:help</strong> - Show this help panel</li>`;
    html += `<li><strong>Esc</strong> - Exit Command Line Mode or close Help</li>`;
    html += `<li><strong>Enter</strong> - Execute command</li>`;
    html += '</ul>';
    helpContentElement.innerHTML = html;
}

if (typeof window !== 'undefined') {
    window.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && helpPanelElement && !helpPanelElement.classList.contains('hidden')) {
            helpPanelElement.classList.add('hidden');
        }
    });
}

export function toggleHelpPanel(commands) {
    if (helpPanelElement.classList.contains('hidden')) {
        populateHelpPanel(commands);
        helpPanelElement.classList.remove('hidden');
    } else {
        helpPanelElement.classList.add('hidden');
    }
}

// --- Command Logic & State ---
export let keyBuffer = '';
export let commandLineInput = '';
export let currentMode = 'NORMAL';

export const commands = {
    NORMAL: {
        'h': { action: PanLeft, description: 'Pan Left' },
        'j': { action: PanDown, description: 'Pan Down' },
        'k': { action: PanUp, description: 'Pan Up' },
        'l': { action: PanRight, description: 'Pan Right' },
        'w': { action: () => { for(let i=0; i<3; i++) PanRight(); }, description: 'Pan Word Right (Large Pan)' },
        'b': { action: () => { for(let i=0; i<3; i++) PanLeft(); }, description: 'Pan Word Left (Large Pan)' },
        '+': { action: ZoomIn, description: 'Zoom In' },
        '=': { action: ZoomIn, description: 'Zoom In (alternative)' },
        '-': { action: ZoomOut, description: 'Zoom Out' },
        'g': {
            isPrefix: true,
            description: 'Go to prefix',
            next: {
                'g': { action: () => { GoWorld(); showMessage('Went to World View'); }, description: 'Go To Top (World View)' },
            }
        },
        'G': { action: () => { GoHome(); showMessage('Went to Home (Nova Scotia)'); }, description: 'Go To "Home" (Nova Scotia)' },
        'z': {
            isPrefix: true,
            description: 'Zoom prefix',
            next: {
                'i': { action: ZoomIn, description: 'Zoom In (Vim style)' },
                'o': { action: ZoomOut, description: 'Zoom Out (Vim style)' },
                'z': { action: () => { SetMapView([0,0], 10); showMessage('Zoom reset to 10');}, description: 'Center and set zoom to 10'}
            }
        },
        'm': {
            isPrefix: true,
            acceptsChar: true,
            action: (char) => {
                const center = SetMarker(char);
                showMessage(`Marker '${char}' set at ${center[1].toFixed(2)}, ${center[0].toFixed(2)}`);
            },
            description: 'm{char} - Set marker {char} (a-z) at current center'
        },
        "'": {
            isPrefix: true,
            acceptsChar: true,
            action: (char) => {
                const jumped = JumpToMarker(char);
                if (jumped) {
                    showMessage(`Jumped to marker '${char}'`);
                } else {
                    showMessage(`Marker '${char}' not set`, 2000, true);
                }
            },
            description: "'{char} - Go to marker {char} (a-z)"
        },
        'i': { action: () => switchMode('INSERT'), description: 'Enter Insert Mode' },
        'v': { action: () => switchMode('VISUAL'), description: 'Enter Visual Mode' },
        ':': { action: () => switchMode('COMMAND_LINE'), description: 'Enter Command Line Mode' },
        '?': { action: toggleHelpPanel, description: 'Toggle Help Panel' },
        'Escape': { action: () => { keyBuffer = ''; updateModeIndicator(currentMode, keyBuffer, commandLineInput); showMessage('Command cancelled'); }, description: 'Clear current command buffer / Cancel' },
    },
    INSERT: {
        'Escape': { action: () => switchMode('NORMAL'), description: 'Exit Insert Mode to Normal Mode' },
    },
    VISUAL: {
        'Escape': { action: () => switchMode('NORMAL'), description: 'Exit Visual Mode to Normal Mode' },
    },
    COMMAND_LINE: {
        'Escape': { action: () => { commandLineInput = ''; switchMode('NORMAL'); }, description: 'Exit Command Line Mode' },
        'Enter': { action: executeCommandLine, description: 'Execute Command Line' },
    }
};

export function appendToCommandLineBuffer(char) {
    if (char.length === 1) {
        commandLineInput += char;
        updateModeIndicator(currentMode, keyBuffer, commandLineInput);
    }
}

export function handleBackspaceCommandLine() {
    commandLineInput = commandLineInput.slice(0, -1);
    updateModeIndicator(currentMode, keyBuffer, commandLineInput);
}

export function switchMode(newMode) {
    currentMode = newMode;
    updateModeIndicator(currentMode, keyBuffer, commandLineInput);
}

export function processKeyPress(key, helpPanelElement) {
    clearMessage();

    if (currentMode === 'NORMAL' && key === ':') {
        keyBuffer = '';
        switchMode('COMMAND_LINE');
        return;
    }

    if (currentMode === 'COMMAND_LINE') {
        if (key === 'Escape') {
            commands.COMMAND_LINE.Escape.action();
        } else if (key === 'Enter') {
            commands.COMMAND_LINE.Enter.action();
        } else if (key === 'Backspace') {
            handleBackspaceCommandLine();
        } else if (key.length === 1) {
            appendToCommandLineBuffer(key);
        }
        return;
    }

    if (key === 'Escape' && helpPanelElement && !helpPanelElement.classList.contains('hidden')) {
        toggleHelpPanel(commands);
        return;
    }
    if (key === '?' && currentMode === 'NORMAL' && keyBuffer === '') {
        toggleHelpPanel(commands);
        return;
    }

    let commandSet = commands[currentMode];
    if (!commandSet) {
        console.error(`No command set for mode: ${currentMode}`);
        return;
    }
    let targetKey = keyBuffer + key;
    let command = commandSet[targetKey];

    if (keyBuffer.length > 0) {
        const prefixCommandDef = commandSet[keyBuffer];
        if (prefixCommandDef && prefixCommandDef.isPrefix && prefixCommandDef.acceptsChar) {
            if (key.match(/^[a-z]$/)) {
                prefixCommandDef.action(key);
                keyBuffer = '';
                updateModeIndicator(currentMode, keyBuffer, commandLineInput);
                return;
            } else if (key === 'Escape') {
                keyBuffer = '';
                updateModeIndicator(currentMode, keyBuffer, commandLineInput);
                showMessage('Command cancelled');
                return;
            } else {
                showMessage(`Invalid character for command '${keyBuffer}'. Expected a-z.`, 2000, true);
                keyBuffer = '';
                updateModeIndicator(currentMode, keyBuffer, commandLineInput);
                return;
            }
        }
    }

    if (command) {
        if (command.isPrefix) {
            keyBuffer = targetKey;
            if (command.acceptsChar) {
                if (targetKey === 'm') {
                    showMessage("set marker [a-z]...");
                } else if (targetKey === "'") {
                    const markerKeys = Object.keys(markers || {}).sort();
                    if (markerKeys.length > 0) {
                        showMessage(`goto marker [${markerKeys.join(', ')}]...`);
                    } else {
                        showMessage("goto marker: no markers set");
                    }
                } else {
                    showMessage(`Command '${targetKey}': waiting for a character (a-z)...`);
                }
            } else {
                showMessage(`Prefix: ${targetKey}`);
            }
        } else {
            command.action();
            keyBuffer = '';
            if (!command.action.toString().includes('switchMode')) {
                 updateModeIndicator(currentMode, keyBuffer, commandLineInput);
            }
        }
    } else {
        let potentialPrefix = commandSet[keyBuffer];
        if (potentialPrefix && potentialPrefix.isPrefix && potentialPrefix.next && potentialPrefix.next[key]) {
            command = potentialPrefix.next[key];
            command.action();
            keyBuffer = '';
             if (!command.action.toString().includes('switchMode')) {
                 updateModeIndicator(currentMode, keyBuffer, commandLineInput);
            }
        } else {
            if (keyBuffer.length > 0) {
                showMessage(`Invalid sequence: ${keyBuffer}${key}`, 1500, true);
            }
            keyBuffer = '';
            updateModeIndicator(currentMode, keyBuffer, commandLineInput);
        }
    }
}

export function executeCommandLine() {
    const commandParts = commandLineInput.trim().split(/\s+/);
    const commandName = commandParts[0].toLowerCase();
    const args = commandParts.slice(1);
    let result = { success: false, message: `Unknown command: ${commandName}`, duration: 2000, isError: true };

    const handlerName = `cmd${commandName.charAt(0).toUpperCase() + commandName.slice(1)}`;

    if (CommandHandlers[handlerName] && typeof CommandHandlers[handlerName] === 'function') {
        result = CommandHandlers[handlerName](args);
    } else if (commandName === 'q' && CommandHandlers.cmdQuit) {
        result = CommandHandlers.cmdQuit(args);
    } else if (commandName === 'write' && CommandHandlers.cmdWrite) {
        result = CommandHandlers.cmdWrite(args);
    }

    if (result.action === 'toggleHelp') {
        toggleHelpPanel(commands); // commands is globally available in this module
    } else if (result.message) {
        showMessage(result.message, result.duration, result.isError);
    }

    commandLineInput = '';
    switchMode('NORMAL');
}
