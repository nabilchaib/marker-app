import { useNavigate } from 'react-router-dom';
import { PlusIcon } from '@heroicons/react/20/solid'
import Icon from '../../components/Icon';


export default function AddPickUpGame() {
  const navigate = useNavigate();

  const onNewTeam = () => {
    navigate('/games/teams/create')
  };

  return (
    <div>
      <h2 className="text-base font-semibold leading-6 text-gray-900">Create a new pick-up game</h2>

      <div className="mt-8 text-center">
        <Icon type="jersey" className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-semibold text-gray-900">No teams</h3>
        <p className="mt-1 text-sm text-gray-500">Get started by creating a new team.</p>
        <div className="mt-6">
          <button
            type="button"
            className="inline-flex items-center rounded-md bg-orange-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-orange-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-600"
            onClick={onNewTeam}
          >
            <PlusIcon aria-hidden="true" className="-ml-0.5 mr-1.5 h-5 w-5" />
            New Team
          </button>
        </div>
      </div>
    </div>
  )
}
