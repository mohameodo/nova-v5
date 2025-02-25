import localforage from 'localforage';

export const offlineStorage = {
  async saveUserData(userData: any) {
    await localforage.setItem('userData', userData);
  },

  async getUserData() {
    return await localforage.getItem('userData');
  },

  async saveMessages(messages: any[]) {
    await localforage.setItem('messages', messages);
  },

  async getMessages() {
    return await localforage.getItem('messages') || [];
  },

  async saveOfflineModel(model: any) {
    await localforage.setItem('offlineModel', model);
  },

  async getOfflineModel() {
    return await localforage.getItem('offlineModel');
  }
};
