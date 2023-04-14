import { auth, firestore } from './firebase';

export const createUserWithEmailAndPassword = async (email, password) => {
  try {
    const { user } = await auth.createUserWithEmailAndPassword(email, password);
    return user;
  } catch (error) {
    throw new Error(error.message);
  }
};

export const signInWithEmailAndPassword = async (email, password) => {
  try {
    const { user } = await auth.signInWithEmailAndPassword(email, password);
    return user;
  } catch (error) {
    throw new Error(error.message);
  }
};

export const signOut = async () => {
  try {
    await auth.signOut();
  } catch (error) {
    throw new Error(error.message);
  }
};

export const addTeam = async (teamData) => {
  try {
    const { id } = await firestore.collection('team').add(teamData);
    return id;
  } catch (error) {
    throw new Error(error.message);
  }
};

export const getTeams = async () => {
  try {
    const snapshot = await firestore.collection('Teams').get();
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    throw new Error(error.message);
  }
};

export const updateTeam = async (teamId, updatedData) => {
  try {
    await firestore.collection('Teams').doc(teamId).update(updatedData);
  } catch (error) {
    throw new Error(error.message);
  }
};

export const deleteTeam = async (teamId) => {
  try {
    await firestore.collection('teams').doc(teamId).delete();
  } catch (error) {
    throw new Error(error.message);
  }
};
