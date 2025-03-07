import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { addTournamentApi } from '../../firebase/api';
import { addNewTournament } from '../../redux/tournaments-reducer';
import Dropdown from '../../components/Dropdown';
import Icon from '../../components/Icon';

const AddTournament = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector(state => state.user);
  const teams = useSelector(state => {
    return state.teams.allIds
      .map(id => state.teams.byId[id])
      .filter(team => team !== null);
  });

  console.log('TEAMS: ', teams)

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    location: '',
    startDate: '',
    endDate: '',
    format: 'knockout', // 'knockout' or 'round-robin'
    status: 'upcoming',
    teams: [],
    rounds: [],
    standings: []
  });

  const [selectedTeams, setSelectedTeams] = useState([]);
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get available teams (teams not already selected)
  const availableTeams = teams ? teams.filter(
    team => !selectedTeams.some(selectedTeam => selectedTeam.id === team.id)
  ) : [];

  useEffect(() => {
    // Update the formData whenever selectedTeams changes
    setFormData(prev => ({
      ...prev,
      teams: selectedTeams.map(team => ({
        id: team.id,
        name: team.name,
        avatarUrl: team.avatarUrl
      }))
    }));
  }, [selectedTeams]);

  const generateBracket = (teams, format) => {
    if (format === 'knockout') {
      return generateKnockoutBracket(teams);
    } else {
      return generateRoundRobinSchedule(teams);
    }
  };

  const generateKnockoutBracket = (teams) => {
    // Calculate the number of rounds needed based on team count
    const teamCount = teams.length;
    const roundCount = Math.ceil(Math.log2(teamCount));

    // Calculate total number of teams needed for a perfect bracket
    const perfectBracketSize = Math.pow(2, roundCount);

    // Create a copy of teams and pad with byes if needed
    let seededTeams = [...teams];
    while (seededTeams.length < perfectBracketSize) {
      seededTeams.push({ id: `bye-${seededTeams.length}`, name: 'BYE', isBye: true });
    }

    // Seed the teams - for now, just use the order they were added
    // In a real app, you might implement a seeding algorithm

    // Generate the rounds
    const rounds = [];

    // First round - all teams paired up
    const firstRoundGames = [];
    for (let i = 0; i < seededTeams.length; i += 2) {
      firstRoundGames.push({
        teamAId: seededTeams[i].id,
        teamBId: seededTeams[i + 1].id,
        teamAName: seededTeams[i].name,
        teamBName: seededTeams[i + 1].name,
        teamAScore: 0,
        teamBScore: 0,
        gameId: null,
        status: 'scheduled',
        winnerId: seededTeams[i + 1].isBye ? seededTeams[i].id : null
      });
    }

    rounds.push({
      name: `Round 1`,
      games: firstRoundGames
    });

    // Generate subsequent rounds with empty matchups
    let gamesInRound = firstRoundGames.length / 2;
    for (let round = 2; round <= roundCount; round++) {
      const games = [];
      for (let i = 0; i < gamesInRound; i++) {
        games.push({
          teamAId: null,
          teamBId: null,
          teamAName: 'TBD',
          teamBName: 'TBD',
          teamAScore: 0,
          teamBScore: 0,
          gameId: null,
          status: 'scheduled',
          winnerId: null
        });
      }

      rounds.push({
        name: round === roundCount ? 'Final' : (round === roundCount - 1 ? 'Semi Finals' : `Round ${round}`),
        games: games
      });

      gamesInRound = gamesInRound / 2;
    }

    // Handle automatic advancement for BYE matches in the first round
    firstRoundGames.forEach((game, index) => {
      if (game.teamBId.startsWith('bye-') || game.teamAId.startsWith('bye-')) {
        const winningTeamId = game.teamBId.startsWith('bye-') ? game.teamAId : game.teamBId;
        const winningTeamName = game.teamBId.startsWith('bye-') ? game.teamAName : game.teamBName;

        // Mark this game as completed
        game.winnerId = winningTeamId;
        game.status = 'completed';

        // Advance the team to the next round
        const nextRoundIndex = 1; // Second round
        const nextMatchIndex = Math.floor(index / 2);
        const isFirstTeam = index % 2 === 0;

        if (isFirstTeam) {
          rounds[nextRoundIndex].games[nextMatchIndex].teamAId = winningTeamId;
          rounds[nextRoundIndex].games[nextMatchIndex].teamAName = winningTeamName;
        } else {
          rounds[nextRoundIndex].games[nextMatchIndex].teamBId = winningTeamId;
          rounds[nextRoundIndex].games[nextMatchIndex].teamBName = winningTeamName;
        }
      }
    });

    return rounds;
  };

  const generateRoundRobinSchedule = (teams) => {
    const teamCount = teams.length;
    const rounds = [];

    // For odd number of teams, add a dummy team (BYE)
    const teamsArray = [...teams];
    if (teamCount % 2 !== 0) {
      teamsArray.push({ id: 'bye', name: 'BYE', isBye: true });
    }

    const totalTeams = teamsArray.length;
    const matchesPerRound = totalTeams / 2;
    const totalRounds = totalTeams - 1;

    // Create a copy of teams excluding the first team
    const rotating = teamsArray.slice(1);

    // Generate each round
    for (let round = 0; round < totalRounds; round++) {
      const games = [];
      const roundName = `Round ${round + 1}`;

      // First match is always between first team and the rotating team
      games.push({
        teamAId: teamsArray[0].id,
        teamBId: rotating[0].id,
        teamAName: teamsArray[0].name,
        teamBName: rotating[0].name,
        teamAScore: 0,
        teamBScore: 0,
        gameId: null,
        status: 'scheduled',
        winnerId: null
      });

      // Generate rest of the matches for this round
      for (let match = 1; match < matchesPerRound; match++) {
        games.push({
          teamAId: rotating[match].id,
          teamBId: rotating[totalTeams - match - 1].id,
          teamAName: rotating[match].name,
          teamBName: rotating[totalTeams - match - 1].name,
          teamAScore: 0,
          teamBScore: 0,
          gameId: null,
          status: 'scheduled',
          winnerId: null
        });
      }

      rounds.push({
        name: roundName,
        games: games
      });

      // Rotate teams for next round: keep first team fixed, rotate others
      rotating.push(rotating.shift());
    }

    // Initialize standings
    const standings = teams.map(team => ({
      id: team.id,
      name: team.name,
      wins: 0,
      losses: 0,
      points: 0
    }));

    return rounds;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleTeamSelect = (team) => {
    setSelectedTeams([...selectedTeams, team]);
  };

  const handleRemoveTeam = (teamId) => {
    setSelectedTeams(selectedTeams.filter(team => team.id !== teamId));
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.name.trim()) {
      errors.name = 'Tournament name is required';
    }

    if (!formData.startDate) {
      errors.startDate = 'Start date is required';
    }

    if (!formData.endDate) {
      errors.endDate = 'End date is required';
    } else if (new Date(formData.endDate) < new Date(formData.startDate)) {
      errors.endDate = 'End date must be after start date';
    }

    if (selectedTeams.length < 2) {
      errors.teams = 'At least 2 teams are required';
    }

    // For knockout tournaments, team count should ideally be a power of 2
    // This is just a warning, not a blocker
    if (formData.format === 'knockout') {
      const teamCount = selectedTeams.length;
      const nextPowerOfTwo = Math.pow(2, Math.ceil(Math.log2(teamCount)));

      if (nextPowerOfTwo !== teamCount) {
        errors.teamsWarning = `For knockout tournaments, ${nextPowerOfTwo} teams would create a perfect bracket. ${nextPowerOfTwo - teamCount} BYE(s) will be added.`;
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).filter(key => !key.includes('Warning')).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setIsSubmitting(true);

      // Generate tournament bracket or schedule
      const rounds = generateBracket(selectedTeams, formData.format);

      // Initialize standings for round-robin tournaments
      const standings = formData.format === 'round-robin'
        ? selectedTeams.map(team => ({
            id: team.id,
            name: team.name,
            wins: 0,
            losses: 0,
            points: 0
          }))
        : [];

      // Prepare tournament data
      const tournamentData = {
        ...formData,
        rounds,
        standings,
        createdBy: user.email,
        createdAt: new Date().toISOString()
      };

      // Save to Firestore
      const newTournament = await addTournamentApi({ tournament: tournamentData });

      // Update Redux
      dispatch(addNewTournament(newTournament));

      // Navigate to the tournaments list
      navigate('/tournaments');
    } catch (error) {
      console.error('Error creating tournament:', error);
      alert('Error creating tournament. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Create New Tournament</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="bg-white p-4 rounded shadow-sm">
          <h2 className="text-lg font-semibold mb-4">Tournament Details</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tournament Name*
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-md ${formErrors.name ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="e.g., Summer Classic 2023"
              />
              {formErrors.name && (
                <p className="text-red-500 text-xs mt-1">{formErrors.name}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Location
              </label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="e.g., Main Gym"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Date*
              </label>
              <input
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-md ${formErrors.startDate ? 'border-red-500' : 'border-gray-300'}`}
              />
              {formErrors.startDate && (
                <p className="text-red-500 text-xs mt-1">{formErrors.startDate}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Date*
              </label>
              <input
                type="date"
                name="endDate"
                value={formData.endDate}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-md ${formErrors.endDate ? 'border-red-500' : 'border-gray-300'}`}
              />
              {formErrors.endDate && (
                <p className="text-red-500 text-xs mt-1">{formErrors.endDate}</p>
              )}
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows="3"
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="Tournament description (optional)"
            ></textarea>
          </div>
        </div>

        {/* Tournament Format */}
        <div className="bg-white p-4 rounded shadow-sm">
          <h2 className="text-lg font-semibold mb-4">Tournament Format</h2>

          <div className="space-y-2">
            <label className="inline-flex items-center">
              <input
                type="radio"
                name="format"
                value="knockout"
                checked={formData.format === 'knockout'}
                onChange={handleInputChange}
                className="h-5 w-5 text-blue-600"
              />
              <span className="ml-2">Knockout (Elimination Bracket)</span>
            </label>

            <label className="inline-flex items-center">
              <input
                type="radio"
                name="format"
                value="round-robin"
                checked={formData.format === 'round-robin'}
                onChange={handleInputChange}
                className="h-5 w-5 text-blue-600"
              />
              <span className="ml-2">Round-Robin (Everyone Plays Everyone)</span>
            </label>
          </div>

          <div className="mt-2 text-sm text-gray-600">
            {formData.format === 'knockout'
              ? 'Teams will compete in a single-elimination tournament. Losers are eliminated, winners advance.'
              : 'Each team will play against every other team. Rankings are determined by win/loss record.'}
          </div>
        </div>

        {/* Team Selection */}
        <div className="bg-white p-4 rounded shadow-sm">
          <h2 className="text-lg font-semibold mb-4">Select Teams</h2>

          <div className="mb-2">
            {/* Replace with a simple select for teams */}
            <select
              className={`w-full px-3 py-2 border rounded-md ${formErrors.teams ? 'border-red-500' : 'border-gray-300'}`}
              onChange={(e) => {
                const selectedTeam = teams.find(team => team.id === e.target.value);
                if (selectedTeam) {
                  handleTeamSelect(selectedTeam);
                }
              }}
              disabled={availableTeams.length === 0}
            >
              <option value="">Select Teams...</option>
              {availableTeams.map(team => (
                <option key={team.id} value={team.id}>
                  {team.name}
                </option>
              ))}
            </select>
            {formErrors.teams && (
              <p className="text-red-500 text-xs mt-1">{formErrors.teams}</p>
            )}
            {formErrors.teamsWarning && (
              <p className="text-yellow-500 text-xs mt-1">{formErrors.teamsWarning}</p>
            )}
          </div>

          <div className="mt-4">
            <h3 className="text-sm font-medium text-gray-700 mb-2">
              Selected Teams ({selectedTeams.length})
            </h3>

            {selectedTeams.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                {selectedTeams.map(team => (
                  <div key={team.id} className="flex items-center p-2 bg-gray-100 rounded">
                    <span className="flex-1 truncate">{team.name}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveTeam(team.id)}
                      className="ml-2 text-red-500 hover:text-red-700"
                    >
                      <Icon type="x" size={16} />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-sm text-gray-500 italic">No teams selected</div>
            )}
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => navigate('/tournaments')}
            className="mr-2 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50"
          >
            {isSubmitting ? 'Creating...' : 'Create Tournament'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddTournament;
