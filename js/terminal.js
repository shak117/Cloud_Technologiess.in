// Cloud Technologies - Interactive Developer CLI Terminal
// Provides an authentic cloud infrastructure terminal experience

class CloudTerminal {
  constructor(containerId, inputId, outputId) {
    this.container = document.getElementById(containerId);
    this.input = document.getElementById(inputId);
    this.output = document.getElementById(outputId);
    this.history = [];
    this.historyIndex = -1;
    this.isExecuting = false;

    this.commands = {
      help: this.cmdHelp.bind(this),
      plans: this.cmdPlans.bind(this),
      compare: this.cmdCompare.bind(this),
      ping: this.cmdPing.bind(this),
      status: this.cmdStatus.bind(this),
      specs: this.cmdSpecs.bind(this),
      deploy: this.cmdDeploy.bind(this),
      clear: this.cmdClear.bind(this),
      curl: this.cmdCurl.bind(this),
      whoami: this.cmdWhoami.bind(this)
    };

    this.init();
  }

  init() {
    if (!this.input || !this.output) return;

    this.input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        const cmd = this.input.value.trim();
        if (cmd) {
          this.history.push(cmd);
          this.historyIndex = this.history.length;
          this.execute(cmd);
          this.input.value = "";
        }
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        if (this.historyIndex > 0) {
          this.historyIndex--;
          this.input.value = this.history[this.historyIndex];
        }
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        if (this.historyIndex < this.history.length - 1) {
          this.historyIndex++;
          this.input.value = this.history[this.historyIndex];
        } else {
          this.historyIndex = this.history.length;
          this.input.value = "";
        }
      }
    });

    // Make entire terminal container focus input when clicked
    if (this.container) {
      this.container.addEventListener("click", () => {
        this.input.focus();
      });
    }

    // Print welcome banner
    this.printWelcome();
  }

  printWelcome() {
    const welcomeHtml = `
<div class="term-line term-accent">⚡ CLOUD TECHNOLOGIES EDGE CLI [v4.18.2-cloud]</div>
<div class="term-line text-muted">Tier-III Datacenter Cluster | Connected via Secure TLS 1.3</div>
<div class="term-line text-muted">Type <span class="term-highlight">'help'</span> or click the quick pills above to inspect infrastructure.</div>
<div class="term-divider"></div>
`;
    this.output.innerHTML = welcomeHtml;
  }

  execute(commandLine) {
    if (this.isExecuting) return;
    const parts = commandLine.trim().split(/\s+/);
    const command = parts[0].toLowerCase();
    const args = parts.slice(1);

    // Echo command
    this.appendOutput(`<div class="term-line"><span class="term-prompt">root@cloudtech-edge:~$</span> <span class="term-cmd">${this.escapeHtml(commandLine)}</span></div>`);

    if (this.commands[command]) {
      this.commands[command](args);
    } else {
      this.appendOutput(`<div class="term-line term-error">zsh: command not found: ${this.escapeHtml(command)}. Type <span class="term-highlight">'help'</span> for available commands.</div>`);
      this.scrollToBottom();
    }
  }

  appendOutput(html) {
    const wrapper = document.createElement("div");
    wrapper.innerHTML = html;
    this.output.appendChild(wrapper);
    this.scrollToBottom();
  }

  scrollToBottom() {
    if (this.output) {
      this.output.scrollTop = this.output.scrollHeight;
    }
  }

  escapeHtml(text) {
    const div = document.createElement("div");
    div.innerText = text;
    return div.innerHTML;
  }

  cmdHelp() {
    const helpText = `
<div class="term-block">
  <div class="term-line term-header">AVAILABLE INFRASTRUCTURE COMMANDS:</div>
  <table class="term-table">
    <tr><td class="term-key">plans</td><td>List all 6 official hosting tiers with pricing & resource specs</td></tr>
    <tr><td class="term-key">compare</td><td>Direct architectural breakdown: Static vs Dynamic vs E-Commerce</td></tr>
    <tr><td class="term-key">ping</td><td>Benchmark real-time edge latency to Tier-III cloud nodes</td></tr>
    <tr><td class="term-key">status</td><td>Live telemetry: NVMe array, DDoS shield, uptime & DNS status</td></tr>
    <tr><td class="term-key">specs</td><td>Hardware cluster details: AMD EPYC, PCIe 4.0 NVMe, 10Gbps Uplink</td></tr>
    <tr><td class="term-key">deploy</td><td>Launch the interactive deployment & domain onboarding wizard</td></tr>
    <tr><td class="term-key">curl</td><td>Simulate API query (e.g. <span class="term-highlight">curl /api/v1/plans</span>)</td></tr>
    <tr><td class="term-key">clear</td><td>Clear terminal output screen</td></tr>
  </table>
</div>`;
    this.appendOutput(helpText);
  }

  cmdPlans() {
    let html = `
<div class="term-block">
  <div class="term-line term-header">☁️ CLOUD TECHNOLOGIES - 6-TIER HOSTING CATALOG (ANNUAL)</div>
  <table class="term-table term-plans-table">
    <thead>
      <tr>
        <th>TIER</th>
        <th>PLAN</th>
        <th>ANNUAL</th>
        <th>MONTHLY</th>
        <th>STORAGE</th>
        <th>TRAFFIC</th>
        <th>BEST FOR</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td class="term-accent">T1</td>
        <td class="fw-bold">Lite</td>
        <td class="term-success">₹3,750</td>
        <td>₹312/mo</td>
        <td>5 GB SSD</td>
        <td>500/day</td>
        <td>Single-page / Portfolio / Digital card</td>
      </tr>
      <tr>
        <td class="term-accent">T2</td>
        <td class="fw-bold">Starter</td>
        <td class="term-success">₹5,000</td>
        <td>₹417/mo</td>
        <td>10 GB SSD</td>
        <td>1,500/day</td>
        <td>Local brochure & consultant sites</td>
      </tr>
      <tr>
        <td class="term-accent">T3</td>
        <td class="fw-bold text-cyan">Basic ★</td>
        <td class="term-success">₹7,500</td>
        <td>₹625/mo</td>
        <td>20 GB SSD</td>
        <td>3,000/day</td>
        <td>Dynamic CMS / WordPress / Lead portals</td>
      </tr>
      <tr>
        <td class="term-accent">T4</td>
        <td class="fw-bold text-purple">Pro 🔥</td>
        <td class="term-success">₹11,250</td>
        <td>₹938/mo</td>
        <td>40 GB SSD</td>
        <td>6,000/day</td>
        <td>Hotels, colleges, high-media portals</td>
      </tr>
      <tr>
        <td class="term-accent">T5</td>
        <td class="fw-bold text-emerald">Premium 🛒</td>
        <td class="term-success">₹18,750</td>
        <td>₹1,563/mo</td>
        <td>50 GB NVMe</td>
        <td>10,000+/day</td>
        <td>E-Commerce with UPI/Cards, live tracking</td>
      </tr>
      <tr>
        <td class="term-accent">T6</td>
        <td class="fw-bold text-amber">Enterprise ⚡</td>
        <td class="term-success">₹31,250</td>
        <td>₹2,604/mo</td>
        <td>100 GB NVMe</td>
        <td>25,000+/day</td>
        <td>High-volume D2C, festival rush, Anti-DDoS</td>
      </tr>
    </tbody>
  </table>
  <div class="term-line text-muted">Run <span class="term-highlight">'compare'</span> to see how Static and E-Commerce tiers differ technically.</div>
</div>`;
    this.appendOutput(html);
  }

  cmdCompare() {
    const html = `
<div class="term-block">
  <div class="term-line term-header">⚖️ HEAD-TO-HEAD: SINGLE STATIC WEBSITE vs ACTIVE E-COMMERCE</div>
  <table class="term-table">
    <thead>
      <tr>
        <th>METRIC</th>
        <th class="text-cyan">SINGLE STATIC (Lite/Starter)</th>
        <th class="text-emerald">ACTIVE E-COMMERCE (Premium/Enterprise)</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td class="term-key">Annual Cost</td>
        <td class="term-success">₹3,750 – ₹5,000 / year</td>
        <td class="term-success">₹18,750 – ₹31,250 / year</td>
      </tr>
      <tr>
        <td class="term-key">Monthly Breakdown</td>
        <td>≈ ₹312 – ₹417 / month</td>
        <td>≈ ₹1,563 – ₹2,604 / month</td>
      </tr>
      <tr>
        <td class="term-key">Storage Architecture</td>
        <td>5 GB – 10 GB Pure SSD</td>
        <td>50 GB – 100 GB High-Throughput NVMe SSD</td>
      </tr>
      <tr>
        <td class="term-key">Compute & Database</td>
        <td>Zero DB overhead, Pre-rendered HTML/CSS/JS</td>
        <td>Optimized relational DB, Redis session cache, ACID state</td>
      </tr>
      <tr>
        <td class="term-key">Transactions & Checkout</td>
        <td>None (Static forms to WhatsApp/Email)</td>
        <td>Full Shopping Cart, Zero-Timeout UPI & Card Gateway</td>
      </tr>
      <tr>
        <td class="term-key">Concurrent Traffic</td>
        <td>500 – 1,500 visits/day</td>
        <td>10,000 – 25,000+ active shoppers/day</td>
      </tr>
      <tr>
        <td class="term-key">Order Tracking</td>
        <td>N/A</td>
        <td>Live Google Maps GPS Dispatch & Delivery Webhooks</td>
      </tr>
      <tr>
        <td class="term-key">Backup Schedule</td>
        <td>Monthly snapshots</td>
        <td>Daily Automated Backups (Hourly during festival rush)</td>
      </tr>
      <tr>
        <td class="term-key">Security Shield</td>
        <td>Standard HTTPS & DNS Shield</td>
        <td>Hardened Anti-DDoS, Brute-Force & Bot Mitigation</td>
      </tr>
      <tr>
        <td class="term-key">Verdict</td>
        <td class="term-highlight">Best for personal brands, consultants, clinics</td>
        <td class="term-highlight">Engineered for real stores handling revenue & sales</td>
      </tr>
    </tbody>
  </table>
</div>`;
    this.appendOutput(html);
  }

  cmdPing() {
    this.isExecuting = true;
    this.appendOutput(`<div class="term-line text-cyan">Initiating ICMP handshake with Cloud Technologies Tier-III Edge Mesh...</div>`);

    const nodes = [
      { name: "DEL-EDGE-01 (Delhi Tier-III)", ip: "103.24.182.11" },
      { name: "BOM-EDGE-02 (Mumbai Cloud Hub)", ip: "103.24.183.45" },
      { name: "BLR-EDGE-01 (Bangalore Tech Center)", ip: "103.24.184.88" },
      { name: "SGP-TRANSIT-01 (Singapore Gateway)", ip: "147.75.80.12" }
    ];

    let i = 0;
    const interval = setInterval(() => {
      if (i < nodes.length) {
        const node = nodes[i];
        const ms = (Math.random() * 8 + (i === 3 ? 24 : 10)).toFixed(1);
        this.appendOutput(`<div class="term-line">64 bytes from ${node.ip} [${node.name}]: icmp_seq=${i + 1} ttl=58 <span class="term-success">time=${ms} ms</span></div>`);
        i++;
      } else {
        clearInterval(interval);
        this.appendOutput(`
<div class="term-line term-success">--- ping statistics: 4 packets transmitted, 4 received, 0% packet loss ---</div>
<div class="term-line text-muted">rtt min/avg/max = 9.8 / 14.2 / 28.6 ms | STATUS: OPTIMAL SLA</div>
`);
        this.isExecuting = false;
        this.scrollToBottom();
      }
    }, 280);
  }

  cmdStatus() {
    const statusHtml = `
<div class="term-block">
  <div class="term-line term-header">⚙️ CLOUD TECHNOLOGIES INFRASTRUCTURE TELEMETRY</div>
  <div class="term-line"><span class="term-key">Data Center Class:</span> <span class="term-success">Tier-III Verified Facility</span></div>
  <div class="term-line"><span class="term-key">Uptime SLA:</span> <span class="term-success">99.98% (Past 365 Days)</span></div>
  <div class="term-line"><span class="term-key">NVMe Storage Array:</span> <span class="term-success">HEALTHY (420,000 IOPS Available)</span></div>
  <div class="term-line"><span class="term-key">Edge SSL Gateways:</span> <span class="term-success">ACTIVE (Auto-Renewal TLS 1.3)</span></div>
  <div class="term-line"><span class="term-key">DDoS Threat Shield:</span> <span class="term-success">ENGAGED (L3/L4/L7 Scrubbing Active)</span></div>
  <div class="term-line"><span class="term-key">Deployment Pipeline:</span> <span class="term-success">READY (&lt; 24-Hour Complete Provisioning)</span></div>
</div>`;
    this.appendOutput(statusHtml);
  }

  cmdSpecs() {
    const specsHtml = `
<div class="term-block">
  <div class="term-line term-header">🖥️ HARDWARE & CLUSTER ARCHITECTURE</div>
  <div class="term-line"><span class="term-key">Processors:</span> Dual AMD EPYC 9654 (96 Cores / 192 Threads per Node)</div>
  <div class="term-line"><span class="term-key">Memory:</span> DDR5 ECC Registered @ 4800 MHz</div>
  <div class="term-line"><span class="term-key">Primary Storage:</span> Enterprise Kioxia / Samsung PCIe Gen4 NVMe (7,000 MB/s Read)</div>
  <div class="term-line"><span class="term-key">Networking:</span> Redundant 10Gbps SFP+ Uplinks per hypervisor</div>
  <div class="term-line"><span class="term-key">Virtualization:</span> KVM Kernel-based Virtualization with isolated cgroups</div>
  <div class="term-line"><span class="term-key">Backup Targets:</span> Geographically isolated secondary cold storage</div>
</div>`;
    this.appendOutput(specsHtml);
  }

  cmdDeploy(args) {
    const tier = args && args[0] ? args[0] : "basic";
    this.appendOutput(`<div class="term-line text-cyan">Opening deployment configuration modal for [${this.escapeHtml(tier)}]...</div>`);
    if (window.openDeploymentModal) {
      window.openDeploymentModal(tier);
    }
  }

  cmdCurl(args) {
    const endpoint = args && args[0] ? args[0] : "/api/v1/plans";
    if (endpoint.includes("plans")) {
      this.appendOutput(`
<pre class="term-code">
HTTP/2 200 OK
content-type: application/json; charset=utf-8
cache-control: public, max-age=3600

{
  "provider": "Cloud Technologies",
  "infrastructure": "Tier-III Cloud",
  "uptime_sla": "99.9%",
  "plans_count": 6,
  "lowest_tier": {"name": "Lite", "price_yr": 3750, "mo_equiv": 312},
  "ecommerce_tier": {"name": "Premium Pack", "price_yr": 18750, "features": ["UPI", "Cart", "Live Tracking"]},
  "enterprise_tier": {"name": "Enterprise Plan", "price_yr": 31250, "traffic": "25,000+/day"}
}
</pre>`);
    } else {
      this.appendOutput(`<div class="term-line text-muted">curl: (6) Could not resolve host: ${this.escapeHtml(endpoint)}</div>`);
    }
  }

  cmdWhoami() {
    this.appendOutput(`<div class="term-line">visitor@cloudtechnologies.in (Role: Prospective Cloud Client / Engineer)</div>`);
  }

  cmdClear() {
    this.output.innerHTML = "";
    this.printWelcome();
  }
}

if (typeof window !== 'undefined') {
  window.CloudTerminal = CloudTerminal;
}
