const toggleBtn = document.getElementById('myButton1');
const hiddenText = document.getElementById('hiddenText');

// Event-Listener für den Button
toggleBtn.addEventListener('click', function() {
    // Alert anzeigen
    alert('Hello World');

    // Toggle-Klasse 'hidden' hinzufügen oder entfernen
    hiddenText.classList.toggle('hidden');

    // Button-Text und Status aktualisieren
    if (hiddenText.classList.contains('hidden')) {
        toggleBtn.textContent = 'Text anzeigen';
        toggleBtn.classList.remove('active');
    } else {
        toggleBtn.textContent = 'Text verbergen';
        toggleBtn.classList.add('active');
    }
});

