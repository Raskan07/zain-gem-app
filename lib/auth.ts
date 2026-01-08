import * as SecureStore from 'expo-secure-store';

const PASSCODE_KEY = 'user_passcode';
const DEFAULT_PASSCODE = '123456';

/**
 * Retrieves the stored passcode.
 * Returns the default '123456' if no passcode is set.
 */
export async function getPasscode(): Promise<string> {
    try {
        const stored = await SecureStore.getItemAsync(PASSCODE_KEY);
        return stored ?? DEFAULT_PASSCODE;
    } catch (error) {
        console.error('Error retrieving passcode:', error);
        return DEFAULT_PASSCODE;
    }
}

/**
 * Saves a new passcode securely.
 */
export async function setPasscode(code: string): Promise<void> {
    try {
        await SecureStore.setItemAsync(PASSCODE_KEY, code);
    } catch (error) {
        console.error('Error saving passcode:', error);
        throw error;
    }
}

/**
 * Verifies if the input matches the stored passcode.
 */
export async function verifyPasscode(input: string): Promise<boolean> {
    const currentPasscode = await getPasscode();
    return currentPasscode === input;
}
