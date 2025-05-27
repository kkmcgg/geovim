// main.js
import { commands, processKeyPress, currentMode, keyBuffer, commandLineInput, updateModeIndicator, showMessage, toggleHelpPanel, updateMapCoordinates } from './interface.js';
import { view, initializeMap } from './map.js';

function handleKeyDown(e) {
    const helpPanel = document.getElementById('helpPanel');
    if (helpPanel && !helpPanel.classList.contains('hidden') && e.key === 'Escape') {
        // Let interface.js handle its own help panel closing via Esc.
    }

    // Prevent default browser actions for certain keys when not in an input field.
    if (["ArrowLeft","ArrowRight","ArrowUp","ArrowDown"," ","PageUp","PageDown","Home","End", "Enter", "Escape", "Backspace"].includes(e.key)) {
        if (document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA') {
            e.preventDefault();
        }
    }

    // Ignore modifier keys if pressed alone.
    if (e.ctrlKey || e.metaKey || e.altKey) {
        if (e.key === "Control" || e.key === "Shift" || e.key === "Alt" || e.key === "Meta") {
            return;
        }
    }
    
    processKeyPress(e.key, helpPanel);
}

function handleCloseHelp() {
    const helpPanel = document.getElementById('helpPanel');
    if (helpPanel) {
        helpPanel.classList.add('hidden');
    }
}

function setupEventListeners() {
    document.addEventListener('keydown', handleKeyDown);
    const closeHelpButton = document.getElementById('closeHelpButton');
    if (closeHelpButton) closeHelpButton.addEventListener('click', handleCloseHelp);
}

function initialize() {
    const mapElement = document.getElementById('map');
    if (!mapElement) {
        console.error("Map element not found!");
        return;
    }
    initializeMap(mapElement);

    updateModeIndicator(currentMode, keyBuffer, commandLineInput);
    setupEventListeners();
    showMessage('Welcome to GeoVim! Press ? for help.', 2500);
    updateMapCoordinates();
}

document.addEventListener('DOMContentLoaded', initialize);
