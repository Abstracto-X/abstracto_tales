// === CONFIGURATION: CHARACTER DATABASE ===
// Add your characters here. 
// 'id' must be unique. 'type' can be: 'hero', 'villain', 'location'.
// 'images' array: First image is the main card, others are for the sub-gallery.

const characters = [
    {
        id: "aeliana",
        name: "Aeliana",
        title: "The Void Walker",
        type: "hero",
        role: "Protagonist",
        origin: "Sector 7 Ruins",
        bio: "Born in the aftermath of the Great Fall, Aeliana discovered she could manipulate the void energy that destroyed her ancestors. She seeks to restore balance, but the darkness whispers to her constantly.",
        images: [
            "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80", // Main Portrait
            "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=600&q=80", // Action Shot
            "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=600&q=80"  // Sketch/Alt
        ]
    },
    {
        id: "kael",
        name: "General Kael",
        title: "The Iron Vanguard",
        type: "villain",
        role: "Antagonist",
        origin: "The Citadel",
        bio: "Kael believes that order can only be maintained through absolute control. His cybernetic enhancements have stripped away much of his humanity, leaving only a cold, calculating tactician.",
        images: [
            "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=600&q=80",
            "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80"
        ]
    },
    {
        id: "citadel",
        name: "The Citadel",
        title: "Seat of Power",
        type: "location",
        role: "Capital City",
        origin: "N/A",
        bio: "A floating fortress above the clouds, where the elite live in luxury while the surface world rots. It is protected by an impenetrable energy shield.",
        images: [
            "https://images.unsplash.com/photo-1542259681-d4cd7193bc86?auto=format&fit=crop&w=600&q=80",
            "https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?auto=format&fit=crop&w=600&q=80"
        ]
    }
];

const chapters = {
    1: { title: "Ch 1: The Beginning", content: "<p>The sky was the color of a dying ember...</p>" },
    2: { title: "Ch 2: The Shadow", content: "<p>Darkness didn't just fall in the ruins; it rose...</p>" }
};

// === APP LOGIC ===

// 1. Navigation
function showSection(id) {
    document.querySelectorAll('.section').forEach(s => s.classList.remove('active-section'));
    document.querySelectorAll('.section').forEach(s => s.classList.add('hidden'));
    document.getElementById(id).classList.remove('hidden');
    document.getElementById(id).classList.add('active-section');
    
    // Update Sidebar
    document.querySelectorAll('.nav-links li').forEach(li => li.classList.remove('active'));
    event.currentTarget.classList.add('active'); // Requires the click to pass 'event' or handle manually
}

// 2. Render Gallery (Masonry)
function renderGallery(filter = 'all') {
    const container = document.getElementById('gallery-container');
    container.innerHTML = ''; // Clear current

    characters.forEach(char => {
        if (filter === 'all' || char.type === filter) {
            const card = document.createElement('div');
            card.className = 'gallery-card';
            card.onclick = () => openCharacterModal(char.id);
            
            card.innerHTML = `
                <img src="${char.images[0]}" alt="${char.name}">
                <div class="card-info">
                    <h3>${char.name}</h3>
                    <p>${char.title}</p>
                </div>
            `;
            container.appendChild(card);
        }
    });

    // Update Filter Buttons
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
        if(btn.textContent.toLowerCase().includes(filter) || (filter==='all' && btn.textContent==='All')) {
            btn.classList.add('active');
        }
    });
}

// 3. Open Character Modal
function openCharacterModal(charId) {
    const char = characters.find(c => c.id === charId);
    if(!char) return;

    document.getElementById('modal-name').innerText = char.name;
    document.getElementById('modal-title').innerText = char.title;
    document.getElementById('modal-role').innerText = char.role;
    document.getElementById('modal-origin').innerText = char.origin;
    document.getElementById('modal-bio').innerText = char.bio;

    // Populate Sub-Gallery
    const grid = document.getElementById('modal-gallery-grid');
    grid.innerHTML = '';
    
    char.images.forEach((imgSrc, index) => {
        const img = document.createElement('img');
        img.src = imgSrc;
        img.className = 'sub-img';
        img.onclick = () => openLightbox(imgSrc, char.name);
        grid.appendChild(img);
    });

    document.getElementById('char-modal').classList.remove('hidden');
}

// 4. Lightbox Logic
function openLightbox(src, caption) {
    const lb = document.getElementById('lightbox');
    const lbImg = document.getElementById('lightbox-img');
    lbImg.src = src;
    lb.classList.remove('hidden');
}

function closeModal(id) {
    document.getElementById(id).classList.add('hidden');
}

// 5. Reader Logic
function loadChapterList() {
    const list = document.getElementById('chapter-list-display');
    list.innerHTML = '';
    Object.keys(chapters).forEach(num => {
        const btn = document.createElement('button');
        btn.className = 'chapter-btn';
        btn.innerText = chapters[num].title;
        btn.onclick = () => loadChapter(num);
        list.appendChild(btn);
    });
}

function loadChapter(num) {
    document.getElementById('chapter-list-display').classList.add('hidden');
    document.getElementById('chapter-viewer').classList.remove('hidden');
    document.getElementById('chapter-title').innerText = chapters[num].title;
    document.getElementById('chapter-content').innerHTML = chapters[num].content;
}

function closeChapter() {
    document.getElementById('chapter-viewer').classList.add('hidden');
    document.getElementById('chapter-list-display').classList.remove('hidden');
}

// Initialize
window.onload = () => {
    renderGallery('all');
    loadChapterList();
};
