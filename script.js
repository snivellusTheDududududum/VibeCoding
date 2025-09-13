let selectedTerminal = null;
let connections = [];
let wires = [];

document.addEventListener('DOMContentLoaded', function() {
    const terminals = document.querySelectorAll('.terminal');
    
    terminals.forEach(terminal => {
        terminal.addEventListener('click', handleTerminalClick);
    });
});

function handleTerminalClick(event) {
    const terminal = event.target;
    const terminalId = terminal.dataset.terminal;
    
    if (!selectedTerminal) {
        selectedTerminal = terminal;
        terminal.classList.add('selected');
    } else if (selectedTerminal === terminal) {
        selectedTerminal.classList.remove('selected');
        selectedTerminal = null;
    } else {
        connectTerminals(selectedTerminal, terminal);
        selectedTerminal.classList.remove('selected');
        selectedTerminal = null;
    }
}

function connectTerminals(terminal1, terminal2) {
    const id1 = terminal1.dataset.terminal;
    const id2 = terminal2.dataset.terminal;
    
    // Check if connection already exists
    const existingConnection = connections.find(conn => 
        (conn.from === id1 && conn.to === id2) || 
        (conn.from === id2 && conn.to === id1)
    );
    
    if (existingConnection) return;
    
    // Add connection
    connections.push({ from: id1, to: id2 });
    
    // Mark terminals as connected
    terminal1.classList.add('connected');
    terminal2.classList.add('connected');
    
    // Draw wire
    drawWire(terminal1, terminal2);
    
    // Check circuit
    checkCircuit();
}

function drawWire(terminal1, terminal2) {
    const rect1 = terminal1.getBoundingClientRect();
    const rect2 = terminal2.getBoundingClientRect();
    const circuitRect = document.querySelector('.circuit').getBoundingClientRect();
    
    const x1 = rect1.left + rect1.width/2 - circuitRect.left;
    const y1 = rect1.top + rect1.height/2 - circuitRect.top;
    const x2 = rect2.left + rect2.width/2 - circuitRect.left;
    const y2 = rect2.top + rect2.height/2 - circuitRect.top;
    
    const length = Math.sqrt((x2-x1)**2 + (y2-y1)**2);
    const angle = Math.atan2(y2-y1, x2-x1) * 180/Math.PI;
    
    const wire = document.createElement('div');
    wire.className = 'wire';
    wire.style.left = x1 + 'px';
    wire.style.top = y1 + 'px';
    wire.style.width = length + 'px';
    wire.style.transform = `rotate(${angle}deg)`;
    
    document.querySelector('.circuit').appendChild(wire);
    wires.push(wire);
}

function checkCircuit() {
    // Reset all bulbs
    document.querySelectorAll('.bulb').forEach(bulb => {
        bulb.classList.remove('lit');
    });
    
    // Check each bulb for complete circuit
    checkBulbCircuit('1', 'bulb1-left', 'bulb1-right');
    checkBulbCircuit('2', 'bulb2-left', 'bulb2-right');
}

function checkBulbCircuit(bulbNum, leftTerminal, rightTerminal) {
    // Check if there's a path from battery positive through bulb to battery negative
    const hasPath = (
        isConnected('battery-pos', leftTerminal) && isConnected(rightTerminal, 'battery-neg')
    ) || (
        isConnected('battery-pos', rightTerminal) && isConnected(leftTerminal, 'battery-neg')
    );
    
    if (hasPath) {
        document.querySelector(`[data-bulb="${bulbNum}"]`).classList.add('lit');
    }
}

function isConnected(terminal1, terminal2) {
    // Simple path finding - direct connection or through other terminals
    const visited = new Set();
    
    function findPath(current, target) {
        if (current === target) return true;
        if (visited.has(current)) return false;
        
        visited.add(current);
        
        for (const conn of connections) {
            let next = null;
            if (conn.from === current) next = conn.to;
            else if (conn.to === current) next = conn.from;
            
            if (next && findPath(next, target)) return true;
        }
        
        return false;
    }
    
    return findPath(terminal1, terminal2);
}

function clearConnections() {
    connections = [];
    
    // Remove all wire elements
    wires.forEach(wire => wire.remove());
    wires = [];
    
    // Reset terminal states
    document.querySelectorAll('.terminal').forEach(terminal => {
        terminal.classList.remove('connected', 'selected');
    });
    
    // Turn off all bulbs
    document.querySelectorAll('.bulb').forEach(bulb => {
        bulb.classList.remove('lit');
    });
    
    selectedTerminal = null;
}