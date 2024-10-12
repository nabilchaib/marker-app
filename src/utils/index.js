
export const colors = {
  orange600: '#EA580C',
  grey300: '#D1D5DB',
  cyan600: '#0891B2',
};

export const createFirebaseConfig = () => {
  return Object.entries(process.env).reduce((config, envVar) => {
    if (envVar[0].includes('FIREBASE')) {
      const key = envVar[0]
        .replace('REACT_APP_FIREBASE_', '')
        .split('_')
        .map((word, index) => {
          if (index === 0) return word.toLowerCase();
          return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
        })
        .join('');
      const value = envVar[1];
      return { ...config, [key]: value };
    }

    return config;
  }, {});
};

const isRequired = (val, eventType, errorMessage = 'This is a required field') => {
  if (!val || (val && !val.toString().trim())) {
    switch (eventType) {
      case 'blur':
        return { state: 'error', errorMessage }
      case 'change':
        return { state: 'clean' }
      default:
        return { state: 'clean' }
    }
  }
  return false
}

const validateEmail = (email, eventType) => {
  const required = isRequired(email, eventType)
  if (required) return required

  if (eventType === 'blur') {
    if (!email.match(/^.*@.*\..*$/)) {
      return { state: 'error', errorMessage: 'This email is not valid' }
    }

    return { state: 'valid' }
  }

  return { state: 'clean' }
}

const validateName = (name, eventType) => {
  const required = isRequired(name, eventType)
  if (required) return required

  if (!name.match(/^[a-z0-9 ,.'-]+$/i)) {
    return { state: 'error', errorMessage: 'Name is not valid' }
  }

  if (eventType === 'change') {
    return { state: 'clean' }
  }

  return { state: 'valid' }
}

const validatePassword = (password, eventType) => {
  const required = isRequired(password, eventType)
  if (required) return required

  if (eventType === 'blur' && password.length < 6) {
    return { state: 'error', errorMessage: 'Minimum 6 characters' }
  }

  if (eventType === 'change') {
    return { state: 'clean' }
  }

  return { state: 'valid' }
}

const validateConfirmPassword = (confirmPassword, eventType, form) => {
  const required = isRequired(confirmPassword, eventType)
  if (required) return required

  if (eventType === 'blur' && confirmPassword.length < 6) {
    return { state: 'error', errorMessage: 'Minimum 6 characters' }
  }

  if (eventType === 'blur' && confirmPassword !== form.password) {
    return { state: 'error', errorMessage: 'Your passwords do not match' }
  }

  if (eventType === 'change') {
    return { state: 'clean' }
  }

  return { state: 'valid' }
}


export const validator = (name, value, eventType, form) => {
  if (name === 'email') {
    return { name, value, ...validateEmail(value, eventType) };
  }

  if (name === 'firstName' || name === 'lastName') {
    return { name, value, ...validateName(value, eventType) };
  }

  if (name === 'password') {
    return { name, value, ...validatePassword(value, eventType) };
  }

  if (name === 'confirmPassword') {
    return { name, value, ...validateConfirmPassword(value, eventType, form) };
  }

  return { name, value, state: 'valid' };
};
