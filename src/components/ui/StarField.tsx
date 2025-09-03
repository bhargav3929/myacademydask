"use client";

import { Canvas } from "@react-three/fiber";
import { Stars } from "@react-three/drei";

const StarField = () => (
  <Canvas>
    <Stars radius={50} count={2500} factor={4} fade speed={2} />
  </Canvas>
);

export default StarField;
