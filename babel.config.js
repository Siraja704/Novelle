module.exports = function (api) {
  api.cache(true);
  return {
    presets: ["babel-preset-expo"],
    plugins: [
      "react-native-reanimated/plugin",
      "@babel/plugin-transform-nullish-coalescing-operator",
      "@babel/plugin-transform-optional-chaining",
      "@babel/plugin-transform-class-properties",
      "@babel/plugin-transform-numeric-separator",
      "@babel/plugin-transform-object-rest-spread",
    ],
  };
};
