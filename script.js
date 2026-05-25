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

const contactForm = document.getElementById('contact-form');
const contactStatus = document.getElementById('contact-status');

async function submitContactFormData(actionUrl, formData) {
    try {
        const response = await fetch(actionUrl, {
            method: 'POST',
            headers: {
                'Accept': 'application/json'
            },
            body: formData
        });

        if (response.ok) {
            return { ok: true };
        }

        let errorMessage = 'Entschuldigung, das Formular konnte nicht gesendet werden.';
        const errorData = await response.json().catch(function() {
            return null;
        });

        if (errorData && errorData.errors && errorData.errors.length) {
            errorMessage = errorData.errors[0].message || errorMessage;
        }

        return { ok: false, message: errorMessage };
    } catch (error) {
        return { ok: false, message: 'Entschuldigung, das Formular konnte nicht gesendet werden.' };
    }
}

function updateContactStatus(message, statusClass) {
    if (!contactStatus) {
        return;
    }

    contactStatus.textContent = message;
    contactStatus.className = `contact-status ${statusClass}`.trim();
}

function setFieldError(fieldId, message) {
    const input = document.getElementById('contact-' + fieldId);
    const errorEl = document.getElementById('error-' + fieldId);
    if (input) input.classList.add('is-invalid');
    if (errorEl) {
        errorEl.textContent = message;
        errorEl.classList.add('is-visible');
    }
}

function clearFieldError(fieldId) {
    const input = document.getElementById('contact-' + fieldId);
    const errorEl = document.getElementById('error-' + fieldId);
    if (input) input.classList.remove('is-invalid');
    if (errorEl) {
        errorEl.textContent = '';
        errorEl.classList.remove('is-visible');
    }
}

function validateContactForm() {
    let valid = true;

    const nameVal = (document.getElementById('contact-name') || {}).value || '';
    const emailVal = (document.getElementById('contact-email') || {}).value || '';
    const messageVal = (document.getElementById('contact-message') || {}).value || '';
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    clearFieldError('name');
    clearFieldError('email');
    clearFieldError('message');

    if (nameVal.trim().length < 2) {
        setFieldError('name', 'Name must be at least 2 characters.');
        valid = false;
    }
    if (!emailPattern.test(emailVal.trim())) {
        setFieldError('email', 'Please enter a valid email address.');
        valid = false;
    }
    if (messageVal.trim().length < 20) {
        setFieldError('message', 'Message must be at least 20 characters.');
        valid = false;
    }

    return valid;
}

if (contactForm) {
    ['name', 'email', 'message'].forEach(function(fieldId) {
        const el = document.getElementById('contact-' + fieldId);
        if (el) {
            el.addEventListener('input', function() {
                clearFieldError(fieldId);
            });
        }
    });

    contactForm.addEventListener('submit', async function(event) {
        event.preventDefault();

        if (!validateContactForm()) return;

        const submitButton = document.getElementById('contact-submit');
        if (submitButton) {
            submitButton.disabled = true;
            submitButton.textContent = 'Sending...';
            submitButton.classList.add('is-loading');
        }

        updateContactStatus('', '');

        const formData = new FormData(contactForm);
        const result = await submitContactFormData(contactForm.action, formData);

        if (result.ok) {
            updateContactStatus('Danke! Deine Nachricht wurde gesendet.', 'is-success');
            contactForm.reset();
            ['name', 'email', 'message'].forEach(function(id) { clearFieldError(id); });
        } else {
            updateContactStatus(result.message, 'is-error');
        }

        if (submitButton) {
            submitButton.disabled = false;
            submitButton.textContent = 'Send';
            submitButton.classList.remove('is-loading');
        }
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
