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
            currentBrandDNA = JSON parse(localData);
            console.log('✓ Brand DNA loaded:', currentBrandDNA.company_name || 'Guest');

            // Inject brand color into CSS
            if (currentBrandDNA.primary_color) {
                document.documentElement.style.setProperty('--brand-color', currentBrandDNA.primary_color);
                const rgb = hexToRgb(currentBrandDNA.primary_color);
                document.documentElement.style.setProperty('--brand-rgb', `${rgb.r}, ${rgb.g}, ${rgb.b}`);
            }
        } else {
            console.warn('⚠ No Brand DNA in localStorage. Using defaults.');
            // Use default Taylored Orange
            document.documentElement.style.setProperty('--brand-color', '#FF6B35');
            document.documentElement.style.setProperty('--brand-rgb', '255, 107, 53');
        }
    } catch (error) {
        console.error('Error loading Brand DNA:', error);
    }
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

// Generate Visuals (Main Function)
async function generateVisuals() {
    const userPrompt = document.getElementById('user-prompt').value.trim();
    const vibe = document.getElementById('vibe-selector').value;

    if (!userPrompt) {
        showToast('Please tell us what you're promoting', 'error');
    document.getElementById('user-prompt').focus();
        return;
    }

    if (!currentBrandDNA) {
        showToast('Brand DNA not loaded. Please refresh and try again.', 'error');
        return;
    }

    // Show loading
    setLoading(true);

    try {
        const { data: { session } } = await window.supabaseClient.auth.getSession();

        const response = await fetch(`${window.ENV.SUPABASE_URL}/functions/v1/generate-visuals`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${session?.access_token || window.ENV.SUPABASE_ANON_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                userPrompt,
                vibe,
                referenceImageBase64: uploadedImageBase64,
                brandDNA: currentBrandDNA
            })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Generation failed');
        }

        const data = await response.json();
        console.log('Generation response:', data);

        // For now, show the response (Edge Function returns text, not images yet)
        if (data.imageUrls && data.imageUrls.length > 0) {
            renderResults(data.imageUrls);
        } else {
            // Temporary: Show placeholder while awaiting actual image generation
            showToast('AI generation complete! Image rendering pending model upgrade.', 'info');
            console.log('Generated text:', data.generatedText);
        }

    } catch (error) {
        console.error('Generation error:', error);
        showToast(`Failed to generate: ${error.message}`, 'error');
    } finally {
        setLoading(false);
    }
}

// Render Results Grid
function renderResults(imageUrls) {
    const resultsSection = document.getElementById('results-section');
    const resultsGrid = document.getElementById('results-grid');

    resultsGrid.innerHTML = imageUrls.map((url, index) => `
    <div class="result-card glassmorphism-card" onclick="openLightbox('${url}')">
      <img src="${url}" alt="Generated variation ${index + 1}" loading="lazy" />
      <div class="result-overlay">
        <p class="text-sm font-medium">Variation ${index + 1}</p>
      </div>
    </div>
  `).join('');

    resultsSection.classList.remove('hidden');
    resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
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
}

// UI Helper Functions
function setLoading(isLoading) {
    const overlay = document.getElementById('loading-overlay');
    const btnText = document.getElementById('btn-text');
    const btnLoading = document.getElementById('btn-loading');
    const generateBtn = document.getElementById('generate-btn');

    if (isLoading) {
        overlay.classList.remove('hidden');
        btnText.classList.add('hidden');
        btnLoading.classList.remove('hidden');
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

console.log('PostGenerator 3.0 loaded ✓');
