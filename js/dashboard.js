/* ============================================
   DASHBOARD - REAL-TIME DDOS MONITORING
   ============================================ */

// Dashboard State Management
const DashboardState = {
    currentMetric: 'bps',
    timeRange: '24h',
    updateInterval: null,
    chartData: {
        bps: [],
        pps: [],
        rps: []
    },
    historicalData: [],
    attackSources: [],
    mitigationStatus: {
        waf: true,
        'rate-limit': true,
        captcha: true,
        'geo-block': false
    }
};

let selectedIP = null;

// Initialize Dashboard
document.addEventListener('DOMContentLoaded', () => {
    if (window.location.pathname.includes('dashboard.html') || 
        window.location.pathname.endsWith('dashboard.html')) {
        initDashboard();
    }
});

/**
 * Initialize Dashboard Components
 */
function initDashboard() {
    // Initialize charts
    initTrafficChart();
    initProtocolChart();
    initAttackTypesChart();
    initBlockedAllowedChart();
    initTimelineChart();

    // Initialize attack sources table
    generateAttackSources();
    updateAttackSourcesTable();

    // Initialize real-time updates
    startRealTimeUpdates();

    // Setup event listeners
    setupEventListeners();

    // Initial data load
    updateAllMetrics();
    updateThreatStatus();
}

/**
 * Setup Event Listeners
 */
function setupEventListeners() {
    // Time range selector
    const timeRange = document.getElementById('time-range');
    if (timeRange) {
        timeRange.addEventListener('change', (e) => {
            DashboardState.timeRange = e.target.value;
            updateAllMetrics();
            updateTimelineChart();
        });
    }

    // Refresh button
    const refreshBtn = document.getElementById('refresh-btn');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', () => {
            updateAllMetrics();
            generateAttackSources();
            updateAttackSourcesTable();
            refreshBtn.textContent = 'Refreshed';
            setTimeout(() => {
                refreshBtn.textContent = 'Refresh';
            }, 2000);
        });
    }

    // Chart metric buttons
    const chartBtns = document.querySelectorAll('.chart-btn');
    chartBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            chartBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            DashboardState.currentMetric = btn.dataset.metric;
            updateTrafficChart();
        });
    });

    // Refresh sources button
    const refreshSourcesBtn = document.getElementById('refresh-sources-btn');
    if (refreshSourcesBtn) {
        refreshSourcesBtn.addEventListener('click', () => {
            generateAttackSources();
            updateAttackSourcesTable();
        });
    }
}

/**
 * Start Real-time Updates
 */
function startRealTimeUpdates() {
    // Update every 2 seconds
    DashboardState.updateInterval = setInterval(() => {
        updateAllMetrics();
        updateThreatStatus();
        updateTrafficChart();
        
        // Update attack sources every 10 seconds
        if (Math.random() > 0.8) {
            generateAttackSources();
            updateAttackSourcesTable();
        }
    }, 2000);
}

/**
 * Stop Real-time Updates
 */
function stopRealTimeUpdates() {
    if (DashboardState.updateInterval) {
        clearInterval(DashboardState.updateInterval);
    }
}

/**
 * Update All Metrics
 */
function updateAllMetrics() {
    // Generate realistic traffic data
    const bps = generateBPS();
    const pps = generatePPS();
    const rps = generateRPS();
    const blocked = generateBlocked();

    // Update metric cards
    updateMetricCard('bps', bps, formatBPS);
    updateMetricCard('pps', pps, formatPPS);
    updateMetricCard('rps', rps, formatRPS);
    updateMetricCard('blocked', blocked.count, (val) => val.toLocaleString());

    // Update blocked percentage
    const blockedPercent = ((blocked.count / (rps * 60)) * 100).toFixed(1);
    updateMetricChange('blocked', `${blockedPercent}% blocked`);

    // Store data for charts
    const timestamp = Date.now();
    DashboardState.chartData.bps.push({ timestamp, value: bps });
    DashboardState.chartData.pps.push({ timestamp, value: pps });
    DashboardState.chartData.rps.push({ timestamp, value: rps });

    // Keep only last 120 points (4 minutes at 2s intervals)
    Object.keys(DashboardState.chartData).forEach(key => {
        if (DashboardState.chartData[key].length > 120) {
            DashboardState.chartData[key].shift();
        }
    });
}

/**
 * Update Metric Card
 */
function updateMetricCard(metric, value, formatter) {
    const valueEl = document.getElementById(`${metric}-value`);
    const changeEl = document.getElementById(`${metric}-change`);
    const trendEl = document.getElementById(`${metric}-trend`);

    if (valueEl) {
        valueEl.textContent = formatter(value);
    }

    // Generate trend (simplified)
    const trend = Math.random() > 0.5 ? 'up' : 'down';
    const changePercent = (Math.random() * 10).toFixed(1);
    
    if (changeEl) {
        const sign = trend === 'up' ? '+' : '-';
        changeEl.textContent = `${sign}${changePercent}% from last hour`;
    }

    if (trendEl) {
        trendEl.className = `metric-trend ${trend}`;
        trendEl.textContent = trend === 'up' ? '^' : 'v';
    }
}

/**
 * Update Metric Change Text
 */
function updateMetricChange(metric, text) {
    const changeEl = document.getElementById(`${metric}-change`);
    if (changeEl) {
        changeEl.textContent = text;
    }
}

/**
 * Update Threat Status
 */
function updateThreatStatus() {
    const rps = generateRPS();
    const risk = calculateRisk(rps);
    
    const statusCard = document.getElementById('threat-status');
    const statusIcon = document.getElementById('status-icon');
    const statusTitle = document.getElementById('status-title');
    const statusDesc = document.getElementById('status-description');
    const threatLevel = document.getElementById('threat-level');

    let status = 'normal';
    let icon = 'OK';
    let title = 'System Normal';
    let description = 'No active threats detected. All systems operational.';
    let level = 'LOW';

    if (risk > 80) {
        status = 'attack';
        icon = 'ALERT';
        title = 'Under Attack!';
        description = 'High-intensity DDoS attack detected. Mitigation systems active.';
        level = 'CRITICAL';
    } else if (risk > 50) {
        status = 'suspicious';
        icon = 'WARN';
        title = 'Suspicious Activity';
        description = 'Unusual traffic patterns detected. Monitoring closely.';
        level = 'MEDIUM';
    }

    if (statusCard) {
        statusCard.className = `threat-status-card ${status}`;
    }
    if (statusIcon) {
        statusIcon.textContent = icon;
    }
    if (statusTitle) {
        statusTitle.textContent = title;
    }
    if (statusDesc) {
        statusDesc.textContent = description;
    }
    if (threatLevel) {
        threatLevel.textContent = level;
        threatLevel.style.color = status === 'attack' ? 'var(--accent-danger)' : 
                                   status === 'suspicious' ? 'var(--accent-warning)' : 
                                   'var(--accent-primary)';
    }

    // Update uptime and response time
    const uptimeEl = document.getElementById('uptime');
    const responseTimeEl = document.getElementById('response-time');
    
    if (uptimeEl) {
        uptimeEl.textContent = (99.9 + Math.random() * 0.09).toFixed(2) + '%';
    }
    if (responseTimeEl) {
        responseTimeEl.textContent = (10 + Math.random() * 10).toFixed(0) + 'ms';
    }
}

/**
 * Calculate Risk Level
 */
function calculateRisk(rps) {
    // Simulate risk based on traffic
    const baseRisk = Math.min(30, (rps / 1000) * 30);
    const spike = Math.random() > 0.7 ? Math.random() * 50 : 0;
    return Math.min(100, baseRisk + spike);
}

/**
 * Generate Traffic Data
 */
function generateBPS() {
    const base = 50000000; // 50 Mbps
    const variation = (Math.random() - 0.5) * 20000000;
    const spike = Math.random() > 0.85 ? Math.random() * 50000000 : 0;
    return Math.max(1000000, base + variation + spike);
}

function generatePPS() {
    const base = 10000;
    const variation = (Math.random() - 0.5) * 5000;
    const spike = Math.random() > 0.9 ? Math.random() * 50000 : 0;
    return Math.max(100, base + variation + spike);
}

function generateRPS() {
    const base = 500;
    const variation = (Math.random() - 0.5) * 200;
    const spike = Math.random() > 0.92 ? Math.random() * 5000 : 0;
    return Math.max(10, base + variation + spike);
}

function generateBlocked() {
    const blocked = Math.floor(Math.random() * 1000) + 100;
    return { count: blocked, percentage: (Math.random() * 10).toFixed(1) };
}

/**
 * Format Functions
 */
function formatBPS(bps) {
    if (bps >= 1000000000) return (bps / 1000000000).toFixed(2) + ' Gbps';
    if (bps >= 1000000) return (bps / 1000000).toFixed(2) + ' Mbps';
    if (bps >= 1000) return (bps / 1000).toFixed(2) + ' Kbps';
    return bps.toFixed(0) + ' B/s';
}

function formatPPS(pps) {
    if (pps >= 1000000) return (pps / 1000000).toFixed(2) + ' Mpps';
    if (pps >= 1000) return (pps / 1000).toFixed(2) + ' Kpps';
    return Math.round(pps) + ' pps';
}

function formatRPS(rps) {
    if (rps >= 1000) return (rps / 1000).toFixed(2) + ' Kreq/s';
    return Math.round(rps) + ' req/s';
}

/**
 * Initialize Traffic Chart
 */
function initTrafficChart() {
    const canvas = document.getElementById('traffic-chart');
    if (!canvas) return;

    canvas.width = canvas.offsetWidth;
    canvas.height = 300;
    updateTrafficChart();
}

function updateTrafficChart() {
    const canvas = document.getElementById('traffic-chart');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    const padding = 60;
    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;

    ctx.clearRect(0, 0, width, height);

    const data = DashboardState.chartData[DashboardState.currentMetric] || [];
    if (data.length === 0) return;

    const values = data.map(d => d.value);
    const min = Math.min(...values);
    const max = Math.max(...values) || 1;
    const range = max - min || 1;

    // Draw grid
    ctx.strokeStyle = document.body.classList.contains('light-mode') 
        ? 'rgba(9, 105, 218, 0.1)' 
        : 'rgba(0, 255, 136, 0.1)';
    ctx.lineWidth = 1;

    for (let i = 0; i <= 5; i++) {
        const y = padding + (chartHeight / 5) * i;
        ctx.beginPath();
        ctx.moveTo(padding, y);
        ctx.lineTo(width - padding, y);
        ctx.stroke();
    }

    // Draw line
    const isLight = document.body.classList.contains('light-mode');
    ctx.strokeStyle = isLight ? '#0969da' : '#00ff88';
    ctx.fillStyle = isLight ? 'rgba(9, 105, 218, 0.2)' : 'rgba(0, 255, 136, 0.2)';
    ctx.lineWidth = 2;

    ctx.beginPath();
    data.forEach((point, index) => {
        const x = padding + (chartWidth / (data.length - 1 || 1)) * index;
        const y = padding + chartHeight - ((point.value - min) / range) * chartHeight;

        if (index === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    });

    // Fill area
    ctx.lineTo(width - padding, height - padding);
    ctx.lineTo(padding, height - padding);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Draw points
    ctx.fillStyle = isLight ? '#0969da' : '#00ff88';
    data.forEach((point, index) => {
        const x = padding + (chartWidth / (data.length - 1 || 1)) * index;
        const y = padding + chartHeight - ((point.value - min) / range) * chartHeight;
        ctx.beginPath();
        ctx.arc(x, y, 3, 0, Math.PI * 2);
        ctx.fill();
    });

    // Labels
    ctx.fillStyle = isLight ? '#24292f' : '#e6edf3';
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText(formatValue(max, DashboardState.currentMetric), padding - 10, padding + 5);
    ctx.fillText(formatValue(min, DashboardState.currentMetric), padding - 10, height - padding + 5);
}

function formatValue(value, metric) {
    switch(metric) {
        case 'bps': return formatBPS(value);
        case 'pps': return formatPPS(value);
        case 'rps': return formatRPS(value);
        default: return value.toLocaleString();
    }
}

/**
 * Initialize Protocol Chart
 */
function initProtocolChart() {
    const canvas = document.getElementById('protocol-chart');
    if (!canvas) return;

    canvas.width = canvas.offsetWidth;
    canvas.height = 300;
    updateProtocolChart();
}

function updateProtocolChart() {
    const canvas = document.getElementById('protocol-chart');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) / 2 - 40;

    ctx.clearRect(0, 0, width, height);

    const protocols = [
        { name: 'TCP', value: 45, color: '#00ff88' },
        { name: 'UDP', value: 25, color: '#00d4ff' },
        { name: 'HTTP', value: 20, color: '#58a6ff' },
        { name: 'ICMP', value: 10, color: '#ffaa00' }
    ];

    const total = protocols.reduce((sum, p) => sum + p.value, 0);
    let currentAngle = -Math.PI / 2;

    // Draw pie chart
    protocols.forEach(protocol => {
        const sliceAngle = (protocol.value / total) * 2 * Math.PI;
        
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + sliceAngle);
        ctx.closePath();
        ctx.fillStyle = protocol.color;
        ctx.fill();
        ctx.strokeStyle = document.body.classList.contains('light-mode') ? '#ffffff' : '#0a0e1a';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Label
        const labelAngle = currentAngle + sliceAngle / 2;
        const labelX = centerX + Math.cos(labelAngle) * (radius * 0.7);
        const labelY = centerY + Math.sin(labelAngle) * (radius * 0.7);
        
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 14px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(protocol.name, labelX, labelY - 5);
        ctx.fillText(protocol.value + '%', labelX, labelY + 10);

        currentAngle += sliceAngle;
    });

    // Legend
    let legendY = 20;
    protocols.forEach(protocol => {
        ctx.fillStyle = protocol.color;
        ctx.fillRect(20, legendY, 15, 15);
        ctx.fillStyle = document.body.classList.contains('light-mode') ? '#24292f' : '#e6edf3';
        ctx.font = '12px sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText(`${protocol.name}: ${protocol.value}%`, 40, legendY + 12);
        legendY += 25;
    });
}

/**
 * Initialize Attack Types Chart
 */
function initAttackTypesChart() {
    const canvas = document.getElementById('attack-types-chart');
    if (!canvas) return;

    canvas.width = canvas.offsetWidth;
    canvas.height = 300;
    updateAttackTypesChart();
}

function updateAttackTypesChart() {
    const canvas = document.getElementById('attack-types-chart');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    const padding = 40;
    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;

    ctx.clearRect(0, 0, width, height);

    const attacks = [
        { name: 'SYN Flood', value: Math.random() * 100 },
        { name: 'UDP Flood', value: Math.random() * 80 },
        { name: 'HTTP Flood', value: Math.random() * 60 },
        { name: 'Slowloris', value: Math.random() * 40 }
    ];

    const max = Math.max(...attacks.map(a => a.value)) || 1;
    const barWidth = chartWidth / attacks.length - 20;
    const colors = ['#ff4444', '#ffaa00', '#58a6ff', '#00ff88'];

    attacks.forEach((attack, index) => {
        const barHeight = (attack.value / max) * chartHeight;
        const x = padding + index * (chartWidth / attacks.length) + 10;
        const y = height - padding - barHeight;

        // Bar
        ctx.fillStyle = colors[index];
        ctx.fillRect(x, y, barWidth, barHeight);

        // Label
        ctx.fillStyle = document.body.classList.contains('light-mode') ? '#24292f' : '#e6edf3';
        ctx.font = '10px sans-serif';
        ctx.textAlign = 'center';
        ctx.save();
        ctx.translate(x + barWidth / 2, height - padding + 15);
        ctx.rotate(-Math.PI / 4);
        ctx.fillText(attack.name, 0, 0);
        ctx.restore();

        // Value
        ctx.fillStyle = colors[index];
        ctx.font = 'bold 12px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(Math.round(attack.value).toString(), x + barWidth / 2, y - 5);
    });
}

/**
 * Initialize Blocked vs Allowed Chart
 */
function initBlockedAllowedChart() {
    const canvas = document.getElementById('blocked-allowed-chart');
    if (!canvas) return;

    canvas.width = canvas.offsetWidth;
    canvas.height = 300;
    updateBlockedAllowedChart();
}

function updateBlockedAllowedChart() {
    const canvas = document.getElementById('blocked-allowed-chart');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) / 2 - 40;

    ctx.clearRect(0, 0, width, height);

    const blocked = Math.random() * 30 + 10;
    const allowed = 100 - blocked;

    // Draw donut chart
    const blockedAngle = (blocked / 100) * 2 * Math.PI;
    let currentAngle = -Math.PI / 2;

    // Blocked
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + blockedAngle);
    ctx.arc(centerX, centerY, radius * 0.6, currentAngle + blockedAngle, currentAngle, true);
    ctx.closePath();
    ctx.fillStyle = '#ff4444';
    ctx.fill();
    ctx.strokeStyle = document.body.classList.contains('light-mode') ? '#ffffff' : '#0a0e1a';
    ctx.lineWidth = 2;
    ctx.stroke();

    currentAngle += blockedAngle;

    // Allowed
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + (allowed / 100) * 2 * Math.PI);
    ctx.arc(centerX, centerY, radius * 0.6, currentAngle + (allowed / 100) * 2 * Math.PI, currentAngle, true);
    ctx.closePath();
    ctx.fillStyle = '#00ff88';
    ctx.fill();
    ctx.stroke();

    // Center text
    ctx.fillStyle = document.body.classList.contains('light-mode') ? '#24292f' : '#e6edf3';
    ctx.font = 'bold 24px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(blocked.toFixed(1) + '%', centerX, centerY - 10);
    ctx.font = '14px sans-serif';
    ctx.fillText('Blocked', centerX, centerY + 15);
}

/**
 * Initialize Timeline Chart
 */
function initTimelineChart() {
    const canvas = document.getElementById('timeline-chart');
    if (!canvas) return;

    canvas.width = canvas.offsetWidth;
    canvas.height = 300;
    updateTimelineChart();
}

function updateTimelineChart() {
    const canvas = document.getElementById('timeline-chart');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    const padding = 40;
    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;

    ctx.clearRect(0, 0, width, height);

    // Generate timeline data for last 24 hours
    const hours = 24;
    const data = [];
    for (let i = 0; i < hours; i++) {
        data.push({
            time: i,
            attacks: Math.random() > 0.7 ? Math.random() * 10 : 0
        });
    }

    const maxAttacks = Math.max(...data.map(d => d.attacks)) || 1;

    // Draw bars
    const barWidth = chartWidth / hours - 2;
    data.forEach((point, index) => {
        if (point.attacks > 0) {
            const barHeight = (point.attacks / maxAttacks) * chartHeight;
            const x = padding + index * (chartWidth / hours);
            const y = height - padding - barHeight;

            ctx.fillStyle = point.attacks > 5 ? '#ff4444' : '#ffaa00';
            ctx.fillRect(x, y, barWidth, barHeight);
        }

        // Hour labels every 6 hours
        if (index % 6 === 0) {
            ctx.fillStyle = document.body.classList.contains('light-mode') ? '#57606a' : '#8b949e';
            ctx.font = '10px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(index + 'h', padding + index * (chartWidth / hours) + barWidth / 2, height - padding + 20);
        }
    });
}

/**
 * Generate Attack Sources
 */
function generateAttackSources() {
    const countries = [
        { code: 'US', name: 'United States', asn: 'AS15169' },
        { code: 'CN', name: 'China', asn: 'AS4837' },
        { code: 'RU', name: 'Russia', asn: 'AS8359' },
        { code: 'BR', name: 'Brazil', asn: 'AS28573' },
        { code: 'IN', name: 'India', asn: 'AS9498' },
        { code: 'DE', name: 'Germany', asn: 'AS3320' },
        { code: 'FR', name: 'France', asn: 'AS3215' },
        { code: 'UK', name: 'United Kingdom', asn: 'AS2856' }
    ];

    DashboardState.attackSources = Array.from({ length: 8 }, () => {
        const country = countries[Math.floor(Math.random() * countries.length)];
        return {
            ip: generateRandomIP(),
            country: country.code,
            countryName: country.name,
            asn: country.asn,
            threats: Math.floor(Math.random() * 1000) + 1,
            lastSeen: Math.floor(Math.random() * 60) + 1,
            threatLevel: Math.random() > 0.7 ? 'high' : Math.random() > 0.5 ? 'medium' : 'low'
        };
    }).sort((a, b) => b.threats - a.threats);
}

function generateRandomIP() {
    return `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`;
}

/**
 * Update Attack Sources Table
 */
function updateAttackSourcesTable() {
    const tbody = document.getElementById('sources-tbody');
    if (!tbody) return;

    tbody.innerHTML = DashboardState.attackSources.map(source => `
        <tr>
            <td>
                <span class="ip-address" onclick="showIPDetails('${source.ip}')">${source.ip}</span>
            </td>
            <td>
                <span class="country-flag">${source.country}</span>
                ${source.countryName}
            </td>
            <td>${source.asn}</td>
            <td>
                <span class="threat-badge ${source.threatLevel}">${source.threatLevel.toUpperCase()}</span>
            </td>
            <td>${source.lastSeen} min ago</td>
            <td>
                <button class="action-btn" onclick="blockIPAddress('${source.ip}')">Block</button>
                <button class="action-btn" onclick="showIPDetails('${source.ip}')">Details</button>
            </td>
        </tr>
    `).join('');
}

/**
 * Toggle Mitigation
 */
function toggleMitigation(mitigation) {
    const currentStatus = DashboardState.mitigationStatus[mitigation];
    DashboardState.mitigationStatus[mitigation] = !currentStatus;

    const card = document.getElementById(`${mitigation}-status`);
    const toggle = card?.querySelector('.mitigation-toggle');
    const status = card?.querySelector('.mitigation-status');

    if (card && toggle && status) {
        if (!currentStatus) {
            toggle.textContent = 'ON';
            toggle.classList.remove('off');
            status.textContent = 'Active';
            status.classList.remove('inactive');
            status.classList.add('active');
        } else {
            toggle.textContent = 'OFF';
            toggle.classList.add('off');
            status.textContent = 'Inactive';
            status.classList.remove('active');
            status.classList.add('inactive');
        }
    }
}

/**
 * Show IP Details Modal
 */
function showIPDetails(ip) {
    const modal = document.getElementById('ip-details-modal');
    const body = document.getElementById('ip-details-body');
    
    if (!modal || !body) return;

    const source = DashboardState.attackSources.find(s => s.ip === ip);
    if (!source) return;

    selectedIP = source.ip;

    body.innerHTML = `
        <div class="ip-detail-section">
            <h3>IP Address Information</h3>
            <p><strong>IP:</strong> ${source.ip}</p>
            <p><strong>Country:</strong> ${source.country} ${source.countryName}</p>
            <p><strong>ASN:</strong> ${source.asn}</p>
            <p><strong>Threat Level:</strong> <span class="threat-badge ${source.threatLevel}">${source.threatLevel.toUpperCase()}</span></p>
            <p><strong>Total Threats:</strong> ${source.threats.toLocaleString()}</p>
            <p><strong>Last Seen:</strong> ${source.lastSeen} minutes ago</p>
        </div>
        <div class="ip-detail-section">
            <h3>Recent Activity</h3>
            <p>Attack patterns detected: SYN Flood, UDP Flood</p>
            <p>Request rate: ${(source.threats * 10).toLocaleString()} req/min</p>
            <p>Packet rate: ${(source.threats * 50).toLocaleString()} pps</p>
        </div>
    `;

    modal.classList.add('show');
}

/**
 * Close Modal
 */
function closeModal() {
    const modal = document.getElementById('ip-details-modal');
    if (modal) {
        modal.classList.remove('show');
    }
}

/**
 * Block IP Address
 */
function blockIPAddress(ip) {
    const targetIP = ip || selectedIP;
    if (!targetIP) return;

    if (confirm(`Are you sure you want to block IP address ${targetIP}?`)) {
        alert(`IP address ${targetIP} has been blocked successfully.`);
        generateAttackSources();
        updateAttackSourcesTable();
        closeModal();
        selectedIP = null;
    }
}

// Close modal on outside click
window.addEventListener('click', (e) => {
    const modal = document.getElementById('ip-details-modal');
    if (e.target === modal) {
        closeModal();
    }
});

// Stop updates when leaving page
window.addEventListener('beforeunload', () => {
    stopRealTimeUpdates();
});

