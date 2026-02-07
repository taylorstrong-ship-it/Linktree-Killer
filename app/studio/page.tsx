'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Sparkles, Upload, Download, Save, Wand2, Image as ImageIcon } from 'lucide-react'
import Image from 'next/image'

type Format = 'instagram_post' | 'instagram_story' | 'facebook_post'

export default function ContentStudioPage() {
    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const [previewUrl, setPreviewUrl] = useState<string>('')
    const [uploadedUrl, setUploadedUrl] = useState<string>('')
    const [message, setMessage] = useState('')
    const [format, setFormat] = useState<Format>('instagram_post')
    const [generating, setGenerating] = useState(false)
    const [generatedImage, setGeneratedImage] = useState<string>('')
    const [uploading, setUploading] = useState(false)

    // Handle file selection
    function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0]
        if (!file) return

        setSelectedFile(file)

        // Create preview
        const reader = new FileReader()
        reader.onload = (event) => {
            setPreviewUrl(event.target?.result as string)
        }
        reader.readAsDataURL(file)
    }

    // Upload to Supabase Storage
    async function uploadToSupabase() {
        if (!selectedFile) return null

        setUploading(true)
        try {
            const timestamp = Date.now()
            const filename = `raw_${timestamp}_${selectedFile.name}`
            const filePath = `user-uploads/${filename}`

            const { data, error } = await supabase.storage
                .from('content-studio')
                .upload(filePath, selectedFile, {
                    cacheControl: '3600',
                    upsert: false
                })

            if (error) {
                console.error('Upload error:', error)
                alert('Failed to upload image. Please try again.')
                return null
            }

            const { data: { publicUrl } } = supabase.storage
                .from('content-studio')
                .getPublicUrl(filePath)

            console.log('✅ File uploaded:', publicUrl)
            setUploadedUrl(publicUrl)
            return publicUrl

        } catch (err) {
            console.error('Upload exception:', err)
            alert('Upload failed. Please try again.')
            return null
        } finally {
            setUploading(false)
        }
    }

    // Generate with Gemini 3
    async function handleGenerate() {
        if (!selectedFile) {
            alert('Please upload a photo first')
            return
        }

        if (!message.trim()) {
            alert('Please enter your message')
            return
        }

        setGenerating(true)
        setGeneratedImage('')

        try {
            // Step 1: Upload raw file to Supabase
            console.log('📤 Uploading to Supabase...')
            let imageUrl: string | null = uploadedUrl

            if (!imageUrl) {
                imageUrl = await uploadToSupabase()
                if (!imageUrl) {
                    setGenerating(false)
                    return
                }
            }

            // Step 2: Call Edge Function
            console.log('🎨 Calling Gemini 3 Edge Function...')
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/generate-social-post`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`
                    },
                    body: JSON.stringify({
                        user_image_url: imageUrl,
                        caption_text: message,
                        brand_dna: {
                            company_name: 'Your Brand',
                            colors: {
                                primary: '#FF6B35',
                                secondary: '#1a1a1a',
                                accent: '#00FF41'
                            },
                            typography: {
                                heading: 'Bold Sans-serif',
                                body: 'Clean Sans-serif'
                            },
                            business_type: 'Restaurant'
                        },
                        format: format
                    })
                }
            )

            if (!response.ok) {
                const errorText = await response.text()
                console.error('Generation failed:', errorText)
                throw new Error('AI generation failed')
            }

            const result = await response.json()
            console.log('✅ Generated:', result)

            setGeneratedImage(result.image_url)

        } catch (err) {
            console.error('❌ Error:', err)
            alert('Generation failed. Please try again.')
        } finally {
            setGenerating(false)
        }
    }

    // Download image
    function handleDownload() {
        if (!generatedImage) return

        const link = document.createElement('a')
        link.href = generatedImage
        link.download = `generated_post_${Date.now()}.png`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    }

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white">
            {/* Header */}
            <div className="border-b border-white/10 bg-black/50 backdrop-blur-xl sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#FF6B35] to-[#00FF41] flex items-center justify-center">
                                <Wand2 className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h1 className="text-xl font-bold">Content Studio</h1>
                                <p className="text-sm text-gray-500">AI-Powered Social Media Generator</p>
                            </div>
                        </div>
                        <a
                            href="/"
                            className="text-sm text-gray-400 hover:text-white transition-colors"
                        >
                            ← Back to Home
                        </a>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Left: Input Section */}
                    <div className="space-y-6">
                        {/* File Uploader */}
                        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
                                    <Upload className="w-5 h-5 text-[#FF6B35]" />
                                </div>
                                <div>
                                    <h3 className="text-white font-semibold">Upload Raw Photo</h3>
                                    <p className="text-gray-500 text-sm">Your product or scene</p>
                                </div>
                            </div>

                            <label className="block cursor-pointer">
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileSelect}
                                    className="hidden"
                                />
                                <div className="border-2 border-dashed border-white/20 rounded-xl p-8 text-center hover:border-[#FF6B35] transition-colors">
                                    {previewUrl ? (
                                        <div className="relative w-full aspect-square rounded-lg overflow-hidden">
                                            <Image
                                                src={previewUrl}
                                                alt="Preview"
                                                fill
                                                className="object-cover"
                                            />
                                        </div>
                                    ) : (
                                        <>
                                            <ImageIcon className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                                            <p className="text-gray-400 mb-1">Click to upload</p>
                                            <p className="text-gray-600 text-sm">PNG, JPG up to 10MB</p>
                                        </>
                                    )}
                                </div>
                            </label>

                            {selectedFile && (
                                <p className="text-sm text-gray-500 mt-3">
                                    ✅ {selectedFile.name} ({(selectedFile.size / 1024).toFixed(0)} KB)
                                </p>
                            )}
                        </div>

                        {/* Message Input */}
                        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
                                    <Sparkles className="w-5 h-5 text-[#00FF41]" />
                                </div>
                                <div>
                                    <h3 className="text-white font-semibold">What's the message?</h3>
                                    <p className="text-gray-500 text-sm">Your promotion or caption</p>
                                </div>
                            </div>

                            <textarea
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                placeholder="e.g., 50% off Pasta Tonight!"
                                className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-gray-600 focus:border-[#FF6B35] focus:outline-none resize-none"
                                rows={3}
                            />
                        </div>

                        {/* Format Selector */}
                        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6">
                            <h3 className="text-white font-semibold mb-4">Format</h3>
                            <div className="grid grid-cols-3 gap-3">
                                {[
                                    { value: 'instagram_post', label: 'IG Post', ratio: '1:1' },
                                    { value: 'instagram_story', label: 'IG Story', ratio: '9:16' },
                                    { value: 'facebook_post', label: 'FB Post', ratio: '1.91:1' }
                                ].map((item) => (
                                    <button
                                        key={item.value}
                                        onClick={() => setFormat(item.value as Format)}
                                        className={`p-3 rounded-xl border transition-all ${format === item.value
                                            ? 'border-[#FF6B35] bg-[#FF6B35]/10'
                                            : 'border-white/10 bg-black/30 hover:border-white/30'
                                            }`}
                                    >
                                        <p className="text-white font-medium text-sm">{item.label}</p>
                                        <p className="text-gray-500 text-xs mt-1">{item.ratio}</p>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Magic Button */}
                        <button
                            onClick={handleGenerate}
                            disabled={!selectedFile || !message.trim() || generating || uploading}
                            className="w-full bg-gradient-to-r from-[#FF6B35] to-[#00FF41] hover:opacity-90 disabled:opacity-30 disabled:cursor-not-allowed text-white py-4 rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
                        >
                            {uploading ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    Uploading...
                                </>
                            ) : generating ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    AI is designing & typesetting...
                                </>
                            ) : (
                                <>
                                    <Sparkles className="w-5 h-5" />
                                    ✨ Generate with Gemini 3
                                </>
                            )}
                        </button>
                    </div>

                    {/* Right: Output Section */}
                    <div>
                        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 sticky top-24">
                            <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                                <Wand2 className="w-5 h-5 text-[#00FF41]" />
                                AI-Generated Post
                            </h3>

                            {generatedImage ? (
                                <>
                                    <div className="relative w-full aspect-square rounded-xl overflow-hidden mb-4 bg-black/50">
                                        <Image
                                            src={generatedImage}
                                            alt="Generated post"
                                            fill
                                            className="object-contain"
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        <button
                                            onClick={handleDownload}
                                            className="flex items-center justify-center gap-2 px-4 py-3 bg-white/10 hover:bg-white/20 border border-white/10 rounded-xl transition-colors"
                                        >
                                            <Download className="w-4 h-4" />
                                            Download
                                        </button>
                                        <button
                                            className="flex items-center justify-center gap-2 px-4 py-3 bg-[#00FF41]/10 hover:bg-[#00FF41]/20 border border-[#00FF41]/30 text-[#00FF41] rounded-xl transition-colors"
                                        >
                                            <Save className="w-4 h-4" />
                                            Save to Gallery
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <div className="aspect-square rounded-xl bg-black/50 border border-white/10 flex items-center justify-center text-center p-8">
                                    <div>
                                        <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
                                            <ImageIcon className="w-8 h-8 text-gray-600" />
                                        </div>
                                        <p className="text-gray-400">Your AI-generated post will appear here</p>
                                        <p className="text-gray-600 text-sm mt-2">Upload a photo and click Generate</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
