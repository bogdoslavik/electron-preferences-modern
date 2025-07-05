export function lightenWithWhite(hex: string, whitePart = 0.35) {
    const k = 1 - whitePart;
    const rgb = [1, 3, 5].map(i => parseInt(hex.substr(i, 2), 16));
    const lr = rgb.map(c => Math.round(c * k + 255 * whitePart)
        .toString(16)
        .padStart(2, '0'));
    return `#${lr.join('')}`;
}
