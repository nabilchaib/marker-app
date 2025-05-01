import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { v4 as uuid } from 'uuid';
import { addNewGame } from '../redux/games-reducer';
import { addGameToTournament, updateTournamentMatch } from '../redux/tournaments-reducer';
import { addGameApi, updateTournamentApi } from '../firebase/api';

const ManualScoreModal = ({ isOpen, onClose, tournamentId, round, matchIndex, teamA, teamB }) => {
  const dispatch = useDispatch();
  const [teamAScore, setTeamAScore] = useState('');
  const [teamBScore, setTeamBScore] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validate scores
    if (!teamAScore || !teamBScore) {
      setError('Please enter scores for both teams');
      return;
    }

    const scoreA = parseInt(teamAScore);
    const scoreB = parseInt(teamBScore);

    if (isNaN(scoreA) || isNaN(scoreB)) {
      setError('Please enter valid numbers');
      return;
    }

    if (scoreA < 0 || scoreB < 0) {
      setError('Scores cannot be negative');
      return;
    }

    try {
      // Create a new game with the manual scores
      const newGame = {
        id: uuid(),
        teamAId: teamA.id,
        teamBId: teamB.id,
        teamAName: teamA.name,
        teamBName: teamB.name,
        createdBy: teamA.createdBy,
        createdOn: new Date().getTime(),
        actions: [],
        type: 'pick-up',
        teamAScore: scoreA,
        teamBScore: scoreB,
        notSaved: true,
        stats: {},
        players: {},
        tournamentId: tournamentId,
        tournamentRound: round,
        tournamentMatchIndex: matchIndex,
        isManualEntry: true,
        finished: true,
        endedAt: new Date().getTime(),
        date: new Date().getTime()
      };

      // Save to Firestore
      const savedGame = await addGameApi(newGame);
      
      if (!savedGame || !savedGame.id) {
        throw new Error('Failed to save game: Invalid response from API');
      }

      // Update Redux game state
      dispatch(addNewGame(savedGame));

      // Update tournament match with game ID and status
      const winnerId = scoreA > scoreB ? teamA.id : teamB.id;
      
      // Update Redux tournament state
      dispatch(addGameToTournament({
        tournamentId,
        gameId: savedGame.id,
        round,
        matchIndex
      }));

      dispatch(updateTournamentMatch({
        tournamentId,
        round,
        matchIndex,
        updates: {
          status: 'completed',
          winnerId: winnerId,
          teamAScore: scoreA,
          teamBScore: scoreB
        }
      }));

      // Update tournament in Firestore
      await updateTournamentApi({
        tournament: {
          id: tournamentId,
          rounds: [{
            name: round,
            games: [{
              index: matchIndex,
              gameId: savedGame.id,
              status: 'completed',
              winnerId: winnerId,
              teamAScore: scoreA,
              teamBScore: scoreB
            }]
          }]
        }
      });

      onClose();
    } catch (error) {
      console.error('Error saving game:', error);
      setError(error.message || 'Error saving game. Please try again.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <h2 className="text-2xl font-bold mb-4">Enter Final Score</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {teamA.name} Score
              </label>
              <input
                type="number"
                value={teamAScore}
                onChange={(e) => setTeamAScore(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                min="0"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {teamB.name} Score
              </label>
              <input
                type="number"
                value={teamBScore}
                onChange={(e) => setTeamBScore(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                min="0"
              />
            </div>
          </div>

          {error && (
            <div className="text-red-600 text-sm text-center">{error}</div>
          )}

          <div className="flex justify-end space-x-4 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Save Score
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ManualScoreModal; 