type PasswordConfiguration = {
    length: number; // Must be between 5 and 128
    includeUppercase: boolean;
    includeLowercase: boolean;
    includeNumbers: boolean;
    includeSymbols: boolean;
    minimumNumbers: number;
    minimumSpecial: number;
    avoidAmbiguous: boolean;
};

const defaultPasswordConfiguration: PasswordConfiguration = {
    length: 16,
    includeUppercase: true,
    includeLowercase: true,
    includeNumbers: true,
    includeSymbols: true,
    minimumNumbers: 2,
    minimumSpecial: 1,
    avoidAmbiguous: false,
};

const AMBIGUOUS_CHARS = ["l", "I", "1", "O", "0"];

const CHAR_SETS = {
    uppercase: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
    lowercase: "abcdefghijklmnopqrstuvwxyz",
    numbers: "0123456789",
    symbols: "!@#$%^&*",
};

// Returns a cryptographically secure random integer in [0, max)
function getSecureRandomInt(max: number): number {
    if (max <= 0 || max > Number.MAX_SAFE_INTEGER) {
        throw new Error("Invalid max value for random integer");
    }
    // Range is [0, max)
    const rand = new Uint32Array(1);
    let x;
    // Avoid bias: only accept numbers < rangeLimit
    // rangeLimit = Math.floor(2**32 / max) * max;
    // see https://stackoverflow.com/a/78239136 for explanation
    const rangeLimit = Math.floor(0x100000000 / max) * max;
    do {
        window.crypto.getRandomValues(rand);
        x = rand[0];
    } while (x >= rangeLimit);
    return x % max;
}

function removeAmbiguous(charset: string): string {
    return charset
        .split("")
        .filter((c) => !AMBIGUOUS_CHARS.includes(c))
        .join("");
}

function getRandomChar(charset: string): string {
    const index = getSecureRandomInt(charset.length);
    return charset[index];
}

const generatePassword = (settings: PasswordConfiguration): string => {
    const {
        length,
        includeUppercase,
        includeLowercase,
        includeNumbers,
        includeSymbols,
        minimumNumbers,
        minimumSpecial,
        avoidAmbiguous,
    } = settings;

    let availableChars = "";
    const guaranteedChars: string[] = [];

    const sets: { [key: string]: string } = {};

    if (includeUppercase) {
        sets.uppercase = avoidAmbiguous ? removeAmbiguous(CHAR_SETS.uppercase) : CHAR_SETS.uppercase;
        availableChars += sets.uppercase;
    }
    if (includeLowercase) {
        sets.lowercase = avoidAmbiguous ? removeAmbiguous(CHAR_SETS.lowercase) : CHAR_SETS.lowercase;
        availableChars += sets.lowercase;
    }
    if (includeNumbers) {
        sets.numbers = avoidAmbiguous ? removeAmbiguous(CHAR_SETS.numbers) : CHAR_SETS.numbers;
        for (let i = 0; i < minimumNumbers; i++) {
            guaranteedChars.push(getRandomChar(sets.numbers));
        }
        availableChars += sets.numbers;
    }
    if (includeSymbols) {
        sets.symbols = avoidAmbiguous ? removeAmbiguous(CHAR_SETS.symbols) : CHAR_SETS.symbols;
        for (let i = 0; i < minimumSpecial; i++) {
            guaranteedChars.push(getRandomChar(sets.symbols));
        }
        availableChars += sets.symbols;
    }

    if (!availableChars || length < guaranteedChars.length) {
        throw new Error("Invalid configuration: Not enough character types or length too short");
    }

    const remainingLength = length - guaranteedChars.length;
    for (let i = 0; i < remainingLength; i++) {
        guaranteedChars.push(getRandomChar(availableChars));
    }

    // Shuffle the final password
    for (let i = guaranteedChars.length - 1; i > 0; i--) {
        const j = getSecureRandomInt(i + 1);
        [guaranteedChars[i], guaranteedChars[j]] = [guaranteedChars[j], guaranteedChars[i]];
    }

    return guaranteedChars.join("");
};

export { defaultPasswordConfiguration, generatePassword };
