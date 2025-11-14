if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
window.scrollTo(0, 0);

document.addEventListener('DOMContentLoaded', () => {
    const root = document.documentElement;
    const icon = document.getElementById('theme-icon');
    const toggleButton = document.getElementById('theme-toggle');

    const savedTheme = localStorage.getItem('theme');
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    function applyTheme(theme) {
        const isDark = theme === 'dark';
        root.classList.toggle('dark-mode', isDark);
        if (icon) icon.textContent = isDark ? 'brightness_3' : 'brightness_5';
    }

    if (savedTheme) {
        applyTheme(savedTheme);
    } else {
        applyTheme(mediaQuery.matches ? 'dark' : 'light');
    }

    mediaQuery.addEventListener('change', e => {
        if (!localStorage.getItem('theme')) {
            applyTheme(e.matches ? 'dark' : 'light');
        }
    });

    if (toggleButton) {
        toggleButton.addEventListener('click', () => {
            const isDark = root.classList.toggle('dark-mode');
            if (icon) icon.textContent = isDark ? 'brightness_3' : 'brightness_5';
            localStorage.setItem('theme', isDark ? 'dark' : 'light');
        });
    }
});

window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
        document.body.classList.add('scrolled');
    } else {
        document.body.classList.remove('scrolled');
    }
});


function ensurePrompt(section, meta) {
    let prompt = section.querySelector('.terminal-prompt');
    if (!prompt) {
        prompt = document.createElement('div');
        prompt.className = 'terminal-prompt';
        section.appendChild(prompt);
    }

    let path = prompt.querySelector('.prompt-path');
    if (!path) {
        path = document.createElement('span');
        path.className = 'prompt-path';
        prompt.appendChild(path);
    }

    let dir = prompt.querySelector('.prompt-dir');
    if (!dir) {
        dir = document.createElement('span');
        dir.className = 'prompt-dir';
        prompt.appendChild(dir);
    }

    let sep = prompt.querySelector('.prompt-sep');
    if (!sep) {
        sep = document.createElement('span');
        sep.className = 'prompt-sep';
        sep.textContent = '$';
        prompt.appendChild(sep);
    }

    let cmd = prompt.querySelector('.prompt-cmd');
    if (!cmd) {
        cmd = document.createElement('span');
        cmd.className = 'prompt-cmd';
        prompt.appendChild(cmd);
    }

    let cursor = prompt.querySelector('.cursor');
    if (!cursor) {
        cursor = document.createElement('span');
        cursor.className = 'cursor';
        prompt.appendChild(cursor);
    }

    const user = meta?.user ?? 'v';
    const host = meta?.host ?? 'elster.dev';
    const directory = meta?.dir ?? '~/';

    path.textContent = `${user}@${host}`;
    if (!prompt.querySelector('.prompt-colon')) {
        const colon = document.createElement('span');
        colon.className = 'prompt-colon';
        colon.textContent = ':';
        prompt.insertBefore(colon, dir);
    }
    dir.textContent = directory;

    return { prompt, path, dir, cmd, cursor };
}


function typeCommand(cmdEl, file) {
    if (!cmdEl) return;
    const candidates = [`cat ${file}`, `less ${file}`, `nano ${file}`];
    const chosen = candidates[Math.floor(Math.random() * candidates.length)];
    cmdEl.textContent = '';

    let i = 0;
    function step() {
        cmdEl.textContent = chosen.slice(0, i++);
        if (i <= chosen.length) requestAnimationFrame(step);
    }
    step();
}

function initEditorTabs(scopeSelector, editorId, files, defaultText, meta) {
    const scope = document.querySelector(scopeSelector);
    if (!scope) return;

    const editor =
        scope.querySelector(`#${editorId}`) || document.getElementById(editorId);
    if (!editor) return;

    const tabs = Array.from(scope.querySelectorAll('.tab[data-file]'));
    const { cmd } = ensurePrompt(scope, meta);

    function setDefault() {
        tabs.forEach(t => t.classList.remove('active'));

        if (editorId === 'editor_projects') {
            editor.innerHTML = `
            <div class="project-tiles">
                <div class="project-tile" onclick="window.open('https://github.com/val8elster/','_blank')">
                    <img src="assets/bink_dark.png" alt="B-INK" />
                    <span>B-IN-K</span>
                </div>
                <div class="project-tile" onclick="window.open('https://github.com/val8elster/athena-backend','_blank')">
                    <img src="assets/elster.png" alt="Athena" />
                    <span>athena</span>
                </div>
            </div>
        `;
        } else {
            editor.textContent = defaultText;
        }

        tabs.forEach(t => {
            const close = t.querySelector('.tab-close');
            if (close) close.style.display = 'none';
        });

        if (cmd) cmd.textContent = '';
    }

    function openTab(tab) {
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');

        const key = tab.dataset.file;
        editor.textContent = files[key] ?? '// No content available';

        tabs.forEach(t => {
            const close = t.querySelector('.tab-close');
            if (!close) return;
            close.style.display = t === tab ? 'inline' : 'none';
        });

        typeCommand(cmd, key || 'README.md');
    }

    tabs.forEach(tab => {
        if (!tab.querySelector('.tab-close')) {
            const c = document.createElement('span');
            c.className = 'tab-close';
            c.title = 'Close';
            c.textContent = '×';
            tab.appendChild(c);
        }

        const close = tab.querySelector('.tab-close');
        if (close) {
            close.addEventListener('click', e => {
                e.stopPropagation();
                setDefault();
            });
        }

        tab.addEventListener('click', e => {
            if (e.target && e.target.classList.contains('tab-close')) return;
            openTab(tab);
        });
    });

    const initial = scope.querySelector('.tab.active[data-file]');
    if (initial) openTab(initial);
    else setDefault();
}

document.addEventListener('DOMContentLoaded', () => {
    initEditorTabs(
        'section.hero',
        'editor',
        {
            'README.md': `# elster.dev 
Personal portfolio, infrastructure lab & playground for hardware + software experiments. 
* Built & hosted entirely on my own stack * 
Written in plain HTML + CSS + JS (no frameworks) 
* Contains real projects like \`B-IN-K\`, and \`athena\``,

            'package.json': `{ 
"name": "elster.dev", 
"version": "3.1.0", 
"private": true, 
"scripts": { 
    "deploy": "ftp push ./dist", 
    "start": "serve ./public" 
}, 
"keywords": [
    "portfolio", 
    "self-hosting", 
    "automation", 
    "hardware"
] 
}`,

            '.gitignore': `# Things that stay private 
.env 
/backups/ 
/drafts/ 
credentials.txt 

sleep.log`

        },
        `// Welcome to elster.dev
// Your entry point to all projects & infrastructure.
// Use the tabs to explore different “files”.`,
        {
            user: 'v',
            host: 'elster.dev',
            dir: '~/',
        }
    );

    initEditorTabs(
        '#projects',
        'editor_projects',
        {
            'projects.py': `python class Project: def __init__(self, name, stack, summary): 
    self.name = name 
    self.stack = stack 
    self.summary = summary 
    projects = [ 
        Project("B-IN-K", "CircuitPython + Pico W", "Binary input keyboard with OLED and UPS HAT."), 
        Project("Athena", "Kotlin + Spring + Angular", "Personal library and test-assistant app.") 
    ] 
    for p in projects: print(f"{p.name} → {p.summary}")`,
            'bink.py': `python class BINK: 
    controller = "Raspberry Pico W"
    buttons = 8 
    backspace = true
    display = "SH1106 OLED"`,
            'athena.kt': `kotlin data class Athena(val role: String = "Private Library Application", val barcodeScanner = true) 
    fun main() = println("Hello from Athena!")`
        },
        `# Projects`,
        {
            user: 'v',
            host: 'elster.dev',
            dir: '~/portfolio'
        }
    );

    initEditorTabs(
        '#lab',
        'editor_lab',
        {
            'infrastructure.yaml': `infrastructure:
  tbd`,

            'lab.yaml': `tbd`,

            'uptime.json': `tbd`
        },
        `# Lab Overview
# This pane previews infra/config snippets for your stack.
# Pick a tab above, or close it to return to this overview.`,
        {
            user: 'root',
            host: 'srv.elster.dev',
            dir: '/etc/infra'
        }
    );

    initEditorTabs(
        '#about',
        'editor_about',
        {
            'about.txt': `Name: V. M. 
Role: Software Engineer / Maker 
Location: Germany 
Focus: Automation · Embedded Systems · Self-Hosting · Service Integration"`,

            'license': `license = [
    "code": 'MIT License',
    "media": 'CC BY 4.0',
    "credit": 'Copyright (c) 2025 val8elster'
]`,

            'contact.json': `{ 
"email": "contact@elster.dev", 
"github": "val8elster", 
}`
        },
        `// About Section
// Short bio, licensing and contact info live here.
// Close any file to return to this summary.`,
        {
            user: 'guest',
            host: 'localhost',
            dir: '~/about'
        }
    );
});

document.addEventListener("DOMContentLoaded", () => {
    const sections = document.querySelectorAll("section");

    sections.forEach(section => {
        const closeBtn = section.querySelector(".section-close");

        if (closeBtn) {
            closeBtn.addEventListener("click", () => {
                section.classList.remove("active");
            });
        }
    });

    const projects = document.querySelector("#project-button");
    projects.addEventListener("click", () => {
        document.querySelector("#projects").classList.add("active");
    })

    const lab = document.querySelector("#lab-button");
    lab.addEventListener("click", () => {
        document.querySelector("#lab").classList.add("active");
    })

    const about = document.querySelector("#about-button");
    about.addEventListener("click", () => {
        document.querySelector("#about").classList.add("active");
    })
});

document.addEventListener('DOMContentLoaded', () => {
    const header = document.querySelector('.header');
    const brand  = document.querySelector('.logo.boot strong');
    const nav    = document.querySelector('.nav-links');
    let released = false;

    header.classList.add('splash');

    function flipRelease() {
        header.classList.remove('splash');
        header.classList.add('locked');

        brand.style.transition = 'none';
        brand.style.transform = 'translate3d(0, 0, 0)';

        nav.animate([{opacity:0},{opacity:1}], {duration:450, delay:250, fill:'forwards'});
    }

    const threshold = window.innerHeight * 0.9;
    window.addEventListener('scroll', () => {
        if (!released && window.scrollY >= threshold) {
            released = true;
            flipRelease();
        }
    }, { passive: true });

    const bootText = document.getElementById('bootText');
    if (bootText) digitalDecode(bootText, 'elster.dev');
});

document.addEventListener('DOMContentLoaded', () => {
    const header = document.querySelector('.header');
    const title  = header.querySelector('.logo.boot strong');

    const splashHeight      = window.innerHeight;
    const lockThreshold     = splashHeight * 0.90;
    const headerH = header.getBoundingClientRect().height;
    const stopAt  = Math.max(0, headerH - title.offsetHeight - 16);

    let locked  = false;
    let lastY   = 0;
    let ticking = false;

    function onScroll() {
        lastY = window.scrollY;
        if (!ticking) {
            requestAnimationFrame(update);
            ticking = true;
        }
    }

    function update() {
        const y = lastY;

        if (!locked) {
            const t = Math.min((y / lockThreshold), 1);

            title.style.transform = `translate3d(0, 25vh, 0)`;
            title.style.transition = 'transform 1.5s ease-out'
            title.style.opacity = `${1 - t * 0.08}`;
        }

        if (!locked && y >= splashHeight - (3 * title.offsetHeight)) {
            locked = true;
            header.classList.add('locked');

            title.style.transition = 'transform 0.5s ease-in-out, opacity 0.4s ease';
            title.style.transform = 'translate3d(-35vw, 25vh, 0)';
            title.style.opacity = '1';

            setTimeout(() => {
                title.style.transition = '';
            }, 600);
        }
        ticking = false;
    }

    window.addEventListener('scroll', onScroll, { passive: true });
});

function digitalDecode(element, finalText) {
    const chars = "!<>-_\\/[]{}—=+*^?#________";
    let iterations = 0;
    const original = finalText;
    const scramble = setInterval(() => {
        element.textContent = original
            .split("")
            .map((char, i) => {
                if (i < iterations / 2) return original[i];
                return chars[Math.floor(Math.random() * chars.length)];
            })
            .join("");

        if (iterations >= original.length * 2) {
            clearInterval(scramble);
            element.textContent = original;
        }
        iterations += 1 / 2;
    }, 40);
}

