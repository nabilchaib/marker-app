import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import Cropper from 'react-easy-crop'
import Slider from '@mui/material/Slider';
import { EllipsisHorizontalIcon, PlusIcon, MinusIcon } from '@heroicons/react/24/solid'
import { toast } from 'react-toastify'

import { getPlayersApi, addTeamApi } from '../../firebase/api';
import { addPlayers } from '../../redux/players-reducer';
import { addTeam, addTeamCache, addPlayerToTeamCache, removePlayerFromTeamCache } from '../../redux/teams-reducer';
import Icon from '../../components/Icon';
import { colors, getCroppedImg, validator, classNames } from '../../utils';


export default function AddTeam() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [teamNameState, setTeamState] = useState({});
  const [avatarToUpload, setAvatarToUpload] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null)
  const [getPlayersLoading, setGetPlayersLoading] = useState(false);
  const [createTeamLoading, setCreateTeamLoading] = useState(false);
  const [playersInTeam, setPlayersInTeam] = useState([]);
  const fileInputRef = useRef(null);

  const user = useSelector(state => state.user);
  const players = useSelector(state => state.players);
  const teams = useSelector(state => state.teams);
  const teamName = teams.editing.name;
  const croppedImage = teams.editing.avatar;
  const croppedImageUrl = teams.editing.avatarUrl;

  useEffect(() => {
    const inTeam = [];
    for (const playerId of players.allIds) {
      const player = players.byId[playerId];
      if (teams.editing.players[playerId]?.toAdd) {
        inTeam.push(player.id);
      }
    }

    setPlayersInTeam(inTeam);
  }, [players, teams]);

  useEffect(() => {
    const fetchPlayers = async () => {
      try {
        setGetPlayersLoading(true);
        const players = await getPlayersApi({ user });
        dispatch(addPlayers({ players }));
        setGetPlayersLoading(false);
      } catch (err) {
        console.log('FETCH PLAYERS ERR: ', err);
        setGetPlayersLoading(false);
      }
    };

    if (user?.email) {
      fetchPlayers();
    }
  }, [user?.email]);

  const onCropComplete = (croppedArea, croppedAreaPixels) => {
    console.log('COMPLETE')
    setCroppedAreaPixels(croppedAreaPixels)
  }

  const onCancelCropping = () => {
    console.log('CANCEL CROPPING')
    setAvatarToUpload(null);
  };

  const showCroppedImage = async () => {
    try {
      const croppedImage = await getCroppedImg(
        avatarToUpload,
        croppedAreaPixels,
      )

      dispatch(addTeamCache({ avatarUrl: URL.createObjectURL(croppedImage), avatar: croppedImage }));
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

  const onUploadTeamAvatar = async (e) => {
    console.log('UPLOAD')
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0]
      let imageDataUrl = await readFile(file)
      setAvatarToUpload(imageDataUrl)
    }
  }

  const onSelectTeamAvatar = () => {
    fileInputRef.current.click();
  };

  const onTeamNameChange = (e) => {
    const value = e.target.value;
    const name = e.target.name;
    dispatch(addTeamCache({ name: value }));
    const state = validator(name, value, 'change', {}, true);
    setTeamState(state);
  };

  const onTeamNameBlur = (e) => {
    const value = e.target.value;
    const name = e.target.name;

    const state = validator(name, value, 'blur', {}, true);
    setTeamState(state);
  };

  const onNewPlayer = () => {
    navigate('/games/teams/players/create')
  };

  const onCreateNewTeam = async () => {
    const fieldState = validator('teamName', teamName, 'blur', {}, true);
    setTeamState(fieldState);

    if (fieldState.state === 'error') {
      return false;
    }

    try {
      setCreateTeamLoading(true);
      const team = {
        name: teamName,
        players: Object.values(teams.editing.players)
          .filter(player => player.toAdd)
          .map(player => player.id),
        createdBy: user.email
      };

      const payload = { team };
      if (croppedImage) {
        payload.image = croppedImage;
      }

      const newTeam = await addTeamApi({ team, image: croppedImage });
      if (newTeam?.isDuplicate) {
        toast.error('This team name is already in use', {
          position: 'top-center'
        })
        setCreateTeamLoading(false);
        return false;
      }

      dispatch(addTeam({ team: newTeam }));
      setCreateTeamLoading(false);
      navigate(-1);
    } catch (err) {
      console.log('ON CREATE TEAM API ERR: ', err);
      setCreateTeamLoading(false);
    }
  };

  const onAddPlayerToTeam = (player) => {
    dispatch(addPlayerToTeamCache({ player }));
  };

  const onRemovePlayerFromTeam = (player) => {
    dispatch(removePlayerFromTeamCache({ player }));
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
      <h2 className="text-base font-semibold leading-6 text-gray-900">Create a new team</h2>

      <div className="mt-8">

        <div className="flex flex-col items-center">
          <div className="group flex">
            {croppedImageUrl && (
              <button onClick={onSelectTeamAvatar} className="rounded-full active:scale-95">
                <input ref={fileInputRef} type="file" onChange={onUploadTeamAvatar} accept="image/*" style={{ display: "none" }} />
                <img className="rounded-full h-24 w-24" src={croppedImageUrl} />
              </button>
            )}
            {!croppedImageUrl && (
              <button onClick={onSelectTeamAvatar} className="flex items-center justify-center h-24 w-24 border rounded-full border-gray-300 group-hover:border-orange-600 group-active:scale-95">
                <input ref={fileInputRef} type="file" onChange={onUploadTeamAvatar} accept="image/*" style={{ display: "none" }} />
                <Icon type="jersey" className="mx-auto h-16 w-16 text-gray-300 group-hover:text-orange-600" />
              </button>
            )}
          </div>
          <h2 className="mt-2 text-sm font-semibold text-gray-800">Upload new team avatar</h2>
        </div>
        <div className="flex justify-between items-end">
          <div className="w-full sm:w-2/5">
            <label htmlFor="teamName" className="block text-sm font-medium leading-6 text-gray-900">
              Team name
            </label>
            <div className="relative mt-2">
              <input
                id="teamName"
                name="teamName"
                type="text"
                required
                className={`
                  font-sans block w-full rounded-md border-0 py-3 text-gray-900 shadow-sm ring-1 ring-inset
                  ${teamNameState.state === 'error' ? 'ring-red-700' : 'ring-gray-300'}
                  ${teamNameState.state === 'error' ? 'focus:ring-red-700' : 'focus:ring-orange-600'}
                  placeholder:text-gray-400 ring-gray-300 focus:ring-orange-600 focus:ring-2 focus:ring-inset sm:text-sm sm:leading-6
                `}
                value={teamName}
                onChange={onTeamNameChange}
                onBlur={onTeamNameBlur}
              />
              {teamNameState.state === 'error' && (
                <Icon type="error" className="h-5 w-5 text-red-700 absolute top-1/2 -translate-y-1/2 right-2" />
              )}
            </div>
            {teamNameState.state === 'error' && (
              <div className="mt-1 text-red-700 text-xs">
                {teamNameState.errorMessage}
              </div>
            )}
          </div>
        </div>

        <div>
          <h2 className="mt-8 text-base font-semibold leading-6 text-gray-900">Players in your team</h2>
          {playersInTeam.length <= 0 && (
            <div className="mt-4 text-center border rounded-md p-6">
              <Icon type="jersey" className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-semibold text-gray-900">No players</h3>
              <p className="mt-1 text-sm text-gray-500">Your team currently has no players.</p>
            </div>
          )}
          {playersInTeam.length > 0 && (
            <ul role="list" className="mt-6 divide-y divide-gray-200 border-b border-t border-gray-200">
              {playersInTeam.map((playerId) => {
                const player = players.byId[playerId];
                return (
                  <li onClick={() => onRemovePlayerFromTeam(player)} key={player.id} className="hover:bg-orange-100 cursor-pointer">
                    <div className="group flex items-center p-4">
                      <div className="mr-3">
                        {player.avatarUrl && (
                          <img className="rounded-full h-10 w-10" src={player.avatarUrl} />
                        )}
                        {!player.avatarUrl && (
                          <span className="border border-gray-300 relative inline-flex p-2 h-10 w-10 items-center justify-center rounded-full">
                            <Icon type="jersey" className="mx-auto h-6 w-6 text-gray-400" />
                          </span>
                        )}
                      </div>
                      <div className="min-w-0 flex-1 flex justify-between items-center">
                        <div className="flex items-center">
                          <p className="mr-3 text-sm text-gray-500">#{player.number}</p>
                          <div className="text-sm font-medium text-gray-900">
                            <a>
                              {player.name}
                            </a>
                          </div>
                        </div>
                      </div>
                      <div className="flex-shrink-0 self-center">
                        <EllipsisHorizontalIcon aria-hidden="true" className="h-5 w-5 text-gray-400 group-hover:text-gray-500" />
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}

          <div>
            <div className="mt-8 flex items-center justify-between">
              <h2 className="text-base font-semibold leading-6 text-gray-900">Select players for your team</h2>
              {players.allIds.length > 0 && (
                <button
                  type="button"
                  className="inline-flex items-center rounded-md bg-orange-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-orange-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-600"
                  onClick={onNewPlayer}
                >
                  <PlusIcon aria-hidden="true" className="-ml-0.5 mr-1.5 h-5 w-5" />
                  New Player
                </button>
              )}
            </div>
            {players.allIds.length > 0 && (
              <ul role="list" className="mt-6 divide-y divide-gray-200 border-b border-t border-gray-200">
                {players.allIds.map((playerId) => {
                  const player = players.byId[playerId];
                  return (
                    <li onClick={() => onAddPlayerToTeam(player)} key={player.id} className="hover:bg-orange-100 cursor-pointer">
                      <div className="group flex items-center p-4">
                        <div className="mr-3">
                          {player.avatarUrl && (
                            <img className="rounded-full h-10 w-10" src={player.avatarUrl} />
                          )}
                          {!player.avatarUrl && (
                            <span className="border border-gray-300 relative inline-flex p-2 h-10 w-10 items-center justify-center rounded-full">
                              <Icon type="jersey" className="mx-auto h-6 w-6 text-gray-400" />
                            </span>
                          )}
                        </div>
                        <div className="min-w-0 flex-1 flex justify-between items-center">
                          <div className="flex items-center">
                            <p className="mr-3 text-sm text-gray-500">#{player.number}</p>
                            <div className="text-sm font-medium text-gray-900">
                              <a>
                                {player.name}
                              </a>
                            </div>
                          </div>
                        </div>
                        <div className="flex-shrink-0 self-center">
                          <EllipsisHorizontalIcon aria-hidden="true" className="h-5 w-5 text-gray-400 group-hover:text-gray-500" />
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}

            {players.allIds.length <= 0 && (
              <div className="mt-4 text-center border rounded-md p-6">
                <Icon type="jersey" className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-semibold text-gray-900">No players</h3>
                <p className="mt-1 text-sm text-gray-500">Get started by creating a new player.</p>
                <div className="mt-6">
                  <button
                    type="button"
                    className="inline-flex items-center rounded-md bg-orange-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-orange-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-600"
                    onClick={onNewPlayer}
                  >
                    <PlusIcon aria-hidden="true" className="-ml-0.5 mr-1.5 h-5 w-5" />
                    New Player
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="mt-6">
          <button
            type="button"
            className="w-full sm:w-auto inline-flex items-center rounded-md bg-orange-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-orange-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-600"
            onClick={onCreateNewTeam}
          >
            {createTeamLoading && (
              <Icon type="loader" className="h-5 w-5 mr-2" spinnerColor={colors.orange600} spinnerBackgroundColor={colors.grey300} />
            )}
            Create new team
          </button>
        </div>
      </div>
    </div>
  )
}