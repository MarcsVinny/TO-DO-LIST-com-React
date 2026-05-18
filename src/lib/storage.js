// Simples implementação do AsyncStorage para Web
const AsyncStorage = {
  getItem: async (key) => {
    try {
      return localStorage.getItem(key);
    } catch (e) {
      console.error("Error reading from storage", e);
      return null;
    }
  },
  setItem: async (key, value) => {
    try {
      localStorage.setItem(key, value);
    } catch (e) {
      console.error("Error writing to storage", e);
    }
  },
  removeItem: async (key) => {
    try {
      localStorage.removeItem(key);
    } catch (e) {
      console.error("Error removing from storage", e);
    }
  },
};

export default AsyncStorage;
