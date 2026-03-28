const { createCanvas } = require('canvas');
const fs = require('fs');

async function runTest() {
  try {
    console.log("Starting Canvas Test...");
    
    const width = 400;
    const height = 400;
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    // Draw a background
    ctx.fillStyle = '#f0f0f0';
    ctx.fillRect(0, 0, width, height);

    // Draw a circle
    ctx.beginPath();
    ctx.arc(200, 200, 100, 0, Math.PI * 2);
    ctx.fillStyle = '#ff0000';
    ctx.fill();

    // Draw text
    ctx.fillStyle = '#000000';
    ctx.font = 'bold 30px Arial';
    ctx.fillText('Canvas Works!', 90, 210);

    // Save to a file
    const buffer = canvas.toBuffer('image/png');
    fs.writeFileSync('./canvas-test-result.png', buffer);
    
    console.log("✅ Success! Created 'canvas-test-result.png' in this folder.");
  } catch (err) {
    console.error("❌ Canvas Failed!");
    console.error(err);
  }
}

runTest();