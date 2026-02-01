// PostGenerator 2.0: Brand DNA Extraction Module
// Extracts brand colors, logo, fonts from website URL

import { createSupabaseClient } from '../../../../packages/config/supabase-client.js'

const supabase = createSupabaseClient()

export async function extractBrandDNA(url) {
    try {
        // Validate and normalize URL
        let cleanUrl = url.trim()
        if (!cleanUrl.match(/^https?:\/\//)) {
            cleanUrl = cleanUrl.replace(/^\/\//, '')
        }

        console.log('Extracting brand DNA for:', cleanUrl)

        const { data, error } = await supabase.functions.invoke('extract-brand-dna', {
            body: { url: cleanUrl }
        })

        if (error) throw error

        return data.brandDNA
    } catch (error) {
        console.error('Brand DNA extraction error:', error)
        throw new Error('Failed to extract brand DNA. Please try manual setup.')
    }
}

export function displayBrandDNA(brandDNA) {
    const previewEl = document.getElementById('brand-dna-preview')
    previewEl.classList.remove('hidden')

    previewEl.innerHTML = `
    <div class="bg-green-50 border border-green-200 rounded-lg p-4">
      <div class="flex items-center mb-2">
        <svg class="w-5 h-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
        </svg>
        <h4 class="font-semibold text-green-900">Brand DNA Extracted!</h4>
      </div>
      <ul class="space-y-1 text-sm text-green-800">
        <li>• ${brandDNA.company_name || 'Company name'}</li>
        <li>• Logo: ${brandDNA.logo_url ? '✓ Found' : '✗ Not found'}</li>
        <li>• Colors: ${brandDNA.primary_color}, ${brandDNA.secondary_color}</li>
        ${brandDNA.fonts?.length ? `<li>• Fonts: ${brandDNA.fonts.join(', ')}</li>` : ''}
      </ul>
      <button id="apply-dna-btn" class="mt-3 w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm font-medium">
        Apply to Brand Kit
      </button>
    </div>
  `

    // Wire up apply button
    document.getElementById('apply-dna-btn').addEventListener('click', () => {
        applyBrandDNA(brandDNA)
    })
}

export function applyBrandDNA(brandDNA) {
    // Pre-fill brand kit form
    document.getElementById('brand-name').value = brandDNA.company_name || ''
    document.getElementById('primary-color').value = brandDNA.primary_color
    document.getElementById('secondary-color').value = brandDNA.secondary_color

    if (brandDNA.logo_url) {
        const logoPreview = document.getElementById('logo-preview')
        logoPreview.innerHTML = `
      <div class="mt-2 p-3 bg-gray-50 rounded-lg">
        <img src="${brandDNA.logo_url}" alt="Logo" class="max-h-20 mx-auto" />
        <p class="text-xs text-gray-600 text-center mt-2">Logo imported (upload to save)</p>
      </div>
    `
    }

    // Show success message
    showToast('Brand DNA applied! Review and save your brand kit.', 'success')
}

function showToast(message, type = 'info') {
    const toast = document.createElement('div')
    toast.className = `fixed bottom-4 right-4 px-6 py-3 rounded-lg text-white ${type === 'success' ? 'bg-green-500' :
            type === 'error' ? 'bg-red-500' : 'bg-blue-500'
        } shadow-lg z-50 animate-fade-in`
    toast.textContent = message

    document.body.appendChild(toast)

    setTimeout(() => {
        toast.remove()
    }, 3000)
}
