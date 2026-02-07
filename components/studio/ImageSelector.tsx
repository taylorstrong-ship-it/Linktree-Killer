'use client'

import { useState } from 'react'
import { Upload, Check, Image as ImageIcon } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'

interface ImageSelectorProps {
    brandImages?: string[]
    onImageSelected: (imageUrl: string, source: 'upload' | 'brand') => void
    selectedImage?: string
}

export default function ImageSelector({ brandImages = [], onImageSelected, selectedImage }: ImageSelectorProps) {
    const [uploading, setUploading] = useState(false)
    const [uploadedUrl, setUploadedUrl] = useState<string>('')

    async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0]
        if (!file) return

        // Validate file
        if (!file.type.startsWith('image/')) {
            alert('Please upload an image file')
            return
        }

        if (file.size > 10 * 1024 * 1024) {
            alert('Image must be less than 10MB')
            return
        }

        setUploading(true)

        try {
            // Generate unique filename
            const ext = file.name.split('.').pop()
            const filename = `${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`
            const filePath = `user-uploads/${filename}`

            // Upload to Supabase Storage
            const { data, error } = await supabase.storage
                .from('content-studio')
                .upload(filePath, file, {
                    cacheControl: '3600',
                    upsert: false
                })

            if (error) throw error

            // Get public URL
            const { data: { publicUrl } } = supabase.storage
                .from('content-studio')
                .getPublicUrl(filePath)

            setUploadedUrl(publicUrl)
            onImageSelected(publicUrl, 'upload')

            console.log('✅ Photo uploaded:', publicUrl)
        } catch (err) {
            console.error('Upload failed:', err)
            alert('Upload failed. Please try again.')
        } finally {
            setUploading(false)
        }
    }

    return (
        <div className="space-y-6">
            {/* Upload Section */}
            <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#FF6B35] to-[#00FF41] flex items-center justify-center">
                        <Upload className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h3 className="text-white font-semibold">Upload New Photo</h3>
                        <p className="text-gray-500 text-sm">Today's special, product shot, etc.</p>
                    </div>
                </div>

                <label
                    className={`
                        relative block w-full border-2 border-dashed rounded-xl overflow-hidden cursor-pointer
                        transition-all group
                        ${selectedImage === uploadedUrl
                            ? 'border-[#00FF41] bg-[#00FF41]/10'
                            : 'border-white/20 hover:border-[#FF6B35] hover:bg-white/5'
                        }
                    `}
                >
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileUpload}
                        className="hidden"
                        disabled={uploading}
                    />

                    {uploadedUrl ? (
                        <div className="relative aspect-square">
                            <img
                                src={uploadedUrl}
                                alt="Uploaded"
                                className="w-full h-full object-cover"
                            />
                            {selectedImage === uploadedUrl && (
                                <div className="absolute inset-0 bg-[#00FF41]/20 flex items-center justify-center">
                                    <div className="w-12 h-12 rounded-full bg-[#00FF41] flex items-center justify-center">
                                        <Check className="w-6 h-6 text-black" />
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="aspect-square flex flex-col items-center justify-center p-8 text-center">
                            {uploading ? (
                                <>
                                    <div className="w-12 h-12 border-4 border-white/20 border-t-[#FF6B35] rounded-full animate-spin mb-4"></div>
                                    <p className="text-gray-400 text-sm">Uploading...</p>
                                </>
                            ) : (
                                <>
                                    <Upload className="w-12 h-12 text-gray-600 mb-4 group-hover:text-[#FF6B35] transition-colors" />
                                    <p className="text-white font-medium mb-1">Click to Upload</p>
                                    <p className="text-gray-500 text-sm">JPG, PNG up to 10MB</p>
                                </>
                            )}
                        </div>
                    )}
                </label>
            </div>

            {/* Brand Photos Grid */}
            {brandImages.length > 0 && (
                <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
                            <ImageIcon className="w-5 h-5 text-[#00FF41]" />
                        </div>
                        <div>
                            <h3 className="text-white font-semibold">Your Brand Photos</h3>
                            <p className="text-gray-500 text-sm">From your website scan</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                        {brandImages.slice(0, 15).map((imgUrl, idx) => (
                            <button
                                key={idx}
                                onClick={() => onImageSelected(imgUrl, 'brand')}
                                className={`
                                    relative aspect-square rounded-xl overflow-hidden
                                    transition-all group
                                    ${selectedImage === imgUrl
                                        ? 'ring-2 ring-[#00FF41] ring-offset-2 ring-offset-[#0a0a0a]'
                                        : 'hover:ring-2 hover:ring-[#FF6B35] hover:ring-offset-2 hover:ring-offset-[#0a0a0a]'
                                    }
                                `}
                            >
                                <img
                                    src={imgUrl}
                                    alt={`Brand photo ${idx + 1}`}
                                    className="w-full h-full object-cover"
                                />
                                {selectedImage === imgUrl && (
                                    <div className="absolute inset-0 bg-[#00FF41]/20 flex items-center justify-center">
                                        <div className="w-8 h-8 rounded-full bg-[#00FF41] flex items-center justify-center">
                                            <Check className="w-4 h-4 text-black" />
                                        </div>
                                    </div>
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}
