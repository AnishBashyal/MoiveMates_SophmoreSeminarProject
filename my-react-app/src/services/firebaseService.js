import { db } from "../firebaseConfig";
import {
  doc,
  setDoc,
  deleteDoc,
  collection,
  query,
  where,
  getDocs,
  serverTimestamp,
} from "firebase/firestore";

// Add movie to watch list
export const addToWatchList = async (userId, movie) => {
  if (!userId || !movie) throw new Error("User ID and movie are required");

  try {
    const docId = `${userId}_${movie.id}`;
    const watchListRef = doc(db, "watchlist", docId);

    const movieData = {
      userId,
      movieId: movie.id,
      title: movie.title,
      poster: movie.poster || movie.poster_path,
      synopsis: movie.synopsis || movie.overview,
      //   year: movie.year || movie.release_date,
      genres: movie.genres || [],
      addedAt: serverTimestamp(),
    };

    await setDoc(watchListRef, movieData);
    return true;
  } catch (error) {
    console.error("Error in addToWatchList:", error);
    throw error;
  }
};

// Get user's watch list
export const getWatchList = async (userId) => {
  if (!userId) throw new Error("User ID is required");

  try {
    const watchListRef = collection(db, "watchlist");
    const q = query(watchListRef, where("userId", "==", userId));
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map((doc) => doc.data());
  } catch (error) {
    console.error("Error in getWatchList:", error);
    throw error;
  }
};

// Remove from watch list
export const removeFromWatchList = async (userId, movieId) => {
  if (!userId || !movieId) throw new Error("User ID and movie ID are required");

  try {
    const docId = `${userId}_${movieId}`;
    await deleteDoc(doc(db, "watchlist", docId));
    return true;
  } catch (error) {
    console.error("Error in removeFromWatchList:", error);
    throw error;
  }
};

// Add to watch history
export const addToHistory = async (userId, movie) => {
  if (!userId || !movie) throw new Error("User ID and movie are required");

  try {
    const docId = `${userId}_${movie.movieId || movie.id}`;
    const historyRef = doc(db, "history", docId);

    const movieData = {
      userId,
      movieId: movie.movieId || movie.id,
      title: movie.title,
      poster: movie.poster || movie.poster_path,
      synopsis: movie.synopsis || movie.overview,
      //   year: movie.year || movie.release_date,
      genres: movie.genres || [],
      watchedAt: serverTimestamp(),
    };

    await setDoc(historyRef, movieData);
    return true;
  } catch (error) {
    console.error("Error in addToHistory:", error);
    throw error;
  }
};

// Get user's watch history
export const getHistory = async (userId) => {
  if (!userId) throw new Error("User ID is required");

  try {
    const historyRef = collection(db, "history");
    const q = query(historyRef, where("userId", "==", userId));
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map((doc) => doc.data());
  } catch (error) {
    console.error("Error in getHistory:", error);
    throw error;
  }
};

// Check if movie is watched
export const checkIfWatched = async (userId, movieId) => {
  if (!userId || !movieId) throw new Error("User ID and movie ID are required");

  try {
    const historyRef = collection(db, "history");
    const q = query(
      historyRef,
      where("userId", "==", userId),
      where("movieId", "==", movieId)
    );
    const querySnapshot = await getDocs(q);

    return !querySnapshot.empty;
  } catch (error) {
    console.error("Error in checkIfWatched:", error);
    throw error;
  }
};

// Add user to users collection
export const createOrUpdateUser = async (user) => {
  if (!user) throw new Error("User is required");

  try {
    const userRef = doc(db, "users", user.uid);
    await setDoc(
      userRef,
      {
        email: user.email.toLowerCase(),
        createdAt: serverTimestamp(),
      },
      { merge: true }
    );

    console.log("User document created/updated:", user.email);
    return true;
  } catch (error) {
    console.error("Error in createOrUpdateUser:", error);
    throw error;
  }
};

// Search user by email
export const searchUserByEmail = async (email) => {
  if (!email) throw new Error("Email is required");

  try {
    console.log("Searching for email:", email);
    const usersRef = collection(db, "users");
    const q = query(usersRef, where("email", "==", email.toLowerCase().trim()));
    const querySnapshot = await getDocs(q);

    console.log("Query snapshot size:", querySnapshot.size);

    if (querySnapshot.empty) {
      console.log("No user found with email:", email);
      return null;
    }

    const userDoc = querySnapshot.docs[0];
    const userData = userDoc.data();
    console.log("Found user:", userData);

    return {
      uid: userDoc.id,
      email: userData.email,
    };
  } catch (error) {
    console.error("Error in searchUserByEmail:", error);
    throw error;
  }
};
