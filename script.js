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

// Fade header transparency while scrolling
window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
        document.body.classList.add('scrolled');
    } else {
        document.body.classList.remove('scrolled');
    }
});

