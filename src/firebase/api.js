import {
  getDoc,
  addDoc,
  getDocs,
  query,
  collection,
  where,
  or,
  and,
  limit,
  doc,
  updateDoc,
  documentId,
  serverTimestamp,
  runTransaction,
} from 'firebase/firestore';
import { db, storage, ref, uploadBytes, getDownloadURL } from '.';

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

export const initializeGameApi = async (selectedTeams, mode = "game") => {
  return new Promise(async (resolve, reject) => {
    try {
      if (mode === "drill") {
        // Drill-specific initialization code if needed, skipping team queries
        resolve({ game: { type_of_game: "drill" }, startNew: true });
        return;
      }
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
  console.log('addGameApi called with:', game);
  try {
    const gameToAdd = game.date ? game : {...game, date:serverTimestamp()}
    const gameRef = collection(db, 'game');
    const newGameRef = await addDoc(gameRef, gameToAdd)
    const newGameSnapshot = await getDoc(newGameRef);
    const newGameData = newGameSnapshot.data();
    const newGame = {
      id: newGameRef.id,
      ...newGameData,
      date: newGameData.date?.toDate().toISOString(),
      players: game.players  // Ensure players structure is included in the return object
    };
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

export const addMadeShotApi = async ({ game, selectedTeam, playerId, points, type_of_game = "game" }) => {
  return new Promise(async (resolve, reject) => {
    try {
      let newStats;
      let newGame;
      
      if (type_of_game === "drill") {
        // Directly access the player for drill mode without a team context
        if (!game.playerId || game.playerId !== playerId) {
          throw new Error(`Player with ID ${playerId} not found in the game`);
        }
        
        // Define new stats for drill mode
        newStats = {
          drill_attempts: (game.drill_attempts || 0) + 1,
          drill_made: (game.drill_made || 0) + 1,
        };
        
        // Update game directly without player/team structure
        newGame = {
          ...game,
          stats: { ...game.stats, [playerId]: newStats },
        };
        console.log('addMadeShotApi',newGame)
      } else {
        // Logic for game mode
        const player = game[selectedTeam]?.players?.[playerId];
        if (!player) {
          throw new Error(`Player with ID ${playerId} not found in ${selectedTeam}`);
        }

        newStats = {
          ...player.stats,
          points: {
            ...player.stats.points,
            made: player.stats.points.made.map((val, index) => (index === points ? val + 1 : val)),
          },
        };

        const newScore = game[selectedTeam].score + parseInt(points);
        newGame = getNewGameStats({ game, selectedTeam, player, playerId, newStats, newScore });
      }

      // Update Firestore with the new game state
      const gameRef = doc(db, 'game', game.id);
      await updateDoc(gameRef, newGame);

      resolve();
    } catch (err) {
      console.log('ADD MADE SHOT API ERR: ', err);
      reject(err);
    }
  });
};


export const addAttemptedShotApi = async ({ game, selectedTeam, playerId, points, type_of_game = "game" }) => {
  return new Promise(async (resolve, reject) => {
    try {
      let newStats;
      let newGame;

      if (type_of_game === "drill") {
        // For drill mode, directly access and update player stats
        if (!game.playerId || game.playerId !== playerId) {
          throw new Error(`Player with ID ${playerId} not found in the game`);
        }
        
        newStats = {
          drill_attempts: (game.players[playerId].stats.drill_attempts || 0) + 1,
        };

        newGame = {
          ...game,
          players: {
            ...game.players,
            [playerId]: {
              ...game.players[playerId],
              stats: {
                ...game.players[playerId].stats,
                ...newStats
              }
            }
          }
        };

      } else {
        // For game mode, find the player in the selected team and update points attempted
        const player = game[selectedTeam]?.players?.[playerId];
        if (!player) {
          throw new Error(`Player with ID ${playerId} not found in team ${selectedTeam}`);
        }

        newStats = {
          ...player.stats,
          points: {
            ...player.stats.points,
            attempted: player.stats.points.attempted.map((val, index) => (index === points ? val + 1 : val)),
          }
        };

        newGame = {
          ...game,
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
      }

      // Update Firestore with the new game state
      const gameRef = doc(db, 'game', game.id);
      await updateDoc(gameRef, newGame);

      console.log('addAttemptedShotApi:', newGame);
      resolve();
    } catch (err) {
      console.log('ADD ATTEMPTED SHOT API ERR:', err);
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

export const addOrGetUserApi = async (user) => {
  try {
    const usersRef = collection(db, 'users');
    const userQuery = query(usersRef, where('email', '==', user.email));
    const userSnapshot = await getDocs(userQuery);
    if (!userSnapshot.empty) {
      const userData = userSnapshot.docs[0].data();
      return userData;
    } else {
      const userDocRef = await addDoc(usersRef, user);
      const newUserSnapshot = await getDoc(userDocRef);
      const userData = newUserSnapshot.data();
      return userData;
    }
  } catch (err) {
    console.log('ADD USER API ERR: ', err);
  }
};

export const getPlayersApi = async ({ user }) => {
  return new Promise(async (resolve, reject) => {
    try {
      const playersRef = collection(db, 'players');
      const playersQuery = query(playersRef, where('createdBy', '==', user.email));
      const playersSnapshot = await getDocs(playersQuery);
      const playersList = playersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      resolve(playersList);
    } catch (err) {
      console.log('GET PLAYERS API ERR: ', err);
      reject(err);
    }
  });
};

export const addPlayerApi = async ({ player, image }) => {
  return new Promise(async (resolve, reject) => {
    try {
          const playersCollection = collection(db, 'players');
          const playerStatsCollection = collection(db, 'player_stats');

          const newPlayerRef = await runTransaction(db, async (transaction) => {
            const playerRef = await addDoc(playersCollection, {
              ...player,
              avatarUrl: '', // Placeholder for avatar URL
            });

          if (image) {
            // Define metadata for the upload
            const metadata = {
              contentType: 'image/png', // Set the MIME type of the image
            };
            // 3. Upload the avatar
            const storageRef = ref(storage, `avatars/players/${newPlayerRef.id}.png`);
            const uploadTaskSnapshot = await uploadBytes(storageRef, image, metadata);
            const downloadURL = await getDownloadURL(uploadTaskSnapshot.ref);
            transaction.update(playerRef, { avatarUrl: downloadURL });
          }

          const initialStats = {
            playerId: playerRef.id,
            playerName: player.name, // Added player name for easier identification
            gameId: null,  // Placeholder; this could be updated once associated with a game
            date: new Date().toISOString(),
            points_scored: 0,
            shots_attempted: [0, 0, 0],
            shots_made: [0, 0, 0],
            rebounds_offensive: 0,
            rebounds_defensive: 0,
            assists: 0,
            fouls: 0,
            type_of_game: "game", // default or set based on your requirements
          };
          await addDoc(playerStatsCollection, initialStats);
    
          return playerRef;
        });
    

          const newPlayerData = { 
            ...player, 
            id: newPlayerRef.id, 
            avatarUrl: image ? await getDownloadURL(ref(storage, `avatars/players/${newPlayerRef.id}.png`)) : '' 
          };
          return { player: newPlayerData };
        } catch (err) {
          console.error('ADD PLAYER API AND STATS INIT ERR:', err);
          throw new Error('Error adding player with stats. Please try again.');
        }
      }
  )};

export const addTeamApi = async ({ team, image }) => {
  return new Promise(async (resolve, reject) => {
    try {
      await runTransaction(db, async (transaction) => {
        try {
          const teamsCollection = collection(db, 'teams');
          const teamsQuery = query(
            teamsCollection,
            and(
              where('createdBy', '==', team.createdBy),
              where('name', '==', team.name)
            )
          );
          const teamSnapshot = await getDocs(teamsQuery);

          if (!teamSnapshot.empty) {
            resolve({ isDuplicate: true });
            return false;
          }

          const newTeamRef = await addDoc(teamsCollection, {
            ...team,
            avatarUrl: '' // Placeholder
          });

          if (image) {
            // Define metadata for the upload
            const metadata = {
              contentType: 'image/png', // Set the MIME type of the image
            };
            // 3. Upload the avatar
            const storageRef = ref(storage, `avatars/teams/${newTeamRef.id}.png`);
            const uploadTaskSnapshot = await uploadBytes(storageRef, image, metadata);
            const downloadURL = await getDownloadURL(uploadTaskSnapshot.ref);
            transaction.update(newTeamRef, { avatarUrl: downloadURL });
          }

          const newTeam = { ...team, id: newTeamRef.id };
          resolve({ team: newTeam });
        } catch (err) {
          throw err;
        }
      });

    } catch (err) {
      console.log('ADD TEAM API ERR: ', err);
      reject(err);
    }
  });
};

export const getTeamsApi = async ({ user }) => {
  return new Promise(async (resolve, reject) => {
    try {
      const teamsRef = collection(db, 'teams');
      const teamsQuery = query(teamsRef, where('createdBy', '==', user.email));
      const teamsSnapshot = await getDocs(teamsQuery);
      const teamsList = teamsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      resolve(teamsList);
    } catch (err) {
      console.log('GET TEAMS API ERR: ', err);
      reject(err);
    }
  });
};

export const addPlayerStatsApi = async (playerId, gameId, date, type_of_game) => {
  try {
    const playerStatsCollection = collection(db, 'player_stats');
    const newPlayerStats = {
      playerId,
      // playerName,
      gameId,
      date,
      points_scored: 0,
      shots_attempted: [0, 0, 0],
      shots_made: [0, 0, 0],
      rebounds_offensive: 0,
      rebounds_defensive: 0,
      assists: 0,
      fouls: 0,
      type_of_game,
    };
    const docRef = await addDoc(playerStatsCollection, newPlayerStats);
    return docRef.id;
  } catch (err) {
    console.error('Error adding player stats:', err);
  }
};

export const updatePlayerStatsApi = async (playerStatsId, updatedFields) => {
  try {
    const playerStatsRef = doc(db, 'player_stats', playerStatsId);
    await updateDoc(playerStatsRef, updatedFields);
  } catch (err) {
    console.error('Error updating player stats:', err);
  }
};
