import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Box, Sphere, Grid, Text } from '@react-three/drei';

const useThemeMode = () => {
  const [isLight, setIsLight] = useState(document.documentElement.getAttribute('data-theme') === 'light');
  
  useEffect(() => {
    const handleTheme = () => {
      setIsLight(document.documentElement.getAttribute('data-theme') === 'light');
    };
    window.addEventListener('themechange', handleTheme);
    return () => window.removeEventListener('themechange', handleTheme);
  }, []);
  
  return isLight;
};

const TagMarker = ({ position, id, isActive, textColor }) => {
  return (
    <group position={position}>
      <Sphere args={[0.1, 16, 16]}>
        <meshStandardMaterial color={isActive ? "#10b981" : "#3b82f6"} emissive={isActive ? "#10b981" : "#000000"} emissiveIntensity={0.5} />
      </Sphere>
      <Text position={[0, 0.2, 0]} fontSize={0.15} color={textColor} anchorX="center" anchorY="middle">
        {id}
      </Text>
    </group>
  );
};

const ReaderMarker = ({ position }) => {
  return (
    <group position={position}>
      <Box args={[0.3, 0.3, 0.3]}>
        <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={0.2} />
      </Box>
      <Text position={[0, 0.3, 0]} fontSize={0.2} color="#ef4444" anchorX="center" anchorY="middle">
        READER
      </Text>
    </group>
  );
};

const Scene3DContent = ({ tags, readerPos }) => {
  // Use current time to flash active tags
  const now = Date.now() / 1000;
  const isLight = useThemeMode();

  const gridSectionColor = isLight ? "#94a3b8" : "#334155";
  const gridCellColor = isLight ? "#cbd5e1" : "#1e293b";
  const textColor = isLight ? "#0f172a" : "#ffffff";

  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 10, 5]} intensity={1} />
      <Grid infiniteGrid fadeDistance={20} sectionColor={gridSectionColor} cellColor={gridCellColor} />
      
      {/* Center of room visualization */}
      <axesHelper args={[2]} />

      {/* Render Tags */}
      {Object.values(tags).map((tag) => {
        if (!tag.estimated_tag_position) return null;
        // Consider active if seen in the last 2 seconds
        const isActive = (now - tag.timestamp) < 2;
        return (
          <TagMarker 
            key={tag.tag_id} 
            id={tag.tag_id}
            position={[tag.estimated_tag_position.x, tag.estimated_tag_position.y, tag.estimated_tag_position.z]} 
            isActive={isActive}
            textColor={textColor}
          />
        );
      })}

      {/* Render Reader */}
      {readerPos && (
        <ReaderMarker position={[readerPos.x, readerPos.y, readerPos.z]} />
      )}

      <OrbitControls makeDefault />
    </>
  );
};

const Scene3D = ({ tags, readerPos, fullHeight = false }) => {
  return (
    <div className={`glass-panel w-full ${fullHeight ? 'h-[calc(100vh-200px)] min-h-[500px]' : 'h-[500px]'} overflow-hidden relative`}>
      <div className="absolute top-4 left-4 z-10 bg-surface/80 p-2 rounded text-xs text-slate-300 backdrop-blur-md border border-slate-700">
        <span className="flex items-center gap-2"><div className="w-3 h-3 bg-red-500 rounded-sm"></div> Reader</span>
        <span className="flex items-center gap-2 mt-1"><div className="w-3 h-3 bg-blue-500 rounded-full"></div> Tag</span>
        <span className="flex items-center gap-2 mt-1"><div className="w-3 h-3 bg-emerald-500 rounded-full"></div> Active Tag</span>
      </div>
      <Canvas camera={{ position: [5, 5, 5], fov: 50 }}>
        <Scene3DContent tags={tags} readerPos={readerPos} />
      </Canvas>
    </div>
  );
};

export default Scene3D;
