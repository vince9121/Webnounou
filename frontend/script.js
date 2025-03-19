const API_URL = "http://localhost:3000"; // Change this URL if needed when deployed

async function ajouterEntree() {
    console.log("ajouterEntree dans script.js");
    let date = document.getElementById("date").value;
    let heure_debut = document.getElementById("heure_debut").value;
    let heure_fin = document.getElementById("heure_fin").value;
    let km = document.getElementById("km").value;
    console.log(date, heure_debut,km);
    if (date && heure_debut && heure_fin && km) {
        await fetch(`${API_URL}/ajouter`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({date, heure_debut, heure_fin, km })
        });
        chargerDonnees();
    } else {
        alert("Veuillez remplir tous les champs");
    }
}

async function chargerDonnees() {
    console.log("chargerDonnees dans script.js");
    let response = await fetch(`${API_URL}/donnees`);
    let data = await response.json();
    let tableBody = document.getElementById("table-body");
    tableBody.innerHTML = "";
    data.forEach(entry => {
        let row = tableBody.insertRow();
        // 1ère cellule : Boutons Modifier & Supprimer
        let actionCell = row.insertCell(0);

        let editButton = document.createElement('button');
        editButton.classList.add("btn-action", "btn-modifier");
        // editButton.textContent = "Modifier";
        editButton.onclick = () => modifierEntree(entry.id);
        actionCell.appendChild(editButton);

        let deleteButton = document.createElement('button');
        deleteButton.classList.add("btn-action", "btn-supprimer");
        // deleteButton.textContent = "Supprimer";
        deleteButton.onclick = () => supprimerEntree(entry.id);
        deleteButton.style.marginLeft = "10px"; // Espacement entre les boutons
        actionCell.appendChild(deleteButton);

        row.insertCell(1).textContent = entry.date;
        row.insertCell(2).textContent = entry.heure_debut;
        row.insertCell(3).textContent = entry.heure_fin;
        row.insertCell(4).textContent = entry.duree + " min";
        row.insertCell(5).textContent = entry.km;
        
    });
}

async function modifierEntree(id) {
    console.log("modifierEntree dans script.js");
    
    const newDate = prompt("Entrez la nouvelle date");
    const newHeures = prompt("Entrez le nouveau nombre d'heures");
    const newKm = prompt("Entrez le nouveau nombre de kilomètres");
    
    if (newDate && newHeures && newKm) {
        await fetch(`${API_URL}/modifier/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ date: newDate, heures: newHeures, km: newKm })
        });
        chargerDonnees();
    } else {
        alert("Veuillez entrer toutes les informations.");
    }
}

async function resetData() {
    await fetch(`${API_URL}/reset`, { method: 'DELETE' });
    chargerDonnees();
}

chargerDonnees();
