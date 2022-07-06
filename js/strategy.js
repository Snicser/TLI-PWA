let learnStrategy = {
  loadContent: function (strategy, language) {
    const data = {
      username: user.username,
      token: user.token,
      strategy: strategy,
      language: language,
    };

    debug.add(data);

    app.callToServer(data, app.endpoints.strategy).then(function (result) {
      switch (result.status) {
        case 200:
          console.log(result);
          debug.add(result);

          app.loadHTML(result.data.file, "main");
      }
    });
  },
};
