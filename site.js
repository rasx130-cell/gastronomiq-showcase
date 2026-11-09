const tabList = document.querySelector(".role-tabs");
const tabs = Array.from(tabList.querySelectorAll("button"));

const appVideo = document.getElementById("app-promo");
if (window.matchMedia("(max-width: 600px) and (orientation: portrait)").matches) {
  appVideo.classList.add("is-portrait");
  appVideo.parentElement.classList.add("portrait-frame");
  appVideo.width = 540;
  appVideo.height = 960;
  appVideo.poster = "assets/app-promo-portrait.webp";
  appVideo.src = "assets/gastronomiq-android-portrait-kz.mp4";
}

function selectRole(selected) {
  for (const tab of tabs) {
    const active = tab === selected;
    tab.setAttribute("aria-selected", String(active));
    tab.tabIndex = active ? 0 : -1;
    document.getElementById(tab.getAttribute("aria-controls")).hidden = !active;
  }
}

tabList.setAttribute("role", "tablist");
for (const tab of tabs) {
  const panel = document.getElementById(tab.getAttribute("aria-controls"));
  tab.setAttribute("role", "tab");
  panel.setAttribute("role", "tabpanel");
  panel.setAttribute("aria-labelledby", tab.id);
  tab.addEventListener("click", () => selectRole(tab));
  tab.addEventListener("keydown", (event) => {
    const index = tabs.indexOf(tab);
    const positions = {
      ArrowLeft: (index - 1 + tabs.length) % tabs.length,
      ArrowRight: (index + 1) % tabs.length,
      Home: 0,
      End: tabs.length - 1,
    };
    if (!Object.prototype.hasOwnProperty.call(positions, event.key)) return;
    event.preventDefault();
    const next = tabs[positions[event.key]];
    selectRole(next);
    next.focus();
  });
}
selectRole(tabs[0]);
tabList.hidden = false;

const dialog = document.getElementById("lightbox");
const picture = dialog.querySelector("img");
let previousFocus = null;
for (const link of document.querySelectorAll("[data-shot]")) {
  link.addEventListener("click", (event) => {
    if (!dialog.showModal || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    previousFocus = link;
    dialog.querySelector("h2").textContent = link.dataset.shot;
    picture.alt = link.querySelector("img").alt;
    picture.src = link.href;
    dialog.showModal();
  });
}
dialog.addEventListener("click", (event) => {
  if (event.target === dialog) dialog.close();
});
dialog.addEventListener("close", () => {
  picture.removeAttribute("src");
  if (previousFocus) previousFocus.focus();
});

const video = document.getElementById("promo");
const chapterNav = document.getElementById("film-chapters");
const chapterLinks = document.querySelectorAll("[data-chapter]");

function seekTo(chapter) {
  video.currentTime = chapter.start;
  const playback = video.play();
  if (playback) playback.catch(() => {});
}

fetch("assets/chapters.json")
  .then((response) => {
    if (!response.ok) throw new Error("Chapter list unavailable");
    return response.json();
  })
  .then((chapters) => {
    const buttons = chapters.filter(({ key }) => !["intro", "outro"].includes(key)).map((chapter) => {
      const button = document.createElement("button");
      button.type = "button";
      const seconds = Math.floor(chapter.start);
      const stamp = Math.floor(seconds / 60) + ":" + String(seconds % 60).padStart(2, "0");
      button.textContent = stamp + " " + chapter.label;
      button.addEventListener("click", () => seekTo(chapter));
      chapterNav.append(button);
      return [chapter, button];
    });
    chapterNav.hidden = false;
    for (const link of chapterLinks) {
      const chapter = chapters.find(({ key }) => key === link.dataset.chapter);
      if (chapter) link.addEventListener("click", () => seekTo(chapter));
    }
    video.addEventListener("timeupdate", () => {
      let current = null;
      for (const chapter of chapters) {
        if (chapter.start > video.currentTime) break;
        current = chapter;
      }
      for (const [chapter, button] of buttons) {
        if (chapter === current) button.setAttribute("aria-current", "true");
        else button.removeAttribute("aria-current");
      }
    });
  })
  .catch(() => {});
