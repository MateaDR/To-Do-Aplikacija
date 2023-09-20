/**
 * Služi za dohvaćanje kolačića
 * @param {*} imeKolaca
 * @returns
 */
function dohvatiKolacice(imeKolaca) {
  let kolaci = document.cookie.split("; ");
  for (let i = 0; i < kolaci.length; i++) {
    let kolac = kolaci[i].split("=");
    if (kolac[0] === imeKolaca) {
      return kolac[1];
    }
  }
  return "";
}
/**
 * Ovo su kolačići prve strane
 * Ovo je za spremanje:
 * - Trajnih kolačića
 * - Neophodnih kolačića
 * @param {*} imeKolaca
 * @param {*} vrijednost
 */
function spremiKolacice(imeKolaca, vrijednost) {
  document.cookie = imeKolaca + "=" + vrijednost + "; path=/; SameSite=None; Secure";
}

/**
 * Ovo je za zadatke koji imaju više riječi pa ih vraća kao jednu riječ
 * Ovo koristimo da bismo identificirali checkboxove
 * @param {string} rijec 
 * @returns string
 */
function JednaRijec(rijec) {
  return rijec.replace(/\s+/g, "");
}

/**
 * Služi za prikaz zadataka (to-do) koji su spremljeni kao trajni kolačići
 */
function prikaziZadatke() {
  let listaZadataka = document.querySelector("#listaZadataka");
  listaZadataka.innerHTML = "";
  let zadaci = dohvatiKolacice("zadaci");
  zadaci = zadaci ? JSON.parse(zadaci) : [];
  if (zadaci.length > 0) {
    zadaci.forEach((zadatak, index) => {
      let noviZadatak = document.createElement("li");
      noviZadatak.setAttribute("data-value", zadatak.naziv);
      noviZadatak.innerHTML = `<input id="${JednaRijec(
        zadatak.naziv
      )}" type="checkbox"> ${
        zadatak.naziv
      } <button id="brisiZadatak">Brisi</button>`;
      noviZadatak.querySelector(`#${JednaRijec(zadatak.naziv)}`).checked =
        zadatak.izvrsen;
      listaZadataka.appendChild(noviZadatak);
      noviZadatak
        .querySelector(`#${JednaRijec(zadatak.naziv)}`)
        .addEventListener("change", (e) => {
          let zadaci = dohvatiKolacice("zadaci");
          zadaci = zadaci ? JSON.parse(zadaci) : [];
          zadaci.forEach((Zadatak) => {
            if (Zadatak.naziv == zadatak.naziv) {
              Zadatak.izvrsen = e.target.checked;
            }
          });
          spremiKolacice("zadaci", JSON.stringify(zadaci));
          //e.target.checked
        });
    });
    document.querySelectorAll("#brisiZadatak").forEach((brisi) => {
      brisi.addEventListener("click", () => {
        let postojeciZadaci = dohvatiKolacice("zadaci");
        let Zadaci = postojeciZadaci ? JSON.parse(postojeciZadaci) : [];
        Zadaci = Zadaci.filter(
          (zadatak) =>
            zadatak.naziv !== brisi.parentNode.getAttribute("data-value")
        );
        spremiKolacice("zadaci", JSON.stringify(Zadaci));
        prikaziZadatke();
      });
    });
  }
}

/**
 * Ovo su kolačići prve strane
 * Ovo je za spremanje:
 * - Kolačića sesije
 * - Kolačića koji nisu nužni
 * @param {*} imeKolaca
 * @param {*} vrijeme
 * @param {*} vrijednost
 */
function spremiTrenutneKolace(imeKolaca, vrijednost) {
  let vrijemeTrajanja = new Date();
  vrijemeTrajanja.setTime(vrijemeTrajanja.getTime() + 60 * 60 * 1000); // 60 minuta
  console.log(
    imeKolaca +
      "=" +
      vrijednost +
      "; expires=" +
      vrijemeTrajanja.toUTCString() +
      "; path=/; SameSite=None; Secure"
  );
  document.cookie =
    imeKolaca +
    "=" +
    vrijednost +
    "; expires=" +
    vrijemeTrajanja.toUTCString() +
    "; path=/; SameSite=None; Secure";
  console.log(document.cookie);
}

/**
 * Događaj kada se klikne dugme "Dodaj Zadatak"
 * Provjerava da li takav isti zadatak vec u listi
 * Ako postoji, izbrisat će se unos i ispista će se poruka da taj zadatak već postoji
 * Ako ne postoji takav zadatak onda ga unosi u listu i u kolačiće
 */
document.querySelector("#dodaj").addEventListener("click", () => {
  let inputZadatak = document.querySelector("#unesiZadatak").value.trim();
  let pocinjeSaBrojem = !isNaN(inputZadatak.charAt(0)); //Zadatak ne smije poceti sa brojem
  if (inputZadatak != "" && !pocinjeSaBrojem) {
    let postojeciZadaci = dohvatiKolacice("zadaci");
    let zadaci = postojeciZadaci ? JSON.parse(postojeciZadaci) : [];
    let postojeciZadatak = false;
    for (let index = 0; index < zadaci.length; index++) {
      if (zadaci[index].naziv == inputZadatak) {
        postojeciZadatak = true;
        break;
      }
    }
    if (postojeciZadatak === false) {
      let noviZadatak = {
        naziv: inputZadatak,
        id: JednaRijec(inputZadatak),
        izvrsen: false,
      };
      zadaci.push(noviZadatak);
      spremiKolacice("zadaci", JSON.stringify(zadaci));
      document.querySelector("#unesiZadatak").value = "";
      prikaziZadatke();
    } else {
      alert("Zadatak vec postoji");
      document.querySelector("#unesiZadatak").value = "";
    }
  }
});

/**
 * Događaj kada se pritisne dugme za prijavu
 * Provjerava se šifra
 * Ako je šifra ispravna, prikazuju se zadaci i div od aplikacije, a prijava se sakriva
 * Ako nije, ispisuje se poruka "Kriva šifra"
 */
document.querySelector("#Prijava").addEventListener("click", (e) => {
  e.preventDefault();
  let korisnickoIme = document.querySelector("#KorisnickoIme").value;
  let sifra = document.querySelector("#Sifra").value;
  if (korisnickoIme != "" && sifra != "") {
    let korisnickoImeKolaci = atob(dohvatiKolacice("imesifra"));
    if (korisnickoImeKolaci != "") {
      if (korisnickoImeKolaci == korisnickoIme + sifra) {
        spremiTrenutneKolace("imesifra", btoa(korisnickoIme + sifra));
        prikaziZadatke();
        document.querySelector("#Aplikacija").style.display = "flex";
        document.querySelector("#Prijava").style.display = "none";
      } else {
        alert("Kriva šifra.");
      }
    }
  }
});

/**
 * Događaj kada se pritisne dugme za registraciju
 * Čistu se postojeći kolačići od postojećeg korisnika
 * Spremaju se "enkriptirani" ime i sifra za ponovnu prijavu
 */
document.querySelector("#Registracija").addEventListener("click", (e) => {
  e.preventDefault();
  let korisnickoIme = document.querySelector("#KorisnickoIme").value;
  let sifra = document.querySelector("#Sifra").value;
  spremiKolacice("zadaci", JSON.stringify([])); // Ocisti postojece zadatke
  spremiTrenutneKolace("imesifra", btoa(korisnickoIme + sifra));
  alert("Registracija završena.");
  document.querySelector("#Aplikacija").style.display = "flex";
  document.querySelector("#Prijava").style.display = "none";
});

/**
 * Događaj kada se pritisne dugme "Odjavi se"
 * Čistu se postojeći podaci o korisniku
 * Prikazuje se prijava
 */
document.querySelector("#Odjava").addEventListener("click", (e) => {
  e.preventDefault();
  spremiKolacice("zadaci", JSON.stringify([])); // Ocisti postojece zadatke
  spremiTrenutneKolace("imesifra", "");
  document.querySelector("#Aplikacija").style.display = "none";
  document.querySelector("#Prijava").style.display = "flex";
});

/**
 * Zadani izgled stranice
 */
document.querySelector("#Aplikacija").style.display = "none";
document.querySelector("#Prijava").style.display = "flex";
