
// --- OpenLayers Imports (available globally via ol object from CDN) ---
const Map = ol.Map;
const View = ol.View;
const TileLayer = ol.layer.Tile;
const OSM = ol.source.OSM;
const { fromLonLat, toLonLat } = ol.proj;
const VectorLayer = ol.layer.Vector;
const VectorSource = ol.source.Vector;
const Feature = ol.Feature;
const Point = ol.geom.Point;
const Style = ol.style.Style;
const CircleStyle = ol.style.Circle;
const Fill = ol.style.Fill;
const Stroke = ol.style.Stroke;
const Icon = ol.style.Icon; // For potential custom marker icons

// --- DOM Elements ---
const mapElement = document.getElementById('map');
const modeIndicatorElement = document.getElementById('modeIndicator');
const commandBufferDisplayElement = document.getElementById('commandBufferDisplay');
const messageAreaElement = document.getElementById('messageArea');
const helpPanelElement = document.getElementById('helpPanel');
const helpContentElement = document.getElementById('helpContent');
const closeHelpButton = document.getElementById('closeHelpButton');

// --- Application State ---
let currentMode = 'NORMAL'; // NORMAL, INSERT, VISUAL, COMMAND_LINE
let keyBuffer = '';
let commandLineInput = '';
let markers = {}; // { 'a': [lon, lat], ... }
let map;
let view;
let markerSource;
let markerLayer;

// --- Configuration ---
const panStepFactor = 64; // Pan by 64 pixels worth of map units
const zoomStep = 1;
const defaultZoom = 3;
// const worldExtent = fromLonLat([-180, -85]), fromLonLat([180, 85]); // Approximate - This line was causing the error and is not used.
								// Correct way to define an extent would be:
								// const minCoord = fromLonLat([-180, -85]);
								// const maxCoord = fromLonLat([180, 85]);
								// const worldExtent = [minCoord[0], minCoord[1], maxCoord[0], maxCoord[1]];


// --- UI Update Functions ---
function updateModeIndicator() {
    modeIndicatorElement.textContent = `-- ${currentMode.toUpperCase()} --`;
    if (currentMode === 'COMMAND_LINE') {
	commandBufferDisplayElement.textContent = `:${commandLineInput}`;
    } else {
	commandBufferDisplayElement.textContent = keyBuffer;
    }
}

function showMessage(text, duration = 3000) {
    messageAreaElement.textContent = text;
    if (duration > 0) {
	setTimeout(() => {
	    if (messageAreaElement.textContent === text) { // Clear only if it's the same message
		messageAreaElement.textContent = '';
	    }
	}, duration);
    }
}

function clearMessage() {
    messageAreaElement.textContent = '';
}

function updateMapCoordinates() {
    if (!map) return;
    const center = toLonLat(view.getCenter());
    const zoom = view.getZoom();
    // Continuously update message area, or only on demand? Let's make it on demand for now.
    // For now, let's show it in messageArea when there's no other message.
    if (messageAreaElement.textContent === '' || messageAreaElement.textContent.startsWith('Lat:')) {
	 messageAreaElement.textContent = `Lat: ${center[1].toFixed(4)}, Lon: ${center[0].toFixed(4)}, Zoom: ${zoom.toFixed(1)}`;
    }
}


// --- Map Functions ---
function initializeMap() {
    markerSource = new VectorSource();
    markerLayer = new VectorLayer({
	source: markerSource,
	style: new Style({
	    image: new CircleStyle({
		radius: 7,
		fill: new Fill({ color: 'rgba(255, 0, 0, 0.7)' }),
		stroke: new Stroke({ color: 'white', width: 2 }),
	    }),
	}),
    });

    view = new View({
	center: fromLonLat([0, 0]),
	zoom: defaultZoom,
    });

    map = new Map({
	target: mapElement,
	layers: [
	    new TileLayer({
		source: new OSM(),
	    }),
	    markerLayer,
	],
	view: view,
	controls: ol.control.defaults.defaults({ attributionOptions: { collapsible: false } }).extend([
	    new ol.control.Zoom() // Add zoom slider
	])
    });
    
    map.on('moveend', updateMapCoordinates);
    updateMapCoordinates(); // Initial coordinate display
}

function panMap(direction) {
    const currentCenter = view.getCenter();
    const resolution = view.getResolution();
    const panAmount = resolution * panStepFactor;
    let newCenter;
    switch (direction) {
	case 'LEFT':  newCenter = [currentCenter[0] - panAmount, currentCenter[1]]; break;
	case 'RIGHT': newCenter = [currentCenter[0] + panAmount, currentCenter[1]]; break;
	case 'UP':    newCenter = [currentCenter[0], currentCenter[1] + panAmount]; break;
	case 'DOWN':  newCenter = [currentCenter[0], currentCenter[1] - panAmount]; break;
    }
    if (newCenter) {
	view.animate({ center: newCenter, duration: 100 });
    }
}

function zoomMap(direction) {
    const currentZoom = view.getZoom();
    let newZoom;
    if (direction === 'IN') {
	newZoom = currentZoom + zoomStep;
    } else if (direction === 'OUT') {
	newZoom = currentZoom - zoomStep;
    }
    if (newZoom !== undefined) {
	view.animate({ zoom: newZoom, duration: 200 });
    }
}

function setMapView(centerLonLat, zoomLevel) {
    view.animate({
	center: fromLonLat(centerLonLat),
	zoom: zoomLevel,
	duration: 500
    });
}

// --- Command Definitions ---
const commands = {
    NORMAL: {

	'h': { action: () => panMap('LEFT'), description: 'Pan Left' },
	'j': { action: () => panMap('DOWN'), description: 'Pan Down' },
	'k': { action: () => panMap('UP'), description: 'Pan Up' },
	'l': { action: () => panMap('RIGHT'), description: 'Pan Right' },
	'w': { action: () => { for(let i=0; i<3; i++) panMap('RIGHT'); }, description: 'Pan Word Right (Large Pan)' },
	'b': { action: () => { for(let i=0; i<3; i++) panMap('LEFT'); }, description: 'Pan Word Left (Large Pan)' },
	'+': { action: () => zoomMap('IN'), description: 'Zoom In' },
	'=': { action: () => zoomMap('IN'), description: 'Zoom In (alternative)' },
	'-': { action: () => zoomMap('OUT'), description: 'Zoom Out' },
	'g': {
	    isPrefix: true,
	    description: 'Go to prefix',
	    next: {
		'g': { action: () => setMapView([0,0], defaultZoom), description: 'Go To Top (World View)' },
	    }
	},
	'G': { action: () => setMapView([-63.5,45], 6), description: 'Go To "Home" (Nova Scotia)' }, // Example Home
	'z': {
	    isPrefix: true,
	    description: 'Zoom prefix',
	    next: {
		'i': { action: () => zoomMap('IN'), description: 'Zoom In (Vim style)' },
		'o': { action: () => zoomMap('OUT'), description: 'Zoom Out (Vim style)' },
		'z': { action: () => { view.animate({zoom: 10, duration: 200}); showMessage('Zoom reset to 10');}, description: 'Center and set zoom to 10'}
	    }
	},
	'm': {
	    isPrefix: true,
	    acceptsChar: true, // Expects a-z
	    action: (char) => {
		const center = toLonLat(view.getCenter());
		markers[char] = center;
		// Add visual marker to map
		const markerFeature = new Feature({ geometry: new Point(fromLonLat(center)) });
		markerFeature.setId(`marker_${char}`);
		// Remove existing marker with same char if any
		const existing = markerSource.getFeatureById(`marker_${char}`);
		if (existing) markerSource.removeFeature(existing);
		markerSource.addFeature(markerFeature);
		showMessage(`Marker '${char}' set at ${center[1].toFixed(2)}, ${center[0].toFixed(2)}`);
	    },
	    description: 'm{char} - Set marker {char} (a-z) at current center'
	},
	"'": { // Single quote
	    isPrefix: true,
	    acceptsChar: true, // Expects a-z
	    action: (char) => {
		if (markers[char]) {
		    setMapView(markers[char], view.getZoom()); // Go to marker, keep current zoom
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
	'Escape': { action: () => { keyBuffer = ''; updateModeIndicator(); showMessage('Command cancelled'); }, description: 'Clear current command buffer / Cancel' },

    },
    INSERT: {
	'Escape': { action: () => switchMode('NORMAL'), description: 'Exit Insert Mode to Normal Mode' },
	// TODO: Add insert mode commands, e.g., click to add point
    },
    VISUAL: {
	'Escape': { action: () => switchMode('NORMAL'), description: 'Exit Visual Mode to Normal Mode' },
	// TODO: Add visual mode commands, e.g., select area
    },
    COMMAND_LINE: {
	'Escape': { action: () => { commandLineInput = ''; switchMode('NORMAL'); }, description: 'Exit Command Line Mode' },
	'Enter': { action: executeCommandLine, description: 'Execute Command Line' },
	// Other keys will be handled by appendToCommandLineBuffer
    }
};

// --- Command Handling Logic ---
function switchMode(newMode) {
    currentMode = newMode;
    keyBuffer = '';
    if (newMode !== 'COMMAND_LINE') commandLineInput = '';
    updateModeIndicator();
    showMessage(`Switched to ${newMode} mode`);
}

function appendToCommandLineBuffer(char) {
    if (char.length === 1) { // Avoid adding "Control", "Shift" etc.
	 commandLineInput += char;
	 updateModeIndicator();
    }
}

function handleBackspaceCommandLine() {
    commandLineInput = commandLineInput.slice(0, -1);
    updateModeIndicator();
}

function executeCommandLine() {
    const commandParts = commandLineInput.trim().split(/\s+/);
    const cmd = commandParts[0];
    const args = commandParts.slice(1);
    let executed = false;

    if (cmd === 'q' || cmd === 'quit') {
	showMessage('Quit command (no action in prototype)');
	executed = true;
    } else if (cmd === 'w' || cmd === 'write') {
	showMessage('Write command (no action in prototype)');
	executed = true;
    } else if (cmd === 'set') {
	if (args.length === 2 && args[0] === 'zoom') {
	    const zoomLevel = parseFloat(args[1]);
	    if (!isNaN(zoomLevel) && view && view.getMinZoom && view.getMaxZoom && zoomLevel >= view.getMinZoom() && zoomLevel <= view.getMaxZoom()) {
		view.animate({ zoom: zoomLevel, duration: 200 });
		showMessage(`Zoom set to ${zoomLevel}`);
		executed = true;
	    } else {
		showMessage(`Invalid zoom level: ${args[1]}`, 2000, true);
	    }
	}
    } else if (cmd === 'goto') {
	if (args.length === 2) {
	    const lon = parseFloat(args[0]);
	    const lat = parseFloat(args[1]);
	    if (!isNaN(lon) && !isNaN(lat)) {
		setMapView([lon, lat], view.getZoom());
		showMessage(`Going to ${lat.toFixed(4)}, ${lon.toFixed(4)}`);
		executed = true;
	    } else {
		showMessage('Invalid coordinates for goto.', 2000, true);
	    }
	}
    } else if (cmd === 'help') {
	toggleHelpPanel();
	executed = true;
    }


    if (!executed && commandLineInput.length > 0) {
	showMessage(`Unknown command: ${commandLineInput}`, 2000, true);
    }
    commandLineInput = '';
    switchMode('NORMAL'); // Always return to normal mode after command execution or attempt
}


function processKeyPress(key) {
    clearMessage(); // Clear previous transient messages

    if (currentMode === 'COMMAND_LINE') {
	if (key === 'Escape') {
	    commands.COMMAND_LINE.Escape.action();
	} else if (key === 'Enter') {
	    commands.COMMAND_LINE.Enter.action();
	} else if (key === 'Backspace') {
	    handleBackspaceCommandLine();
	} else if (key.length === 1) { // Append printable characters
	    appendToCommandLineBuffer(key);
	}
	updateModeIndicator();
	return;
    }

    // Universal Escape for other modes if help is open
    if (key === 'Escape' && !helpPanelElement.classList.contains('hidden')) {
	toggleHelpPanel();
	return;
    }
    
    // Universal ? for help
    if (key === '?' && currentMode === 'NORMAL' && keyBuffer === '') { // only if not in middle of command
	commands.NORMAL['?'].action();
	return;
    }


    let commandSet = commands[currentMode];
    let targetKey = keyBuffer + key;
    let command = commandSet[targetKey];

    // Handle prefix commands (like 'm' or 'g') that are waiting for a character argument
    if (keyBuffer.length > 0) {
	const prefixCommandDef = commandSet[keyBuffer];
	if (prefixCommandDef && prefixCommandDef.isPrefix && prefixCommandDef.acceptsChar) {
	    if (key.match(/^[a-z]$/)) { // Check if key is a single lowercase letter
		prefixCommandDef.action(key);
		keyBuffer = '';
		updateModeIndicator();
		return;
	    } else if (key === 'Escape') {
		keyBuffer = '';
		updateModeIndicator();
		showMessage('Command cancelled');
		return;
	    } else {
		showMessage(`Invalid character for command '${keyBuffer}'. Expected a-z.`, 2000, true);
		keyBuffer = ''; // Reset buffer on invalid char
		updateModeIndicator();
		return;
	    }
	}
    }


    if (command) { // Direct match or completed sequence
	if (command.isPrefix) {
	    if (command.acceptsChar) { // e.g. 'm' or "'"
		keyBuffer = targetKey; // Store 'm' or "'"
		showMessage(`Type a character (a-z) for marker ${targetKey}`);
	    } else { // e.g. 'g' or 'z'
		keyBuffer = targetKey;
	    }
	} else {
	    command.action();
	    keyBuffer = '';
	}
    } else { // No direct match, check if current keyBuffer is a prefix for a longer command
	let potentialPrefix = commandSet[keyBuffer];
	if (potentialPrefix && potentialPrefix.isPrefix && potentialPrefix.next && potentialPrefix.next[key]) {
	    command = potentialPrefix.next[key];
	    if (command.isPrefix) { // Should not happen with current structure (gg, zi, zo are not prefixes themselves)
		keyBuffer += key;
	    } else {
		command.action();
		keyBuffer = '';
	    }
	} else {
	    // No command found
	    showMessage(`Unknown command: ${targetKey}`, 1500, true);
	    keyBuffer = '';
	}
    }
    updateModeIndicator();
}


// --- Help Panel Logic ---
function populateHelpPanel() {
    let html = '';
    for (const mode in commands) {
	html += `<h3 class="text-lg font-semibold text-blue-300 mt-3 mb-1">${mode} Mode</h3>`;
	html += '<ul class="list-disc list-inside ml-4 space-y-1">';
	for (const keyCombo in commands[mode]) {
	    const cmd = commands[mode][keyCombo];
	    let displayKey = keyCombo;
	    if (keyCombo === 'Escape') displayKey = 'Esc';
	    if (keyCombo === 'Enter') displayKey = 'Enter';
	    if (keyCombo === "'") displayKey = "'"; // Ensure single quote displays

	    let description = cmd.description;
	    if (cmd.isPrefix && cmd.next) {
		// For commands like 'g', 'z'
		const subCommands = Object.entries(cmd.next)
		    .map(([subKey, subCmd]) => `<li><strong>${keyCombo}${subKey}</strong>: ${subCmd.description}</li>`)
		    .join('');
		html += `<ul class="list-disc list-inside ml-4">${subCommands}</ul>`;
	    } else if (cmd.isPrefix && cmd.acceptsChar) {
		// For commands like 'm{char}'
		html += `<li><strong>${displayKey}{a-z}</strong>: ${description}</li>`;
	    }
	    else {
		 html += `<li><strong>${displayKey}</strong>: ${description}</li>`;
	    }
	}
	html += '</ul>';
    }
    // Add command line help
    html += `<h3 class="text-lg font-semibold text-blue-300 mt-3 mb-1">COMMAND_LINE Mode (via ':')</h3>`;
    html += '<ul class="list-disc list-inside ml-4 space-y-1">';
    html += `<li><strong>:set zoom &lt;level&gt;</strong> - Set map zoom level</li>`;
    html += `<li><strong>:goto &lt;lon&gt; &lt;lat&gt;</strong> - Go to specified coordinates</li>`;
    html += `<li><strong>:q / :quit</strong> - Quit (placeholder)</li>`;
    html += `<li><strong>:w / :write</strong> - Write/Save (placeholder)</li>`;
    html += `<li><strong>:help</strong> - Show this help panel</li>`;
    html += `<li><strong>Esc</strong> - Exit Command Line Mode</li>`;
    html += `<li><strong>Enter</strong> - Execute command</li>`;
    html += '</ul>';

    helpContentElement.innerHTML = html;
}

function toggleHelpPanel() {
    if (helpPanelElement.classList.contains('hidden')) {
	populateHelpPanel(); // Repopulate each time in case commands change (though not in this static version)
	helpPanelElement.classList.remove('hidden');
    } else {
	helpPanelElement.classList.add('hidden');
    }
}

// --- Event Listeners ---
document.addEventListener('keydown', (event) => {
    // Prevent browser shortcuts if we are handling the key
    // e.g. Ctrl+S, '/', etc.
    // For this prototype, we'll focus on single keys or simple sequences.
    // More complex Vim-like bindings (e.g. involving Ctrl, Alt) would need more robust key capture.

    let key = event.key;

    // Handle special keys that don't always have a clean `event.key`
    if (event.code === 'Equal' && event.shiftKey) key = '+'; // Handle '+' on standard US keyboards
    else if (event.code === 'Minus') key = '-';
    else if (event.code === 'Quote') key = "'";


    // If help panel is active, only Esc should work globally to close it.
    if (!helpPanelElement.classList.contains('hidden')) {
	if (key === 'Escape') {
	    toggleHelpPanel();
	    event.preventDefault();
	}
	return; // Don't process other keys if help is open
    }
    
    // Prevent default for keys we will handle to avoid browser actions (e.g. '/' for find)
    // or scrolling with j, k, h, l (though less common now)
    const activeCommands = commands[currentMode];
    let isBoundKey = false;
    if (activeCommands && activeCommands[key]) {
	 isBoundKey = true;
    } else if (keyBuffer.length > 0) { // Check for multi-key commands
	const prefixCmd = activeCommands ? activeCommands[keyBuffer] : null;
	if (prefixCmd && prefixCmd.isPrefix) {
	    if (prefixCmd.next && prefixCmd.next[key]) isBoundKey = true;
	    if (prefixCmd.acceptsChar && key.match(/^[a-z]$/)) isBoundKey = true;
	}
    }
     if (key === '?' && currentMode === 'NORMAL') isBoundKey = true; // for help
     if (key === 'Escape') isBoundKey = true; // Always handle escape

    if (currentMode === 'COMMAND_LINE') {
	// Allow most keys for typing, but Escape and Enter are special
	if (key === 'Escape' || key === 'Enter' || key === 'Backspace') {
	     event.preventDefault();
	}
	// Let other keys through for typing into command line buffer
    } else if (isBoundKey) {
	event.preventDefault(); // Prevent default browser action for our bound keys
    }


    processKeyPress(key);
});

closeHelpButton.addEventListener('click', toggleHelpPanel);


// --- Initialization ---
initializeMap();
updateModeIndicator();
showMessage('GeoVim Prototype Loaded. Press ? for help.', 5000);


