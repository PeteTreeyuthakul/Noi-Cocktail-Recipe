module.exports = {
  mongodbMemoryServerOptions: {
    binary: {
      version: "6.0.5",
      skipMD5: true,
    },
    autoStart: true,
    instance: {
      dbName: "jest",
    },
  },
};
  