export const colors = {
  orange600: '#EA580C',
  grey500: '#6b7280',
  grey400: '#9ca3af',
  grey300: '#D1D5DB',
  grey200: '#E5E7EB',
  grey100: '#f3f4f6',
  cyan600: '#0891B2',
};


export const classNames = (...classes) => {
  return classes.filter(Boolean).join(' ');
}

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

export const isNumeric = (num) => (typeof(num) === 'number' || typeof(num) === "string" && num.trim() !== '') && !isNaN(num);

const validateNumber = (number, eventType, min, max) => {
  const required = isRequired(number, eventType)
  if (required) return required

  if (!isNumeric(number)) {
    return { state: 'error', errorMessage: 'Please enter a valid number' };
  }

  if (isNumeric(min) && Number(number) < min) {
    return { state: 'error', errorMessage: `Please enter a number between ${min} and ${max}` };
  }

  if (isNumeric(max) && Number(number) > max) {
    return { state: 'error', errorMessage: `Please enter a number between ${min} and ${max}` };
  }

  return { state: 'valid' }
};


export const validator = (name, value, eventType, form, isRequiredField = false) => {
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

  if (name === 'playerNumber') {
    return { name, value, ...validateNumber(value, eventType, 0, 99) };
  }

  if (isRequiredField) {
    const required = isRequired(value, eventType)
    if (required) {
      return { name, value, ...required };
    }
  }

  return { name, value, state: 'valid' };
};

export const createImage = (url) => {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.addEventListener('load', () => resolve(image))
    image.addEventListener('error', (error) => reject(error))
    image.setAttribute('crossOrigin', 'anonymous') // needed to avoid cross-origin issues on CodeSandbox
    image.src = url
  })
};

export const getCroppedImg = async (
  imageSrc,
  pixelCrop,
) => {
  const image = await createImage(imageSrc)
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')

  if (!ctx) {
    return null
  }

  // set canvas size to match the bounding box
  canvas.width = image.width;
  canvas.height = image.height;

  // translate canvas context to a central location to allow rotating and flipping around the center
  ctx.translate(canvas.width / 2, canvas.height / 2)
  ctx.translate(-image.width / 2, -image.height / 2)

  // draw rotated image
  ctx.drawImage(image, 0, 0)

  const croppedCanvas = document.createElement('canvas')

  const croppedCtx = croppedCanvas.getContext('2d')

  if (!croppedCtx) {
    return null
  }

  // Set the size of the cropped canvas
  croppedCanvas.width = pixelCrop.width
  croppedCanvas.height = pixelCrop.height

  // Draw the cropped image onto the new canvas
  croppedCtx.drawImage(
    canvas,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height
  )

  // As Base64 string
  // return croppedCanvas.toDataURL('image/jpeg');

  // As a blob
  return new Promise((resolve, reject) => {
    croppedCanvas.toBlob((file) => {
      resolve(file)
    }, 'image/png')
  })
};
