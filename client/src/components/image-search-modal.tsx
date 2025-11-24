import { useState, useRef } from 'react'
import { Camera, Upload, X, Loader2, Image as ImageIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useImageSearchMutation } from '@/queries/useDish'
import Image from 'next/image'
import { DishResType } from '@/schemaValidations/dish.schema'

interface ImageSearchModalProps {
  isOpen: boolean
  onClose: () => void
  onDishSelect: (dish: DishResType['result']) => void
}

export function ImageSearchModal({ isOpen, onClose, onDishSelect }: ImageSearchModalProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)

  const imageSearchMutation = useImageSearchMutation()

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file')
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image size must be less than 5MB')
      return
    }

    // Create preview
    const reader = new FileReader()
    reader.onload = (e) => {
      const result = e.target?.result as string
      setPreviewUrl(result)
      setSelectedImage(result)
    }
    reader.readAsDataURL(file)
  }

  const handleSearch = async () => {
    if (!selectedImage) return

    try {
      const result = await imageSearchMutation.mutateAsync({
        image_base64: selectedImage,
        maxResults: 5
      })

      // Success - show results
      console.log('Search results:', result.payload.result)
    } catch (error) {
      console.error('Search failed:', error)
      alert('Failed to search. Please try again.')
    }
  }

  const handleReset = () => {
    setSelectedImage(null)
    setPreviewUrl(null)
    imageSearchMutation.reset()
  }

  const handleClose = () => {
    handleReset()
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className='max-w-4xl max-h-[90vh] overflow-y-auto'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2'>
            <Camera className='h-5 w-5' />
            Find dishes by image
          </DialogTitle>
        </DialogHeader>

        <div className='space-y-4'>
          {/* Upload Section */}
          {!previewUrl && (
            <div className='grid grid-cols-2 gap-4'>
              <Card
                className='cursor-pointer hover:bg-accent transition-colors'
                onClick={() => fileInputRef.current?.click()}
              >
                <CardContent className='flex flex-col items-center justify-center p-8 text-center'>
                  <Upload className='h-12 w-12 text-muted-foreground mb-4' />
                  <h3 className='font-medium mb-2'>Upload Image</h3>
                  <p className='text-sm text-muted-foreground'>Select an image from your device</p>
                </CardContent>
              </Card>

              <Card
                className='cursor-pointer hover:bg-accent transition-colors'
                onClick={() => cameraInputRef.current?.click()}
              >
                <CardContent className='flex flex-col items-center justify-center p-8 text-center'>
                  <Camera className='h-12 w-12 text-muted-foreground mb-4' />
                  <h3 className='font-medium mb-2'>Take Photo</h3>
                  <p className='text-sm text-muted-foreground'>Use camera to take a photo</p>
                </CardContent>
              </Card>

              <input ref={fileInputRef} type='file' accept='image/*' className='hidden' onChange={handleFileSelect} />
              <input
                ref={cameraInputRef}
                type='file'
                accept='image/*'
                capture='environment'
                className='hidden'
                onChange={handleFileSelect}
              />
            </div>
          )}

          {/* Preview & Results Section */}
          {previewUrl && (
            <div className='space-y-4'>
              {/* Image Preview */}
              <Card>
                <CardContent className='p-4'>
                  <div className='flex items-start gap-4'>
                    <div className='relative w-48 h-48 flex-shrink-0'>
                      <Image src={previewUrl} alt='Preview' fill className='object-cover rounded-lg' />
                    </div>
                    <div className='flex-1'>
                      <div className='flex items-center justify-between mb-4'>
                        <h3 className='font-medium'>Selected Image</h3>
                        <Button variant='ghost' size='sm' onClick={handleReset}>
                          <X className='h-4 w-4' />
                        </Button>
                      </div>
                      <Button className='w-full' onClick={handleSearch} disabled={imageSearchMutation.isPending}>
                        {imageSearchMutation.isPending ? (
                          <>
                            <Loader2 className='h-4 w-4 mr-2 animate-spin' />
                            Searching...
                          </>
                        ) : (
                          <>
                            <Camera className='h-4 w-4 mr-2' />
                            Search for dishes
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Search Results */}
              {imageSearchMutation.isSuccess && (
                <div className='space-y-4'>
                  {/* Labels Detected */}
                  {imageSearchMutation.data.payload.result.labels.length > 0 && (
                    <Card>
                      <CardContent className='p-4'>
                        <h3 className='font-medium mb-3'>Detected labels:</h3>
                        <div className='flex flex-wrap gap-2'>
                          {imageSearchMutation.data.payload.result.labels.slice(0, 10).map((label, idx) => (
                            <Badge key={idx} variant='secondary'>
                              {label.description} {label.score && `(${(label.score * 100).toFixed(0)}%)`}
                            </Badge>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Dishes Found */}
                  <div>
                    <h3 className='font-medium mb-3'>
                      Found {imageSearchMutation.data.payload.result.dishes.length} dishes
                    </h3>
                    {imageSearchMutation.data.payload.result.dishes.length > 0 ? (
                      <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                        {imageSearchMutation.data.payload.result.dishes.map((dish) => (
                          <Card
                            key={dish._id}
                            className='cursor-pointer hover:shadow-lg transition-shadow'
                            onClick={() => {
                              onDishSelect(dish)
                              handleClose()
                            }}
                          >
                            <CardContent className='p-4'>
                              <div className='flex gap-4'>
                                <div className='relative w-24 h-24 flex-shrink-0'>
                                  <Image
                                    src={dish.image || '/placeholder.svg'}
                                    alt={dish.name}
                                    fill
                                    className='object-cover rounded-lg'
                                  />
                                </div>
                                <div className='flex-1'>
                                  <h4 className='font-medium mb-1'>{dish.name}</h4>
                                  <p className='text-sm text-muted-foreground mb-2 line-clamp-2'>{dish.description}</p>
                                  <p className='text-lg font-bold text-primary'>
                                    {dish.price.toLocaleString('vi-VN')}đ
                                  </p>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <Card>
                        <CardContent className='p-8 text-center'>
                          <ImageIcon className='h-12 w-12 mx-auto text-muted-foreground mb-4' />
                          <h3 className='font-medium mb-2'>No dish found</h3>
                          <p className='text-sm text-muted-foreground mb-4'>
                            Try taking a clearer photo or using different image
                          </p>
                          <Button onClick={handleReset}>Try again</Button>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </div>
              )}

              {/* Error State */}
              {imageSearchMutation.isError && (
                <Card className='border-red-200'>
                  <CardContent className='p-4 text-center'>
                    <p className='text-red-600'>Search failed. Please try again.</p>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
