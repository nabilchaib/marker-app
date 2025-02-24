import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify'
import { useDispatch } from 'react-redux';
import {
  auth,
  signInWithPopup,
  GoogleAuthProvider,
  FacebookAuthProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
} from '../../firebase';
import { addOrGetUserApi } from '../../firebase/api';
import { addUser } from '../../redux/user-reducer';
import BgImg from '../../components/BackgroundImage';
import Icon from '../../components/Icon';
import { colors, validator } from '../../utils';

const Login = () => {
  const [loginWithFacebookLoading, setLoginWithFacebookLoading] = useState(false);
  const [loginWithGoogleLoading, setLoginWithGoogleLoading] = useState(false);
  const [loggingInLoading, setLoggingInLoading] = useState(false);
  const [signUpLoading, setSignUpLoading] = useState(false);
  const [resetPasswordLoading, setResetPasswordLoading] = useState(false);
  const [useEmailToLogin, setUseEmailToLogin] = useState(false);
  const [useSignUp, setUseSignUp] = useState(false);
  const [useResetPassword, setUseResetPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const initialForm = {
    email: '',
    firstName: '',
    lastName: '',
    password: '',
    confirmPassword: ''
  };
  const [form, setForm] = useState(initialForm);
  const [formState, setFormState] = useState({});

  const loginWithGoogle = async () => {
    try {
      setLoginWithGoogleLoading(true);
      const provider = new GoogleAuthProvider();

      const result = await signInWithPopup(auth, provider);
      const { firstName, lastName, email } = result._tokenResponse;
      const newUser = {
        firstName,
        lastName,
        email
      };
      await addOrGetUserApi(newUser)
      dispatch(addUser({ user: newUser }));
      setLoginWithGoogleLoading(false);
      navigate('/');
    } catch (err) {
      console.log('LOGIN WITH GOOGLE ERR: ', err);
      setLoginWithGoogleLoading(false);
    }
  };

  const loginWithFacebook = async () => {
    try {
      setLoginWithFacebookLoading(true);
      const provider = new FacebookAuthProvider();

      const result = await signInWithPopup(auth, provider);
      const { firstName, lastName, email } = result._tokenResponse;
      const newUser = {
        firstName,
        lastName,
        email
      };
      await addOrGetUserApi(newUser)
      dispatch(addUser({ user: newUser }));
      setLoginWithFacebookLoading(false);
      navigate('/');
    } catch (err) {
      console.log('LOGIN WITH FACEBOOK ERR: ', err.message);
      if (
        err.message.includes('auth/account-exists-with-different-credential') ||
        err.message.includes('auth/email-already-in-use')
      ) {
        toast.error('Your email is already in use', {
          position: 'top-center'
        })
      }

      setLoginWithFacebookLoading(false);
    }
  };

  const onLogIn = async () => {
    let valid = true;
    for (const field of ['password']) {
      const fieldState = validator(field, form[field], 'blur', form);
      setFormState(prev => ({
        ...prev,
        [field]: fieldState
      }))

      if (fieldState.state === 'error') {
        valid = false;
      }
    }

    if (valid) {
      try {
        setLoggingInLoading(true);
        await signInWithEmailAndPassword(auth, form.email, form.password)
        const user = await addOrGetUserApi({ email: form.email })
        dispatch(addUser({ user }));
        setLoggingInLoading(false);
        navigate('/');
      } catch (err) {
        console.log('LOG IN ERR: ', err)
        if (
          err.message.includes('auth/account-exists-with-different-credential') ||
          err.message.includes('auth/email-already-in-use')
        ) {
          toast.error('Your email is already in use', {
            position: 'top-center'
          })
        }

        if (err.message.includes('auth/invalid-login-credentials')) {
          toast.error('Your credentials are invalid', {
            position: 'top-center'
          })
        }

        setLoggingInLoading(false);
      }
    }
  };

  const onSignUp = async () => {
    let valid = true;
    for (const field of ['firstName', 'lastName', 'password', 'confirmPassword']) {
      const fieldState = validator(field, form[field], 'blur', form);
      setFormState(prev => ({
        ...prev,
        [field]: fieldState
      }))

      if (fieldState.state === 'error') {
        valid = false;
      }
    }

    if (valid) {
      try {
        setSignUpLoading(true);
        await createUserWithEmailAndPassword(auth, form.email, form.password)
        const newUser = {
          email: form.email,
          firstName: form.firstName,
          lastName: form.lastName
        };
        await addOrGetUserApi(newUser)
        dispatch(addUser({ user: newUser }));
        setSignUpLoading(false);
        navigate('/');
      } catch (err) {
        console.log('SIGN UP ERR: ', err)
        if (
          err.message.includes('auth/account-exists-with-different-credential') ||
          err.message.includes('auth/email-already-in-use')
        ) {
          toast.error('Your email is already in use', {
            position: 'top-center'
          })
        }

        setSignUpLoading(false);
      }
    }
  };

  const onResetPassword = async () => {
    let valid = true;
    for (const field of ['email']) {
      const fieldState = validator(field, form[field], 'blur', form);
      setFormState(prev => ({
        ...prev,
        [field]: fieldState
      }))

      if (fieldState.state === 'error') {
        valid = false;
      }
    }

    if (valid) {
      try {
        setResetPasswordLoading(true);
        await sendPasswordResetEmail(auth, form.email);
        setResetPasswordLoading(false);
        onBackToEmail();
      } catch (err) {
        setResetPasswordLoading(false);
        console.log('RESET PASSWORD ERR: ', err)
      }
    }
  };

  const onUseEmailToLogin = () => {
    let valid = true;
    for (const field of ['email']) {
      const fieldState = validator(field, form.email, 'blur', form);
      setFormState(prev => ({
        ...prev,
        [field]: fieldState
      }))

      if (fieldState.state === 'error') {
        valid = false;
      }
    }

    if (valid) {
      setUseEmailToLogin(prev => !prev);
    }
  };

  const onUseSignUp = () => {
    setUseSignUp(true);
  };

  const onUseResetPassword = () => {
    setUseResetPassword(true);
  };

  const onBackToEmail = () => {
    if (useSignUp) {
      setUseSignUp(false);
    } else if (useResetPassword) {
      setUseResetPassword(false);
    } else {
      setUseEmailToLogin(false);
    }
  };

  const onToggleShowPassword = () => {
    setShowPassword(prev => !prev);
  };

  const onToggleShowConfirmPassword = () => {
    setShowConfirmPassword(prev => !prev);
  };

  const onInputChange = (e) => {
    const value = e.target.value;
    const name = e.target.name;

    setForm(prev => ({
      ...prev,
      [name]: value
    }));

    const state = validator(name, value, 'change', form);
    setFormState(prev => ({
      ...prev,
      [name]: state
    }))
  };

  const onInputBlur = (e) => {
    const value = e.target.value;
    const name = e.target.name;

    const state = validator(name, value, 'blur', form);
    setFormState(prev => ({
      ...prev,
      [name]: state
    }))
  };

  return (
    <div className="h-full sm:h-auto h-full flex min-h-full flex-1 flex-col justify-center sm:py-12 sm:px-6 lg:px-8">
      <BgImg/>
      <div className="h-full sm:mx-auto sm:w-full sm:max-w-[480px]">
        <div className="h-full bg-white shadow sm:rounded-lg">
          <div className="h-full">
            {useResetPassword && (
              <>
                <div className="flex items-center justify-center relative px-1 py-2 border-b border-gray-300">
                  <button
                    type="button"
                    className="absolute left-2 rounded-full bg-white p-1 hover:bg-gray-100 focus-visible:outline-orange-600"
                    onClick={onBackToEmail}
                  >
                    <Icon type="chevron-left" className="size-7 text-gray-600 -translate-x-0.5" />
                  </button>
                  <h2 className="text-center text-xl font-bold leading-9 tracking-tight text-gray-900">
                    Reset your password
                  </h2>
                </div>

                <div className="px-6 py-6 sm:px-12">
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium leading-6 text-gray-900">
                      Email address
                    </label>
                    <div className="relative mt-2">
                      <input
                        id="email"
                        name="email"
                        type="email"
                        required
                        autoComplete="email"
                        className={`
                          font-sans block w-full rounded-md border-0 py-3 text-gray-900 shadow-sm ring-1 ring-inset
                          ${formState?.email?.state === 'error' ? 'ring-red-700' : 'ring-gray-300'}
                          ${formState?.email?.state === 'error' ? 'focus:ring-red-700' : 'focus:ring-orange-600'}
                          placeholder:text-gray-400 focus:ring-2 focus:ring-inset sm:text-sm sm:leading-6
                        `}
                        onChange={onInputChange}
                        onBlur={onInputBlur}
                        value={form.email}
                      />
                      {formState?.email?.state === 'error' && (
                        <Icon type="error" className="h-5 w-5 text-red-700 absolute top-1/2 -translate-y-1/2 right-2" />
                      )}
                    </div>
                    {formState?.email?.state === 'error' && (
                      <div className="mt-1 text-red-700 text-xs">
                        {formState.email.errorMessage}
                      </div>
                    )}
                  </div>

                  <div className="mt-4">
                    <button
                      type="button"
                      className="relative flex w-full justify-center items-center mb-4 rounded-md bg-orange-600 px-4 py-3 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-orange-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-600"
                      onClick={onResetPassword}
                    >
                      {resetPasswordLoading && (
                        <Icon type="loader" className="h-5 w-5 absolute left-4" spinnerColor={colors.cyan600} spinnerBackgroundColor={colors.grey300} />
                      )}
                      Reset your password
                    </button>
                  </div>
                </div>
              </>

            )}
            {useEmailToLogin && !useSignUp && (
              <>
                <div className="flex items-center justify-center relative px-1 py-2 border-b border-gray-300">
                  <button
                    type="button"
                    className="absolute left-2 rounded-full bg-white p-1 hover:bg-gray-100 focus-visible:outline-orange-600"
                    onClick={onBackToEmail}
                  >
                    <Icon type="chevron-left" className="size-7 text-gray-600 -translate-x-0.5" />
                  </button>
                  <h2 className="text-center text-xl font-bold leading-9 tracking-tight text-gray-900">
                    Log in
                  </h2>
                </div>

                <div className="px-6 py-6 sm:px-12">
                  <div>
                    <label htmlFor="lastName" className="block text-sm font-medium leading-6 text-gray-900">
                      Password
                    </label>
                    <div className="relative mt-2">
                      <input
                        id="password"
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        required
                        className={`
                          font-sans block w-full rounded-md border-0 py-3 text-gray-900 shadow-sm ring-1 ring-inset
                          ${formState?.password?.state === 'error' ? 'ring-red-700' : 'ring-gray-300'}
                          ${formState?.password?.state === 'error' ? 'focus:ring-red-700' : 'focus:ring-orange-600'}
                          placeholder:text-gray-400 focus:ring-2 focus:ring-inset sm:text-sm sm:leading-6
                        `}
                        onChange={onInputChange}
                        onBlur={onInputBlur}
                        value={form.password}
                      />
                      {formState?.password?.state === 'error' && (
                        <Icon type="error" className="h-5 w-5 text-red-700 absolute top-1/2 -translate-y-1/2 right-2" />
                      )}
                      {formState?.password?.state !== 'error' && (
                        <button type="button" onClick={onToggleShowPassword} className="absolute inset-y-0 end-0 flex items-center z-20 px-3 cursor-pointer text-gray-400 rounded-e-md focus:outline-none focus:text-orange-600 dark:text-neutral-600 dark:focus:text-orange-600">
                          {!showPassword && <Icon type="eye-slash" className="h-5 w-5" />}
                          {showPassword && <Icon type="eye" className="h-5 w-5" />}
                        </button>
                      )}
                    </div>
                    {formState?.password?.state === 'error' && (
                      <div className="mt-1 text-red-700 text-xs">
                        {formState.password.errorMessage}
                      </div>
                    )}
                  </div>

                  <div className="mt-4">
                    <button
                      type="button"
                      className="relative flex w-full justify-center items-center rounded-md bg-orange-600 px-4 py-3 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-orange-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-600"
                      onClick={onLogIn}
                    >
                      {loggingInLoading && (
                        <Icon type="loader" className="h-5 w-5 absolute left-4" spinnerColor={colors.cyan600} spinnerBackgroundColor={colors.grey300} />
                      )}
                      Continue with log in
                    </button>
                  </div>

                  <div className="relative mt-6">
                    <div aria-hidden="true" className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-200" />
                    </div>
                    <div className="relative flex justify-center text-sm font-medium leading-6">
                      <span className="bg-white px-6 text-gray-900">Or continue with</span>
                    </div>
                  </div>

                  <div className="mt-6">
                    <button
                      className="relative mb-4 flex w-full items-center justify-center gap-3 rounded-md bg-white px-4 py-3 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus-visible:ring-transparent focus-visible:outline-orange-600"
                      onClick={onUseSignUp}
                    >
                      <span className="text-sm font-semibold leading-6">Sign up</span>
                    </button>
                  </div>
                </div>
              </>
            )}

            {useSignUp && (
              <>
                <div className="flex items-center justify-center relative px-1 py-2 border-b border-gray-300">
                  <button
                    type="button"
                    className="absolute left-2 rounded-full bg-white p-1 hover:bg-gray-100 focus-visible:outline-orange-600"
                    onClick={onBackToEmail}
                  >
                    <Icon type="chevron-left" className="size-7 text-gray-600 -translate-x-0.5" />
                  </button>
                  <h2 className="text-center text-xl font-bold leading-9 tracking-tight text-gray-900">
                    Finish signing up
                  </h2>
                </div>

                <div className="px-6 py-6 sm:px-12">
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-medium leading-6 text-gray-900">
                      First name
                    </label>
                    <div className="relative mt-2">
                      <input
                        id="firstName"
                        name="firstName"
                        type="text"
                        required
                        autoComplete="given-name"
                        className={`
                          font-sans block w-full rounded-md border-0 py-3 text-gray-900 shadow-sm ring-1 ring-inset
                          ${formState?.firstName?.state === 'error' ? 'ring-red-700' : 'ring-gray-300'}
                          ${formState?.firstName?.state === 'error' ? 'focus:ring-red-700' : 'focus:ring-orange-600'}
                          placeholder:text-gray-400 focus:ring-2 focus:ring-inset sm:text-sm sm:leading-6
                        `}
                        onChange={onInputChange}
                        onBlur={onInputBlur}
                        value={form.firstName}
                      />
                      {formState?.firstName?.state === 'error' && (
                        <Icon type="error" className="h-5 w-5 text-red-700 absolute top-1/2 -translate-y-1/2 right-2" />
                      )}
                    </div>
                    {formState?.firstName?.state === 'error' && (
                      <div className="mt-1 text-red-700 text-xs">
                        {formState.firstName.errorMessage}
                      </div>
                    )}
                  </div>

                  <div className="mt-4">
                    <label htmlFor="lastName" className="block text-sm font-medium leading-6 text-gray-900">
                      Last name
                    </label>
                    <div className="relative mt-2">
                      <input
                        id="lastName"
                        name="lastName"
                        type="text"
                        required
                        autoComplete="family-name"
                        className={`
                          font-sans block w-full rounded-md border-0 py-3 text-gray-900 shadow-sm ring-1 ring-inset
                          ${formState?.lastName?.state === 'error' ? 'ring-red-700' : 'ring-gray-300'}
                          ${formState?.lastName?.state === 'error' ? 'focus:ring-red-700' : 'focus:ring-orange-600'}
                          placeholder:text-gray-400 focus:ring-2 focus:ring-inset sm:text-sm sm:leading-6
                        `}
                        onChange={onInputChange}
                        onBlur={onInputBlur}
                        value={form.lastName}
                      />
                      {formState?.lastName?.state === 'error' && (
                        <Icon type="error" className="h-5 w-5 text-red-700 absolute top-1/2 -translate-y-1/2 right-2" />
                      )}
                    </div>
                    {formState?.lastName?.state === 'error' && (
                      <div className="mt-1 text-red-700 text-xs">
                        {formState.lastName.errorMessage}
                      </div>
                    )}
                  </div>

                  <div className="mt-4">
                    <label htmlFor="lastName" className="block text-sm font-medium leading-6 text-gray-900">
                      Password
                    </label>
                    <div className="relative mt-2">
                      <input
                        id="password"
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        required
                        className={`
                          font-sans block w-full rounded-md border-0 py-3 text-gray-900 shadow-sm ring-1 ring-inset
                          ${formState?.password?.state === 'error' ? 'ring-red-700' : 'ring-gray-300'}
                          ${formState?.password?.state === 'error' ? 'focus:ring-red-700' : 'focus:ring-orange-600'}
                          placeholder:text-gray-400 focus:ring-2 focus:ring-inset sm:text-sm sm:leading-6
                        `}
                        onChange={onInputChange}
                        onBlur={onInputBlur}
                        value={form.password}
                      />
                      {formState?.password?.state === 'error' && (
                        <Icon type="error" className="h-5 w-5 text-red-700 absolute top-1/2 -translate-y-1/2 right-2" />
                      )}
                      {formState?.password?.state !== 'error' && (
                        <button type="button" onClick={onToggleShowPassword} className="absolute inset-y-0 end-0 flex items-center z-20 px-3 cursor-pointer text-gray-400 rounded-e-md focus:outline-none focus:text-orange-600 dark:text-neutral-600 dark:focus:text-orange-600">
                          {!showPassword && <Icon type="eye-slash" className="h-5 w-5" />}
                          {showPassword && <Icon type="eye" className="h-5 w-5" />}
                        </button>
                      )}
                    </div>
                    {formState?.password?.state === 'error' && (
                      <div className="mt-1 text-red-700 text-xs">
                        {formState.password.errorMessage}
                      </div>
                    )}
                  </div>

                  <div className="mt-4">
                    <label htmlFor="lastName" className="block text-sm font-medium leading-6 text-gray-900">
                      Confirm Password
                    </label>
                    <div className="relative mt-2">
                      <input
                        id="confirmPassword"
                        name="confirmPassword"
                        type={showConfirmPassword ? 'text' : 'password'}
                        required
                        className={`
                          font-sans block w-full rounded-md border-0 py-3 text-gray-900 shadow-sm ring-1 ring-inset
                          ${formState?.confirmPassword?.state === 'error' ? 'ring-red-700' : 'ring-gray-300'}
                          ${formState?.confirmPassword?.state === 'error' ? 'focus:ring-red-700' : 'focus:ring-orange-600'}
                          placeholder:text-gray-400 focus:ring-2 focus:ring-inset sm:text-sm sm:leading-6
                        `}
                        onChange={onInputChange}
                        onBlur={onInputBlur}
                        value={form.confirmPassword}
                      />
                      {formState?.confirmPassword?.state === 'error' && (
                        <Icon type="error" className="h-5 w-5 text-red-700 absolute top-1/2 -translate-y-1/2 right-2" />
                      )}
                      {formState?.confirmPassword?.state !== 'error' && (
                        <button type="button" onClick={onToggleShowConfirmPassword} className="absolute inset-y-0 end-0 flex items-center z-20 px-3 cursor-pointer text-gray-400 rounded-e-md focus:outline-none focus:text-orange-600 dark:text-neutral-600 dark:focus:text-orange-600">
                          {!showConfirmPassword && <Icon type="eye-slash" className="h-5 w-5" />}
                          {showConfirmPassword && <Icon type="eye" className="h-5 w-5" />}
                        </button>
                      )}
                    </div>
                    {formState?.confirmPassword?.state === 'error' && (
                      <div className="mt-1 text-red-700 text-xs">
                        {formState.confirmPassword.errorMessage}
                      </div>
                    )}
                  </div>

                  <div className="mt-10">
                    <button
                      type="button"
                      className="relative flex w-full justify-center items-center rounded-md bg-orange-600 px-4 py-3 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-orange-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-600"
                      onClick={onSignUp}
                    >
                      {signUpLoading && (
                        <Icon type="loader" className="h-5 w-5 absolute left-4" spinnerColor={colors.cyan600} spinnerBackgroundColor={colors.grey300} />
                      )}
                      Agree and continue
                    </button>
                  </div>
                </div>
              </>
            )}
            {!useEmailToLogin && !useSignUp && !useResetPassword && (
              <div className="h-full flex flex-col justify-center px-6 py-12 sm:px-12">
                <form>
                  <div className="sm:mx-auto sm:w-full sm:max-w-md">
                    <img
                      alt="Your Company"
                      src="./hoop-trackr-logo-text.svg"
                      className="mx-auto h-16 w-auto"
                    />
                    <img
                      alt="Your Company"
                      src="./hoop-trackr-logo-ball.svg"
                      className="mx-auto h-60 w-auto"
                    />
                    <h2 className="mt-6 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900">
                      Log in or sign up
                    </h2>
                  </div>
                  <div className="mt-4">
                    <label htmlFor="email" className="block text-sm font-medium leading-6 text-gray-900">
                      Email address
                    </label>
                    <div className="relative mt-2">
                      <input
                        id="email"
                        name="email"
                        type="email"
                        required
                        autoComplete="email"
                        className={`
                          font-sans block w-full rounded-md border-0 py-3 text-gray-900 shadow-sm ring-1 ring-inset
                          ${formState?.email?.state === 'error' ? 'ring-red-700' : 'ring-gray-300'}
                          ${formState?.email?.state === 'error' ? 'focus:ring-red-700' : 'focus:ring-orange-600'}
                          placeholder:text-gray-400 focus:ring-2 focus:ring-inset sm:text-sm sm:leading-6
                        `}
                        onChange={onInputChange}
                        onBlur={onInputBlur}
                        value={form.email}
                      />
                      {formState?.email?.state === 'error' && (
                        <Icon type="error" className="h-5 w-5 text-red-700 absolute top-1/2 -translate-y-1/2 right-2" />
                      )}
                    </div>
                    {formState?.email?.state === 'error' && (
                      <div className="mt-1 text-red-700 text-xs">
                        {formState.email.errorMessage}
                      </div>
                    )}
                  </div>

                  <div className="mt-2">
                    <div className="text-xs leading-6">
                      <a href="#" onClick={onUseResetPassword} className="font-semibold text-orange-600 hover:text-orange-500 outline-orange-600">
                        Forgot password?
                      </a>
                    </div>
                  </div>

                  <div className="mt-4">
                    <button
                      type="button"
                      className="relative flex w-full justify-center items-center rounded-md bg-orange-600 px-4 py-3 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-orange-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-600"
                      onClick={onUseEmailToLogin}
                    >
                      Continue with email
                    </button>
                  </div>
                </form>

                <div>
                  <div className="relative mt-6">
                    <div aria-hidden="true" className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-200" />
                    </div>
                    <div className="relative flex justify-center text-sm font-medium leading-6">
                      <span className="bg-white px-6 text-gray-900">Or continue with</span>
                    </div>
                  </div>

                  <div className="mt-6">
                    <button
                      className="relative mb-4 flex w-full items-center justify-center gap-3 rounded-md bg-white px-4 py-3 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus-visible:ring-transparent focus-visible:outline-orange-600"
                      onClick={loginWithGoogle}
                    >
                      {!loginWithGoogleLoading && (
                        <Icon type="google" className="h-5 w-5 absolute left-4" />
                      )}
                      {loginWithGoogleLoading && (
                        <Icon type="loader" className="h-5 w-5 absolute left-4" spinnerColor={colors.orange600} spinnerBackgroundColor={colors.grey300} />
                      )}
                      <span className="text-sm font-semibold leading-6">Continue with Google</span>
                    </button>

                    <button
                      className="relative flex w-full items-center justify-center gap-3 rounded-md bg-white px-4 py-3 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus-visible:ring-transparent focus-visible:outline-orange-600"
                      onClick={loginWithFacebook}
                    >
                      {!loginWithFacebookLoading && (
                        <Icon type="facebook" className="h-5 w-5 absolute left-4" />
                      )}
                      {loginWithFacebookLoading && (
                        <Icon type="loader" className="h-5 w-5 absolute left-4" spinnerColor={colors.orange600} spinnerBackgroundColor={colors.grey300} />
                      )}
                      <span className="text-sm font-semibold leading-6">Continue with Facebook</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
};

export default Login;
