// PostGenerator 3.0 - AI Visual Generation
// Powered by Gemini 3 + Brand DNA

// Global state
let currentBrandDNA = null;
let uploadedImageBase64 = null;
let currentLightboxUrl = null;

// Initialize on load
async function loadBrandDNA() {
    try {
        const localData = localStorage.getItem('taylored_brand_data');

        if (localData) {
            currentBrandDNA = JSON.parse(localData);
            console.log('✓ Brand DNA loaded:', currentBrandDNA.company_name || 'Guest');

            // 🧬 HYDRATE THE UI - Show Brand Context Card
            const card = document.getElementById('brand-dna-card');
            const logo = document.getElementById('brand-logo');
            const name = document.getElementById('brand-name');
            const industry = document.getElementById('brand-industry');
            const personalityContainer = document.getElementById('brand-personality');
            const dnaMeterFill = document.getElementById('dna-meter-fill');
            const dnaScore = document.getElementById('dna-score');
            const swatchPrimary = document.getElementById('swatch-primary');
            const swatchSecondary = document.getElementById('swatch-secondary');

            if (card && logo && name) {
                // Show card with Ferrari Glass reveal animation
                card.classList.remove('hidden');
                logo.src = currentBrandDNA.logo_url || currentBrandDNA.og_image || currentBrandDNA.hero_image ||
                    'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="96" height="96"%3E%3Crect fill="%23FF6B35" width="96" height="96"/%3E%3C/svg%3E';
                // 🏢 Brand Name (safeString to prevent crashes)
                name.textContent = safeString(currentBrandDNA.company_name, 'Your Brand');

                // 🏭 Industry Tag (optional)
                if (industry && currentBrandDNA.industry) {
                    industry.textContent = safeString(currentBrandDNA.industry);
                    industry.style.display = 'block';
                } else if (industry) {
                    industry.style.display = 'none';
                }

                // 🎨 Dynamic CSS Variable Injection (Ferrari Theming)
                if (currentBrandDNA.primary_color && currentBrandDNA.secondary_color) {
                    const root = document.documentElement;
                    const primary = safeColor(currentBrandDNA.primary_color);
                    const secondary = safeColor(currentBrandDNA.secondary_color);

                    root.style.setProperty('--dna-primary', primary);
                    root.style.setProperty('--dna-secondary', secondary);

                    const primaryRgb = hexToRgb(primary);
                    const secondaryRgb = hexToRgb(secondary);
                    root.style.setProperty('--dna-primary-rgb', `${primaryRgb.r}, ${primaryRgb.g}, ${primaryRgb.b}`);
                    root.style.setProperty('--dna-secondary-rgb', `${secondaryRgb.r}, ${secondaryRgb.g}, ${secondaryRgb.b}`);

                    // 🎨 Apply colors to swatches
                    if (swatchPrimary) swatchPrimary.style.background = primary;
                    if (swatchSecondary) swatchSecondary.style.background = secondary;
                }

                // 🏅 Personality Badges (Max 3 - Ferrari Design)
                if (personalityContainer && currentBrandDNA.brand_personality) {
                    const personalities = safeArray(currentBrandDNA.brand_personality);

                    personalityContainer.innerHTML = personalities.slice(0, 3).map(trait => `
                        <span>${safeString(trait)}</span>
                    `).join('');
                }

                // 📊 DNA Confidence Meter (calculate based on data completeness)
                if (dnaMeterFill && dnaScore) {
                    let completeness = 0;
                    if (currentBrandDNA.company_name) completeness += 20;
                    if (currentBrandDNA.logo_url || currentBrandDNA.og_image) completeness += 25;
                    if (currentBrandDNA.primary_color) completeness += 20;
                    if (currentBrandDNA.secondary_color) completeness += 15;
                    if (currentBrandDNA.brand_personality) completeness += 20;

                    // Animate meter (delayed for cinematic reveal)
                    setTimeout(() => {
                        dnaMeterFill.style.width = `${completeness}%`;
                        dnaScore.textContent = `DNA Strength: ${completeness}%`;
                    }, 600);
                }
            }
        } else {
            console.warn('⚠ No Brand DNA in localStorage. Using defaults.');
            // Use default Taylored Orange
            document.documentElement.style.setProperty('--dna-primary', '#FF6B35');
            document.documentElement.style.setProperty('--dna-primary-rgb', '255, 107, 53');
        }

        // 🎯 URL PARAMETER LISTENER - Campaign handoff from Brand Dashboard
        checkURLParameters();
    } catch (error) {
        console.error('Error loading Brand DNA:', error);
    }
}

// Check for URL parameters and auto-fill prompt
function checkURLParameters() {
    const urlParams = new URLSearchParams(window.location.search);
    const promptParam = urlParams.get('prompt');

    if (promptParam) {
        const userPromptField = document.getElementById('user-prompt');
        if (userPromptField) {
            // Typewriter effect for ghostwriter feature
            typewriterEffect(userPromptField, promptParam, () => {
                // Auto-trigger generation after typing completes
                setTimeout(() => {
                    showToast('Campaign brief loaded! Ready to generate.', 'success');
                    // Optionally auto-start generation here
                }, 500);
            });
        }

        // Clean URL (remove parameter after reading)
        window.history.replaceState({}, document.title, window.location.pathname);
    }
}

// Typewriter effect for ghostwriter feature
function typewriterEffect(element, text, callback) {
    let index = 0;
    element.value = '';
    element.focus();

    const speed = 30; // ms per character

    function type() {
        if (index < text.length) {
            element.value += text.charAt(index);
            index++;
            setTimeout(type, speed);
        } else if (callback) {
            callback();
        }
    }

    type();
}

// Image Upload Handlers
function handleDragOver(event) {
    event.preventDefault();
    event.currentTarget.classList.add('drag-over');
}

function handleDragLeave(event) {
    event.currentTarget.classList.remove('drag-over');
}

async function handleDrop(event) {
    event.preventDefault();
    event.currentTarget.classList.remove('drag-over');

    const file = event.dataTransfer.files[0];
    if (!file || !file.type.startsWith('image/')) {
        showToast('Please upload an image file', 'error');
        return;
    }

    await processImage(file);
}

async function handleFileSelect(event) {
    const file = event.target.files[0];
    if (!file) return;

    await processImage(file);
}

async function processImage(file) {
    try {
        // Convert to Base64
        const base64 = await fileToBase64(file);
        uploadedImageBase64 = base64;

        // Show preview in dropzone
        const dropzone = document.getElementById('dropzone');
        dropzone.style.backgroundImage = `url(data:image/jpeg;base64,${base64})`;
        dropzone.style.backgroundSize = 'cover';
        dropzone.style.backgroundPosition = 'center';
        dropzone.querySelector('.upload-content').classList.add('hidden');

        showToast('Image uploaded successfully', 'success');
    } catch (error) {
        console.error('Error processing image:', error);
        showToast('Failed to process image', 'error');
    }
}

function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            // Remove data:image/jpeg;base64, prefix
            const base64 = reader.result.split(',')[1];
            resolve(base64);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

// Generate Campaign (Main Function - Pomelli-style 3-piece)
async function generateCampaign() {
    const campaignName = document.getElementById('campaign-name').value.trim();
    const userPrompt = document.getElementById('user-prompt').value.trim();

    if (!campaignName) {
        showToast('Please enter a campaign name', 'error');
        document.getElementById('campaign-name').focus();
        return;
    }

    if (!userPrompt) {
        showToast('Please tell us what you\'re promoting', 'error');
        document.getElementById('user-prompt').focus();
        return;
    }

    if (!currentBrandDNA) {
        showToast('Brand DNA not loaded. Please refresh and try again.', 'error');
        return;
    }

    // Show loading
    setLoadingStage('Planning campaign...', true);

    try {
        const { data: { session } } = await window.supabaseClient.auth.getSession();

        const response = await fetch(`${window.ENV.SUPABASE_URL}/functions/v1/generate-campaign`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${session?.access_token || window.ENV.SUPABASE_ANON_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                campaignName,
                userPrompt,
                referenceImageBase64: uploadedImageBase64,
                brandDNA: currentBrandDNA
            })
        });

        setLoadingStage('Generating visuals...', true);

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Campaign generation failed');
        }

        const data = await response.json();
        console.log('Campaign generated:', data);

        if (data.success && data.campaign) {
            renderCampaign(data.campaign);
            showToast('Campaign generated successfully!', 'success');
        } else {
            throw new Error('Invalid response from server');
        }

    } catch (error) {
        console.error('Campaign generation error:', error);
        showToast(`Failed to generate campaign: ${error.message}`, 'error');
    } finally {
        setLoadingStage('', false);
    }
}

// Render Campaign (3-Column Layout)
function renderCampaign(campaign) {
    // Populate images
    document.getElementById('story-preview').src = campaign.storyImageUrl;
    document.getElementById('feed-preview').src = campaign.feedImageUrl;
    document.getElementById('info-preview').src = campaign.infoImageUrl;

    // Populate caption
    document.getElementById('caption-text').textContent = campaign.caption;

    // Populate hashtags as badges
    const hashtagsContainer = document.getElementById('hashtags-container');
    hashtagsContainer.innerHTML = campaign.hashtags
        .map(tag => `<span class="hashtag-badge">${tag}</span>`)
        .join('');

    // Show campaign section
    document.getElementById('campaign-section').classList.remove('hidden');
    document.getElementById('campaign-section').scrollIntoView({
        behavior: 'smooth',
        block: 'start'
    });

    // Store campaign data globally for downloads
    window.currentCampaign = campaign;
}

// Lightbox Functions
function openLightbox(imageUrl) {
    currentLightboxUrl = imageUrl;
    const lightbox = document.getElementById('lightbox');
    document.getElementById('lightbox-img').src = imageUrl;
    lightbox.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}

function closeLightbox(event) {
    if (event && event.target.id !== 'lightbox') return;

    const lightbox = document.getElementById('lightbox');
    lightbox.classList.add('hidden');
    document.body.style.overflow = 'auto';
    currentLightboxUrl = null;
}

// Download Image
async function downloadImage() {
    if (!currentLightboxUrl) return;

    try {
        const response = await fetch(currentLightboxUrl);
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);

        const link = document.createElement('a');
        link.href = url;
        link.download = `taylored-post-${Date.now()}.jpg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        showToast('Downloaded successfully!', 'success');
    } catch (error) {
        console.error('Download error:', error);
        showToast('Failed to download image', 'error');
    }
}

// Schedule to Instagram (N8N Webhook)
async function scheduleToInstagram() {
    if (!currentLightboxUrl) return;

    const userPrompt = document.getElementById('user-prompt').value;

    try {
        const response = await fetch(window.ENV.N8N_WEBHOOK_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                image_url: currentLightboxUrl,
                caption: userPrompt,
                brand_name: currentBrandDNA?.company_name || 'Taylored Client',
                access_token: 'future-instagram-token' // TODO: Implement Instagram OAuth
            })
        });

        if (response.ok) {
            showToast('Scheduled to Instagram successfully!', 'success');
            closeLightbox();
        } else {
            throw new Error('Webhook failed');
        }
    } catch (error) {
        console.error('Instagram scheduling error:', error);
        showToast('Instagram scheduling unavailable. Contact support.', 'error');
    }

    // Download Individual Campaign Asset
    async function downloadAsset(type) {
        if (!window.currentCampaign) {
            showToast('No campaign loaded', 'error');
            return;
        }

        const urlMap = {
            story: window.currentCampaign.storyImageUrl,
            feed: window.currentCampaign.feedImageUrl,
            info: window.currentCampaign.infoImageUrl
        };

        const url = urlMap[type];
        if (!url) return;

        try {
            const response = await fetch(url);
            const blob = await response.blob();
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = `${type}-${Date.now()}.jpg`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(link.href);

            showToast(`${type.charAt(0).toUpperCase() + type.slice(1)} downloaded!`, 'success');
        } catch (error) {
            console.error(`Download error for ${type}:`, error);
            showToast(`Failed to download ${type}`, 'error');
        }
    }

    // Download Complete Campaign Bundle
    async function downloadBundle() {
        if (!window.currentCampaign) {
            showToast('No campaign loaded', 'error');
            return;
        }

        showToast('Downloading campaign bundle...', 'info');

        try {
            // Download all 3 assets sequentially with slight delay
            await downloadAsset('story');
            await new Promise(resolve => setTimeout(resolve, 300));
            await downloadAsset('feed');
            await new Promise(resolve => setTimeout(resolve, 300));
            await downloadAsset('info');

            showToast('Complete campaign bundle downloaded!', 'success');
        } catch (error) {
            console.error('Bundle download error:', error);
            showToast('Failed to download complete bundle', 'error');
        }
    }

}

// UI Helper Functions
function setLoadingStage(stage, isLoading) {
    const overlay = document.getElementById('loading-overlay');
    const btnText = document.getElementById('btn-text');
    const btnLoading = document.getElementById('btn-loading');
    const loadingStage = document.getElementById('loading-stage');
    const generateBtn = document.getElementById('generate-btn');

    if (isLoading) {
        overlay.classList.remove('hidden');
        btnText.classList.add('hidden');
        btnLoading.classList.remove('hidden');
        if (stage) loadingStage.textContent = stage;
        generateBtn.disabled = true;
    } else {
        overlay.classList.add('hidden');
        btnText.classList.remove('hidden');
        btnLoading.classList.add('hidden');
        generateBtn.disabled = false;
    }
}

function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');

    const toast = document.createElement('div');
    toast.className = `toast toast-${type} animate-slide-in`;

    const icons = {
        success: '✓',
        error: '✕',
        warning: '⚠',
        info: 'ℹ'
    };

    toast.innerHTML = `
    <span class="toast-icon">${icons[type] || icons.info}</span>
    <span class="toast-message">${message}</span>
  `;

    container.appendChild(toast);

    setTimeout(() => {
        toast.classList.add('animate-slide-out');
        setTimeout(() => toast.remove(), 300);
    }, 4000);
}

function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : { r: 255, g: 107, b: 53 }; // Default to Taylored Orange
}

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    // ESC to close lightbox
    if (e.key === 'Escape' && !document.getElementById('lightbox').classList.contains('hidden')) {
        closeLightbox();
    }

    // Cmd/Ctrl + Enter to generate
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        generateVisuals();
    }
});

// 🛡️ SAFE STRING UTILITIES (Prevent "Font Bug" Crash)
// Purpose: Safely convert Brand DNA API fields to strings before rendering
// Prevents React-style "Objects are not valid as a React child" crashes

function safeString(value, fallback = '') {
    if (value === null || value === undefined) return fallback;
    if (typeof value === 'string') return value.trim();
    if (Array.isArray(value)) return value.map(item => safeString(item, '')).filter(Boolean).join(', ');
    if (typeof value === 'object') {
        console.warn('⚠️ safeString: Received object, converting to JSON:', value);
        return JSON.stringify(value);
    }
    return String(value);
}

function safeArray(value) {
    if (!value) return [];
    if (Array.isArray(value)) return value.map(item => safeString(item, '')).filter(Boolean);
    if (typeof value === 'string') return value.split(',').map(item => item.trim()).filter(Boolean);
    return [safeString(value, '')];
}

function safeColor(color, fallback = '#FF6B35') {
    if (!color || typeof color !== 'string') return fallback;
    const hex = color.startsWith('#') ? color : `#${color}`;
    const validHex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
    return validHex.test(hex) ? hex : fallback;
}

console.log('PostGenerator 3.0 loaded ✓');
