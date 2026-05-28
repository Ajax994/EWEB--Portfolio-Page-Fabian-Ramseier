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

// SICHERHEITSHINWEIS: // API key is injected at build time via GitHub Actions
const chatMessages = document.getElementById('chat-messages');
const chatInput = document.getElementById('chat-input');
const chatSend = document.getElementById('chat-send');
const chatSuggestions = document.querySelector('.chat-suggestions');
const chatSuggestionButtons = document.querySelectorAll('.chat-suggestion');

const conversationHistory = [];

const isApiKeyConfigured = typeof API_KEY === 'string'
    && API_KEY.trim() !== ''
    && API_KEY !== 'REPLACE_BY_CI'
    && !API_KEY.includes('REPLACE_BY_CI');

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

function disableChatUiForMissingKey() {
    setChatInteractionDisabled(true);

    chatSuggestionButtons.forEach(function(button) {
        button.disabled = true;
        button.setAttribute('aria-disabled', 'true');
    });

    if (chatMessages) {
        const notice = document.createElement('div');
        notice.className = 'chat-message chat-message--assistant';
        notice.textContent = 'Chat-Funktion ist aktuell nicht verfuegbar.';
        chatMessages.appendChild(notice);
        scrollChatToBottom();
    }
}

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
            const errorBody = await response.text();
            const fallbackMessage = 'Entschuldigung, der Recruiter-Chat ist gerade nicht verfuegbar. Bitte versuche es in wenigen Sekunden erneut.';
            appendChatMessage(fallbackMessage, 'chat-message--assistant');
            console.error('Recruiter chat failed:', errorBody || response.status);
            return;
        }

        const data = await response.json();
        const assistantText = data && data.content && data.content[0] ? data.content[0].text : '';

        if (!assistantText) {
            const fallbackMessage = 'Entschuldigung, der Recruiter-Chat ist gerade nicht verfuegbar. Bitte versuche es in wenigen Sekunden erneut.';
            appendChatMessage(fallbackMessage, 'chat-message--assistant');
            console.error('Recruiter chat failed: empty response');
            return;
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

if (chatSend && chatInput && isApiKeyConfigured) {
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

if (!isApiKeyConfigured) {
    disableChatUiForMissingKey();
}

// Section reveal animation
const sections = document.querySelectorAll('section');

if (sections.length > 0) {
    const sectionObserver = new IntersectionObserver(function(entries, observer) {
        entries.forEach(function(entry) {
            if (entry.isIntersecting) {
                entry.target.classList.add('section--visible');
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1
    });

    sections.forEach(function(section) {
        sectionObserver.observe(section);
    });
}

/**
 * Skills Section - Chart.js Implementation
 */
function showSkillsChart(chartId) {
    const skeletonEl = document.getElementById('skeleton-' + chartId);
    const containerEl = document.getElementById('chart-container-' + chartId);
    if (skeletonEl) skeletonEl.style.display = 'none';
    if (containerEl) containerEl.classList.add('is-ready');
}

function showSkillsError(chartId, message) {
    const skeletonEl = document.getElementById('skeleton-' + chartId);
    const errorEl = document.getElementById('error-' + chartId);
    if (skeletonEl) skeletonEl.style.display = 'none';
    if (errorEl) {
        errorEl.textContent = message;
        errorEl.classList.add('is-visible');
    }
}

async function initSkillsCharts() {
    if (typeof Chart === 'undefined') {
        console.error('Chart.js not loaded');
        showSkillsError('competencies', 'Chart library could not be loaded.');
        showSkillsError('tools', 'Chart library could not be loaded.');
        return;
    }

    const competenciesCanvas = document.getElementById('competenciesChart');
    const toolsCanvas = document.getElementById('toolsChart');

    if (!competenciesCanvas || !toolsCanvas) return;

    try {
        const response = await fetch('./assets/data/skills.json');
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();

        if (!data.competencies || !data.tools) throw new Error('Invalid skills data structure');

        renderCompetenciesChart(competenciesCanvas, data.competencies);
        showSkillsChart('competencies');

        renderToolsChart(toolsCanvas, data.tools);
        showSkillsChart('tools');
    } catch (error) {
        console.error('Failed to load skills data:', error);
        showSkillsError('competencies', 'Could not load skills data. Please try refreshing the page.');
        showSkillsError('tools', 'Could not load skills data. Please try refreshing the page.');
    }
}

function renderCompetenciesChart(canvas, competencies) {
    const labels = competencies.map(c => c.label);
    const values = competencies.map(c => c.value);

    new Chart(canvas, {
        type: 'radar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Score',
                data: values,
                fill: true,
                backgroundColor: 'rgba(224, 123, 57, 0.4)',
                borderColor: '#E07B39',
                pointBackgroundColor: '#E07B39',
                pointBorderColor: '#fff',
                pointHoverBackgroundColor: '#fff',
                pointHoverBorderColor: '#E07B39',
                borderWidth: 2
            }, {
                label: 'Range',
                data: values.map(v => Math.min(100, v + 15)),
                fill: true,
                backgroundColor: 'rgba(224, 123, 57, 0.1)',
                borderColor: 'transparent',
                pointRadius: 0,
                pointHitRadius: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                r: {
                    angleLines: {
                        color: 'rgba(255, 255, 255, 0.2)'
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    },
                    pointLabels: {
                        color: '#a0a0a0',
                        font: {
                            size: 11,
                            family: "'Inter', sans-serif"
                        }
                    },
                    ticks: {
                        display: false,
                        stepSize: 20
                    },
                    min: 0,
                    max: 100
                }
            },
            plugins: {
                legend: {
                    display: true,
                    position: 'top',
                    align: 'start',
                    labels: {
                        color: '#a0a0a0',
                        usePointStyle: true,
                        pointStyle: 'rect',
                        padding: 15,
                        font: {
                            size: 12
                        }
                    }
                }
            }
        }
    });
}

function renderToolsChart(canvas, tools) {
    const labels = tools.map(t => t.label);
    const values = tools.map(t => t.value);

    new Chart(canvas, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Proficiency',
                data: values,
                backgroundColor: '#378ADD',
                borderRadius: 4,
                barThickness: 16
            }]
        },
        options: {
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: {
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    },
                    ticks: {
                        color: '#a0a0a0',
                        font: {
                            size: 11
                        },
                        callback: function(value) {
                            return value + "%";
                        }
                    },
                    min: 0,
                    max: 100
                },
                y: {
                    grid: {
                        display: false
                    },
                    ticks: {
                        color: '#a0a0a0',
                        font: {
                            size: 12
                        }
                    }
                }
            },
            plugins: {
                legend: {
                    display: true,
                    position: 'top',
                    align: 'start',
                    labels: {
                        color: '#a0a0a0',
                        usePointStyle: true,
                        pointStyle: 'rect',
                        padding: 15,
                        font: {
                            size: 12
                        }
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `Proficiency: ${context.raw}%`;
                        }
                    }
                }
            }
        }
    });
}

// Initialize charts when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    initSkillsCharts();
});
