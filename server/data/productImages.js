const fs = require("fs");
const path = require("path");

const imageDir = path.join(__dirname, "..", "..", "img");

const productImageMap = {
  "iPhone 16": "iphone-16-blue-600x600.png",
  "MacBook Air M4": "macbook-air-15-inch-m5-16gb-512gb-70w-vang-thumb-600x600.png",
  "Galaxy Tab X": "iPad_Pro_M4_mac24h_z1uy-ic_7bum-yc.webp"
};

const productImageAliases = {
  "iPhone 16": ["iphone", "16"],
  "MacBook Air M4": ["macbook", "air", "m4", "mba"],
  "Apple Watch S11": ["watch", "apple", "iwatch", "s11"],
  "Galaxy Tab X": ["ipad", "tab", "tablet", "pro", "m4"],
  "Sony WH-1000XM7": ["sony", "headphone", "wh", "1000xm7"],
  "Canon R10": ["canon", "camera", "r10"]
};

function getMimeType(filename) {
  const ext = path.extname(filename).toLowerCase();

  switch (ext) {
    case ".png":
      return "image/png";
    case ".jpg":
    case ".jpeg":
      return "image/jpeg";
    case ".gif":
      return "image/gif";
    case ".webp":
      return "image/webp";
    case ".svg":
      return "image/svg+xml";
    default:
      return "application/octet-stream";
  }
}

function readImageAsDataUri(filename) {
  if (!filename) {
    return null;
  }

  const filePath = path.join(imageDir, filename);
  if (!fs.existsSync(filePath)) {
    return null;
  }

  const mimeType = getMimeType(filename);
  const buffer = fs.readFileSync(filePath);
  return `data:${mimeType};base64,${buffer.toString("base64")}`;
}

function getImageFiles() {
  if (!fs.existsSync(imageDir)) {
    return [];
  }

  return fs.readdirSync(imageDir).filter(function (filename) {
    return /\.(png|jpe?g|gif|webp|svg)$/i.test(filename);
  });
}

function tokenize(text) {
  return String(text || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .split(" ")
    .filter(Boolean);
}

function findBestMatchingFile(name) {
  const files = getImageFiles();
  if (files.length === 0) {
    return null;
  }

  const tokens = [
    ...new Set([...(productImageAliases[name] || []), ...tokenize(name)])
  ];

  let bestFile = null;
  let bestScore = 0;

  for (const file of files) {
    const lowerFile = file.toLowerCase();
    let score = 0;

    for (const token of tokens) {
      if (lowerFile.includes(token)) {
        score += token.length > 2 ? 2 : 1;
      }
    }

    if (score > bestScore) {
      bestScore = score;
      bestFile = file;
    }
  }

  return bestScore > 0 ? bestFile : null;
}

function getProductImage(name, fallbackImage) {
  const mappedFile = productImageMap[name] || findBestMatchingFile(name);
  return readImageAsDataUri(mappedFile) || fallbackImage;
}

module.exports = {
  getProductImage,
  productImageMap,
  productImageAliases
};
