// const API_URL = "http://localhost:3000"; // Change this URL if needed when deployed

// On utilise Firestore via la variable globale db (définie dans index.html)


const firebaseConfig = {
    apiKey: "AIzaSyBBxPJ2cKT7a8xf7vFTWg8Nclg8n_eJJVk",
    authDomain: "web-nounou.firebaseapp.com",
    projectId: "web-nounou",
    storageBucket: "web-nounou.firebasestorage.app",
    messagingSenderId: "96048431376",
    appId: "1:96048431376:web:699a716cd81e8ff1032595",
    measurementId: "G-0JS7XL3EJ5"
};
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();


async function ajouterEntree() {
    let date = document.getElementById("date").value;
    let heure_debut = document.getElementById("heure_debut").value;
    let heure_fin = document.getElementById("heure_fin").value;
    let km = document.getElementById("km").value;
    let messageDiv = document.getElementById("saisie-message");
    let addBtn = document.querySelector("#saisie button[onclick='ajouterEntree()']");
    messageDiv.textContent = "";
    messageDiv.style.color = "red";

    if (addBtn.textContent === "Ajouter") {
        if (date && heure_debut && heure_fin && km) {
            const dateFR = formatDateFR(date);
            messageDiv.style.color = "#39FF14";
            messageDiv.innerHTML = `
                <strong>Récapitulatif :</strong><br>
                Date : ${dateFR}<br>
                Heure début : ${heure_debut}<br>
                Heure fin : ${heure_fin}<br>
                KM parcourus : ${km}
            `;
            addBtn.textContent = "Valider";
        } else {
            messageDiv.textContent = "Veuillez remplir tous les champs";
        }
    }
    else if (addBtn.textContent === "Valider") {
        const duree = calculeDuree(date, heure_debut, heure_fin);
        await db.collection("suivi").add({
            date,
            heure_debut,
            heure_fin,
            km: Number(km),
            duree
        });
        messageDiv.style.color = "#39FF14";
        addBtn.textContent = "Ajouter";
        document.getElementById("date").value = "";
        document.getElementById("heure_debut").value = "";
        document.getElementById("heure_fin").value = "";
        document.getElementById("km").value = "";
        messageDiv.textContent = "";
        showPage('navigation');
        chargerDonnees();
    }
}

function calculeDuree(date, heure_debut, heure_fin) {
    const debut = new Date(`${date}T${heure_debut}:00`);
    const fin = new Date(`${date}T${heure_fin}:00`);
    return Math.round((fin - debut) / 60000); // minutes
}

async function chargerDonnees() {
    const snapshot = await db.collection("suivi").get();
    let data = [];
    snapshot.forEach(doc => {
        data.push({ id: doc.id, ...doc.data() });
    });

    // Récupère les valeurs des filtres
    const dateDebut = document.getElementById("dateDebut").value;
    const dateFin = document.getElementById("dateFin").value;

    // Filtre les données si les dates sont renseignées
    let filteredData = data.filter(entry => {
        if (dateDebut && entry.date < dateDebut) return false;
        if (dateFin && entry.date > dateFin) return false;
        return true;
    });

    // Trie les données par date croissante
    filteredData.sort((a, b) => new Date(a.date) - new Date(b.date));

    let tableBody = document.getElementById("table-body");
    tableBody.innerHTML = "";
    let totalDuree = 0;
    let totalKm = 0;
    filteredData.forEach(entry => {
        let row = tableBody.insertRow();
        // 1ère cellule : Boutons Modifier & Supprimer
        let actionCell = row.insertCell(0);

        let editButton = document.createElement('button');
        editButton.classList.add("btn-action", "btn-modifier");
        editButton.onclick = () => modifierEntree(entry.id);
        actionCell.appendChild(editButton);

        let deleteButton = document.createElement('button');
        deleteButton.classList.add("btn-action", "btn-supprimer");
        deleteButton.onclick = () => supprimerEntree(entry.id);
        deleteButton.style.marginLeft = "10px";
        actionCell.appendChild(deleteButton);

        // calcul de la durée pour affichage en heure:min dans la page 
        const dureeHHMM = minutesToHHMM(entry.duree);

        // formatage de la date en jj mm aaaa
        const dateFR = formatDateFR(entry.date);

        // insertion des données
        row.insertCell(1).textContent = dateFR;
        row.insertCell(2).textContent = entry.heure_debut;
        row.insertCell(3).textContent = entry.heure_fin;
        row.insertCell(4).textContent = dureeHHMM;
        row.insertCell(5).textContent = entry.km;

        // Calcul des totaux
        totalDuree += entry.duree;
        totalKm += Number(entry.km);
    });

    // affichage des totaux dans le tfoot
    const tfoot = document.querySelector("tfoot");
    if (tfoot) {
        const dureeTotaleHHMM = minutesToHHMM(totalDuree);
        tfoot.innerHTML = `
            <tr>
                <th>Totaux</th>
                <th>-</th>
                <th>-</th>
                <th>-</th>
                <th>${dureeTotaleHHMM}</th>
                <th>${totalKm}</th>
            </tr>
        `;
    }
}

async function modifierEntree(id) {
    const doc = await db.collection("suivi").doc(id).get();
    const entry = doc.data();
    if (!entry) {
        alert("Entrée non trouvée.");
        return;
    }

    showPage('saisie');
    document.getElementById("date").value = entry.date;
    document.getElementById("heure_debut").value = entry.heure_debut;
    document.getElementById("heure_fin").value = entry.heure_fin;
    document.getElementById("km").value = entry.km;

    let messageDiv = document.getElementById("saisie-message");
    let addBtn = document.querySelector("#saisie button[onclick='ajouterEntree()']");
    addBtn.textContent = "Enregistrer";
    messageDiv.textContent = "";
    messageDiv.style.color = "red";

    addBtn.onclick = async function() {
        let date = document.getElementById("date").value;
        let heure_debut = document.getElementById("heure_debut").value;
        let heure_fin = document.getElementById("heure_fin").value;
        let km = document.getElementById("km").value;

        if (addBtn.textContent === "Enregistrer") {
            if (date && heure_debut && heure_fin && km) {
                const dateFR = formatDateFR(date);
                messageDiv.style.color = "#39FF14";
                messageDiv.innerHTML = `
                    <strong>Récapitulatif :</strong><br>
                    Date : ${dateFR}<br>
                    Heure début : ${heure_debut}<br>
                    Heure fin : ${heure_fin}<br>
                    KM parcourus : ${km}
                `;
                addBtn.textContent = "Valider";
            } else {
                messageDiv.textContent = "Veuillez remplir tous les champs";
            }
        }
        else if (addBtn.textContent === "Valider") {
            const duree = calculeDuree(date, heure_debut, heure_fin);
            await db.collection("suivi").doc(id).update({
                date,
                heure_debut,
                heure_fin,
                km: Number(km),
                duree
            });
            messageDiv.style.color = "#39FF14";
            addBtn.textContent = "Ajouter";
            document.getElementById("date").value = "";
            document.getElementById("heure_debut").value = "";
            document.getElementById("heure_fin").value = "";
            document.getElementById("km").value = "";
            messageDiv.textContent = "";
            addBtn.onclick = ajouterEntree;
            showPage('navigation');
            chargerDonnees();
        }
    };
}

async function supprimerEntree(id) {
    if (confirm("Voulez-vous vraiment supprimer cette entrée ?")) {
        await db.collection("suivi").doc(id).delete();
        chargerDonnees();
    }
}

// async function resetData() {
//     const snapshot = await db.collection("suivi").get();
//     const batch = db.batch();
//     snapshot.forEach(doc => batch.delete(doc.ref));
//     await batch.commit();
//     chargerDonnees();
// }

chargerDonnees();

function showPage(id) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById(id).classList.add('active');

    if (id === "saisie") {
        let addBtn = document.querySelector("#saisie button[onclick='ajouterEntree()']");
        if (addBtn.textContent === "Ajouter") {
            const now = new Date();
            const yyyy_mm_dd = now.toISOString().slice(0, 10);
            const hh_mm = now.toTimeString().slice(0, 5);
            document.getElementById("date").value = yyyy_mm_dd;
            document.getElementById("heure_fin").value = hh_mm;
            document.getElementById("heure_debut").value = "16:30";
            document.getElementById("km").value = "";
        }
    }
}

function minutesToHHMM(minutes) {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
}

function formatDateFR(dateStr) {
    const jours = ["dimanche", "lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi"];
    const d = new Date(dateStr);
    const jour = d.getDate().toString().padStart(2, '0');
    const mois = (d.getMonth() + 1).toString().padStart(2, '0');
    const annee = d.getFullYear();
    const nomJour = jours[d.getDay()];
    return `${jour}/${mois}/${annee} (${nomJour})`;
}

// Application du filtrage des dates dès que les dates sont modifiées
document.getElementById("dateDebut").addEventListener("change", chargerDonnees);
document.getElementById("dateFin").addEventListener("change", chargerDonnees);