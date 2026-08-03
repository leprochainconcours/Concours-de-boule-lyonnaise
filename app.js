// Collez ici l'URL /exec de votre application web Google Apps Script.
// Tant que cette valeur n'est pas renseignée, les données de démonstration restent utilisées.
const API_URL = 'https://script.google.com/macros/s/AKfycbxgmndoPjmaNq-TInyDQa7wNdIrSSYD3BYny07AsPNdYCuq-wV_yPhD0XD-eCUhajYUfA/exec';
let filters = {
    date: 'all',
    dateFrom: '',
    dateTo: '',
    category: [],
    audience: [],
    game: [],
    CBD: [],
    format: [],
    association: ''
};
let contests = [
];

let visibleCount = 20;
const pageSize = 20;

const $ = s => document.querySelector(s); const month = ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'];
function formatDay(iso) { let d = new Date(iso); return { day: d.getDate(), month: month[d.getMonth()] } }
function displayDate(iso) { return new Intl.DateTimeFormat('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' }).format(new Date(iso)) }
function displayDate_seul(iso) { return new Intl.DateTimeFormat('fr-FR', { weekday: 'long', day: 'numeric', month: 'long'}).format(new Date(iso)) }

function sameDay(d1, d2) {
    return d1.getFullYear() === d2.getFullYear() &&
        d1.getMonth() === d2.getMonth() &&
        d1.getDate() === d2.getDate();
}
function matches(c) {

    let d = new Date(c.date);

    if (filters.association &&
        !c.association.toLowerCase().includes(filters.association.toLowerCase()))
    {
        return false;
    }

    if (filters.category.length > 0) {

        if (!c.categories.some(x =>
            filters.category.includes(x)
        ))
            return false;
    }
    if (filters.audience.length > 0) {

        let audiences = c.audience
            ? c.audience.split('|').map(x => x.trim())
            : [];

        if (!audiences.some(x =>
            filters.audience.includes(x)
        ))
            return false;
    }
    
        if (filters.game.length > 0) {

            if (!filters.game.includes(c.game))
                return false;
        }
    if (filters.CBD.length > 0) {

        if (!filters.CBD.includes(c.CBD))
            return false;
    }
    
    if (filters.format.length > 0) {

        if (!filters.format.includes(c.format))
            return false;
    }

    if (filters.date === 'today') {
        return sameDay(d, new Date());
    }

    if (filters.date === 'weekend' || filters.date === 'nextweekend') {

        let today = new Date();
        today.setHours(0, 0, 0, 0);

        // samedi de cette semaine
        let saturday = new Date(today);
        saturday.setDate(today.getDate() + ((6 - today.getDay() + 7) % 7));

        // si on veut le week-end suivant
        if (filters.date === 'nextweekend') {
            saturday.setDate(saturday.getDate() + 7);
        }

        let sunday = new Date(saturday);
        sunday.setDate(saturday.getDate() + 1);

        return sameDay(d, saturday) || sameDay(d, sunday);
    }
    if (filters.date === "range") {

        if (!filters.dateFrom || !filters.dateTo)
            return true;

        let from = new Date(filters.dateFrom);
        from.setHours(0, 0, 0, 0);

        let to = new Date(filters.dateTo);
        to.setHours(23, 59, 59, 999);

        return d >= from && d <= to;
    }

    return true;
}
function filterAssociation(c) {
    let search = document.getElementById('search-association').value.toLowerCase().trim();

    if (!search) return true;

    return c.association 
        && c.association.toLowerCase().includes(search);
}

function render() {
    let today = new Date();
    today.setHours(0, 0, 0, 0);
    let list = $('#event-list');
    let filtered = contests
        .filter(c => new Date(c.date) >= today)
        .filter(matches)
        .filter(filterAssociation)
        .sort((a, b) => new Date(a.date) - new Date(b.date));

        
    let displayed = filtered.slice(0, visibleCount);

    list.innerHTML = displayed.length ? displayed.map(c => {
        let d = formatDay(c.date);
        return `<article class="event-card" data-id="${c.id}"><div class="date-box"><strong>${d.day}</strong><span>${d.month}</span></br><span>${new Date(c.date).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })} </span></div>
        <div><h3>${c.capacity} ${c.game} ${c.categories} ${c.audience && c.audience !== 'Non précisé' ? c.audience : ''}</h3><p>
    ${c.format ? c.format + '<br>' : ''}
    ${c.association ? c.association + '<br>' : ''}
    ${c.place ? c.place : ''}
</p></div>
        <span class="badge">CBD ${c.CBD}</span>
        </article>`
    }).join('') : '<p class="muted">Aucun concours ne correspond à ces critères.</p>';
    list.querySelectorAll('.event-card').forEach(e => e.onclick = () => showEvent(+e.dataset.id));
    let labels = [];

    if (filters.date !== 'all') {
        if (filters.date === 'today')
            labels.push("Aujourd'hui");

        else if (filters.date === 'weekend')
            labels.push("Ce week-end");

        else if (filters.date === 'nextweekend')
            labels.push("Week-end prochain");

        else if (filters.date === 'range') {
            if (filters.dateFrom && filters.dateTo) {
                let from = new Date(filters.dateFrom);
                let to = new Date(filters.dateTo);

                labels.push(
                    `Du ${from.toLocaleDateString('fr-FR')} au ${to.toLocaleDateString('fr-FR')}`
                );
            }
        }
    }

    if (filters.association)
        labels.push(filters.association);


    if (filters.category.length > 0)
        labels.push(filters.category);

    if (filters.game.length > 0)
        labels.push(filters.game);

    if (filters.format.length > 0)
        labels.push(filters.format);

    if (filters.CBD.length > 0)
        labels.push(filters.CBD);

    if (filters.audience.length > 0)
        labels.push(filters.audience);

    let tag = $('#active-filter');

    tag.hidden = !labels.length;

    if (labels.length) {
        tag.innerHTML = labels.map((x, i) =>
            `<span class="filter-tag">
            ${x}
            <button type="button" class="remove-filter" data-index="${i}">×</button>
        </span>`
        ).join('');

        document.querySelectorAll('.remove-filter').forEach(btn => {
            btn.onclick = () => removeFilter(+btn.dataset.index);
        });

    } else {
        tag.innerHTML = '';
    }
    const loadMore = $('#load-more-container');

    if (filtered.length > visibleCount) {

        loadMore.innerHTML = `
        <button class="primary wide" id="load-more">
            Charger ${Math.min(pageSize, filtered.length - visibleCount)} concours de plus
        </button>
    `;

        $('#load-more').onclick = () => {
            visibleCount += pageSize;
            render();
        };

    } else {
        loadMore.innerHTML = '';
    }
}

function removeFilter(index){

    let active = [];

    if (filters.association)
        active.push('association');

    if (filters.date !== 'all')
        active.push('date');

    if (filters.category.length > 0)
        active.push('category');

    if (filters.audience.length > 0)
        active.push('audience');

    if (filters.game.length > 0)
        active.push('game');

    if (filters.CBD.length > 0)
        active.push('CBD');

    if (filters.format.length > 0)
        active.push('format');

    let filterToRemove = active[index];

    if (filterToRemove === 'association') {
    filters.association = '';

    document.getElementById('search-association').value = '';
}

    if (filterToRemove === 'date') {
        filters.date = 'all';
        filters.dateFrom = '';
        filters.dateTo = '';

        let range = $('#date-range');
        if (range) {
            range.classList.remove('date-range-visible');
            range.classList.add('date-range-hidden');
        }

    }

    if (filterToRemove === 'category') {
        filters.category = [];
    }

    if (filterToRemove === 'audience') {
        filters.audience = [];
    }

    if (filterToRemove === 'game') {
        filters.game = [];
    }

    if (filterToRemove === 'CBD') {
        filters.CBD = [];
    }
    if (filterToRemove === 'format') {
        filters.format = [];
    }


    // remise à jour des boutons
    document.querySelectorAll('[data-date]')
        .forEach(x => x.classList.toggle(
            'selected',
            x.dataset.date === filters.date
        ));
    refreshFilterButtons();
    visibleCount = pageSize;
    render();
}

function refreshFilterButtons() {

    document.querySelectorAll('[data-cbd]')
        .forEach(x => x.classList.toggle(
            'selected',
            filters.CBD.includes(x.dataset.cbd)
        ));


    document.querySelectorAll('[data-category]')
        .forEach(x => x.classList.toggle(
            'selected',
            filters.category.includes(x.dataset.category)
        ));


    document.querySelectorAll('[data-audience]')
        .forEach(x => x.classList.toggle(
            'selected',
            filters.audience.includes(x.dataset.audience)
        ));


    document.querySelectorAll('[data-game]')
        .forEach(x => x.classList.toggle(
            'selected',
            filters.game.includes(x.dataset.game)
        ));


    document.querySelectorAll('[data-format]')
        .forEach(x => x.classList.toggle(
            'selected',
            filters.format.includes(x.dataset.format)
        ));
}
function showEvent(id) {

    const c = contests.find(x => String(x.id) === String(id));
    if (!c) return;

    const d = formatDay(c.date);
    const dlg = $('#event-dialog');

    const tags = [];

    if (c.format && c.format !== "Non précisé")
        tags.push(`<span class="tag">${c.format}</span>`);

    if (c.points && c.points !== "Non précisé")
        tags.push(`<span class="tag">${c.points}</span>`);

    if (c.game && c.game !== "Non précisé")
        tags.push(`<span class="tag">${c.game}</span>`);


    if (c.audience && c.audience !== "Non précisé") {

        c.audience
            .split('|')
            .map(x => x.trim())
            .filter(x => x)
            .forEach(x => {
                tags.push(`<span class="tag">${x}</span>`);
            });
    }

    if (Array.isArray(c.categories)) {
        c.categories
            .filter(x => x && x !== "Non précisé")
            .forEach(x => tags.push(`<span class="tag">${x}</span>`));
    }

    if (c.CBD  && c.CBD !== "Non précisé")
        tags.push(`<span class="tag">${c.CBD}</span>`);
    dlg.innerHTML = `
<form method="dialog">

    <div class="sheet-handle"></div>

    <div class="sheet-head">
        <p class="event-detail-date">${d.day} ${d.month.toUpperCase()}</p>
        <button class="icon-close">×</button>
    </div>

    <h2>${c.capacity} ${c.game} ${Array.isArray(c.categories) ? c.categories.join(" · ") : ""}</h2>

    <p class="association">
        Organisé par ${c.association}
    </p>

    <div class="tags">
        ${tags.join("")}
    </div>

    <div class="details">

        <div class="detail">
            <span>◷</span>
            <div>
                <b>${displayDate(c.date)}</b>
            </div>
        </div>

        <div class="detail">
            <span>⌖</span>
            <div>
                <small>Nom du concours</small>
                <b>${c.place}</b>
            </div>
        </div>

        <div class="detail">
            <span>♙</span>
            <div>
                <small>Places disponibles</small>
                <b>${c.capacity} ${c.game}s</b>
            </div>
        </div>

    </div>

${c.phone
            ? `<a class="primary wide call-button"
          href="tel:${c.phone.replace(/\s/g, '')}">
            <span>Appeler ${c.association}</span>
            <span>${c.phone}</span>
       </a>`
            : ""
}

</form>`;

    dlg.showModal();
}
function setFilter(type, value) { filters[type] = value; visibleCount = pageSize; render()}
$('#open-filters').onclick = () => $('#filters-dialog').showModal();
$('#filter-link').onclick = () => $('#filters-dialog').showModal();
$('#nav-explore').onclick = () => $('#filters-dialog').showModal();
document.querySelectorAll('[data-filter]').forEach(b => b.onclick = () => { setFilter('date', b.dataset.filter); window.scrollTo({ top: 500, behavior: 'smooth' }) });
document.querySelectorAll('[data-date]').forEach(b => {

    b.onclick = () => {

        document.querySelectorAll('[data-date]')
            .forEach(x => x.classList.remove('selected'));

        b.classList.add('selected');

        filters.date = b.dataset.date;

        let range = document.getElementById("date-range");

        if (filters.date === "range") {

            range.classList.remove("date-range-hidden");
            range.classList.add("date-range-visible");

            setDefaultDates();

        } else {

            range.classList.remove("date-range-visible");
            range.classList.add("date-range-hidden");
            visibleCount = pageSize;
            render();
        }
        // Mise à jour immédiate de la liste
        visibleCount = pageSize; // si tu gardes le "charger plus"
        render();
    };
});
document.getElementById("date-from").addEventListener("change", function () {

    let from = new Date(this.value);
    let toInput = document.getElementById("date-to");

    if (!toInput.value)
        return;

    let to = new Date(toInput.value);

    if (to < from) {
        toInput.value = this.value;
    }
});

document.getElementById('search-association')
.addEventListener('input', function () {

    filters.association = this.value.trim();

    visibleCount = pageSize;
    render();

});

document.getElementById("date-to").addEventListener("change", function () {

    let to = new Date(this.value);
    let fromInput = document.getElementById("date-from");

    if (!fromInput.value)
        return;

    let from = new Date(fromInput.value);

    if (to < from) {
        fromInput.value = this.value;
    }
});
document.querySelectorAll('.category-filter').forEach(b => b.onclick = () => {
    document.querySelectorAll('.category-filter').forEach(x => x.classList.remove('selected'));
    b.classList.add('selected'); filters.category = b.dataset.category
});


document.querySelectorAll('.CBD-filter').forEach(b => b.onclick = () => {
    document.querySelectorAll('.CBD-filter').forEach(x => x.classList.remove('selected'));
    b.classList.add('selected');
    filters.CBD = b.dataset.cbd
});

document.querySelectorAll('.game-filter').forEach(b => b.onclick = () => {
    document.querySelectorAll('.game-filter').forEach(x => x.classList.remove('selected'));
    b.classList.add('selected');
    filters.game = b.dataset.game
});


document.querySelectorAll('.format-filter').forEach(b => b.onclick = () => {
    document.querySelectorAll('.format-filter').forEach(x => x.classList.remove('selected'));
    b.classList.add('selected');
    filters.format = b.dataset.format
});

$('#apply-filters').onclick = () => {

    if (filters.date === "range") {
        filters.dateFrom = $('#date-from').value;
        filters.dateTo = $('#date-to').value;
    }
    else {
        filters.dateFrom = '';
        filters.dateTo = '';
    }
   
    visibleCount = pageSize;
    render();
};



function setDefaultDates() {

    let from = document.getElementById("date-from");
    let to = document.getElementById("date-to");

    if (!from.value) {

        let today = new Date();

        let end = new Date();
        end.setDate(today.getDate() + 30);

        from.value = formatInputDate(today);
        to.value = formatInputDate(end);
    }
}


function formatInputDate(date) {

    return date.toISOString()
        .substring(0, 10);
}



function renderDynamicFilters() {

    // CBD
    const cbds = [...new Set(
        contests
            .map(c => c.CBD)
            .filter(x => x && x !== 'Non précisé')
    )].sort();


    createFilterButtons(
        'CBD-filters',
        cbds,
        'CBD',
        'Toutes'
    );
    // Publics
    const audiences = [...new Set(
        contests
            .flatMap(c => 
                c.audience 
                    ? c.audience.split('|')
                    : []
            )
            .map(x => x.trim())
            .filter(x => x && x !== 'Non précisé')
    )].sort();


    createFilterButtons(
        'audience-filters',
        audiences,
        'audience',
        'Tous'
    );

    // Catégories
    const categories = [...new Set(
        contests
            .flatMap(c => c.categories)
            .filter(x => x && x !== 'Non précisé')
    )].sort();


    createFilterButtons(
        'category-filters',
        categories,
        'category',
        'Toutes'
    );


    // Jeux
    const games = [...new Set(
        contests
            .map(c => c.game)
            .filter(x => x && x !== 'Non précisé')
    )].sort();


    createFilterButtons(
        'game-filters',
        games,
        'game',
        'Tous'
    );

      // format
    const formats = [...new Set(
        contests
            .map(c => c.format)
            .filter(x => x && x !== 'Non précisé')
    )].sort();


    createFilterButtons(
        'format-filters',
        formats,
        'format',
        'Tous'
    );
}


function createFilterButtons(containerId, values, filterName, allLabel) {

    const container = $('#' + containerId);

    const dataName = filterName.toLowerCase();

    container.innerHTML = `
        <button type="button"
                class="choice selected"
                data-${dataName}="all">
            ${allLabel}
        </button>

        ${values.map(value => `
            <button type="button"
                    class="choice"
                    data-${dataName}="${value}">
                ${value}
            </button>
        `).join('')}
    `;


container.querySelectorAll('.choice').forEach(btn => {

    btn.onclick = () => {

        let value = btn.dataset[dataName];

        // bouton "Toutes"
        if (value === "all") {

            filters[filterName] = [];

            container.querySelectorAll('.choice')
                .forEach(x => x.classList.remove('selected'));

            btn.classList.add('selected');

        } else {

            // enlève la sélection "Toutes"
            let allButton = container.querySelector(`[data-${dataName}="all"]`);
            if (allButton)
                allButton.classList.remove('selected');


            if (filters[filterName].includes(value)) {

                // désélection
                filters[filterName] =
                    filters[filterName].filter(x => x !== value);

                btn.classList.remove('selected');

            } else {

                // ajout
                filters[filterName].push(value);

                btn.classList.add('selected');
            }


            // si plus rien de sélectionné
            if (filters[filterName].length === 0) {
                allButton.classList.add('selected');
            }
        }

        visibleCount = pageSize;
        render();
    };
});
}