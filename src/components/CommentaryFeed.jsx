import React, { useEffect, useRef } from 'react'

/**
 * CommentaryFeed Component
 * Displays scrollable ball-by-ball commentary in Ceefax style
 */
const CommentaryFeed = ({ commentary = [], maxItems = 10 }) => {
  const commentaryEndRef = useRef(null)
  
  // Auto-scroll to bottom when new commentary is added
  useEffect(() => {
    if (commentaryEndRef.current) {
      commentaryEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [commentary])
  
  // Get recent commentary (most recent first)
  const recentCommentary = commentary.slice(-maxItems).reverse()
  
  /**
   * Determine commentary item class based on content
   */
  const getCommentaryClass = (text) => {
    const lowerText = text.toLowerCase()
    
    if (lowerText.includes('wicket') || lowerText.includes('out') || lowerText.includes('w')) {
      return 'commentary-item--wicket'
    } else if (lowerText.includes('four') || lowerText.includes('six') || lowerText.includes('boundary')) {
      return 'commentary-item--boundary'
    } else if (lowerText.includes('50') || lowerText.includes('100') || lowerText.includes('century') || lowerText.includes('half-century')) {
      return 'commentary-item--milestone'
    }
    
    return 'commentary-item--normal'
  }
  
  if (recentCommentary.length === 0) {
    return (
      <div className="teletext-commentary">
        <div className="teletext-commentary__header">MATCH COMMENTARY</div>
        <div className="teletext-commentary__feed">
          <div className="commentary-item commentary-item--normal">
            Waiting for match to begin...
          </div>
        </div>
      </div>
    )
  }
  
  return (
    <div className="teletext-commentary">
      <div className="teletext-commentary__header">MATCH COMMENTARY</div>
      <div className="teletext-commentary__feed">
        {recentCommentary.map((comment, idx) => (
          <div 
            key={commentary.length - idx} 
            className={`commentary-item ${getCommentaryClass(comment)}`}
          >
            {comment}
          </div>
        ))}
        <div ref={commentaryEndRef} />
      </div>
    </div>
  )
}

export default CommentaryFeed
