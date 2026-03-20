import { useRef, useMemo, useCallback } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'

/* ─── Config ─── */
const PARTICLE_COUNT = 1200
const FIELD_SIZE = 18
const CONNECTION_DISTANCE = 2.2
const MAX_CONNECTIONS = 600
const COLORS = {
  accent: new THREE.Color('#00e5a0'),
  blue: new THREE.Color('#00b4d8'),
  purple: new THREE.Color('#7b61ff'),
}

/* ─── Floating Particles ─── */
function Particles() {
  const pointsRef = useRef<THREE.Points>(null)
  const linesRef = useRef<THREE.LineSegments>(null)

  const { positions, colors, velocities } = useMemo(() => {
    const positions = new Float32Array(PARTICLE_COUNT * 3)
    const colors = new Float32Array(PARTICLE_COUNT * 3)
    const velocities = new Float32Array(PARTICLE_COUNT * 3)
    const colorOptions = [COLORS.accent, COLORS.blue, COLORS.purple]

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const i3 = i * 3
      positions[i3] = (Math.random() - 0.5) * FIELD_SIZE
      positions[i3 + 1] = (Math.random() - 0.5) * FIELD_SIZE
      positions[i3 + 2] = (Math.random() - 0.5) * FIELD_SIZE * 0.6

      // Slow drift velocity
      velocities[i3] = (Math.random() - 0.5) * 0.003
      velocities[i3 + 1] = (Math.random() - 0.5) * 0.003
      velocities[i3 + 2] = (Math.random() - 0.5) * 0.002

      const color = colorOptions[Math.floor(Math.random() * colorOptions.length)]
      colors[i3] = color.r
      colors[i3 + 1] = color.g
      colors[i3 + 2] = color.b
    }

    return { positions, colors, velocities }
  }, [])

  // Pre-allocate line geometry buffers
  const linePositions = useMemo(() => new Float32Array(MAX_CONNECTIONS * 6), [])
  const lineColors = useMemo(() => new Float32Array(MAX_CONNECTIONS * 6), [])

  useFrame(({ clock }) => {
    if (!pointsRef.current || !linesRef.current) return

    const posAttr = pointsRef.current.geometry.attributes.position as THREE.BufferAttribute
    const arr = posAttr.array as Float32Array
    const t = clock.getElapsedTime()
    const half = FIELD_SIZE / 2

    // Animate each particle
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const i3 = i * 3
      arr[i3] += velocities[i3] + Math.sin(t * 0.3 + i * 0.01) * 0.001
      arr[i3 + 1] += velocities[i3 + 1] + Math.cos(t * 0.2 + i * 0.015) * 0.001
      arr[i3 + 2] += velocities[i3 + 2]

      // Wrap around bounds
      for (let j = 0; j < 3; j++) {
        const limit = j === 2 ? half * 0.6 : half
        if (arr[i3 + j] > limit) arr[i3 + j] = -limit
        if (arr[i3 + j] < -limit) arr[i3 + j] = limit
      }
    }
    posAttr.needsUpdate = true

    // Build connection lines (only check subset for performance)
    let lineIdx = 0
    const step = PARTICLE_COUNT > 800 ? 3 : 1
    for (let i = 0; i < PARTICLE_COUNT && lineIdx < MAX_CONNECTIONS; i += step) {
      const i3 = i * 3
      for (let j = i + step; j < PARTICLE_COUNT && lineIdx < MAX_CONNECTIONS; j += step) {
        const j3 = j * 3
        const dx = arr[i3] - arr[j3]
        const dy = arr[i3 + 1] - arr[j3 + 1]
        const dz = arr[i3 + 2] - arr[j3 + 2]
        const distSq = dx * dx + dy * dy + dz * dz

        if (distSq < CONNECTION_DISTANCE * CONNECTION_DISTANCE) {
          const l6 = lineIdx * 6
          linePositions[l6] = arr[i3]
          linePositions[l6 + 1] = arr[i3 + 1]
          linePositions[l6 + 2] = arr[i3 + 2]
          linePositions[l6 + 3] = arr[j3]
          linePositions[l6 + 4] = arr[j3 + 1]
          linePositions[l6 + 5] = arr[j3 + 2]

          const alpha = 1 - Math.sqrt(distSq) / CONNECTION_DISTANCE
          const c = COLORS.accent
          lineColors[l6] = c.r * alpha
          lineColors[l6 + 1] = c.g * alpha
          lineColors[l6 + 2] = c.b * alpha
          lineColors[l6 + 3] = c.r * alpha
          lineColors[l6 + 4] = c.g * alpha
          lineColors[l6 + 5] = c.b * alpha

          lineIdx++
        }
      }
    }

    // Zero out remaining
    for (let i = lineIdx * 6; i < MAX_CONNECTIONS * 6; i++) {
      linePositions[i] = 0
      lineColors[i] = 0
    }

    const lineGeom = linesRef.current.geometry
    ;(lineGeom.attributes.position as THREE.BufferAttribute).needsUpdate = true
    ;(lineGeom.attributes.color as THREE.BufferAttribute).needsUpdate = true
    lineGeom.setDrawRange(0, lineIdx * 2)
  })

  return (
    <>
      <points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[positions, 3]}
            count={PARTICLE_COUNT}
          />
          <bufferAttribute
            attach="attributes-color"
            args={[colors, 3]}
            count={PARTICLE_COUNT}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.04}
          vertexColors
          transparent
          opacity={0.8}
          sizeAttenuation
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>

      <lineSegments ref={linesRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[linePositions, 3]}
            count={MAX_CONNECTIONS * 2}
          />
          <bufferAttribute
            attach="attributes-color"
            args={[lineColors, 3]}
            count={MAX_CONNECTIONS * 2}
          />
        </bufferGeometry>
        <lineBasicMaterial
          vertexColors
          transparent
          opacity={0.25}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </lineSegments>
    </>
  )
}

/* ─── Wireframe Torus Knot ─── */
function WireframeShape() {
  const meshRef = useRef<THREE.Mesh>(null)

  useFrame(({ clock }) => {
    if (!meshRef.current) return
    const t = clock.getElapsedTime()
    meshRef.current.rotation.x = t * 0.08
    meshRef.current.rotation.y = t * 0.12
    meshRef.current.rotation.z = t * 0.05
    meshRef.current.position.y = Math.sin(t * 0.4) * 0.3
  })

  return (
    <mesh ref={meshRef} position={[2, 0, -3]}>
      <torusKnotGeometry args={[2.5, 0.6, 128, 16, 2, 3]} />
      <meshBasicMaterial
        color="#00e5a0"
        wireframe
        transparent
        opacity={0.08}
        depthWrite={false}
      />
    </mesh>
  )
}

/* ─── Secondary Wireframe – Icosahedron ─── */
function WireframeIco() {
  const meshRef = useRef<THREE.Mesh>(null)

  useFrame(({ clock }) => {
    if (!meshRef.current) return
    const t = clock.getElapsedTime()
    meshRef.current.rotation.x = -t * 0.06
    meshRef.current.rotation.y = t * 0.1
    meshRef.current.position.y = Math.cos(t * 0.3) * 0.4
  })

  return (
    <mesh ref={meshRef} position={[-3, 1, -5]}>
      <icosahedronGeometry args={[3, 1]} />
      <meshBasicMaterial
        color="#7b61ff"
        wireframe
        transparent
        opacity={0.06}
        depthWrite={false}
      />
    </mesh>
  )
}

/* ─── Mouse Parallax Camera Controller ─── */
function CameraRig() {
  const { camera } = useThree()
  const mouse = useRef({ x: 0, y: 0 })
  const target = useRef({ x: 0, y: 0 })

  const onMouseMove = useCallback((e: MouseEvent) => {
    mouse.current.x = (e.clientX / window.innerWidth - 0.5) * 2
    mouse.current.y = (e.clientY / window.innerHeight - 0.5) * 2
  }, [])

  // Attach listener once
  useMemo(() => {
    window.addEventListener('mousemove', onMouseMove)
    return () => window.removeEventListener('mousemove', onMouseMove)
  }, [onMouseMove])

  useFrame(() => {
    target.current.x += (mouse.current.x * 1.2 - target.current.x) * 0.02
    target.current.y += (-mouse.current.y * 0.8 - target.current.y) * 0.02
    camera.position.x = target.current.x
    camera.position.y = target.current.y
    camera.lookAt(0, 0, 0)
  })

  return null
}

/* ─── Main Export ─── */
export default function ParticleBackground() {
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 0,
        pointerEvents: 'none',
      }}
    >
      <Canvas
        camera={{ position: [0, 0, 10], fov: 60 }}
        dpr={[1, 1.5]}
        gl={{
          antialias: false,
          alpha: true,
          powerPreference: 'high-performance',
        }}
        style={{ pointerEvents: 'auto' }}
      >
        <color attach="background" args={['#0a0a0f']} />
        <fog attach="fog" args={['#0a0a0f', 8, 22]} />
        <Particles />
        <WireframeShape />
        <WireframeIco />
        <CameraRig />
      </Canvas>
    </div>
  )
}
