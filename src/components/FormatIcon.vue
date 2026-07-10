<template>
  <canvas
    ref="canvas"
    :width="size * dpr"
    :height="size * dpr"
    :style="{ width: size + 'px', height: size + 'px' }"
    :aria-label="'Icona per formato ' + name"
    role="img"
  ></canvas>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'

const props = defineProps({
  formatId: { type: String, required: true },
  extension: { type: String, required: true },
  color: { type: String, required: true },
  size: { type: Number, default: 48 }
})

const canvas = ref(null)
const dpr = Math.min(window.devicePixelRatio || 1, 2)

function draw() {
  const c = canvas.value
  if (!c) return
  const ctx = c.getContext('2d')
  const s = props.size * dpr
  const pad = s * 0.15
  const r = s * 0.2

  ctx.clearRect(0, 0, s, s)

  // Rounded rect background
  ctx.beginPath()
  ctx.moveTo(pad + r, pad)
  ctx.lineTo(s - pad - r, pad)
  ctx.arcTo(s - pad, pad, s - pad, pad + r, r)
  ctx.lineTo(s - pad, s - pad - r)
  ctx.arcTo(s - pad, s - pad, s - pad - r, s - pad, r)
  ctx.lineTo(pad + r, s - pad)
  ctx.arcTo(pad, s - pad, pad, s - pad - r, r)
  ctx.lineTo(pad, pad + r)
  ctx.arcTo(pad, pad, pad + r, pad, r)
  ctx.closePath()

  // Gradient fill
  const grad = ctx.createLinearGradient(pad, pad, s - pad, s - pad)
  grad.addColorStop(0, props.color)
  grad.addColorStop(1, lightenColor(props.color, 0.2))
  ctx.fillStyle = grad
  ctx.fill()

  // Extension text
  const fontSize = s * 0.28
  ctx.fillStyle = '#FFFFFF'
  ctx.font = `700 ${fontSize}px system-ui, -apple-system, sans-serif`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'

  // Truncate extension if too long
  let ext = props.extension.replace('.', '')
  if (ext.length > 5) ext = ext.substring(0, 4) + '…'

  ctx.fillText(ext.toUpperCase(), s / 2, s / 2)
}

function lightenColor(hex, amount) {
  const num = parseInt(hex.replace('#', ''), 16)
  const r = Math.min(255, (num >> 16) + 40)
  const g = Math.min(255, ((num >> 8) & 0x00FF) + 40)
  const b = Math.min(255, (num & 0x0000FF) + 40)
  return `rgb(${r},${g},${b})`
}

onMounted(draw)
watch(() => [props.formatId, props.size], draw)
</script>
