import vision from '@google-cloud/vision'
import { DISH_MAPPING, ENGLISH_SYNONYMS } from '~/utils/dishMapping'

const visionClient = new vision.ImageAnnotatorClient()

interface LabelAnnotation {
  description?: string | null
  score?: number | null
}

export const detectDishLabels = async (imageUriOrBase64: string) => {
  let request

  if (imageUriOrBase64.startsWith('http')) {
    request = {
      image: { source: { imageUri: imageUriOrBase64 } },
      features: [
        { type: 'LABEL_DETECTION', maxResults: 15 },
        { type: 'OBJECT_LOCALIZATION', maxResults: 10 },
        { type: 'WEB_DETECTION', maxResults: 10 } // Thêm web detection
      ]
    }
  } else {
    const base64Data = imageUriOrBase64.replace(/^data:image\/\w+;base64,/, '')
    request = {
      image: { content: base64Data },
      features: [
        { type: 'LABEL_DETECTION', maxResults: 15 },
        { type: 'OBJECT_LOCALIZATION', maxResults: 10 },
        { type: 'WEB_DETECTION', maxResults: 10 }
      ]
    }
  }

  const [result] = await visionClient.annotateImage(request)

  // Merge labels, objects và web entities
  const labels: LabelAnnotation[] = result.labelAnnotations ?? []
  const objects: LabelAnnotation[] =
    result.localizedObjectAnnotations?.map((obj) => ({
      description: obj.name,
      score: obj.score
    })) ?? []
  const webEntities: LabelAnnotation[] =
    result.webDetection?.webEntities?.map((entity) => ({
      description: entity.description,
      score: entity.score
    })) ?? []

  return [...labels, ...objects, ...webEntities]
}

// Hàm expand keywords với mapping
export const expandKeywords = (keywords: string[]): string[] => {
  const expanded = new Set<string>()

  keywords.forEach((keyword) => {
    const lowerKey = keyword.toLowerCase()
    expanded.add(lowerKey)

    // Thêm từ mapping sang tiếng Việt
    Object.entries(DISH_MAPPING).forEach(([engKey, vietWords]) => {
      if (lowerKey.includes(engKey) || engKey.includes(lowerKey)) {
        vietWords.forEach((viet) => expanded.add(viet))
      }
    })

    // Thêm từ đồng nghĩa tiếng Anh
    Object.entries(ENGLISH_SYNONYMS).forEach(([key, synonyms]) => {
      if (lowerKey.includes(key) || key.includes(lowerKey)) {
        synonyms.forEach((syn) => expanded.add(syn))
        // Cũng thêm mapping tiếng Việt của synonyms
        synonyms.forEach((syn) => {
          const synLower = syn.toLowerCase()
          Object.entries(DISH_MAPPING).forEach(([engKey, vietWords]) => {
            if (synLower.includes(engKey) || engKey.includes(synLower)) {
              vietWords.forEach((viet) => expanded.add(viet))
            }
          })
        })
      }
    })
  })

  return Array.from(expanded)
}
