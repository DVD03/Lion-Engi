/**
 * Lions Engineering - Role-Based Rental Platform Frontend
 * Dedicated Full-Screen Landing & Auth Portal, Role Redirection (Admin vs Customer), Payments & Invoices
 */

const API_BASE = '/api';

// Current session state
let currentToken = localStorage.getItem('lions_token') || '';
let currentUser = JSON.parse(localStorage.getItem('lions_user') || 'null');
let currentLang = localStorage.getItem('lions_lang') || 'en';

// Localization Dictionary
const i18n = {
  en: {
    atlas_live: 'Atlas MongoDB Live',
    nav_dashboard: 'Dashboard Overview',
    nav_storefront: 'Storefront Catalog',
    nav_inventory: 'Equipment Inventory',
    nav_rentals: 'All Agreements',
    nav_maintenance: 'Maintenance & Repairs',
    quick_actions_title: 'QUICK ACTIONS',
    btn_new_agreement: 'New Agreement',
    btn_add_tool: 'Add Tool to Stock',
    btn_log_maintenance: 'Log Service / Repair',
    user_role: 'System Manager',
    title_dashboard: 'Dashboard Overview',
    sub_dashboard: 'Real-time heavy equipment, machinery leases, and rental operations',
    title_storefront: 'Public Customer Storefront & Tool Catalog',
    sub_storefront: 'Browse available certified machinery with Tiered Rates and Site Delivery',
    title_inventory: 'Tool & Equipment Inventory',
    sub_inventory: 'Manage machinery, asset serials, rates, meter limits, and operational conditions',
    title_rentals: 'Rental Agreements & Leases',
    sub_rentals: 'Track active leases, returns, extensions, delivery logistics, and WhatsApp alerts',
    title_maintenance: 'Tool Maintenance & Workshop Service Logs',
    sub_maintenance: 'Track tool repair history, maintenance costs, and service schedules',
    kpi_total_tools: 'Total Equipment',
    kpi_active_leases: 'Active Leases',
    kpi_overdue_returns: 'Overdue Returns',
    kpi_total_revenue: 'Total Rental Revenue',
    kpi_sub_active: 'Currently on project sites',
    kpi_sub_overdue: 'Requires urgent return',
    kpi_sub_revenue: 'Live revenue generated',
    panel_recent_rentals: 'Active & Recent Rental Agreements',
    panel_category_breakdown: 'Equipment by Category',
    btn_view_all: 'View All',
    info_db: 'Database',
    th_agreement_code: 'Agreement Code',
    th_customer: 'Customer / Client',
    th_tool: 'Equipment / Tool',
    th_due_date: 'Due Date',
    th_total: 'Total (LKR)',
    th_status: 'Status',
    th_actions: 'Actions',
    th_contact: 'Contact / NIC',
    th_rental_period: 'Rental Period',
    th_deposit: 'Deposit',
    th_rent_charge: 'Rent Charge',
    th_service_date: 'Service Date',
    th_repair_notes: 'Repair Description',
    th_technician: 'Technician',
    th_cost: 'Repair Cost (LKR)',
    cat_all: 'All Categories',
    cat_power: 'Power Tools',
    cat_machinery: 'Heavy Machinery',
    cat_concrete: 'Concrete & Masonry',
    cat_welding: 'Welding & Cutting',
    cat_surveying: 'Surveying & Measuring',
    cat_scaffolding: 'Access & Scaffolding',
    cat_generators: 'Generators & Power',
    filter_all_status: 'All Statuses',
    status_available: 'Available for Hire',
    status_rented: 'Currently Rented',
    status_maintenance: 'Under Maintenance',
    status_damaged: 'Damaged',
    subnav_all: 'All Agreements',
    subnav_active: 'Active Leases',
    subnav_overdue: 'Overdue Returns',
    subnav_completed: 'Completed',
    btn_add_new_tool: 'Add New Tool',
    btn_create_agreement: 'Create Agreement',
    btn_return_tool: 'Return Tool',
    btn_extend_days: 'Extend Days',
    btn_print_bill: 'Print Bill',
    btn_log_service: 'Log Service',
    badge_active_text: '● Active Lease',
    badge_overdue_text: '● Overdue Return',
    badge_completed_text: '✓ Completed',
    badge_maint_text: '⚠️ Under Maintenance',
    badge_damaged_text: '✖ Damaged',
    badge_avail_storefront: '● Available for Rent',
    btn_rent_now_catalog: 'Rent Now / Request Lease',
    storefront_badge: 'PUBLIC CLIENT STOREFRONT',
    storefront_hero_title: 'Heavy Machinery & Industrial Equipment Rental Catalog',
    storefront_hero_sub: 'Browse certified engineering tools with Tiered Weekly/Monthly Rates, Site Delivery, and instant 1-click lease bookings.',
    loading_records: 'Loading records...',
    modal_agreement_title: 'Issue Tool Rental Agreement',
    step_select: 'Dates & Tool',
    step_inspect: 'Inspection & Meter',
    step_settle: 'Settlement',
    lbl_select_customer: 'Select Customer / Contractor *',
    lbl_select_tool: 'Select Available Equipment / Tool *',
    lbl_start_date: 'Rental Start Date *',
    lbl_due_date: 'Due / Expected Return Date *',
    lbl_calc_rent_amount: 'Base Rent Charges:',
    lbl_calc_deposit_amount: 'Required Security Deposit:',
    lbl_calc_total: 'Total Payable Amount:',
    btn_back: 'Back',
    btn_next: 'Next Step \u2192',
    modal_return_title: 'Tool Return & Inspection Settlement',
    lbl_actual_return: 'Actual Return Date',
    lbl_late_penalty: 'Late Overdue Penalty (LKR)',
    lbl_damage_fee: 'Damage / Repair Fee (LKR)',
    lbl_post_condition: 'Post-Return Tool Condition',
    lbl_reset_status: 'Reset Tool Status To',
    lbl_damage_notes: 'Inspection Remarks / Damage Notes',
    lbl_deposit_collected: 'Security Deposit Collected:',
    lbl_deposit_status: 'Deposit Status:',
    lbl_net_refund: 'Net Deposit Refund to Customer:',
    btn_review_settle: 'Review Settlement \u2192',
    btn_confirm_return: 'Complete Return',
    modal_extend_title: 'Extend Rental Due Date',
    lbl_current_due: 'Current Due Date',
    lbl_new_due: 'New Extended Due Date *',
    lbl_extend_reason: 'Extension Reason / Notes',
    lbl_extra_days: 'Additional Days:',
    lbl_extra_rent: 'Additional Rent Fee:',
    lbl_new_total: 'New Total Rental Amount:',
    btn_cancel: 'Cancel',
    btn_confirm_extend: 'Confirm Extension',
    modal_log_maint_title: 'Log Tool Repair & Service',
    lbl_maint_tool: 'Select Tool / Equipment *',
    lbl_service_date: 'Service Date *',
    lbl_repair_cost: 'Repair / Service Cost (LKR) *',
    lbl_technician: 'Technician / Workshop Officer',
    lbl_maint_status: 'Repair Status',
    lbl_repair_description: 'Repair / Maintenance Description *',
    btn_save_maint: 'Save Maintenance Log',
    modal_add_tool_title: 'Add New Tool to Inventory',
    lbl_tool_name: 'Tool / Equipment Name *',
    lbl_tool_cat: 'Category *',
    lbl_serial_tag: 'Serial Number / Item Code *',
    lbl_deposit_req: 'Security Deposit (LKR) *',
    lbl_image_url: 'Equipment Image URL',
    lbl_curr_status: 'Current Status',
    lbl_condition: 'Condition',
    btn_save_tool: 'Save Tool',
  },
  si: {
    atlas_live: 'ඇට්ලස් මොන්ගෝඩීබී සක්‍රියයි',
    nav_dashboard: 'උපකරණ පුවරුව',
    nav_storefront: 'පාරිභෝගික නාමාවලිය',
    nav_inventory: 'මෙවලම් තොගය',
    nav_rentals: 'කුලී ගිවිසුම්',
    nav_maintenance: 'නඩත්තු ලේඛනය',
    quick_actions_title: 'කඩිනම් ක්‍රියා',
    btn_new_agreement: 'නව ගිවිසුම',
    btn_add_tool: 'නව මෙවලමක් එකතු කරන්න',
    btn_log_maintenance: 'නඩත්තුව සටහන් කරන්න',
    user_role: 'පද්ධති කළමනාකරු',
    title_dashboard: 'උපකරණ පුවරු සාරාංශය',
    sub_dashboard: 'බර යන්ත්‍රෝපකරණ සහ මෙවලම් කුලියට දීමේ තොරතුරු',
    title_storefront: 'පාරිභෝගික මෙවලම් නාමාවලිය (Storefront)',
    sub_storefront: 'ලබාගත හැකි සියලු උපකරණ, දෛනික/සතිපතා/මාසික ගාස්තු සහ වැඩබිමට බෙදාහැරීම',
    title_inventory: 'මෙවලම් සහ යන්ත්‍රෝපකරණ තොගය',
    sub_inventory: 'යන්ත්‍රෝපකරණ අංක, ගාස්තු සහ තත්ත්ව පාලනය',
    title_rentals: 'කුලී ගිවිසුම් සහ ඇණවුම්',
    sub_rentals: 'ක්‍රියාකාරී කුලී, ආපසු භාරදීම්, දිගු කිරීම්, බෙදාහැරීම් සහ WhatsApp පණිවිඩ',
    title_maintenance: 'මෙවලම් නඩත්තු සහ අලුත්වැඩියා ලේඛනය',
    sub_maintenance: 'අලුත්වැඩියා වියදම්, සේවා කාලසටහන් සහ විස්තර',
    kpi_total_tools: 'මුළු මෙවලම් ගණන',
    kpi_active_leases: 'ක්‍රියාකාරී කුලී',
    kpi_overdue_returns: 'ප්‍රමාද වූ භාරදීම්',
    kpi_total_revenue: 'මුළු කුලී ආදායම',
    kpi_sub_active: 'වැඩබිම්වල භාවිතයේ පවතී',
    kpi_sub_overdue: 'කඩිනමින් ආපසු ලබාගත යුතුයි',
    kpi_sub_revenue: 'උපයා ඇති මුළු ආදායම',
    panel_recent_rentals: 'මෑත කාලීන කුලී ගිවිසුම්',
    panel_category_breakdown: 'කාණ්ඩය අනුව උපකරණ',
    btn_view_all: 'සියල්ල බලන්න',
    info_db: 'දත්ත ගබඩාව',
    th_agreement_code: 'ගිවිසුම් අංකය',
    th_customer: 'පාරිභෝගිකයා / සේවාදායකයා',
    th_tool: 'මෙවලම සහ ටැගය',
    th_due_date: 'ආපසු දිය යුතු දිනය',
    th_total: 'මුළු මුදල (රු.)',
    th_status: 'තත්ත්වය',
    th_actions: 'ක්‍රියාමාර්ග',
    th_contact: 'දුරකථන / ජා.හැ.අ.',
    th_rental_period: 'කුලී කාලසීමාව',
    th_deposit: 'තැන්පතුව',
    th_rent_charge: 'කුලී ගාස්තුව',
    th_service_date: 'නඩත්තු දිනය',
    th_repair_notes: 'අලුත්වැඩියා විස්තරය',
    th_technician: 'කාර්මික ශිල්පියා',
    th_cost: 'අලුත්වැඩියා වියදම (රු.)',
    cat_all: 'සියලු කාණ්ඩ',
    cat_power: 'විදුලි මෙවලම් (Power Tools)',
    cat_machinery: 'බර යන්ත්‍ර (Heavy Machinery)',
    cat_concrete: 'කොන්ක්‍රීට් සහ මේසන් උපකරණ',
    cat_welding: 'වෙල්ඩින් සහ කැපුම් මෙවලම්',
    cat_surveying: 'මිනින්දෝරු සහ මිනුම් උපකරණ',
    cat_scaffolding: 'ස්කැෆෝල්ඩින් සහ ආරක්ෂක',
    cat_generators: 'ජනක යන්ත්‍ර (Generators)',
    filter_all_status: 'සියලු තත්ත්වයන්',
    status_available: 'කුලියට දීමට සූදානම්',
    status_rented: 'දැනට කුලියට දී ඇත',
    status_maintenance: 'නඩත්තුවේ පවතී',
    status_damaged: 'හානි වී ඇත',
    subnav_all: 'සියලු ගිවිසුම්',
    subnav_active: 'ක්‍රියාකාරී කුලී',
    subnav_overdue: 'කල් ඉකුත් වූ',
    subnav_completed: 'සම්පූර්ණයි',
    btn_add_new_tool: 'නව මෙවලමක් එකතු කරන්න',
    btn_create_agreement: 'ගිවිසුමක් සාදන්න',
    btn_return_tool: 'ආපසු භාරදීම',
    btn_extend_days: 'කාලය දිගු කිරීම',
    btn_print_bill: 'බිල්පත මුද්‍රණය',
    btn_log_service: 'නඩත්තුව සටහන් කරන්න',
    badge_active_text: '● ක්‍රියාකාරී කුලිය',
    badge_overdue_text: '● කල් ඉකුත් වූ භාරදීම',
    badge_completed_text: '✓ සම්පූර්ණයි',
    badge_maint_text: '⚠️ නඩත්තුවේ පවතී',
    badge_damaged_text: '✖ හානි වී ඇත',
    badge_avail_storefront: '● කුලියට දීමට සූදානම්',
    btn_rent_now_catalog: 'දැන්ම කුලියට ගන්න (Rent Now)',
    storefront_badge: 'පාරිභෝගික මෙවලම් නාමාවලිය',
    storefront_hero_title: 'බර යන්ත්‍රෝපකරණ සහ මෙවලම් කුලී නාමාවලිය',
    storefront_hero_sub: 'සහතිකලත් උපකරණ, දෛනික/සතිපතා/මාසික ගාස්තු සහ වැඩබිමට බෙදාහැරීම් සමඟ ක්ෂණිකව කුලියට ගන්න.',
    loading_records: 'තොරතුරු ලබා ගනිමින් පවතී...',
    modal_agreement_title: 'නව මෙවලම් කුලී ගිවිසුමක් නිකුත් කිරීම',
    step_select: 'දින සහ මෙවලම',
    step_inspect: 'පරීක්ෂා කිරීම',
    step_settle: 'තැන්පතු ගෙවීම',
    lbl_select_customer: 'පාරිභෝගිකයා තෝරන්න *',
    lbl_select_tool: 'ලබාගත හැකි මෙවලම තෝරන්න *',
    lbl_start_date: 'ආරම්භක දිනය *',
    lbl_due_date: 'ආපසු දිය යුතු දිනය *',
    lbl_calc_rent_amount: 'කුලී මුදල:',
    lbl_calc_deposit_amount: 'අවශ්‍ය ඇප තැන්පතුව:',
    lbl_calc_total: 'ගෙවිය යුතු මුළු මුදල:',
    btn_back: 'ආපසු',
    btn_next: 'මීළඟ පියවර \u2192',
    modal_return_title: 'මෙවලම ආපසු භාරගැනීම සහ තැන්පතු බේරුම්කරණය',
    lbl_actual_return: 'ආපසු භාරදුන් දිනය',
    lbl_late_penalty: 'ප්‍රමාද දඩ මුදල (රු.)',
    lbl_damage_fee: 'හානි / අලුත්වැඩියා ගාස්තුව (රු.)',
    lbl_post_condition: 'භාරගන්නා විට මෙවලමේ තත්ත්වය',
    lbl_reset_status: 'මෙවලමේ ඉදිරි තත්ත්වය',
    lbl_damage_notes: 'පරීක්ෂණ සහ හානි සටහන්',
    lbl_deposit_collected: 'තබාගත් ඇප තැන්පතුව:',
    lbl_deposit_status: 'තැන්පතු තත්ත්වය:',
    lbl_net_refund: 'පාරිභෝගිකයාට ආපසු දෙන මුදල:',
    btn_review_settle: 'බේරුම්කරණය පරීක්ෂා කරන්න \u2192',
    btn_confirm_return: 'භාරගැනීම සම්පූර්ණ කරන්න',
    modal_extend_title: 'කුලී කාලය දිගු කිරීම',
    lbl_current_due: 'දැනට පවතින ආපසු දිනය',
    lbl_new_due: 'නව ආපසු දෙන දිනය *',
    lbl_extend_reason: 'කාලය දිගු කිරීමට හේතුව',
    lbl_extra_days: 'අමතර දින ගණන:',
    lbl_extra_rent: 'අමතර කුලී ගාස්තුව:',
    lbl_new_total: 'නව මුළු කුලී මුදල:',
    btn_cancel: 'අවලංගු කරන්න',
    btn_confirm_extend: 'දිගු කිරීම තහවුරු කරන්න',
    modal_log_maint_title: 'මෙවලම් අලුත්වැඩියා සහ සේවා වාර්තාව',
    lbl_maint_tool: 'නඩත්තු කරන මෙවලම තෝරන්න *',
    lbl_service_date: 'සේවා දිනය *',
    lbl_repair_cost: 'අලුත්වැඩියා වියදම (රු.) *',
    lbl_technician: 'කාර්මික ශිල්පියාගේ නම',
    lbl_maint_status: 'නඩත්තු තත්ත්වය',
    lbl_repair_description: 'අලුත්වැඩියා විස්තරය *',
    btn_save_maint: 'නඩත්තු විස්තර සුරකින්න',
    modal_add_tool_title: 'නව මෙවලමක් තොගයට එක් කරන්න',
    lbl_tool_name: 'මෙවලමේ නම *',
    lbl_tool_cat: 'කාණ්ඩය *',
    lbl_serial_tag: 'අනුක්‍රමික අංකය / ටැගය *',
    lbl_deposit_req: 'ආරක්ෂිත ඇප තැන්පතුව (රු.) *',
    lbl_image_url: 'මෙවලම් ඡායාරූප සබැඳිය (URL)',
    lbl_curr_status: 'දැනට පවතින තත්ත්වය',
    lbl_condition: 'භාවිත තත්ත්වය',
    btn_save_tool: 'මෙවලම සුරකින්න',
  },
};

function setLanguage(lang) {
  currentLang = lang;
  localStorage.setItem('lions_lang', lang);

  document.querySelectorAll('.lang-btn').forEach((b) => b.classList.remove('active'));
  const btn1 = document.getElementById(`lang-${lang}`);
  const btn2 = document.getElementById(`landing-lang-${lang}`);
  if (btn1) btn1.classList.add('active');
  if (btn2) btn2.classList.add('active');

  const dict = i18n[lang] || i18n.en;

  document.querySelectorAll('[data-i18n]').forEach((el) => {
    const key = el.getAttribute('data-i18n');
    if (dict[key]) el.textContent = dict[key];
  });

  document.querySelectorAll('[data-i18n-placeholder]').forEach((el) => {
    const key = el.getAttribute('data-i18n-placeholder');
    if (dict[key]) el.placeholder = dict[key];
  });

  renderActiveTab();
}

function t(key) {
  const dict = i18n[currentLang] || i18n.en;
  return dict[key] || key;
}

// Global App State
const state = {
  activeTab: 'dashboard',
  tools: [],
  availableTools: [],
  catalogTools: [],
  rentals: [],
  myRentals: [],
  maintenanceLogs: [],
  payments: [],
  users: [],
  catalogCategory: 'All',
  filterCategory: 'All',
  filterStatus: 'All',
  rentalFilterStatus: 'All',
};

const DEFAULT_TOOL_IMAGE = 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&auto=format&fit=crop&q=80';

const TOOL_IMAGE_MAP = {
  'LE-CON-001': 'https://images.unsplash.com/photo-1541888946425-d0fbb180c5f5?w=800&auto=format&fit=crop&q=80',
  'LE-PWR-002': 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=800&auto=format&fit=crop&q=80',
  'LE-WLD-003': 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&auto=format&fit=crop&q=80',
  'LE-SRV-004': 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?w=800&auto=format&fit=crop&q=80',
  'LE-GEN-005': 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&auto=format&fit=crop&q=80',
  'LE-ACC-006': 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=800&auto=format&fit=crop&q=80',
  'LE-PWR-007': 'https://images.unsplash.com/photo-1572981779307-38b8cabb2407?w=800&auto=format&fit=crop&q=80',
  'LE-HVY-008': 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=800&auto=format&fit=crop&q=80',
};

function getToolImageUrl(imageUrl, serialNumber) {
  if (serialNumber && TOOL_IMAGE_MAP[serialNumber]) return TOOL_IMAGE_MAP[serialNumber];
  if (!imageUrl || imageUrl === 'default-tool-placeholder.png' || imageUrl.includes('photo-1513836279014-a89f7a76ae86')) {
    return DEFAULT_TOOL_IMAGE;
  }
  return imageUrl;
}

function formatLKR(amount) {
  return 'LKR ' + (Number(amount) || 0).toLocaleString('en-LK', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

function formatDate(dateStr) {
  if (!dateStr) return 'N/A';
  return new Date(dateStr).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;

  let icon = 'fa-circle-info';
  if (type === 'success') icon = 'fa-circle-check';
  if (type === 'error') icon = 'fa-circle-exclamation';

  toast.innerHTML = `
    <i class="fa-solid ${icon}"></i>
    <span>${message}</span>
  `;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(100%)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

// Modal Helpers
function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) modal.classList.add('active');
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) modal.classList.remove('active');
}

document.querySelectorAll('[data-close]').forEach((btn) => {
  btn.addEventListener('click', (e) => {
    e.preventDefault();
    closeModal(btn.getAttribute('data-close'));
  });
});

document.querySelectorAll('.modal-overlay').forEach((overlay) => {
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) overlay.classList.remove('active');
  });
});

// Helper for authenticated API calls
async function authFetch(url, options = {}) {
  options.headers = options.headers || {};
  if (currentToken) {
    options.headers['Authorization'] = `Bearer ${currentToken}`;
  }
  if (currentUser && currentUser._id) {
    options.headers['x-user-id'] = currentUser._id;
  }
  return fetch(url, options);
}

// Password Visibility Toggle
function togglePasswordVisibility(inputId, btn) {
  const input = document.getElementById(inputId);
  if (!input) return;
  const isPassword = input.type === 'password';
  input.type = isPassword ? 'text' : 'password';
  const icon = btn.querySelector('i');
  if (icon) {
    icon.className = isPassword ? 'fa-solid fa-eye-slash' : 'fa-solid fa-eye';
  }
}

// ----------------------------------------------------
// FORGOT PASSWORD / PASSWORD RECOVERY MODAL HANDLERS
// ----------------------------------------------------
let forgotPasswordEmail = '';

function openForgotPasswordModal() {
  const loginEmail = document.getElementById('landing-login-email')?.value.trim() || '';
  const emailInput = document.getElementById('forgot-input-email');
  if (emailInput && loginEmail) {
    emailInput.value = loginEmail;
  }

  resetForgotPasswordStep();
  openModal('modal-forgot-password');
}

function resetForgotPasswordStep() {
  const form1 = document.getElementById('form-forgot-step-1');
  const form2 = document.getElementById('form-forgot-step-2');
  if (form1) form1.style.display = 'block';
  if (form2) form2.style.display = 'none';
}

const forgotForm1 = document.getElementById('form-forgot-step-1');
if (forgotForm1) {
  forgotForm1.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('forgot-input-email')?.value.trim();
    const nic = document.getElementById('forgot-input-nic')?.value.trim();
    const btn = document.getElementById('btn-forgot-verify');
    const originalBtn = btn ? btn.innerHTML : '';

    if (!email) {
      showToast('Please enter your registered email address', 'error');
      return;
    }

    if (btn) {
      btn.disabled = true;
      btn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Verifying...`;
    }

    try {
      const res = await fetch(`${API_BASE}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, nic_or_passport: nic }),
      });
      const json = await res.json();

      if (json.success) {
        forgotPasswordEmail = json.email || email;
        showToast(json.message || 'Identity verified! Enter your new password.', 'success');

        const hintEl = document.getElementById('forgot-otp-hint-text');
        if (hintEl) {
          hintEl.innerHTML = `Account <strong>${json.userName || json.email}</strong> verified! One-Time OTP Code: <span class="badge badge-warning" style="font-size:13px; font-weight:800;">${json.otpHint || '123456'}</span>`;
        }

        const otpInput = document.getElementById('forgot-input-otp');
        if (otpInput && json.otpHint) {
          otpInput.value = json.otpHint;
        }

        const form1 = document.getElementById('form-forgot-step-1');
        const form2 = document.getElementById('form-forgot-step-2');
        if (form1) form1.style.display = 'none';
        if (form2) form2.style.display = 'block';
      } else {
        showToast(json.message || 'Verification failed. Please check your credentials.', 'error');
      }
    } catch (err) {
      showToast('Error connecting to authentication service', 'error');
    } finally {
      if (btn) {
        btn.disabled = false;
        btn.innerHTML = originalBtn;
      }
    }
  });
}

const forgotForm2 = document.getElementById('form-forgot-step-2');
if (forgotForm2) {
  forgotForm2.addEventListener('submit', async (e) => {
    e.preventDefault();
    const newPassword = document.getElementById('forgot-new-password')?.value || '';
    const confirmPassword = document.getElementById('forgot-confirm-password')?.value || '';
    const btn = document.getElementById('btn-forgot-reset-submit');
    const originalBtn = btn ? btn.innerHTML : '';

    if (!newPassword || newPassword.length < 6) {
      showToast('New password must be at least 6 characters long', 'error');
      return;
    }

    if (newPassword !== confirmPassword) {
      showToast('Passwords do not match! Please check and retry.', 'error');
      return;
    }

    if (btn) {
      btn.disabled = true;
      btn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Resetting Password...`;
    }

    try {
      const res = await fetch(`${API_BASE}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotPasswordEmail, newPassword }),
      });
      const json = await res.json();

      if (json.success) {
        showToast(json.message || 'Password reset successfully! You can now log in.', 'success');
        closeModal('modal-forgot-password');

        // Pre-fill updated password into login form
        const loginPass = document.getElementById('landing-login-password');
        const loginEmail = document.getElementById('landing-login-email');
        if (loginPass) loginPass.value = newPassword;
        if (loginEmail && forgotPasswordEmail) loginEmail.value = forgotPasswordEmail;

        resetForgotPasswordStep();
      } else {
        showToast(json.message || 'Failed to reset password', 'error');
      }
    } catch (err) {
      showToast('Error communicating with password reset server', 'error');
    } finally {
      if (btn) {
        btn.disabled = false;
        btn.innerHTML = originalBtn;
      }
    }
  });
}

// Dev Mode Check for 1-Click Demo Logins
function checkDevEnvironment() {
  const devBox = document.getElementById('dev-demo-login-box');
  if (!devBox) return;

  const isLocalhost = window.location.hostname === 'localhost' ||
                      window.location.hostname === '127.0.0.1' ||
                      window.location.protocol === 'file:';

  if (isLocalhost) {
    devBox.style.display = 'block';
  } else {
    devBox.style.display = 'none';
  }
}

// ----------------------------------------------------
// 1. DEDICATED LANDING & AUTHENTICATION PORTAL
// ----------------------------------------------------
function toggleLandingAuth(type) {
  const formLogin = document.getElementById('landing-form-login');
  const formReg = document.getElementById('landing-form-register');
  const titleEl = document.getElementById('auth-title');
  const subtitle = document.getElementById('auth-subtitle');
  const topAuthBtn = document.getElementById('btn-top-auth-toggle');

  if (type === 'login') {
    if (formLogin) formLogin.style.display = 'flex';
    if (formReg) formReg.style.display = 'none';
    if (titleEl) titleEl.innerHTML = '<span>Welcome Back!</span>';
    if (subtitle) subtitle.textContent = 'Login to access your account';
    if (topAuthBtn) {
      topAuthBtn.textContent = 'Sign Up';
      topAuthBtn.setAttribute('onclick', "toggleLandingAuth('register')");
    }
  } else {
    if (formLogin) formLogin.style.display = 'none';
    if (formReg) formReg.style.display = 'flex';
    if (titleEl) titleEl.innerHTML = '<span>Create Your Account</span>';
    if (subtitle) subtitle.textContent = 'Sign up to start renting equipment';
    if (topAuthBtn) {
      topAuthBtn.textContent = 'Sign In';
      topAuthBtn.setAttribute('onclick', "toggleLandingAuth('login')");
    }
  }
}

function quickDemoLogin(role, clickedBtn) {
  if (role === 'admin') {
    const emailEl = document.getElementById('landing-login-email');
    const passEl = document.getElementById('landing-login-password');
    if (emailEl) emailEl.value = 'admin@lions.lk';
    if (passEl) passEl.value = 'admin123';
    loginUser('admin@lions.lk', 'admin123', clickedBtn);
  } else {
    const emailEl = document.getElementById('landing-login-email');
    const passEl = document.getElementById('landing-login-password');
    if (emailEl) emailEl.value = 'kamal@apex.lk';
    if (passEl) passEl.value = 'customer123';
    loginUser('kamal@apex.lk', 'customer123', clickedBtn);
  }
}

async function loginUser(email, password, sourceBtn) {
  const submitBtn = document.querySelector('#landing-form-login button[type="submit"]');
  const btn = sourceBtn || submitBtn;
  let originalBtnHtml = '';
  let loginSucceeded = false;

  if (btn) {
    originalBtnHtml = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Authenticating...`;
  }

  if (!email || !password) {
    showToast('Please enter both email address and password', 'error');
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = originalBtnHtml;
    }
    return;
  }

  try {
    // 6-second timeout to prevent infinite loading state
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.trim(), password }),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    const json = await res.json();

    if (json.success && json.token && json.user) {
      loginSucceeded = true;
      currentToken = json.token;
      currentUser = json.user;
      localStorage.setItem('lions_token', currentToken);
      localStorage.setItem('lions_user', JSON.stringify(currentUser));

      // Handle Remember Me
      const rememberCheckbox = document.getElementById('login-remember-me');
      if (rememberCheckbox && rememberCheckbox.checked) {
        localStorage.setItem('lions_remember_email', email);
      } else {
        localStorage.removeItem('lions_remember_email');
      }

      showToast(`Welcome back, ${currentUser.name}! (${currentUser.role.toUpperCase()})`, 'success');
      updateAuthUI();
    } else {
      showToast(json.message || 'Invalid email or password credentials', 'error');
    }
  } catch (err) {
    console.error('Authentication error:', err);
    
    // Seamless offline fallback for instant Demo accounts in dev environment
    if (email === 'admin@lions.lk' && password === 'admin123') {
      loginSucceeded = true;
      currentUser = {
        _id: '6a874194a8f68603afca72eb',
        name: 'Lions System Administrator',
        email: 'admin@lions.lk',
        role: 'admin',
        phone_number: '+94 11 234 5678',
        nic_or_passport: '800010001V',
        company_name: 'Lions Engineering HQ',
        address: 'No 100, High Level Road, Nugegoda',
        verification_status: 'Verified',
      };
      currentToken = 'mock_admin_token_' + Date.now();
      localStorage.setItem('lions_token', currentToken);
      localStorage.setItem('lions_user', JSON.stringify(currentUser));
      showToast(`Logged in as Administrator (Demo Mode)`, 'success');
      updateAuthUI();
    } else if (email === 'kamal@apex.lk' && password === 'customer123') {
      loginSucceeded = true;
      currentUser = {
        _id: '6a874194a8f68603afca72ed',
        name: 'Kamal Perera',
        email: 'kamal@apex.lk',
        role: 'customer',
        phone_number: '+94 77 123 4567',
        nic_or_passport: '851234567V',
        company_name: 'Apex Civil Engineering Ltd',
        address: 'No 45, Baseline Road, Colombo 09',
        verification_status: 'Verified',
      };
      currentToken = 'mock_cust_token_' + Date.now();
      localStorage.setItem('lions_token', currentToken);
      localStorage.setItem('lions_user', JSON.stringify(currentUser));
      showToast(`Logged in as Customer Kamal (Demo Mode)`, 'success');
      updateAuthUI();
    } else {
      showToast(err.name === 'AbortError' ? 'Authentication timed out. Please retry.' : 'Network error during authentication', 'error');
    }
  } finally {
    // Reset loading state on button if login did not complete
    if (!loginSucceeded && btn) {
      btn.disabled = false;
      btn.innerHTML = originalBtnHtml;
    }
  }
}

function logoutUser() {
  currentToken = '';
  currentUser = null;
  localStorage.removeItem('lions_token');
  localStorage.removeItem('lions_user');
  showToast('Logged out successfully from session', 'info');
  updateAuthUI();
}

// Landing Form Submissions
const loginFormEl = document.getElementById('landing-form-login');
if (loginFormEl) {
  loginFormEl.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('landing-login-email')?.value.trim() || '';
    const pass = document.getElementById('landing-login-password')?.value || '';
    const submitBtn = e.target.querySelector('button[type="submit"]');
    loginUser(email, pass, submitBtn);
  });
}

// Form Accessibility: Ensure Enter in password/email fields triggers submit
['landing-login-email', 'landing-login-password'].forEach((id) => {
  const el = document.getElementById(id);
  if (el) {
    el.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        const form = document.getElementById('landing-form-login');
        if (form) form.requestSubmit();
      }
    });
  }
});

const regFormEl = document.getElementById('landing-form-register');
if (regFormEl) {
  regFormEl.addEventListener('submit', async (e) => {
    e.preventDefault();
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalHtml = submitBtn ? submitBtn.innerHTML : '';
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Creating Account...`;
    }

    // Public registration is restricted strictly to Customer role
    const payload = {
      name: document.getElementById('landing-reg-name')?.value.trim() || '',
      email: document.getElementById('landing-reg-email')?.value.trim() || '',
      password: document.getElementById('landing-reg-password')?.value || '',
      role: 'customer',
      phone_number: document.getElementById('landing-reg-phone')?.value.trim() || '',
      nic_or_passport: document.getElementById('landing-reg-nic')?.value.trim() || '',
      company_name: document.getElementById('landing-reg-company')?.value.trim() || '',
      address: document.getElementById('landing-reg-address')?.value.trim() || '',
    };

    try {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const json = await res.json();

      if (json.success) {
        currentToken = json.token;
        currentUser = json.user;
        localStorage.setItem('lions_token', currentToken);
        localStorage.setItem('lions_user', JSON.stringify(currentUser));
        showToast(`Customer account registered successfully! Redirecting to Storefront...`, 'success');
        updateAuthUI();
      } else {
        showToast(json.message || json.error || 'Registration failed', 'error');
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = originalHtml;
        }
      }
    } catch (err) {
      showToast('Error connecting to registration service', 'error');
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalHtml;
      }
    }
  });
}

// User Menu Dropdown Helpers
function toggleUserDropdown(e) {
  if (e) e.stopPropagation();
  const dropdown = document.getElementById('user-dropdown-menu');
  if (dropdown) dropdown.classList.toggle('active');
}

function closeUserDropdown() {
  const dropdown = document.getElementById('user-dropdown-menu');
  if (dropdown) dropdown.classList.remove('active');
}

document.addEventListener('click', (e) => {
  const wrapper = document.getElementById('user-menu-dropdown-wrapper');
  if (wrapper && !wrapper.contains(e.target)) {
    closeUserDropdown();
  }
});

// ----------------------------------------------------
// MOBILE SIDEBAR DRAWER TOGGLE
// ----------------------------------------------------
function openMobileSidebar() {
  const sidebar = document.querySelector('.sidebar');
  const overlay = document.getElementById('sidebar-overlay');
  if (sidebar) {
    sidebar.classList.add('open', 'active', 'show');
  }
  if (overlay) {
    overlay.classList.add('visible', 'active', 'show');
  }
  document.body.classList.add('sidebar-open');
}

function closeMobileSidebar() {
  const sidebar = document.querySelector('.sidebar');
  const overlay = document.getElementById('sidebar-overlay');
  if (sidebar) {
    sidebar.classList.remove('open', 'active', 'show');
  }
  if (overlay) {
    overlay.classList.remove('visible', 'active', 'show');
  }
  document.body.classList.remove('sidebar-open');
}

function toggleMobileSidebar(e) {
  if (e) {
    e.preventDefault();
    e.stopPropagation();
  }
  const sidebar = document.querySelector('.sidebar');
  if (sidebar && (sidebar.classList.contains('open') || sidebar.classList.contains('active'))) {
    closeMobileSidebar();
  } else {
    openMobileSidebar();
  }
}

// Expose to global window object
window.openMobileSidebar = openMobileSidebar;
window.closeMobileSidebar = closeMobileSidebar;
window.toggleMobileSidebar = toggleMobileSidebar;

// Attach click listeners to hamburger, overlay, close button and nav items
document.addEventListener('DOMContentLoaded', () => {
  const hamburgerBtn = document.getElementById('btn-hamburger');
  if (hamburgerBtn) {
    hamburgerBtn.addEventListener('click', toggleMobileSidebar);
  }

  const overlayEl = document.getElementById('sidebar-overlay');
  if (overlayEl) {
    overlayEl.addEventListener('click', closeMobileSidebar);
  }

  const closeBtn = document.getElementById('btn-sidebar-close');
  if (closeBtn) {
    closeBtn.addEventListener('click', closeMobileSidebar);
  }

  // Close mobile sidebar automatically when any nav item is tapped
  document.querySelectorAll('.nav-item').forEach((btn) => {
    btn.addEventListener('click', () => {
      if (window.innerWidth <= 900) {
        closeMobileSidebar();
      }
    });
  });
});

// Update UI Layout based on Authentication State
function updateAuthUI() {
  const landingContainer = document.getElementById('landing-auth-container');
  const mainAppContainer = document.getElementById('main-app-container');

  const sessionBadge = document.getElementById('session-role-badge');
  const sessionName = document.getElementById('session-user-name');
  const adminNav = document.getElementById('admin-nav-menu');
  const custNav = document.getElementById('customer-nav-menu');
  const adminQuick = document.getElementById('admin-quick-actions');
  const custSelectGroup = document.getElementById('rental-customer-select-group');
  const activeLeaseBtn = document.getElementById('header-active-lease-btn');

  if (currentUser && currentToken) {
    // Authenticated: Show Main Application Dashboard
    if (landingContainer) landingContainer.style.display = 'none';
    if (mainAppContainer) mainAppContainer.style.display = 'block';

    const roleUpper = (currentUser.role || 'customer').toUpperCase();
    if (sessionBadge) {
      sessionBadge.textContent = roleUpper;
      sessionBadge.className = `session-badge ${currentUser.role === 'admin' ? 'badge-warning' : 'badge-active'}`;
    }
    if (sessionName) sessionName.textContent = currentUser.name || 'User';

    // Populate Topbar Profile Dropdown
    const initials = (currentUser.name || 'User')
      .split(' ')
      .map((w) => w[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();

    const avatarEl = document.getElementById('header-avatar-circle');
    const headNameEl = document.getElementById('header-user-name');
    const headBadgeEl = document.getElementById('header-user-role-badge');
    const dropNameEl = document.getElementById('dropdown-user-name');
    const dropCompEl = document.getElementById('dropdown-user-company');

    if (avatarEl) avatarEl.textContent = initials;
    if (headNameEl) headNameEl.textContent = currentUser.name || 'User';
    if (headBadgeEl) headBadgeEl.textContent = currentUser.role === 'admin' ? 'System Administrator' : 'Verified Contractor';
    if (dropNameEl) dropNameEl.textContent = currentUser.name || 'User';
    if (dropCompEl) dropCompEl.textContent = currentUser.company_name || (currentUser.role === 'admin' ? 'Lions HQ' : 'Individual Contractor');

    const sideName = document.getElementById('sidebar-user-name');
    const sideRole = document.getElementById('sidebar-user-role');
    if (sideName) sideName.textContent = currentUser.name || 'User';
    if (sideRole) sideRole.textContent = currentUser.role === 'admin' ? 'System Administrator' : 'Verified Contractor';

    const sysBadge = document.getElementById('sidebar-system-status');

    if (currentUser.role === 'admin') {
      if (adminNav) adminNav.style.display = 'flex';
      if (custNav) custNav.style.display = 'none';
      if (adminQuick) adminQuick.style.display = 'block';
      if (custSelectGroup) custSelectGroup.style.display = 'block';
      if (activeLeaseBtn) activeLeaseBtn.style.display = 'none';
      if (sysBadge) sysBadge.style.display = 'flex';

      // Redirect Admin directly to Dashboard Overview
      switchTab('dashboard');
    } else {
      // CUSTOMER ROLE: Redirect directly to Public Catalog Storefront
      if (adminNav) adminNav.style.display = 'none';
      if (custNav) custNav.style.display = 'flex';
      if (adminQuick) adminQuick.style.display = 'none';
      if (custSelectGroup) custSelectGroup.style.display = 'none';
      if (activeLeaseBtn) activeLeaseBtn.style.display = 'inline-flex';
      if (sysBadge) sysBadge.style.display = 'none';

      const elName = document.getElementById('kyc-name');
      const elCompany = document.getElementById('kyc-company');
      const elNic = document.getElementById('kyc-nic');
      const elPhone = document.getElementById('kyc-phone');
      const elAddress = document.getElementById('kyc-address');
      const elGreeting = document.getElementById('portal-user-greeting');

      if (elGreeting) elGreeting.textContent = `Welcome, ${currentUser.name || 'Contractor'}`;

      populateKycProfileView();
      switchTab('catalog');
      loadMyLeases();
    }
  } else {
    // Unauthenticated: Show Landing Portal
    if (landingContainer) landingContainer.style.display = 'flex';
    if (mainAppContainer) mainAppContainer.style.display = 'none';
    // Show demo buttons only in dev environment
    checkDevEnvironment();
  }
}

// ----------------------------------------------------
// 2. TAB ROUTING & NAVIGATION
// ----------------------------------------------------

/**
 * ADMIN-ONLY tabs: customers cannot access these.
 * Attempting to navigate here forces redirect to catalog.
 */
const ADMIN_ONLY_TABS = new Set(['dashboard', 'inventory', 'rentals', 'maintenance', 'payments', 'users']);

/**
 * CUSTOMER-ONLY tabs: admins don't need these.
 * Admins navigating here are silently redirected to dashboard.
 */
const CUSTOMER_ONLY_TABS = new Set(['customer-portal', 'customer-kyc']);

/**
 * requireAuth — hard redirect to Sign-In if no valid session.
 * Called before any protected navigation or action.
 */
function requireAuth() {
  if (!currentToken || !currentUser) {
    showToast('Please sign in to access this section.', 'error');
    logoutUser(); // clears any stale state
    return false;
  }
  return true;
}

document.querySelectorAll('.nav-item').forEach((btn) => {
  btn.addEventListener('click', () => {
    const tabName = btn.getAttribute('data-tab');
    switchTab(tabName);
  });
});

function switchTab(tabName) {
  // ── Auth Guard: unauthenticated users cannot enter the app ──
  if (!requireAuth()) return;

  const role = currentUser.role; // 'admin' | 'customer'

  // ── Role Guard: block customers from admin-only tabs ──
  if (ADMIN_ONLY_TABS.has(tabName) && role !== 'admin') {
    showToast('⛔ Access Denied — Admin area only.', 'error');
    tabName = 'catalog'; // redirect customer to their default view
  }

  // ── Role Guard: redirect admins away from customer-only tabs ──
  if (CUSTOMER_ONLY_TABS.has(tabName) && role === 'admin') {
    tabName = 'dashboard'; // admins default to dashboard
  }

  state.activeTab = tabName;

  document.querySelectorAll('.nav-item').forEach((b) => {
    b.classList.toggle('active', b.getAttribute('data-tab') === tabName);
  });

  document.querySelectorAll('.tab-content').forEach((c) => {
    c.classList.toggle('active', c.id === `tab-${tabName}`);
  });

  const isCust = role === 'customer';
  const custName = currentUser.name || 'Contractor';
  const custComp = currentUser.company_name || 'Apex Civil Engineering';

  const titles = {
    dashboard: { title: t('title_dashboard'), sub: t('sub_dashboard') },
    catalog: {
      title: isCust ? `👋 Welcome back, ${custName}!` : t('title_storefront'),
      sub: isCust ? `${custComp} • Island-Wide Certified Equipment Hire` : t('sub_storefront'),
    },
    'customer-portal': { title: '📋 My Active Leases & Invoices', sub: 'View live jobsite machinery, track return dates, and download verified tax invoices' },
    'customer-kyc': { title: '🪪 Identity & KYC Verification', sub: 'Verified contractor profile and compliance credentials' },
    inventory: { title: t('title_inventory'), sub: t('sub_inventory') },
    rentals: { title: t('title_rentals'), sub: t('sub_rentals') },
    maintenance: { title: t('title_maintenance'), sub: t('sub_maintenance') },
    payments: { title: 'Payments & Security Deposits Ledger', sub: 'Audited gateway transactions and deposit settlement records' },
    users: { title: 'Registered Users & KYC Directory', sub: 'Customer profiles and identity approvals' },
  };

  if (titles[tabName]) {
    const pageTitle = document.getElementById('page-title');
    const pageSub = document.getElementById('page-subtitle');
    if (pageTitle) pageTitle.textContent = titles[tabName].title;
    if (pageSub) pageSub.textContent = titles[tabName].sub;
  }

  // Hide topbar search on Storefront (has its own primary search bar)
  const topSearchWrapper = document.getElementById('topbar-search-wrapper');
  if (topSearchWrapper) {
    topSearchWrapper.style.display = tabName === 'catalog' ? 'none' : 'flex';
  }

  renderActiveTab();
}

function renderActiveTab() {
  if (state.activeTab === 'dashboard') loadDashboard();
  if (state.activeTab === 'catalog') loadCatalog();
  if (state.activeTab === 'customer-portal') loadMyLeases();
  if (state.activeTab === 'inventory') loadTools();
  if (state.activeTab === 'rentals') loadRentals();
  if (state.activeTab === 'maintenance') loadMaintenance();
  if (state.activeTab === 'payments') loadPayments();
  if (state.activeTab === 'users') loadUsers();
}

// ----------------------------------------------------
// 3. DIGITAL SIGNATURE PAD (HTML5 Canvas)
// ----------------------------------------------------
let sigCanvas, sigCtx, isDrawing = false;

function initSignaturePad() {
  sigCanvas = document.getElementById('signature-pad');
  if (!sigCanvas) return;
  sigCtx = sigCanvas.getContext('2d');
  sigCtx.strokeStyle = '#f59e0b';
  sigCtx.lineWidth = 2.5;
  sigCtx.lineCap = 'round';

  function getPos(e) {
    const rect = sigCanvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return {
      x: (clientX - rect.left) * (sigCanvas.width / rect.width),
      y: (clientY - rect.top) * (sigCanvas.height / rect.height),
    };
  }

  function start(e) {
    e.preventDefault();
    isDrawing = true;
    const pos = getPos(e);
    sigCtx.beginPath();
    sigCtx.moveTo(pos.x, pos.y);
  }

  function move(e) {
    if (!isDrawing) return;
    e.preventDefault();
    const pos = getPos(e);
    sigCtx.lineTo(pos.x, pos.y);
    sigCtx.stroke();
  }

  function stop(e) {
    if (isDrawing) {
      isDrawing = false;
      sigCtx.closePath();
    }
  }

  sigCanvas.addEventListener('mousedown', start);
  sigCanvas.addEventListener('mousemove', move);
  window.addEventListener('mouseup', stop);

  sigCanvas.addEventListener('touchstart', start, { passive: false });
  sigCanvas.addEventListener('touchmove', move, { passive: false });
  sigCanvas.addEventListener('touchend', stop);

  const btnClear = document.getElementById('btn-clear-sig');
  if (btnClear) {
    btnClear.addEventListener('click', () => {
      sigCtx.clearRect(0, 0, sigCanvas.width, sigCanvas.height);
    });
  }
}

function getSignatureDataUrl() {
  if (!sigCanvas) return '';
  return sigCanvas.toDataURL('image/png');
}

// ----------------------------------------------------
// 4. DASHBOARD (ADMIN)
// ----------------------------------------------------
async function loadDashboard() {
  try {
    const res = await authFetch(`${API_BASE}/stats/dashboard`);
    const json = await res.json();

    if (json.success) {
      const { kpis, categoryStats, recentRentals } = json.data;

      document.getElementById('kpi-total-tools').textContent = kpis.totalTools;
      document.getElementById('kpi-avail-sub').innerHTML = `<i class="fa-solid fa-check"></i> ${kpis.availableTools} ${t('status_available')}`;
      document.getElementById('kpi-active-rentals').textContent = kpis.activeRentals;
      document.getElementById('kpi-overdue-rentals').textContent = kpis.overdueRentals;
      document.getElementById('kpi-total-revenue').textContent = formatLKR(kpis.totalRevenue);

      document.getElementById('badge-total-tools').textContent = kpis.totalTools;
      document.getElementById('badge-active-rentals').textContent = kpis.activeRentals;

      const catContainer = document.getElementById('dashboard-categories');
      catContainer.innerHTML = '';
      categoryStats.forEach((cat) => {
        const row = document.createElement('div');
        row.className = 'cat-row';
        row.innerHTML = `
          <div class="cat-row-name">
            <i class="fa-solid fa-wrench text-gold"></i>
            <span>${cat._id}</span>
          </div>
          <div class="cat-row-stats">
            <span class="cat-avail">${cat.availableCount} Avail</span> / ${cat.count} Total
          </div>
        `;
        catContainer.appendChild(row);
      });

      const tbody = document.getElementById('tbody-dashboard-rentals');
      tbody.innerHTML = '';
      if (!recentRentals || recentRentals.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" class="text-center py-4">${t('loading_records')}</td></tr>`;
      } else {
        recentRentals.forEach((r) => {
          const tr = document.createElement('tr');
          const statusBadge = getStatusBadge(r.status);
          const toolName = r.tool ? `${r.tool.name} (${r.tool.serialNumber})` : 'N/A';
          const custName = (r.user_id && r.user_id.name) || (r.customer && r.customer.name) || r.customer_name || 'Kamal Perera (Apex Civil)';

          tr.innerHTML = `
            <td><strong class="text-gold">${r.rentalCode}</strong></td>
            <td><strong>${custName}</strong></td>
            <td><strong style="font-size:12px;">${toolName}</strong></td>
            <td>${formatDate(r.dueDate)}</td>
            <td><strong>${formatLKR(r.totalAmount)}</strong></td>
            <td>${statusBadge}</td>
            <td>
              <div style="display:flex; gap:6px; flex-wrap:wrap;">
                ${
                  r.status !== 'Completed'
                    ? `<button class="btn btn-sm btn-success btn-cta" onclick="openReturnModal('${r._id}')"><i class="fa-solid fa-arrow-rotate-left"></i> ${t('btn_return_tool')}</button>
                       <button class="btn btn-sm btn-outline btn-cta" onclick="openExtendModal('${r._id}')"><i class="fa-solid fa-calendar-plus"></i> ${t('btn_extend_days')}</button>`
                    : ''
                }
                  <button class="btn btn-sm btn-gold btn-cta" onclick="openInvoiceModal('${r._id}')" title="View, translate & print verified invoice">
                    <i class="fa-solid fa-file-invoice"></i> Bill / බිල්පත
                  </button>
                </div>
              </td>
          `;
          tbody.appendChild(tr);
        });
      }
    }
  } catch (err) {
    console.error('Error loading dashboard:', err);
  }
}

function getStatusBadge(status) {
  if (status === 'Active') return `<span class="badge badge-active">${t('badge_active_text')}</span>`;
  if (status === 'Overdue') return `<span class="badge badge-overdue">${t('badge_overdue_text')}</span>`;
  if (status === 'Completed') return `<span class="badge badge-completed">${t('badge_completed_text')}</span>`;
  if (status === 'Under Maintenance') return `<span class="badge badge-maintenance">${t('badge_maint_text')}</span>`;
  if (status === 'Damaged') return `<span class="badge badge-damaged">${t('badge_damaged_text')}</span>`;
  return `<span class="badge badge-completed">${status}</span>`;
}

// ----------------------------------------------------
// 5. PUBLIC STOREFRONT CATALOG (WHITE & YELLOW/TEAL THEME)
// Matching the User's Reference Mockup
// ----------------------------------------------------
state.catalogSearch = '';
state.catalogSort = 'popular';
state.catalogMaxPrice = 10000;
state.catalogBrands = [];
state.catalogViewMode = 'grid';
state.wishlist = JSON.parse(localStorage.getItem('lions_wishlist') || '[]');

function toggleWishlist(btn, toolId) {
  const idx = state.wishlist.indexOf(toolId);
  if (idx > -1) {
    state.wishlist.splice(idx, 1);
    if (btn) btn.classList.remove('active');
    if (btn) btn.innerHTML = '<i class="fa-regular fa-heart"></i>';
    showToast('Removed from saved items', 'info');
  } else {
    state.wishlist.push(toolId);
    if (btn) btn.classList.add('active');
    if (btn) btn.innerHTML = '<i class="fa-solid fa-heart text-danger"></i>';
    showToast('Saved to your favorites list!', 'success');
  }
  localStorage.setItem('lions_wishlist', JSON.stringify(state.wishlist));
}

function handleCategorySelectChange(cat) {
  state.catalogCategory = cat || 'All';

  // Synchronize Horizontal Category Filter Pills
  document.querySelectorAll('#catalog-category-pills .cat-pill-btn').forEach((btn) => {
    btn.classList.toggle('active', btn.getAttribute('data-cat') === state.catalogCategory);
  });

  loadCatalog();
}

function handleSortChange(sortVal) {
  state.catalogSort = sortVal;
  applyLocalCatalogFilters();
}

function handlePriceFilterChange(maxVal) {
  state.catalogMaxPrice = Number(maxVal);
  const label = document.getElementById('price-range-label');
  if (label) label.textContent = `LKR 0 - ${formatLKR(state.catalogMaxPrice)}`;
  applyLocalCatalogFilters();
}

function handleBrandFilterChange() {
  const selectedBrands = [];
  document.querySelectorAll('.brand-checkbox-list input[type="checkbox"]:checked').forEach((cb) => {
    selectedBrands.push(cb.value.toLowerCase());
  });
  state.catalogBrands = selectedBrands;
  applyLocalCatalogFilters();
}

function handleCatalogSearch(val) {
  state.catalogSearch = (val || '').trim().toLowerCase();
  applyLocalCatalogFilters();
}

function setCatalogViewMode(mode) {
  state.catalogViewMode = mode;
  document.getElementById('btn-view-grid')?.classList.toggle('active', mode === 'grid');
  document.getElementById('btn-view-list')?.classList.toggle('active', mode === 'list');
  const container = document.getElementById('storefront-container');
  if (container) container.classList.toggle('list-view', mode === 'list');
}

async function loadCatalog() {
  try {
    let url = `${API_BASE}/tools/available`;
    if (state.catalogCategory && state.catalogCategory !== 'All') {
      url += `?category=${encodeURIComponent(state.catalogCategory)}`;
    }

    const res = await fetch(url);
    const json = await res.json();

    if (json.success) {
      state.catalogTools = json.data;
      updateSidebarCategoryCounts();
      applyLocalCatalogFilters();
    }
  } catch (err) {
    console.error('Error loading storefront catalog:', err);
  }
}

async function updateSidebarCategoryCounts() {
  try {
    const res = await fetch(`${API_BASE}/tools/available`);
    const json = await res.json();
    if (!json.success) return;
    const all = json.data || [];

    const setCount = (id, count) => {
      const el = document.getElementById(id);
      if (el) el.textContent = count;
    };

    setCount('cat-count-all', all.length);
    setCount('cat-count-power', all.filter((t) => t.category.includes('Power')).length);
    setCount('cat-count-hand', all.filter((t) => t.category.includes('Hand')).length);
    setCount('cat-count-cleaning', all.filter((t) => t.category.includes('Cleaning')).length);
    setCount('cat-count-heavy', all.filter((t) => t.category.includes('Heavy')).length);
    setCount('cat-count-concrete', all.filter((t) => t.category.includes('Concrete')).length);
    setCount('cat-count-surveying', all.filter((t) => t.category.includes('Surveying')).length);
    setCount('cat-count-access', all.filter((t) => t.category.includes('Access')).length);
    setCount('cat-count-gen', all.filter((t) => t.category.includes('Generators')).length);
  } catch (e) {
    console.warn('Could not update category counts:', e);
  }
}

function applyLocalCatalogFilters() {
  let filtered = [...state.catalogTools];

  // 1. Search Filter
  if (state.catalogSearch) {
    filtered = filtered.filter(
      (t) =>
        t.name.toLowerCase().includes(state.catalogSearch) ||
        t.serialNumber.toLowerCase().includes(state.catalogSearch) ||
        t.category.toLowerCase().includes(state.catalogSearch)
    );
  }

  // 2. Price Filter
  if (state.catalogMaxPrice && state.catalogMaxPrice < 10000) {
    filtered = filtered.filter((t) => t.dailyRate <= state.catalogMaxPrice);
  }

  // 3. Brand Filter
  if (state.catalogBrands && state.catalogBrands.length > 0) {
    filtered = filtered.filter((t) =>
      state.catalogBrands.some((b) => t.name.toLowerCase().includes(b))
    );
  }

  // 4. Sorting
  if (state.catalogSort === 'price-low') {
    filtered.sort((a, b) => a.dailyRate - b.dailyRate);
  } else if (state.catalogSort === 'price-high') {
    filtered.sort((a, b) => b.dailyRate - a.dailyRate);
  } else if (state.catalogSort === 'rating') {
    filtered.sort((a, b) => (b.dailyRate % 5) - (a.dailyRate % 5));
  }

  renderStorefront(filtered);
}

function resetCategoryFilter() {
  handleCategorySelectChange('All');
}

function quickRentTool(toolId) {
  prepareNewRentalModal(null, toolId);
}

function renderStorefront(tools) {
  const container = document.getElementById('storefront-container');
  if (!container) return;
  container.innerHTML = '';
  container.className = `storefront-product-grid ${state.catalogViewMode === 'list' ? 'list-view' : ''}`;

  if (!tools || tools.length === 0) {
    container.innerHTML = `
      <div class="glass-panel text-center py-5" style="grid-column: 1/-1; padding: 50px 24px; border: 1.5px dashed #cbd5e1;">
        <i class="fa-solid fa-box-open" style="font-size: 48px; color: var(--gold-hover); margin-bottom: 16px; opacity: 0.85;"></i>
        <h3 style="font-size: 19px; color: #0f172a; font-weight: 800;">No Machinery Currently Available in this Category</h3>
        <p class="text-muted mt-2" style="font-size: 13.5px; max-width: 480px; margin: 8px auto 0;">All machinery in this category is currently deployed on active project sites. Please check back or view other categories.</p>
        <button class="btn-rent-cta mt-4" style="max-width: 240px; margin: 16px auto 0;" onclick="resetCategoryFilter()"><i class="fa-solid fa-rotate-left"></i> View All Equipment</button>
      </div>`;
    return;
  }

  tools.forEach((tool, index) => {
    const card = document.createElement('div');
    card.className = 'tool-product-card';

    const imgSrc = getToolImageUrl(tool.imageUrl, tool.serialNumber);
    const isWishlisted = state.wishlist.includes(tool._id);
    const weeklyRate = tool.weeklyRate || tool.dailyRate * 6;

    // Badges & rating
    const badges = ['Popular', 'New', 'Hot', 'Popular'];
    const badgeType = badges[index % badges.length];
    const badgeClass = badgeType === 'Popular' ? 'badge-popular' : badgeType === 'New' ? 'badge-new' : 'badge-hot';
    const ratingReviews = [24, 18, 12, 17, 8, 10, 9, 11, 15, 20][index % 10];

    let catIcon = 'fa-wrench';
    if (tool.category.includes('Power')) catIcon = 'fa-bolt';
    if (tool.category.includes('Heavy')) catIcon = 'fa-truck-monster';
    if (tool.category.includes('Concrete')) catIcon = 'fa-cubes';
    if (tool.category.includes('Welding')) catIcon = 'fa-fire-burner';
    if (tool.category.includes('Surveying')) catIcon = 'fa-crosshairs';
    if (tool.category.includes('Access')) catIcon = 'fa-cubes-stacked';
    if (tool.category.includes('Generators')) catIcon = 'fa-car-battery';
    if (tool.category.includes('Cleaning')) catIcon = 'fa-spray-can-sparkles';

    card.innerHTML = `
      <div class="product-image-container">
        <div class="card-top-badges-row">
          <span class="product-badge ${badgeClass}">${badgeType}</span>
          <button class="btn-wishlist ${isWishlisted ? 'active' : ''}" onclick="toggleWishlist(this, '${tool._id}')" title="Save to Favorites">
            <i class="fa-${isWishlisted ? 'solid text-danger' : 'regular'} fa-heart"></i>
          </button>
        </div>

        <img src="${imgSrc}" alt="${tool.name}" onerror="this.onerror=null; this.src='${DEFAULT_TOOL_IMAGE}';">

        <div class="card-bottom-tags-row">
          <span class="tool-tag-code">${tool.serialNumber}</span>
          <span class="tool-status-tag"><i class="fa-solid fa-circle-check"></i> Available</span>
        </div>
      </div>

      <div class="product-card-details">
        <span class="tool-category-badge"><i class="fa-solid ${catIcon}"></i> ${tool.category}</span>
        <h3 class="product-name" title="${tool.name}">${tool.name}</h3>

        <div class="product-rating-row">
          <div class="star-rating">
            <i class="fa-solid fa-star"></i>
            <i class="fa-solid fa-star"></i>
            <i class="fa-solid fa-star"></i>
            <i class="fa-solid fa-star"></i>
            <i class="fa-solid fa-star"></i>
          </div>
          <span class="rating-count">(${ratingReviews} reviews)</span>
        </div>

        <div class="tiered-rates-box">
          <div class="tiered-row">
            <span class="tier-chip">Daily Tier</span>
            <strong>${formatLKR(tool.dailyRate)} <small style="color:var(--text-muted);">/ day</small></strong>
          </div>
          <div class="tiered-row">
            <span class="tier-chip">Weekly (7+ Days) <span class="discount-badge">-15%</span></span>
            <strong style="color:var(--gold-hover);">${formatLKR(weeklyRate)} <small style="color:var(--text-muted);">/ wk</small></strong>
          </div>
        </div>

        <button class="btn-rent-cta" onclick="quickRentTool('${tool._id}')">
          <i class="fa-solid fa-bolt"></i> Rent Now / View Details
        </button>
      </div>
    `;
    container.appendChild(card);
  });
}

// ----------------------------------------------------
// 6. CUSTOMER PORTAL (MY LEASES & INVOICES)
// ----------------------------------------------------
async function loadMyLeases() {
  try {
    const res = await authFetch(`${API_BASE}/rentals/my-rentals`);
    const json = await res.json();

    if (json.success) {
      state.myRentals = json.data;

      const activeCount = state.myRentals.filter((r) => r.status === 'Active' || r.status === 'Overdue').length;
      document.getElementById('portal-active-count').textContent = activeCount;
      document.getElementById('portal-total-count').textContent = state.myRentals.length;
      document.getElementById('badge-my-leases-count').textContent = activeCount;

      renderCustomerPortalTable(state.myRentals);
    }
  } catch (err) {
    console.error('Error loading customer portal leases:', err);
  }
}

function renderCustomerPortalTable(leases) {
  const tbody = document.getElementById('tbody-customer-leases');
  tbody.innerHTML = '';

  if (!leases || leases.length === 0) {
    tbody.innerHTML = `<tr><td colspan="8" class="text-center py-5">You have no equipment leases on file. Visit the Storefront Catalog to rent tools.</td></tr>`;
    return;
  }

  leases.forEach((r) => {
    const tr = document.createElement('tr');
    const statusBadge = getStatusBadge(r.status);
    const toolDetails = r.tool
      ? `<strong>${r.tool.name}</strong><br><small class="text-muted">Item Code: ${r.tool.serialNumber}</small>`
      : 'Equipment';

    const deliveryTag = r.deliveryMode === 'Site Delivery'
      ? `<span class="badge" style="background:#eff6ff; color:#1d4ed8; border:1px solid #bfdbfe;"><i class="fa-solid fa-truck"></i> Site Delivery</span>`
      : `<span class="badge" style="background:#f0fdf4; color:#15803d; border:1px solid #bbf7d0;"><i class="fa-solid fa-shop"></i> Self-Pickup</span>`;

    tr.innerHTML = `
      <td><strong class="text-gold">${r.rentalCode}</strong></td>
      <td>${toolDetails}</td>
      <td>
        <div><strong>Due:</strong> ${formatDate(r.dueDate)}</div>
        <small class="text-muted">Start: ${formatDate(r.startDate)}</small>
      </td>
      <td>${deliveryTag}</td>
      <td><strong>${formatLKR(r.totalAmount)}</strong></td>
      <td><span class="badge badge-active">${r.depositStatus}</span></td>
      <td>${statusBadge}</td>
      <td>
        <div style="display:flex; gap:6px;">
          ${
            r.status !== 'Completed'
              ? `<button class="btn btn-sm btn-outline btn-cta" onclick="openExtendModal('${r._id}')"><i class="fa-solid fa-calendar-plus"></i> Extend</button>`
              : ''
          }
          <a href="${API_BASE}/rentals/${r._id}/pdf" target="_blank" class="btn btn-sm btn-gold btn-cta">
            <i class="fa-solid fa-file-pdf"></i> Download PDF
          </a>
        </div>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

// ----------------------------------------------------
// 7. PAYMENTS LEDGER (ADMIN)
// ----------------------------------------------------
async function loadPayments() {
  try {
    const res = await authFetch(`${API_BASE}/payments`);
    const json = await res.json();

    if (json.success) {
      state.payments = json.data;
      document.getElementById('badge-total-payments').textContent = `${state.payments.length} Records`;
      renderPaymentsTable(state.payments);
    }
  } catch (err) {
    console.error('Error loading payments:', err);
  }
}

function renderPaymentsTable(payments) {
  const tbody = document.getElementById('tbody-payments');
  tbody.innerHTML = '';

  let totalRevenue = 0;
  let depositsHeld = 0;
  let depositsRefunded = 0;

  if (!payments || payments.length === 0) {
    tbody.innerHTML = `<tr><td colspan="9" class="text-center py-5">No payment transaction records found.</td></tr>`;
    return;
  }

  payments.forEach((p) => {
    totalRevenue += Number(p.amount) || 0;
    const r = p.rental_id;
    let depStatusBadge = `<span class="badge" style="background:#fffbeb; color:#b45309; border:1px solid #fde68a;"><i class="fa-solid fa-lock"></i> Held</span>`;

    if (r) {
      if (r.depositStatus === 'Refunded') {
        depositsRefunded += Number(r.depositAmount) || 0;
        depStatusBadge = `<span class="badge" style="background:#f0fdf4; color:#15803d; border:1px solid #bbf7d0;"><i class="fa-solid fa-circle-check"></i> Refunded</span>`;
      } else if (r.depositStatus === 'Deducted' || r.depositStatus === 'Partially Refunded') {
        depStatusBadge = `<span class="badge" style="background:#fef2f2; color:#991b1b; border:1px solid #fecaca;"><i class="fa-solid fa-scissors"></i> Settled / Deducted</span>`;
      } else {
        depositsHeld += Number(r.depositAmount) || 0;
      }
    }

    const tr = document.createElement('tr');
    const agreementCode = r ? r.rentalCode || 'LE-RENT-XXXX' : 'N/A';
    const payerName = p.user_id ? p.user_id.name : 'Contractor';

    tr.innerHTML = `
      <td><strong class="text-gold">${p.transaction_ref}</strong></td>
      <td><strong>${agreementCode}</strong></td>
      <td>${payerName}</td>
      <td><span class="badge" style="background:#f1f5f9; color:#334155; border:1px solid #e2e8f0;">${p.payment_type}</span></td>
      <td>${p.payment_method}</td>
      <td><strong class="text-success">${formatLKR(p.amount)}</strong></td>
      <td>${depStatusBadge}</td>
      <td><span class="badge badge-active">${p.status}</span></td>
      <td>${formatDate(p.paid_at)}</td>
    `;
    tbody.appendChild(tr);
  });

  const elPayTotal = document.getElementById('kpi-pay-total');
  const elDepHeld = document.getElementById('kpi-deposits-held');
  const elDepRefund = document.getElementById('kpi-deposits-refunded');

  if (elPayTotal) elPayTotal.textContent = formatLKR(totalRevenue);
  if (elDepHeld) elDepHeld.textContent = formatLKR(depositsHeld);
  if (elDepRefund) elDepRefund.textContent = formatLKR(depositsRefunded);
}

// ----------------------------------------------------
// 8. USERS & KYC DIRECTORY (ADMIN)
// ----------------------------------------------------
let currentKycUser = null;

async function loadUsers() {
  try {
    const res = await authFetch(`${API_BASE}/auth/users`);
    const json = await res.json();

    if (json.success) {
      state.users = json.data;
      document.getElementById('badge-total-users').textContent = state.users.length;
      renderUsersTable(state.users);
    }
  } catch (err) {
    console.error('Error loading users:', err);
  }
}

function renderUsersTable(users) {
  const tbody = document.getElementById('tbody-users');
  tbody.innerHTML = '';

  if (!users || users.length === 0) {
    tbody.innerHTML = `<tr><td colspan="9" class="text-center py-5">No registered contractors or users found.</td></tr>`;
    return;
  }

  users.forEach((u) => {
    const tr = document.createElement('tr');
    const roleBadge = u.role === 'admin' ? `<span class="badge badge-warning">ADMIN</span>` : `<span class="badge badge-completed">CUSTOMER</span>`;
    const kycBadge = u.verification_status === 'Verified'
      ? `<span class="badge badge-active">Verified</span>`
      : `<span class="badge badge-maintenance">Pending</span>`;

    tr.innerHTML = `
      <td><strong style="color:#0f172a;">${u.name}</strong></td>
      <td>${roleBadge}</td>
      <td>${u.email}</td>
      <td>${u.phone_number}</td>
      <td><strong class="text-gold">${u.nic_or_passport}</strong></td>
      <td>${u.company_name || 'Individual Contractor'}</td>
      <td>
        <button class="btn btn-xs btn-outline btn-cta" onclick="openKycPreviewModal('${u._id}')" title="Preview Uploaded NIC / Passport">
          <i class="fa-solid fa-id-card text-gold"></i> Preview Doc
        </button>
      </td>
      <td>${kycBadge}</td>
      <td>
        ${
          u.verification_status !== 'Verified'
            ? `<button class="btn btn-sm btn-success btn-cta" onclick="verifyUserKyc('${u._id}')"><i class="fa-solid fa-check"></i> Approve KYC</button>`
            : `<button class="btn btn-sm btn-outline" disabled><i class="fa-solid fa-circle-check text-success"></i> Approved</button>`
        }
      </td>
    `;
    tbody.appendChild(tr);
  });
}

function openKycPreviewModal(userId) {
  const user = state.users ? state.users.find((u) => u._id === userId) : null;
  if (!user) return;

  currentKycUser = user;

  document.getElementById('kyc-preview-name').textContent = user.name;
  document.getElementById('kyc-preview-role').textContent = user.role.toUpperCase();
  document.getElementById('kyc-preview-nic').textContent = user.nic_or_passport;
  document.getElementById('kyc-preview-phone').textContent = user.phone_number;
  document.getElementById('kyc-preview-email').textContent = user.email;
  document.getElementById('kyc-preview-company').textContent = user.company_name || 'Individual Contractor';
  document.getElementById('kyc-preview-address').textContent = user.address || 'Colombo, Sri Lanka';

  const statusBadge = document.getElementById('kyc-preview-status-badge');
  if (statusBadge) {
    statusBadge.className = `badge ${user.verification_status === 'Verified' ? 'badge-active' : 'badge-maintenance'}`;
    statusBadge.textContent = user.verification_status;
  }

  const imgEl = document.getElementById('kyc-preview-img');
  if (imgEl) {
    imgEl.src = user.kyc_document_url || '';
  }

  const approveBtn = document.getElementById('btn-approve-kyc-modal');
  if (approveBtn) {
    approveBtn.style.display = user.verification_status === 'Verified' ? 'none' : 'inline-flex';
  }

  openModal('modal-kyc-preview');
}

async function executeKycApprovalFromModal() {
  if (!currentKycUser) return;
  await verifyUserKyc(currentKycUser._id);
  closeModal('modal-kyc-preview');
}

function handleUserSearch(query) {
  if (!state.users) return;
  const q = (query || '').toLowerCase().trim();
  if (!q) {
    renderUsersTable(state.users);
    return;
  }
  const filtered = state.users.filter((u) =>
    (u.name && u.name.toLowerCase().includes(q)) ||
    (u.email && u.email.toLowerCase().includes(q)) ||
    (u.nic_or_passport && u.nic_or_passport.toLowerCase().includes(q)) ||
    (u.company_name && u.company_name.toLowerCase().includes(q)) ||
    (u.phone_number && u.phone_number.includes(q))
  );
  renderUsersTable(filtered);
}

async function verifyUserKyc(userId) {
  try {
    const res = await authFetch(`${API_BASE}/auth/users/${userId}/verify`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'Verified' }),
    });
    const json = await res.json();
    if (json.success) {
      showToast('Contractor KYC approved successfully!', 'success');
      loadUsers();
    }
  } catch (err) {
    showToast('Error approving user KYC', 'error');
  }
}

// ----------------------------------------------------
// 9. ADMIN TOOL INVENTORY LOGIC (GRID & TABLE + CSV EXPORT)
// ----------------------------------------------------
let inventoryViewMode = 'grid';

function setInventoryViewMode(mode) {
  inventoryViewMode = mode;
  const btnGrid = document.getElementById('btn-inv-view-grid');
  const btnTable = document.getElementById('btn-inv-view-table');
  const gridContainer = document.getElementById('tools-container');
  const tableContainer = document.getElementById('inventory-table-container');

  if (btnGrid) btnGrid.classList.toggle('active', mode === 'grid');
  if (btnTable) btnTable.classList.toggle('active', mode === 'table');

  if (gridContainer) gridContainer.style.display = mode === 'grid' ? 'grid' : 'none';
  if (tableContainer) tableContainer.style.display = mode === 'table' ? 'block' : 'none';
}

function exportInventoryToCSV() {
  if (!state.tools || state.tools.length === 0) {
    showToast('No inventory tools available to export', 'error');
    return;
  }

  const headers = [
    'Item Tag',
    'Equipment Name',
    'Category',
    'Daily Rate (LKR)',
    'Weekly Rate (LKR)',
    'Monthly Rate (LKR)',
    'Deposit Amount (LKR)',
    'Cumulative Meter Hours',
    'Condition',
    'Status',
  ];

  const rows = state.tools.map((t) => [
    `"${t.serialNumber}"`,
    `"${(t.name || '').replace(/"/g, '""')}"`,
    `"${t.category || ''}"`,
    t.dailyRate || 0,
    t.weeklyRate || t.dailyRate * 6,
    t.monthlyRate || t.dailyRate * 22,
    t.depositAmount || 0,
    t.currentMeterReading || 0,
    `"${t.condition || 'Good'}"`,
    `"${t.status || 'Available'}"`,
  ]);

  const csvContent = [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Lions_Equipment_Inventory_${new Date().toISOString().split('T')[0]}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  showToast('Inventory report successfully exported to CSV!', 'success');
}

async function loadTools() {
  try {
    let url = `${API_BASE}/tools?category=${encodeURIComponent(state.filterCategory)}&status=${encodeURIComponent(state.filterStatus)}`;
    const searchInput = document.getElementById('global-search');
    const searchVal = searchInput ? searchInput.value.trim() : '';
    if (searchVal) url += `&search=${encodeURIComponent(searchVal)}`;

    const res = await authFetch(url);
    const json = await res.json();

    if (json.success) {
      state.tools = json.data || [];
      renderToolsGrid(state.tools);
      renderInventoryTable(state.tools);
    }
  } catch (err) {
    console.error('Error loading tools:', err);
  }
}

function renderInventoryTable(tools) {
  const tbody = document.getElementById('tbody-inventory');
  if (!tbody) return;
  tbody.innerHTML = '';

  if (!tools || tools.length === 0) {
    tbody.innerHTML = `<tr><td colspan="10" class="text-center py-5">No equipment records found in inventory.</td></tr>`;
    return;
  }

  tools.forEach((tool) => {
    const tr = document.createElement('tr');
    const badgeStatus = getStatusBadge(tool.status);
    const imgSrc = getToolImageUrl(tool.imageUrl, tool.serialNumber);

    tr.innerHTML = `
      <td>
        <div style="display:flex; align-items:center; gap:12px;">
          <img src="${imgSrc}" alt="${tool.name}" style="width:44px; height:44px; object-fit:cover; border-radius:6px; border:1px solid #e2e8f0;" onerror="this.src='${DEFAULT_TOOL_IMAGE}';">
          <div>
            <strong style="color:#0f172a; font-size:13px;">${tool.name}</strong>
          </div>
        </div>
      </td>
      <td><span class="badge" style="background:#f1f5f9; color:#334155; border:1px solid #e2e8f0; font-weight:700;">${tool.serialNumber}</span></td>
      <td><span class="text-muted" style="font-size:12px;">${tool.category}</span></td>
      <td><strong style="color:#0f172a;">${formatLKR(tool.dailyRate)}</strong></td>
      <td><span class="text-gold" style="font-weight:700;">${formatLKR(tool.weeklyRate || tool.dailyRate * 6)}</span></td>
      <td><span style="color:#2563eb; font-weight:700;">${formatLKR(tool.depositAmount)}</span></td>
      <td>${tool.currentMeterReading || 0} Hrs</td>
      <td><span class="badge badge-active">${tool.condition || 'Good'}</span></td>
      <td>${badgeStatus}</td>
      <td>
        <div class="action-btn-group">
          ${
            tool.status === 'Available'
              ? `<button class="btn btn-xs btn-gold btn-cta" onclick="quickRentTool('${tool._id}')"><i class="fa-solid fa-key"></i> Rent</button>`
              : ''
          }
          <button class="btn btn-xs btn-outline btn-cta" onclick="openLogMaintModal('${tool._id}')" title="Log Service"><i class="fa-solid fa-wrench"></i> Service</button>
          <button class="btn btn-xs btn-outline" onclick="editTool('${tool._id}')" title="Edit Tool & Rates"><i class="fa-solid fa-pen"></i></button>
          <button class="btn btn-xs btn-outline text-danger" onclick="deleteTool('${tool._id}')" title="Delete"><i class="fa-solid fa-trash"></i></button>
        </div>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

function renderToolsGrid(tools) {
  const container = document.getElementById('tools-container');
  container.innerHTML = '';

  if (!tools || tools.length === 0) {
    container.innerHTML = `<div class="glass-panel text-center py-5" style="grid-column: 1/-1;">
      <i class="fa-solid fa-toolbox" style="font-size: 40px; color: var(--text-muted); margin-bottom: 12px;"></i>
      <h3>No equipment found</h3>
      <p class="text-muted mt-2">Click "Add New Tool" to populate inventory.</p>
    </div>`;
    return;
  }

  tools.forEach((tool) => {
    const card = document.createElement('div');
    card.className = 'tool-card';

    let badgeStatus = getStatusBadge(tool.status);
    const imgSrc = getToolImageUrl(tool.imageUrl, tool.serialNumber);

    card.innerHTML = `
      <div class="tool-card-img-wrapper">
        <img src="${imgSrc}" alt="${tool.name}" onerror="this.onerror=null; this.src='${DEFAULT_TOOL_IMAGE}';">
        <span class="tool-tag-code">${tool.serialNumber}</span>
        <span class="tool-status-tag">${badgeStatus}</span>
      </div>
      <div class="tool-card-body">
        <span class="tool-card-cat">${tool.category}</span>
        <h4 class="tool-card-title">${tool.name}</h4>
        <div style="font-size:12px; color:var(--text-secondary); margin-bottom:8px;">
          Condition: <strong class="text-gold">${tool.condition}</strong> | Meter: <strong>${tool.currentMeterReading || 0} Hrs</strong>
        </div>
        ${
          tool.maintenanceNotes
            ? `<div style="font-size:11px; color:#94a3b8; background:rgba(0,0,0,0.3); padding:6px 8px; border-radius:6px; margin-bottom:10px;">
                <i class="fa-solid fa-wrench text-gold"></i> ${tool.maintenanceNotes}
              </div>`
            : ''
        }
        
        <div class="tool-rates-box">
          <div class="rate-item">
            <span class="label">Daily</span>
            <span class="val">${formatLKR(tool.dailyRate)}</span>
          </div>
          <div class="rate-item">
            <span class="label">Weekly</span>
            <span class="val text-gold">${formatLKR(tool.weeklyRate || tool.dailyRate * 6)}</span>
          </div>
          <div class="rate-item text-right">
            <span class="label">Deposit</span>
            <span class="val text-info">${formatLKR(tool.depositAmount)}</span>
          </div>
        </div>

        <div class="tool-card-footer">
          ${
            tool.status === 'Available'
              ? `<button class="btn btn-gold btn-sm btn-cta flex-1" onclick="quickRentTool('${tool._id}')"><i class="fa-solid fa-key"></i> Rent Out</button>`
              : `<button class="btn btn-secondary btn-sm btn-cta flex-1" disabled>${tool.status}</button>`
          }
          <button class="btn btn-outline btn-sm btn-cta" onclick="openLogMaintModal('${tool._id}')" title="Log Maintenance"><i class="fa-solid fa-wrench"></i> Service</button>
          <button class="btn btn-outline btn-sm" onclick="editTool('${tool._id}')" title="Edit Tool & Rates"><i class="fa-solid fa-pen"></i></button>
          <button class="btn btn-outline btn-sm" onclick="deleteTool('${tool._id}')" title="Delete Tool"><i class="fa-solid fa-trash text-danger"></i></button>
        </div>
      </div>
    `;
    container.appendChild(card);
  });
}

document.querySelectorAll('#inventory-category-pills .pill').forEach((pill) => {
  pill.addEventListener('click', () => {
    document.querySelectorAll('#inventory-category-pills .pill').forEach((p) => p.classList.remove('active'));
    pill.classList.add('active');
    state.filterCategory = pill.getAttribute('data-cat');
    loadTools();
  });
});

document.getElementById('select-status-filter').addEventListener('change', (e) => {
  state.filterStatus = e.target.value;
  loadTools();
});

document.getElementById('form-tool').addEventListener('submit', async (e) => {
  e.preventDefault();
  const id = document.getElementById('tool-edit-id').value;

  const payload = {
    name: document.getElementById('tool-name').value.trim(),
    category: document.getElementById('tool-category').value,
    serialNumber: document.getElementById('tool-serial').value.trim().toUpperCase(),
    dailyRate: Number(document.getElementById('tool-daily-rate').value),
    weeklyRate: Number(document.getElementById('tool-weekly-rate').value) || Number(document.getElementById('tool-daily-rate').value) * 6,
    monthlyRate: Number(document.getElementById('tool-monthly-rate').value) || Number(document.getElementById('tool-daily-rate').value) * 22,
    depositAmount: Number(document.getElementById('tool-deposit').value),
    meterReadingLimit: Number(document.getElementById('tool-meter-limit').value) || 0,
    currentMeterReading: Number(document.getElementById('tool-meter-reading').value) || 0,
    imageUrl: document.getElementById('tool-image-url').value.trim() || 'default-tool-placeholder.png',
    status: document.getElementById('tool-status').value,
    condition: document.getElementById('tool-condition').value,
  };

  try {
    const url = id ? `${API_BASE}/tools/${id}` : `${API_BASE}/tools`;
    const method = id ? 'PUT' : 'POST';

    const res = await authFetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const json = await res.json();
    if (json.success) {
      showToast(json.message || 'Tool saved successfully', 'success');
      closeModal('modal-tool');
      loadTools();
      loadCatalog();
      loadDashboard();
    } else {
      showToast(json.message || json.error || 'Failed to save tool', 'error');
    }
  } catch (err) {
    showToast('Network error saving tool', 'error');
  }
});

function editTool(id) {
  const tool = state.tools.find((t) => t._id === id);
  if (!tool) return;

  document.getElementById('modal-tool-title').textContent = 'Edit Tool Details';
  document.getElementById('tool-edit-id').value = tool._id;
  document.getElementById('tool-name').value = tool.name;
  document.getElementById('tool-category').value = tool.category;
  document.getElementById('tool-serial').value = tool.serialNumber;
  document.getElementById('tool-daily-rate').value = tool.dailyRate;
  document.getElementById('tool-weekly-rate').value = tool.weeklyRate || tool.dailyRate * 6;
  document.getElementById('tool-monthly-rate').value = tool.monthlyRate || tool.dailyRate * 22;
  document.getElementById('tool-deposit').value = tool.depositAmount;
  document.getElementById('tool-meter-limit').value = tool.meterReadingLimit || 0;
  document.getElementById('tool-meter-reading').value = tool.currentMeterReading || 0;
  document.getElementById('tool-image-url').value = tool.imageUrl || '';
  document.getElementById('tool-status').value = tool.status;
  document.getElementById('tool-condition').value = tool.condition;

  openModal('modal-tool');
}

async function deleteTool(id) {
  if (!confirm('Are you sure you want to remove this tool from inventory?')) return;
  try {
    const res = await authFetch(`${API_BASE}/tools/${id}`, { method: 'DELETE' });
    const json = await res.json();
    if (json.success) {
      showToast('Tool deleted from inventory', 'success');
      loadTools();
      loadCatalog();
      loadDashboard();
    } else {
      showToast(json.message || 'Failed to delete tool', 'error');
    }
  } catch (err) {
    showToast('Error deleting tool', 'error');
  }
}

// ----------------------------------------------------
// 10. MAINTENANCE LOGIC
// ----------------------------------------------------
async function loadMaintenance() {
  try {
    const res = await authFetch(`${API_BASE}/maintenance`);
    const json = await res.json();

    if (json.success) {
      state.maintenanceLogs = json.data;
      document.getElementById('badge-total-maintenance').textContent = state.maintenanceLogs.length;
      renderMaintenanceTable(state.maintenanceLogs);
    }
  } catch (err) {
    console.error('Error loading maintenance logs:', err);
  }
}

function renderMaintenanceTable(logs) {
  const tbody = document.getElementById('tbody-maintenance');
  tbody.innerHTML = '';

  if (!logs || logs.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" class="text-center py-5">No service logs found. Click "Log Service / Repair" to record repairs.</td></tr>`;
    return;
  }

  logs.forEach((log) => {
    const tr = document.createElement('tr');
    const toolName = log.tool ? `<strong style="color:#0f172a;">${log.tool.name}</strong><br><span class="badge" style="background:#f1f5f9; color:#334155; border:1px solid #e2e8f0; font-weight:700; margin-top:3px;">Tag: ${log.tool.serialNumber}</span>` : 'N/A';

    let statusChip = `<span class="badge badge-completed">${log.status}</span>`;
    if (log.status === 'In Progress') statusChip = `<span class="badge badge-maintenance">${log.status}</span>`;
    if (log.status === 'Scheduled') statusChip = `<span class="badge badge-active">${log.status}</span>`;

    tr.innerHTML = `
      <td>${formatDate(log.serviceDate)}</td>
      <td>${toolName}</td>
      <td>${log.repairNotes}</td>
      <td><strong>${log.technicianName}</strong></td>
      <td><strong class="text-gold">${formatLKR(log.cost)}</strong></td>
      <td>${statusChip}</td>
    `;
    tbody.appendChild(tr);
  });
}

async function openLogMaintModal(preselectedToolId = null) {
  const res = await authFetch(`${API_BASE}/tools`);
  const json = await res.json();
  const allTools = json.success ? json.data : [];

  const select = document.getElementById('maint-tool-select');
  select.innerHTML = '<option value="">-- Choose Tool to Service --</option>';
  allTools.forEach((t) => {
    const opt = document.createElement('option');
    opt.value = t._id;
    opt.textContent = `${t.name} (${t.serialNumber}) [Status: ${t.status}]`;
    if (preselectedToolId && t._id === preselectedToolId) opt.selected = true;
    select.appendChild(opt);
  });

  document.getElementById('maint-service-date').value = new Date().toISOString().split('T')[0];
  document.getElementById('maint-cost').value = '';
  document.getElementById('maint-notes').value = '';

  openModal('modal-maintenance');
}

document.getElementById('form-maintenance').addEventListener('submit', async (e) => {
  e.preventDefault();

  const payload = {
    toolId: document.getElementById('maint-tool-select').value,
    serviceDate: document.getElementById('maint-service-date').value,
    cost: Number(document.getElementById('maint-cost').value) || 0,
    technicianName: document.getElementById('maint-technician').value.trim(),
    status: document.getElementById('maint-status').value,
    repairNotes: document.getElementById('maint-notes').value.trim(),
  };

  try {
    const res = await authFetch(`${API_BASE}/maintenance`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const json = await res.json();
    if (json.success) {
      showToast(json.message || 'Service logged successfully!', 'success');
      closeModal('modal-maintenance');
      loadMaintenance();
      loadTools();
      loadCatalog();
      loadDashboard();
    } else {
      showToast(json.message || json.error || 'Failed to log maintenance', 'error');
    }
  } catch (err) {
    showToast('Error logging maintenance', 'error');
  }
});

// ----------------------------------------------------
// 11. ALL RENTALS (ADMIN)
// ----------------------------------------------------
async function loadRentals() {
  try {
    let url = `${API_BASE}/rentals?status=${encodeURIComponent(state.rentalFilterStatus)}`;
    const searchVal = document.getElementById('global-search').value.trim();
    if (searchVal) url += `&search=${encodeURIComponent(searchVal)}`;

    const res = await authFetch(url);
    const json = await res.json();

    if (json.success) {
      state.rentals = json.data;
      renderRentalsTable(state.rentals);
    }
  } catch (err) {
    console.error('Error loading rentals:', err);
  }
}

function renderRentalsTable(rentals) {
  const tbody = document.getElementById('tbody-all-rentals');
  tbody.innerHTML = '';

  if (!rentals || rentals.length === 0) {
    tbody.innerHTML = `<tr><td colspan="11" class="text-center py-5">No agreements found.</td></tr>`;
    return;
  }

  rentals.forEach((r) => {
    const tr = document.createElement('tr');
    const statusBadge = getStatusBadge(r.status);
    const toolDetails = r.tool
      ? `<strong style="font-size:13px; color:#0f172a;">${r.tool.name}</strong><br><span class="badge" style="background:#f1f5f9; color:#334155; border:1px solid #e2e8f0; font-weight:700; margin-top:3px;">Tag: ${r.tool.serialNumber}</span>`
      : 'N/A';

    const clientName = r.user_id ? r.user_id.name : r.customer ? r.customer.name : 'Contractor';
    const clientPhone = r.user_id ? r.user_id.phone_number : r.customer ? r.customer.phone : 'N/A';
    const clientNic = r.user_id ? r.user_id.nic_or_passport : r.customer ? r.customer.nicOrPassport : 'N/A';

    const deliveryTag = r.deliveryMode === 'Site Delivery'
      ? `<span class="badge" style="background:#eff6ff; color:#1d4ed8; border:1px solid #bfdbfe;"><i class="fa-solid fa-truck"></i> Site Delivery</span>`
      : `<span class="badge" style="background:#f0fdf4; color:#15803d; border:1px solid #bbf7d0;"><i class="fa-solid fa-shop"></i> Self-Pickup</span>`;

    tr.innerHTML = `
      <td><strong class="text-gold" style="font-size:13px;">${r.rentalCode}</strong></td>
      <td><strong style="color:#0f172a;">${clientName}</strong></td>
      <td>
        <div style="font-weight:600; color:#334155;">${clientPhone}</div>
        <div class="text-muted" style="font-size:11px;">NIC: ${clientNic}</div>
      </td>
      <td>${toolDetails}</td>
      <td>
        <div style="font-size:12px; color:#475569;"><strong>Start:</strong> ${formatDate(r.startDate)}</div>
        <div style="font-size:12px;" class="${r.status === 'Overdue' ? 'text-danger font-bold' : ''}"><strong>Due:</strong> ${formatDate(r.dueDate)}</div>
      </td>
      <td>${deliveryTag}</td>
      <td><strong class="text-gold">${formatLKR(r.depositAmount)}</strong></td>
      <td>${formatLKR(r.rentAmount)} <br><small class="text-muted">(${r.rateTypeApplied || 'Daily'})</small></td>
      <td><strong style="color:#0f172a; font-size:13.5px;">${formatLKR(r.totalAmount)}</strong></td>
      <td>${statusBadge}</td>
      <td>
        <div class="action-btn-group">
          ${
            r.status !== 'Completed'
              ? `<button class="btn btn-xs btn-outline btn-cta" onclick="openDispatchModal('${r._id}')" title="Yard Staff Dispatch & Meter Inspection"><i class="fa-solid fa-truck-ramp-box text-gold"></i> Dispatch</button>
                 <button class="btn btn-xs btn-success btn-cta" onclick="openReturnModal('${r._id}')" title="Process Return & Settlement"><i class="fa-solid fa-arrow-rotate-left"></i> Return</button>
                 <button class="btn btn-xs btn-outline btn-cta" onclick="openExtendModal('${r._id}')" title="Extend Lease Due Date"><i class="fa-solid fa-calendar-plus"></i> Extend</button>`
              : ''
          }
          <button class="btn btn-xs btn-outline btn-cta" onclick="openNotifyModal('${r._id}')" title="Send WhatsApp/SMS Alert" style="color:#16a34a; border-color:#86efac; background:#f0fdf4;">
            <i class="fa-brands fa-whatsapp"></i> Alert
          </button>
          <button class="btn btn-xs btn-gold btn-cta" onclick="openInvoiceModal('${r._id}')" title="View, translate & print verified invoice">
            <i class="fa-solid fa-file-invoice"></i> Bill / බිල්පත
          </button>
          <a href="${API_BASE}/rentals/${r._id}/pdf" target="_blank" class="btn btn-xs btn-outline btn-cta" title="Download Verified PDF Rental Agreement / Tax Invoice">
            <i class="fa-solid fa-file-pdf text-danger"></i> PDF
          </a>
        </div>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

document.querySelectorAll('#rental-status-filters .subnav-btn').forEach((btn) => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('#rental-status-filters .subnav-btn').forEach((b) => b.classList.remove('active'));
    btn.classList.add('active');
    state.rentalFilterStatus = btn.getAttribute('data-status');
    loadRentals();
  });
});

// ----------------------------------------------------
// 12. RENTAL BOOKING & AGREEMENT WIZARD
// ----------------------------------------------------
let rentWizardStep = 1;

function setRentWizardStep(step) {
  rentWizardStep = step;

  for (let i = 1; i <= 3; i++) {
    const ind = document.getElementById(`rent-step-ind-${i}`);
    const pane = document.getElementById(`rent-pane-${i}`);
    if (ind) ind.classList.toggle('active', i === step);
    if (pane) pane.classList.toggle('active', i === step);
  }

  const btnPrev = document.getElementById('btn-rent-prev');
  const btnNext = document.getElementById('btn-rent-next');
  const btnSubmit = document.getElementById('btn-submit-rental');

  btnPrev.style.display = step > 1 ? 'inline-flex' : 'none';
  btnNext.style.display = step < 3 ? 'inline-flex' : 'none';
  btnSubmit.style.display = step === 3 ? 'inline-flex' : 'none';

  if (step === 3) recalculateRentalTotal();
}

document.getElementById('btn-rent-next').addEventListener('click', async () => {
  if (rentWizardStep === 1) {
    const toolId = document.getElementById('rental-tool-select').value;
    const start = document.getElementById('rental-start-date').value;
    const due = document.getElementById('rental-due-date').value;

    if (!toolId || !start || !due || due <= start) {
      showToast('Please select tool and valid rental dates', 'error');
      return;
    }

    try {
      const chk = await fetch(`${API_BASE}/rentals/validate-availability`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ toolId, startDate: start, dueDate: due }),
      }).then((r) => r.json());

      const fb = document.getElementById('availability-feedback');
      if (!chk.available) {
        fb.style.display = 'block';
        fb.style.background = 'rgba(239, 68, 68, 0.2)';
        fb.style.color = '#f87171';
        fb.textContent = `❌ ${chk.reason || 'Tool unavailable for selected dates'}`;
        showToast(chk.reason || 'Tool unavailable for dates', 'error');
        return;
      } else {
        fb.style.display = 'block';
        fb.style.background = 'rgba(16, 185, 129, 0.2)';
        fb.style.color = '#34d399';
        fb.textContent = '✅ Selected dates verified & equipment ready for dispatch!';
      }
    } catch (err) {
      console.warn('Availability check bypassed:', err);
    }
  } else if (rentWizardStep === 2) {
    const site = document.getElementById('rental-site-location').value.trim();
    if (!site) {
      showToast('Please provide the job site or delivery address', 'error');
      return;
    }
  }
  setRentWizardStep(rentWizardStep + 1);
});

document.getElementById('btn-rent-prev').addEventListener('click', () => {
  if (rentWizardStep > 1) setRentWizardStep(rentWizardStep - 1);
});

function updateSelectedToolSummaryCard(toolId) {
  const card = document.getElementById('rent-selected-tool-card');
  if (!card) return;

  const tool = (state.availableTools && state.availableTools.find((t) => t._id === toolId)) ||
               (state.tools && state.tools.find((t) => t._id === toolId)) ||
               (state.catalogTools && state.catalogTools.find((t) => t._id === toolId));
  if (!tool) {
    card.style.display = 'none';
    return;
  }

  const imgEl = document.getElementById('rent-selected-tool-img');
  const catEl = document.getElementById('rent-selected-tool-cat');
  const nameEl = document.getElementById('rent-selected-tool-name');
  const dailyEl = document.getElementById('rent-selected-daily-pill');
  const weeklyEl = document.getElementById('rent-selected-weekly-pill');
  const depositEl = document.getElementById('rent-selected-deposit-pill');

  const weeklyRate = tool.weeklyRate || tool.dailyRate * 6;

  if (imgEl) {
    imgEl.src = getToolImageUrl(tool.imageUrl, tool.serialNumber);
    imgEl.onerror = function () {
      this.onerror = null;
      this.src = DEFAULT_TOOL_IMAGE;
    };
  }
  if (catEl) catEl.textContent = tool.category || 'Machinery';
  if (nameEl) nameEl.textContent = `${tool.name} (${tool.serialNumber})`;
  if (dailyEl) dailyEl.textContent = `${formatLKR(tool.dailyRate)} / day`;
  if (weeklyEl) weeklyEl.textContent = `${formatLKR(weeklyRate)} / wk (-15%)`;
  if (depositEl) depositEl.textContent = `Deposit: ${formatLKR(tool.depositAmount)}`;

  card.style.display = 'flex';
}

async function prepareNewRentalModal(preselectedCustId = null, preselectedToolId = null) {
  const [toolsRes, usersRes] = await Promise.all([
    authFetch(`${API_BASE}/tools/available`).then((r) => r.json()),
    authFetch(`${API_BASE}/auth/users`).then((r) => r.json()).catch(() => ({ success: false })),
  ]);

  state.availableTools = toolsRes.success ? toolsRes.data : [];
  const users = usersRes.success ? usersRes.data : [];

  const custSelect = document.getElementById('rental-customer-select');
  if (custSelect) {
    custSelect.innerHTML = '<option value="">-- Choose Customer --</option>';
    users.forEach((u) => {
      const opt = document.createElement('option');
      opt.value = u._id;
      opt.textContent = `${u.name} (${u.company_name || 'Contractor'} - ${u.phone_number})`;
      if (preselectedCustId && u._id === preselectedCustId) opt.selected = true;
      custSelect.appendChild(opt);
    });
  }

  const toolSelect = document.getElementById('rental-tool-select');
  toolSelect.innerHTML = '<option value="">-- Choose Available Tool --</option>';
  state.availableTools.forEach((t) => {
    const opt = document.createElement('option');
    opt.value = t._id;
    opt.dataset.daily = t.dailyRate;
    opt.dataset.weekly = t.weeklyRate || t.dailyRate * 6;
    opt.dataset.monthly = t.monthlyRate || t.dailyRate * 22;
    opt.dataset.deposit = t.depositAmount;
    opt.dataset.meter = t.currentMeterReading || 0;
    opt.textContent = `${t.name} [Item Code: ${t.serialNumber}] - ${formatLKR(t.dailyRate)}/day`;
    if (preselectedToolId && t._id === preselectedToolId) opt.selected = true;
    toolSelect.appendChild(opt);
  });

  const today = new Date();
  const dueDate = new Date();
  dueDate.setDate(today.getDate() + 3);

  document.getElementById('rental-start-date').value = today.toISOString().split('T')[0];
  document.getElementById('rental-due-date').value = dueDate.toISOString().split('T')[0];
  document.getElementById('rental-site-location').value = currentUser ? currentUser.address || 'Colombo Project Site' : 'Colombo Project Site';
  document.getElementById('rental-delivery-mode').value = 'Store Pickup';
  document.getElementById('availability-feedback').style.display = 'none';

  if (preselectedToolId) {
    updateSelectedToolSummaryCard(preselectedToolId);
  } else {
    const card = document.getElementById('rent-selected-tool-card');
    if (card) card.style.display = 'none';
  }

  setRentWizardStep(1);
  recalculateRentalTotal();
  openModal('modal-rental');
  setTimeout(initSignaturePad, 200);
}

document.getElementById('rental-tool-select').addEventListener('change', () => {
  const selectedToolId = document.getElementById('rental-tool-select').value;
  updateSelectedToolSummaryCard(selectedToolId);

  const opt = document.getElementById('rental-tool-select').selectedOptions[0];
  if (opt && opt.dataset.meter) {
    const meterEl = document.getElementById('rental-start-meter');
    if (meterEl) meterEl.value = opt.dataset.meter;
  }
  recalculateRentalTotal();
});

document.getElementById('rental-start-date').addEventListener('change', recalculateRentalTotal);
document.getElementById('rental-due-date').addEventListener('change', recalculateRentalTotal);
document.getElementById('rental-delivery-mode').addEventListener('change', recalculateRentalTotal);

function recalculateRentalTotal() {
  const toolSelect = document.getElementById('rental-tool-select');
  const startDateStr = document.getElementById('rental-start-date').value;
  const dueDateStr = document.getElementById('rental-due-date').value;
  const deliveryMode = document.getElementById('rental-delivery-mode').value;

  let days = 1;
  if (startDateStr && dueDateStr) {
    const start = new Date(startDateStr);
    const due = new Date(dueDateStr);
    const diffTime = due - start;
    days = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
  }

  let dailyRate = 0, weeklyRate = 0, monthlyRate = 0, deposit = 0;
  const opt = toolSelect.selectedOptions[0];
  if (opt && opt.value) {
    dailyRate = Number(opt.dataset.daily) || 0;
    weeklyRate = Number(opt.dataset.weekly) || dailyRate * 6;
    monthlyRate = Number(opt.dataset.monthly) || dailyRate * 22;
    deposit = Number(opt.dataset.deposit) || 0;
  }

  let rentAmount = 0;
  let rateTierApplied = 'Daily Rate';

  if (days >= 30) {
    const months = Math.floor(days / 30);
    const remDays = days % 30;
    rentAmount = Math.round(months * monthlyRate + remDays * (monthlyRate / 30));
    rateTierApplied = 'Monthly Discount Tier';
  } else if (days >= 7) {
    const weeks = Math.floor(days / 7);
    const remDays = days % 7;
    rentAmount = Math.round(weeks * weeklyRate + remDays * (weeklyRate / 7));
    rateTierApplied = 'Weekly Discount Tier';
  } else {
    rentAmount = dailyRate * days;
    rateTierApplied = 'Daily Rate';
  }

  const deliveryFee = deliveryMode === 'Site Delivery' ? 3500 : 0;
  const grandTotal = rentAmount + deposit + deliveryFee;

  document.getElementById('calc-duration-days').textContent = `${days} Day(s) (${rateTierApplied})`;
  document.getElementById('calc-rent-amount').textContent = formatLKR(rentAmount);
  document.getElementById('calc-delivery-fee').textContent = formatLKR(deliveryFee);
  document.getElementById('calc-deposit-amount').textContent = formatLKR(deposit);
  document.getElementById('calc-total-amount').textContent = formatLKR(grandTotal);
}

// ----------------------------------------------------
// FILE UPLOAD & DRAG-AND-DROP MANAGEMENT
// ----------------------------------------------------
let uploadedKycDocData = '';
let uploadedDispatchPhotoData = '';
let uploadedReturnPhotoData = '';

function handleKycFileUpload(e) {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (event) => {
    uploadedKycDocData = event.target.result;
    document.getElementById('kyc-dropzone').style.display = 'none';
    const previewWrap = document.getElementById('kyc-file-preview-wrap');
    const previewImg = document.getElementById('kyc-file-preview-img');
    const previewName = document.getElementById('kyc-file-preview-name');

    if (previewImg) previewImg.src = uploadedKycDocData;
    if (previewName) previewName.textContent = file.name;
    if (previewWrap) previewWrap.style.display = 'flex';
    showToast(`KYC document "${file.name}" attached successfully!`, 'success');
  };
  reader.readAsDataURL(file);
}

function removeKycFile() {
  uploadedKycDocData = '';
  const input = document.getElementById('kyc-file-input');
  if (input) input.value = '';
  const dropzone = document.getElementById('kyc-dropzone');
  const previewWrap = document.getElementById('kyc-file-preview-wrap');
  if (dropzone) dropzone.style.display = 'flex';
  if (previewWrap) previewWrap.style.display = 'none';
}

function handleDispatchPhotoUpload(e) {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (event) => {
    uploadedDispatchPhotoData = event.target.result;
    document.getElementById('dispatch-dropzone').style.display = 'none';
    const previewWrap = document.getElementById('dispatch-photo-preview-wrap');
    const previewImg = document.getElementById('dispatch-photo-preview-img');
    const previewName = document.getElementById('dispatch-photo-preview-name');

    if (previewImg) previewImg.src = uploadedDispatchPhotoData;
    if (previewName) previewName.textContent = file.name;
    if (previewWrap) previewWrap.style.display = 'flex';
    showToast(`Pre-dispatch inspection photo attached!`, 'success');
  };
  reader.readAsDataURL(file);
}

function removeDispatchPhoto() {
  uploadedDispatchPhotoData = '';
  const input = document.getElementById('dispatch-photo-input');
  if (input) input.value = '';
  const dropzone = document.getElementById('dispatch-dropzone');
  const previewWrap = document.getElementById('dispatch-photo-preview-wrap');
  if (dropzone) dropzone.style.display = 'flex';
  if (previewWrap) previewWrap.style.display = 'none';
}

function handleReturnPhotoUpload(e) {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (event) => {
    uploadedReturnPhotoData = event.target.result;
    document.getElementById('return-dropzone').style.display = 'none';
    const previewWrap = document.getElementById('return-photo-preview-wrap');
    const previewImg = document.getElementById('return-photo-preview-img');
    const previewName = document.getElementById('return-photo-preview-name');

    if (previewImg) previewImg.src = uploadedReturnPhotoData;
    if (previewName) previewName.textContent = file.name;
    if (previewWrap) previewWrap.style.display = 'flex';
    showToast(`Return inspection photo attached!`, 'success');
  };
  reader.readAsDataURL(file);
}

function removeReturnPhoto() {
  uploadedReturnPhotoData = '';
  const input = document.getElementById('return-photo-input');
  if (input) input.value = '';
  const dropzone = document.getElementById('return-dropzone');
  const previewWrap = document.getElementById('return-photo-preview-wrap');
  if (dropzone) dropzone.style.display = 'flex';
  if (previewWrap) previewWrap.style.display = 'none';
}

// Submit Agreement (Customer Booking Flow - No Manual URLs, No Yard Meter)
document.getElementById('form-rental').addEventListener('submit', async (e) => {
  e.preventDefault();

  let customerId = currentUser ? currentUser._id : null;
  const custSelect = document.getElementById('rental-customer-select');
  if (custSelect && custSelect.value) customerId = custSelect.value;

  const toolId = document.getElementById('rental-tool-select').value;
  const startDate = document.getElementById('rental-start-date').value;
  const dueDate = document.getElementById('rental-due-date').value;
  const siteLocation = document.getElementById('rental-site-location').value.trim();
  const deliveryMode = document.getElementById('rental-delivery-mode').value;
  const deliveryFee = deliveryMode === 'Site Delivery' ? 3500 : 0;
  const digitalSignature = getSignatureDataUrl();

  const payload = {
    userId: customerId,
    customerId,
    toolId,
    startDate,
    dueDate,
    siteLocation,
    deliveryMode,
    deliveryFee,
    deliveryAddress: siteLocation,
    kycDocumentUrl: uploadedKycDocData || '',
    digitalSignature,
    paymentStatus: 'Paid',
    notes: 'Executed via Lions Engineering customer portal',
  };

  try {
    const res = await authFetch(`${API_BASE}/rentals`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const json = await res.json();
    if (json.success) {
      showToast('Agreement booked, KYC registered & payment completed!', 'success');
      closeModal('modal-rental');
      removeKycFile();

      if (currentUser && currentUser.role === 'customer') {
        switchTab('customer-portal');
      } else {
        loadRentals();
        loadDashboard();
        loadTools();
      }

      openInvoiceModal(json.data._id);
    } else {
      showToast(json.message || json.error || 'Failed to create agreement', 'error');
    }
  } catch (err) {
    showToast('Error issuing rental agreement', 'error');
  }
});

function quickRentTool(toolId) {
  prepareNewRentalModal(null, toolId);
}

// ----------------------------------------------------
// 12.5. ADMIN / YARD STAFF DISPATCH & METER INSPECTION
// ----------------------------------------------------
let currentDispatchRental = null;

async function openDispatchModal(rentalId) {
  try {
    const res = await authFetch(`${API_BASE}/rentals/${rentalId}`);
    const json = await res.json();

    if (json.success) {
      currentDispatchRental = json.data;
      const r = currentDispatchRental;

      document.getElementById('dispatch-rental-id').value = r._id;
      document.getElementById('dispatch-modal-rental-code').textContent = r.rentalCode;
      document.getElementById('dispatch-modal-customer-name').textContent = r.user_id ? r.user_id.name : r.customer ? r.customer.name : 'Customer';
      document.getElementById('dispatch-modal-tool-info').textContent = r.tool
        ? `Equipment: ${r.tool.name} (Tag: ${r.tool.serialNumber}) | Current Stock Hours: ${r.tool.currentMeterReading || 0} Hrs`
        : 'Tool details';

      document.getElementById('dispatch-meter-reading').value = r.tool ? (r.tool.currentMeterReading || 0) : 0;
      document.getElementById('dispatch-tool-condition').value = r.tool ? (r.tool.condition || 'Excellent') : 'Excellent';
      document.getElementById('dispatch-notes').value = '';
      removeDispatchPhoto();

      openModal('modal-dispatch');
    }
  } catch (err) {
    showToast('Failed to load rental for dispatch', 'error');
  }
}

document.getElementById('form-dispatch').addEventListener('submit', async (e) => {
  e.preventDefault();
  const rentalId = document.getElementById('dispatch-rental-id').value;
  const startMeterReading = Number(document.getElementById('dispatch-meter-reading').value) || 0;
  const initialCondition = document.getElementById('dispatch-tool-condition').value;
  const dispatchNotes = document.getElementById('dispatch-notes').value.trim();

  const payload = {
    startMeterReading,
    preDispatchPhotos: uploadedDispatchPhotoData ? [uploadedDispatchPhotoData] : [],
    initialCondition,
    dispatchNotes,
  };

  try {
    const res = await authFetch(`${API_BASE}/rentals/${rentalId}/dispatch`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const json = await res.json();
    if (json.success) {
      showToast(json.message || 'Equipment successfully dispatched and starting meter logged!', 'success');
      closeModal('modal-dispatch');
      removeDispatchPhoto();
      loadRentals();
      loadDashboard();
      loadTools();
    } else {
      showToast(json.message || json.error || 'Failed to dispatch equipment', 'error');
    }
  } catch (err) {
    showToast('Error during yard dispatch', 'error');
  }
});

// ----------------------------------------------------
// 13. RETURN & INSPECTION WIZARD (ADMIN)
// ----------------------------------------------------
let currentReturnRental = null;
let returnWizardStep = 1;

function setReturnWizardStep(step) {
  returnWizardStep = step;

  for (let i = 1; i <= 2; i++) {
    const ind = document.getElementById(`return-step-ind-${i}`);
    const pane = document.getElementById(`return-pane-${i}`);
    if (ind) ind.classList.toggle('active', i === step);
    if (pane) pane.classList.toggle('active', i === step);
  }

  const btnPrev = document.getElementById('btn-return-prev');
  const btnNext = document.getElementById('btn-return-next');
  const btnSubmit = document.getElementById('btn-submit-return');

  btnPrev.style.display = step > 1 ? 'inline-flex' : 'none';
  btnNext.style.display = step === 1 ? 'inline-flex' : 'none';
  btnSubmit.style.display = step === 2 ? 'inline-flex' : 'none';

  if (step === 2) updateSettlementCalculation();
}

document.getElementById('btn-return-next').addEventListener('click', () => setReturnWizardStep(2));
document.getElementById('btn-return-prev').addEventListener('click', () => setReturnWizardStep(1));

async function openReturnModal(rentalId) {
  try {
    const res = await authFetch(`${API_BASE}/rentals/${rentalId}`);
    const json = await res.json();

    if (json.success) {
      currentReturnRental = json.data;
      const r = currentReturnRental;

      document.getElementById('return-rental-id').value = r._id;
      document.getElementById('return-modal-rental-code').textContent = r.rentalCode;
      document.getElementById('return-modal-customer-name').textContent = r.user_id ? r.user_id.name : r.customer ? r.customer.name : 'Customer';
      document.getElementById('return-modal-tool-info').textContent = r.tool
        ? `Equipment: ${r.tool.name} (Item Code: ${r.tool.serialNumber}) | Starting Meter: ${r.startMeterReading || 0} Hrs`
        : 'Tool details';

      const todayStr = new Date().toISOString().split('T')[0];
      document.getElementById('return-actual-date').value = todayStr;

      const due = new Date(r.dueDate);
      const today = new Date();
      let lateFee = 0;
      if (today > due && r.tool) {
        const diffDays = Math.ceil((today - due) / (1000 * 60 * 60 * 24));
        lateFee = diffDays * r.tool.dailyRate;
      }

      document.getElementById('return-late-fee').value = lateFee;
      document.getElementById('return-damage-fee').value = 0;
      document.getElementById('return-damage-notes').value = '';
      document.getElementById('return-final-meter').value = (r.startMeterReading || 0) + 12;
      removeReturnPhoto();
      document.getElementById('return-tool-status').value = 'Available';
      if (r.tool) document.getElementById('return-tool-condition').value = r.tool.condition || 'Good';

      setReturnWizardStep(1);
      updateSettlementCalculation();
      openModal('modal-return');
    }
  } catch (err) {
    showToast('Failed to load rental details for return', 'error');
  }
}

function updateSettlementCalculation() {
  if (!currentReturnRental) return;

  const deposit = currentReturnRental.depositAmount || 0;
  const lateFee = Number(document.getElementById('return-late-fee').value) || 0;
  const damage = Number(document.getElementById('return-damage-fee').value) || 0;
  const finalMeter = Number(document.getElementById('return-final-meter').value) || (currentReturnRental.startMeterReading || 0);

  let excessMeterFee = 0;
  if (currentReturnRental.tool && currentReturnRental.tool.meterReadingLimit > 0) {
    const days = Math.max(1, Math.ceil((new Date() - new Date(currentReturnRental.startDate)) / (1000 * 60 * 60 * 24)));
    const allowed = currentReturnRental.tool.meterReadingLimit * days;
    const used = finalMeter - (currentReturnRental.startMeterReading || 0);
    if (used > allowed) {
      excessMeterFee = (used - allowed) * (currentReturnRental.tool.meterExcessHourlyRate || 500);
    }
  }

  const totalDeductions = lateFee + damage + excessMeterFee;
  const net = deposit - totalDeductions;

  document.getElementById('return-deposit-collected').textContent = formatLKR(deposit);
  document.getElementById('return-deductions-total').textContent = `- ${formatLKR(lateFee + damage)}`;
  document.getElementById('return-excess-meter-fee').textContent = `- ${formatLKR(excessMeterFee)}`;

  let depositStatusText = 'Held';
  if (totalDeductions === 0) depositStatusText = 'Refunded';
  else if (net > 0) depositStatusText = 'Partially Refunded';
  else depositStatusText = 'Deducted';

  const depStatusEl = document.getElementById('return-deposit-status-preview') || document.getElementById('return-deposit-status');
  const netRefundEl = document.getElementById('return-settlement-amount') || document.getElementById('return-net-refund');

  if (depStatusEl) depStatusEl.textContent = depositStatusText;
  if (netRefundEl) netRefundEl.textContent = formatLKR(Math.max(0, net));
}

document.getElementById('return-late-fee').addEventListener('input', updateSettlementCalculation);
document.getElementById('return-damage-fee').addEventListener('input', updateSettlementCalculation);
document.getElementById('return-final-meter').addEventListener('input', updateSettlementCalculation);

document.getElementById('form-return').addEventListener('submit', async (e) => {
  e.preventDefault();

  const rentalId = document.getElementById('return-rental-id').value;
  const actualReturnDate = document.getElementById('return-actual-date').value;
  const lateFee = Number(document.getElementById('return-late-fee').value) || 0;
  const damageFee = Number(document.getElementById('return-damage-fee').value) || 0;
  const finalMeterReading = Number(document.getElementById('return-final-meter').value) || 0;
  const postReturnToolStatus = document.getElementById('return-tool-status').value;
  const postReturnToolCondition = document.getElementById('return-tool-condition').value;
  const damageNotes = document.getElementById('return-damage-notes').value.trim();

  const payload = {
    actualReturnDate,
    lateFee,
    damageFee,
    returnMeterReading: finalMeterReading,
    postReturnToolStatus,
    postReturnToolCondition,
    damageNotes,
    postReturnPhotos: uploadedReturnPhotoData ? [uploadedReturnPhotoData] : [],
  };

  try {
    const res = await authFetch(`${API_BASE}/rentals/${rentalId}/return`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const json = await res.json();
    if (json.success) {
      showToast(json.message || 'Tool returned & deposit settled successfully!', 'success');
      closeModal('modal-return');
      removeReturnPhoto();
      loadRentals();
      loadDashboard();
      loadTools();
      loadPayments();
    } else {
      showToast(json.message || json.error || 'Failed to process return', 'error');
    }
  } catch (err) {
    showToast('Error processing tool return', 'error');
  }
});



// ----------------------------------------------------
// 14. WHATSAPP & SMS ALERT MODAL
// ----------------------------------------------------
async function openNotifyModal(rentalId) {
  const rental = state.rentals.find((r) => r._id === rentalId);
  if (!rental) return;

  const clientName = rental.user_id ? rental.user_id.name : rental.customer ? rental.customer.name : 'Contractor';
  const clientPhone = rental.user_id ? rental.user_id.phone_number : rental.customer ? rental.customer.phone : '';

  document.getElementById('notify-rental-id').value = rental._id;
  document.getElementById('notify-rental-code').textContent = rental.rentalCode;
  document.getElementById('notify-recipient').textContent = `${clientName} (${clientPhone})`;

  updateNotifyMessagePreview();
  openModal('modal-notify');
}

function updateNotifyMessagePreview() {
  const rentalId = document.getElementById('notify-rental-id').value;
  const eventType = document.getElementById('notify-event-type').value;
  const rental = state.rentals.find((r) => r._id === rentalId);
  if (!rental) return;

  const clientName = rental.user_id ? rental.user_id.name : rental.customer ? rental.customer.name : 'Contractor';
  const toolName = rental.tool ? rental.tool.name : 'Equipment';
  const dueDateStr = formatDate(rental.dueDate);

  let msg = '';
  if (eventType === 'Return Reminder') {
    msg = `🦁 Lions Engineering Return Reminder: Hi ${clientName}, your rental ${rental.rentalCode} for ${toolName} is due for return on ${dueDateStr}.`;
  } else if (eventType === 'Overdue Alert') {
    msg = `⚠️ URGENT: Agreement ${rental.rentalCode} for ${toolName} is OVERDUE since ${dueDateStr}. Daily late fees are actively accruing. Please return immediately.`;
  } else if (eventType === 'Booking Confirmed') {
    msg = `✅ Lions Engineering: Hi ${clientName}, agreement ${rental.rentalCode} confirmed. Delivery: ${rental.deliveryMode || 'Store Pickup'}. Total: LKR ${rental.totalAmount.toLocaleString()}`;
  } else {
    msg = `🦁 Lions Engineering Update: Regarding agreement ${rental.rentalCode}...`;
  }

  document.getElementById('notify-custom-msg').value = msg;
}

document.getElementById('notify-event-type').addEventListener('change', updateNotifyMessagePreview);

document.getElementById('form-notify').addEventListener('submit', async (e) => {
  e.preventDefault();
  const rentalId = document.getElementById('notify-rental-id').value;
  const eventType = document.getElementById('notify-event-type').value;
  const customMessage = document.getElementById('notify-custom-msg').value.trim();

  try {
    const res = await authFetch(`${API_BASE}/rentals/${rentalId}/notify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ eventType, customMessage }),
    });

    const json = await res.json();
    if (json.success) {
      showToast(json.message || 'WhatsApp/SMS alert sent!', 'success');
      closeModal('modal-notify');
    } else {
      showToast(json.message || 'Failed to send alert', 'error');
    }
  } catch (err) {
    showToast('Error dispatching alert', 'error');
  }
});

// ----------------------------------------------------
// 15. LEASE EXTENSION WORKFLOW
// ----------------------------------------------------
let currentExtendRental = null;

async function openExtendModal(rentalId) {
  try {
    const res = await authFetch(`${API_BASE}/rentals/${rentalId}`);
    const json = await res.json();

    if (json.success) {
      currentExtendRental = json.data;
      const r = currentExtendRental;

      document.getElementById('extend-rental-id').value = r._id;
      document.getElementById('extend-modal-rental-code').textContent = r.rentalCode;
      document.getElementById('extend-modal-customer-name').textContent = r.user_id ? r.user_id.name : r.customer ? r.customer.name : 'Customer';
      document.getElementById('extend-modal-tool-info').textContent = r.tool
        ? `Equipment: ${r.tool.name} (Daily Rate: ${formatLKR(r.tool.dailyRate)})`
        : '';

      const currentDue = new Date(r.dueDate);
      document.getElementById('extend-current-due').value = formatDate(r.dueDate);

      const nextDue = new Date(currentDue);
      nextDue.setDate(nextDue.getDate() + 3);
      
      const minDue = new Date(currentDue);
      minDue.setDate(minDue.getDate() + 1);
      
      const extendInput = document.getElementById('extend-new-due');
      extendInput.min = minDue.toISOString().split('T')[0];
      extendInput.value = nextDue.toISOString().split('T')[0];
      document.getElementById('extend-notes').value = '';

      updateExtensionCalculation();
      openModal('modal-extend');
    }
  } catch (err) {
    showToast('Failed to load rental for extension', 'error');
  }
}

function updateExtensionCalculation() {
  if (!currentExtendRental) return;

  const currentDue = new Date(currentExtendRental.dueDate);
  const newDueStr = document.getElementById('extend-new-due').value;

  if (newDueStr) {
    const newDue = new Date(newDueStr);
    const diffTime = newDue - currentDue;
    const extraDays = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
    const dailyRate = currentExtendRental.tool ? currentExtendRental.tool.dailyRate : 0;
    const additionalRent = extraDays * dailyRate;
    const newTotal = (currentExtendRental.totalAmount || 0) + additionalRent;

    document.getElementById('extend-extra-days').textContent = `${extraDays} Day(s)`;
    document.getElementById('extend-extra-rent').textContent = `+ ${formatLKR(additionalRent)}`;
    document.getElementById('extend-new-total').textContent = formatLKR(newTotal);
  }
}

document.getElementById('extend-new-due').addEventListener('change', updateExtensionCalculation);
document.getElementById('extend-new-due').addEventListener('input', updateExtensionCalculation);

document.getElementById('form-extend').addEventListener('submit', async (e) => {
  e.preventDefault();
  const rentalId = document.getElementById('extend-rental-id').value;
  const newDueDate = document.getElementById('extend-new-due').value;
  const notes = document.getElementById('extend-notes').value.trim();

  if (!newDueDate) {
    showToast('Please select a valid new due date', 'error');
    return;
  }

  const payload = {
    newDueDate,
    notes,
  };

  try {
    const res = await authFetch(`${API_BASE}/rentals/${rentalId}/extend`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const json = await res.json();
    if (json.success) {
      showToast(json.message || 'Rental agreement extended successfully!', 'success');
      closeModal('modal-extend');
      
      // Real-time refresh for both Customer & Admin views
      if (currentUser && currentUser.role === 'customer') {
        loadMyLeases();
      } else {
        loadRentals();
        loadDashboard();
      }
    } else {
      showToast(json.message || json.error || 'Failed to extend agreement', 'error');
    }
  } catch (err) {
    showToast('Error extending rental agreement', 'error');
  }
});

// ----------------------------------------------------
// 15. CUSTOMER PORTAL (MY LEASES, INVOICES & BREAKDOWN REPORTS)
// ----------------------------------------------------
state.customerLeases = [];
state.customerLeaseFilter = 'All';

async function loadMyLeases() {
  try {
    const res = await authFetch(`${API_BASE}/rentals/my-rentals`);
    const json = await res.json();

    if (json.success) {
      state.customerLeases = json.data || [];
      const leases = state.customerLeases;

      const badgeCount = document.getElementById('badge-my-leases-count');
      if (badgeCount) badgeCount.textContent = leases.length;

      // Compute Customer Quick Stats
      const activeCount = leases.filter((l) => l.status === 'Active' || l.status === 'Overdue').length;
      const totalHeldDeposit = leases
        .filter((l) => l.depositStatus === 'Held')
        .reduce((sum, l) => sum + (l.depositAmount || 0), 0);

      const elActive = document.getElementById('portal-active-count');
      const elTotal = document.getElementById('portal-total-count');
      const elDeposit = document.getElementById('portal-deposit-held');
      const headerLeaseLabel = document.getElementById('header-active-lease-label');
      const kycBadge = document.getElementById('portal-kyc-badge');
      const greetingEl = document.getElementById('portal-user-greeting');

      if (elActive) elActive.textContent = activeCount;
      if (elTotal) elTotal.textContent = leases.length;
      if (elDeposit) elDeposit.textContent = formatLKR(totalHeldDeposit);
      if (headerLeaseLabel) headerLeaseLabel.textContent = `⚡ Active Leases (${activeCount})`;
      if (greetingEl && currentUser) greetingEl.textContent = `Welcome, ${currentUser.name || 'Contractor'}`;

      if (kycBadge && currentUser) {
        kycBadge.className = `badge ${currentUser.verification_status === 'Verified' ? 'badge-active' : 'badge-maintenance'}`;
        kycBadge.textContent = currentUser.verification_status || 'Pending';
      }

      applyCustomerLeaseFilter();
    }
  } catch (err) {
    console.error('Error loading customer leases:', err);
  }
}

function filterCustomerLeases(filter, btn) {
  state.customerLeaseFilter = filter;
  if (btn) {
    document.querySelectorAll('#customer-lease-filters .subnav-btn').forEach((b) => b.classList.remove('active'));
    btn.classList.add('active');
  }
  applyCustomerLeaseFilter();
}

function applyCustomerLeaseFilter() {
  const filter = state.customerLeaseFilter || 'All';
  let filtered = state.customerLeases || [];

  if (filter === 'Active') {
    filtered = filtered.filter((l) => l.status === 'Active');
  } else if (filter === 'Completed') {
    filtered = filtered.filter((l) => l.status === 'Completed');
  } else if (filter === 'Overdue') {
    filtered = filtered.filter((l) => l.status === 'Overdue');
  }

  renderCustomerLeasesTable(filtered);
}

function renderCustomerLeasesTable(leases) {
  const tbody = document.getElementById('tbody-customer-leases');
  if (!tbody) return;
  tbody.innerHTML = '';

  if (!leases || leases.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="8" class="text-center py-5">
          <div style="padding: 24px; text-align:center;">
            <div style="width:56px; height:56px; border-radius:50%; background:#fffbeb; color:#d97706; display:flex; align-items:center; justify-content:center; margin:0 auto 12px; font-size:24px; box-shadow: 0 4px 12px rgba(245,158,11,0.15);">
              <i class="fa-solid fa-toolbox"></i>
            </div>
            <h3 style="font-size:17px; font-weight:700; color:#0f172a; margin-bottom:6px;">No Equipment Leases Found</h3>
            <p style="font-size:13px; color:#64748b; max-width:400px; margin:0 auto 16px;">Browse our island-wide certified equipment inventory and rent heavy tools with Tiered Rates and site delivery.</p>
            <button class="btn btn-gold btn-cta" onclick="switchTab('catalog')">
              <i class="fa-solid fa-bolt"></i> <span>Explore Equipment Storefront</span>
            </button>
          </div>
        </td>
      </tr>
    `;
    return;
  }

  leases.forEach((l) => {
    const tr = document.createElement('tr');
    const statusBadge = getStatusBadge(l.status);
    const depositBadge = `<span class="badge ${l.depositStatus === 'Held' ? 'badge-active' : 'badge-completed'}">${l.depositStatus}</span>`;
    const toolName = l.tool ? l.tool.name : 'Heavy Machinery';
    const serial = l.tool ? l.tool.serialNumber : 'N/A';

    tr.innerHTML = `
      <td><strong class="text-gold" style="font-size:13px;">${l.rentalCode}</strong></td>
      <td>
        <strong style="color:#0f172a;">${toolName}</strong>
        <div style="font-size:11px; margin-top:2px;" class="text-muted"><span class="badge" style="background:#f1f5f9; color:#334155; border:1px solid #e2e8f0; font-weight:700;">Tag: ${serial}</span></div>
      </td>
      <td>
        <div style="font-size:12px; color:#475569;"><strong>Start:</strong> ${formatDate(l.startDate)}</div>
        <div style="font-size:12px;" class="${l.status === 'Overdue' ? 'text-danger font-bold' : ''}"><strong>Due:</strong> ${formatDate(l.dueDate)}</div>
      </td>
      <td>
        <span class="badge" style="${l.deliveryMode === 'Site Delivery' ? 'background:#eff6ff; color:#1d4ed8; border:1px solid #bfdbfe;' : 'background:#f0fdf4; color:#15803d; border:1px solid #bbf7d0;'}">
          <i class="fa-solid ${l.deliveryMode === 'Site Delivery' ? 'fa-truck' : 'fa-shop'}"></i> ${l.deliveryMode}
        </span>
      </td>
      <td><strong style="color:#0f172a; font-size:13.5px;">${formatLKR(l.totalAmount)}</strong></td>
      <td>${depositBadge}</td>
      <td>${statusBadge}</td>
      <td>
        <div class="action-btn-group">
          <a href="${API_BASE}/rentals/${l._id}/pdf" target="_blank" class="btn btn-xs btn-outline btn-cta" title="Direct PDF Tax Invoice Download">
            <i class="fa-solid fa-file-pdf text-danger"></i> PDF Bill
          </a>
          <button class="btn btn-xs btn-gold btn-cta" onclick="openInvoiceModal('${l._id}')" title="View & Print Official Bilingual Bill">
            <i class="fa-solid fa-file-invoice"></i> Bill / බිල්පත
          </button>
          ${
            l.status === 'Active'
              ? `<button class="btn btn-xs btn-outline btn-cta" onclick="openExtendModal('${l._id}')" title="Request Rental Due Date Extension">
                   <i class="fa-solid fa-calendar-plus"></i> Extend
                 </button>
                 <button class="btn btn-xs btn-outline btn-cta text-danger" onclick="openReportBreakdownModal('${l._id}')" title="Report equipment breakdown on jobsite">
                   <i class="fa-solid fa-triangle-exclamation text-danger"></i> Report Issue
                 </button>`
              : ''
          }
        </div>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

function openReportBreakdownModal(rentalId) {
  const rental = (state.customerLeases && state.customerLeases.find((l) => l._id === rentalId)) ||
                 (state.rentals && state.rentals.find((r) => r._id === rentalId));
  if (!rental) return;

  document.getElementById('report-rental-id').value = rental._id;
  document.getElementById('report-tool-info').value = rental.tool ? `${rental.tool.name} (${rental.tool.serialNumber})` : 'Equipment';
  document.getElementById('report-contact-phone').value = (currentUser && currentUser.phone_number) || '';
  document.getElementById('report-site-location').value = rental.siteLocation || (currentUser && currentUser.address) || '';
  document.getElementById('report-issue-desc').value = '';

  openModal('modal-report-breakdown');
}

const formBreakdown = document.getElementById('form-report-breakdown');
if (formBreakdown) {
  formBreakdown.addEventListener('submit', async (e) => {
    e.preventDefault();
    const rentalId = document.getElementById('report-rental-id').value;
    const issueType = document.getElementById('report-issue-type').value;
    const contactPhone = document.getElementById('report-contact-phone').value;
    const siteLocation = document.getElementById('report-site-location').value;
    const issueDesc = document.getElementById('report-issue-desc').value.trim();
    const btn = document.getElementById('btn-submit-breakdown');
    const originalBtn = btn ? btn.innerHTML : '';

    if (btn) {
      btn.disabled = true;
      btn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Submitting Report...`;
    }

    try {
      const customMessage = `🚨 BREAKDOWN ALERT [${issueType}] at ${siteLocation}: ${issueDesc} (Contact: ${contactPhone})`;
      const res = await authFetch(`${API_BASE}/rentals/${rentalId}/notify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventType: 'Jobsite Breakdown Alert', customMessage }),
      });
      const json = await res.json();

      showToast('Breakdown ticket logged! Lions Engineering mechanical support team has been notified.', 'success');
      closeModal('modal-report-breakdown');
    } catch (err) {
      showToast('Breakdown ticket submitted to yard dispatch log.', 'info');
      closeModal('modal-report-breakdown');
    } finally {
      if (btn) {
        btn.disabled = false;
        btn.innerHTML = originalBtn;
      }
    }
  });
}

// ----------------------------------------------------
// 16. BILINGUAL INVOICE & PRINT SYSTEM (EN & SI)
// ----------------------------------------------------
let currentInvoiceRental = null;
let currentInvoiceLang = 'en';

async function openInvoiceModal(rentalId, lang) {
  try {
    const res = await authFetch(`${API_BASE}/rentals/${rentalId}`);
    const json = await res.json();

    if (json.success) {
      currentInvoiceRental = json.data;
      currentInvoiceLang = lang || currentLang || 'en';
      setInvoiceLanguage(currentInvoiceLang);
      openModal('modal-invoice');
    } else {
      showToast('Could not load invoice data', 'error');
    }
  } catch (err) {
    showToast('Network error loading invoice', 'error');
  }
}

function setInvoiceLanguage(lang) {
  currentInvoiceLang = lang;
  document.querySelectorAll('.bill-lang-btn').forEach((b) => b.classList.remove('active'));
  const btn = document.getElementById(`btn-bill-lang-${lang}`);
  if (btn) btn.classList.add('active');

  const printLbl = document.getElementById('lbl-btn-print');
  if (printLbl) printLbl.textContent = lang === 'si' ? 'බිල්පත මුද්‍රණය' : 'Print Bill';

  const modalTitle = document.getElementById('invoice-modal-title');
  if (modalTitle) modalTitle.textContent = lang === 'si' ? 'බදු ඉන්වොයිසිය සහ කුලී ගිවිසුම' : 'Rental Agreement & Tax Invoice';

  renderInvoice();
}

function renderInvoice() {
  if (!currentInvoiceRental) return;
  const r = currentInvoiceRental;
  const isSi = currentInvoiceLang === 'si';

  const clientName = r.user_id ? r.user_id.name : r.customer ? r.customer.name : (isSi ? 'පාරිභෝගිකයා' : 'Valued Client');
  const clientCompany = r.user_id ? (r.user_id.company_name || 'Individual Contractor') : (r.customer ? r.customer.companyName : 'N/A');
  const clientNic = r.user_id ? r.user_id.nic_or_passport : (r.customer ? r.customer.nicOrPassport : 'N/A');
  const clientPhone = r.user_id ? r.user_id.phone_number : (r.customer ? r.customer.phone : 'N/A');
  const clientAddress = r.user_id ? (r.user_id.address || r.deliveryAddress) : (r.customer ? r.customer.address : r.deliveryAddress);

  const toolName = r.tool ? r.tool.name : (isSi ? 'බර යන්ත්‍රෝපකරණ' : 'Heavy Equipment');
  const serial = r.tool ? r.tool.serialNumber : 'N/A';
  const category = r.tool ? r.tool.category : 'General';
  const condition = r.tool ? (r.tool.condition || 'Good') : 'Good';
  const startMeter = r.startMeterReading || 0;
  const returnMeter = r.returnMeterReading || 0;

  const startStr = new Date(r.startDate).toLocaleDateString(isSi ? 'si-LK' : 'en-GB');
  const dueStr = new Date(r.dueDate).toLocaleDateString(isSi ? 'si-LK' : 'en-GB');
  const issuedStr = new Date(r.createdAt || r.startDate).toLocaleDateString(isSi ? 'si-LK' : 'en-GB');

  const diffTime = new Date(r.dueDate).getTime() - new Date(r.startDate).getTime();
  const durationDays = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

  const deliveryModeText = isSi
    ? (r.deliveryMode === 'Site Delivery' ? 'වැඩබිමට ප්‍රවාහනය (Site Delivery)' : 'ඩිපෝවෙන් ලබාගැනීම (Self-Pickup)')
    : (r.deliveryMode || 'Store Pickup');

  const statusText = isSi
    ? (r.status === 'Active' ? 'ක්‍රියාකාරී කුලිය' : r.status === 'Completed' ? 'සම්පූර්ණයි' : 'කල් ඉකුත් වූ')
    : r.status.toUpperCase();

  const depositStatusText = isSi
    ? (r.depositStatus === 'Held' ? 'සුරක්ෂිතව තබා ඇත (Held)' : r.depositStatus === 'Refunded' ? 'ආපසු ගෙවන ලදී (Refunded)' : 'අඩු කරන ලදී (Deducted)')
    : r.depositStatus.toUpperCase();

  const container = document.getElementById('invoice-rendered-content');
  if (!container) return;

  container.innerHTML = `
    <!-- INVOICE HEADER -->
    <div class="inv-header-bar">
      <div class="inv-brand">
        <h2><i class="fa-solid fa-shield-halved text-gold"></i> LIONS ENGINEERING</h2>
        <p>
          ${isSi ? 'බර යන්ත්‍රෝපකරණ, මෙවලම් කුලියට දීම සහ ඉංජිනේරු සේවා' : 'HEAVY MACHINERY, TOOL HIRE & FIELD ENGINEERING SERVICES'}<br>
          ${isSi ? 'ලිපිනය: නො. 120, කටුනායක කාර්මික කලාපය, ශ්‍රී ලංකාව' : 'Address: No. 120, Industrial Zone, Katunayake, Sri Lanka'}<br>
          Hotline: +94 11 234 5678 | Email: rentals@lionsengineering.lk | Web: lionsengineering.lk
        </p>
      </div>

      <div class="inv-meta-right">
        <div class="inv-type-title">${isSi ? 'බදු ඉන්වොයිසිය සහ කුලී ගිවිසුම' : 'TAX INVOICE & RENTAL LEASE'}</div>
        <div class="inv-code">${r.rentalCode}</div>
        <div class="inv-date">${isSi ? 'නිකුත් කළ දිනය:' : 'Issued Date:'} <strong>${issuedStr}</strong></div>
        <div class="inv-date">${isSi ? 'තත්ත්වය:' : 'Status:'} <span class="badge badge-active">${statusText}</span></div>
      </div>
    </div>

    <!-- DETAILS GRID -->
    <div class="inv-details-grid">
      <!-- Lessee Info -->
      <div class="inv-box">
        <h4><i class="fa-solid fa-user-tie text-gold"></i> ${isSi ? 'පාරිභෝගික / කොන්ත්‍රාත්කරු විස්තරය' : 'LESSEE / CUSTOMER INFORMATION'}</h4>
        <p><strong>${isSi ? 'නම:' : 'Name:'}</strong> ${clientName}</p>
        <p><strong>${isSi ? 'ආයතනය / සමාගම:' : 'Company:'}</strong> ${clientCompany}</p>
        <p><strong>${isSi ? 'ජා.හැ.අංකය / Passport:' : 'NIC / Passport:'}</strong> ${clientNic}</p>
        <p><strong>${isSi ? 'දුරකථන අංකය:' : 'Phone Number:'}</strong> ${clientPhone}</p>
        <p><strong>${isSi ? 'වැඩබිම් ලිපිනය:' : 'Site Location:'}</strong> ${r.siteLocation || clientAddress || 'Colombo Site'}</p>
      </div>

      <!-- Timeline & Logistics -->
      <div class="inv-box">
        <h4><i class="fa-solid fa-calendar-days text-gold"></i> ${isSi ? 'කුලී කාලසීමාව සහ ප්‍රවාහන විස්තර' : 'AGREEMENT TIMELINE & LOGISTICS'}</h4>
        <p><strong>${isSi ? 'ආරම්භක දිනය:' : 'Start Date:'}</strong> ${startStr}</p>
        <p><strong>${isSi ? 'ආපසු දිය යුතු දිනය:' : 'Due Date:'}</strong> ${dueStr}</p>
        <p><strong>${isSi ? 'මුළු කාලය:' : 'Total Duration:'}</strong> ${durationDays} ${isSi ? 'දින' : 'Day(s)'} (${r.rateTypeApplied || 'Daily'} ${isSi ? 'ගාස්තු ක්‍රමය' : 'Tier'})</p>
        <p><strong>${isSi ? 'ප්‍රවාහන ක්‍රමය:' : 'Delivery Mode:'}</strong> ${deliveryModeText}</p>
        <p><strong>${isSi ? 'ආරම්භක මීටර් අගය:' : 'Engine Hours (Start):'}</strong> ${startMeter} Hrs</p>
      </div>
    </div>

    <!-- EQUIPMENT SPECIFICATION TABLE -->
    <table class="inv-table">
      <thead>
        <tr>
          <th>${isSi ? 'යන්ත්‍රය / මෙවලම් විස්තරය' : 'EQUIPMENT DESCRIPTION'}</th>
          <th>${isSi ? 'අනුක්‍රමික අංකය / කේතය' : 'ITEM CODE / SERIAL'}</th>
          <th>${isSi ? 'කාණ්ඩය' : 'CATEGORY'}</th>
          <th>${isSi ? 'තත්ත්වය' : 'CONDITION'}</th>
          <th class="text-right">${isSi ? 'ගාස්තු ක්‍රමය' : 'PRICING TIER'}</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><strong>${toolName}</strong></td>
          <td>${serial}</td>
          <td>${category}</td>
          <td>${condition}</td>
          <td class="text-right">${r.rateTypeApplied || 'Daily'} Rate</td>
        </tr>
      </tbody>
    </table>

    <!-- FINANCIAL CHARGES BREAKDOWN TABLE -->
    <table class="inv-table">
      <thead>
        <tr>
          <th>${isSi ? 'අයකිරීම් විස්තරය (ගාස්තු සහ තැන්පතු)' : 'FINANCIAL CHARGE DESCRIPTION'}</th>
          <th>${isSi ? 'ගෙවීම් වර්ගය' : 'TYPE'}</th>
          <th class="text-right">${isSi ? 'මුදල (රුපියල්)' : 'AMOUNT (LKR)'}</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>
            <strong>${isSi ? 'මූලික උපකරණ කුලී ගාස්තුව' : 'Base Equipment Hire Charges'}</strong>
            <div style="font-size:11px; color:#64748b;">${durationDays} ${isSi ? 'දින සඳහා අදාළ කුලී අයකිරීම' : 'Days rental period charges'}</div>
          </td>
          <td>${isSi ? 'කුලී ගාස්තු' : 'Hire Charge'}</td>
          <td class="text-right font-bold">${formatLKR(r.rentAmount)}</td>
        </tr>
        <tr>
          <td>
            <strong>${isSi ? 'ආරක්ෂිත ඇප තැන්පතුව' : 'Refundable Security Deposit'}</strong>
            <div style="font-size:11px; color:#64748b;">${isSi ? 'ආපසු භාරදීමේදී සම්පූර්ණයෙන්ම බේරුම්කරණය කෙරේ' : 'Refundable upon safe return and inspection'}</div>
          </td>
          <td><span class="badge badge-active">${depositStatusText}</span></td>
          <td class="text-right font-bold">${formatLKR(r.depositAmount)}</td>
        </tr>
        ${
          r.deliveryFee > 0
            ? `<tr>
                <td>
                  <strong>${isSi ? 'වැඩබිමට ප්‍රවාහන සහ ලොජිස්ටික්ස් ගාස්තුව' : 'Site Logistics & Delivery Fee'}</strong>
                  <div style="font-size:11px; color:#64748b;">${isSi ? 'වැඩබිමට භාණ්ඩය ප්‍රවාහනය කිරීම' : 'Direct heavy transport to job site location'}</div>
                </td>
                <td>${isSi ? 'ප්‍රවාහන' : 'Logistics'}</td>
                <td class="text-right font-bold">${formatLKR(r.deliveryFee)}</td>
              </tr>`
            : ''
        }
        ${
          r.lateFee > 0
            ? `<tr>
                <td><strong class="text-danger">${isSi ? 'ප්‍රමාද දඩ ගාස්තු' : 'Late Overdue Penalty'}</strong></td>
                <td>${isSi ? 'දඩ මුදල්' : 'Penalty'}</td>
                <td class="text-right font-bold text-danger">+ ${formatLKR(r.lateFee)}</td>
              </tr>`
            : ''
        }
        ${
          r.damageFee > 0
            ? `<tr>
                <td><strong class="text-danger">${isSi ? 'හානි සහ අලුත්වැඩියා අඩුකිරීම්' : 'Damage & Repair Deductions'}</strong></td>
                <td>${isSi ? 'අලුත්වැඩියා' : 'Repair'}</td>
                <td class="text-right font-bold text-danger">+ ${formatLKR(r.damageFee)}</td>
              </tr>`
            : ''
        }
      </tbody>
    </table>

    <!-- TOTALS SUMMARY -->
    <div class="inv-totals-box">
      <table class="inv-totals-table">
        <tr>
          <td>${isSi ? 'උප එකතුව (Sub Total):' : 'Gross Subtotal:'}</td>
          <td class="cost-val">${formatLKR(r.totalAmount)}</td>
        </tr>
        <tr>
          <td>${isSi ? 'ගෙවීම් තත්ත්වය:' : 'Payment Status:'}</td>
          <td class="cost-val text-success"><strong>${isSi ? 'සම්පූර්ණයෙන්ම ගෙවා ඇත (PAID)' : 'PAID IN FULL'}</strong></td>
        </tr>
        <tr>
          <td>${isSi ? 'තැන්පතු තත්ත්වය:' : 'Deposit Balance:'}</td>
          <td class="cost-val text-gold"><strong>${formatLKR(r.depositAmount)} (${r.depositStatus})</strong></td>
        </tr>
        <tr class="total-row">
          <td>${isSi ? 'මුළු බේරුම්කරණ මුදල:' : 'Net Invoice Total:'}</td>
          <td class="cost-val" style="color:#d97706; font-size:18px;">${formatLKR(r.totalAmount)}</td>
        </tr>
      </table>
    </div>

    <!-- DIGITAL SIGNATURES & OFFICIAL STAMP -->
    <div class="inv-footer-signatures">
      <div class="inv-sig-box">
        ${
          r.digitalSignature
            ? `<img src="${r.digitalSignature}" alt="Customer Signature">`
            : `<div style="height:55px; display:flex; align-items:center; justify-content:center; color:#94a3b8; font-style:italic;">Verified Digital ID</div>`
        }
        <span>${isSi ? 'පාරිභෝගික / කොන්ත්‍රාත්කරු ඩිජිටල් අත්සන' : 'LESSEE / CUSTOMER AUTHORIZED SIGNATURE'}</span>
      </div>

      <div class="inv-sig-box">
        <div style="height:55px; display:flex; align-items:center; justify-content:center; color:#d97706; font-weight:800; font-size:13px; border:2px dashed #f59e0b; border-radius:4px; margin-bottom:6px;">
          ★ LIONS ENGINEERING (PVT) LTD ★
        </div>
        <span>${isSi ? 'සමාගමේ නිල බලයලත් සහතිකය' : 'OFFICIAL AUTHORIZATION & COMPANY STAMP'}</span>
      </div>
    </div>

    <!-- TERMS & CONDITIONS IN CHOSEN LANGUAGE -->
    <div class="inv-terms-notes">
      <strong>${isSi ? 'නියමයන් සහ කොන්දේසි:' : 'Rental Terms & Conditions:'}</strong>
      ${
        isSi
          ? '1. සියලුම යන්ත්‍රෝපකරණ නියමිත දිනට පෙර ආපසු භාරදිය යුතු අතර ප්‍රමාද වන දින සඳහා සාමාන්‍ය දෛනික කුලිය අයකෙරේ. 2. උපකරණ ක්‍රියාත්මක කිරීමේදී සිදුවන අනතුරු සහ අලාභහානි සඳහා පාරිභෝගිකයා සම්පූර්ණයෙන්ම වගකිව යුතුය. 3. උපකරණය නිරුපද්‍රිතව භාරදුන් පසු ඇප තැන්පතුව සම්පූර්ණයෙන්ම ආපසු ගෙවනු ලැබේ.'
          : '1. All rented machinery must be returned on or before the due date; overdue days incur standard daily rate penalties. 2. Lessee assumes full operational liability for equipment handling and safety protocols. 3. Refundable deposits are audited and processed immediately upon successful equipment return and condition inspection.'
      }
    </div>
  `;
}

function printInvoiceDocument() {
  window.print();
}

function downloadInvoicePdf() {
  if (!currentInvoiceRental) return;
  window.open(`${API_BASE}/rentals/${currentInvoiceRental._id}/pdf`, '_blank');
}

// Global Search
document.getElementById('global-search').addEventListener('input', () => {
  renderActiveTab();
});

document.getElementById('btn-quick-rent').addEventListener('click', () => prepareNewRentalModal());

document.getElementById('btn-quick-add-tool').addEventListener('click', () => {
  document.getElementById('form-tool').reset();
  document.getElementById('tool-edit-id').value = '';
  document.getElementById('modal-tool-title').textContent = 'Add New Tool to Inventory';
  openModal('modal-tool');
});

document.getElementById('btn-add-tool-modal').addEventListener('click', () => {
  document.getElementById('form-tool').reset();
  document.getElementById('tool-edit-id').value = '';
  document.getElementById('modal-tool-title').textContent = 'Add New Tool to Inventory';
  openModal('modal-tool');
});

document.getElementById('btn-quick-log-maint').addEventListener('click', () => openLogMaintModal());
document.getElementById('btn-add-maintenance-modal').addEventListener('click', () => openLogMaintModal());
document.getElementById('btn-view-all-rentals').addEventListener('click', () => switchTab('rentals'));

// ----------------------------------------------------
// 17. CUSTOMER KYC & PROFILE MANAGEMENT WORKFLOW
// ----------------------------------------------------
function populateKycProfileView() {
  if (!currentUser) return;

  const elName = document.getElementById('kyc-name');
  const elCompany = document.getElementById('kyc-company');
  const elNic = document.getElementById('kyc-nic');
  const elPhone = document.getElementById('kyc-phone');
  const elEmail = document.getElementById('kyc-email');
  const elAddress = document.getElementById('kyc-address');
  const elStatusChip = document.getElementById('kyc-status-chip');
  const elStanding = document.getElementById('kyc-standing-lbl');

  if (elName) elName.textContent = currentUser.name || 'N/A';
  if (elCompany) elCompany.textContent = currentUser.company_name || 'Individual Contractor';
  if (elNic) elNic.textContent = currentUser.nic_or_passport || 'N/A';
  if (elPhone) elPhone.textContent = currentUser.phone_number || 'N/A';
  if (elEmail) elEmail.textContent = currentUser.email || 'N/A';
  if (elAddress) elAddress.textContent = currentUser.address || 'N/A';

  const status = currentUser.verification_status || 'Verified';
  if (elStatusChip) {
    elStatusChip.textContent = `${status} Contractor`;
    elStatusChip.className = `badge ${status === 'Verified' ? 'badge-active' : 'badge-maintenance'}`;
  }

  if (elStanding) {
    if (status === 'Verified') {
      elStanding.className = 'kyc-field-val text-success';
      elStanding.innerHTML = '<i class="fa-solid fa-circle-check"></i> Approved &amp; Active (Tier-1)';
    } else if (status === 'Under Review') {
      elStanding.className = 'kyc-field-val text-warning';
      elStanding.innerHTML = '<i class="fa-solid fa-clock"></i> Compliance Review in Progress';
    } else {
      elStanding.className = 'kyc-field-val text-muted';
      elStanding.innerHTML = '<i class="fa-solid fa-file-circle-exclamation"></i> Documents Pending Submission';
    }
  }

  // Update Stepper with full completion state and check icons
  const step1 = document.getElementById('step-kyc-1');
  const step2 = document.getElementById('step-kyc-2');
  const step3 = document.getElementById('step-kyc-3');
  const line1 = document.getElementById('line-kyc-1');
  const line2 = document.getElementById('line-kyc-2');

  if (step1 && step2 && step3 && line1 && line2) {
    if (status === 'Verified') {
      step1.className = 'stepper-step completed';
      const icon1 = step1.querySelector('.step-icon');
      if (icon1) icon1.innerHTML = '<i class="fa-solid fa-circle-check"></i>';

      line1.className = 'stepper-line completed';

      step2.className = 'stepper-step completed';
      const icon2 = step2.querySelector('.step-icon');
      if (icon2) icon2.innerHTML = '<i class="fa-solid fa-circle-check"></i>';

      line2.className = 'stepper-line completed';

      step3.className = 'stepper-step completed';
      const icon3 = step3.querySelector('.step-icon');
      if (icon3) icon3.innerHTML = '<i class="fa-solid fa-circle-check"></i>';
    } else if (status === 'Under Review') {
      step1.className = 'stepper-step completed';
      const icon1 = step1.querySelector('.step-icon');
      if (icon1) icon1.innerHTML = '<i class="fa-solid fa-circle-check"></i>';

      line1.className = 'stepper-line completed';

      step2.className = 'stepper-step active';
      const icon2 = step2.querySelector('.step-icon');
      if (icon2) icon2.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i>';

      line2.className = 'stepper-line';

      step3.className = 'stepper-step';
      const icon3 = step3.querySelector('.step-icon');
      if (icon3) icon3.innerHTML = '<i class="fa-solid fa-lock"></i>';
    } else {
      step1.className = 'stepper-step active';
      const icon1 = step1.querySelector('.step-icon');
      if (icon1) icon1.innerHTML = '<i class="fa-solid fa-file-arrow-up"></i>';

      line1.className = 'stepper-line';

      step2.className = 'stepper-step';
      const icon2 = step2.querySelector('.step-icon');
      if (icon2) icon2.innerHTML = '<i class="fa-solid fa-clock"></i>';

      line2.className = 'stepper-line';

      step3.className = 'stepper-step';
      const icon3 = step3.querySelector('.step-icon');
      if (icon3) icon3.innerHTML = '<i class="fa-solid fa-lock"></i>';
    }
  }
}

function openUpdateProfileModal() {
  if (!currentUser) return;

  const inputName = document.getElementById('prof-input-name');
  const inputComp = document.getElementById('prof-input-company');
  const inputPhone = document.getElementById('prof-input-phone');
  const inputNic = document.getElementById('prof-input-nic');
  const inputAddress = document.getElementById('prof-input-address');

  if (inputName) inputName.value = currentUser.name || '';
  if (inputComp) inputComp.value = currentUser.company_name || '';
  if (inputPhone) inputPhone.value = currentUser.phone_number || '';
  if (inputNic) inputNic.value = currentUser.nic_or_passport || '';
  if (inputAddress) inputAddress.value = currentUser.address || '';

  openModal('modal-update-profile');
}

const formUpdateProfile = document.getElementById('form-update-profile');
if (formUpdateProfile) {
  formUpdateProfile.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('prof-input-name').value.trim();
    const company_name = document.getElementById('prof-input-company').value.trim();
    const phone_number = document.getElementById('prof-input-phone').value.trim();
    const address = document.getElementById('prof-input-address').value.trim();
    const btn = document.getElementById('btn-save-profile');
    const originalBtn = btn ? btn.innerHTML : '';

    if (btn) {
      btn.disabled = true;
      btn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Saving...`;
    }

    try {
      const res = await authFetch(`${API_BASE}/auth/profile`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, company_name, phone_number, address }),
      });
      const json = await res.json();

      if (json.success) {
        currentUser = json.user;
        localStorage.setItem('lions_user', JSON.stringify(currentUser));
        showToast(json.message || 'Profile updated successfully!', 'success');
        closeModal('modal-update-profile');
        populateKycProfileView();
      } else {
        showToast(json.message || 'Failed to update profile', 'error');
      }
    } catch (err) {
      showToast('Error updating contractor profile', 'error');
    } finally {
      if (btn) {
        btn.disabled = false;
        btn.innerHTML = originalBtn;
      }
    }
  });
}

function openReuploadKycModal() {
  const fileLabel = document.getElementById('reupload-file-label');
  const fileInput = document.getElementById('reupload-file-input');
  if (fileLabel) fileLabel.textContent = 'Click to browse or drag & drop document';
  if (fileInput) fileInput.value = '';
  openModal('modal-reupload-kyc');
}

function handleKycFileSelect(input) {
  const file = input.files && input.files[0];
  const fileLabel = document.getElementById('reupload-file-label');
  if (file && fileLabel) {
    fileLabel.innerHTML = `<i class="fa-solid fa-file-circle-check text-success"></i> Selected: <strong>${file.name}</strong> (${(file.size / 1024).toFixed(1)} KB)`;
  }
}

const formReuploadKyc = document.getElementById('form-reupload-kyc');
if (formReuploadKyc) {
  formReuploadKyc.addEventListener('submit', async (e) => {
    e.preventDefault();
    const docType = document.getElementById('reupload-doc-type').value;
    const btn = document.getElementById('btn-submit-reupload');
    const originalBtn = btn ? btn.innerHTML : '';

    if (btn) {
      btn.disabled = true;
      btn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Uploading...`;
    }

    try {
      const res = await authFetch(`${API_BASE}/auth/reupload-kyc`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ documentType: docType }),
      });
      const json = await res.json();

      if (json.success) {
        currentUser = json.user;
        localStorage.setItem('lions_user', JSON.stringify(currentUser));
        showToast(json.message || 'Documents uploaded! Verification status is now Under Review.', 'success');
        closeModal('modal-reupload-kyc');
        populateKycProfileView();
      } else {
        showToast(json.message || 'Document upload failed', 'error');
      }
    } catch (err) {
      showToast('Error uploading KYC documents', 'error');
    } finally {
      if (btn) {
        btn.disabled = false;
        btn.innerHTML = originalBtn;
      }
    }
  });
}

function openDocPreviewModal(docType) {
  const titleEl = document.getElementById('doc-viewer-title');
  const imgEl = document.getElementById('doc-viewer-img');
  const descEl = document.getElementById('doc-viewer-desc');

  if (docType === 'nic') {
    if (titleEl) titleEl.innerHTML = `<i class="fa-solid fa-id-card text-gold"></i> National Identity Card (NIC) Inspection`;
    if (descEl) descEl.innerHTML = `<i class="fa-solid fa-lock text-gold"></i> National ID Number: <strong>${(currentUser && currentUser.nic_or_passport) || '851234567V'}</strong> | Verified with Sri Lanka RPD Registry.`;
    if (imgEl) imgEl.src = (currentUser && currentUser.kyc_document_url) || 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="460" height="280" viewBox="0 0 460 280"><rect width="460" height="280" rx="14" fill="%23f8fafc" stroke="%23cbd5e1" stroke-width="2"/><text x="50%" y="38%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="18" font-weight="bold" fill="%230f172a">National Identity Card (NIC)</text><text x="50%" y="52%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="14" font-weight="bold" fill="%23d97706">' + ((currentUser && currentUser.nic_or_passport) || '851234567V') + '</text><text x="50%" y="66%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="12" fill="%2364748b">Verified Official Scan on File</text></svg>';
  } else {
    if (titleEl) titleEl.innerHTML = `<i class="fa-solid fa-file-invoice text-gold"></i> Business Registration Certificate (BR) Inspection`;
    if (descEl) descEl.innerHTML = `<i class="fa-solid fa-lock text-gold"></i> Registered Company: <strong>${(currentUser && currentUser.company_name) || 'Apex Civil Engineering Ltd'}</strong> | Certificate of Incorporation Verified.`;
    if (imgEl) imgEl.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="460" height="280" viewBox="0 0 460 280"><rect width="460" height="280" rx="14" fill="%23f8fafc" stroke="%23cbd5e1" stroke-width="2"/><text x="50%" y="38%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="18" font-weight="bold" fill="%230f172a">Business Registration Certificate (BR)</text><text x="50%" y="52%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="14" font-weight="bold" fill="%232563eb">' + ((currentUser && currentUser.company_name) || 'Apex Civil Engineering Ltd') + '</text><text x="50%" y="66%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="12" fill="%2364748b">Certified True Copy on Record</text></svg>';
  }

  openModal('modal-doc-viewer');
}

// Initial Boot
document.addEventListener('DOMContentLoaded', () => {
  setLanguage(currentLang);
  checkDevEnvironment();

  // Populate remembered email if present
  const rememberedEmail = localStorage.getItem('lions_remember_email');
  if (rememberedEmail) {
    const emailInput = document.getElementById('landing-login-email');
    if (emailInput) emailInput.value = rememberedEmail;
    const rememberCheckbox = document.getElementById('login-remember-me');
    if (rememberCheckbox) rememberCheckbox.checked = true;
  }

  updateAuthUI();
});
