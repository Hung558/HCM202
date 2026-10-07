const DEFAULT_ROTATION_X = 0.005;
const DEFAULT_ROTATION_Y = 0.002;
let targetRotationX = DEFAULT_ROTATION_X;
let targetRotationY = DEFAULT_ROTATION_Y;
let autoRotate = true;
let mouseXOnMouseDown = 0, mouseYOnMouseDown = 0;
let dragging = false, dragDX = 0, dragDY = 0; // pointer movement since last frame

const EARTH_RADIUS = 0.5;
const DEFAULT_CAMERA_Z = 1.7;
const FOCUS_CAMERA_Z = 1.2;
// Khoảng cách camera để cả quả cầu (kèm quầng mây) vừa bề ngang màn hình; màn dọc điện thoại thì lùi xa hơn
function fitCameraZ(aspect) {
    const halfFovX = Math.atan(Math.tan(THREE.MathUtils.degToRad(45 / 2)) * aspect);
    return Math.max(DEFAULT_CAMERA_Z, (EARTH_RADIUS * 1.12) / Math.sin(halfFovX));
}
const COUNTRY_COLOR = '#FFD700'; // gold
const EVENT_COLORS = ['#FF3B30', '#FF4500', '#DC143C', '#9932CC', '#FF1493']; // 1, 2, 3, 4, 5+ events at a place
const FOCUSED_COLOR = '#00BF19';
const markerMaterial = (color) => new THREE.MeshBasicMaterial({ color, transparent: true });

// Vietnamese places that get a label (others in VN stay unlabelled to avoid clutter)
const LABELLED_VN_PLACES = ['hà nội', 'huế', 'nghệ an', 'bình định', 'sài gòn', 'tp hồ chí minh', 'hồ chí minh', 'cao bằng'];

// "Huế, Việt Nam" -> "Huế"; "Marseille, Pháp" -> "Marseille, Pháp"; unlisted VN places -> ''
function eventLocationLabel(location) {
    const parts = location.split(',').map((p) => p.trim());
    const country = parts[parts.length - 1].toLowerCase();
    if (country === 'việt nam' || country === 'vietnam') {
        return LABELLED_VN_PLACES.some((place) => location.toLowerCase().includes(place)) ? parts[0] : '';
    }
    return parts.length >= 2 ? `${parts[0]}, ${parts[parts.length - 1]}` : location;
}

// ---- Media helpers (images, YouTube, video files) ----
function isYouTubeUrl(url) {
    return typeof url === 'string' && /youtube\.com|youtu\.be/i.test(url);
}

function extractYouTubeVideoId(url) {
    const match = url.match(/^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/);
    return match && match[2].length === 11 ? match[2] : null;
}

function isVideoFile(url) {
    return /\.(mp4|mov|avi)$/i.test(url);
}

// Browsers block http media on an https page
function normalizeMediaUrl(url) {
    return location.protocol === 'https:' ? url.replace(/^http:/, 'https:') : url;
}

function createImage(src, alt) {
    const img = document.createElement('img');
    img.src = src;
    img.alt = alt;
    img.referrerPolicy = 'no-referrer'; // some news sites block hotlinked images that send a referrer
    img.onerror = () => { img.style.display = 'none'; };
    return img;
}

function createMediaElement(url, alt) {
    const src = normalizeMediaUrl(url);
    if (isYouTubeUrl(src) && extractYouTubeVideoId(src)) {
        const iframe = document.createElement('iframe');
        iframe.src = `https://www.youtube.com/embed/${extractYouTubeVideoId(src)}`;
        iframe.title = alt;
        iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
        iframe.allowFullscreen = true;
        iframe.className = 'event-media youtube-video';
        return iframe;
    }
    if (isVideoFile(src)) {
        const video = document.createElement('video');
        video.src = src;
        video.controls = true;
        video.className = 'event-media';
        return video;
    }
    const img = createImage(src, alt);
    img.className = 'event-media';
    return img;
}

// Same mapping as THREE.SphereGeometry's UVs, so points land on the right spot of the texture
function latLngToVector3(lat, lng, radius) {
    const phi = THREE.MathUtils.degToRad(90 - lat);
    const theta = THREE.MathUtils.degToRad(lng + 180);
    return new THREE.Vector3(
        -radius * Math.sin(phi) * Math.cos(theta),
        radius * Math.cos(phi),
        radius * Math.sin(phi) * Math.sin(theta)
    );
}

// 1 at the default view, smaller on the globe when zoomed in. The 0.7 power lets labels/markers still grow
// a little on screen (readable) but much slower than the map, so nearby places separate.
function zoomScale(camera) {
    return ((camera.position.z - EARTH_RADIUS) / (DEFAULT_CAMERA_Z - EARTH_RADIUS)) ** 0.7;
}

// White text with black outline, like the labels in the MLN project
function createTextSprite(text, centerY = -0.3) {
    const canvas = document.createElement('canvas');
    let context = canvas.getContext('2d');
    context.font = 'bold 44px Arial';
    canvas.width = Math.ceil(context.measureText(text).width) + 24; // hug the text, so overlap checks are tight
    canvas.height = 128;
    context = canvas.getContext('2d'); // resizing resets the context state
    context.font = 'bold 44px Arial';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.strokeStyle = '#000';
    context.lineWidth = 10;
    context.strokeText(text, canvas.width / 2, 64);
    context.fillStyle = '#fff';
    context.fillText(text, canvas.width / 2, 64);

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    const sprite = new THREE.Sprite(new THREE.SpriteMaterial({
        map: texture,
        transparent: true,
        depthTest: false,
        depthWrite: false,
    }));
    sprite.renderOrder = 999;
    sprite.scale.set(0.03 * canvas.width / canvas.height, 0.03, 1);
    sprite.center.set(0.5, centerY); // negative: above the marker, > 1: below it
    return sprite;
}

function main() {
    const intro = document.getElementById('intro');
    THREE.DefaultLoadingManager.onLoad = () => {
        intro.classList.add('fade-out');
        intro.addEventListener('animationend', () => { intro.hidden = true; }, { once: true });
    };

    const scene = new THREE.Scene();
    const canvas = document.querySelector('#globe');
    const renderer = new THREE.WebGLRenderer({ canvas });
    renderer.setSize(window.innerWidth, window.innerHeight);

    const earthGeometry = new THREE.SphereGeometry(EARTH_RADIUS, 64, 64);
    const earthMaterial = new THREE.MeshPhongMaterial({
        map: new THREE.TextureLoader().load('texture/earthmap.jpeg'),
        bumpMap: new THREE.TextureLoader().load('texture/earthbump.jpeg'),
        bumpScale: 1,
    });
    const earthMesh = new THREE.Mesh(earthGeometry, earthMaterial);
    scene.add(earthMesh);

    const pointLight = new THREE.PointLight(0xffffff, 5, 4); // White light, intensity 5, distance 4
    pointLight.position.set(1,0.3,1);
    scene.add(pointLight);

    // Light every side evenly so the far half of the globe isn't black
    scene.add(new THREE.AmbientLight(0xffffff, 1.5));

    const cloudGeometry = new THREE.SphereGeometry(0.52, 64, 64);
    const cloudMaterial = new THREE.MeshPhongMaterial({
        map: new THREE.TextureLoader().load('texture/earthCloud.png'),
        transparent: true,
        depthWrite: false // let markers show through the cloud layer
    });
    const cloudMesh = new THREE.Mesh(cloudGeometry, cloudMaterial);
    scene.add(cloudMesh);

    const starGeometry = new THREE.SphereGeometry(5, 64, 64);
    const starMaterial = new THREE.MeshBasicMaterial({
        map: new THREE.TextureLoader().load('texture/galaxy.png'),
        side: THREE.BackSide,
        color: 0x444444 // dim the stars: faint ones fade out, globe stands out more
    });

    const starMesh = new THREE.Mesh(starGeometry, starMaterial);
    scene.add(starMesh);

    const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = fitCameraZ(camera.aspect);

    window.addEventListener('resize', () => {
        const wasFit = Math.abs(targetCameraZ - fitCameraZ(camera.aspect)) < 0.01;
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
        // chưa zoom tay thì giữ quả cầu vừa màn khi xoay ngang/dọc điện thoại
        if (wasFit) targetCameraZ = fitCameraZ(camera.aspect);
    });

    // Markers + labels are children of the earth so they rotate with it.
    // userData.item = what a click opens; userData.targets = focused items that turn it green
    const clickables = [earthMesh]; // earth included so it blocks clicks on far-side markers
    const markers = [];
    const labels = []; // { sprite, baseScale, priority }, drawn/hidden by updateLabels()
    function addMarker({ coordinates: [lat, lng], size, color, labelText, labelBelow, labelPriority, item, targets }) {
        if (size) {
            const marker = new THREE.Mesh(new THREE.SphereGeometry(size, 16, 16), markerMaterial(color));
            marker.position.copy(latLngToVector3(lat, lng, EARTH_RADIUS));
            marker.renderOrder = 1; // after the clouds
            marker.userData = { item, targets, color };
            // Constant-ish on-screen size, so zooming in separates nearby places instead of magnifying the dots
            marker.onBeforeRender = (renderer, scene, camera) => marker.scale.setScalar(zoomScale(camera));
            earthMesh.add(marker);
            markers.push(marker);
            clickables.push(marker);
        }

        if (labelText) {
            const sprite = createTextSprite(labelText, labelBelow ? 1.3 : -0.3);
            sprite.position.copy(latLngToVector3(lat, lng, EARTH_RADIUS + 0.005));
            sprite.userData = { item };
            earthMesh.add(sprite);
            clickables.push(sprite);
            labels.push({ sprite, baseScale: sprite.scale.clone(), primaryY: sprite.center.y, priority: labelPriority });
        }
    }

    // Hồ Chí Minh journey: one marker per location, bigger/redder with more events there
    const groups = new Map();
    EVENTS.forEach((event) => {
        const key = event.coordinates.map((x) => x.toFixed(4)).join();
        if (!groups.has(key)) groups.set(key, { location: event.location, coordinates: event.coordinates, events: [] });
        groups.get(key).events.push(event);
    });

    // A capital within ~10 km of an event place shares that place's dot (London, Paris, Berlin, Moskva, Hà Nội)
    const unit = (coordinates) => latLngToVector3(...coordinates, 1);
    const sharedGroup = (country) => [...groups.values()].find((g) => unit(g.coordinates).distanceTo(unit(country.coordinates)) < 10 / 6371);

    COUNTRIES.forEach((country) => {
        const group = sharedGroup(country);
        if (group) group.countries = [...(group.countries || []), country];
        addMarker({
            coordinates: country.coordinates, size: group ? 0 : 0.006, color: COUNTRY_COLOR,
            labelText: country.name, labelPriority: 1, item: country, targets: [country],
        });
    });

    // Vietnamese archipelagos: clicking opens Việt Nam; their labels are never hidden by others
    const vietnam = COUNTRIES.find((c) => c.name === 'Việt Nam');
    TERRITORIES.forEach(({ name, coordinates }) => addMarker({
        coordinates, size: 0.006, color: COUNTRY_COLOR, labelText: name, labelPriority: 100, item: vietnam, targets: [vietnam],
    }));

    groups.forEach((group) => {
        const count = group.events.length;
        addMarker({
            coordinates: group.coordinates,
            size: 0.006 + 0.0015 * (count - 1),
            color: EVENT_COLORS[Math.min(count, EVENT_COLORS.length) - 1],
            // skip when the place is itself a country that already has a label (Singapore, Thái Lan)
            labelText: COUNTRIES.some((c) => c.name === group.location) ? '' : eventLocationLabel(group.location),
            labelBelow: true, // country labels sit above their dot
            labelPriority: 10 + count, // places with more events win
            item: count === 1 ? group.events[0] : group,
            targets: [group, ...group.events, ...(group.countries || [])],
        });
    });
    labels.sort((a, b) => b.priority - a.priority);

    // Each frame: size labels for the zoom, hide those on the far side, and place each label (in priority
    // order) at the first free spot around its dot: its usual side, the other side, right, left. A label with
    // no free spot is hidden until you zoom in enough to make room.
    const labelPos = new THREE.Vector3();
    const toCamera = new THREE.Vector3();
    function updateLabels() {
        const scale = zoomScale(camera);
        const pxPerUnitAtDistance1 = window.innerHeight / (2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)));
        const placed = [];
        labels.forEach(({ sprite, baseScale, primaryY }) => {
            sprite.scale.copy(baseScale).multiplyScalar(scale);
            sprite.getWorldPosition(labelPos);
            toCamera.copy(camera.position).sub(labelPos).normalize();
            if (labelPos.clone().normalize().dot(toCamera) < 0.15) {
                sprite.visible = false;
                return;
            }
            const pxPerUnit = pxPerUnitAtDistance1 / camera.position.distanceTo(labelPos);
            const w = sprite.scale.x * pxPerUnit, h = sprite.scale.y * pxPerUnit;
            labelPos.project(camera);
            const px = (labelPos.x + 1) / 2 * window.innerWidth, py = (1 - labelPos.y) / 2 * window.innerHeight;
            const side = 0.4 * h / w; // gap between dot and a label placed beside it
            const spots = [[0.5, primaryY], [0.5, primaryY < 0 ? 1.3 : -0.3], [-side, 0.5], [1 + side, 0.5]];
            const free = spots.map(([cx, cy]) => {
                const x = px - cx * w, y = py - (1 - cy) * h;
                // the letters fill the middle ~half of the sprite's height and all but the side padding of its width
                return { cx, cy, box: { left: x + w * 0.03, right: x + w * 0.97, top: y + h * 0.25, bottom: y + h * 0.75 } };
            }).find(({ box }) => !placed.some((b) => box.left < b.right && box.right > b.left && box.top < b.bottom && box.bottom > b.top));
            sprite.visible = !!free;
            if (free) {
                sprite.center.set(free.cx, free.cy);
                placed.push(free.box);
            }
        });
    }

    // Country borders (Natural Earth 1:50m), only lines shared by two countries
    fetch('lib/countries-50m.json').then((res) => res.json()).then((world) => {
        const borders = topojson.mesh(world, world.objects.countries, (a, b) => a !== b);
        const points = [];
        borders.coordinates.forEach((line) => {
            for (let i = 1; i < line.length; i++) {
                const [lng1, lat1] = line[i - 1], [lng2, lat2] = line[i];
                if (Math.abs(lng2 - lng1) > 180) continue; // antimeridian wrap
                points.push(latLngToVector3(lat1, lng1, EARTH_RADIUS * 1.001), latLngToVector3(lat2, lng2, EARTH_RADIUS * 1.001));
            }
        });
        const borderLines = new THREE.LineSegments(
            new THREE.BufferGeometry().setFromPoints(points),
            new THREE.LineBasicMaterial({ color: '#ffe8a3', transparent: true, opacity: 0.85 })
        );
        borderLines.renderOrder = 1; // after the clouds
        earthMesh.add(borderLines);
    });

    // ---- Focus / details panel ----
    const details = document.getElementById('details');
    const overlay = document.getElementById('details-overlay');
    const focusLabel = document.getElementById('focus-label');
    const titleEl = document.getElementById('details-title');
    const yearEl = document.getElementById('details-year');
    const mediaEl = document.getElementById('details-media');
    const descriptionEl = document.getElementById('details-description');
    const referencesContent = document.getElementById('references-content');
    const prevButton = document.getElementById('prev-button');
    const nextButton = document.getElementById('next-button');
    const sortedEvents = [...EVENTS].sort((a, b) => a.id - b.id);
    const menuItems = new Map(); // item -> its row in the menu
    let focused = null;
    let targetCameraZ = camera.position.z; // wheel zoom eases toward this
    const targetQuaternion = new THREE.Quaternion();

    // Neighbours for the prev/next bookmarks (none for a multi-event location)
    function sequenceOf(item) {
        if (COUNTRIES.includes(item)) return { list: COUNTRIES, noun: 'Quốc gia' };
        if (EVENTS.includes(item)) return { list: sortedEvents, noun: 'Sự kiện' };
        return null;
    }

    function focus(item) {
        focused = item;
        targetRotationX = 0;
        targetRotationY = 0;

        // Orientation that puts the item facing the camera with north up
        const f = latLngToVector3(...item.coordinates, 1).normalize();
        const u = new THREE.Vector3(0, 1, 0).addScaledVector(f, -f.y).normalize();
        const r = new THREE.Vector3().crossVectors(u, f);
        targetQuaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(r, u, f)).invert();

        markers.forEach((m) => m.material.color.set(m.userData.targets.includes(item) ? FOCUSED_COLOR : m.userData.color));
        menuItems.forEach((row, menuItem) => row.classList.toggle('active', menuItem === item));

        mediaEl.replaceChildren();
        descriptionEl.replaceChildren();
        referencesContent.replaceChildren();
        referencesContent.classList.remove('show');
        yearEl.textContent = '';
        details.classList.toggle('is-placeholder', COUNTRIES.includes(item));

        if (item.events) {
            // Several events at one place: list them
            titleEl.textContent = `Các sự kiện tại: ${item.location}`;
            const list = document.createElement('div');
            list.className = 'multiple-events-list';
            item.events.forEach((event) => {
                const row = document.createElement('div');
                row.className = 'event-item';
                row.textContent = `${event.eventName} (${event.year})`;
                row.addEventListener('click', () => focus(event));
                list.appendChild(row);
            });
            descriptionEl.appendChild(list);
            focusLabel.textContent = item.location;
        } else if (EVENTS.includes(item)) {
            titleEl.textContent = item.eventName;
            yearEl.textContent = `${item.year} · ${item.location}`;
            renderEventMedia(item);
            [].concat(item.references || []).filter(Boolean).forEach((ref) => {
                const link = document.createElement('a');
                link.href = ref.startsWith('http') ? ref : `https://${ref}`;
                link.target = '_blank';
                link.rel = 'noopener noreferrer';
                link.className = 'reference-link-item';
                link.textContent = ref;
                referencesContent.appendChild(link);
            });
            focusLabel.textContent = item.location;
        } else {
            titleEl.textContent = item.name; // country: content not filled in yet
            descriptionEl.textContent = item.description;
            focusLabel.textContent = `${item.capital}, ${item.name}`;
        }

        const sequence = sequenceOf(item);
        const index = sequence ? sequence.list.indexOf(item) : -1;
        prevButton.hidden = !sequence || index === 0;
        nextButton.hidden = !sequence || index === sequence.list.length - 1;
        if (sequence) {
            prevButton.textContent = `← ${sequence.noun} trước đó`;
            nextButton.textContent = `${sequence.noun} tiếp theo →`;
        }
        details.hidden = overlay.hidden = focusLabel.hidden = false;
        details.querySelector('.detail-scroll').scrollTop = 0;
    }

    // Media for one event, following its templateType (normal | grid | story_scroll)
    function renderEventMedia(event) {
        const urls = [].concat(event.mediaUrl || []).filter(Boolean);
        const descriptions = [].concat(event.description || []);
        const caption = (i) => {
            const source = event.sourceMedia;
            const text = Array.isArray(source) ? source[i] || source[0] : source;
            if (!text) return null;
            const el = document.createElement('div');
            el.className = 'media-caption';
            el.textContent = text;
            return el;
        };
        const withCaption = (i) => [createMediaElement(urls[i], `${event.eventName} - ${i + 1}`), caption(i)].filter(Boolean);

        if (event.templateType === 'normal' || urls.length <= 1) {
            if (urls.length) mediaEl.replaceChildren(...withCaption(0));
            descriptionEl.textContent = descriptions[0] || '';
            return;
        }

        const isStory = event.templateType === 'story_scroll';
        if (!isStory) descriptionEl.textContent = descriptions.join('\n\n');

        const display = document.createElement('div');
        display.className = 'media-display';
        const navButton = (text, step) => {
            const button = document.createElement('button');
            button.className = 'nav-btn';
            button.innerHTML = text;
            button.addEventListener('click', () => show(index + step));
            return button;
        };
        const nav = document.createElement('div');
        nav.className = 'carousel-nav';
        nav.append(navButton('&#8249;', -1), display, navButton('&#8250;', 1));

        const thumbs = document.createElement('div');
        thumbs.className = 'carousel-thumbs';
        const thumbEls = urls.map((url, i) => {
            const thumb = document.createElement('div');
            thumb.className = 'carousel-thumb';
            if (isYouTubeUrl(url) && extractYouTubeVideoId(url)) {
                thumb.appendChild(createImage(`https://img.youtube.com/vi/${extractYouTubeVideoId(url)}/mqdefault.jpg`, `Thumbnail ${i + 1}`));
            } else if (isVideoFile(url)) {
                thumb.textContent = '▶';
            } else {
                thumb.appendChild(createImage(normalizeMediaUrl(url), `Thumbnail ${i + 1}`));
            }
            thumb.addEventListener('click', () => show(i));
            thumbs.appendChild(thumb);
            return thumb;
        });

        let index = 0;
        function show(i) {
            index = (i + urls.length) % urls.length;
            display.replaceChildren(...withCaption(index));
            thumbEls.forEach((t, j) => t.classList.toggle('active', j === index));
            const active = thumbEls[index];
            thumbs.scrollLeft = active.offsetLeft - (thumbs.clientWidth - active.clientWidth) / 2;
            if (isStory) descriptionEl.textContent = descriptions[index] || descriptions[0] || '';
        }
        mediaEl.append(nav, thumbs);
        show(0);
    }

    function unfocus() {
        focused = null;
        targetRotationX = 0; // eases back up to the auto-spin (if on)
        targetRotationY = 0;
        markers.forEach((m) => m.material.color.set(m.userData.color));
        menuItems.forEach((row) => row.classList.remove('active'));
        mediaEl.replaceChildren(); // stops a playing video
        details.hidden = overlay.hidden = focusLabel.hidden = true;
    }

    document.getElementById('details-close').addEventListener('click', unfocus);
    overlay.addEventListener('click', unfocus);
    prevButton.addEventListener('click', () => {
        const { list } = sequenceOf(focused);
        focus(list[list.indexOf(focused) - 1]);
    });
    nextButton.addEventListener('click', () => {
        const { list } = sequenceOf(focused);
        focus(list[list.indexOf(focused) + 1]);
    });
    document.getElementById('references-button').addEventListener('click', () => referencesContent.classList.toggle('show'));

    const rotateButton = document.getElementById('rotate-toggle');
    rotateButton.addEventListener('click', () => {
        autoRotate = !autoRotate;
        rotateButton.textContent = autoRotate ? 'Tắt xoay' : 'Bật xoay';
    });

    // ---- Menu: tab "Giai đoạn" (events by phase) and tab "Châu lục" (countries) ----
    const dropdown = document.getElementById('timeline-dropdown');
    const toggle = document.getElementById('timeline-toggle');
    toggle.addEventListener('click', () => {
        dropdown.hidden = !dropdown.hidden;
        toggle.classList.toggle('open', !dropdown.hidden);
    });
    document.querySelectorAll('.timeline-tab').forEach((tab) => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.timeline-tab').forEach((t) => {
                t.classList.toggle('active', t === tab);
                document.getElementById(t.dataset.tab).hidden = t !== tab;
            });
        });
    });

    // One collapsible section: header + rows that focus their item
    function addMenuSection(container, title, items, fillRow) {
        const header = document.createElement('div');
        header.className = 'phase-header';
        header.innerHTML = '<h3></h3><span class="phase-arrow">&#9660;</span>';
        header.querySelector('h3').textContent = title;
        const list = document.createElement('div');
        list.className = 'phase-events';
        list.hidden = true;
        header.addEventListener('click', () => {
            list.hidden = !list.hidden;
            header.classList.toggle('expanded', !list.hidden);
        });
        items.forEach((item) => {
            const row = document.createElement('div');
            row.className = 'event-item';
            fillRow(row, item);
            row.addEventListener('click', () => focus(item));
            list.appendChild(row);
            menuItems.set(item, row);
        });
        container.append(header, list);
    }

    Object.entries(PHASE_LABELS).forEach(([phase, label]) => addMenuSection(
        document.getElementById('phase-list'), label,
        sortedEvents.filter((e) => e.phase === +phase),
        (row, event) => {
            const year = document.createElement('div');
            year.className = 'event-year';
            year.textContent = event.year;
            row.append(year, event.eventName);
        }
    ));
    [...new Set(COUNTRIES.map((c) => c.continent))].forEach((continent) => addMenuSection(
        document.getElementById('continent-list'), continent,
        COUNTRIES.filter((c) => c.continent === continent),
        (row, country) => { row.textContent = country.name; }
    ));

    // ---- Pointer (chuột + cảm ứng): 1 ngón/chuột kéo để xoay, 2 ngón chụm/mở để zoom, chạm nhẹ vào điểm để mở ----
    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    const pointers = new Map(); // pointerId -> { x, y } đang chạm
    let pinch = null; // { dist, z } lúc bắt đầu chụm
    let gestureMoved = false; // đã kéo/chụm thì không tính là chạm để mở điểm

    const pinchDist = () => {
        const [p1, p2] = [...pointers.values()];
        return Math.hypot(p1.x - p2.x, p1.y - p2.y);
    };

    function onPointerDown(event) {
        if (focused || (event.pointerType === 'mouse' && event.button !== 0)) return;
        canvas.setPointerCapture(event.pointerId);
        pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
        if (pointers.size === 1) {
            mouseXOnMouseDown = event.clientX;
            mouseYOnMouseDown = event.clientY;
            gestureMoved = false;
            dragging = true;
        } else if (pointers.size === 2) {
            dragging = false;
            gestureMoved = true;
            pinch = { dist: pinchDist(), z: targetCameraZ };
        }
    }

    function onPointerMove(event) {
        const prev = pointers.get(event.pointerId);
        if (!prev) return;
        pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
        if (pinch && pointers.size === 2) {
            // mở hai ngón ra → camera lại gần (phóng to)
            targetCameraZ = THREE.MathUtils.clamp(pinch.z * (pinch.dist / Math.max(pinchDist(), 1)), 0.65, 4);
        } else if (dragging) {
            dragDX += event.clientX - prev.x;
            dragDY += event.clientY - prev.y;
            if (Math.hypot(event.clientX - mouseXOnMouseDown, event.clientY - mouseYOnMouseDown) > 5) gestureMoved = true;
        }
    }

    function onPointerUp(event) {
        if (!pointers.delete(event.pointerId)) return;
        if (pointers.size < 2) pinch = null;
        if (pointers.size > 0) return; // còn ngón trên màn: chờ nhấc hết mới xoay/chạm lại
        dragging = false;
        if (gestureMoved || event.type === 'pointercancel') return; // là kéo/chụm, không phải chạm
        pointer.set((event.clientX / window.innerWidth) * 2 - 1, -(event.clientY / window.innerHeight) * 2 + 1);
        raycaster.setFromCamera(pointer, camera);
        const hit = raycaster.intersectObjects(clickables, false).find((h) => h.object.visible);
        if (hit && hit.object.userData.item) focus(hit.object.userData.item);
    }

    canvas.addEventListener('pointerdown', onPointerDown);
    canvas.addEventListener('pointermove', onPointerMove);
    canvas.addEventListener('pointerup', onPointerUp);
    canvas.addEventListener('pointercancel', onPointerUp);

    // Mouse wheel zoom: ~6% per notch, eased, clamped between just above the clouds and inside the star sphere
    canvas.addEventListener('wheel', (event) => {
        event.preventDefault();
        if (focused) return;
        const delta = event.deltaMode === 1 ? event.deltaY * 33 : event.deltaY; // Firefox reports lines
        targetCameraZ = THREE.MathUtils.clamp(targetCameraZ * Math.exp(delta * 0.0006), 0.65, 4);
    }, { passive: false });

    const render = () => {
        if (focused) {
            earthMesh.quaternion.slerp(targetQuaternion, 0.08);
            camera.position.z += (FOCUS_CAMERA_Z - camera.position.z) * 0.08;
        } else {
            if (dragging) {
                // Globe follows the cursor/finger: 1px of drag moves the surface ~1px, whatever the zoom
                const radPerPx = 2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * (camera.position.z - EARTH_RADIUS) / window.innerHeight / EARTH_RADIUS;
                targetRotationX = dragDX * radPerPx;
                targetRotationY = dragDY * radPerPx;
                dragDX = dragDY = 0;
            } else {
                // After release: glide (inertia) then settle back to the slow auto-spin
                targetRotationX += ((autoRotate ? DEFAULT_ROTATION_X : 0) - targetRotationX) * 0.05;
                targetRotationY += ((autoRotate ? DEFAULT_ROTATION_Y : 0) - targetRotationY) * 0.05;
            }
            camera.position.z += (targetCameraZ - camera.position.z) * 0.1;
            earthMesh.rotateOnWorldAxis(new THREE.Vector3(0, 1, 0), targetRotationX);
            earthMesh.rotateOnWorldAxis(new THREE.Vector3(1, 0, 0), targetRotationY);
            cloudMesh.rotateOnWorldAxis(new THREE.Vector3(0, 1, 0), targetRotationX);
            cloudMesh.rotateOnWorldAxis(new THREE.Vector3(1, 0, 0), targetRotationY);
        }
        updateLabels();
        renderer.render(scene, camera);
    }
    const animate = () => {
        requestAnimationFrame(animate);
        render();
    }
    animate();
}
window.onload = main;
