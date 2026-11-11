// ==========================================
// 1. DOM ELEMENT CACHING (Optimasi Performa)
// ==========================================
const DOM = {
    pcName: document.getElementById('pc-name'),
    clock: document.getElementById('digital-clock'),
    status: document.getElementById('connection-status'),
    wakeBtn: document.getElementById('wake-lock-btn'),

    // CPU
    cpuModel: document.getElementById('cpu-model'),
    cpuUsage: document.getElementById('cpu-usage'),
    cpuClock: document.getElementById('cpu-clock'),
    cpuCores: document.getElementById('cpu-cores'),
    cpuBar: document.getElementById('cpu-bar'),

    // RAM
    ramUsagePercent: document.getElementById('ram-usage-percent'),
    ramUsageText: document.getElementById('ram-usage-text'),
    ramUsed: document.getElementById('ram-used'),
    ramAvail: document.getElementById('ram-avail'),
    ramBar: document.getElementById('ram-bar'),

    // GPU
    gpuName: document.getElementById('gpu-name'),
    gpuUsage: document.getElementById('gpu-usage'),
    gpuTemp: document.getElementById('gpu-temp'),
    gpuVram: document.getElementById('gpu-vram'),
    gpuBar: document.getElementById('gpu-bar'),

    // Active Session & Network & Storage
    activeApp: document.getElementById('active-app-name'),
    activeWindow: document.getElementById('active-window-title'),
    monitorList: document.getElementById('monitor-list'),
    netDl: document.getElementById('net-dl'),
    netUl: document.getElementById('net-ul'),
    netTotalDl: document.getElementById('net-total-dl'),
    netTotalUl: document.getElementById('net-total-ul'),
    storageList: document.getElementById('storage-list'),
    processList: document.getElementById('process-list')
};

// ==========================================
// 2. DIGITAL CLOCK (Standalone Client)
// ==========================================
function updateClock() {
    const now = new Date();
    const timeStr = now.toLocaleTimeString('en-GB', { hour12: false });
    const dateStr = now.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });
    DOM.clock.innerText = `${timeStr} • ${dateStr}`;
}
setInterval(updateClock, 1000);
updateClock();

// ==========================================
// 3. SCREEN WAKE LOCK API (⚡ Keep On)
// ==========================================
let wakeLock = null;
let isKeepOn = false;

async function requestWakeLock() {
    if ('wakeLock' in navigator) {
        try {
            wakeLock = await navigator.wakeLock.request('screen');
            DOM.wakeBtn.innerText = '⚡ Keep On: ON';
            DOM.wakeBtn.classList.add('active');
            isKeepOn = true;
            wakeLock.addEventListener('release', () => {
                if (isKeepOn) requestWakeLock();
            });
        } catch (err) {
            console.error(err);
        }
    } else {
        DOM.wakeBtn.innerText = 'Wake Lock Unsupported';
        DOM.wakeBtn.disabled = true;
    }
}

function releaseWakeLock() {
    if (wakeLock !== null) {
        wakeLock.release().then(() => {
            wakeLock = null;
            isKeepOn = false;
            DOM.wakeBtn.innerText = '⚡ Keep On: OFF';
            DOM.wakeBtn.classList.remove('active');
        });
    }
}

DOM.wakeBtn.addEventListener('click', () => {
    isKeepOn ? releaseWakeLock() : requestWakeLock();
});

document.addEventListener('visibilitychange', () => {
    if (wakeLock !== null && document.visibilityState === 'visible' && isKeepOn) {
        requestWakeLock();
    }
});

// ==========================================
// 4. WEBSOCKET & LIGHTWEIGHT DOM UPDATER
// ==========================================
let ws;
let reconnectInterval = 1000;

function getStatusColor(percent) {
    if (percent < 60) return 'var(--col-normal)';
    if (percent < 85) return 'var(--col-warn)';
    return 'var(--col-danger)';
}

function connectWebSocket() {
    DOM.status.className = 'status-badge status-connecting';
    DOM.status.innerText = 'CONNECTING';

    const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    ws = new WebSocket(`${wsProtocol}//${window.location.host}/ws`);

    ws.onopen = () => {
        DOM.status.className = 'status-badge status-connected';
        DOM.status.innerText = 'CONNECTED';
        reconnectInterval = 1000;
    };

    ws.onmessage = (event) => {
        const msg = JSON.parse(event.data);
        if (msg.type === 'init') {
            DOM.pcName.innerText = msg.pc_name;
        } else if (msg.type === 'update') {
            renderDashboard(msg.data);
        }
    };

    ws.onclose = () => {
        DOM.status.className = 'status-badge status-disconnected';
        DOM.status.innerText = 'DISCONNECTED';
        setTimeout(connectWebSocket, reconnectInterval);
        reconnectInterval = Math.min(reconnectInterval * 1.5, 10000);
    };

    ws.onerror = () => ws.close();
}

function renderDashboard(data) {
    // 1. CPU Update
    if (data.cpu) {
        DOM.cpuModel.innerText = data.cpu.model;
        DOM.cpuUsage.innerText = `${data.cpu.usage_percent}%`;
        DOM.cpuClock.innerText = data.cpu.clock_speed_ghz;
        DOM.cpuCores.innerText = `${data.cpu.physical_cores} / ${data.cpu.logical_cores}`;
        DOM.cpuBar.style.width = `${data.cpu.usage_percent}%`;
        DOM.cpuBar.style.backgroundColor = getStatusColor(data.cpu.usage_percent);
    }

    // 2. RAM Update
    if (data.ram) {
        DOM.ramUsagePercent.innerText = `${data.ram.usage_percent}%`;
        DOM.ramUsageText.innerText = `${data.ram.used_gb} GB / ${data.ram.total_gb} GB`;
        DOM.ramUsed.innerText = data.ram.used_gb;
        DOM.ramAvail.innerText = data.ram.available_gb;
        DOM.ramBar.style.width = `${data.ram.usage_percent}%`;
        DOM.ramBar.style.backgroundColor = getStatusColor(data.ram.usage_percent);
    }

    // 3. GPU Update
    if (data.gpu) {
        DOM.gpuName.innerText = data.gpu.name;
        if (data.gpu.supported) {
            DOM.gpuUsage.innerText = `${data.gpu.usage_percent}%`;
            DOM.gpuTemp.innerText = data.gpu.temp_c;
            DOM.gpuVram.innerText = `${data.gpu.vram_used_gb} / ${data.gpu.vram_total_gb}`;
            DOM.gpuBar.style.width = `${data.gpu.usage_percent}%`;
            DOM.gpuBar.style.backgroundColor = getStatusColor(data.gpu.usage_percent);
        } else {
            DOM.gpuUsage.innerText = 'N/A';
            DOM.gpuTemp.innerText = '-';
            DOM.gpuVram.innerText = '- / -';
        }
    }

    // 4. Network Update
    if (data.network) {
        DOM.netDl.innerText = `${data.network.dl_speed_mbs} MB/s`;
        DOM.netUl.innerText = `${data.network.ul_speed_mbs} MB/s`;
        DOM.netTotalDl.innerText = `Total: ${data.network.total_dl_gb} GB`;
        DOM.netTotalUl.innerText = `Total: ${data.network.total_ul_gb} GB`;
    }

    // 5. Active App & Display Update
    if (data.display) {
        DOM.activeApp.innerText = data.display.active_app_name || "-";
        DOM.activeWindow.innerText = data.display.active_window_title || "-";
        
        if (data.display.monitors.length > 0) {
            DOM.monitorList.innerHTML = data.display.monitors.map((m, i) => 
                `<div>Display ${i+1}: <strong>${m.resolution} @ ${m.refresh_rate}</strong></div>`
            ).join('');
        }
    }

    // 6. Top Processes Update
    if (data.processes) {
        DOM.processList.innerHTML = data.processes.map(p => `
            <tr>
                <td>${p.pid}</td>
                <td><strong>${p.name}</strong></td>
                <td>${p.cpu_percent}%</td>
                <td>${p.memory_mb} MB</td>
            </tr>
        `).join('');
    }

    // 7. Storage Update (Setiap 5 Detik dari Server)
    if (data.storage) {
        DOM.storageList.innerHTML = data.storage.map(s => `
            <div class="storage-item">
                <div class="storage-info">
                    <span><strong>${s.device}</strong> (${s.used_gb}/${s.total_gb} GB)</span>
                    <span>${s.percent}%</span>
                </div>
                <div class="progress-container" style="margin-bottom:0; height:6px;">
                    <div class="progress-fill" style="width: ${s.percent}%; background-color: ${getStatusColor(s.percent)}"></div>
                </div>
            </div>
        `).join('');
    }
}

// Service Worker PWA Register
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/frontend/service-worker.js').catch(err => console.log('SW Fail:', err));
    });
}

// Jalankan Koneksi Utama
connectWebSocket();