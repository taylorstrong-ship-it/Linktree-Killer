// PostGenerator 2.0: Carousel Module
// Handles multi-slide carousel creation

import { createSupabaseClient } from '/packages/config/supabase-client.js'

const supabase = createSupabaseClient()

// Carousel state
const carouselState = {
    slides: [{ headline: '', body: '', cta: '' }],
    currentSlide: 0
}

export function initCarouselEditor() {
    // Wire up slide navigation
    document.getElementById('add-slide-btn').addEventListener('click', addSlide)
    document.getElementById('prev-slide-btn').addEventListener('click', () => navigateSlide(-1))
    document.getElementById('next-slide-btn').addEventListener('click', () => navigateSlide(1))

    // Auto-save current slide on input change
    const inputs = ['carousel-headline', 'carousel-body', 'carousel-cta']
    inputs.forEach(id => {
        document.getElementById(id).addEventListener('input', saveCurrentSlide)
    })

    updateSlideCounter()
    updateNavigationButtons()
}

function addSlide() {
    if (carouselState.slides.length >= 7) {
        showToast('Maximum 7 slides allowed', 'error')
        return
    }

    saveCurrentSlide()
    carouselState.slides.push({ headline: '', body: '', cta: '' })
    carouselState.currentSlide = carouselState.slides.length - 1

    loadSlide(carouselState.currentSlide)
    updateSlideCounter()
    updateNavigationButtons()

    showToast(`Slide ${carouselState.currentSlide + 1} added`, 'success')
}

function navigateSlide(direction) {
    saveCurrentSlide()

    const newIndex = carouselState.currentSlide + direction

    if (newIndex < 0 || newIndex >= carouselState.slides.length) {
        return
    }

    carouselState.currentSlide = newIndex
    loadSlide(newIndex)
    updateNavigationButtons()
}

function saveCurrentSlide() {
    const current = carouselState.slides[carouselState.currentSlide]
    current.headline = document.getElementById('carousel-headline').value
    current.body = document.getElementById('carousel-body').value
    current.cta = document.getElementById('carousel-cta').value
}

function loadSlide(index) {
    const slide = carouselState.slides[index]
    document.getElementById('carousel-headline').value = slide.headline
    document.getElementById('carousel-body').value = slide.body
    document.getElementById('carousel-cta').value = slide.cta

    // Update counter
    document.getElementById('current-slide').textContent = index + 1
}

function updateSlideCounter() {
    document.getElementById('total-slides').textContent = carouselState.slides.length
    document.getElementById('current-slide').textContent = carouselState.currentSlide + 1
}

function updateNavigationButtons() {
    document.getElementById('prev-slide-btn').disabled = carouselState.currentSlide === 0
    document.getElementById('next-slide-btn').disabled =
        carouselState.currentSlide === carouselState.slides.length - 1
}

export async function generateCarousel(brandKit, template) {
    try {
        saveCurrentSlide()

        // Validate at least 2 slides
        if (carouselState.slides.length < 2) {
            throw new Error('Please add at least 2 slides')
        }

        // Validate slides have content
        const hasContent = carouselState.slides.every(s => s.headline || s.body)
        if (!hasContent) {
            throw new Error('Each slide must have a headline or body text')
        }

        console.log(`Generating ${carouselState.slides.length}-slide carousel...`)

        const { data, error } = await supabase.functions.invoke('generate-carousel', {
            body: {
                brandKit,
                template,
                slides: carouselState.slides
            }
        })

        if (error) throw error

        return data.imageUrls
    } catch (error) {
        console.error('Carousel generation error:', error)
        throw error
    }
}

export function displayCarousel(imageUrls) {
    const gallery = document.getElementById('carousel-gallery')
    gallery.innerHTML = ''

    imageUrls.forEach((url, index) => {
        const div = document.createElement('div')
        div.className = 'relative group'
        div.innerHTML = `
      <img src="${url}" alt="Slide ${index + 1}" class="w-full rounded-lg shadow-md" />
      <div class="absolute top-2 left-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
        ${index + 1}/${imageUrls.length}
      </div>
    `
        gallery.appendChild(div)
    })

    // Show carousel preview section
    document.getElementById('single-preview').classList.add('hidden')
    document.getElementById('carousel-preview').classList.remove('hidden')
}

export async function downloadAsZip(imageUrls) {
    try {
        // Dynamically import JSZip
        const JSZip = (await import('https://cdn.jsdelivr.net/npm/jszip@3.10.1/+esm')).default

        const zip = new JSZip()

        // Download each image and add to ZIP
        for (let i = 0; i < imageUrls.length; i++) {
            const response = await fetch(imageUrls[i])
            const blob = await response.blob()
            zip.file(`slide-${i + 1}.png`, blob)
        }

        // Generate ZIP
        const zipBlob = await zip.generateAsync({ type: 'blob' })

        // Trigger download
        const link = document.createElement('a')
        link.href = URL.createObjectURL(zipBlob)
        link.download = `carousel-${Date.now()}.zip`
        link.click()

        showToast('Carousel downloaded!', 'success')
    } catch (error) {
        console.error('ZIP download error:', error)
        throw new Error('Failed to create ZIP file')
    }
}

export function resetCarousel() {
    carouselState.slides = [{ headline: '', body: '', cta: '' }]
    carouselState.currentSlide = 0
    loadSlide(0)
    updateSlideCounter()
    updateNavigationButtons()
}

export function getCarouselState() {
    saveCurrentSlide()
    return { ...carouselState }
}

function showToast(message, type = 'info') {
    const toast = document.createElement('div')
    toast.className = `fixed bottom-4 right-4 px-6 py-3 rounded-lg text-white ${type === 'success' ? 'bg-green-500' :
        type === 'error' ? 'bg-red-500' : 'bg-blue-500'
        } shadow-lg z-50`
    toast.textContent = message

    document.body.appendChild(toast)

    setTimeout(() => {
        toast.remove()
    }, 3000)
}
