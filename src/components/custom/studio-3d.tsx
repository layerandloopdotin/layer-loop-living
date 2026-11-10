// Browser-only 3D views for the Custom Studio page. Loaded lazily behind <ClientOnly>.
import { Canvas, useFrame, useThree, type ThreeEvent } from "@react-three/fiber";
import { ContactShadows, Environment, Lightformer, OrbitControls } from "@react-three/drei";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { type Design, type PhotoMode, type PhotoObject, type ShapeId, type TouchPoint, parts, pinch, wallLoops } from "@/lib/custom";

const SEG = 160;
const RINGS = 90;

function hash(x: number, y: number) {
  const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
  return s - Math.floor(s);
}

function formProfile(form: Design["form"], t: number, taper: number) {
  switch (form) {
    case "pendant": { const u = 1 - t; return (0.3 + 0.7 * Math.sin(Math.PI * (0.08 + u * 0.62))) * (1 - taper * 0.3 * t); } // narrow end up, to the cord
    case "table-lamp": return (0.85 + 0.15 * Math.sin(Math.PI * t)) * (1 - taper * 0.45 * t);
    case "vase": return (0.55 + 0.45 * Math.sin(Math.PI * (0.15 + t * 0.85))) * (1 - taper * 0.4 * t) + (t > 0.9 ? (t - 0.9) * 2 : 0);
    case "planter": return (0.82 + 0.18 * t) * (1 - taper * 0.2 * (1 - t));
    case "stack": return (0.72 + 0.28 * Math.sin(Math.PI * t)) * (1 - taper * 0.2 * t);
  }
}

function shapeProfile(shape: ShapeId, d: Design, t: number) {
  switch (shape) {
    case "classic": return formProfile(d.form, t, d.taper);
    case "cylinder": return 1;
    case "sphere": return Math.max(0.12, Math.sqrt(Math.max(0, 1 - (2 * t - 1) ** 2)));
    case "cone": return 1 - 0.45 * t;
    case "dome": return Math.max(0.1, Math.sqrt(Math.max(0, 1 - t * t)));
    default: return 1;
  }
}

/** One printed lathe part: ribbed (vertical + horizontal), twisted, fuzzy-skinned surface of revolution. */
function buildLathe(d: Design, shape: ShapeId, hCm: number, wCm: number, points: TouchPoint[], inset = 0) {
  const h = hCm / 10, R = wCm / 20;
  const twist = (d.twist * Math.PI) / 180;
  const pos: number[] = [];
  for (let j = 0; j <= RINGS; j++) {
    const t = j / RINGS;
    const base = R * shapeProfile(shape, d, t) * pinch(points, t);
    for (let i = 0; i <= SEG; i++) {
      const a = (i / SEG) * Math.PI * 2;
      const rib = d.layers ? Math.cos(d.layers * a + twist * t) * 0.035 : 0;
      const hrib = d.hRibs ? Math.cos(d.hRibs * Math.PI * 2 * t) * 0.03 : 0;
      const fuzz = inset ? 0 : (hash(i, j) - 0.5) * d.fuzzy * 0.09;
      const layerLine = Math.sin(t * RINGS * Math.PI) * 0.004;
      const r = Math.max(0.05, base * (1 + rib + hrib + fuzz + layerLine) - inset);
      pos.push(Math.cos(a) * r, t * h, Math.sin(a) * r);
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
  g.setIndex(idx);
  g.computeVertexNormals();
  return g;
}

type PartProps = { d: Design; shape: ShapeId; h: number; w: number; color: string; points: TouchPoint[]; lit: boolean; glow: string };

function Part({ d, shape, h, w, color, points, lit, glow }: PartProps) {
  const loops = wallLoops(d);
  const lathe = shape !== "box" && shape !== "donut";
  const outer = useMemo(() => (lathe ? buildLathe(d, shape, h, w, points) : null), [d, shape, h, w, points, lathe]);
  const inner = useMemo(() => (lathe ? buildLathe(d, shape, h, w, points, 0.012 * loops) : null), [d, shape, h, w, points, loops, lathe]);
  const rough = 0.55 + d.fuzzy * 0.4;
  const H = h / 10, R = w / 20;
  const mat = <meshStandardMaterial color={color} roughness={rough} emissive={lit ? glow : "#000"} emissiveIntensity={lit ? 0.18 : 0} />;
  if (shape === "box") return <mesh position={[0, H / 2, 0]} castShadow><boxGeometry args={[R * 1.6, H, R * 1.6]} />{mat}</mesh>;
  if (shape === "donut") {
    const tube = Math.min(H / 2, R * 0.45);
    return <mesh position={[0, tube, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow><torusGeometry args={[R - tube, tube, 32, 96]} />{mat}</mesh>;
  }
  return (
    <>
      <mesh geometry={outer!} castShadow>{mat}</mesh>
      <mesh geometry={inner!}>
        <meshStandardMaterial color={lit ? glow : color} roughness={0.9} side={THREE.BackSide} emissive={lit ? glow : "#000"} emissiveIntensity={lit ? 1.4 : 0} />
      </mesh>
    </>
  );
}

/** Draggable touch-point handles, always turned to face the camera. */
function Handles({ d, y0, onPoints, setDragging }: { d: Design; y0: number; onPoints: (p: TouchPoint[]) => void; setDragging: (b: boolean) => void }) {
  const ref = useRef<THREE.Group>(null);
  const { camera } = useThree();
  const drag = useRef<number | null>(null);
  const [hover, setHover] = useState<number | null>(null);
  const h = d.height / 10, R = d.width / 20;
  useFrame(() => { if (ref.current) ref.current.rotation.y = Math.atan2(camera.position.x, camera.position.z); });
  const plane = useMemo(() => new THREE.Plane(), []);
  const hit = useMemo(() => new THREE.Vector3(), []);

  const move = (e: ThreeEvent<PointerEvent>) => {
    const i = drag.current;
    if (i === null || !ref.current) return;
    const n = new THREE.Vector3(camera.position.x, 0, camera.position.z).normalize();
    const origin = new THREE.Vector3(); ref.current.getWorldPosition(origin);
    plane.setFromNormalAndCoplanarPoint(n, origin);
    if (!e.ray.intersectPlane(plane, hit)) return;
    const local = ref.current.worldToLocal(hit.clone());
    const t = Math.min(0.92, Math.max(0.08, (local.y - y0) / h));
    const s = Math.min(1.6, Math.max(0.25, Math.abs(local.x) / Math.max(0.01, R * formProfile(d.form, t, d.taper))));
    onPoints(d.points.map((p, k) => (k === i ? { t: +t.toFixed(3), s: +s.toFixed(3) } : p)));
  };

  return (
    <group ref={ref}>
      {d.points.map((p, i) => {
        const r = R * formProfile(d.form, p.t, d.taper) * pinch(d.points, p.t) * 1.08 + 0.06;
        return (
          <mesh key={i} position={[r, y0 + p.t * h, 0]} renderOrder={10}
            onPointerOver={(e) => { e.stopPropagation(); setHover(i); document.body.style.cursor = "grab"; }}
            onPointerOut={() => { setHover(null); if (drag.current === null) document.body.style.cursor = ""; }}
            onPointerDown={(e) => { e.stopPropagation(); (e.target as unknown as Element).setPointerCapture?.(e.pointerId); drag.current = i; setDragging(true); document.body.style.cursor = "grabbing"; }}
            onPointerMove={move}
            onPointerUp={(e) => { (e.target as unknown as Element).releasePointerCapture?.(e.pointerId); drag.current = null; setDragging(false); document.body.style.cursor = ""; }}>
            <sphereGeometry args={[hover === i ? 0.13 : 0.1, 20, 20]} />
            <meshBasicMaterial color={hover === i ? "#ffffff" : "#ffb066"} depthTest={false} transparent opacity={0.95} />
          </mesh>
        );
      })}
    </group>
  );
}

function Piece({ d, spin, onPoints, setDragging }: { d: Design; spin: boolean; onPoints?: (p: TouchPoint[]) => void; setDragging: (b: boolean) => void }) {
  const group = useRef<THREE.Group>(null);
  const ps = parts(d);
  const lit = d.light && (d.form === "pendant" || d.form === "table-lamp" || d.form === "stack");
  const glow = d.warm ? "#ffb066" : "#fff1dc";
  useFrame((_, dt) => { if (spin && group.current) group.current.rotation.y += Math.min(dt, 0.05) * 0.35; });
  const offsets = ps.reduce<number[]>((acc, p, i) => [...acc, i ? acc[i - 1]! + ps[i - 1]!.height / 10 : 0], []);
  const total = ps.reduce((s, p) => s + p.height / 10, 0);
  const mainIndex = ps.length - 1;
  return (
    <group position={[0, -total / 2, 0]}>
      <group ref={group}>
        {ps.map((p, i) => {
          const isMain = d.form !== "stack" && i === mainIndex;
          const isBase = d.form === "table-lamp" && !isMain;
          return (
            <group key={i} position={[0, offsets[i]!, 0]}>
              <Part d={d} shape={p.shape} h={p.height} w={p.width} color={p.color ?? (isBase ? shade(d.color, -0.25) : d.color)}
                points={isMain ? d.points : []} lit={lit && !isBase} glow={glow} />
            </group>
          );
        })}
      </group>
      {onPoints && d.form !== "stack" && <Handles d={d} y0={offsets[mainIndex]!} onPoints={onPoints} setDragging={setDragging} />}
      {lit && <pointLight position={[0, total * 0.6, 0]} intensity={6} distance={8} color={glow} />}
      {d.form === "pendant" && <mesh position={[0, total + 1.5, 0]}><cylinderGeometry args={[0.015, 0.015, 3]} /><meshStandardMaterial color="#222" /></mesh>}
    </group>
  );
}

function shade(hex: string, k: number) {
  const c = new THREE.Color(hex);
  c.offsetHSL(0, 0, k * 0.4);
  return `#${c.getHexString()}`;
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

export function StudioModel({ design, spin = false, interactive = true, onPoints }: { design: Design; spin?: boolean; interactive?: boolean; onPoints?: (p: TouchPoint[]) => void }) {
  const tall = parts(design).reduce((s, p) => s + p.height / 10, 0);
  const dist = Math.max(5.5, tall * 2.1, (design.width / 10) * 3.2);
  const [dragging, setDragging] = useState(false);
  return (
    <div className="h-full w-full touch-none" data-scene-ready>
      <Canvas shadows dpr={[1, 1.75]} camera={{ position: [0, tall * 0.15, dist], fov: 38 }} gl={{ antialias: true, alpha: true }}>
        <Lights />
        <Piece d={design} spin={spin} onPoints={onPoints} setDragging={setDragging} />
        <ContactShadows position={[0, -tall / 2 - 0.01, 0]} opacity={0.5} blur={2.4} scale={8} />
        {interactive && <OrbitControls enabled={!dragging} enablePan={false} minDistance={2.5} maxDistance={18} autoRotate={!dragging && !onPoints?.length} autoRotateSpeed={0.6} />}
      </Canvas>
    </div>
  );
}

/* ---------- Photo lab ---------- */

/** Relief: bright areas rise. Lithophane: thickness follows darkness, shown backlit. */
function PhotoPanel({ src, depth, color, tinted, mode }: { src: string; depth: number; color: string; tinted: boolean; mode: "relief" | "lithophane" }) {
  const [data, setData] = useState<{ tex: THREE.Texture; glow: THREE.Texture; geo: THREE.PlaneGeometry } | null>(null);
  useEffect(() => {
    const im = new Image();
    im.onload = () => {
      const N = 160;
      const aspect = im.width / im.height;
      const w = aspect >= 1 ? 4 : 4 * aspect, h = aspect >= 1 ? 4 / aspect : 4;
      const c = document.createElement("canvas");
      c.width = N; c.height = N;
      const ctx = c.getContext("2d")!;
      ctx.drawImage(im, 0, 0, N, N);
      const px = ctx.getImageData(0, 0, N, N);
      const geo = new THREE.PlaneGeometry(w, h, N - 1, N - 1);
      const p = geo.getAttribute("position");
      for (let i = 0; i < p.count; i++) {
        const k = i * 4;
        const lum = ((px.data[k] ?? 0) * 0.299 + (px.data[k + 1] ?? 0) * 0.587 + (px.data[k + 2] ?? 0) * 0.114) / 255;
        p.setZ(i, mode === "relief" ? lum * depth : (1 - lum) * depth * 0.5 + 0.04);
      }
      geo.computeVertexNormals();
      // Warm backlit glow: bright where the panel would be thin.
      for (let k = 0; k < px.data.length; k += 4) {
        const lum = ((px.data[k] ?? 0) * 0.299 + (px.data[k + 1] ?? 0) * 0.587 + (px.data[k + 2] ?? 0) * 0.114) / 255;
        px.data[k] = 255 * lum; px.data[k + 1] = 200 * lum; px.data[k + 2] = 140 * lum;
      }
      const g = document.createElement("canvas"); g.width = N; g.height = N;
      g.getContext("2d")!.putImageData(px, 0, 0);
      const glow = new THREE.CanvasTexture(g); glow.colorSpace = THREE.SRGBColorSpace;
      const tex = new THREE.Texture(im);
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.needsUpdate = true;
      setData({ tex, glow, geo });
    };
    im.src = src;
  }, [src, depth, mode]);
  if (!data) return null;
  if (mode === "lithophane") return (
    <group rotation={[-0.1, 0, 0]}>
      <mesh geometry={data.geo}>
        <meshStandardMaterial color="#2a2622" emissive="#ffffff" emissiveMap={data.glow} emissiveIntensity={1.6} roughness={0.8} side={THREE.DoubleSide} />
      </mesh>
      <pointLight position={[0, 0, -1.5]} intensity={8} color="#ffcf99" distance={6} />
    </group>
  );
  return (
    <mesh geometry={data.geo} rotation={[-0.25, 0, 0]}>
      <meshStandardMaterial color={tinted ? color : "#ffffff"} map={tinted ? null : data.tex} roughness={0.7} side={THREE.DoubleSide} />
    </mesh>
  );
}

function latheFromProfile(profile: number[]) {
  const pts = (profile.length >= 2 ? profile : [0.5, 0.5]).map((r, i, a) => new THREE.Vector2(Math.max(0.02, Math.min(1, r)) * 0.5, i / (a.length - 1) - 0.5));
  return new THREE.LatheGeometry(pts, 64);
}

function ObjectModel({ model }: { model: PhotoObject }) {
  const geos = useMemo(() => model.parts.map((p) => (p.shape === "lathe" ? latheFromProfile(p.profile) : null)), [model]);
  const S = 3.2; // the object's height in scene units
  return (
    <group position={[0, -S / 2, 0]} scale={S}>
      {model.parts.map((p, i) => {
        const [x = 0, y = 0.5, z = 0] = p.position;
        const [sx = 0.3, sy = 0.3, sz = sx] = p.size.map((v) => Math.max(0.01, Math.min(2, v)));
        const rot = (p.rotation.length === 3 ? p.rotation : [0, 0, 0]).map((v) => (v * Math.PI) / 180) as [number, number, number];
        const color = /^#[0-9a-f]{6}$/i.test(p.color) ? p.color : "#c9ad86";
        const mat = <meshStandardMaterial color={color} roughness={0.6} side={THREE.DoubleSide} />;
        const common = { position: [x, y, z] as [number, number, number], rotation: rot, castShadow: true };
        switch (p.shape) {
          case "lathe": return <mesh key={i} {...common} geometry={geos[i]!} scale={[sx, sy, sz]}>{mat}</mesh>;
          case "box": return <mesh key={i} {...common} scale={[sx, sy, sz]}><boxGeometry />{mat}</mesh>;
          case "sphere": return <mesh key={i} {...common} scale={[sx, sy, sz]}><sphereGeometry args={[0.5, 40, 40]} />{mat}</mesh>;
          case "cone": return <mesh key={i} {...common} scale={[sx, sy, sz]}><coneGeometry args={[0.5, 1, 48]} />{mat}</mesh>;
          case "torus": return <mesh key={i} {...common}><torusGeometry args={[Math.max(0.02, sx / 2 - sy / 2), Math.max(0.01, sy / 2), 24, 64]} />{mat}</mesh>;
          default: return <mesh key={i} {...common} scale={[sx, sy, sz]}><cylinderGeometry args={[0.5, 0.5, 1, 48]} />{mat}</mesh>;
        }
      })}
    </group>
  );
}

export function PhotoRelief({ src, depth, color, tinted, mode, model }: { src: string; depth: number; color: string; tinted: boolean; mode: PhotoMode; model: PhotoObject | null }) {
  return (
    <div className="h-full w-full" data-scene-ready>
      <Canvas shadows dpr={[1, 1.75]} camera={{ position: [0, 0.6, mode === "object" ? 7 : 5.2], fov: 40 }} gl={{ alpha: true }}>
        <Lights />
        {mode === "object" ? (model && <><ObjectModel model={model} /><ContactShadows position={[0, -1.61, 0]} opacity={0.5} blur={2.4} scale={8} /></>)
          : <PhotoPanel src={src} depth={depth} color={color} tinted={tinted} mode={mode} />}
        <OrbitControls enablePan={false} autoRotate autoRotateSpeed={0.8} minDistance={3} maxDistance={12} />
      </Canvas>
    </div>
  );
}
