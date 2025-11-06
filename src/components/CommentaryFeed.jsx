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
    
    // CRITICAL FIX: Wickets should be RED background
    if (lowerText.includes('wicket') || lowerText.includes('out') || lowerText.includes('bowled') || 
        lowerText.includes('caught') || lowerText.includes('lbw') || lowerText.includes(' w ')) {
      return 'commentary-item--wicket'
    }
    
    // CRITICAL FIX: Boundaries (4s and 6s) should be GREEN background
    if (lowerText.includes('four') || lowerText.includes('six') || lowerText.includes('boundary') ||
        lowerText.includes('maximum')) {
      return 'commentary-item--boundary'
    }
    
    // Milestones (50s, 100s)
    if (lowerText.includes('50') || lowerText.includes('100') || lowerText.includes('century') || 
        lowerText.includes('half-century') || lowerText.includes('maiden')) {
      return 'commentary-item--milestone'
    }
    
    // CRITICAL FIX: Runs (1, 2, 3) should be CYAN background
    if (lowerText.includes('single') || lowerText.includes('two runs') || lowerText.includes('three runs') ||
        lowerText.includes('take two') || lowerText.includes('take three') || lowerText.includes('couple') ||
        lowerText.match(/\btwo\b/) || lowerText.match(/\bthree\b/)) {
      return 'commentary-item--runs'
    }
    
    // CRITICAL FIX: Chances/edges should be BOLD with warning icon
    if (lowerText.includes('edge') || lowerText.includes('chance') || lowerText.includes('dropped') ||
        lowerText.includes('close call') || lowerText.includes('beats the bat') || lowerText.includes('play and miss')) {
      return 'commentary-item--chance'
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
