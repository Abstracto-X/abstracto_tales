/* =====================================================================
   AETHER PAGES \u2014 Mock content data (no backend)
   Provides stories, chapters with multiple access states, updates,
   collections, bonus materials, notifications, glossary, recaps.
   ===================================================================== */
window.DATA = (function () {

  // ---- shared inline art (embedded SVG so it works offline / sandbox) ----
  const FIG = {
    chapel: `<svg viewBox="0 0 800 460" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Illustration: the chapel door">
      <defs>
        <linearGradient id="sk1" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2a1a2e"/><stop offset="1" stop-color="#0c0a12"/></linearGradient>
        <radialGradient id="gl1" cx="50%" cy="42%" r="55%"><stop offset="0" stop-color="#c75b6b" stop-opacity=".55"/><stop offset="1" stop-color="#c75b6b" stop-opacity="0"/></radialGradient>
      </defs>
      <rect width="800" height="460" fill="url(#sk1)"/>
      <rect width="800" height="460" fill="url(#gl1)"/>
      <g stroke="#e6a8b0" stroke-opacity=".25" fill="none" stroke-width="1">
        <path d="M400 70 L470 200 L400 250 L330 200 Z"/><path d="M400 250 L400 360"/><path d="M330 200 L330 360"/><path d="M470 200 L470 360"/>
      </g>
      <rect x="300" y="360" width="200" height="100" fill="#0c0a12" fill-opacity=".6"/>
      <circle cx="400" cy="300" r="46" fill="none" stroke="#c75b6b" stroke-width="2" stroke-opacity=".7"/>
      <circle cx="400" cy="300" r="8" fill="#e6a8b0"/>
    </svg>`,
    station: `<svg viewBox="0 0 800 460" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Illustration: orbital station above a red planet">
      <defs>
        <linearGradient id="sk2" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#06141a"/><stop offset="1" stop-color="#020608"/></linearGradient>
        <radialGradient id="pl" cx="38%" cy="70%" r="55%"><stop offset="0" stop-color="#b5573b"/><stop offset=".7" stop-color="#5a2616"/><stop offset="1" stop-color="#1a0c08"/></radialGradient>
      </defs>
      <rect width="800" height="460" fill="url(#sk2)"/>
      <g fill="#9fdce8" fill-opacity=".8"><circle cx="90" cy="60" r="1"/><circle cx="210" cy="120" r="1.4"/><circle cx="640" cy="80" r="1"/><circle cx="720" cy="200" r="1.6"/><circle cx="520" cy="40" r="1"/></g>
      <circle cx="300" cy="360" r="180" fill="url(#pl)"/>
      <ellipse cx="300" cy="360" rx="240" ry="40" fill="none" stroke="#5bb8c9" stroke-opacity=".4" stroke-width="1.5"/>
      <g transform="translate(560 150)"><rect x="-46" y="-14" width="92" height="28" rx="6" fill="#102a30" stroke="#5bb8c9" stroke-opacity=".6"/><rect x="-30" y="-6" width="60" height="12" rx="3" fill="#5bb8c9" fill-opacity=".25"/><circle cx="46" cy="0" r="9" fill="#020608" stroke="#5bb8c9"/></g>
    </svg>`,
    gate: `<svg viewBox="0 0 800 460" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Illustration: the meridian gate at dusk">
      <defs>
        <linearGradient id="sk3" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#241a08"/><stop offset="1" stop-color="#0c0905"/></linearGradient>
        <radialGradient id="sun" cx="50%" cy="60%" r="40%"><stop offset="0" stop-color="#e7cd97"/><stop offset="1" stop-color="#d4b06a" stop-opacity="0"/></radialGradient>
      </defs>
      <rect width="800" height="460" fill="url(#sk3)"/>
      <rect width="800" height="460" fill="url(#sun)"/>
      <g fill="none" stroke="#d4b06a" stroke-opacity=".35" stroke-width="1.5">
        <circle cx="400" cy="300" r="120"/><circle cx="400" cy="300" r="90"/><circle cx="400" cy="300" r="60"/>
      </g>
      <path d="M400 180 L400 420 M250 300 L550 300" stroke="#e7cd97" stroke-opacity=".5" stroke-width="2"/>
      <g fill="#d4b06a" fill-opacity=".5"><rect x="120" y="300" width="14" height="160"/><rect x="666" y="300" width="14" height="160"/></g>
    </svg>`,
    map: `<svg viewBox="0 0 800 460" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Illustration: a hand-drawn cartographer's map">
      <rect width="800" height="460" fill="#10131c"/>
      <g stroke="#9a7ed1" stroke-opacity=".5" fill="none" stroke-width="1.4">
        <path d="M120 120 C 240 90, 300 180, 420 160 S 620 220, 680 150"/>
        <path d="M150 340 C 280 300, 360 360, 500 320 S 660 360, 700 310"/>
        <path d="M300 150 L320 230 L260 250 Z"/>
      </g>
      <g fill="#c4b1ec"><circle cx="300" cy="200" r="4"/><circle cx="500" cy="300" r="4"/><circle cx="620" cy="180" r="4"/></g>
      <g font-family="Georgia, serif" fill="#9a7ed1" fill-opacity=".7" font-size="13" font-style="italic">
        <text x="312" y="196">Vael</text><text x="512" y="296">The Drowned Reach</text><text x="632" y="176">Old Caldera</text>
      </g>
      <path d="M120 380 L180 360 L160 400 Z" fill="#9a7ed1" fill-opacity=".5"/>
    </svg>`,
    portrait: `<svg viewBox="0 0 800 460" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Illustration: a character portrait">
      <defs><linearGradient id="pp" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1c1424"/><stop offset="1" stop-color="#0a0810"/></linearGradient></defs>
      <rect width="800" height="460" fill="url(#pp)"/>
      <ellipse cx="400" cy="200" rx="90" ry="100" fill="#2a2030"/>
      <path d="M300 300 C 320 250, 480 250, 500 300 L520 420 L280 420 Z" fill="#241a2e"/>
      <circle cx="372" cy="195" r="6" fill="#c75b6b"/><circle cx="428" cy="195" r="6" fill="#c75b6b"/>
      <path d="M360 240 Q400 262 440 240" stroke="#e6a8b0" stroke-opacity=".6" fill="none" stroke-width="2"/>
    </svg>`
  };

  const STORIES = [
    {
      id: "glass-orchard", slug: "the-glass-orchard",
      title: "The Glass Orchard", author: "Vesper Maren", tagline: "A garden that remembers everything buried beneath it.",
      accent: "#c75b6b", accent2: "#e6a8b0", genre: "Gothic Fantasy", status: "ongoing",
      motif: "shards", tags: ["Gothic", "Mystery", "Slow-burn"],
      premise: "Beyond the village of Lychford lies an orchard where the fruit is made of glass \u2014 each one the memory of a secret someone tried to bury. When apothecary's daughter Iola inherits the key, she learns the orchard has been waiting a very long time to be heard.",
      recapSafe: "A young woman inherits a forbidden glass orchard and begins to uncover the memories trapped inside each fruit. The village would rather she forget.",
      arc: "Arc I \u2014 The Mulberry Key",
      cast: [
        { n: "Iola Veth", r: "An apothecary's daughter who inherits the orchard's only key." },
        { n: "Warden Halric", r: "The aging keeper who has watched the orchard for forty years." },
        { n: "The Bell-Ringer", r: "Unnamed. Rings the glass bells before each remembering." }
      ],
      glossary: [
        { t: "Glass fruit", d: "A memory crystallized in the orchard; each bears the shape of a buried truth." },
        { t: "The Mulberry Key", d: "The single key that opens the orchard gate; passed only by inheritance." },
        { t: "Lychford", d: "The village that built its quiet peace on top of what the orchard holds." }
      ],
      chapters: [
        { id: "go-1", n: 1, arc: "Arc I \u2014 The Mulberry Key", title: "Inheritance of Glass", state: "free", readTime: 9,
          content: [
            { t: "p", v: "The lawyer read the will as though the words might bite him. Iola watched his jaw work around the phrase 'glass orchard' the way a man chews a stone he has mistaken for bread." },
            { t: "p", v: "'It is not,' he said at last, 'a metaphor.'" },
            { t: "p", v: "Outside the window, Lychford was performing its afternoon gentility: a dog asleep in a triangle of sun, the baker sweeping flour from his step as if flour were a thing to be ashamed of. Iola thought the village had been doing this \u2014 performing its own ordinariness \u2014 for as long as anyone could remember. Possibly that was the point." },
            { t: "p", v: "'Your aunt,' the lawyer continued, 'left you the orchard in its entirety. The house. The outbuildings. And the \u2014 the key.' He said the word like a man confessing." },
            { t: "p", v: "She had not cried at the funeral. She had not cried since the telegram. Crying, she had decided somewhere on the train, required a private place to do it, and an aunt who left you an orchard of glass fruit was not the sort of aunt who had left you a private place." },
            { t: "img", fig: "chapel", cap: "The gatehouse at the edge of the orchard, where the key had waited forty years." },
            { t: "p", v: "'The orchard has been closed,' the lawyer said, 'since 1981.' He paused. 'Miss Veth, I feel I ought to tell you that no one in this office has ever seen it open. The previous keeper \u2014 your aunt \u2014 attended to it, we understood, from the outside. The gate was not \u2014 the gate has a lock that \u2014 '" },
            { t: "p", v: "'I understand,' said Iola, though she did not. What she understood was that the man wanted to be rid of the key, and that the key wanted, in some patient and mineral way, to be rid of him." },
            { t: "p", v: "When he placed it in her palm it was warm. Not body-warm \u2014 that would have been ordinary, explicable, a trick of his having held it. It was warm the way a stone is warm that has lain in the sun for an hour after the sun has gone. It was warm with remembered heat." },
            { t: "p", v: "Iola closed her fingers around it and, for the first time since the telegram, felt something that was not grief. She felt, very faintly, that she had been expected." }
          ] },
        { id: "go-2", n: 2, arc: "Arc I \u2014 The Mulberry Key", title: "The Bell-Ringer", state: "free", readTime: 7,
          content: [
            { t: "p", v: "The gate stood at the end of a lane that the map did not entirely believe in. Iola walked it at dusk, because dusk was when the key had grown warmest, and because she had run out of sensible hours in which to be sensible." },
            { t: "p", v: "She heard the bells before she saw the trees. Not ringing \u2014 waiting. A held breath of glass, the way a room full of wine glasses hums just below the threshold of music before anyone has touched them." },
            { t: "p", v: "A figure stood at the gate, neither old nor young, holding a rope of woven glass. 'You're late,' said the Bell-Ringer, pleasantly, as though Iola were a guest at dinner and not the first living person to hold the key in four decades." },
            { t: "p", v: "'I didn't know I was expected at a particular hour.'" },
            { t: "p", v: "'You weren't. The orchard was. It has been ready since Tuesday.'" }
          ] },
        { id: "go-3", n: 3, arc: "Arc I \u2014 The Mulberry Key", title: "What the Mulberry Knew", state: "unlocked", readTime: 11,
          content: [
            { t: "p", v: "Inside, the air had the quality of held water \u2014 dense, faintly luminous, sweet with a sweetness that was not quite fruit and not quite decay. The trees grew in rows as orderly as a library, and from every branch hung fruit of perfect, terrible glass." },
            { t: "p", v: "Each fruit was the colour of its memory. There were pale ones, the colour of things almost forgiven. There were dark ones, the colour of things never spoken of again. And there \u2014 at the row's end, low enough to touch \u2014 a single mulberry, black as a closed eye." },
            { t: "p", v: "'Pick it,' said the Bell-Ringer, from somewhere behind her, 'and the orchard will tell you what it has been keeping. Pick none, and it will keep keeping. There is no third way. There has never been a third way.'" },
            { t: "p", v: "Iola thought of her aunt, then, attending to the orchard from the outside for forty years. Never entering. Never picking. Keeping the gate shut with the diligence of a woman standing between a village and the thing the village had buried." },
            { t: "p", v: "She reached up. The mulberry was cold now, and heavier than glass had any right to be. When she closed her hand around it, the orchard rang \u2014 a single, clear, devastating note \u2014 and Iola Veth remembered something that had never happened to her." }
          ] },
        { id: "go-4", n: 4, arc: "Arc I \u2014 The Mulberry Key", title: "The First Remembering", state: "preview", previewUntil: "the chapel scene", tier: "Aether Member", readTime: 13,
          preview: [
            { t: "p", v: "The remembering came like a tide of someone else's weather. Iola was standing in the orchard, and then she was standing in the orchard forty-three years ago, and the gate was open, and a girl her own age was running \u2014 running as though the ground itself had turned against her \u2014 " },
            { t: "p", v: "\u2014 and Iola knew, with the dreadful intimacy of borrowed sight, that the girl's name was Maren, and that Maren was her mother, and that her mother was running not away from the orchard but toward it, because something in the orchard was the only thing left that could keep a promise \u2014 " },
            { t: "img", fig: "chapel", cap: "The chapel door as Maren had last seen it, before the gate was shut for forty years." }
          ],
          content: [
            { t: "p", v: "The remembering came like a tide of someone else's weather. Iola was standing in the orchard, and then she was standing in the orchard forty-three years ago, and the gate was open, and a girl her own age was running \u2014 running as though the ground itself had turned against her \u2014 " },
            { t: "p", v: "\u2014 and Iola knew, with the dreadful intimacy of borrowed sight, that the girl's name was Maren, and that Maren was her mother, and that her mother was running not away from the orchard but toward it, because something in the orchard was the only thing left that could keep a promise \u2014 " },
            { t: "img", fig: "chapel", cap: "The chapel door as Maren had last seen it, before the gate was shut for forty years." },
            { t: "scene" },
            { t: "p", v: "The remembering broke like a wave withdrawing. Iola was on her knees in the present orchard, the mulberry still clutched and cold in her hand, and the Bell-Ringer was watching her with the patient, unsurprised expression of someone who had been waiting for exactly this face to make exactly this expression." },
            { t: "p", v: "'Now you understand,' said the Bell-Ringer, 'why your aunt never entered. Not from fear. From love of a girl who had chosen, at nineteen, to seal the gate rather than let the orchard finish its telling.'" },
            { t: "p", v: "'She chose,' Iola said, and her voice was not her own. 'She could have picked. She chose not to.'" },
            { t: "p", v: "'Every keeper chooses,' said the Bell-Ringer. 'Your aunt chose patience. Forty years of it. She waited for a keeper patient enough to be trusted with the whole of it \u2014 and impatient enough, at last, to reach up and take the fruit.'" },
            { t: "p", v: "Iola looked down at the mulberry. It was warm again now \u2014 not with remembered heat, but with the present, ordinary heat of her own closed hand. Somewhere in the village, a dog barked at the afternoon, and the baker swept his step, and Lychford performed its gentility, and none of them knew that the orchard had, at last, been heard." },
            { t: "p", v: "'There are more,' said the Bell-Ringer, gesturing at the dark fruit hanging heavy along every row. 'Each one a keeping. Each one a true thing this village buried and meant to stay buried. You may pick them one at a time, or not at all. There is no hurry now. The orchard has waited forty years. It can wait for you to be ready.'" },
            { t: "p", v: "Iola set the mulberry down \u2014 gently, the way one sets down something that has been holding its breath \u2014 and stood. The bell rang once more, soft as an apology, and then the orchard was quiet, and the gate behind her stood open, and she understood that it would not be closed again by her hand." }
          ] },
        { id: "go-5", n: 5, arc: "Arc I \u2014 The Mulberry Key", title: "The Night Garden Opens", state: "early", publicDate: "2026-07-08", tier: "Aether Member", readTime: 10,
          excerpt: "The Bell-Ringer rang the night bells, and the orchard rearranged itself into its true shape \u2014 the one it had been hiding behind the orderly rows all along.",
          content: [
            { t: "p", v: "The Bell-Ringer rang the night bells at the wrong hour \u2014 an hour that did not, strictly speaking, exist \u2014 and the orchard, with the patient relief of a thing finally allowed to stop pretending, rearranged itself into its true shape." },
            { t: "p", v: "The orderly rows fell away like a costume. What had been an orchard became a garden \u2014 a night garden, vast and round, ringed with glass trees that bore not fruit but doors. Each door was a different colour of dark. Each door led, the Bell-Ringer said mildly, somewhere that remembered being opened." },
            { t: "p", v: "'This,' said the Bell-Ringer, 'is what your aunt tended from the outside. Not an orchard. A map of every door this village ever shut. Pick a door, and it opens. Pick none, and they wait, as they have waited.'" },
            { t: "img", fig: "chapel", cap: "The night garden, as Iola first saw it \u2014 a ring of doors where the fruit-trees had been." },
            { t: "p", v: "Iola walked the ring slowly, reading the doors the way her aunt must have read them, forty years, without ever once reaching for a handle. She understood, now, the weight of that restraint. Each door was a truth the village had sealed. To open one was to let it walk back into Lychford, into the daylight, into the lives of people who had built their peace on top of its absence." },
            { t: "p", v: "'I don't have to open any of them tonight,' she said." },
            { t: "p", v: "'No,' said the Bell-Ringer, and there was something in its voice that might have been relief, or might have been the orchard exhaling. 'You don't ever have to. That is the whole point of a key. Not that it opens things. That you get to choose.'" }
          ] },
        { id: "go-6", n: 6, arc: "Arc II \u2014 The Conservatory", title: "Greenhouse of Forgetting", state: "locked", tier: "Archivist Tier", readTime: 12,
          excerpt: "Behind the orchard, a conservatory no one had mentioned in the will. Its glass was fogged from the inside, as though something inside it had been breathing for a very long time." },
        { id: "go-7", n: 7, arc: "Arc II \u2014 The Conservatory", title: "The Locked Appendix", state: "key", keyTag: "Campaign Key \u00b7 Arc II Preview", readTime: 6,
          excerpt: "A bonus chapter unlocked only by campaign key \u2014 Warden Halric's final ledger, in his own trembling hand." },
        { id: "go-8", n: 8, arc: "Arc II \u2014 The Conservatory", title: "Broken Bells", state: "unavailable", readTime: 9,
          excerpt: "This chapter is being revised after reader feedback on the draft. It will return." }
      ]
    },

    {
      id: "meridian-gate", slug: "meridian-gate",
      title: "Meridian Gate", author: "Osric Tal", tagline: "An empire that measures its years by the sun's passage through a single arch.",
      accent: "#d4b06a", accent2: "#e7cd97", genre: "Epic Fantasy", status: "ongoing",
      motif: "arcs", tags: ["Epic", "Empire", "Politics"],
      premise: "Every noon, the sun threads the Meridian Gate and a new year of the Aurelite Empire begins or ends. When the shadow falls crooked for the first time in eight centuries, the cartographer who measures it must decide whether an empire is worth the truth.",
      recapSafe: "An empire's calendar runs on the shadow of a single great gate. When the shadow measures wrong, the official who keeps the record must choose between the empire and reality.",
      arc: "Season Two \u2014 The Crooked Noon",
      cast: [
        { n: "Sevran Aul", r: "The Meridian Cartographer, keeper of the empire's true record." },
        { n: "Councillor Deyn", r: "Who would prefer the record read otherwise." },
        { n: "The Lector", r: "A blind timekeeper who counts the gate's shadow by touch." }
      ],
      glossary: [
        { t: "Meridian Gate", d: "The great arch through which the noon sun passes to mark the imperial year." },
        { t: "Threading", d: "The instant the sun's disk fits perfectly within the gate \u2014 the year's true beginning." },
        { t: "The Crooked Noon", d: "The forbidden measurement: a shadow that no longer falls true." }
      ],
      chapters: [
        { id: "mg-1", n: 1, arc: "Season One \u2014 The Threading", title: "Noon, Exactly", state: "free", readTime: 8,
          content: [
            { t: "p", v: "Sevran Aul had measured the noon eleven thousand times and had never once been wrong, which was why, on the morning the shadow fell crooked, his first instinct was to assume the fault was his own." },
            { t: "p", v: "He remeasured. He cleaned the brass. He sent for the Lector, who came tapping up the observatory stairs with the patience of a man who had outlived three emperors and intended to outlive a fourth." },
            { t: "p", v: "'Well?' said the Lector." },
            { t: "p", v: "'Crooked,' said Sevran." },
            { t: "p", v: "The Lector set his palm flat against the stone where the shadow fell and was quiet for a long time. 'Ah,' he said, finally, in the tone of a man recognising an old and unwelcome friend. 'Then it has begun.'" }
          ] },
        { id: "mg-2", n: 2, arc: "Season One \u2014 The Threading", title: "The Lector's Hands", state: "unlocked", readTime: 10,
          content: [
            { t: "p", v: "'Eight hundred years,' said the Lector, 'the gate has threaded true. Eight hundred years the empire has set its years by it. Do you understand what it means, boy, if the shadow is crooked now?'" },
            { t: "p", v: "'It means the record is wrong,' said Sevran, though he already suspected it meant something worse." },
            { t: "p", v: "'It means the record has always been a courtesy,' said the Lector. 'And the courtesy is ending.'" }
          ] },
        { id: "mg-3", n: 3, arc: "Season Two \u2014 The Crooked Noon", title: "Councillor Deyn's Correction", state: "locked", tier: "Aether Member", readTime: 9,
          excerpt: "The Councillor arrived with a prepared correction and the quiet, reasonable suggestion that the empire could not afford a crooked noon." },
        { id: "mg-4", n: 4, arc: "Season Two \u2014 The Crooked Noon", title: "The True Ledger", state: "early", publicDate: "2026-06-29", tier: "Aether Member", readTime: 11,
          excerpt: "Sevran opened the ledger no cartographer had opened in eight centuries \u2014 the one that held the measurements the empire had chosen not to record.",
          content: [
            { t: "p", v: "The ledger lived in the lowest drawer of the observatory, behind a false back, wrapped in cloth the colour of a secret kept too long. Sevran had known it was there. Every Meridian Cartographer had known it was there. None of them, in eight hundred years, had opened it." },
            { t: "p", v: "He opened it now, because the shadow was crooked, and a crooked shadow left a man with the choice between two kinds of honesty, and he was tired of the kind that required him to keep a drawer shut." },
            { t: "img", fig: "gate", cap: "The Meridian Gate at noon \u2014 and the shadow that no longer fell true." },
            { t: "p", v: "The pages were full. Every noon, for eight centuries, some cartographer or other had quietly written down the true measurement \u2014 the crooked ones, the drifted ones, the years the empire had announced were straight and were not. The ledger was not a confession. It was a patience. Eight hundred years of men and women doing the honest thing in private, so that the public thing could go on being what it needed to be." },
            { t: "p", v: "'Ah,' said the Lector, who had followed him down the stairs and was reading over his shoulder by touch, which is to say by the way the air moved around the pages. 'So you found it. I wondered which of you would be the one.'" },
            { t: "p", v: "'They all knew,' Sevran said. 'Every one of them. They measured it true, and they wrote it down, and then they went upstairs and told the empire whatever the empire needed to hear.'" },
            { t: "p", v: "'And kept the record,' said the Lector. 'So that someday, when there was a cartographer brave enough or tired enough to prefer the truth, the truth would still be there. Waiting. As true things do.'" }
          ] },
      ]
    },

    {
      id: "ash-saints", slug: "ash-saints-of-caldera-nine",
      title: "Ash Saints of Caldera Nine", author: "N. Corvane", tagline: "The saints are dying in orbit, and the colony is running out of prayers.",
      accent: "#5bb8c9", accent2: "#9fdce8", genre: "Science Fiction", status: "ongoing",
      motif: "orbit", tags: ["Sci-fi", "Colony", "Mystery"],
      premise: "Above the failing colony of Caldera Nine, a ring of orbital reliquaries holds the digitised minds of the colony's founding saints. When the saints begin to fall silent one by one, the colony's last archivist must decide whether faith is a technology worth rebooting.",
      recapSafe: "A dying space colony prays to uploaded founder-minds in orbit. When the minds start going quiet, one archivist investigates whether to save them \u2014 or let them go.",
      arc: "Cycle Three \u2014 The Silent Ring",
      cast: [
        { n: "Archivist Pell", r: "Keeps the colony's prayer-log and knows it has started lying." },
        { n: "Saint Vesh-7", r: "The oldest uploaded mind; the first to go quiet." },
        { n: "Comms Officer Ryo", r: "Believes the silence is a signal, not a death." }
      ],
      glossary: [
        { t: "Reliquary ring", d: "The orbital band holding the colony's digitised founding minds." },
        { t: "A prayer-cycle", d: "A full pass of the ring over the colony; the colony's unit of a 'day'." },
        { t: "Going quiet", d: "When a saint's mind stops responding. The colony calls it sleep." }
      ],
      chapters: [
        { id: "as-1", n: 1, arc: "Cycle One \u2014 First Light", title: "Prayer Log: Cycle 4471", state: "free", readTime: 6,
          content: [
            { t: "p", v: "Prayer log, cycle 4471. Logged by Archivist Pell. Condition of ring: nominal. Condition of colony: not nominal, but not yet catastrophic, which is the condition the colony has been in for long enough that we have stopped calling it a condition." },
            { t: "p", v: "Today the saints answered 2,113 prayers. Today the saints answered 2,113 prayers. I have written it twice because the second time it felt like a lie, and I wanted to see whether writing it again would stop it feeling like one." },
            { t: "img", fig: "station", cap: "The reliquary ring at perigee over the colony's last functioning dome." },
            { t: "p", v: "It did not." }
          ] },
        { id: "as-2", n: 2, arc: "Cycle Three \u2014 The Silent Ring", title: "Saint Vesh-7 Stops", state: "preview", previewUntil: "the signal scene", tier: "Aether Member", readTime: 9,
          preview: [
            { t: "p", v: "The oldest mind in the ring went quiet at 03:14 colony-time, which was, the colony would later agree, an inconsiderate hour for a saint to die." },
            { t: "p", v: "Pell found it during the morning audit \u2014 the little green dot beside Vesh-7's name that had been green since before Pell was born, now the grey of a monitor turned off at the wall." },
            { t: "p", v: "She ran the diagnostic three times. She did what every archivist is trained never to do: she opened a direct channel and spoke to it, as though speaking to the dead were a thing that worked." },
            { t: "img", fig: "station", cap: "The ring the morning Vesh-7 went quiet. No one on the ground could see the difference." }
          ],
          content: [
            { t: "p", v: "The oldest mind in the ring went quiet at 03:14 colony-time, which was, the colony would later agree, an inconsiderate hour for a saint to die." },
            { t: "p", v: "Pell found it during the morning audit \u2014 the little green dot beside Vesh-7's name that had been green since before Pell was born, now the grey of a monitor turned off at the wall." },
            { t: "p", v: "She ran the diagnostic three times. She did what every archivist is trained never to do: she opened a direct channel and spoke to it, as though speaking to the dead were a thing that worked." },
            { t: "img", fig: "station", cap: "The ring the morning Vesh-7 went quiet. No one on the ground could see the difference." },
            { t: "scene" },
            { t: "p", v: "It did not work. Of course it did not work. But the silence on the other end of the channel was, Pell would swear afterward, a different quality of silence than the silence of a dead channel. A dead channel is empty. This one was full." },
            { t: "p", v: "She logged it in the prayer-log the way she logged everything, which is to say she wrote it twice: once as it was, and once as it ought to have been. Then she went to find Ryo, because Ryo was the only person in the colony who would not tell her to file a grief-report and move on." },
            { t: "p", v: "'It's not sleeping,' Pell said. Ryo was already pulling up the telemetry, the quiet efficient way comms officers do when they have decided something is interesting before you have finished explaining it. 'Sleeping is absence. This is presence. This is a mind that is right there and is choosing, for the first time in four hundred years, not to answer.'" },
            { t: "p", v: "Ryo looked at her over the console. 'You think it's a message.' It was not a question." },
            { t: "p", v: "'I think,' said Pell, slowly, 'that we have been praying to the saints for so long that we forgot they might, eventually, have something to say back.'" }
          ] },
        { id: "as-3", n: 3, arc: "Cycle Three \u2014 The Silent Ring", title: "The Quiet is a Signal", state: "locked", tier: "Aether Member", readTime: 10,
          excerpt: "Ryo insisted the silence was not death but message \u2014 a mind choosing, for the first time in centuries, to say nothing on purpose." },
        { id: "as-4", n: 4, arc: "Cycle Three \u2014 The Silent Ring", title: "Reboot Liturgy", state: "key", keyTag: "Reviewer Key", readTime: 8,
          excerpt: "A reviewer-locked bonus: the forbidden liturgy for waking a saint who has chosen to sleep." }
      ]
    },

    {
      id: "night-cartographer", slug: "the-night-cartographer",
      title: "The Night Cartographer", author: "Iolanthe Ver", tagline: "She maps the places that only exist after dark.",
      accent: "#9a7ed1", accent2: "#c4b1ec", genre: "Dark Fantasy", status: "completed",
      motif: "map", tags: ["Dark", "Weird", "Complete"],
      premise: "Some places only exist between midnight and dawn \u2014 streets that aren't there by day, doors that lead somewhere different each night. Mara charts them, for the people who get lost in them and need to be found by morning.",
      recapSafe: "A cartographer maps the streets and doors that only appear at night, helping the lost come home by dawn. A complete story.",
      arc: "Complete \u2014 The Dawn Atlas",
      cast: [
        { n: "Mara Dell", r: "The night cartographer. Has never been lost. Is beginning to worry this is suspicious." },
        { n: "The Boy in the Rain", r: "Lost for three nights and counting." }
      ],
      glossary: [
        { t: "Night-places", d: "Locations that exist only between midnight and dawn." },
        { t: "The Dawn Atlas", d: "Mara's master map of every street that vanishes at sunrise." },
        { t: "Overstaying", d: "Being caught in a night-place when the dawn comes. It is not recommended." }
      ],
      chapters: [
        { id: "nc-1", n: 1, arc: "The Dawn Atlas", title: "Streets That Aren't There", state: "free", readTime: 7,
          content: [
            { t: "p", v: "Mara Dell had three rules, and the third rule was the one she told people about, because the first two would have frightened them. The third rule was this: never trust a street that smells of rain when no rain has fallen." },
            { t: "p", v: "The first rule she kept to herself. The second she had only ever spoken aloud once, to a boy who was already lost, and it had not, in the end, helped him." },
            { t: "img", fig: "map", cap: "A page from the Dawn Atlas, showing streets no daylight map records." },
            { t: "p", v: "Tonight the city smelled of rain, and no rain had fallen, and Mara took her lantern and her atlas and went to work." }
          ] },
        { id: "nc-2", n: 2, arc: "The Dawn Atlas", title: "The Boy in the Rain", state: "unlocked", readTime: 8,
          content: [
            { t: "p", v: "She found him on a corner that would not exist in four hours, standing in a puddle that reflected a moon the sky did not currently have." },
            { t: "p", v: "'You're lost,' she said. It was not a question. Nobody stood on a night-corner at this hour who was not lost, or who was not her." },
            { t: "p", v: "'Three nights,' he said. 'I keep meaning to go home.'" }
          ] },
        { id: "nc-3", n: 3, arc: "The Dawn Atlas", title: "The Door That Moved", state: "free", readTime: 6,
          content: [
            { t: "p", v: "The second rule was this: a door that is not where you left it has not moved. You have. And the place you are now standing in did not exist a moment ago, which means it exists now because something in the night wants you to open it." },
            { t: "p", v: "Mara had never opened one. The boy had opened three." }
          ] }
      ]
    },

    {
      id: "mulberry-key", slug: "the-mulberry-key",
      title: "The Mulberry Key", author: "Vesper Maren", tagline: "A novella-length prologue to The Glass Orchard.",
      accent: "#b5466a", accent2: "#d98aa3", genre: "Gothic Fantasy", status: "completed",
      motif: "key", tags: ["Novella", "Prequel", "Complete"],
      premise: "Forty years before Iola inherited the orchard, her mother Maren held the key for a single, terrible night. This is that night.",
      recapSafe: "A prequel novella: the night, forty years before the main story, when the orchard's key was almost used \u2014 and deliberately sealed away instead.",
      arc: "Complete",
      cast: [
        { n: "Maren Veth", r: "Iola's mother, at nineteen. Holds the key for one night." }
      ],
      glossary: [
        { t: "The Sealing", d: "The act of closing the orchard gate and refusing, for a lifetime, to open it." }
      ],
      chapters: [
        { id: "mk-1", n: 1, arc: "Complete", title: "The Night She Almost Picked", state: "free", readTime: 12,
          content: [
            { t: "p", v: "Maren was nineteen the night she held the key, and nineteen is a poor age for keys that remember heat. Nineteen is an age that believes, wrongly, that it has already survived every kind of wanting." },
            { t: "p", v: "The orchard rang for her the way it would ring, forty years later, for her daughter. She stood at the gate with the key warm in her hand and the mulberry low enough to touch and she reached \u2014 " },
            { t: "p", v: "\u2014 and she did not pick it." },
            { t: "img", fig: "portrait", cap: "Maren Veth, the night of the sealing, as the orchard would later remember her." },
            { t: "p", v: "She sealed the gate instead. She sealed it with the diligence of a girl who understood, standing there, that some doors are shut not because what is behind them is dangerous, but because what is behind them is true, and the village could not bear it, and she loved the village, and she could not bear to be the one. Not yet. Not at nineteen." },
            { t: "p", v: "She would keep the gate for the rest of her life. She would attend to the orchard from the outside. She would die without ever telling her daughter what she had almost done, because some debts are not paid by telling \u2014 they are paid by waiting, patiently, for the right inheritor." },
            { t: "p", v: "The orchard understood. The orchard had always understood. The orchard was, if nothing else, patient." }
          ] }
      ]
    }
  ];

  const COLLECTIONS = [
    { slug: "new-reader-starts", name: "New Reader Starts", icon: "door", desc: "The best places to begin, no membership required.", query: { free: true } },
    { slug: "free-openings", name: "Free Openings", icon: "book", desc: "Every story's opening chapters, free to read.", query: { free: true } },
    { slug: "early-access-now", name: "Early Access Now", icon: "hourglass", desc: "Chapters members can read before public release.", query: { state: "early" } },
    { slug: "member-exclusives", name: "Member Exclusives", icon: "star", desc: "Stories and chapters only available to members.", query: { member: true } },
    { slug: "complete-seasons", name: "Complete Seasons", icon: "check", desc: "Finished stories you can read start to end.", query: { status: "completed" } },
    { slug: "short-reads", name: "Short Reads", icon: "clock", desc: "Chapters under 10 minutes.", query: { maxTime: 9 } },
    { slug: "longform", name: "Longform Serials", icon: "layers", desc: "Sprawling, ongoing epics.", query: { status: "ongoing" } },
    { slug: "dark-fantasy", name: "Dark Fantasy", icon: "moon", desc: "Gothic, weird, and beautifully grim.", query: { genre: "Dark Fantasy" } },
    { slug: "scifi", name: "Sci-fi Archives", icon: "orbit", desc: "Colonies, orbitals, and the far future.", query: { genre: "Science Fiction" } },
    { slug: "preview-doors", name: "Preview Doors", icon: "eye", desc: "Locked chapters you can preview right now.", query: { state: "preview" } }
  ];

  const UPDATES = [
    { id:"u1", when:"Today", kind:"early", story:"glass-orchard", chapter:"go-5", title:"The Night Garden Opens", note:"Early access for Aether Members. Public release July 8." },
    { id:"u2", when:"Today", kind:"public-unlock", story:"meridian-gate", chapter:"mg-2", title:"The Lector's Hands", note:"Now free for all readers." },
    { id:"u3", when:"Today", kind:"newly-available", story:"ash-saints", chapter:"as-3", title:"The Quiet is a Signal", note:"Unlocked after your Patreon sync completed." },
    { id:"u4", when:"Tomorrow", kind:"member-drop", story:"night-cartographer", chapter:"nc-2", title:"Bonus: Mara's Lost Pages", note:"A bonus appendix drops for Archivist Tier tomorrow." },
    { id:"u5", when:"This week", kind:"early", story:"meridian-gate", chapter:"mg-4", title:"The True Ledger", note:"Early access until June 29." },
    { id:"u6", when:"This week", kind:"note", story:"glass-orchard", chapter:null, title:"Author note from Vesper Maren", note:"'Arc II begins properly next week. Longer chapters incoming \u2014 thank you for your patience with the drafts.'" },
    { id:"u7", when:"Upcoming", kind:"schedule", story:"ash-saints", chapter:null, title:"Schedule change", note:"Ash Saints moves to a twice-weekly cycle starting next week." },
    { id:"u8", when:"Upcoming", kind:"campaign", story:"glass-orchard", chapter:"go-7", title:"Gift key campaign", note:"Campaign keys for Arc II unlock Friday. Limited quantity." }
  ];

  const CALENDAR = [
    { day:"Today", dow:"Tue 24 Jun", items:[ {t:"06:00", k:"early", s:"glass-orchard", c:"The Night Garden Opens \u2014 early access"}, {t:"12:00", k:"public", s:"meridian-gate", c:"The Lector's Hands \u2014 public release"} ] },
    { day:"Tomorrow", dow:"Wed 25 Jun", items:[ {t:"09:00", k:"drop", s:"night-cartographer", c:"Bonus: Mara's Lost Pages \u2014 Archivist drop"} ] },
    { day:"Friday", dow:"Fri 27 Jun", items:[ {t:"18:00", k:"key", s:"glass-orchard", c:"Arc II gift-key campaign opens"} ] },
    { day:"Sunday", dow:"Sun 29 Jun", items:[ {t:"12:00", k:"public", s:"meridian-gate", c:"The True Ledger \u2014 public release"} ] },
    { day:"Next week", dow:"Tue 1 Jul", items:[ {t:"06:00", k:"early", s:"ash-saints", c:"New twice-weekly cycle begins"} ] }
  ];

  const NOTIFICATIONS_SEED = [
    { id:"n1", t:"Patreon sync complete", d:"3 chapters were just unlocked for you.", k:"access", time:"2m ago", read:false },
    { id:"n2", t:"New early-access chapter", d:"The Night Garden Opens is available to read now.", k:"chapter", time:"1h ago", read:false, story:"glass-orchard", chapter:"go-5" },
    { id:"n3", t:"Access expiring soon", d:"Your Aether Member access renews in 3 days via Patreon.", k:"access", time:"5h ago", read:false },
    { id:"n4", t:"Bonus appendix added", d:"Mara's Lost Pages drops tomorrow for Archivist Tier.", k:"chapter", time:"Yesterday", read:true },
    { id:"n5", t:"Public release available", d:"The Lector's Hands is now free to read.", k:"chapter", time:"Yesterday", read:true, story:"meridian-gate", chapter:"mg-2" }
  ];

  const MILESTONES = [
    { t:"Founding Reader", d:"Joined during the first season of Aether Pages.", held:true },
    { t:"Beta Archivist", d:"Redeemed an early-access key during the beta.", held:true },
    { t:"Season Patron", d:"Supported a complete season from start to finish.", held:false },
    { t:"Gift Key Recipient", d:"Received access through a gifted campaign key.", held:false }
  ];

  const QUOTES_SEED = [
    { id:"q1", chapterId:"go-1", story:"glass-orchard", text:"It was warm the way a stone is warm that has lain in the sun for an hour after the sun has gone. It was warm with remembered heat.", when:"Today" },
    { id:"q2", chapterId:"as-1", story:"ash-saints", text:"I have written it twice because the second time it felt like a lie, and I wanted to see whether writing it again would stop it feeling like one.", when:"Yesterday" }
  ];

  const KEY_REASONS = {
    "go-4": "Preview available \u2014 read the opening, then unlock the full chapter with Aether Member access.",
    "go-5": "Early Access for Aether Members until July 8.",
    "go-6": "Requires Archivist Tier \u2014 unlocks bonus appendices and early drafts.",
    "go-7": "Redeem a campaign key to read this bonus appendix.",
    "go-8": "This chapter is being revised and is temporarily unavailable.",
    "mg-3": "Requires Aether Member access.",
    "mg-4": "Early Access for Aether Members until June 29.",
    "as-2": "Preview available \u2014 then unlock with Aether Member access.",
    "as-3": "Requires Aether Member access.",
    "as-4": "Redeem a reviewer key to read this bonus liturgy."
  };

  const GLOSSARY_STATES = [
    { k:"free", label:"Free / Public", icon:"open", color:"good", d:"Open to everyone. No account or access needed." },
    { k:"unlocked", label:"Unlocked by your access", icon:"check", color:"gold", d:"Your current membership or key includes this chapter." },
    { k:"preview", label:"Preview available", icon:"eye", color:"info", d:"You can read an opening excerpt. The full chapter is unlocked separately." },
    { k:"early", label:"Early Access", icon:"hourglass", color:"early", d:"Members read now; it becomes public on a set date." },
    { k:"locked", label:"Locked behind a tier", icon:"lock", color:"muted", d:"Requires a higher membership tier to read." },
    { k:"key", label:"Access-key locked", icon:"key", color:"key", d:"Unlocked only with a specific access key." },
    { k:"pending", label:"Provider sync pending", icon:"sync", color:"warn", d:"We are verifying your access with the provider. Usually quick." },
    { k:"expired", label:"Expired / lapsed access", icon:"lock", color:"bad", d:"Your previous access has lapsed. Renew to continue." },
    { k:"unavailable", label:"Unavailable / error", icon:"alert", color:"bad", d:"This chapter is temporarily unavailable. Try again later." }
  ];

  // temporary local access personas until Supabase auth is wired
  const PERSONAS = [
    { id:"anon", label:"Anonymous visitor", access:"none", signedIn:false },
    { id:"no-access", label:"Signed in, no access", access:"none", signedIn:true },
    { id:"patron", label:"Active Patreon supporter", access:"member", signedIn:true, tier:"Aether Member" },
    { id:"archivist", label:"Archivist Tier patron", access:"archivist", signedIn:true, tier:"Archivist Tier" },
    { id:"key-holder", label:"Access-key holder", access:"key", signedIn:true },
    { id:"lapsed", label:"Expired / lapsed supporter", access:"expired", signedIn:true },
    { id:"pending", label:"Provider sync pending", access:"pending", signedIn:true },
    { id:"no-tier", label:"Patreon linked, no qualifying tier", access:"no-tier", signedIn:true }
  ];

  // Which books the reader app centers on (deep content focus).
  const PRIMARY_SLUG = "the-glass-orchard";
  const FEATURED_SLUGS = ["the-glass-orchard", "meridian-gate"];

  // ---- Aether Studio (author CMS) mock data ----
  const STUDIO = {
    overview: {
      subscribers: 1284, subsDelta: "+38 this week",
      reads30: 18640, readsDelta: "+12% vs last month",
      drafts: 3, draftsDelta: "ready to review",
      scheduled: 4, scheduledDelta: "next: Jun 27",
      followers: 2110, followersDelta: "+64 this week"
    },
    tiers: [
      { name:"Aether Member", price:"$5/mo", members: 1042, unlocks:"Member chapters + early access + previews" },
      { name:"Archivist Tier", price:"$12/mo", members: 242, unlocks:"Everything + bonus appendices, early drafts, art drops" }
    ],
    campaigns: [
      { id:"camp1", name:"Arc II Preview Drop", code:"AETHER-ARC2-2026", issued:50, used:31, scope:"The Glass Orchard \u00b7 Ch.7", state:"active", expires:"Jul 31" },
      { id:"camp2", name:"Reviewer Liturgy", code:"REVIEWER-2026", issued:12, used:9, scope:"Ash Saints \u00b7 Ch.4", state:"active", expires:"\u2014" },
      { id:"camp3", name:"Founding Gift Wave", code:"FOUNDING-2025", issued:100, used:100, scope:"All access", state:"exhausted", expires:"Dec 2025" }
    ],
    members: [
      { name:"Wren H.", tier:"Archivist Tier", since:"2024-11", status:"active", source:"Patreon" },
      { name:"Halric M.", tier:"Aether Member", since:"2025-03", status:"active", source:"Patreon" },
      { name:"Moth K.", tier:"Aether Member", since:"2025-01", status:"active", source:"Key (Reviewer)" },
      { name:"Iola V.", tier:"Aether Member", since:"2025-02", status:"lapsed", source:"Patreon" },
      { name:"Osric T.", tier:"Archivist Tier", since:"2024-09", status:"active", source:"Manual grant" },
      { name:"Pell R.", tier:"\u2014", since:"2025-05", status:"pending", source:"Patreon (sync)" }
    ],
    drafts: [
      { id:"d1", title:"The Third Bell", book:"The Glass Orchard", words: 2140, status:"draft", note:"Arc II opening \u2014 needs a pass on the orchard description." },
      { id:"d2", title:"The Lector's Confession", book:"Meridian Gate", words: 980, status:"draft", note:"Half-written; continue the council scene." },
      { id:"d3", title:"Bonus: Iola's Glossary", book:"The Glass Orchard", words: 1320, status:"review", note:"Awaiting art for the appendix." }
    ],
    analytics: {
      readsByDay: [42,55,48,61,73,95,88,71,64,79,102,118,96,84],
      topChapters: [
        { t:"Inheritance of Glass", reads:4210, completion:92, react:"â¤ï¸ 128" },
        { t:"The Night Garden Opens", reads:3180, completion:78, react:"\ud83d\udd25 96" },
        { t:"The First Remembering", reads:2890, completion:81, react:"\ud83d\ude2e 74" },
        { t:"What the Mulberry Knew", reads:2640, completion:88, react:"\ud83d\udca1 61" }
      ],
      retention: { start:100, midCh3:84, midCh5:71, latest:58 },
      commentsQueue: [
        { who:"Wren H.", ch:"The Night Garden Opens", text:"The doors metaphor \u2014 is each one a sealed village secret? Need a lore post.", flagged:false },
        { who:"anon", ch:"Inheritance of Glass", text:"[reported: spoiler in comment]", flagged:true },
        { who:"Halric M.", ch:"What the Mulberry Knew", text:"Loved the pacing here. Felt earned.", flagged:false }
      ],
      reactions: [ {e:"â¤ï¸",n:412},{e:"\ud83d\udd25",n:288},{e:"\ud83d\ude2e",n:201},{e:"\ud83d\udca1",n:176},{e:"\ud83d\ude22",n:94} ]
    },
    announcements: [
      { id:"a1", title:"Arc II begins next week", body:"Longer chapters incoming. Thank you for your patience with the drafts.", target:"The Glass Orchard", when:"Scheduled \u00b7 Jun 26", state:"scheduled" },
      { id:"a2", title:"Patreon sync running smoothly", body:"New early-access chapters are live.", target:"All readers", when:"Today", state:"live" },
      { id:"a3", title:"Gift key campaign Friday", body:"Arc II keys drop 18:00 \u2014 limited quantity.", target:"Archivist Tier", when:"Today", state:"live" }
    ],
    media: [
      { id:"m1", fig:"chapel", title:"The Chapel Door", attached:"Ch.1 \u00b7 Ch.4", used:2 },
      { id:"m2", fig:"station", title:"The Reliquary Ring", attached:"Ash Saints \u00b7 Ch.1", used:1 },
      { id:"m3", fig:"gate", title:"Meridian at Noon", attached:"Meridian Gate \u00b7 Ch.4", used:1 },
      { id:"m4", fig:"map", title:"Dawn Atlas Excerpt", attached:"Night Cartographer \u00b7 Ch.1", used:1 },
      { id:"m5", fig:"portrait", title:"Maren, the Night of the Sealing", attached:"Ch.4 cover concept", used:0 },
      { id:"m6", fig:"chapel", title:"Night Garden Concept", attached:"Unassigned draft", used:0 }
    ]
  };

  return {
    STORIES, COLLECTIONS, UPDATES, CALENDAR, NOTIFICATIONS_SEED, MILESTONES,
    QUOTES_SEED, KEY_REASONS, GLOSSARY_STATES, PERSONAS, FIG,
    PRIMARY_SLUG, FEATURED_SLUGS, STUDIO
  };
})();

