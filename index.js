const KEY_DOWN = 144;
const KEY_UP = 128;
const blackKeys = [1, 3, 6, 8, 10];
const PEDAL = 177;
/**
 * @type {null | import('./node_modules/simple-peer/index')}
 */
let ps;
const keys = { whiteKeys: {}, blackKeys: {}, pedal: 0 };

const rightHand = [{
    position: 0,
    note: "E4"
}, {
    position: 1,
    note: "E4"
}, {
    position: 2,
    note: "F4"
}, {
    position: 3,
    note: "G4"
}, {
    position: 4,
    note: "G4"
}, {
    position: 5,
    note: "F4"
}, {
    position: 6,
    note: "E4"
}, {
    position: 7,
    note: "D4"
}, {
    position: 8,
    note: "C4"
}];

for (const r of rightHand) {
    const note = r.note.slice(0, 1);
    const octave = Number(r.note.slice(1, 2));
    r.internal_note = charNoteToNumber(note) + ((octave - 1) * 12) + 3;
    r.pressed = false;
}

console.log(rightHand);

function server() {
    ps = new SimplePeer({
        initiator: true,
        trickle: false
    });
    ps.on('error', err => console.log('error', err));

    ps.on('signal', data => {
        console.log('SIGNAL', JSON.stringify(data));
        document.getElementById('sdp-info').value = JSON.stringify(data);

        const input = prompt("digite o answer:");
        ps.signal(JSON.parse(input));
    });

    ps.on('connect', () => {
        console.log('CONNECT');
        ps.send('whatever' + Math.random());
    });

    ps.on('data', data => {
        console.log('data: ' + data);
    });

}

function join() {
    const p = new SimplePeer({
        initiator: false,
        trickle: false
    });
    p.on('error', err => console.log('error', err));

    p.on('signal', data => {
        console.log('SIGNAL', JSON.stringify(data));
        document.getElementById('sdp-info').value = JSON.stringify(data);
    });

    p.on('connect', () => {
        console.log('CONNECT');
        p.send('whatever' + Math.random());
    });

    p.on('data', data => {
        console.log('data: ' + data);
    });

    const input = prompt("digite o offer:");
    p.signal(JSON.parse(input));
}

let midi = null;  // global MIDIAccess object

/**
 * 
 * @param {WebMidi.MIDIAccess} midiAccess 
 */
function onMIDISuccess(midiAccess) {
    console.log("MIDI ready!");
    midi = midiAccess;  // store in the global (in real usage, would probably keep in an object instance)
    console.log(midi);
    startLoggingMIDIInput(midi);
}

/**
 * 
 * @param {Error} msg 
 */
function onMIDIFailure(msg) {
    console.error(`Failed to get MIDI access - ${msg}`);
}

navigator.requestMIDIAccess().then(onMIDISuccess, onMIDIFailure);

let position = 0;

/**
 * 
 * @param {Uint8Array} eventData 
 */
function parseInformation(eventData) {
    const [keyEvent, key, strength] = eventData;

    const marginKeys = key - 21;
    const octave = Math.floor((marginKeys + 9) / 12);
    const note = (marginKeys + 9) % 12;

    if (keyEvent == PEDAL) {
        keys.pedal = strength;
    }

    if (keyEvent == KEY_DOWN) {

        if (position < rightHand.length && key - 21 == rightHand[position].internal_note) {
            rightHand[position].pressed = true;
            drawSheets();
            position += 1;
        }

        if (blackKeys.includes(note)) {
            let number = 2 + ((octave - 1) * 7);

            if (note > 4) {
                number += Math.floor((note + 1) / 2);
            } else {
                number += Math.floor((note) / 2);
            }

            keys.blackKeys[number] = (Math.min(strength, 100) * 2.55).toString(16).slice(0, 2);
        } else {
            let number = 2 + ((octave - 1) * 7);
            if (note > 4) {
                number += Math.floor((note + 1) / 2);
            } else {
                number += Math.floor(note / 2);
            }
            keys.whiteKeys[number] = (Math.max(100 - strength, 0) * 2.55).toString(16).slice(0, 2);
        }

    }

    if (keyEvent == KEY_UP) {

        if (blackKeys.includes(note)) {
            let number = 2 + ((octave - 1) * 7);
            if (note > 4) {
                number += Math.floor((note + 1) / 2);
            } else {
                number += Math.floor((note) / 2);
            }
            delete keys.blackKeys[number];
        } else {
            let number = 2 + ((octave - 1) * 7);
            if (note > 4) {
                number += Math.floor((note + 1) / 2);
            } else {
                number += Math.floor(note / 2);
            }
            delete keys.whiteKeys[number];
        }
    }

}

/**
 * 
 * @param {WebMidi.MIDIMessageEvent} event 
 */
function onMIDIMessage(event) {
    parseInformation(event.data);

    if (ps) {
        ps.send(JSON.stringify(event.data));
    }

    draw(keys);
}

/**
 * 
 * @param {WebMidi.MIDIAccess} midiAccess 
 * @param {*} indexOfPort 
 */
function startLoggingMIDIInput(midiAccess, indexOfPort) {
    for (const entry of midiAccess.inputs) {
        entry.onmidimessage = onMIDIMessage;
    }
}

const keyLength = 20;
const pianoLength = 52;

/**
 * 
 * @param {{ whiteKeys: {}, blackKeys: {}, pedal: number }} pressedKeys 
 */
function draw(pressedKeys) {

    /**
     * @type {HTMLCanvasElement}
     */
    const canvas = document.getElementById("piano");
    const context = canvas.getContext("2d");

    context.clearRect(0, 0, canvas.width, canvas.height);
    context.font = "10px sans-serif";


    for (let i = 0; i < pianoLength; i++) {
        context.beginPath();
        context.strokeStyle = "#000";
        context.rect(i * keyLength, 0, keyLength, keyLength * 8);
        context.stroke();
        if (i in keys.whiteKeys) {
            context.fillStyle = "#" + keys.whiteKeys[i] + keys.whiteKeys[i] + keys.whiteKeys[i];
            context.fill();
        }
        context.fillStyle = "#000";

        const key = (i + 5) % 7;

        if (key == 0) {
            context.fillText("C" + (i + 5) / 7, (i * keyLength) + 4, keyLength * 7.8);
        }

    }


    for (let i = 0; i < pianoLength; i++) {
        context.beginPath();

        const key = (i + 6) % 7;

        if (key == 0 || key == 3 || i + 1 == pianoLength) {
            continue;
        }

        context.strokeStyle = "#000";
        context.fillStyle = "#000";
        context.rect((i * keyLength) + keyLength * 0.7, 0, keyLength * 0.6, keyLength * 5);
        if (i in keys.blackKeys) {
            context.fillStyle = "#" + keys.blackKeys[i] + keys.blackKeys[i] + keys.blackKeys[i];
        }
        context.fill();
        context.stroke();
    }

    context.beginPath();
    context.strokeStyle = "#000";
    context.rect(keyLength * 53, 5, keyLength * 3, keyLength * 5);

    if (keys.pedal) {
        context.fillStyle = "#00ff00";
        context.fill();
    } else {
        context.fillStyle = "#fff";
        context.fill();
    }

    context.stroke();

    context.fillStyle = "#000";
    context.font = "24px sans-serif";
    context.fillText("Ped.", (keyLength * 53) + 6, keyLength * 4);
}

/**
 * 
 * @param {CanvasRenderingContext2D} context 
 * @param {number} position 
 * @param {number} note 
 * @param {boolean} pressed 
 */
function drawSemiColumn(context, position, note, pressed) {
    context.beginPath();
    context.fillStyle = "#000";
    if (pressed) {
        context.fillStyle = "#0f0";
    }
    context.ellipse(position, note, 8, 12, Math.PI / 2.5, 0, 2 * Math.PI);
    context.stroke();
    context.fill();
    context.beginPath();
    context.lineWidth = 2;
    context.moveTo(position + 12, note);
    context.lineTo(position + 12, note - 60);
    context.stroke();
}

/**
 * 
 * @param {string} note 
 * @returns 
 */
function noteToSpace(note) {
    switch (note) {
        case "C":
            return 0;
        case "D":
            return 1;
        case "E":
            return 2;
        case "F":
            return 3;
        case "G":
            return 4;
        case "A":
            return 5;
        case "B":
            return 6;
    }
}

/**
 * 
 * @param {string} note 
 * @returns 
 */
function charNoteToNumber(note) {
    switch (note) {
        case "C":
            return 0;
        case "D":
            return 2;
        case "E":
            return 4;
        case "F":
            return 5;
        case "G":
            return 7;
        case "A":
            return 9;
        case "B":
            return 11;
    }
}

function drawSheets() {
    /**
     * @type {HTMLCanvasElement}
     */
    const canvas = document.getElementById("sheets");
    const context = canvas.getContext("2d");
    const margin = 70;
    const spaceBetween = 20;

    for (let i = 0; i < 5; i++) {
        context.beginPath();
        context.moveTo(0, (i * spaceBetween) + margin);
        context.lineTo(1000, (i * spaceBetween) + margin);
        context.stroke();
    }

    for (const r of rightHand) {
        const note = r.note.slice(0, 1);
        const octave = Number(r.note.slice(1, 2));

        drawSemiColumn(context, 100 + (r.position * 60), 170 - (noteToSpace(note) * (spaceBetween / 2)), r.pressed);
    }

}

window.onload = () => {
    draw([]);
    drawSheets();
};