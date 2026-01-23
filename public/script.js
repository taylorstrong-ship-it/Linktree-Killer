// Default Links Data
let links = [
    { label: "Check out the Website", url: "https://tayloredpetportraits.com", icon: "fa-globe" },
    { label: "Follow on Instagram", url: "https://instagram.com/tayloredpetportraits", icon: "fa-instagram" },
    { label: "Order a Portrait", url: "https://tayloredpetportraits.com/products", icon: "fa-paintbrush" },
    { label: "Contact Us", url: "mailto:hello@example.com", icon: "fa-envelope" }
];

const ICON_LIBRARY = [
    // Social
    "fa-instagram", "fa-tiktok", "fa-twitter", "fa-facebook", "fa-youtube", "fa-linkedin", "fa-discord", "fa-whatsapp", "fa-spotify", "fa-twitch",
    // Contact
    "fa-envelope", "fa-phone", "fa-paper-plane", "fa-message", "fa-location-dot", "fa-globe", "fa-link",
    // Commerce / Action
    "fa-cart-shopping", "fa-bag-shopping", "fa-credit-card", "fa-money-bill", "fa-calendar", "fa-calendar-check", "fa-star", "fa-heart",
    // General
    "fa-paw", "fa-user", "fa-music", "fa-camera", "fa-video", "fa-image", "fa-paintbrush", "fa-wand-magic-sparkles", "fa-graduation-cap", "fa-book"
];

// Init
async function init() {
    // Check if we're on the builder page - require authentication
    const isBuilderPage = document.querySelector('.editor');
    if (isBuilderPage) {
        await checkAuthAndShowBuilder();
    } else {
        // Profile page - load from Supabase (public access)
        loadProfile();
    }
    
    renderLinks();
    setupAccordions();
}

// Authentication gate for builder
async function checkAuthAndShowBuilder() {
    const authModal = document.getElementById('authModal');
    const editor = document.querySelector('.editor');
    const preview = document.querySelector('.preview');
    const logoutBtn = document.getElementById('logoutBtn');
    
    const { user, error } = await checkAuth();
    
    if (!user) {
        // Not logged in - show auth modal, hide builder
        if (authModal) authModal.style.display = 'flex';
        if (editor) editor.style.display = 'none';
        if (preview) preview.style.display = 'none';
        if (logoutBtn) logoutBtn.style.display = 'none';
        return;
    }
    
    // Logged in - hide auth modal, show builder
    if (authModal) authModal.style.display = 'none';
    if (editor) editor.style.display = 'flex';
    if (logoutBtn) logoutBtn.style.display = 'block';
    
    // Load user's profile
    await loadProfile();
    updatePreview();
}

// Handle authentication form submission
let isSignUpMode = false;

function toggleAuthMode() {
    isSignUpMode = !isSignUpMode;
    const submitBtn = document.getElementById('authSubmitBtn');
    const toggleBtn = document.querySelector('.auth-btn-secondary');
    
    if (isSignUpMode) {
        submitBtn.innerHTML = '<i class="fa-solid fa-user-plus"></i> Sign Up';
        toggleBtn.innerHTML = '<i class="fa-solid fa-sign-in-alt"></i> Sign In Instead';
    } else {
        submitBtn.innerHTML = '<i class="fa-solid fa-sign-in-alt"></i> Sign In';
        toggleBtn.innerHTML = '<i class="fa-solid fa-user-plus"></i> Sign Up Instead';
    }
}

async function handleAuth(event) {
    event.preventDefault();
    
    const email = document.getElementById('authEmail').value;
    const password = document.getElementById('authPassword').value;
    const errorDiv = document.getElementById('authError');
    const submitBtn = document.getElementById('authSubmitBtn');
    const originalHTML = submitBtn.innerHTML;
    
    // Clear previous errors
    errorDiv.style.display = 'none';
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Processing...';
    
    try {
        let result;
        if (isSignUpMode) {
            result = await signUp(email, password);
        } else {
            result = await signIn(email, password);
        }
        
        if (result.error) {
            errorDiv.textContent = result.error.message || 'Authentication failed';
            errorDiv.style.display = 'block';
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalHTML;
            return;
        }
        
        // Success - reload to show builder
        window.location.reload();
    } catch (err) {
        errorDiv.textContent = 'An error occurred. Please try again.';
        errorDiv.style.display = 'block';
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalHTML;
    }
}

// Handle logout
async function handleLogout() {
    if (confirm('Are you sure you want to log out?')) {
        await signOut();
    }
}

// --- AUTHENTICATION FUNCTIONS ---

// Check if user is logged in
async function checkAuth() {
    try {
        if (typeof supabaseClient === 'undefined') {
            return { user: null, session: null };
        }
        const { data: { session }, error } = await supabaseClient.auth.getSession();
        return { user: session?.user || null, session, error };
    } catch (err) {
        console.error('Auth check error:', err);
        return { user: null, session: null, error: err };
    }
}

// Sign up new user
// NOTE: Profile creation is handled automatically by the SQL trigger (create_profile_for_new_user)
// We do NOT create a profile manually here to avoid duplicate key errors
async function signUp(email, password) {
    try {
        if (typeof supabaseClient === 'undefined') {
            throw new Error('Supabase client not loaded');
        }
        const { data, error } = await supabaseClient.auth.signUp({
            email: email,
            password: password
        });
        
        // Success! The SQL trigger will automatically create the profile
        // We don't need to do anything else here
        return { data, error };
    } catch (err) {
        console.error('Sign up error:', err);
        return { data: null, error: err };
    }
}

// Sign in existing user
async function signIn(email, password) {
    try {
        if (typeof supabaseClient === 'undefined') {
            throw new Error('Supabase client not loaded');
        }
        const { data, error } = await supabaseClient.auth.signInWithPassword({
            email: email,
            password: password
        });
        return { data, error };
    } catch (err) {
        console.error('Sign in error:', err);
        return { data: null, error: err };
    }
}

// Sign out user
async function signOut() {
    try {
        if (typeof supabaseClient === 'undefined') {
            throw new Error('Supabase client not loaded');
        }
        const { error } = await supabaseClient.auth.signOut();
        if (!error) {
            window.location.reload(); // Reload to show login screen
        }
        return { error };
    } catch (err) {
        console.error('Sign out error:', err);
        return { error: err };
    }
}

// --- SUPABASE FUNCTIONS ---

// Get all profile data as an object
function getProfileData() {
    return {
        name: getValue('brandName', 'Taylored Pet Portraits'),
        bio: getValue('brandBio', 'Custom portraits & helping shelter pets 🐾'),
        logo: getValue('logoUrl', 'logo.gif'),
        bg1: getValue('colorBg1', '#E4F3FF'),
        bg2: getValue('colorBg2', '#E0D6FF'),
        btn: getValue('colorBtn', '#7DC6FF'),
        btnText: getValue('colorBtnText', '#ffffff'),
        btnPadY: getValue('btnHeight', '18'),
        btnRadius: getValue('btnRadius', '50'),
        contactName: getValue('contactName', 'Taylor Strong'),
        contactPhone: getValue('contactPhone', '555-0123'),
        contactEmail: getValue('contactEmail', 'hello@taylored.com'),
        contactTitle: getValue('contactTitle', 'Founder'),
        contactWebsite: getValue('contactWebsite', 'https://tayloredpetportraits.com'),
        notificationEmail: getValue('notificationEmail', 'leads@mybrand.com'),
        mediaUrl: getValue('mediaUrl', ''),
        links: links // Array of link objects
    };
}

// Save profile to Supabase
async function saveProfile() {
    try {
        // Ensure Supabase client is available
        if (typeof supabaseClient === 'undefined') {
            showToast('Supabase client not loaded. Please refresh the page.', 'fa-exclamation-circle');
            return;
        }

        // Get current user
        const { data: { session } } = await supabaseClient.auth.getSession();
        if (!session || !session.user) {
            showToast('You must be logged in to save your profile.', 'fa-exclamation-circle');
            return;
        }

        const profileData = getProfileData();
        
        // UPSERT to Supabase using id (UUID primary key matching auth.users.id)
        // Also include user_id for compatibility (it mirrors id)
        const { data, error } = await supabaseClient
            .from('profiles')
            .upsert({
                id: session.user.id, // Use authenticated user's UUID as primary key
                user_id: session.user.id, // Also set user_id (mirrors id for compatibility)
                ...profileData,
                updated_at: new Date().toISOString()
            }, {
                onConflict: 'id' // Conflict on id (UUID primary key)
            });

        if (error) {
            console.error('Error saving profile:', error);
            showToast('Error saving profile: ' + error.message, 'fa-exclamation-circle');
            return;
        }

        showToast('Profile saved successfully!', 'fa-check-circle');
    } catch (err) {
        console.error('Error saving profile:', err);
        showToast('Error saving profile', 'fa-exclamation-circle');
    }
}

// Load profile from Supabase
async function loadProfile() {
    try {
        // Check if Supabase client is available
        if (typeof supabaseClient === 'undefined') {
            console.log('Supabase client not loaded, using defaults');
            updatePreview();
            return;
        }

        // Get current user
        const { data: { session } } = await supabaseClient.auth.getSession();
        if (!session || !session.user) {
            console.log('No user session, using defaults');
            updatePreview();
            return;
        }

        // SELECT from Supabase using id (UUID primary key matching auth.users.id)
        const { data, error } = await supabaseClient
            .from('profiles')
            .select('*')
            .eq('id', session.user.id) // Use id (UUID) instead of user_id
            .single();

        if (error) {
            // If no profile exists (PGRST116 = no rows returned), create one immediately
            if (error.code === 'PGRST116') {
                console.log('No profile found for user, creating default profile...');
                const createResult = await createDefaultProfile(session.user.id);
                
                if (createResult.error) {
                    console.error('Failed to create profile:', createResult.error);
                    showToast('Error creating your profile. Please try refreshing.', 'fa-exclamation-circle');
                    return;
                }
                
                // Profile created successfully, now load it
                const { data: newData, error: newError } = await supabaseClient
                    .from('profiles')
                    .select('*')
                    .eq('id', session.user.id) // STRICT FILTER: Only this user's profile (id is UUID primary key)
                    .single();
                
                if (newError || !newData) {
                    console.error('Error loading newly created profile:', newError);
                    showToast('Error loading profile. Please refresh.', 'fa-exclamation-circle');
                    return;
                }
                
                // Populate with the newly created profile
                populateProfileData(newData);
                return;
            }
            
            // Other errors - don't fall back to defaults, show error instead
            console.error('Error loading profile:', error);
            showToast('Error loading your profile: ' + (error.message || 'Unknown error'), 'fa-exclamation-circle');
            return;
        }

        // Profile found - populate with user's own data
        if (!data) {
            console.error('Profile query returned no data');
            showToast('No profile data found. Please refresh.', 'fa-exclamation-circle');
            return;
        }

        // STRICT: Only populate if this profile belongs to the current user
        if (data.id !== session.user.id) {
            console.error('Profile id mismatch! Expected:', session.user.id, 'Got:', data.id);
            showToast('Profile mismatch detected. Please refresh.', 'fa-exclamation-circle');
            return;
        }

        // Populate profile data
        populateProfileData(data);
    } catch (err) {
        console.error('Error loading profile:', err);
        // Don't fall back to defaults - show error instead
        showToast('Error loading profile: ' + (err.message || 'Unknown error'), 'fa-exclamation-circle');
    }
}

// Helper function to populate profile data into form
function populateProfileData(data) {
    if (!data) return;
    
    // Populate form fields if they exist (builder page)
    if (document.getElementById('brandName')) {
        document.getElementById('brandName').value = data.name || '';
        document.getElementById('brandBio').value = data.bio || '';
        document.getElementById('logoUrl').value = data.logo || '';
        document.getElementById('colorBg1').value = data.bg1 || '#E4F3FF';
        document.getElementById('colorBg2').value = data.bg2 || '#E0D6FF';
        document.getElementById('colorBtn').value = data.btn || '#7DC6FF';
        document.getElementById('colorBtnText').value = data.btnText || '#ffffff';
        document.getElementById('btnHeight').value = data.btnPadY || '18';
        document.getElementById('btnRadius').value = data.btnRadius || '50';
        document.getElementById('contactName').value = data.contactName || '';
        document.getElementById('contactPhone').value = data.contactPhone || '';
        document.getElementById('contactEmail').value = data.contactEmail || '';
        document.getElementById('contactTitle').value = data.contactTitle || '';
        document.getElementById('contactWebsite').value = data.contactWebsite || '';
        document.getElementById('notificationEmail').value = data.notificationEmail || '';
        document.getElementById('mediaUrl').value = data.mediaUrl || '';
    }

    // Load links if they exist
    if (data.links && Array.isArray(data.links)) {
        links = data.links;
        renderLinks();
    }

    // Update preview
    updatePreview();
}

// Create default profile for new user (onboarding fallback)
// NOTE: This is a fallback. The SQL trigger should automatically create profiles on signup.
// This function is only called if the trigger somehow didn't run or failed.
async function createDefaultProfile(userId) {
    try {
        // Generate unique name using timestamp to avoid conflicts
        const uniqueName = 'My Link Page ' + new Date().toISOString().split('T')[0];
        
        const defaultProfile = {
            id: userId, // Use UUID as primary key (matching auth.users.id)
            user_id: userId, // Also set user_id (mirrors id for compatibility)
            name: uniqueName, // Unique name to avoid any conflicts
            bio: 'Welcome to your link page! 🎉',
            logo: 'logo.gif',
            bg1: '#E4F3FF',
            bg2: '#E0D6FF',
            btn: '#7DC6FF',
            btnText: '#ffffff',
            btnPadY: '18',
            btnRadius: '50',
            contactName: '',
            contactPhone: '',
            contactEmail: '',
            contactTitle: '',
            contactWebsite: '',
            notificationEmail: '',
            mediaUrl: '',
            links: [
                { label: "My Website", url: "https://example.com", icon: "fa-globe" },
                { label: "Contact Me", url: "mailto:hello@example.com", icon: "fa-envelope" }
            ]
        };

        // Use upsert instead of insert to handle case where trigger already created profile
        const { data, error } = await supabaseClient
            .from('profiles')
            .upsert([defaultProfile], {
                onConflict: 'id' // If profile exists, update it; otherwise create (id is UUID primary key)
            })
            .select()
            .single();

        if (error) {
            console.error('Error creating default profile:', error);
            return { data: null, error };
        }

        return { data, error: null };
    } catch (err) {
        console.error('Error creating default profile:', err);
        return { data: null, error: err };
    }
}

// --- AI IMPORT LOGIC (Updated) ---
async function runAiImport() {
    const urlInput = document.getElementById('aiImportUrl');
    const url = urlInput?.value?.trim();
    
    if (!url) {
        showToast('Please enter a website URL', 'fa-exclamation-circle');
        return;
    }
    
    // Show loading state - '👨🍳 Let it cook...'
    const importBtn = document.getElementById('aiMagicBtn');
    const btnText = importBtn?.querySelector('.btn-text');
    const btnLoading = importBtn?.querySelector('.btn-loading');
    const btnSuccess = importBtn?.querySelector('.btn-success');
    
    if (importBtn && btnText && btnLoading) {
        importBtn.disabled = true;
        btnText.style.display = 'none';
        btnLoading.style.display = 'flex';
        // Ensure success matches hidden state initially
        if(btnSuccess) btnSuccess.style.display = 'none';
    }
    
    try {
        // Call the API endpoint
        const response = await fetch('/api/generate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ url: url })
        });
        
        const result = await response.json();
        
        if (!response.ok || !result.success) {
            throw new Error(result.error || 'Failed to generate profile');
        }
        
        const data = result.data;
        
        // Populate Business Name and Bio (Branding)
        if (document.getElementById('brandName')) {
            document.getElementById('brandName').value = data.name || '';
            // Trigger input event to update preview
            document.getElementById('brandName').dispatchEvent(new Event('input', { bubbles: true }));
        }
        
        if (document.getElementById('brandBio')) {
            document.getElementById('brandBio').value = data.bio || '';
            document.getElementById('brandBio').dispatchEvent(new Event('input', { bubbles: true }));
        }
        
        // Also populate other fields if available in the response, to be helpful (colors, etc)
        if (data.bg1 && document.getElementById('colorBg1')) {
            document.getElementById('colorBg1').value = data.bg1;
            document.getElementById('colorBg1').dispatchEvent(new Event('input', { bubbles: true }));
        }
        if (data.bg2 && document.getElementById('colorBg2')) {
            document.getElementById('colorBg2').value = data.bg2;
            document.getElementById('colorBg2').dispatchEvent(new Event('input', { bubbles: true }));
        }
        if (data.btn && document.getElementById('colorBtn')) {
            document.getElementById('colorBtn').value = data.btn;
            document.getElementById('colorBtn').dispatchEvent(new Event('input', { bubbles: true }));
        }
        
        // Update links if returned
        if (data.links && Array.isArray(data.links) && data.links.length > 0) {
            links = data.links.map(link => ({
                label: link.label || 'New Link',
                url: link.url || '#',
                icon: link.icon || 'fa-link'
            }));
            renderLinks();
            updatePreview();
        }
        
        showToast('✨ AI Magic Import Complete!', 'fa-wand-magic-sparkles');
        
        // Clear the input
        if (urlInput) urlInput.value = '';
        
        // Show "Done!" for 2 seconds
        if (importBtn && btnText && btnLoading && btnSuccess) {
            btnLoading.style.display = 'none';
            btnSuccess.style.display = 'flex';
            
            setTimeout(() => {
                btnSuccess.style.display = 'none';
                btnText.style.display = 'flex';
                importBtn.disabled = false;
            }, 2000);
        } else if (importBtn) {
            importBtn.disabled = false;
        }
        
    } catch (error) {
        console.error('AI Import Error:', error);
        showToast('AI Import failed: ' + (error.message || 'Unknown error'), 'fa-exclamation-circle');
        
        // Restore button state
        if (importBtn && btnText && btnLoading && btnSuccess) {
            btnLoading.style.display = 'none';
            btnSuccess.style.display = 'none';
            btnText.style.display = 'flex';
            importBtn.disabled = false;
        } else if (importBtn) {
            importBtn.disabled = false;
        }
    }
}

// --- LOAD DEMO DATA ---
function loadDemoData() {
    // Set Branding
    const brandName = document.getElementById('brandName');
    const brandBio = document.getElementById('brandBio');
    const logoUrl = document.getElementById('logoUrl');
    
    brandName.value = 'Denton Sandwich Co.';
    brandBio.value = 'The best sandwiches at Lucky Lou\'s. 🥪🐶';
    logoUrl.value = 'https://images.unsplash.com/photo-1553909489-cf47ac912433?w=400&h=400&fit=crop';
    
    // Trigger input events to ensure preview updates
    brandName.dispatchEvent(new Event('input', { bubbles: true }));
    brandBio.dispatchEvent(new Event('input', { bubbles: true }));
    logoUrl.dispatchEvent(new Event('input', { bubbles: true }));
    
    // Set Colors - Food Truck Red theme
    const colorBg1 = document.getElementById('colorBg1');
    const colorBg2 = document.getElementById('colorBg2');
    const colorBtn = document.getElementById('colorBtn');
    const colorBtnText = document.getElementById('colorBtnText');
    
    colorBg1.value = '#D9381E';
    colorBg2.value = '#D9381E';
    colorBtn.value = '#D9381E';
    colorBtnText.value = '#FFFFFF';
    
    // Trigger input events for color inputs
    colorBg1.dispatchEvent(new Event('input', { bubbles: true }));
    colorBg2.dispatchEvent(new Event('input', { bubbles: true }));
    colorBtn.dispatchEvent(new Event('input', { bubbles: true }));
    colorBtnText.dispatchEvent(new Event('input', { bubbles: true }));
    
    // Replace links with demo links
    links = [
        { label: 'View Menu', url: 'https://example.com/menu', icon: 'fa-book' },
        { label: 'Order Online', url: 'https://example.com/order', icon: 'fa-cart-shopping' },
        { label: 'Leave a Review', url: 'https://example.com/review', icon: 'fa-star' }
    ];
    
    // Re-render everything
    renderLinks();
    updatePreview();
    
    // Show success toast
    showToast('Demo data loaded! 🥪', 'fa-rocket');
}

// --- RENDER LINKS WITH NEW UI ---
function renderLinks() {
    const container = document.getElementById('linksList');
    if (!container) return; // Skip if editor not present (profile-only mode)
    container.innerHTML = '';

    links.forEach((link, index) => {
        const div = document.createElement('div');
        div.className = 'link-item';
        div.innerHTML = `
            <!-- Reordering -->
            <div class="reorder-controls">
                <button class="reorder-btn" onclick="moveLink(${index}, -1)" title="Move Up" ${index === 0 ? 'disabled style="opacity:0.3"' : ''}>
                    <i class="fa-solid fa-chevron-up"></i>
                </button>
                <button class="reorder-btn" onclick="moveLink(${index}, 1)" title="Move Down" ${index === links.length - 1 ? 'disabled style="opacity:0.3"' : ''}>
                    <i class="fa-solid fa-chevron-down"></i>
                </button>
            </div>

            <!-- Delete -->
            <button class="remove-btn" onclick="removeLink(${index})" title="Remove Link">
                <i class="fa-solid fa-trash"></i>
            </button>

            <!-- Icon Picker -->
            <div class="input-row" style="position: relative;">
                <label>Icon</label>
                <div style="display: flex; gap: 12px; align-items: center;">
                    <button class="icon-preview-btn" onclick="toggleIconPicker(${index})">
                        <i class="fa-brands ${link.icon} fa-fw"></i>
                        <!-- Fallback if it's solid -->
                        <i class="fa-solid ${link.icon} fa-fw" style="display:none"></i> 
                    </button>
                    <span style="font-size: 0.85rem; color: #999;">Click to change</span>
                </div>

                <!-- Popover -->
                <div class="icon-popover" id="popover-${index}">
                    <div class="icon-grid">
                        ${ICON_LIBRARY.map(icon => `
                            <div class="icon-option" onclick="selectIcon(${index}, '${icon}')">
                                <i class="fa-brands ${icon}"></i>
                            </div>
                        `).join('')}
                    </div>
                    <div style="margin-top: 12px; padding-top: 8px; border-top: 1px solid #eee;">
                        <input type="text" class="manual-icon-input" 
                            placeholder="Or type class (e.g. fa-solid fa-frog)" 
                            style="font-size: 0.8rem; padding: 6px;"
                            onchange="updateLink(${index}, 'icon', this.value)">
                    </div>
                </div>
            </div>

            <div class="input-row">
                <label>Label</label>
                <input type="text" value="${link.label}" oninput="updateLink(${index}, 'label', this.value)" placeholder="Link Title">
            </div>
            
            <div class="input-row">
                <label>URL</label>
                <input type="text" value="${link.url}" oninput="updateLink(${index}, 'url', this.value)" placeholder="https://...">
            </div>
        `;

        // Fix icon display logic (toggle brands/solid)
        const iconBtn = div.querySelector('.icon-preview-btn');
        const iTags = iconBtn.getElementsByTagName('i');
        // Simple hack: try showing both or assume the user picks valid classes.
        // For the generated grid, we used fa-brands mostly, but let's be flexible.
        if (!link.icon.includes('fa-')) {
            iTags[0].className = `fa-solid ${link.icon}`;
        } else {
            iTags[0].className = link.icon.includes('instagram') || link.icon.includes('tiktok') || link.icon.includes('twitter') || link.icon.includes('facebook') ? `fa-brands ${link.icon}` : `fa-solid ${link.icon}`;
        }

        container.appendChild(div);
    });
}

// --- ICON PICKER LOGIC ---
function toggleIconPicker(index) {
    // Close others
    document.querySelectorAll('.icon-popover').forEach(el => {
        if (el.id !== `popover-${index}`) el.classList.remove('open');
    });
    const popover = document.getElementById(`popover-${index}`);
    popover.classList.toggle('open');
}

function selectIcon(index, iconClass) {
    links[index].icon = iconClass;
    renderLinks(); // Re-render to show new icon
    updatePreview();
}

// Close popovers when clicking outside
document.addEventListener('click', function (e) {
    if (!e.target.closest('.icon-preview-btn') && !e.target.closest('.icon-popover')) {
        document.querySelectorAll('.icon-popover').forEach(el => el.classList.remove('open'));
    }
});

// --- REORDER LOGIC ---
function moveLink(index, direction) {
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= links.length) return;

    // Swap
    [links[index], links[newIndex]] = [links[newIndex], links[index]];
    renderLinks();
    updatePreview();
}

function addLink() {
    links.push({ label: "New Link", url: "#", icon: "fa-link" });
    renderLinks();
    updatePreview();
}

function removeLink(index) {
    console.log('Requesting delete for link index:', index);
    // Use toast instead of confirm - show confirmation toast
    showToast('Link removed', 'fa-trash');
    links.splice(index, 1);
    renderLinks();
    updatePreview();
}

function updateLink(index, field, value) {
    links[index][field] = value;
    updatePreview();
}

function resetDesign() {
    document.getElementById('btnHeight').value = "18";
    document.getElementById('btnRadius').value = "50";
    updatePreview();
}

// --- MEDIA PARSER ---
function getMediaEmbed(url) {
    if (!url) return '';

    let embedHtml = '';

    // YouTube
    const ytMatch = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i);
    if (ytMatch && ytMatch[1]) {
        embedHtml = `<div class="video-wrapper"><iframe src="https://www.youtube.com/embed/${ytMatch[1]}" allowfullscreen></iframe></div>`;
    }

    // Vimeo
    const vimeoMatch = url.match(/(?:vimeo\.com\/)(\d+)/i);
    if (vimeoMatch && vimeoMatch[1]) {
        embedHtml = `<div class="video-wrapper"><iframe src="https://player.vimeo.com/video/${vimeoMatch[1]}" allowfullscreen></iframe></div>`;
    }

    // Spotify
    if (url.includes('spotify.com')) {
        let embedUrl = url;
        if (!url.includes('/embed/')) {
            embedUrl = url.replace('open.spotify.com/', 'open.spotify.com/embed/');
        }
        embedHtml = `<iframe style="border-radius:12px" src="${embedUrl}" width="100%" height="352" frameBorder="0" allowfullscreen="" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"></iframe>`;
    }

    if (embedHtml) {
        return `<div class="media-container">${embedHtml}</div>`;
    }
    return '';
}

// --- QR CODE ---
function downloadQRCode() {
    const url = document.getElementById('contactWebsite').value || document.getElementById('brandName').value;
    if (!url) { 
        showToast('Please enter a Website URL first!', 'fa-exclamation-circle');
        return; 
    }

    const qrApi = `https://api.qrserver.com/v1/create-qr-code/?size=1000x1000&data=${encodeURIComponent(url)}`;

    const btn = event.currentTarget;
    const originalHTML = btn.innerHTML;
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Generating...';

    fetch(qrApi)
        .then(res => res.blob())
        .then(blob => {
            const downloadLink = document.createElement('a');
            downloadLink.href = URL.createObjectURL(blob);
            downloadLink.download = 'my-qr-code.png';
            document.body.appendChild(downloadLink);
            downloadLink.click();
            document.body.removeChild(downloadLink);

            btn.innerHTML = originalHTML;

            // Show success toast
            showToast('QR Code Downloaded!', 'fa-check-circle');
        })
        .catch(error => {
            btn.innerHTML = originalHTML;
            showToast('Error generating QR code', 'fa-exclamation-circle');
        });
}

// --- ACCORDIONS ---
function setupAccordions() {
    document.querySelectorAll('.accordion-header').forEach(header => {
        header.addEventListener('click', () => {
            const content = header.nextElementSibling;
            const isOpen = content.classList.contains('open');

            // Optional: Close others? Let's keep multiple open for ease
            // toggle current
            content.classList.toggle('open');
            header.classList.toggle('open');
        });
    });
}

// --- MOBILE TAB SWITCHING ---
// --- MOBILE TAB SWITCHING ---
function switchTab(tab) {
    // Only work on mobile screens
    if (window.innerWidth > 768) {
        return; // Desktop: do nothing, keep split-screen
    }

    const editorEl = document.querySelector('.editor');
    const previewEl = document.querySelector('.preview');
    const btnEditor = document.getElementById('btn-editor');
    const btnPreview = document.getElementById('btn-preview');

    // Safety check
    if (!editorEl || !previewEl) {
        console.warn('Editor or Preview element not found');
        return;
    }

    if (tab === 'editor') {
        // Show Editor, Hide Preview
        editorEl.classList.remove('mobile-hidden');
        previewEl.classList.add('mobile-hidden');

        // Update button states
        if (btnEditor) btnEditor.classList.add('active');
        if (btnPreview) btnPreview.classList.remove('active');
    } else if (tab === 'preview') {
        // Show Preview, Hide Editor
        editorEl.classList.add('mobile-hidden');
        previewEl.classList.remove('mobile-hidden');

        // Update button states
        if (btnEditor) btnEditor.classList.remove('active');
        if (btnPreview) btnPreview.classList.add('active');

        // Ensure preview is up to date
        updatePreview();
    }
}

// Helper function to safely get element value
function getValue(id, defaultValue = '') {
    const el = document.getElementById(id);
    return el ? el.value : defaultValue;
}

// GENERATE THE TEMPLATE
function getTemplate() {
    const data = {
        name: getValue('brandName', 'Taylored Pet Portraits'),
        bio: getValue('brandBio', 'Custom portraits & helping shelter pets 🐾'),
        logo: getValue('logoUrl', 'logo.gif'),
        bg1: getValue('colorBg1', '#E4F3FF'),
        bg2: getValue('colorBg2', '#E0D6FF'),
        btn: getValue('colorBtn', '#7DC6FF'),
        btnText: getValue('colorBtnText', '#ffffff'),
        btnPadY: getValue('btnHeight', '18'),
        btnRadius: getValue('btnRadius', '50'),
        // New Contact Data
        contactName: getValue('contactName', 'Taylor Strong'),
        contactPhone: getValue('contactPhone', '555-0123'),
        contactEmail: getValue('contactEmail', 'hello@taylored.com'),
        contactTitle: getValue('contactTitle', 'Founder'),
        contactWebsite: getValue('contactWebsite', 'https://tayloredpetportraits.com'),
        notificationEmail: getValue('notificationEmail', 'leads@mybrand.com'),
        // Media
        mediaUrl: getValue('mediaUrl', '')
    };

    const linksHtml = links.map(l => `
        <a href="${l.url}" class="link-card" target="_blank">
            <i class="fa-solid ${l.icon} link-icon"></i>
            ${l.label}
        </a>
    `).join('');

    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0">
    <title>${data.name}</title>
    <meta name="description" content="${data.bio}">

    <!-- Mobile App Feel -->
    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
    <link rel="apple-touch-icon" href="${data.logo}">
    <link rel="icon" type="image/png" href="${data.logo}">

    <!-- Social Sharing (Open Graph) -->
    <meta property="og:title" content="${data.name}">
    <meta property="og:description" content="${data.bio}">
    <meta property="og:image" content="${data.logo}">
    <meta property="og:type" content="website">

    <link href="https://fonts.googleapis.com/css2?family=Quicksand:wght@500;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <style>
        :root {
            --bg-grad-1: ${data.bg1};
            --bg-grad-2: ${data.bg2};
            --btn-color: ${data.btn};
            --btn-text: ${data.btnText};
            --btn-pad-y: ${data.btnPadY}px;
            --btn-radius: ${data.btnRadius}px;
        }
        * { box-sizing: border-box; margin: 0; padding: 0; -webkit-tap-highlight-color: transparent; }
        body {
            font-family: 'Quicksand', sans-serif;
            background: linear-gradient(180deg, var(--bg-grad-1), var(--bg-grad-2));
            min-height: 100vh;
            display: flex;
            justify-content: center;
            padding: 20px;
            color: #1f2a3c;
            line-height: 1.5;
        }
        .container { width: 100%; max-width: 480px; display: flex; flex-direction: column; align-items: center; gap: 1.5rem; padding-bottom: 2rem; }
        .header { text-align: center; margin-top: 2rem; margin-bottom: 1rem; display: flex; flex-direction: column; align-items: center; }
        .logo-container {
            width: 140px; height: 140px; border-radius: 50%; background: white;
            border: 5px solid white; box-shadow: 0 8px 24px rgba(31, 42, 60, 0.12);
            overflow: hidden; margin-bottom: 1rem; display: flex; justify-content: center; align-items: center;
        }
        .profile-img { width: 90%; height: 90%; object-fit: contain; }
        .brand-name { font-size: 1.8rem; font-weight: 700; margin-bottom: 0.25rem; letter-spacing: -0.5px; }
        .bio { font-size: 1rem; color: #444; font-weight: 500; }
        
        .links { width: 100%; display: flex; flex-direction: column; gap: 1rem; }
        .link-card {
            position: relative; display: flex; align-items: center; justify-content: center;
            text-align: center; text-decoration: none;
            background: var(--btn-color); color: var(--btn-text);
            font-weight: 700; font-size: 1.05rem;
            padding: var(--btn-pad-y) 60px;
            border-radius: var(--btn-radius);
            box-shadow: 0 4px 12px rgba(0,0,0,0.05); transition: all 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94);
            border: 2px solid transparent;
        }
        .link-card:hover { transform: translateY(-3px) scale(1.01); box-shadow: 0 8px 20px rgba(0,0,0,0.15); filter: brightness(105%); }
        .link-icon { position: absolute; left: 24px; font-size: 1.2rem; }
        
        .footer { margin-top: auto; text-align: center; font-size: 0.85rem; color: #444; opacity: 0.8; padding-top: 1rem; }
        .footer span { display: block; margin-top: 5px; font-size: 0.75rem; }

        /* --- CONTACT FEATURE & MODAL --- */
        .contact-btn-static {
            background: white;
            color: var(--btn-color);
            border: 2px solid var(--btn-color);
            border-radius: 99px; /* Pill */
            padding: 12px 32px;
            font-weight: 700;
            font-size: 1rem;
            text-decoration: none;
            display: inline-flex; align-items: center; gap: 8px;
            cursor: pointer;
            margin-top: 16px;
            margin-bottom: 24px;
            transition: transform 0.2s, background 0.2s;
            box-shadow: 0 4px 6px rgba(0,0,0,0.05);
        }
        .contact-btn-static:hover { transform: scale(1.02); background: #f9fafb; }

        /* Media */
        .media-container {
            width: 100%; margin-bottom: 24px; position: relative;
            border-radius: var(--btn-radius); overflow: hidden;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
            background: #000;
        }
        .video-wrapper { position: relative; padding-bottom: 56.25%; /* 16:9 */ height: 0; }
        .video-wrapper iframe { position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: none; }

        .modal-overlay {
            position: fixed; inset: 0; background: rgba(0,0,0,0.5);
            backdrop-filter: blur(5px); z-index: 999;
            display: none; justify-content: center; align-items: flex-end; /* Bottom sheet on mobile */
        }
        .modal-overlay.active { display: flex; animation: fadeIn 0.3s ease; }
        .modal-sheet {
            background: white; width: 100%; max-width: 440px;
            border-radius: 24px 24px 0 0; padding: 32px 24px 48px;
            box-shadow: 0 -10px 40px rgba(0,0,0,0.2);
            transform: translateY(100%); transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
            position: relative;
        }
        @media (min-width: 480px) {
             .modal-overlay { align-items: center; } /* Center on desktop */
             .modal-sheet { border-radius: 24px; transform: translateY(20px) scale(0.95); opacity: 0; }
        }
        .modal-overlay.active .modal-sheet { transform: translateY(0) scale(1); opacity: 1; }

        .modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
        .modal-title { font-size: 1.4rem; font-weight: 800; color: #111; }
        .close-btn { background: #f3f4f6; border: none; width: 32px; height: 32px; border-radius: 50%; cursor: pointer; color: #666; font-size: 1rem; display: flex; align-items: center; justify-content: center; }
        
        .form-group { margin-bottom: 16px; }
        .form-label { display: block; font-size: 0.85rem; font-weight: 700; margin-bottom: 6px; color: #444; }
        .form-input {
            width: 100%; padding: 14px; border-radius: 12px;
            border: 1px solid #e5e7eb; font-size: 1rem; font-family: inherit;
            background: #f9fafb; outline: none; transition: all 0.2s;
        }
        .form-input:focus { background: white; border-color: var(--btn-color); box-shadow: 0 0 0 3px rgba(0,0,0,0.05); }

        .submit-btn {
            width: 100%; padding: 16px; border-radius: 14px;
            background: #111; color: white; font-weight: 700; font-size: 1.05rem;
            border: none; cursor: pointer; margin-top: 8px;
            display: flex; justify-content: center; align-items: center; gap: 8px;
            transition: transform 0.1s;
        }
        .submit-btn:active { transform: scale(0.98); }

        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    </style>
</head>
<body>
    
    <div class="container">
        <header class="header">
            <div class="logo-container"><img src="${data.logo}" class="profile-img" alt="Logo"></div>
            <h1 class="brand-name">${data.name}</h1>
            <p class="bio">${data.bio}</p>
            
            <!-- Static Connect Button -->
            <button class="contact-btn-static" onclick="openModal()">
                <i class="fa-solid fa-user-plus"></i> Connect
            </button>
            
            <!-- Media Embed -->
            ${getMediaEmbed(data.mediaUrl)}

        </header>
        <main class="links">
            ${linksHtml}
        </main>
        <footer class="footer">
            <p>&copy; 2026 ${data.name}</p>
            <span>Designed to make tails wag.</span>
        </footer>
    </div>

    <!-- Lead Gen Modal -->
    <div class="modal-overlay" id="modalOverlay" onclick="closeModal(event)">
        <div class="modal-sheet">
            <div class="modal-header">
                <div>
                    <h2 class="modal-title">Let's Connect! 🤝</h2>
                    <p style="color: #666; font-size: 0.9rem; margin-top: 4px;">Exchange info so we can stay in touch.</p>
                </div>
                <button class="close-btn" onclick="document.getElementById('modalOverlay').classList.remove('active')">
                    <i class="fa-solid fa-times"></i>
                </button>
            </div>
            
            <form action="https://formsubmit.co/ajax/${data.notificationEmail}" method="POST" onsubmit="handleFormSubmit(event)">
                <input type="hidden" name="_subject" value="New Lead from ${data.name} Link Tree!">
                <input type="hidden" name="_captcha" value="false">
                
                <div class="form-group">
                    <label class="form-label">Your Name</label>
                    <input type="text" name="name" class="form-input" placeholder="Jane Doe" required>
                </div>
                <div class="form-group">
                    <label class="form-label">Your Email</label>
                    <input type="email" name="email" class="form-input" placeholder="jane@example.com" required>
                </div>
                
                <button type="submit" class="submit-btn" id="submitBtn">
                    Send & Save My Contact <i class="fa-solid fa-download"></i>
                </button>
                <p style="text-align: center; font-size: 0.75rem; color: #888; margin-top: 12px;">
                    <i class="fa-solid fa-lock"></i> Your info is sent securely.
                </p>
            </form>
        </div>
    </div>

    <script>
        function openModal() {
            document.getElementById('modalOverlay').classList.add('active');
        }
        
        function closeModal(e) {
            if (e.target === document.getElementById('modalOverlay')) {
                document.getElementById('modalOverlay').classList.remove('active');
            }
        }

        function generateVCard() {
            // vCard 3.0 Generation
            const vcard = \`BEGIN:VCARD
VERSION:3.0
N:${data.contactName};;;
FN:${data.contactName}
ORG:${data.name}
TITLE:${data.contactTitle}
TEL;TYPE=CELL:${data.contactPhone}
EMAIL;TYPE=WORK,INTERNET:${data.contactEmail}
URL:${data.contactWebsite}
END:VCARD\`;

            const blob = new Blob([vcard], { type: 'text/vcard' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = '${data.contactName.replace(/ /g, '_')}.vcf';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        }

        function handleFormSubmit(e) {
            e.preventDefault();
            const btn = document.getElementById('submitBtn');
            const originalHTML = btn.innerHTML;
            
            btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Sending...';
            btn.disabled = true;

            const formData = new FormData(e.target);
            const data = Object.fromEntries(formData.entries());

            fetch(e.target.action, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(data)
            })
            .then(response => response.json())
            .then(data => {
                btn.innerHTML = 'Saved! <i class="fa-solid fa-check"></i>';
                btn.style.background = '#10b981'; // Green success
                
                // Trigger vCard Download
                generateVCard();

                setTimeout(() => {
                    document.getElementById('modalOverlay').classList.remove('active');
                    btn.innerHTML = originalHTML;
                    btn.style.background = '#111';
                    btn.disabled = false;
                    e.target.reset();
                }, 2500);
            })
            .catch(error => {
                console.error('Error:', error);
                alert('There was an error sending the data, but we will download the card anyway!');
                generateVCard();
                btn.innerHTML = originalHTML;
                btn.disabled = false;
            });
        }
    <\/script>
</body>

</html>`;
}

function updatePreview() {
    const frame = document.getElementById('previewFrame');
    const html = getTemplate();
    frame.srcdoc = html;
}

function downloadSite() {
    const html = getTemplate();
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'index.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    // Toast Notification
    showToast('Site Downloaded!', 'fa-check-circle');
}

// --- TOAST NOTIFICATION SYSTEM ---
function showToast(message, icon = 'fa-check-circle') {
    const toast = document.getElementById('toast');
    const iconElement = toast.querySelector('i');
    const messageElement = toast.querySelector('span');
    
    // Update icon class
    iconElement.className = `fa-solid ${icon}`;
    messageElement.textContent = message;
    
    // Show toast
    toast.classList.add('show');
    
    // Hide after 3 seconds
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// --- SMART SCALE PREVIEW ENGINE ---
function applySmartScale() {
    if (window.innerWidth > 768) return; // Only on mobile
    
    const previewWrapper = document.querySelector('.preview-wrapper');
    if (!previewWrapper) return;
    
    const screenWidth = window.innerWidth;
    const phoneWidth = 380; // Phone mockup width
    const phoneHeight = 780; // Phone mockup height
    const padding = 40; // Total horizontal padding
    
    // Calculate available space
    const availableWidth = screenWidth - padding;
    const availableHeight = window.innerHeight - 100; // Account for nav bar
    
    // Calculate scale needed for width
    const scaleX = availableWidth / phoneWidth;
    // Calculate scale needed for height
    const scaleY = availableHeight / phoneHeight;
    
    // Use the smaller scale to ensure it fits both dimensions
    let scale = Math.min(scaleX, scaleY, 1); // Don't scale up, only down
    
    // For very small screens (< 400px), apply minimum scale
    if (screenWidth < 400) {
        scale = Math.min(scale, 0.85);
    }
    
    previewWrapper.style.transform = `scale(${scale})`;
}

// Apply scale on load and resize
window.addEventListener('load', applySmartScale);
window.addEventListener('resize', applySmartScale);

// Start
init();

// Initial Mobile Check - View Switcher: Default to Editor Mode
function initializeMobileTabs() {
    if (window.innerWidth <= 768) {
        const editor = document.querySelector('.editor');
        const preview = document.querySelector('.preview');
        const btnPreview = document.getElementById('btn-preview');
        const btnEditor = document.getElementById('btn-editor');
        
        // Only run if editor exists (not in profile-only mode)
        if (editor && preview && btnPreview && btnEditor) {
            // Default to Editor Mode (show editor, hide preview)
            editor.classList.remove('mobile-hidden');
            preview.classList.add('mobile-hidden');
            btnEditor.classList.add('active');
            btnPreview.classList.remove('active');
        }
        
        // Add click event listeners as backup (in addition to onclick)
        if (btnEditor) {
            btnEditor.addEventListener('click', function(e) {
                e.preventDefault();
                switchTab('editor');
            });
        }
        
        if (btnPreview) {
            btnPreview.addEventListener('click', function(e) {
                e.preventDefault();
                switchTab('preview');
            });
        }
        
        // Apply smart scale on initial load
        setTimeout(applySmartScale, 100);
    }
}

// Run on page load
initializeMobileTabs();

// Also run on window resize to handle orientation changes
window.addEventListener('resize', function() {
    initializeMobileTabs();
});
