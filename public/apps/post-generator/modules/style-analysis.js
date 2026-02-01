// PostGenerator 2.0: Style Analysis Module
// Analyzes example social media posts using AI

import { createSupabaseClient } from '../../../../packages/config/supabase-client.js'

const supabase = createSupabaseClient()
let uploadedFiles = []

export function setupFileUpload() {
  const input = document.getElementById('example-posts')
  const uploadBtn = document.getElementById('upload-examples-btn')

  uploadBtn.addEventListener('click', () => {
    input.click()
  })

  input.addEventListener('change', (e) => {
    const files = Array.from(e.target.files)

    if (files.length < 3 || files.length > 5) {
      showToast('Please upload 3-5 images', 'error')
      return
    }

    uploadedFiles = files
    displayThumbnails(files)

    // Show analyze button
    document.getElementById('analyze-style-btn').classList.remove('hidden')
  })
}

function displayThumbnails(files) {
  const container = document.getElementById('example-thumbnails')
  container.innerHTML = ''

  files.forEach((file, index) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const div = document.createElement('div')
      div.className = 'relative aspect-square rounded-lg overflow-hidden bg-gray-100'
      div.innerHTML = `
        <img src="${e.target.result}" alt="Example ${index + 1}" class="w-full h-full object-cover" />
        <div class="absolute top-1 right-1 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
          ${index + 1}
        </div>
      `
      container.appendChild(div)
    }
    reader.readAsDataURL(file)
  })
}

export async function analyzeStyle() {
  try {
    if (uploadedFiles.length < 3) {
      throw new Error('Please upload at least 3 images')
    }

    console.log(`Analyzing ${uploadedFiles.length} images...`)

    // Convert files to base64
    const images = await Promise.all(
      uploadedFiles.map(file => fileToBase64(file))
    )

    const { data, error } = await supabase.functions.invoke('analyze-style', {
      body: { images }
    })

    if (error) throw error

    return data.styleProfile
  } catch (error) {
    console.error('Style analysis error:', error)
    throw new Error('Failed to analyze style')
  }
}

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

export function displayStyleProfile(profile) {
  const preview = document.getElementById('style-profile-preview')
  preview.classList.remove('hidden')

  preview.innerHTML = `
    <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
      <div class="flex items-center mb-3">
        <svg class="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m-5.36 4.36a7 7 0 119.9-9.9 7 7 0 01-9.9 9.9z"/>
        </svg>
        <h4 class="font-semibold text-blue-900">Style Profile Created</h4>
      </div>
      
      <dl class="space-y-2 text-sm">
        <div>
          <dt class="font-medium text-blue-900">Dominant Colors:</dt>
          <dd class="flex gap-1 mt-1">
            ${profile.dominant_colors.slice(0, 5).map(color => `
              <div class="w-8 h-8 rounded border border-gray-300" style="background: ${color}" title="${color}"></div>
            `).join('')}
          </dd>
        </div>
        
        <div>
          <dt class="font-medium text-blue-900">Visual Style:</dt>
          <dd class="text-blue-800">${profile.visual_style || 'Not detected'}</dd>
        </div>
        
        <div>
          <dt class="font-medium text-blue-900">Layout Pattern:</dt>
          <dd class="text-blue-800">${profile.layout_pattern || 'Varied'}</dd>
        </div>
        
        <div>
          <dt class="font-medium text-blue-900">Brand Voice:</dt>
          <dd class="text-blue-800">${profile.brand_voice || 'Authentic'}</dd>
        </div>
        
        ${profile.text_style ? `
        <div>
          <dt class="font-medium text-blue-900">Text Style:</dt>
          <dd class="text-blue-800">
            ${profile.text_style.placement} / ${profile.text_style.weight} / ${profile.text_style.alignment}
          </dd>
        </div>
        ` : ''}
      </dl>
      
      <button id="save-style-profile-btn" class="mt-4 w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium">
        Save Style Profile
      </button>
    </div>
  `
}

export async function saveStyleProfile(brandKitId, profile) {
  try {
    // Get current user
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      throw new Error('User not authenticated')
    }

    // Save to database
    const { data, error } = await supabase
      .from('style_profiles')
      .insert({
        user_id: user.id,
        brand_kit_id: brandKitId,
        dominant_colors: profile.dominant_colors,
        text_style: profile.text_style || {},
        layout_pattern: profile.layout_pattern,
        visual_style: profile.visual_style,
        brand_voice: profile.brand_voice,
        example_images: [] // Could store URLs if we upload them
      })
      .select()
      .single()

    if (error) throw error

    // Update brand kit to link to this style profile
    if (brandKitId) {
      await supabase
        .from('brand_kits')
        .update({ style_profile_id: data.id })
        .eq('id', brandKitId)
    }

    return data
  } catch (error) {
    console.error('Save style profile error:', error)
    throw error
  }
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
