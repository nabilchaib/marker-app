import { useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import Cropper from 'react-easy-crop'
import Slider from '@mui/material/Slider';
import { PlusIcon, MinusIcon } from '@heroicons/react/24/solid'

import { addPlayerCache, editPlayer } from '../../redux/players-reducer';
import Icon from '../../components/Icon';
import { editPlayerApi } from '../../firebase/api';
import { colors, getCroppedImg, validator } from '../../utils';


export default function EditPlayer() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const initialForm = {
    playerName: '',
    playerNumber: '',
  };
  const [formState, setFormState] = useState({});
  const [avatarToUpload, setAvatarToUpload] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null)
  const [updatePlayerLoading, setUpdatePlayerLoading] = useState(false);
  const [croppedImageUrl, setCroppedImageUrl] = useState(null)
  const fileInputRef = useRef(null);

  const playerToEdit = useSelector(state => state.players.editing);
  const newCroppedImageUrl = croppedImageUrl || playerToEdit.avatarUrl;

  const onCropComplete = (croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels)
  }

  const onCancelCropping = () => {
    setAvatarToUpload(null);
  };

  const showCroppedImage = async () => {
    try {
      const croppedImage = await getCroppedImg(
        avatarToUpload,
        croppedAreaPixels,
      )

      setCroppedImageUrl(URL.createObjectURL(croppedImage))
      setAvatarToUpload(null);
    } catch (e) {
      console.error(e)
    }
  }

  const readFile = (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.addEventListener('load', () => resolve(reader.result), false);
      reader.readAsDataURL(file);
    })
  };

  const onUploadPlayerAvatar = async (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0]
      let imageDataUrl = await readFile(file)
      setAvatarToUpload(imageDataUrl)
    }
  }

  const onSelectPlayerAvatar = () => {
    fileInputRef.current.click();
  };

  const onInputChange = (e) => {
    const value = e.target.value;
    const name = e.target.name;

    dispatch(addPlayerCache({
      player: {
        [name]: value
      }
    }));

    const state = validator(name, value, 'change', playerToEdit, true);
    setFormState(prev => ({
      ...prev,
      [name]: state
    }))
  };

  const onInputBlur = (e) => {
    const value = e.target.value;
    const name = e.target.name;

    const state = validator(name, value, 'blur', playerToEdit, true);
    setFormState(prev => ({
      ...prev,
      [name]: state
    }))
  };

  const onRandomNumber = () => {
    const randomNumber = Math.floor(Math.random() * 100);
    dispatch(addPlayerCache({
      player: {
        number: randomNumber
      }
    }));

    const state = validator('playerNumber', randomNumber, 'blur', playerToEdit, true);
    setFormState(prev => ({
      ...prev,
      playerNumber: state
    }))
  };

  const onUpdateNewPlayer = async () => {
    let valid = true;
    for (const field of ['name', 'number']) {
      const fieldState = validator(field, playerToEdit[field], 'blur', playerToEdit, true);
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
        setUpdatePlayerLoading(true);

        const payload = {
          player: {
            id: playerToEdit.id,
            name: playerToEdit.name,
            number: parseInt(playerToEdit.number),
            createdBy: playerToEdit.createdBy,
          }
        };

        if (playerToEdit.avatarUrl) {
          payload.player.avatarUrl = playerToEdit.avatarUrl;
        }

        if (croppedImageUrl) {
          payload.image = croppedImageUrl;
        }

        const newPlayer = await editPlayerApi(payload);
        dispatch(editPlayer({ player: newPlayer }));
        setUpdatePlayerLoading(false);
        navigate(-1);
      } catch (err) {
        console.log('ON EDIT PLAYER API ERR: ', err);
        setUpdatePlayerLoading(false);
      }
    }
  };

  const renderCropper = () => {
    return (
      <div>
        <div className="relative w-full h-96">
          <Cropper
            image={avatarToUpload}
            crop={crop}
            zoom={zoom}
            aspect={1}
            cropShape="round"
            showGrid={false}
            onCropChange={setCrop}
            onCropComplete={onCropComplete}
            onZoomChange={setZoom}
          />
        </div>
        <div className="p-4 sm:p-6 lg:p-8">
          <div className="flex items-center gap-x-4">
            <MinusIcon aria-hidden="true" className="-ml-0.5 mr-1.5 h-5 w-5" />
            <Slider
              value={zoom}
              min={1}
              max={3}
              step={0.1}
              aria-labelledby="Zoom"
              classes={{ root: {} }}
              onChange={(e, zoom) => setZoom(zoom)}
            />
            <PlusIcon aria-hidden="true" className="-ml-0.5 mr-1.5 h-5 w-5" />
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-end mt-8">
            <button
              type="button"
              className="flex justify-center mr-0 mb-2 sm:mr-2 sm:mb-0 w-full sm:w-auto border border-gray-300 rounded-md bg-white px-3 py-2 text-sm font-semibold shadow-sm hover:bg-orange-600 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-600"
              onClick={onCancelCropping}
            >
              Cancel
            </button>
            <button
              type="button"
              className="flex justify-center w-full sm:w-auto rounded-md bg-orange-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-orange-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-600"
              onClick={showCroppedImage}
            >
              Continue
            </button>
          </div>
        </div>
      </div>
    );
  };

  if (avatarToUpload) {
    return renderCropper();
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <h2 className="text-base font-semibold leading-6 text-gray-900">Edit player {playerToEdit.name}</h2>

      <div className="mt-8">

        <div className="flex flex-col items-center">
          <div className="group flex">
            {newCroppedImageUrl && (
              <button onClick={onSelectPlayerAvatar} className="rounded-full active:scale-95 focus-visible:outline-orange-600">
                <input ref={fileInputRef} type="file" onChange={onUploadPlayerAvatar} accept="image/*" style={{ display: "none" }} />
                <img className="rounded-full h-24 w-24" src={newCroppedImageUrl} />
              </button>
            )}
            {!newCroppedImageUrl && (
              <button onClick={onSelectPlayerAvatar} className="group flex items-center justify-center h-24 w-24 border rounded-full border-gray-300 group-hover:border-orange-600 active:scale-95 group-active:border-orange-600 focus-visible:outline-orange-600 focus-within:border-orange-600">
                <input ref={fileInputRef} type="file" onChange={onUploadPlayerAvatar} accept="image/*" style={{ display: "none" }} />
                <Icon type="jersey" className="mx-auto h-16 w-16 text-gray-300 group-hover:text-orange-600 group-focus:text-orange-600" />
              </button>
            )}
          </div>
          <h2 className="mt-2 text-sm font-semibold text-gray-800">Upload new player avatar</h2>
        </div>
        <div className="mt-4 flex flex-col sm:flex-row sm:justify-between items-start">
          <div className="w-full sm:w-2/5">
            <label htmlFor="playerName" className="block text-sm font-medium leading-6 text-gray-900">
              Player name
            </label>
            <div className="relative mt-2">
              <input
                id="playerName"
                name="name"
                type="text"
                required
                className={`
                  font-sans block w-full rounded-md border-0 py-3 text-gray-900 shadow-sm ring-1 ring-inset
                  ${formState.name?.state === 'error' ? 'ring-red-700' : 'ring-gray-300'}
                  ${formState.name?.state === 'error' ? 'focus:ring-red-700' : 'focus:ring-orange-600'}
                  placeholder:text-gray-400 ring-gray-300 focus:ring-orange-600 focus:ring-2 focus:ring-inset sm:text-sm sm:leading-6
                `}
                value={playerToEdit.name}
                onChange={onInputChange}
                onBlur={onInputBlur}
              />
              {formState.name?.state === 'error' && (
                <Icon type="error" className="h-5 w-5 text-red-700 absolute top-1/2 -translate-y-1/2 right-2" />
              )}
            </div>
            {formState.name?.state === 'error' && (
              <div className="mt-1 text-red-700 text-xs">
                {formState.name?.errorMessage}
              </div>
            )}
          </div>

          <div className="w-full sm:w-2/5 mt-2 sm:mt-0">
            <label htmlFor="playerNumber" className="block text-sm font-medium leading-6 text-gray-900">
              Player number
            </label>
            <div className="flex mt-2">
              <div className="w-full relative">
                <input
                  id="playerNumber"
                  name="number"
                  type="number"
                  max={99}
                  min={0}
                  required
                  className={`
                    arrow-hide font-sans block w-full rounded-l-md border-0 py-3 text-gray-900 shadow-sm ring-1 ring-inset
                    ${formState.number?.state === 'error' ? 'ring-red-700' : 'ring-gray-300'}
                    ${formState.number?.state === 'error' ? 'focus:ring-red-700' : 'focus:ring-orange-600'}
                    placeholder:text-gray-400 ring-gray-300 focus:ring-orange-600 focus:ring-2 focus:ring-inset sm:text-sm sm:leading-6
                  `}
                  value={playerToEdit.number}
                  onChange={onInputChange}
                  onBlur={onInputBlur}
                />
                {formState.number?.state === 'error' && (
                  <Icon type="error" className="h-5 w-5 text-red-700 absolute top-1/2 -translate-y-1/2 right-2" />
                )}
              </div>

              <button
                type="button"
                className="h-12 inline-flex items-center rounded-r-md bg-orange-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-orange-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-orange-700"
                onClick={onRandomNumber}
              >
                Random number
              </button>
            </div>
            {formState.number?.state === 'error' && (
              <div className="mt-1 text-red-700 text-xs">
                {formState.number?.errorMessage}
              </div>
            )}
          </div>
        </div>

        <div className="mt-6">
          <button
            type="button"
            className="w-full sm:w-auto inline-flex items-center rounded-md bg-orange-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-orange-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-600"
            onClick={onUpdateNewPlayer}
          >
            {updatePlayerLoading && (
              <Icon type="loader" className="h-5 w-5 mr-2" spinnerColor={colors.orange600} spinnerBackgroundColor={colors.grey300} />
            )}
            Update new player
          </button>
        </div>
      </div>
    </div>
  )
}
