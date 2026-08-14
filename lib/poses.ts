export type PoseCategory = {
  id: string
  label: string
}

export type Pose = {
  id: string
  category: string
  src: string
  alt: string
}

export const POSE_CATEGORIES: PoseCategory[] = [
  { id: 'trending', label: 'ट्रेंडिंग' },
  { id: 'aesthetic', label: 'एस्थेटिक' },
  { id: 'selfie', label: 'सेल्फी' },
  { id: 'couple', label: 'कपल' },
  { id: 'friend', label: 'फ्रेंड' },
  { id: 'family', label: 'फैमिली' },
  { id: 'kid', label: 'किड' },
]

export const POSES: Pose[] = [
  { id: 'trending-1', category: 'trending', src: '/poses/trending-1.png', alt: 'कंधे के ऊपर से मुड़कर देखने वाला पोज़' },
  { id: 'trending-2', category: 'trending', src: '/poses/trending-2.png', alt: 'बालों में हाथ फेरता हेयर फ्लिप पोज़' },
  { id: 'trending-3', category: 'trending', src: '/poses/trending-3.png', alt: 'मिरर सेल्फी फोन पोज़' },
  { id: 'trending-4', category: 'trending', src: '/poses/trending-4.png', alt: 'दोनों हाथों से हार्ट बनाने वाला पोज़' },
  { id: 'aesthetic-1', category: 'aesthetic', src: '/poses/aesthetic-1.png', alt: 'उंगलियों के बीच से झाँकने वाला पोज़' },
  { id: 'aesthetic-2', category: 'aesthetic', src: '/poses/aesthetic-2.png', alt: 'हाथ पर ठुड्डी रखकर सोचता हुआ पोज़' },
  { id: 'aesthetic-3', category: 'aesthetic', src: '/poses/aesthetic-3.png', alt: 'धूप में आँखें बंद कर बाँह उठाने वाला पोज़' },
  { id: 'aesthetic-4', category: 'aesthetic', src: '/poses/aesthetic-4.png', alt: 'कैंडिड वॉकिंग स्ट्रीट स्टाइल पोज़' },
  { id: 'selfie-1', category: 'selfie', src: '/poses/selfie-1.png', alt: 'गाल पर हाथ रखकर पोज़' },
  { id: 'selfie-2', category: 'selfie', src: '/poses/selfie-2.png', alt: 'पीस साइन सेल्फी पोज़' },
  { id: 'selfie-3', category: 'selfie', src: '/poses/selfie-3.png', alt: 'विंक के साथ फिंगर हार्ट पोज़' },
  { id: 'couple-1', category: 'couple', src: '/poses/couple-1.png', alt: 'कंधे पर सिर रखकर कपल पोज़' },
  { id: 'couple-2', category: 'couple', src: '/poses/couple-2.png', alt: 'माथे से माथा मिलाकर रोमांटिक पोज़' },
  { id: 'couple-3', category: 'couple', src: '/poses/couple-3.png', alt: 'पिगीबैक राइड कपल पोज़' },
  { id: 'friend-1', category: 'friend', src: '/poses/friend-1.png', alt: 'दोस्तों के साथ कंधे पर हाथ' },
  { id: 'friend-2', category: 'friend', src: '/poses/friend-2.png', alt: 'हवा में कूदते हुए दोस्तों का पोज़' },
  { id: 'family-1', category: 'family', src: '/poses/family-1.png', alt: 'फैमिली ग्रुप पोज़' },
  { id: 'family-2', category: 'family', src: '/poses/family-2.png', alt: 'बच्चे को झुलाते हुए फैमिली पोज़' },
  { id: 'kid-1', category: 'kid', src: '/poses/kid-1.png', alt: 'बैठकर हँसता बच्चा' },
  { id: 'kid-2', category: 'kid', src: '/poses/kid-2.png', alt: 'खुशी से कूदता बच्चा' },
]

export const INSPIRATION_PHOTOS = [
  { src: '/inspo/inspo-1.png', alt: 'पार्क में गाल पर हाथ रखकर बैठी लड़की' },
  { src: '/inspo/inspo-2.png', alt: 'फूलों के ताज के साथ रेलिंग पर झुकी लड़की' },
  { src: '/inspo/inspo-3.png', alt: 'कैमरा पकड़े सफेद ड्रेस में लड़की' },
  { src: '/inspo/inspo-4.png', alt: 'झील के पास बाहें फैलाए लड़की' },
  { src: '/inspo/inspo-5.png', alt: 'घास पर हेडफोन लगाकर बैठी लड़की' },
  { src: '/inspo/inspo-6.png', alt: 'सूर्यास्त में पिकनिक पर बैठी लड़की' },
]
