function pingIP() {
    var ip = document.getElementById("commandInput").value;
    fetch(`/ping?ip=${ip}`)
        .then(response => response.text())
        .then(data => {
            const output = document.getElementById("output");
            // Définir la couleur et le texte de l'output basé sur la réponse du ping
            if (data.includes("temps écoulé") || data.includes("Destination host unreachable")) {
                // Si le ping échoue (aucune réponse ou hôte injoignable)
                output.className = "red"; // Appliquer la classe CSS pour le texte rouge
                output.textContent = "Inactive"; // Afficher "Inactive"
            } else if (data.includes("réponse de") || data.includes("bytes from")) {
                // Si le ping réussit (réponse obtenue de l'IP)
                output.className = "green"; // Appliquer la classe CSS pour le texte vert
                output.textContent = "Active"; // Afficher "Active"
            } else {
                // Si le statut du ping est incertain ou en attente de réponse
                output.className = "orange"; // Appliquer la classe CSS pour le texte orange
                output.textContent = "En attente"; // Afficher "En attente"
            }
        }).catch(error => {
            console.error('Erreur lors du fetch:', error);
            output.className = "red"; // Appliquer la classe CSS pour le texte rouge en cas d'erreur
            output.textContent = "Erreur réseau"; // Afficher un message d'erreur réseau
        });
}


function getMoreInfo() {
    var ip = document.getElementById("commandInput").value;
    fetch(`/moreinfo?ip=${ip}`)
        .then(response => response.json())
        .then(data => {
            const output = document.getElementById("output");
            let iconHTML = "";
            if (data[0] && data[0].status) {
                console.log("Status:", data[0].status);
                switch (data[0].status) {
                    case "Inactif":
                        output.className = "red";
                        iconHTML = '<i class="fas fa-times-circle"></i>'; // Icône "failed"
                        break;
                    case "Actif":
                        output.className = "green";
                        iconHTML = '<i class="fas fa-check-circle"></i>'; // Icône "done"
                        break;
                    case "En attente":
                        output.className = "orange";
                        iconHTML = '<i class="fas fa-hourglass-half"></i>'; // Icône "en cours"
                        break;
                    default:
                        output.className = ""; // Réinitialiser la classe si le statut est inconnu
                        iconHTML = ""; // Aucune icône
                        break;
                }
            }
            output.innerHTML = `${iconHTML} ${JSON.stringify(data, null, 2)}`; // Affiche l'icône suivi des données
        })
        .catch(error => {
            console.error('Erreur lors du fetch:', error);
            output.className = "red";
            output.innerHTML = '<i class="fas fa-exclamation-triangle"></i> Erreur lors de la récupération des informations';
        });
}




