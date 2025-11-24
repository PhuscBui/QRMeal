'use client'
import React from 'react'

interface ChatSuggestionsProps {
  onSuggestionClick: (suggestion: string) => void
  className?: string
}

const SUGGESTED_QUESTIONS = [
  'Quán có món gì ngon?',
  'Giá phở bò bao nhiêu?',
  'Đặt bàn cho 4 người',
  'Giờ mở cửa là mấy giờ?',
  'Có món lẩu hải sản không?',
  'Món nào bán chạy nhất?',
  'Địa chỉ nhà hàng ở đâu?',
  'Có chương trình khuyến mãi không?'
]

export default function ChatSuggestions({ onSuggestionClick, className = '' }: ChatSuggestionsProps) {
  return (
    <div className={`mt-4 space-y-2 ${className}`}>
      <p className='text-xs font-medium text-gray-600 dark:text-gray-400'>💡 Câu hỏi thường gặp:</p>
      <div className='grid grid-cols-1 gap-1'>
        {SUGGESTED_QUESTIONS.map((suggestion, index) => (
          <button
            key={index}
            onClick={() => onSuggestionClick(suggestion)}
            className='text-xs text-left p-2 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg border border-blue-200 dark:border-blue-700 transition-colors hover:scale-[1.02] active:scale-[0.98]'
          >
            {suggestion}
          </button>
        ))}
      </div>
    </div>
  )
}


