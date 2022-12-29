import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';

const KEY_DOWN = 144;
const KEY_UP = 128;
const blackKeys = [1, 3, 6, 8, 10];
const PEDAL = 177;
// let wss;

interface Keys {
  whiteKeys: { [position: number]: string }
  blackKeys: { [position: number]: string }
  pedal: number
}


interface Note {
  position: number,
  note: string,
  pressed?: boolean
  internal_note?: number
}

interface Event {
  data: number[]
}


// function server() {
//   wss = new WebSocket("wss://localhost:3000", {
//     rejectUnauthorized: false
//   });
//   wss.onopen = (event) => {
//     console.log('connection ok');
//   };
//   wss.onmessage = (message) => {
//     console.log('chegou', message.data);
//   };
// }

// function join() {

//   const input = prompt("Please enter your name:", "wss://localhost:3000");

//   ws = new WebSocket(input);
//   ws.onopen = (event) => {
//     console.log('connection ok');
//   };
//   ws.onmessage = (message) => {
//     console.log('join chegou', message);
//     parseInformation(JSON.parse(message.data));
//     draw(keys);
//   };
// }

export default function App() {

  const pianoRef = React.useRef<HTMLCanvasElement>(null);
  const sheetsRef = React.useRef<HTMLCanvasElement>(null);

  const keys: Keys = { whiteKeys: {}, blackKeys: {}, pedal: 0 };

  const rightHand: Note[] = [{
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


  let midi = null;  // global MIDIAccess object
  function onMIDISuccess(midiAccess) {
    console.log("MIDI ready!");
    midi = midiAccess;  // store in the global (in real usage, would probably keep in an object instance)
    console.log(midi);
    startLoggingMIDIInput(midi);
  }

  function onMIDIFailure(msg: String) {
    console.error(`Failed to get MIDI access - ${msg}`);
  }

  let position = 0;

  function parseInformation(sheets: HTMLCanvasElement, eventData: number[]) {
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

  function onMIDIMessage(sheets: HTMLCanvasElement, event: Event) {
    parseInformation(sheets, event.data);

    // if (wss) {
    //   wss.send(JSON.stringify(event.data));
    // }

    draw();
  }

  function startLoggingMIDIInput(midiAccess, indexOfPort) {
    midiAccess.inputs.forEach((entry) => { entry.onmidimessage = onMIDIMessage; });
  }

  const keyLength = 20;
  const pianoLength = 52;

  function draw() {

    const canvas = pianoRef.current;
    if (!canvas) {
      return;
    }
    const context = canvas.getContext("2d");
    if (!context) {
      return;
    }

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

  function drawSemiColumn(context: CanvasRenderingContext2D, position: number, note: number, pressed: boolean) {
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

  function noteToSpace(note: String) {
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
    throw new Error('invalid note');
  }

  function charNoteToNumber(note: String) {
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
    throw new Error('invalid note')
  }

  function drawSheets() {

    const canvas = sheetsRef.current;
    if (!canvas) {
      return;
    }
    const context = canvas.getContext("2d");
    if (!context) {
      return;
    }

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

      drawSemiColumn(context, 100 + (r.position * 60), 170 - (noteToSpace(note) * (spaceBetween / 2)), !!r.pressed);
    }

  }



  React.useEffect(() => {
    const piano = pianoRef.current;
    const sheets = sheetsRef.current;

    if (!piano || !sheets) {
      return;
    }

    navigator.requestMIDIAccess().then(onMIDISuccess, onMIDIFailure);

    draw();
    drawSheets();

  }, []);

  return (
    <View style={styles.container}>
      {/* <Text>Open up App.tsx to start working on your appaa!</Text>
      <StatusBar style="auto" /> */}
      <canvas id="piano" width="1125" height="165" ref={pianoRef}></canvas>
      <canvas id="sheets" width="1125" height="600" ref={sheetsRef}></canvas>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
