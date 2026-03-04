/**
 * portfolio.js — Tiered Portfolio Filter System
 * Juno Atelier · Vanilla HTML/CSS/JS Conversion
 *
 * Implements 3-tier filtering: Industry → Client → Deliverables
 * Data structure based on Company Profile document
 */

// ============================================
// PORTFOLIO DATA (Scalable JSON Structure)
// ============================================
const portfolioData = {
  industries: [
    {
      id: 'tech-startups',
      name: 'Technology & Startups',
      icon: '🚀',
      clients: [
        {
          id: 'fintech-labs',
          name: 'FinTech Labs',
          projectType: 'Brand Launch',
          year: '2024',
          deliverables: [
            { type: 'logo',            title: 'Logo Design',     description: 'Custom geometric mark',    icon: '🎨' },
            { type: 'brand-assets',    title: 'Brand Assets',    description: 'Complete asset library',   icon: '📦' },
            { type: 'typography',      title: 'Typography',      description: 'Custom type system',       icon: 'Aa' },
            { type: 'website',         title: 'Website',         description: 'Investor-ready site',      url: 'https://example.com/fintech-labs', icon: '🌐' },
            { type: 'company-profile', title: 'Company Profile', description: '16-page pitch deck',       icon: '📄' },
            { type: 'posters',         title: 'Posters',         description: 'Launch campaign',          icon: '🖼️' },
          ],
        },
        {
          id: 'safaricom-ventures',
          name: 'Safaricom Ventures',
          projectType: 'Brand Evolution',
          year: '2023',
          deliverables: [
            { type: 'logo',         title: 'Logo Refresh', description: 'Modernized mark',      icon: '🎨' },
            { type: 'brand-assets', title: 'Brand System', description: 'Complete guidelines',  icon: '📦' },
            { type: 'typography',   title: 'Typography',   description: 'Digital-first type',   icon: 'Aa' },
            { type: 'website',      title: 'Microsite',    description: 'Portfolio site',        url: 'https://example.com/safaricom-v', icon: '🌐' },
          ],
        },
      ],
    },
    {
      id: 'professional-services',
      name: 'Professional Services',
      icon: '⚖️',
      clients: [
        {
          id: 'ameli-law',
          name: 'Ameli & Associates',
          projectType: 'Legal Branding',
          year: '2024',
          deliverables: [
            { type: 'logo',            title: 'Logo Design',     description: 'Sovereign mark',         icon: '🎨' },
            { type: 'brand-assets',    title: 'Brand Assets',    description: 'Pattern & icons',         icon: '📦' },
            { type: 'typography',      title: 'Typography',      description: 'Serif + sans',            icon: 'Aa' },
            { type: 'company-profile', title: 'Company Profile', description: '24-page capabilities',    icon: '📄' },
            { type: 'stationery',      title: 'Stationery',      description: 'Letterhead + cards',      icon: '✉️' },
          ],
        },
        {
          id: 'kpmg-consulting',
          name: 'KPMG Consulting',
          projectType: 'Internal Rebrand',
          year: '2023',
          deliverables: [
            { type: 'logo',            title: 'Sub-brand Logo',  description: 'Consulting division',    icon: '🎨' },
            { type: 'brand-assets',    title: 'Asset Library',   description: 'PPT templates',          icon: '📦' },
            { type: 'company-profile', title: 'Annual Report',   description: '65-page report',         icon: '📄' },
            { type: 'posters',         title: 'Posters',         description: 'Internal campaign',      icon: '🖼️' },
          ],
        },
      ],
    },
    {
      id: 'ngos-development',
      name: 'NGOs & Development',
      icon: '🌍',
      clients: [
        {
          id: 'amref-health',
          name: 'Amref Health Africa',
          projectType: 'Donor Report',
          year: '2024',
          deliverables: [
            { type: 'logo',            title: 'Logo Usage',       description: 'Sub-brand guidelines',  icon: '🎨' },
            { type: 'company-profile', title: 'Annual Report',    description: 'Impact document',       icon: '📄' },
            { type: 'brand-assets',    title: 'Brand Guidelines', description: 'Donor materials',       icon: '📦' },
            { type: 'posters',         title: 'Campaign Posters', description: 'Health awareness',      icon: '🖼️' },
          ],
        },
        {
          id: 'undp-kenya',
          name: 'UNDP Kenya',
          projectType: 'Programme Branding',
          year: '2023',
          deliverables: [
            { type: 'brand-assets',    title: 'Brand System',    description: 'Programme identity',    icon: '📦' },
            { type: 'typography',      title: 'Typography',      description: 'Accessible type',        icon: 'Aa' },
            { type: 'company-profile', title: 'Country Report',  description: '56-page document',      icon: '📄' },
            { type: 'posters',         title: 'SDG Posters',     description: 'Campaign series',        icon: '🖼️' },
            { type: 'website',         title: 'Microsite',       description: 'Programme site',         url: 'https://example.com/undp', icon: '🌐' },
          ],
        },
      ],
    },
    {
      id: 'hospitality-retail',
      name: 'Hospitality & Retail',
      icon: '🏨',
      clients: [
        {
          id: 'tribe-hotel',
          name: 'Tribe Hotel',
          projectType: 'Luxury Rebrand',
          year: '2024',
          deliverables: [
            { type: 'logo',         title: 'Logo Design',  description: 'Luxury mark',         icon: '🎨' },
            { type: 'brand-assets', title: 'Brand System', description: 'Complete identity',   icon: '📦' },
            { type: 'typography',   title: 'Typography',   description: 'Elegant serif',        icon: 'Aa' },
            { type: 'posters',      title: 'Event Posters',description: 'Hotel promotions',    icon: '🖼️' },
            { type: 'stationery',   title: 'Stationery',   description: 'Premium suite',       icon: '✉️' },
          ],
        },
        {
          id: 'java-coffee',
          name: 'Java Coffee House',
          projectType: 'Chain Refresh',
          year: '2023',
          deliverables: [
            { type: 'logo',         title: 'Logo Refresh', description: 'Modernized mark',    icon: '🎨' },
            { type: 'brand-assets', title: 'Asset Library',description: 'Patterns & icons',  icon: '📦' },
            { type: 'typography',   title: 'Typography',   description: 'Menu type system',   icon: 'Aa' },
            { type: 'posters',      title: 'Menu Posters', description: 'Seasonal specials',  icon: '🖼️' },
            { type: 'website',      title: 'Website',      description: 'E-commerce site',    url: 'https://example.com/java', icon: '🌐' },
          ],
        },
      ],
    },
    {
      id: 'creative-industries',
      name: 'Creative Industries',
      icon: '🎨',
      clients: [
        {
          id: 'kuona-trust',
          name: 'Kuona Trust',
          projectType: 'Arts Rebrand',
          year: '2024',
          deliverables: [
            { type: 'logo',         title: 'Logo Design',        description: 'Artistic mark',      icon: '🎨' },
            { type: 'brand-assets', title: 'Brand System',       description: 'Flexible identity',  icon: '📦' },
            { type: 'typography',   title: 'Typography',         description: 'Expressive type',    icon: 'Aa' },
            { type: 'posters',      title: 'Exhibition Posters', description: 'Gallery shows',      icon: '🖼️' },
            { type: 'website',      title: 'Portfolio Site',     description: 'Artist platform',    url: 'https://example.com/kuona', icon: '🌐' },
          ],
        },
      ],
    },
    {
      id: 'corporate',
      name: 'Corporate',
      icon: '🏢',
      clients: [
        {
          id: 'equity-bank',
          name: 'Equity Group',
          projectType: 'Internal Comms',
          year: '2023',
          deliverables: [
            { type: 'brand-assets',    title: 'Brand Guidelines', description: 'Employee handbook',  icon: '📦' },
            { type: 'company-profile', title: 'Annual Report',    description: 'Corporate report',   icon: '📄' },
            { type: 'posters',         title: 'Internal Posters', description: 'Campaigns',          icon: '🖼️' },
            { type: 'stationery',      title: 'Corporate Suite',  description: 'Executive materials',icon: '✉️' },
          ],
        },
      ],
    },
    {
      id: 'coaches-consultants',
      name: 'Coaches & Consultants',
      icon: '🎯',
      clients: [
        {
          id: 'leadership-lab',
          name: 'Leadership Lab',
          projectType: 'Executive Coaching Brand',
          year: '2024',
          deliverables: [
            { type: 'logo',            title: 'Logo Design',     description: 'Approachable mark',  icon: '🎨' },
            { type: 'brand-assets',    title: 'Personal Brand Kit', description: 'LinkedIn assets', icon: '📦' },
            { type: 'typography',      title: 'Typography',      description: 'Professional type',  icon: 'Aa' },
            { type: 'website',         title: 'Landing Page',    description: 'Consultant site',    url: '#', icon: '🌐' },
            { type: 'company-profile', title: 'Speaker Deck',    description: 'Pitch materials',    icon: '📄' },
          ],
        },
        {
          id: 'growth-partners',
          name: 'Growth Partners',
          projectType: 'Consulting Rebrand',
          year: '2023',
          deliverables: [
            { type: 'logo',         title: 'Logo Refresh',            description: 'Modern consulting mark', icon: '🎨' },
            { type: 'brand-assets', title: 'Presentation Templates',  description: 'Client decks',          icon: '📦' },
            { type: 'stationery',   title: 'Consultant Suite',        description: 'Proposal materials',    icon: '✉️' },
          ],
        },
      ],
    },
    {
      id: 'legal-professionals',
      name: 'Legal Professionals',
      icon: '⚖️',
      clients: [
        {
          id: 'strathmore-law',
          name: 'Strathmore Law Practice',
          projectType: 'Legal Brand Refresh',
          year: '2024',
          deliverables: [
            { type: 'logo',            title: 'Logo Design',    description: 'Authoritative mark',        icon: '🎨' },
            { type: 'brand-assets',    title: 'Brand Guidelines',description: 'Firm identity',            icon: '📦' },
            { type: 'typography',      title: 'Typography',     description: 'Serif + legal type',        icon: 'Aa' },
            { type: 'stationery',      title: 'Legal Stationery',description: 'Letterhead + cards',      icon: '✉️' },
            { type: 'company-profile', title: 'Firm Profile',   description: 'Capabilities brochure',    icon: '📄' },
          ],
        },
        {
          id: 'icj-kenya',
          name: 'ICJ Kenya',
          projectType: 'Institutional Branding',
          year: '2023',
          deliverables: [
            { type: 'logo',            title: 'Logo Update',         description: 'Modernized seal',   icon: '🎨' },
            { type: 'brand-assets',    title: 'Annual Report',       description: 'Legal review',      icon: '📄' },
            { type: 'posters',         title: 'Conference Materials',description: 'Legal summit',      icon: '🖼️' },
          ],
        },
      ],
    },
    {
      id: 'luxury-brands',
      name: 'Luxury Brands',
      icon: '✨',
      clients: [
        {
          id: 'sankara-hotel',
          name: 'Sankara Nairobi',
          projectType: 'Luxury Refresh',
          year: '2024',
          deliverables: [
            { type: 'logo',         title: 'Logo Refinement', description: 'Elegant mark',         icon: '🎨' },
            { type: 'brand-assets', title: 'Luxury Brand System', description: 'Premium identity', icon: '📦' },
            { type: 'typography',   title: 'Typography',      description: 'Exclusive type',        icon: 'Aa' },
            { type: 'posters',      title: 'Luxury Campaign', description: 'Seasonal promotions',  icon: '🖼️' },
            { type: 'stationery',   title: 'VIP Suite',       description: 'Premium materials',    icon: '✉️' },
          ],
        },
        {
          id: 'kiko-romeo',
          name: 'Kiko Romeo',
          projectType: 'Luxury Fashion',
          year: '2023',
          deliverables: [
            { type: 'logo',         title: 'Fashion Logo', description: 'Designer mark',        icon: '🎨' },
            { type: 'brand-assets', title: 'Lookbook',     description: 'Collection assets',    icon: '📦' },
            { type: 'website',      title: 'E-commerce Site', description: 'Luxury storefront', url: '#', icon: '🌐' },
          ],
        },
      ],
    },
    {
      id: 'christian-organizations',
      name: 'Christian Organizations',
      icon: '⛪',
      clients: [
        {
          id: 'anglican-kenya',
          name: 'Anglican Church of Kenya',
          projectType: 'Diocesan Rebrand',
          year: '2024',
          deliverables: [
            { type: 'logo',            title: 'Logo Design',   description: 'Sacred mark',          icon: '🎨' },
            { type: 'brand-assets',    title: 'Brand Guidelines', description: 'Diocesan identity', icon: '📦' },
            { type: 'typography',      title: 'Typography',    description: 'Liturgical type',      icon: 'Aa' },
            { type: 'company-profile', title: 'Annual Report', description: 'Ministry impact',      icon: '📄' },
            { type: 'posters',         title: 'Event Posters', description: 'Outreach campaigns',   icon: '🖼️' },
          ],
        },
        {
          id: 'world-vision-ke',
          name: 'World Vision Kenya',
          projectType: 'Faith-Based Campaign',
          year: '2023',
          deliverables: [
            { type: 'brand-assets',    title: 'Campaign Assets', description: 'Child sponsorship',  icon: '📦' },
            { type: 'posters',         title: 'Awareness Posters', description: 'Community outreach',icon: '🖼️' },
            { type: 'company-profile', title: 'Impact Report',  description: 'Donor materials',     icon: '📄' },
          ],
        },
      ],
    },
    {
      id: 'health-fitness',
      name: 'Health & Fitness',
      icon: '💪',
      clients: [
        {
          id: 'nairobi-gym',
          name: 'Nairobi Gym',
          projectType: 'Wellness Brand',
          year: '2024',
          deliverables: [
            { type: 'logo',         title: 'Logo Design',  description: 'Energetic mark',     icon: '🎨' },
            { type: 'brand-assets', title: 'Brand System', description: 'Fitness identity',   icon: '📦' },
            { type: 'typography',   title: 'Typography',   description: 'Bold type',          icon: 'Aa' },
            { type: 'posters',      title: 'Class Posters',description: 'Fitness schedules',  icon: '🖼️' },
            { type: 'website',      title: 'Booking Site', description: 'Class registration', url: '#', icon: '🌐' },
          ],
        },
        {
          id: 'wellness-africa',
          name: 'Wellness Africa',
          projectType: 'Health Campaign',
          year: '2023',
          deliverables: [
            { type: 'logo',         title: 'Logo Refresh',      description: 'Holistic mark',       icon: '🎨' },
            { type: 'brand-assets', title: 'Campaign Materials', description: 'Health awareness',   icon: '📦' },
            { type: 'posters',      title: 'Wellness Posters',  description: 'Community health',    icon: '🖼️' },
          ],
        },
      ],
    },
    {
      id: 'personal-branding',
      name: 'Personal Branding',
      icon: '🌟',
      clients: [
        {
          id: 'dr-okonjo',
          name: 'Dr. A. Okonjo',
          projectType: 'Thought Leader',
          year: '2024',
          deliverables: [
            { type: 'logo',            title: 'Personal Mark',     description: 'Signature identity',   icon: '🎨' },
            { type: 'brand-assets',    title: 'Speaker Kit',       description: 'Conference assets',    icon: '📦' },
            { type: 'typography',      title: 'Typography',        description: 'Personal type',        icon: 'Aa' },
            { type: 'website',         title: 'Personal Site',     description: 'Bio + speaking',       url: '#', icon: '🌐' },
            { type: 'company-profile', title: 'Speaker One-Pager', description: 'Booking materials',   icon: '📄' },
          ],
        },
        {
          id: 'jane-mbugua',
          name: 'Jane Mbugua',
          projectType: 'Influencer Rebrand',
          year: '2023',
          deliverables: [
            { type: 'logo',         title: 'Personal Logo',     description: 'Monogram mark',      icon: '🎨' },
            { type: 'brand-assets', title: 'Social Templates',  description: 'Instagram kit',      icon: '📦' },
            { type: 'posters',      title: 'Content Templates', description: 'Reels covers',       icon: '🖼️' },
          ],
        },
      ],
    },
    {
      id: 'supermarkets-retailers',
      name: 'Supermarkets & Retailers',
      icon: '🛒',
      clients: [
        {
          id: 'quickmart',
          name: 'QuickMart',
          projectType: 'Retail Chain Refresh',
          year: '2024',
          deliverables: [
            { type: 'logo',         title: 'Logo Refresh',        description: 'Modern retail mark',  icon: '🎨' },
            { type: 'brand-assets', title: 'Retail Brand System', description: 'In-store identity',   icon: '📦' },
            { type: 'typography',   title: 'Typography',          description: 'Clearance type',      icon: 'Aa' },
            { type: 'posters',      title: 'Promotional Posters', description: 'Weekly specials',     icon: '🖼️' },
            { type: 'stationery',   title: 'Store Materials',     description: 'Price tags, signage', icon: '✉️' },
          ],
        },
        {
          id: 'naivas',
          name: 'Naivas Limited',
          projectType: 'Loyalty Program',
          year: '2023',
          deliverables: [
            { type: 'logo',         title: 'Sub-brand Logo',  description: 'Loyalty mark',       icon: '🎨' },
            { type: 'brand-assets', title: 'Loyalty Assets',  description: 'Card + collateral',  icon: '📦' },
            { type: 'posters',      title: 'In-Store Campaign',description: 'Member promos',     icon: '🖼️' },
          ],
        },
      ],
    },
  ],
};


// ============================================
// PORTFOLIO MODULE
// ============================================
class PortfolioModule {
  constructor() {
    this.currentIndustry = null;
    this.currentClient   = null;
    this.elements        = {
      industryFilters:  document.getElementById('industryFilters'),
      clientFilters:    document.getElementById('clientFilters'),
      tierClient:       document.getElementById('tierClient'),
      tierDeliverables: document.getElementById('tierDeliverables'),
      deliverablesGrid: document.getElementById('deliverablesGrid'),
      clientInfo:       document.getElementById('clientInfo'),
      portfolioEmpty:   document.getElementById('portfolioEmpty'),
      resetBtn:         document.getElementById('resetPortfolio'),
    };
  }

  init() {
    this.renderIndustryFilters();
    this.attachEventListeners();
  }

  renderIndustryFilters() {
    const container = this.elements.industryFilters;
    if (!container) return;

    container.innerHTML = '';

    portfolioData.industries.forEach(industry => {
      const button = document.createElement('button');
      button.className = 'industry-btn';
      button.setAttribute('data-industry', industry.id);
      button.innerHTML = `${industry.icon} ${industry.name}`;
      button.addEventListener('click', () => this.selectIndustry(industry.id));
      container.appendChild(button);
    });
  }

  selectIndustry(industryId) {
    document.querySelectorAll('.industry-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.industry === industryId);
    });

    const industry = portfolioData.industries.find(ind => ind.id === industryId);
    if (!industry) return;

    this.currentIndustry = industry;
    this.currentClient   = null;

    this.elements.tierClient.style.display       = 'block';
    this.elements.tierDeliverables.style.display = 'none';
    this.elements.portfolioEmpty.style.display   = 'none';

    this.renderClientFilters(industry.clients);
  }

  renderClientFilters(clients) {
    const container = this.elements.clientFilters;
    container.innerHTML = '';

    clients.forEach(client => {
      const button = document.createElement('button');
      button.className = 'client-btn';
      button.setAttribute('data-client', client.id);
      button.innerHTML = `${client.name} <span style="opacity:0.7; font-size:0.8rem;">(${client.projectType})</span>`;
      button.addEventListener('click', () => this.selectClient(client.id));
      container.appendChild(button);
    });
  }

  selectClient(clientId) {
    document.querySelectorAll('.client-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.client === clientId);
    });

    const client = this.currentIndustry.clients.find(cl => cl.id === clientId);
    if (!client) return;

    this.currentClient = client;
    this.elements.tierDeliverables.style.display = 'block';

    this.renderClientInfo(client);
    this.renderDeliverables(client.deliverables);
  }

  renderClientInfo(client) {
    this.elements.clientInfo.innerHTML = `
      <h4>${client.name}</h4>
      <div class="client-meta">
        <span><i>Project:</i> ${client.projectType}</span>
        <span><i>Year:</i> ${client.year}</span>
      </div>
    `;
  }

  renderDeliverables(deliverables) {
    const container = this.elements.deliverablesGrid;
    container.innerHTML = '';

    deliverables.forEach(del => {
      const isWebsite = del.type === 'website' && del.url;
      const card = document.createElement('div');
      card.className = 'deliverable-card';
      card.innerHTML = `
        <div class="deliverable-icon" aria-hidden="true">${del.icon}</div>
        <h4 class="deliverable-title">${del.title}</h4>
        <p class="deliverable-desc">${del.description}</p>
        ${isWebsite
          ? `<a href="${del.url}" target="_blank" rel="noopener" class="deliverable-link">Visit Site →</a>`
          : `<span class="deliverable-link" aria-disabled="true">View Sample</span>`
        }
      `;
      container.appendChild(card);
    });
  }

  resetPortfolio() {
    this.currentIndustry = null;
    this.currentClient   = null;

    document.querySelectorAll('.industry-btn, .client-btn').forEach(btn => {
      btn.classList.remove('active');
    });

    this.elements.tierClient.style.display       = 'none';
    this.elements.tierDeliverables.style.display = 'none';
    this.elements.portfolioEmpty.style.display   = 'block';
    this.elements.clientFilters.innerHTML        = '';
    this.elements.deliverablesGrid.innerHTML     = '';
    this.elements.clientInfo.innerHTML           = '';
  }

  attachEventListeners() {
    this.elements.resetBtn?.addEventListener('click', () => this.resetPortfolio());

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.currentIndustry) this.resetPortfolio();
    });
  }
}


// ============================================
// EXPORTED INITIALIZER (matches main.js import)
// ============================================

/**
 * Initialize portfolio — called by main.js via safeInit()
 */
export function initPortfolio() {
  if (!document.querySelector('.portfolio-section')) return;

  const portfolio = new PortfolioModule();
  portfolio.init();

  // Expose for debugging
  window.portfolioModule = portfolio;
}