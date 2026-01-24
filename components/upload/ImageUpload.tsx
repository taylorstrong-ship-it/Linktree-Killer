'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase/client'

interface ImageUploadProps {
    onUploadComplete: (url: string) => void
    currentImage?: string
}

export default function ImageUpload({ onUploadComplete, currentImage }: ImageUploadProps) {
    const [uploading, setUploading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    async function uploadImage(event: React.ChangeEvent<HTMLInputElement>) {
        try {
            setUploading(true)
            setError(null)

            if (!event.target.files || event.target.files.length === 0) {
                throw new Error('You must select an image to upload.')
            }

            const file = event.target.files[0]

            // Validate file type
            if (!file.type.startsWith('image/')) {
                throw new Error('Please upload an image file')
            }

            // Validate file size (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                throw new Error('File size must be less than 5MB')
            }

            // Get current user
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error('Not authenticated')

            // Create clean filename
            const fileExt = file.name.split('.').pop()
            const fileName = `${user.id}/avatar-${Date.now()}.${fileExt}`

            // Upload to Supabase Storage
            const { error: uploadError } = await supabase.storage
                .from('images')
                .upload(fileName, file, {
                    cacheControl: '3600',
                    upsert: true
                })

            if (uploadError) throw uploadError

            // Get public URL
            const { data } = supabase.storage
                .from('images')
                .getPublicUrl(fileName)

            // Send URL back to parent component
            onUploadComplete(data.publicUrl)

        } catch (error: any) {
            console.error('Upload error:', error)
            setError(error.message)
        } finally {
            setUploading(false)
            // Clear the input
            event.target.value = ''
        }
    }

    return (
        <div className="flex flex-col items-center gap-4 p-6 border-2 border-dashed border-gray-300 rounded-xl hover:border-blue-500 hover:bg-blue-50/50 transition-all bg-white">

            {/* Preview Circle */}
            {currentImage ? (
                <div className="relative">
                    <img
                        src={currentImage}
                        alt="Avatar"
                        className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
                    />
                    <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center shadow-md">
                        <i className="fas fa-check text-xs"></i>
                    </div>
                </div>
            ) : (
                <div className="w-24 h-24 rounded-full bg-gray-100 border-4 border-white shadow-md flex items-center justify-center">
                    <i className="fas fa-user text-gray-400 text-3xl"></i>
                </div>
            )}

            {/* Button */}
            <div className="relative w-full">
                <label
                    htmlFor="avatar-upload"
                    className={`cursor-pointer ${uploading ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'
                        } text-white font-semibold py-3 px-6 rounded-full flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-lg w-full`}
                >
                    {uploading ? (
                        <>
                            <i className="fas fa-spinner fa-spin"></i>
                            Uploading...
                        </>
                    ) : (
                        <>
                            <i className="fas fa-upload"></i>
                            {currentImage ? 'Change Image' : 'Upload Image'}
                        </>
                    )}
                </label>
                <input
                    style={{ visibility: 'hidden', position: 'absolute' }}
                    type="file"
                    id="avatar-upload"
                    accept="image/*,image/gif"
                    onChange={uploadImage}
                    disabled={uploading}
                />
            </div>

            {/* Error Message */}
            {error && (
                <div className="w-full bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-2 rounded-lg">
                    <i className="fas fa-exclamation-circle mr-2"></i>
                    {error}
                </div>
            )}

            {/* Success Indicator */}
            {currentImage && !error && !uploading && (
                <div className="w-full bg-green-50 border border-green-200 text-green-600 text-sm px-4 py-2 rounded-lg">
                    <i className="fas fa-check-circle mr-2"></i>
                    Image uploaded successfully!
                </div>
            )}
        </div>
    )
}
