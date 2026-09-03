const ffmpegPath = require('ffmpeg-static');
const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const outDirPublic = path.resolve(__dirname, 'public/sequence');
const outDirMedia = path.resolve(__dirname, 'media/sequence');

if (!fs.existsSync(outDirPublic)) fs.mkdirSync(outDirPublic, { recursive: true });
if (!fs.existsSync(outDirMedia)) fs.mkdirSync(outDirMedia, { recursive: true });

const videoPath = path.resolve(__dirname, 'media/video_cafe2.mp4');

console.log('Extracting 1080p Lanczos + CAS sharpened sequence from:', videoPath);

// Extract 120 frames at 1920x1080 with Lanczos upscale, Contrast Adaptive Sharpening, and quality 90
const args = [
  '-i', videoPath,
  '-vf', 'fps=12,scale=1920:1080:flags=lanczos,cas=0.45',
  '-c:v', 'libwebp',
  '-lossless', '0',
  '-compression_level', '2',
  '-q:v', '90',
  '-threads', '8',
  '-an',
  '-y',
  path.join(outDirPublic, 'frame_%04d.webp')
];

const res = spawnSync(ffmpegPath, args, { stdio: 'inherit' });
if (res.error) {
  console.error('Error running ffmpeg:', res.error);
  process.exit(1);
}

const files = fs.readdirSync(outDirPublic).filter(f => f.endsWith('.webp'));
console.log(`Generated ${files.length} high-res 1080p frames in public/sequence`);

files.forEach(f => {
  fs.copyFileSync(path.join(outDirPublic, f), path.join(outDirMedia, f));
});

console.log('Successfully mirrored high-res 1080p frames to media/sequence');
