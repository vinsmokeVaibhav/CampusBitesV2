/**
 * Validates college student Roll Number / Student ID.
 * Accepts formats like: 2024CS0842, ROLL-1024, BT21ECE045, 23MCA102, etc. (alphanumeric, 5-15 chars)
 */
export function validateStudentRoll(roll: string): { isValid: boolean; message?: string } {
  const trimmed = roll.trim();
  if (!trimmed) {
    return { isValid: false, message: 'Student Roll No / ID is required.' };
  }
  if (trimmed.length < 4 || trimmed.length > 20) {
    return { isValid: false, message: 'Student ID must be between 4 and 20 characters.' };
  }
  const regex = /^[A-Za-z0-9\-_/]+$/;
  if (!regex.test(trimmed)) {
    return { isValid: false, message: 'Only letters, numbers, hyphens, and slashes allowed.' };
  }
  return { isValid: true };
}

/**
 * Validates Indian 10-digit mobile number or valid campus email
 */
export function validateContact(contact: string): { isValid: boolean; message?: string } {
  const trimmed = contact.trim();
  if (!trimmed) {
    return { isValid: false, message: 'Phone number or campus email is required for pickup alerts.' };
  }

  // Check if email
  if (trimmed.includes('@')) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmed)) {
      return { isValid: false, message: 'Please enter a valid campus email address.' };
    }
    return { isValid: true };
  }

  // Check if Indian 10-digit mobile (optionally with +91)
  const cleanedPhone = trimmed.replace(/\D/g, '');
  if (cleanedPhone.length === 10 && /^[6-9]\d{9}$/.test(cleanedPhone)) {
    return { isValid: true };
  }
  if (cleanedPhone.length === 12 && cleanedPhone.startsWith('91') && /^91[6-9]\d{9}$/.test(cleanedPhone)) {
    return { isValid: true };
  }

  return { isValid: false, message: 'Enter a valid 10-digit mobile number (e.g., 9876543210) or campus email.' };
}

/**
 * Validates UPI Virtual Payment Address (e.g. user@oksbi, student@upi)
 */
export function validateUPI(upiId: string): boolean {
  const regex = /^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$/;
  return regex.test(upiId.trim());
}
