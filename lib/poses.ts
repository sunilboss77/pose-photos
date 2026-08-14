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

// हर श्रेणी में उपलब्ध पोज़ इमेज की संख्या (public/poses/ में मौजूद फाइलें)
const POSE_COUNTS: Record<string, number> = {
  trending: 25,
  aesthetic: 25,
  selfie: 20,
  couple: 20,
  friend: 20,
  family: 20,
  kid: 17,
}

const CATEGORY_ALT: Record<string, string> = {
  trending: 'ट्रेंडिंग पोज़',
  aesthetic: 'एस्थेटिक पोज़',
  selfie: 'सेल्फी पोज़',
  couple: 'कपल पोज़',
  friend: 'फ्रेंड पोज़',
  family: 'फैमिली पोज़',
  kid: 'किड पोज़',
}

// जिन पोज़ के लिए खास विवरण उपलब्ध है
const POSE_ALTS: Record<string, string> = {
  'trending-1': 'कंधे के ऊपर से मुड़कर देखने वाला पोज़',
  'trending-2': 'बालों में हाथ फेरता हेयर फ्लिप पोज़',
  'trending-3': 'मिरर सेल्फी फोन पोज़',
  'trending-4': 'दोनों हाथों से हार्ट बनाने वाला पोज़',
  'trending-15': 'विंक करते हुए कैमरे की ओर इशारा करता पोज़',
  'aesthetic-1': 'उंगलियों के बीच से झाँकने वाला पोज़',
  'aesthetic-2': 'हाथ पर ठुड्डी रखकर सोचता हुआ पोज़',
  'aesthetic-3': 'धूप में आँखें बंद कर बाँह उठाने वाला पोज़',
  'aesthetic-4': 'कैंडिड वॉकिंग स्ट्रीट स्टाइल पोज़',
  'aesthetic-20': 'हवा में दुपट्टा लहराता डांस पोज़',
  'selfie-1': 'गाल पर हाथ रखकर पोज़',
  'selfie-2': 'पीस साइन सेल्फी पोज़',
  'selfie-3': 'विंक के साथ फिंगर हार्ट पोज़',
  'couple-1': 'कंधे पर सिर रखकर कपल पोज़',
  'couple-2': 'माथे से माथा मिलाकर रोमांटिक पोज़',
  'couple-3': 'पिगीबैक राइड कपल पोज़',
  'couple-12': 'पार्टनर को हवा में उठाकर घुमाने वाला पोज़',
  'friend-1': 'दोस्तों के साथ कंधे पर हाथ',
  'friend-2': 'हवा में कूदते हुए दोस्तों का पोज़',
  'family-1': 'फैमिली ग्रुप पोज़',
  'family-2': 'बच्चे को झुलाते हुए फैमिली पोज़',
  'kid-1': 'बैठकर हँसता बच्चा',
  'kid-2': 'खुशी से कूदता बच्चा',
  'kid-12': 'टेडी बियर को गले लगाता बच्चा',
}

export const POSES: Pose[] = Object.entries(POSE_COUNTS).flatMap(([category, count]) =>
  Array.from({ length: count }, (_, i) => {
    const n = i + 1
    const id = `${category}-${n}`
    return {
      id,
      category,
      src: `/poses/${id}.png`,
      alt: POSE_ALTS[id] ?? `${CATEGORY_ALT[category]} ${n}`,
    }
  }),
)

export const INSPIRATION_PHOTOS = [
  { src: '/inspo/inspo-1.png', alt: 'पार्क में गाल पर हाथ रखकर बैठी लड़की' },
  { src: '/inspo/inspo-2.png', alt: 'फूलों के ताज के साथ रेलिंग पर झुकी लड़की' },
  { src: '/inspo/inspo-3.png', alt: 'कैमरा पकड़े सफेद ड्रेस में लड़की' },
  { src: '/inspo/inspo-4.png', alt: 'झील के पास बाहें फैलाए लड़की' },
  { src: '/inspo/inspo-5.png', alt: 'घास पर हेडफोन लगाकर बैठी लड़की' },
  { src: '/inspo/inspo-6.png', alt: 'सूर्यास्त में पिकनिक पर बैठी लड़की' },
]
