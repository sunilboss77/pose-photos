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
  { id: 'selfie', label: 'सेल्फी' },
  { id: 'couple', label: 'कपल' },
  { id: 'friend', label: 'फ्रेंड' },
  { id: 'family', label: 'फैमिली' },
  { id: 'kid', label: 'किड' },
]

export const POSES: Pose[] = [
  { id: 'selfie-1', category: 'selfie', src: '/poses/selfie-1.png', alt: 'गाल पर हाथ रखकर पोज़' },
  { id: 'selfie-2', category: 'selfie', src: '/poses/selfie-2.png', alt: 'पीस साइन सेल्फी पोज़' },
  { id: 'couple-1', category: 'couple', src: '/poses/couple-1.png', alt: 'कंधे पर सिर रखकर कपल पोज़' },
  { id: 'friend-1', category: 'friend', src: '/poses/friend-1.png', alt: 'दोस्तों के साथ कंधे पर हाथ' },
  { id: 'family-1', category: 'family', src: '/poses/family-1.png', alt: 'फैमिली ग्रुप पोज़' },
  { id: 'kid-1', category: 'kid', src: '/poses/kid-1.png', alt: 'बैठकर हँसता बच्चा' },
]

export const INSPIRATION_PHOTOS = [
  { src: '/inspo/inspo-1.png', alt: 'पार्क में गाल पर हाथ रखकर बैठी लड़की' },
  { src: '/inspo/inspo-2.png', alt: 'फूलों के ताज के साथ रेलिंग पर झुकी लड़की' },
  { src: '/inspo/inspo-3.png', alt: 'कैमरा पकड़े सफेद ड्रेस में लड़की' },
  { src: '/inspo/inspo-4.png', alt: 'झील के पास बाहें फैलाए लड़की' },
  { src: '/inspo/inspo-5.png', alt: 'घास पर हेडफोन लगाकर बैठी लड़की' },
  { src: '/inspo/inspo-6.png', alt: 'सूर्यास्त में पिकनिक पर बैठी लड़की' },
]
