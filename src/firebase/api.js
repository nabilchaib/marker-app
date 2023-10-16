import { getDoc, setDoc, addDoc, getDocs, query, collection, where, or, and, limit, doc, updateDoc, documentId, serverTimestamp } from 'firebase/firestore';
import { db } from '.';

const emptyStats = {
  points: {
    attempted: [0, 0, 0, 0],
    made: [0, 0, 0, 0]
  },
  rebounds: {
    offensive: 0,
    defensive: 0
  },
  assists: 0,
  fouls: 0
};

export const initializeGameApi = async (selectedTeams) => {
  return new Promise(async (resolve, reject) => {
    try {
      const gameQuery = query(
        collection(db, 'game'),
        and(
          or(
            where('teamA.name', '==', selectedTeams[0].name),
            where('teamA.name', '==', selectedTeams[1].name)
          ),
          or(
            where('teamB.name', '==', selectedTeams[0].name),
            where('teamB.name', '==', selectedTeams[1].name)
          ),
          where('finished', '!=', true)
        ),
        limit(1)
      );

      const gameQuerySnapshot = await getDocs(gameQuery);
      if (!gameQuerySnapshot.empty) {
        gameQuerySnapshot.forEach(game => {
          const newGameData = game.data();
          const newGame = { id: game.id, ...newGameData, date: newGameData.date.toDate().toISOString() };
          resolve({ game: newGame, startNew: false });
        });
      } else {
        const game = {
          date: serverTimestamp(),
          finished: false,
          actions: []
        };
        const teamsQuery = query(collection(db, 'teams'), where(documentId(), 'in', selectedTeams.map(t => t.id)));
        const teamsQuerySnapshot = await getDocs(teamsQuery);
        teamsQuerySnapshot.forEach(async doc => {
          const playersQuery = query(collection(db, 'players'), where('team', '==', doc.id));
          const playersQuerySnapshot = await getDocs(playersQuery);
          const teamId = doc.id;
          const team = { id: teamId, ...doc.data(), score: 0 };
          const players = {};
          playersQuerySnapshot.forEach((playerDoc) => {
            const playerId = playerDoc.id;
            const playerRawData = playerDoc.data();
            const playerData = {
              id: playerId,
              name: playerRawData.name,
              number: playerRawData.number ? playerRawData.number : '',
              teamId,
              stats: emptyStats
            };
            players[playerId] = playerData;
          });

          if (!game.teamA) {
            game.teamA = { ...team, players };
          } else {
            game.teamB = { ...team, players };
          }

          if (game.teamA && game.teamB) {
            resolve({ game, startNew: true });
          }
        });
      }
    } catch (err) {
      console.log('INITIALIZE DATA API ERR: ', err);
      reject(err);
    }
  });
};
export const addGameApi = async (game) => {
  try {
    const gameRef = collection(db, 'game');
    const newGameRef = await addDoc(gameRef, game)
    const newGameSnapshot = await getDoc(newGameRef);
    const newGameData = newGameSnapshot.data();
    const newGame = { id: newGameRef.id, ...newGameData, date: newGameData.date.toDate().toISOString() };
    return newGame;
  } catch (err) {
    console.log('ADD GAME API ERR: ', err);
  }
};

const getNewGameStats = ({ game, selectedTeam, player, playerId, newStats, newScore }) => {
  const newGame = {
    [selectedTeam]: {
      ...game[selectedTeam],
      players: {
        ...game[selectedTeam].players,
        [playerId]: {
          ...player,
          stats: newStats
        }
      }
    }
  };

  if (newScore) {
    newGame[selectedTeam].score = newScore;
  }

  return newGame;
};

export const addMadeShotApi = async ({ game, selectedTeam, playerId, points }) => {
  return new Promise(async (resolve, reject) => {
    try {
      const player = game[selectedTeam].players[playerId];
      const newStats = {
        ...player.stats,
        points: {
          ...player.stats.points,
          made: player.stats.points.made.map((val, index) => {
            if (index === points) {
              return val + 1;
            }

            return val;
          })
        }
      };

      const newScore = game[selectedTeam].score + parseInt(points);
      const newGame = getNewGameStats({ game, selectedTeam, player, playerId, newStats, newScore });

      const gameRef = doc(db, 'game', game.id);
      await updateDoc(gameRef, newGame);

      resolve();
    } catch (err) {
      console.log('ADD MADE SHOT API ERR: ', err);
      reject(err);
    }
  });
};

export const addAttemptedShotApi = async ({ game, selectedTeam, playerId, points }) => {
  return new Promise(async (resolve, reject) => {
    try {
      const player = game[selectedTeam].players[playerId];
      const newStats = {
        ...player.stats,
        points: {
          ...player.stats.points,
          attempted: player.stats.points.attempted.map((val, index) => {
            if (index === points) {
              return val + 1;
            }

            return val;
          })
        }
      };

      const newGame = getNewGameStats({ game, selectedTeam, player, playerId, newStats });
      const gameRef = doc(db, 'game', game.id);
      await updateDoc(gameRef, newGame);

      resolve();
    } catch (err) {
      console.log('ADD ATTEMPTED SHOT API ERR: ', err);
      reject(err);
    }
  });
};

export const addReboundApi = async ({ game, selectedTeam, playerId, type }) => {
  return new Promise(async (resolve, reject) => {
    try {
      const player = game[selectedTeam].players[playerId];
      const newStats = {
        ...player.stats,
        rebounds: {
          ...player.stats.rebounds,
          [type]: player.stats.rebounds[type] + 1
        }
      };

      const newGame = getNewGameStats({ game, selectedTeam, player, playerId, newStats });
      const gameRef = doc(db, 'game', game.id);
      await updateDoc(gameRef, newGame);

      resolve();
    } catch (err) {
      console.log('ADD REBOUND API ERR: ', err);
      reject(err);
    }
  });
};

export const addAssistApi = async ({ game, selectedTeam, playerId }) => {
  return new Promise(async (resolve, reject) => {
    try {
      const player = game[selectedTeam].players[playerId];
      const newStats = {
        ...player.stats,
        assists: player.stats.assists + 1
      };

      const newGame = getNewGameStats({ game, selectedTeam, player, playerId, newStats });
      const gameRef = doc(db, 'game', game.id);
      await updateDoc(gameRef, newGame);

      resolve();
    } catch (err) {
      console.log('ADD ASSIST API ERR: ', err);
      reject(err);
    }
  });
};

export const addFoulApi = async ({ game, selectedTeam, playerId }) => {
  return new Promise(async (resolve, reject) => {
    try {
      const player = game[selectedTeam].players[playerId];
      const newStats = {
        ...player.stats,
        fouls: player.stats.fouls + 1
      };

      const newGame = getNewGameStats({ game, selectedTeam, player, playerId, newStats });
      const gameRef = doc(db, 'game', game.id);
      await updateDoc(gameRef, newGame);

      resolve();
    } catch (err) {
      console.log('ADD FOUL API ERR: ', err);
      reject(err);
    }
  });
};

export const addPlayerApi = async ({ game, selectedTeam, team, player }) => {
  return new Promise(async (resolve, reject) => {
    try {
      const playerQuery = query(collection(db, 'players'), where('number', '==', player.number), where('team', '==', team.id));
      const playerSnapshot = await getDocs(playerQuery);
      if (playerSnapshot.docs.length <= 0) {
        const docRef = await addDoc(collection(db, 'players'), player);
        const newPlayer = { ...player, id: docRef.id, stats: emptyStats };

        const newGame = {
          [selectedTeam]: {
            ...game[selectedTeam],
            players: {
              ...game[selectedTeam].players,
              [docRef.id]: {
                ...newPlayer,
              }
            }
          }
        };

        const gameRef = doc(db, 'game', game.id);
        await updateDoc(gameRef, newGame);

        resolve({ player: newPlayer });

      } else {
        reject('number exists already');
      }
    } catch (err) {
      console.log('ADD PLAYER API ERR: ', err);
      reject(err);
    }
  });
};

export const updateLastActionsApi = async (game, lastActions) => {
  return new Promise(async (resolve, reject) => {
    try {
      const newGame = {
        actions: lastActions
      };

      const gameRef = doc(db, 'game', game.id);
      await updateDoc(gameRef, newGame);

      resolve();
    } catch (err) {
      console.log('UPDATE LAST ACTIONS API ERR: ', err);
      reject(err);
    }
  });
};

export const undoLastActionApi = async (lastActions, game) => {
  return new Promise(async (resolve, reject) => {
    try {
      const lastAction = lastActions[lastActions.length - 1];
      if (lastAction) {
        if (lastAction.action === 'addMadeShot' || lastAction.action === 'addAttemptedShot') {
          const { team, playerId, points } = lastAction;
          const player = game[team].players[playerId];
          const type = lastAction.action === 'addAttemptedShot' ? 'attempted' : 'made'

          const newStats = {
            ...player.stats,
            points: {
              ...player.stats.points,
              [type]: player.stats.points[type].map((val, index) => {
                if (index === points) {
                  return val - 1;
                }

                return val;
              })
            }
          };

          let newGame = getNewGameStats({ game, selectedTeam: team, player, playerId, newStats });
          if (type === 'made') {
            const newScore = game[team].score - parseInt(points);
            newGame = getNewGameStats({ game, selectedTeam: team, player, playerId, newStats, newScore });
          }

          const gameRef = doc(db, 'game', game.id);
          await updateDoc(gameRef, newGame);
        } else if (lastAction.action === 'addRebound') {
          const { team, playerId, type } = lastAction;
          const player = game[team].players[playerId];
          const newStats = {
            ...player.stats,
            rebounds: {
              ...player.stats.rebounds,
              [type]: player.stats.rebounds[type] - 1
            }
          };

          const newGame = getNewGameStats({ game, selectedTeam: team, player, playerId, newStats });
          const gameRef = doc(db, 'game', game.id);
          await updateDoc(gameRef, newGame);
        } else if (lastAction.action === 'addAssist') {
          const { team, playerId } = lastAction;
          const player = game[team].players[playerId];
          const newStats = {
            ...player.stats,
            assists: player.stats.assists - 1
          };

          const newGame = getNewGameStats({ game, selectedTeam: team, player, playerId, newStats });
          const gameRef = doc(db, 'game', game.id);
          await updateDoc(gameRef, newGame);
        } else if (lastAction.action === 'addFoul') {
          const { team, playerId } = lastAction;
          const player = game[team].players[playerId];
          const newStats = {
            ...player.stats,
            fouls: player.stats.fouls - 1
          };

          const newGame = getNewGameStats({ game, selectedTeam: team, player, playerId, newStats });
          const gameRef = doc(db, 'game', game.id);
          await updateDoc(gameRef, newGame);
        }
      }

      resolve();
    } catch (err) {
      console.log('UNDO LAST ACTION API ERR: ', err);
      reject(err);
    }
  });
};

export const pushStatsToFirebase = async (game, teamA, teamB) => {
  // const stats = {
  //   date: new Date(),
  //   teamA: {
  //     name: teamA.name,
  //     score: teamA.score
  //   },
  //   teamB: {
  //     name: teamB.name,
  //     score: teamB.score
  //   },
  //   players: []
  // };

  // teamA.players.forEach((player) => {
  //   const pointsMade = player.stats.points.made;
  //   const pointsMissed = player.stats.points.attempted;
  //   const playerStats = {
  //     name: player.name,
  //     points: player.stats.points.made[1] + player.stats.points.made[2] * 2 + player.stats.points.made[3] * 3,
  //     rebounds: player.stats.rebounds.offensive + player.stats.rebounds.defensive,
  //     assists: player.stats.assists,
  //     fouls: player.stats.fouls,
  //     team: teamA.name,
  //     pointsMade: pointsMade,
  //     pointsMissed: pointsMissed,
  //     percentages: {
  //       'FT': (player.stats.points.made[1] / (player.stats.points.made[1] + player.stats.points.attempted[1])) * 100 + '%',
  //       '2PT': (player.stats.points.made[2] / (player.stats.points.made[2] + player.stats.points.attempted[2])) * 100 + '%',
  //       '3PT': (player.stats.points.made[3] / (player.stats.points.made[3] + player.stats.points.attempted[3])) * 100 + '%'
  //     },
  //     id: player.id
  //   };
  //   stats.players.push(playerStats);
  // });

  // teamB.players.forEach((player) => {
  //   const pointsMade = player.stats.points.made;
  //   const pointsMissed = player.stats.points.attempted;
  //   const playerStats = {
  //     name: player.name,
  //     points: player.stats.points.made[1] + player.stats.points.made[2] * 2 + player.stats.points.made[3] * 3,
  //     rebounds: player.stats.rebounds.offensive + player.stats.rebounds.defensive,
  //     assists: player.stats.assists,
  //     fouls: player.stats.fouls,
  //     team: teamB.name,
  //     pointsMade: pointsMade,
  //     pointsMissed: pointsMissed,
  //     percentages: {
  //       'FT': (player.stats.points.made[1] / (player.stats.points.made[1] + player.stats.points.attempted[1])) * 100 + '%',
  //       '2PT': (player.stats.points.made[2] / (player.stats.points.made[2] + player.stats.points.attempted[2])) * 100 + '%',
  //       '3PT': (player.stats.points.made[3] / (player.stats.points.made[3] + player.stats.points.attempted[3])) * 100 + '%'
  //     },
  //     id: player.id
  //   };
  //   stats.players.push(playerStats);
  // });

  try {
    // await updateDoc(teamA, {
    //   score: 0
    // });
    // await updateDoc(teamB, {
    //   score: 0
    // });

    const newGame = {
      finished: true
    };

    const gameRef = doc(db, 'game', game.id);
    await updateDoc(gameRef, newGame);
  } catch (err) {
    console.log('PUSH STATS TO FIREBASE ERR: ', err);
  }
};
