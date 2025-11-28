// --- DATABASE OF CHAPTERS (You allow author editing here) ---
// Since we don't have a backend, we store chapters in this Javascript Object.
// To add a chapter, simply copy the format and paste your text.

const chapters = {
    1: {
        title: "Chapter 1: The Beginning",
        content: `
            <p>The sky was the color of a dying ember. It had been this way since the Great Fall, a reminder that the world had moved on, even if its inhabitants hadn't.</p>
            <p>Elias adjusted the strap of his pack. The weight was familiar, comforting even. In a world of ghosts, physical burdens were the only things that felt real.</p>
            <p>"We shouldn't be here," Kael whispered, his voice barely audible over the howling wind.</p>
        `
    },
    2: {
        title: "Chapter 2: The Shadow",
        content: `
            <p>Darkness didn't just fall in the ruins; it rose. It seeped up from the cracks in the pavement, a living, breathing entity.</p>
            <p>Elias drew his blade. It hummed with a faint blue light, the only technology left that still worked properly.</p>
        `
    },
    3: {
        title: "Chapter 3: Awakening",
        content: `
            <p>The machine lay dormant, a giant of steel and wire sleeping beneath the cathedral. It was beautiful, in a terrifying way.</p>
            <p>This was what they had died for. This was the hope of the new world.</p>
        `
    }
};

// --- NAVIGATION LOGIC ---

function showSection(sectionId) {
    // Hide all sections
    document.querySelectorAll('.section').forEach(sec => {
        sec.classList.remove('active-section');
        sec.classList.add('hidden');
    });

    // Show target section
    const target = document.getElementById(sectionId);
    target.classList.remove('hidden');
    target.classList.add('active-section');

    // Update Sidebar highlight
    document.querySelectorAll('.nav-links li').forEach(li => {
        li.classList.remove('active');
    });
    // This is a simple check, in a real app you'd match IDs better
    if(sectionId === 'home') document.querySelector('.nav-links li:nth-child(1)').classList.add('active');
    if(sectionId === 'novel') document.querySelector('.nav-links li:nth-child(2)').classList.add('active');
    if(sectionId === 'gallery') document.querySelector('.nav-links li:nth-child(3)').classList.add('active');
}

// --- READER LOGIC ---

function loadChapter(chapterId) {
    const chapter = chapters[chapterId];
    if (!chapter) return alert("Chapter not found yet!");

    // Hide list, show viewer
    document.querySelector('.chapter-list').classList.add('hidden');
    const viewer = document.getElementById('chapter-viewer');
    viewer.classList.remove('hidden');

    // Inject content
    document.getElementById('chapter-title').innerText = chapter.title;
    document.getElementById('chapter-content').innerHTML = chapter.content;
    
    // Scroll to top
    window.scrollTo(0,0);
}

function closeChapter() {
    document.getElementById('chapter-viewer').classList.add('hidden');
    document.querySelector('.chapter-list').classList.remove('hidden');
}
