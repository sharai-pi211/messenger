async function sha256(message: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(message);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
    return hashHex;
}

function generateMatrixFromHash(hash: string): number[][] {
    const matrix: number[][] = [
        [0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0]
    ];

    const truncatedHash = hash.substring(0, matrix.length * matrix[0].length);

    for (let i = 0; i < matrix.length; i++) {
        for (let j = 0; j < matrix[i].length; j++) {
            const n = parseInt(truncatedHash.substr(i * j + j, 1), 16);
            matrix[i][j] = n > 7 ? 0 : 1;
        }
    }

    
    for (let i = 0; i < matrix.length; i++) {
        for (let j = Math.round(matrix[i].length / 2), k = 2; j < matrix[i].length; j++, k += 2) {
            matrix[i][j] = matrix[i][j - k];
        }
    }

    return matrix;
}

async function generateAvatar(inputValue: string): Promise<string> {
    const hash = await sha256(inputValue);
    const matrix = generateMatrixFromHash(hash);

    
    const canvas = document.createElement("canvas");
    canvas.width = 250;
    canvas.height = 250;
    const ctx = canvas.getContext("2d");

    if (!ctx) {
        throw new Error("Не удалось получить контекст CanvasRenderingContext2D");
    }

    
    ctx.fillStyle = "#F8F8F8";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    
    const r = Math.floor(Math.random() * 128 + 128);
    const g = Math.floor(Math.random() * 128 + 128);
    const b = Math.floor(Math.random() * 128 + 128);
    ctx.fillStyle = `rgba(${r}, ${g}, ${b}, 1)`;

    
    const blockSize = canvas.width / matrix.length;
    for (let i = 0; i < matrix.length; i++) {
        for (let j = 0; j < matrix[i].length; j++) {
            if (matrix[i][j] === 1) {
                ctx.fillRect(j * blockSize, i * blockSize, blockSize, blockSize);
            }
        }
    }

    
    return canvas.toDataURL("image/png");
}

export default generateAvatar;
