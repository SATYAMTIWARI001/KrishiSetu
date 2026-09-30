import { useRef, useMemo, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Sky, Environment, Float, Text, Html } from '@react-three/drei';
import * as THREE from 'three';

/* ─── colour palettes per crop ─── */
const cropPalettes = {
  Wheat:      { blade: '#b8a940', tip: '#e6cc61', soil: '#8a6d3b', row: '#9e8b3e' },
  Rice:       { blade: '#5da35d', tip: '#8ecf7a', soil: '#7a6942', row: '#6b9e5a' },
  Cotton:     { blade: '#5e9e5e', tip: '#e8e8e0', soil: '#8a6d3b', row: '#78a870' },
  Maize:      { blade: '#4e8e3a', tip: '#d4c84a', soil: '#8a6d3b', row: '#5a9e42' },
  Sugarcane:  { blade: '#3a7e42', tip: '#6eae52', soil: '#7a6942', row: '#4a8e4a' },
  Vegetables: { blade: '#4e9e4a', tip: '#82c862', soil: '#8a6d3b', row: '#5a8e42' },
  Onion:      { blade: '#5a9e58', tip: '#98b878', soil: '#8a6d3b', row: '#688e58' },
};

const stageScales = { Seedling: 0.3, Vegetative: 0.6, Flowering: 0.85, Maturity: 1.0 };

/* ─── Terrain ground plane ─── */
function Terrain({ fieldWidth, fieldDepth }) {
  const geo = useMemo(() => {
    const g = new THREE.PlaneGeometry(fieldWidth * 2.2, fieldDepth * 2.2, 64, 64);
    const pos = g.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const z = pos.getY(i);
      pos.setZ(i, (Math.sin(x * 0.15) * Math.cos(z * 0.12) * 0.25) + (Math.random() * 0.05));
    }
    g.computeVertexNormals();
    return g;
  }, [fieldWidth, fieldDepth]);

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]} receiveShadow>
      <primitive object={geo} attach="geometry" />
      <meshStandardMaterial color="#6b8c42" roughness={0.95} />
    </mesh>
  );
}

/* ─── Field soil plot ─── */
function FieldPlot({ width, depth }) {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]} receiveShadow>
      <planeGeometry args={[width, depth, 32, 32]} />
      <meshStandardMaterial color="#9e7e4a" roughness={0.92} />
    </mesh>
  );
}

/* ─── Crop furrow rows visible on soil ─── */
function SoilFurrows({ width, depth, rowCount }) {
  const furrows = useMemo(() => {
    const items = [];
    const spacing = depth / (rowCount + 1);
    for (let i = 1; i <= rowCount; i++) {
      items.push(
        <mesh key={`furrow-${i}`} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, -depth / 2 + i * spacing]} receiveShadow>
          <planeGeometry args={[width * 0.92, 0.12]} />
          <meshStandardMaterial color="#7a5e32" roughness={1} transparent opacity={0.5} />
        </mesh>
      );
    }
    return items;
  }, [width, depth, rowCount]);
  return <>{furrows}</>;
}

/* ─── Single crop plant (instanced blade of grass / wheat stalk) ─── */
function CropBlade({ position, scale, palette, stage, delay }) {
  const ref = useRef();
  const seed = useMemo(() => Math.random() * Math.PI * 2, []);

  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.elapsedTime + seed + delay;
    ref.current.rotation.z = Math.sin(t * 0.8) * 0.06 * scale;
    ref.current.rotation.x = Math.cos(t * 0.6) * 0.04 * scale;
  });

  const height = 0.55 * scale + 0.1;
  const tipSize = stage === 'Flowering' || stage === 'Maturity' ? 0.1 * scale : 0.04;

  return (
    <group ref={ref} position={position}>
      {/* Main stalk */}
      <mesh position={[0, height / 2, 0]} castShadow>
        <cylinderGeometry args={[0.016 * scale, 0.022 * scale, height, 4]} />
        <meshStandardMaterial color={palette.blade} roughness={0.7} />
      </mesh>
      {/* Leaf blades */}
      <mesh position={[0.03, height * 0.4, 0]} rotation={[0, 0, -0.4]}>
        <boxGeometry args={[0.12 * scale, 0.01, 0.025 * scale]} />
        <meshStandardMaterial color={palette.blade} roughness={0.65} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[-0.025, height * 0.6, 0.02]} rotation={[0.2, 0.5, 0.3]}>
        <boxGeometry args={[0.1 * scale, 0.01, 0.022 * scale]} />
        <meshStandardMaterial color={palette.blade} roughness={0.65} side={THREE.DoubleSide} />
      </mesh>
      {/* Grain head / flower tip */}
      {(stage === 'Flowering' || stage === 'Maturity') && (
        <mesh position={[0, height + tipSize * 0.4, 0]} castShadow>
          <sphereGeometry args={[tipSize, 6, 4]} />
          <meshStandardMaterial color={palette.tip} roughness={0.6} />
        </mesh>
      )}
    </group>
  );
}

/* ─── Crop rows generator ─── */
function CropField({ width, depth, crop, stage }) {
  const palette = cropPalettes[crop] || cropPalettes.Wheat;
  const scale = stageScales[stage] || 0.6;
  const rowCount = 14;
  const plantsPerRow = 22;

  const plants = useMemo(() => {
    const items = [];
    const rowSpacing = depth / (rowCount + 1);
    const plantSpacing = width / (plantsPerRow + 1);
    for (let r = 1; r <= rowCount; r++) {
      for (let p = 1; p <= plantsPerRow; p++) {
        const x = -width / 2 + p * plantSpacing + (Math.random() - 0.5) * 0.08;
        const z = -depth / 2 + r * rowSpacing + (Math.random() - 0.5) * 0.06;
        items.push(
          <CropBlade
            key={`${r}-${p}`}
            position={[x, 0, z]}
            scale={scale + (Math.random() - 0.5) * 0.12}
            palette={palette}
            stage={stage}
            delay={r * 0.3 + p * 0.15}
          />
        );
      }
    }
    return items;
  }, [width, depth, crop, stage, rowCount, plantsPerRow, scale, palette]);

  return <>{plants}</>;
}

/* ─── Field boundary posts and wire ─── */
function FieldBoundary({ width, depth }) {
  const posts = useMemo(() => {
    const items = [];
    const postPositions = [
      [-width / 2, 0, -depth / 2], [width / 2, 0, -depth / 2],
      [-width / 2, 0, depth / 2], [width / 2, 0, depth / 2],
      [0, 0, -depth / 2], [0, 0, depth / 2],
      [-width / 2, 0, 0], [width / 2, 0, 0],
    ];
    postPositions.forEach(([x, , z], i) => {
      items.push(
        <mesh key={`post-${i}`} position={[x, 0.15, z]} castShadow>
          <cylinderGeometry args={[0.02, 0.025, 0.35, 6]} />
          <meshStandardMaterial color="#5a3e22" roughness={0.9} />
        </mesh>
      );
    });
    return items;
  }, [width, depth]);

  /* Wire/fence using a line loop */
  const wirePoints = useMemo(() => {
    const hw = width / 2; const hd = depth / 2;
    return [
      new THREE.Vector3(-hw, 0.28, -hd), new THREE.Vector3(hw, 0.28, -hd),
      new THREE.Vector3(hw, 0.28, hd), new THREE.Vector3(-hw, 0.28, hd),
      new THREE.Vector3(-hw, 0.28, -hd),
    ];
  }, [width, depth]);

  const lineGeo = useMemo(() => new THREE.BufferGeometry().setFromPoints(wirePoints), [wirePoints]);

  return (
    <>
      {posts}
      <lineLoop geometry={lineGeo}>
        <lineBasicMaterial color="#8a6e42" linewidth={1} />
      </lineLoop>
    </>
  );
}

/* ─── Field pathway ─── */
function Pathway({ width, depth }) {
  return (
    <>
      {/* Main path down the middle */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0.15, 0.015, 0]} receiveShadow>
        <planeGeometry args={[0.28, depth * 0.94]} />
        <meshStandardMaterial color="#c8aa72" roughness={0.95} transparent opacity={0.7} />
      </mesh>
      {/* Cross path */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.015, depth * 0.12]} receiveShadow>
        <planeGeometry args={[width * 0.94, 0.22]} />
        <meshStandardMaterial color="#c8aa72" roughness={0.95} transparent opacity={0.6} />
      </mesh>
    </>
  );
}

/* ─── Irrigation lines (drip) ─── */
function IrrigationLines({ width, depth, show }) {
  if (!show) return null;
  const lines = useMemo(() => {
    const items = [];
    const count = 6;
    const spacing = depth / (count + 1);
    for (let i = 1; i <= count; i++) {
      items.push(
        <mesh key={`irr-${i}`} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.025, -depth / 2 + i * spacing]} receiveShadow>
          <planeGeometry args={[width * 0.88, 0.03]} />
          <meshStandardMaterial color="#5aafcf" roughness={0.5} transparent opacity={0.6} emissive="#3a8eaf" emissiveIntensity={0.15} />
        </mesh>
      );
    }
    return items;
  }, [width, depth]);
  return <>{lines}</>;
}

/* ─── Trees around field edges ─── */
function TreeModel({ position, scale: s = 1 }) {
  const ref = useRef();
  const seed = useMemo(() => Math.random() * 100, []);
  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.elapsedTime + seed;
    ref.current.rotation.z = Math.sin(t * 0.3) * 0.02;
  });

  return (
    <group ref={ref} position={position}>
      {/* Trunk */}
      <mesh position={[0, 0.25 * s, 0]} castShadow>
        <cylinderGeometry args={[0.04 * s, 0.06 * s, 0.5 * s, 6]} />
        <meshStandardMaterial color="#6e4a2a" roughness={0.9} />
      </mesh>
      {/* Canopy layers */}
      <mesh position={[0, 0.55 * s, 0]} castShadow>
        <sphereGeometry args={[0.28 * s, 8, 6]} />
        <meshStandardMaterial color="#3a6e2a" roughness={0.75} />
      </mesh>
      <mesh position={[0.08 * s, 0.68 * s, 0.05 * s]} castShadow>
        <sphereGeometry args={[0.2 * s, 7, 5]} />
        <meshStandardMaterial color="#4a8e3a" roughness={0.75} />
      </mesh>
    </group>
  );
}

function FieldTrees({ width, depth }) {
  const trees = useMemo(() => {
    const items = [];
    const hw = width / 2 + 0.5;
    const hd = depth / 2 + 0.5;
    const positions = [
      [-hw, 0, -hd * 0.7], [-hw - 0.3, 0, hd * 0.2], [-hw + 0.1, 0, hd * 0.8],
      [hw + 0.2, 0, -hd * 0.5], [hw, 0, hd * 0.4], [hw + 0.35, 0, hd * 0.9],
      [-hw * 0.3, 0, -hd - 0.3], [hw * 0.5, 0, -hd - 0.2],
      [-hw * 0.6, 0, hd + 0.4], [hw * 0.2, 0, hd + 0.3],
    ];
    positions.forEach(([x, y, z], i) => {
      items.push(<TreeModel key={`tree-${i}`} position={[x, y, z]} scale={0.8 + Math.random() * 0.5} />);
    });
    return items;
  }, [width, depth]);
  return <>{trees}</>;
}

/* ─── Dimension labels ─── */
function DimensionLabels({ width, depth, dimensions, dimUnit }) {
  if (!dimensions) {
    return (
      <Html position={[0, 0.6, depth / 2 + 0.6]} center>
        <div style={{
          padding: '6px 14px', borderRadius: '20px', fontSize: '11px', fontWeight: 800,
          background: 'rgba(21,48,32,0.78)', color: 'rgba(255,255,255,0.9)',
          whiteSpace: 'nowrap', letterSpacing: '0.06em', fontFamily: 'Manrope, sans-serif',
        }}>Dimensions not added</div>
      </Html>
    );
  }
  return (
    <>
      <Html position={[0, 0.05, depth / 2 + 0.35]} center>
        <div style={{
          padding: '4px 12px', borderRadius: '16px', fontSize: '11px', fontWeight: 800,
          background: 'rgba(21,48,32,0.78)', color: 'rgba(255,255,255,0.9)',
          whiteSpace: 'nowrap', letterSpacing: '0.06em', fontFamily: 'Manrope, sans-serif',
        }}>{dimensions.length} {dimUnit}</div>
      </Html>
      <Html position={[width / 2 + 0.35, 0.05, 0]} center>
        <div style={{
          padding: '4px 12px', borderRadius: '16px', fontSize: '11px', fontWeight: 800,
          background: 'rgba(21,48,32,0.78)', color: 'rgba(255,255,255,0.9)',
          whiteSpace: 'nowrap', letterSpacing: '0.06em', fontFamily: 'Manrope, sans-serif',
        }}>{dimensions.width} {dimUnit}</div>
      </Html>
    </>
  );
}

/* ─── Health overlay zones ─── */
function HealthOverlay({ width, depth, show }) {
  if (!show) return null;
  return (
    <>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-width * 0.2, 0.03, -depth * 0.2]} receiveShadow>
        <circleGeometry args={[width * 0.22, 24]} />
        <meshStandardMaterial color="#2d874a" transparent opacity={0.18} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[width * 0.25, 0.03, depth * 0.15]} receiveShadow>
        <circleGeometry args={[width * 0.16, 24]} />
        <meshStandardMaterial color="#b87823" transparent opacity={0.2} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, depth * 0.3]} receiveShadow>
        <circleGeometry args={[width * 0.14, 24]} />
        <meshStandardMaterial color="#347f85" transparent opacity={0.18} />
      </mesh>
      {/* Zone labels */}
      <Html position={[-width * 0.2, 0.45, -depth * 0.2]} center>
        <span style={{ padding: '3px 8px', borderRadius: '12px', fontSize: '9px', fontWeight: 900, background: 'rgba(44,119,67,0.82)', color: '#fff', fontFamily: 'Manrope, sans-serif', letterSpacing: '0.06em' }}>HEALTHY</span>
      </Html>
      <Html position={[width * 0.25, 0.45, depth * 0.15]} center>
        <span style={{ padding: '3px 8px', borderRadius: '12px', fontSize: '9px', fontWeight: 900, background: 'rgba(177,128,38,0.88)', color: '#fff', fontFamily: 'Manrope, sans-serif', letterSpacing: '0.06em' }}>MONITOR</span>
      </Html>
      <Html position={[0, 0.45, depth * 0.3]} center>
        <span style={{ padding: '3px 8px', borderRadius: '12px', fontSize: '9px', fontWeight: 900, background: 'rgba(53,124,126,0.85)', color: '#fff', fontFamily: 'Manrope, sans-serif', letterSpacing: '0.06em' }}>GOOD MOISTURE</span>
      </Html>
    </>
  );
}

/* ─── Observation markers ─── */
function ObservationMarkers({ width, depth, observations, onSelect }) {
  return observations.map((obs) => {
    const x = (obs.x / 100 - 0.5) * width;
    const z = (obs.y / 100 - 0.5) * depth;
    const colours = { healthy: '#2d874a', watch: '#b87823', good: '#347f85' };
    return (
      <Html key={obs.id} position={[x, 0.55, z]} center>
        <button
          onClick={(e) => { e.stopPropagation(); onSelect(obs); }}
          style={{
            width: 26, height: 26, borderRadius: '50%', border: '2px solid #fff',
            background: colours[obs.tone] || '#2d874a', color: '#fff', fontSize: '11px',
            cursor: 'pointer', display: 'grid', placeItems: 'center',
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)', fontFamily: 'Manrope, sans-serif', fontWeight: 900,
          }}
          title={obs.title}
        >{obs.id}</button>
      </Html>
    );
  });
}

/* ─── Sun light animation ─── */
function SunLight() {
  const ref = useRef();
  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.elapsedTime * 0.05;
    ref.current.position.x = Math.cos(t) * 8;
    ref.current.position.z = Math.sin(t) * 6;
  });
  return (
    <directionalLight ref={ref} position={[6, 8, 4]} intensity={1.8} castShadow
      shadow-mapSize-width={1024} shadow-mapSize-height={1024}
      shadow-camera-far={30} shadow-camera-left={-6} shadow-camera-right={6}
      shadow-camera-top={6} shadow-camera-bottom={-6}
    />
  );
}




/* ─── Field controls with camera sync ─── */
function FieldControls({ is2D }) {
  const controlsRef = useRef();
  const { camera } = useThree();

  useEffect(() => {
    if (!controlsRef.current) return;
    if (is2D) {
      camera.position.set(0, 14, 0.01);
    } else {
      camera.position.set(5, 3.5, 5.5);
    }
    controlsRef.current.target.set(0, 0, 0);
    controlsRef.current.update();
  }, [is2D, camera]);

  return (
    <OrbitControls
      ref={controlsRef}
      enableDamping dampingFactor={0.08}
      minDistance={3} maxDistance={20}
      minPolarAngle={0.1} maxPolarAngle={Math.PI / 2.1}
      target={[0, 0, 0]}
      enablePan
    />
  );
}

/* ─── Main scene ─── */
export default function Field3DScene({
  crop = 'Wheat',
  stage = 'Flowering',
  irrigation = 'Drip',
  healthOverlay = true,
  view = '3d',
  observations = [],
  onSelectObservation,
  dimensions = null,
  dimUnit = 'ft',
  selectedPhotoMarker = null,
}) {
  const fieldWidth = 6;
  const fieldDepth = 5;
  const showIrrigation = irrigation.toLowerCase().includes('drip') || irrigation.toLowerCase().includes('sprinkler');

  return (
    <Canvas
      shadows
      camera={{ position: [5, 3.5, 5.5], fov: 55, near: 0.1, far: 200 }}
      gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.2 }}
      style={{ width: '100%', height: '100%', touchAction: 'none' }}
    >
      {/* Lighting */}
      <ambientLight intensity={0.5} color="#f5ecd8" />
      <SunLight />
      <hemisphereLight args={['#87ceeb', '#4a6e2a', 0.4]} />

      {/* Sky */}
      <Sky sunPosition={[80, 15, 40]} turbidity={10} rayleigh={0.4} mieCoefficient={0.002} mieDirectionalG={0.8} />

      {/* Controls with camera sync */}
      <FieldControls is2D={view === '2d'} />

      {/* Scene objects */}
      <Terrain fieldWidth={fieldWidth} fieldDepth={fieldDepth} />
      <FieldPlot width={fieldWidth} depth={fieldDepth} />
      <SoilFurrows width={fieldWidth} depth={fieldDepth} rowCount={14} />
      <FieldBoundary width={fieldWidth} depth={fieldDepth} />
      <Pathway width={fieldWidth} depth={fieldDepth} />
      <IrrigationLines width={fieldWidth} depth={fieldDepth} show={showIrrigation} />
      <CropField width={fieldWidth} depth={fieldDepth} crop={crop} stage={stage} />
      <FieldTrees width={fieldWidth} depth={fieldDepth} />
      <HealthOverlay width={fieldWidth} depth={fieldDepth} show={healthOverlay} />
      <DimensionLabels width={fieldWidth} depth={fieldDepth} dimensions={dimensions} dimUnit={dimUnit} />

      {observations.length > 0 && (
        <ObservationMarkers
          width={fieldWidth} depth={fieldDepth}
          observations={observations}
          onSelect={onSelectObservation || (() => {})}
        />
      )}

      {selectedPhotoMarker && (
        <Html position={[(selectedPhotoMarker.x / 100 - 0.5) * fieldWidth, 0.6, (selectedPhotoMarker.y / 100 - 0.5) * fieldDepth]} center>
          <span style={{
            width: 24, height: 24, borderRadius: '50%', border: '2px solid #fff',
            background: '#784f9b', color: '#fff', fontSize: '11px', display: 'grid', placeItems: 'center',
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
          }}>📸</span>
        </Html>
      )}
    </Canvas>
  );
}

