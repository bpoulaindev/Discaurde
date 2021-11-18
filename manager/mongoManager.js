require('dotenv').config();
const MongoClient = require('mongodb').MongoClient;
const mongoCfg = process.env.DB_HOST;

async function connectDB () {
  return MongoClient.connect(mongoCfg, { useUnifiedTopology: true});
};

async function loadCollection (dataTable, collection) {
  const Mongo = await connectDB();
  const session = Mongo.db(dataTable);
  return session.collection(collection);
}

async function getUserRole (userId) {
  return (await loadCollection('Users', 'Roles')).findOne({"_id": userId});
};

async function getUser (userId) {
  try {
    const { role } = await getUserRole(userId);
    return (await loadCollection('Users', `${role}s`)).findOne({"_id": userId});
  } catch {
    return false;
  }
};

async function hasAccessChannel (userId, channelId) {
  const channel = await (await loadCollection('Channels', 'ChannelsList'))
    .findOne({"_id": channelId});
  return channel.members.includes(userId)
};

module.exports = {
  connectDB: async function () {
    return MongoClient.connect(mongoCfg, { useUnifiedTopology: true});
  },

  getUserRole: async function (userId) {
    return await (loadCollection('Users', 'Roles')).findOne({"_id": userId});
  },

  getUser: async function (userId) {
    const { role } = await getUserRole(userId);
    return (await loadCollection('Users', `${role}`)).findOne({"_id": userId});
  },

  pushToken: async function (token) {
    const Mongo = await connectDB();
    const session = Mongo.db('session');
    const collection = session.collection('token');
    await collection.insertOne(token);
  },

  getToken: async function (userId) {
    const Mongo = await connectDB();
    const session = Mongo.db('session');
    const collection = session.collection('token');
    return collection.findOne({"userId": `${userId}`});
  },

  deleteToken: async function(userId) {
    const Mongo = await connectDB();
    const session = Mongo.db('session');
    const collection = session.collection('token');
    return collection.findOneAndDelete({"userId": userId});
  },

  hasAccessChannel: async (userId, channelId) => {
    const channel = (await loadCollection('Channels', 'ChannelsList'))
      .findOne({"_id": channelId});
    return channel.members.includes(userId)
  },

  grantAccess: async (userId, channelId) => {
    const channel = await loadCollection('Channels', 'ChannelsList');
    const { members, ...Channel } = await channel.findOne({"_id": channelId});
    if (!await getUser(userId)) {
      return 'User not found.'
    }
    await channel.findOneAndReplace({"_id": channelId}, {
        ...Channel,
        members: [...new Set([...members, userId])]
      });
    return `User ${userId} granted access to channel ${channelId}`
  },

  isModerator: async (userId, channelId) => {
    const channel = await (await loadCollection('Channels', 'ChannelsList'))
      .findOne({"_id": channelId});
    return channel.moderators.includes(userId)
  },

  hasAccessFile: async (userId, channelId, fileId) => {
    if (await hasAccessChannel(userId, channelId)) {
      const file = await (await loadCollection('Channels', 'Files'))
        .findOne({"_id": fileId});
      return file.channelId === channelId
    }
    return false
  }
};

