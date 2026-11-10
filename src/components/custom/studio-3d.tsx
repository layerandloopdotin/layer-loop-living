// Browser-only 3D views for the Custom Studio page. Loaded lazily behind <ClientOnly>.
import { Canvas, useFrame } from "@react-three/fiber";
import { ContactShadows, Environment, Lightformer, OrbitControls } from "@react-three/drei";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { type Design, wallLoops } from "@/lib/custom";

const SEG = 160;
const RINGS = 90;

function hash(x: number, y: number) {
  const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
  return s - Math.floor(s);
}

function profile(form: Design["form"], t: number, taper: number) {
  switch (form) {
    case "pendant": return (0.3 + 0.7 * Math.sin(Math.PI * (0.08 + t * 0.62))) * (1 - taper * 0.3 * (1 - t));
    case "table-lamp": return (0.85 + 0.15 * Math.sin(Math.PI * t)) * (1 - taper * 0.45 * t);
    case "vase": return (0.55 + 0.45 * Math.sin(Math.PI * (0.15 + t * 0.85))) * (1 - taper * 0.4 * t) + (t > 0.9 ? (t - 0.9) * 2 : 0);
    case "planter": return (0.82 + 0.18 * t) * (1 - taper * 0.2 * (1 - t));
    case "stack": return (0.72 + 0.28 * Math.sin(Math.PI * t)) * (1 - taper * 0.2 * t);
  }
}

/** One printed module: ribbed, twisted, fuzzy-skinned surface of revolution. */
function buildGeometry(d: Design, inset = 0) {
  const h = d.height / 10;
  const R = d.width / 20;
  const pos: number[] = [];
  const uv: number[] = [];
  for (let j = 0; j <= RINGS; j++) {
    const t = j / RINGS;
    const base = R * profile(d.form, t, d.taper);
    for (let i = 0; i <= SEG; i++) {
      const a = (i / SEG) * Math.PI * 2;
      const rib = Math.cos(d.layers * a + d.twist * t * Math.PI * 4) * 0.035;
      const fuzz = inset ? 0 : (hash(i, j) - 0.5) * d.fuzzy * 0.09;
      const layerLine = Math.sin(t * RINGS * Math.PI) * 0.004;
      const r = Math.max(0.05, base * (1 + rib + fuzz + layerLine) - inset);
      pos.push(Math.cos(a) * r, t * h, Math.sin(a) * r);
      uv.push(i / SEG, t);
    }
  }
  const idx: number[] = [];
  for (let j = 0; j < RINGS; j++)
    for (let i = 0; i < SEG; i++) {
      const a = j * (SEG + 1) + i, b = a + SEG + 1;
      idx.push(a, b, a + 1, b, b + 1, a + 1);
    }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
  g.setIndex(idx);
  g.computeVertexNormals();
  return g;
}

function Piece({ d, spin }: { d: Design; spin: boolean }) {
  const group = useRef<THREE.Group>(null);
  const loops = wallLoops(d);
  const outer = useMemo(() => buildGeometry(d), [d]);
  const inner = useMemo(() => buildGeometry(d, 0.012 * loops), [d, loops]);
  const modules = d.form === "stack" ? d.stack : 1;
  const h = d.height / 10;
  const lit = d.light && (d.form === "pendant" || d.form === "table-lamp" || d.form === "stack");
  const glow = d.warm ? "#ffb066" : "#fff1dc";
  useFrame((_, dt) => { if (spin && group.current) group.current.rotation.y += Math.min(dt, 0.05) * 0.35; });
  const total = h * modules;
  return (
    <group ref={group} position={[0, -total / 2, 0]}>
      {Array.from({ length: modules }).map((_, m) => (
        <group key={m} position={[0, m * h, 0]}>
          <mesh geometry={outer} castShadow>
            <meshStandardMaterial color={d.color} roughness={0.55 + d.fuzzy * 0.4} metalness={0} side={THREE.FrontSide}
              emissive={lit ? glow : "#000"} emissiveIntensity={lit ? 0.18 : 0} />
          </mesh>
          <mesh geometry={inner}>
            <meshStandardMaterial color={lit ? glow : d.color} roughness={0.9} side={THREE.BackSide}
              emissive={lit ? glow : "#000"} emissiveIntensity={lit ? 1.4 : 0} />
          </mesh>
        </group>
      ))}
      {lit && <pointLight position={[0, total / 2, 0]} intensity={6} distance={8} color={glow} />}
      {d.form === "pendant" && <mesh position={[0, total + 1.5, 0]}><cylinderGeometry args={[0.015, 0.015, 3]} /><meshStandardMaterial color="#222" /></mesh>}
    </group>
  );
}

function Lights() {
  return (
    <>
      <ambientLight intensity={0.35} />
      <directionalLight position={[3, 5, 4]} intensity={1.6} castShadow />
      <Environment resolution={64}>
        <Lightformer intensity={2} position={[0, 5, 0]} scale={[10, 10, 1]} />
        <Lightformer intensity={1} color="#e8cdb0" position={[-5, 1, -1]} rotation-y={Math.PI / 2} scale={[20, 1, 1]} />
      </Environment>
    </>
  );
}

export function StudioModel({ design, spin = false, interactive = true }: { design: Design; spin?: boolean; interactive?: boolean }) {
  const modules = design.form === "stack" ? design.stack : 1;
  const tall = (design.height / 10) * modules;
  const dist = Math.max(4.5, tall * 1.5, design.width / 4);
  const ref = useRef<HTMLDivElement>(null);
  return (
    <div ref={ref} className="h-full w-full" data-scene-ready>
      <Canvas shadows dpr={[1, 1.75]} camera={{ position: [0, tall * 0.15, dist], fov: 38 }} gl={{ antialias: true, alpha: true }}>
        <Lights />
        <Piece d={design} spin={spin} />
        <ContactShadows position={[0, -tall / 2 - 0.01, 0]} opacity={0.5} blur={2.4} scale={8} />
        {interactive && <OrbitControls enablePan={false} minDistance={2.5} maxDistance={18} autoRotate={!spin} autoRotateSpeed={0.6} />}
      </Canvas>
    </div>
  );
}

/** Lithophane-style relief: brightness of the photo pushes the surface out. */
function Relief({ src, depth, color }: { src: string; depth: number; color: string }) {
  const [data, setData] = useState<{ tex: THREE.Texture; geo: THREE.PlaneGeometry } | null>(null);
  useEffect(() => {
    const im = new Image();
    im.onload = () => {
      const N = 140;
      const aspect = im.width / im.height;
      const w = aspect >= 1 ? 4 : 4 * aspect, h = aspect >= 1 ? 4 / aspect : 4;
      const c = document.createElement("canvas");
      c.width = N; c.height = N;
      const ctx = c.getContext("2d")!;
      ctx.drawImage(im, 0, 0, N, N);
      const px = ctx.getImageData(0, 0, N, N).data;
      const geo = new THREE.PlaneGeometry(w, h, N - 1, N - 1);
      const p = geo.getAttribute("position");
      for (let i = 0; i < p.count; i++) {
        const k = i * 4;
        const lum = ((px[k] ?? 0) * 0.299 + (px[k + 1] ?? 0) * 0.587 + (px[k + 2] ?? 0) * 0.114) / 255;
        p.setZ(i, lum * depth);
      }
      geo.computeVertexNormals();
      const tex = new THREE.Texture(im);
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.needsUpdate = true;
      setData({ tex, geo });
    };
    im.src = src;
  }, [src, depth]);
  if (!data) return null;
  return (
    <mesh geometry={data.geo} rotation={[-0.25, 0, 0]}>
      <meshStandardMaterial color={color} map={data.tex} roughness={0.7} side={THREE.DoubleSide} />
    </mesh>
  );
}

export function PhotoRelief({ src, depth, color, tinted }: { src: string; depth: number; color: string; tinted: boolean }) {
  return (
    <div className="h-full w-full" data-scene-ready>
      <Canvas dpr={[1, 1.75]} camera={{ position: [0, 0.6, 5.2], fov: 40 }} gl={{ alpha: true }}>
        <Lights />
        <Relief src={src} depth={depth} color={tinted ? color : "#ffffff"} />
        <OrbitControls enablePan={false} autoRotate autoRotateSpeed={0.8} minDistance={3} maxDistance={10} />
      </Canvas>
    </div>
  );
}
