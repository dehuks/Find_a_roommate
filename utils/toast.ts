import Toast from 'react-native-toast-message';

export const showSuccess = (message: string, subMessage?: string) => {
  Toast.show({
    type: 'success',
    text1: message,
    text2: subMessage,
    position: 'top',
    visibilityTime: 3000,
  });
};

export const showError = (error: any) => {
  let message = "Something went wrong.";

  // 1. Check if it's a simple string
  if (typeof error === 'string') {
    message = error;
  } 
  // 2. Check for standard Error object
  else if (error instanceof Error) {
    message = error.message;
  }
  // 3. Check for Django/DRF Array Errors (e.g. { "email": ["Invalid email"] })
  else if (typeof error === 'object') {
    // Grab the first value of the first key
    const keys = Object.keys(error);
    if (keys.length > 0) {
      const firstError = error[keys[0]];
      if (Array.isArray(firstError)) {
        message = `${keys[0]}: ${firstError[0]}`;
      } else if (typeof firstError === 'string') {
        message = firstError;
      }
    }
  }

  // Remove "Error:" prefix if it exists to make it cleaner
  message = message.replace("Error:", "").trim();

  Toast.show({
    type: 'error',
    text1: 'Oops!',
    text2: message,
    position: 'top',
    visibilityTime: 4000,
  });
};

export const showInfo = (message: string) => {
  Toast.show({
    type: 'info',
    text1: 'Note',
    text2: message,
    position: 'bottom',
  });
};