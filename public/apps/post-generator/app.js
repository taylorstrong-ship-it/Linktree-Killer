// PostGenerator 2.0: Main Application Orchestrator (Dark Theme)

import { createSupabaseClient } from '/packages/config/supabase-client.js'
import { getBrandProfile, extractAndSaveBrandDNA, updateBrandProfile } from '/packages/config/brand-dna.js'
import * as StyleAnalysis from '/apps/post-generator/modules/style-analysis.js'
import * as Carousel from '/apps/post-generator/modules/carousel.js'

const supabase = createSupabaseClient()

// App state
let currentUser = null
let currentBrandProfile = null
let selectedTemplate = 'portrait'
let isCarouselMode = false
let generatedImageUrls = []

// Initialize app
async function init() {
    // Check authentication
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        window.location.href = '/login?redirect=/apps/post-generator'
        return
    }

    currentUser = user
    console.log('✓ User authenticated:', user.email)

    // Load brand profile
    await loadBrandProfile()

    // Setup event listeners
    setupEventListeners()

    // Initialize modules
    StyleAnalysis.setupFileUpload()
    Carousel.initCarouselEditor()

    console.log('✓ PostGenerator 2.0 initialized')
}

// Load brand profile
async function loadBrandProfile() {
    try {
        const profile = await getBrandProfile(currentUser.id)

        if (profile) {
            // Brand profile exists - pre-fill and hide import sections
            currentBrandProfile = profile
            console.log('✓ Brand profile loaded:', profile.company_name)

            // Pre-fill brand kit form
            if (profile.company_name) {
                document.getElementById('brand-name').value = profile.company_name
            }
            if (profile.primary_color) {
                document.getElementById('primary-color').value = profile.primary_color
            }
            if (profile.secondary_color) {
                document.getElementById('secondary-color').value = profile.secondary_color
            }
            if (profile.logo_url) {
                displayLogo(profile.logo_url)
            }

            // Hide import sections and show loaded message
            document.getElementById('brand-dna-section').classList.add('hidden')
            document.getElementById('style-analysis-section').classList.add('hidden')
            document.getElementById('brand-loaded-message').classList.remove('hidden')
        } else {
            // No brand profile - show import sections
            console.log('ℹ No brand profile found')
            document.getElementById('brand-dna-section').classList.remove('hidden')
            document.getElementById('style-analysis-section').classList.remove('hidden')
            document.getElementById('brand-loaded-message').classList.add('hidden')
        }
    } catch (error) {
        console.error('Error loading brand profile:', error)
        showToast('Failed to load brand profile', 'error')
    }
}

function setupEventListeners() {
    // Brand DNA Import
    document.getElementById('import-btn').addEventListener('click', handleBrandDNAImport)

    // Style Analysis
    document.getElementById('analyze-style-btn').addEventListener('click', handleStyleAnalysis)
    document.getElementById('upload-examples-btn').addEventListener('click', () => {
        document.getElementById('example-posts').click()
    })

    // Brand Kit
    document.getElementById('upload-logo-btn').addEventListener('click', () => {
        document.getElementById('brand-logo').click()
    })
    document.getElementById('brand-logo').addEventListener('change', handleLogoUpload)
    document.getElementById('save-brand-btn').addEventListener('click', handleSaveBrand)

    // Post Type Toggle
    document.getElementById('single-post-toggle').addEventListener('click', () => switchMode(false))
    document.getElementById('carousel-toggle').addEventListener('click', () => switchMode(true))

    // Template Selection
    document.querySelectorAll('.template-card').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const template = e.currentTarget.dataset.template
            selectTemplate(template)
        })
    })

    // Character counters
    setupCharacterCounters()

    // Generate buttons
    document.getElementById('generate-single-btn').addEventListener('click', handleGenerateSingle)
    document.getElementById('generate-carousel-btn').addEventListener('click', handleGenerateCarousel)

    // Download button
    document.getElementById('download-btn').addEventListener('click', handleDownload)
}

// Brand DNA Import
async function handleBrandDNAImport() {
    const urlInput = document.getElementById('website-url')
    const url = urlInput.value.trim()

    if (!url) {
        showToast('Please enter a website URL', 'error')
        return
    }

    showLoading('Extracting brand DNA...')

    try {
        const profile = await extractAndSaveBrandDNA(url, 'post_generator')
        currentBrandProfile = profile
        hideLoading()
        showToast('Brand DNA extracted successfully!', 'success')

        // Pre-fill form
        if (profile.company_name) {
            document.getElementById('brand-name').value = profile.company_name
        }
        if (profile.primary_color) {
            document.getElementById('primary-color').value = profile.primary_color
        }
        if (profile.secondary_color) {
            document.getElementById('secondary-color').value = profile.secondary_color
        }
        if (profile.logo_url) {
            displayLogo(profile.logo_url)
        }

        // Hide import sections and show loaded message
        document.getElementById('brand-dna-section').classList.add('hidden')
        document.getElementById('style-analysis-section').classList.add('hidden')
        document.getElementById('brand-loaded-message').classList.remove('hidden')
    } catch (error) {
        hideLoading()
        showToast('Could not import brand DNA. Please try manual setup.', 'error')
        console.error(error)
    }
}

// Style Analysis
async function handleStyleAnalysis() {
    showLoading('Analyzing your style...')

    try {
        const styleProfile = await StyleAnalysis.analyzeStyle()
        StyleAnalysis.displayStyleProfile(styleProfile)
        hideLoading()
        showToast('Style profile created!', 'success')

        // Wire up save button
        document.getElementById('save-style-profile-btn')?.addEventListener('click', async () => {
            if (!currentBrandProfile) {
                showToast('Please save your brand kit first', 'error')
                return
            }

            try {
                await StyleAnalysis.saveStyleProfile(currentBrandProfile.id, styleProfile)
                showToast('Style profile saved!', 'success')
            } catch (error) {
                showToast('Failed to save style profile', 'error')
            }
        })
    } catch (error) {
        hideLoading()
        showToast(error.message, 'error')
    }
}

// Logo Upload
function handleLogoUpload(e) {
    const file = e.target.files[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
        displayLogo(e.target.result)
    }
    reader.readAsDataURL(file)
}

function displayLogo(url) {
    const preview = document.getElementById('logo-preview')
    preview.innerHTML = `
    <div class="mt-2 p-3 bg-dark-bg border border-dark-border rounded-lg">
      <img src="${url}" alt="Logo preview" class="max-h-20 mx-auto" />
    </div>
  `
}

// Save Brand
async function handleSaveBrand() {
    const name = document.getElementById('brand-name').value.trim()
    const primaryColor = document.getElementById('primary-color').value
    const secondaryColor = document.getElementById('secondary-color').value

    if (!name) {
        showToast('Please enter a brand name', 'error')
        return
    }

    showLoading('Saving brand kit...')

    try {
        // TODO: Handle logo upload to Supabase Storage
        const logoUrl = null

        if (currentBrandProfile) {
            // Update existing profile
            currentBrandProfile = await updateBrandProfile(currentBrandProfile.id, {
                company_name: name,
                logo_url: logoUrl,
                primary_color: primaryColor,
                secondary_color: secondaryColor
            })
        } else {
            // Create new profile
            const { getBrandProfile: get, extractAndSaveBrandDNA: extract, updateBrandProfile: update, createBrandProfile } = await import('/packages/config/brand-dna.js')
            currentBrandProfile = await createBrandProfile(currentUser.id, {
                company_name: name,
                logo_url: logoUrl,
                primary_color: primaryColor,
                secondary_color: secondaryColor,
                source_app: 'post_generator'
            })

            // Hide import sections and show loaded message
            document.getElementById('brand-dna-section').classList.add('hidden')
            document.getElementById('style-analysis-section').classList.add('hidden')
            document.getElementById('brand-loaded-message').classList.remove('hidden')
        }

        hideLoading()
        showToast('Brand kit saved!', 'success')
    } catch (error) {
        hideLoading()
        showToast('Failed to save brand kit', 'error')
        console.error(error)
    }
}

// Mode Switching
function switchMode(carousel) {
    isCarouselMode = carousel

    const singleToggle = document.getElementById('single-post-toggle')
    const carouselToggle = document.getElementById('carousel-toggle')
    const singleSection = document.getElementById('single-post-section')
    const carouselSection = document.getElementById('carousel-section')

    if (carousel) {
        singleToggle.classList.remove('active')
        carouselToggle.classList.add('active')
        singleSection.classList.add('hidden')
        carouselSection.classList.remove('hidden')
    } else {
        singleToggle.classList.add('active')
        carouselToggle.classList.remove('active')
        singleSection.classList.remove('hidden')
        carouselSection.classList.add('hidden')
    }
}

// Template Selection
function selectTemplate(template) {
    selectedTemplate = template

    document.querySelectorAll('.template-card').forEach(btn => {
        btn.classList.remove('active')
    })

    const selectedBtn = document.querySelector(`[data-template="${template}"]`)
    selectedBtn.classList.add('active')
}

// Character Counters
function setupCharacterCounters() {
    const counters = [
        { input: 'headline', counter: 'headline-count' },
        { input: 'body', counter: 'body-count' },
        { input: 'cta', counter: 'cta-count' }
    ]

    counters.forEach(({ input, counter }) => {
        const el = document.getElementById(input)
        if (el) {
            el.addEventListener('input', () => {
                const counterEl = document.getElementById(counter)
                if (counterEl) {
                    counterEl.textContent = el.value.length
                }
            })
        }
    })
}

// Generate Single Post
async function handleGenerateSingle() {
    if (!currentBrandProfile) {
        showToast('Please save your brand kit first', 'error')
        return
    }

    const headline = document.getElementById('headline').value.trim()
    const body = document.getElementById('body').value.trim()
    const cta = document.getElementById('cta').value.trim()

    if (!headline && !body) {
        showToast('Please enter a headline or body text', 'error')
        return
    }

    showLoading('Generating post...')

    try {
        const { data, error } = await supabase.functions.invoke('generate-post', {
            body: {
                brandProfile: currentBrandProfile,
                template: selectedTemplate,
                textContent: { headline, body, cta }
            }
        })

        if (error) throw error

        generatedImageUrls = [data.imageUrl]
        displaySinglePost(data.imageUrl)
        hideLoading()
        showToast('Post generated!', 'success')
    } catch (error) {
        hideLoading()
        showToast('Failed to generate post', 'error')
        console.error(error)
    }
}

// Generate Carousel
async function handleGenerateCarousel() {
    if (!currentBrandProfile) {
        showToast('Please save your brand kit first', 'error')
        return
    }

    showLoading('Generating carousel...')

    try {
        const imageUrls = await Carousel.generateCarousel(currentBrandProfile, selectedTemplate)
        generatedImageUrls = imageUrls
        Carousel.displayCarousel(imageUrls)
        hideLoading()
        showToast('Carousel generated!', 'success')

        // Show download button
        document.getElementById('download-btn').classList.remove('hidden')
    } catch (error) {
        hideLoading()
        showToast(error.message, 'error')
    }
}

// Display Single Post
function displaySinglePost(imageUrl) {
    const preview = document.getElementById('single-preview')
    preview.innerHTML = `
    <img src="${imageUrl}" alt="Generated post" class="w-full rounded-lg shadow-lg" />
  `

    document.getElementById('download-btn').classList.remove('hidden')
}

// Download
async function handleDownload() {
    if (isCarouselMode) {
        showLoading('Creating ZIP file...')
        try {
            await Carousel.downloadAsZip(generatedImageUrls)
            hideLoading()
        } catch (error) {
            hideLoading()
            showToast('Failed to download carousel', 'error')
        }
    } else {
        // Download single image
        const link = document.createElement('a')
        link.href = generatedImageUrls[0]
        link.download = `post-${Date.now()}.png`
        link.click()
        showToast('Post downloaded!', 'success')
    }
}

// UI Helpers
function showLoading(text = 'Loading...') {
    document.getElementById('loading-text').textContent = text
    document.getElementById('loading-overlay').classList.remove('hidden')
}

function hideLoading() {
    document.getElementById('loading-overlay').classList.add('hidden')
}

function showToast(message, type = 'info') {
    const toast = document.createElement('div')
    toast.className = `toast ${type} animate-slide-in`
    toast.textContent = message

    document.body.appendChild(toast)

    setTimeout(() => {
        toast.classList.add('animate-fade-out')
        setTimeout(() => toast.remove(), 300)
    }, 3000)
}

// Initialize on load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init)
} else {
    init()
}
