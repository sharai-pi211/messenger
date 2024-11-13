async function sha256(message) {
    const msgBuffer = new TextEncoder().encode(message);
    const hashBuffer = await crypto.subtle.digest("SHA-256", msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => ("00" + b.toString(16)).padStart(2, "0")).join("");
}

function generateMatrixFromHash(hash) {
    const matrix = Array(5)
        .fill(0)
        .map(() => Array(5).fill(0));

    const truncatedHash = hash.substring(0, 25);
    for (let i = 0; i < 5; i++) {
        for (let j = 0; j < 5; j++) {
            const n = parseInt(truncatedHash[i * 5 + j], 16);
            matrix[i][j] = n > 7 ? 0 : 1;
        }
    }

    for (let i = 0; i < 5; i++) {
        for (let j = 2; j < 5; j++) {
            matrix[i][j] = matrix[i][4 - j];
        }
    }

    return matrix;
}

export default async function generateAvatar(username) {
    const hash = await sha256(username);
    const matrix = generateMatrixFromHash(hash);

    const blockSize = 50;
    const size = blockSize * 5;
    const r = Math.floor(Math.random() * 128 + 128);
    const g = Math.floor(Math.random() * 128 + 128);
    const b = Math.floor(Math.random() * 128 + 128);
    const color = `rgb(${r}, ${g}, ${b})`;

    let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}">`;
    svg += `<rect width="${size}" height="${size}" fill="#F8F8F8"/>`;

    for (let i = 0; i < 5; i++) {
        for (let j = 0; j < 5; j++) {
            if (matrix[i][j] === 1) {
                const x = j * blockSize;
                const y = i * blockSize;
                svg += `<rect x="${x}" y="${y}" width="${blockSize}" height="${blockSize}" fill="${color}"/>`;
            }
        }
    }

    svg += `</svg>`;

    const base64Svg = Buffer.from(svg).toString("base64");
    return `data:image/svg+xml;base64,${base64Svg}`;
}
