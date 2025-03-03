const API_URL = "http://localhost:3000";

async function ajouterEntree() {
    let date = document.getElementById("date").value;
    let heures = document.getElementById("heures").value;
    let km = document.getElementById("km").value;

    if (!date || !heures || !km) {
        alert("Veuillez remplir tous les champs");
        return;
    }

    await fetch(`${API_URL}/ajouter`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date, heures, km })
    });

    chargerDonnees();
}

async function chargerDonnees() {
    let response = await fetch(`${API_URL}/donnees`);
    let data = await response.json();
    let tableBody = document.getElementById("table-body");
    tableBody.innerHTML = "";

    data.forEach(entry => {
        let row = tableBody.insertRow();
        row.insertCell(0).textContent = entry.date;
        row.insertCell(1).textContent = entry.heures;
        row.insertCell(2).textContent = entry.km;
    });
}

async function resetData() {
    await fetch(`${API_URL}/reset`, { method: "DELETE" });
    chargerDonnees();
}

chargerDonnees();
