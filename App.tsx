import React, { useEffect } from 'react';
// import { StatusBar } from 'expo-status-bar';
import { Button, StyleSheet, Text, View } from 'react-native';
// import { Canvas, Rect, Circle } from "@shopify/react-native-skia";
import Piano from './src/components/Piano';


export default function App() {

    return (
        <View style={{ flex: 1 }}>
            <Piano></Piano>
        </View >
    );
}
