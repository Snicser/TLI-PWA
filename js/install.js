let deferredPrompt;

window.addEventListener("beforeinstallprompt", (event) => {
  // Prevent the mini-infobar from appearing on mobile
  event.preventDefault();

  // Stash the event so it can be triggered later.
  deferredPrompt = event;
});

window.addEventListener("appinstalled", (event) => {
  app.loadPage("login.html");
  console.log("Install: Successfully!");
});
