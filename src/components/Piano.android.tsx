import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { Button, StyleSheet, Text, View } from 'react-native';
import { Canvas, Rect, Circle } from "@shopify/react-native-skia";


export default function Piano() {

    const [height, setHeight] = React.useState<number>(300);

    useEffect(() => {
        setTimeout(() => {
            setHeight(height - 1);
        }, 100)
    }, []);

    useEffect(() => {
        setTimeout(() => {
            setHeight(height - 1);
        }, 100)
    }, [height]);

    return (
        <View style={{ flex: 1 }}>
            <Canvas style={{ flex: 1, backgroundColor: "white" }}>
                <Circle cx={height} cy={400} color="red" r={100} />
            </Canvas>
        </View >
    );
}
