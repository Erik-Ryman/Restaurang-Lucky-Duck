
//Laddar det valda språket när sidan laddas
window.addEventListener("load", loadLanguage);

//Översätter till svenska
function changeLanguage(language) {
  const elementsToTranslate = document.querySelectorAll(
    language === "sv" ? "[data-se]" : "[data-en]"
  ); //Hämtar attributen data-se för varje element

  elementsToTranslate.forEach((element) => {
    element.textContent =
      language === "sv"
        ? element.getAttribute("data-se")
        : element.getAttribute("data-en");
  });
  document.documentElement.setAttribute("lang", language); //semantisk lang="" html
  localStorage.setItem("selectedLanguage", language);
}

//Händelselyssnare för ändring av språket
document
  .getElementById("swedish")
  .addEventListener("change", () => changeLanguage("sv"));
document
  .getElementById("english")
  .addEventListener("change", () => changeLanguage("en"));

//Laddar det valda språket som sparats i localStorage
function loadLanguage() {
  let selectedLanguage = localStorage.getItem("selectedLanguage");
  const swedishRadio = document.getElementById("swedish"); //Hämtar swedish från DOM
  const englishRadio = document.getElementById("english"); //Hämtar english från DOM

  if (selectedLanguage === "sv") {
    //Kontrollerar om valt språk är svenska eller om inget språk är valt och kör då koden inuti if
    swedishRadio.checked = true;
  } else if (selectedLanguage === "en") {
    //Om det valda språket är engelska körs koden nedan
    englishRadio.checked = true;
  } else {
    selectedLanguage = "sv";
    swedishRadio.Checked = true;
  }
  changeLanguage(selectedLanguage);
}
