// Mobile nav toggle
const navToggle = document.getElementById('navToggle');
const navLinks = document.getElementById('navLinks');

navToggle.addEventListener('click', function() {
    navLinks.classList.toggle('open');
});

// Close mobile nav when a link is clicked
navLinks.querySelectorAll('.nav-link').forEach(function(link) {
    link.addEventListener('click', function() {
        navLinks.classList.remove('open');
    });
});

// SICHERHEITSHINWEIS: API-Key ist im Client-seitigen Code sichtbar.
// Auf GitHub Pages (Static Hosting) ist kein serverseitiger Proxy moeglich.
// Produktive Loesung: Serverless Function als Proxy (z.B. Netlify/Vercel).
// Massnahmen: Spending Limit $2, Key wird nach Benotung rotiert.
const API_KEY = "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";

const systemPrompt = `Du bist ein freundlicher, sachlicher Assistent der Fachschule Bern Portfolio-Seite von Fabian Ramseier.
Deine einzige Aufgabe: Recruitern ehrlich beantworten ob Fabian fuer eine konkrete Stelle geeignet ist.

Fabians Profil:
- Studium: Bsc Wirtschaftsinformatik (digital Business and AI), Fachhochschule Bern (laufend)
- Praktische Erfahrung: Projekt bei Mobiliar ([Projektbeschreibung: Modernisierung des Versicherungsproduktes sowie des Systems]), 5 Jahre Consulting in der Versicherungsindustrie mit Fokus auf KMU, Lehre auf einer Generalagentur (ebenfalls Versicherungsbranche),
- Skills: HTML, CSS, JavaScript, Python, Grundlagenwissen mit AI, Versicherungstechnik, Jira, agile Methoden (SAFe), Stakeholder Management, 
- Sprachen: Deutsch (Muttersprache), Englisch (B2), Franzoesisch (B1)
- Staerken: Schneller Lerner, uebernimmt gerne Verantwortung, Wissensdurstig, sehr adaptiv bei neuen Situationen,
- Einschraenkungen: Aktuell nur Teilzeit aufgrund des Studiums. Einschraenkung entfaellt Sommer 2027.
Antworte immer auf Deutsch. Bleib sachlich.
Wenn du etwas nicht weisst, sag es offen. Erfinde keine Fakten ueber Fabian.`;

const chatMessages = document.getElementById('chat-messages');
const chatInput = document.getElementById('chat-input');
const chatSend = document.getElementById('chat-send');
const chatSuggestions = document.querySelector('.chat-suggestions');
const chatSuggestionButtons = document.querySelectorAll('.chat-suggestion');

const conversationHistory = [];

function scrollChatToBottom() {
    if (!chatMessages) {
        return;
    }
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function appendChatMessage(text, className) {
    if (!chatMessages) {
        return null;
    }

    const messageEl = document.createElement('div');
    messageEl.className = `chat-message ${className}`;
    messageEl.textContent = text;
    chatMessages.appendChild(messageEl);
    scrollChatToBottom();
    return messageEl;
}

function setChatInteractionDisabled(isDisabled) {
    if (chatSend) {
        chatSend.disabled = isDisabled;
    }
    if (chatInput) {
        chatInput.disabled = isDisabled;
    }
}

async function sendChatMessage() {
    if (!chatInput || !chatMessages || !chatSend) {
        return;
    }

    const userText = chatInput.value.trim();
    if (!userText) {
        return;
    }

    appendChatMessage(userText, 'chat-message--user');
    conversationHistory.push({ role: 'user', content: userText });
    chatInput.value = '';

    setChatInteractionDisabled(true);
    const loadingMessage = appendChatMessage('Fabian wird analysiert...', 'chat-message--loading');

    try {
        const response = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': API_KEY,
                'anthropic-version': '2023-06-01',
                'anthropic-dangerous-direct-browser-access': 'true'
            },
            body: JSON.stringify({
                model: 'claude-sonnet-4-6',
                max_tokens: 500,
                system: systemPrompt,
                messages: conversationHistory
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error: ${response.status}`);
        }

        const data = await response.json();
        const assistantText = data && data.content && data.content[0] ? data.content[0].text : '';

        if (!assistantText) {
            throw new Error('Leere Antwort von der API.');
        }

        conversationHistory.push({ role: 'assistant', content: assistantText });
        appendChatMessage(assistantText, 'chat-message--assistant');
    } catch (error) {
        const fallbackMessage = 'Entschuldigung, der Recruiter-Chat ist gerade nicht verfuegbar. Bitte versuche es in wenigen Sekunden erneut.';
        appendChatMessage(fallbackMessage, 'chat-message--assistant');
        console.error('Recruiter chat failed:', error);
    } finally {
        if (loadingMessage && loadingMessage.parentNode) {
            loadingMessage.parentNode.removeChild(loadingMessage);
        }
        setChatInteractionDisabled(false);
        chatInput.focus();
        scrollChatToBottom();
    }
}

if (chatSend && chatInput) {
    chatSend.addEventListener('click', sendChatMessage);

    chatInput.addEventListener('keydown', function(event) {
        if (event.key === 'Enter') {
            event.preventDefault();
            sendChatMessage();
        }
    });

    chatSuggestionButtons.forEach(function(button) {
        button.addEventListener('click', function() {
            const prompt = button.getAttribute('data-prompt');
            if (!prompt) {
                return;
            }

            chatInput.value = prompt;
            sendChatMessage();

            if (chatSuggestions) {
                chatSuggestions.style.display = 'none';
            }
        });
    });
}

const projectFilters = document.querySelectorAll('.project-filter');
const projectCards = document.querySelectorAll('.project-card');

function applyProjectFilter(filter) {
    projectCards.forEach(function(card) {
        const category = card.getAttribute('data-category');
        const isVisible = filter === 'all' || category === filter;
        card.style.display = isVisible ? '' : 'none';
    });
}

if (projectFilters.length && projectCards.length) {
    projectFilters.forEach(function(button) {
        button.addEventListener('click', function() {
            const filter = button.getAttribute('data-filter') || 'all';

            projectFilters.forEach(function(btn) {
                btn.classList.remove('is-active');
                btn.setAttribute('aria-pressed', 'false');
            });

            button.classList.add('is-active');
            button.setAttribute('aria-pressed', 'true');

            applyProjectFilter(filter);
        });
    });
}
