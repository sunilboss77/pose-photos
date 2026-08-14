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

const CATEGORY_ALTS: Record<string, string[]> = {
  trending: [
    'कंधे के ऊपर से मुड़कर देखने वाला पोज़',
    'बालों में हाथ फेरता हेयर फ्लिप पोज़',
    'मिरर सेल्फी फोन पोज़',
    'दोनों हाथों से हार्ट बनाने वाला पोज़',
  ],
  aesthetic: [
    'उंगलियों के बीच से झाँकने वाला पोज़',
    'हाथ पर ठुड्डी रखकर सोचता हुआ पोज़',
    'धूप में आँखें बंद कर बाँह उठाने वाला पोज़',
    'कैंडिड वॉकिंग स्ट्रीट स्टाइल पोज़',
  ],
  selfie: [
    'गाल पर हाथ रखकर पोज़',
    'पीस साइन सेल्फी पोज़',
    'विंक के साथ फिंगर हार्ट पोज़',
  ],
  couple: [
    'कंधे पर सिर रखकर कपल पोज़',
    'माथे से माथा मिलाकर रोमांटिक पोज़',
    'पिगीबैक राइड कपल पोज़',
  ],
  friend: [
    'दोस्तों के साथ कंधे पर हाथ',
    'हवा में कूदते हुए दोस्तों का पोज़',
  ],
  family: [
    'फैमिली ग्रुप पोज़',
    'बच्चे को झुलाते हुए फैमिली पोज़',
  ],
  kid: [
    'बैठकर हँसता बच्चा',
    'खुशी से कूदता बच्चा',
  ],
}

const CATEGORY_LATE_ALTS: Record<string, Record<number, string>> = {
  kid: {
    18: 'झुककर ज़मीन की ओर इशारा करता बच्चा',
    19: 'गुब्बारा पकड़कर हाथ हिलाता बच्चा',
    20: 'बैठकर किताब पढ़ता बच्चा',
  },
}

const CATEGORY_LABELS: Record<string, string> = {
  trending: 'ट्रेंडिंग पोज़',
  aesthetic: 'एस्थेटिक पोज़',
  selfie: 'सेल्फी पोज़',
  couple: 'कपल पोज़',
  friend: 'फ्रेंड पोज़',
  family: 'फैमिली पोज़',
  kid: 'किड पोज़',
}

const CATEGORY_COUNTS: Record<string, number> = {
  trending: 25,
  aesthetic: 25,
  selfie: 20,
  couple: 20,
  friend: 20,
  family: 20,
  kid: 20,
}

export const POSES: Pose[] = Object.entries(CATEGORY_COUNTS).flatMap(([category, count]) =>
  Array.from({ length: count }, (_, i) => {
    const n = i + 1
    const alts = CATEGORY_ALTS[category] ?? []
    return {
      id: `${category}-${n}`,
      category,
      src: `/poses/${category}-${n}.png`,
      alt: alts[i] ?? CATEGORY_LATE_ALTS[category]?.[n] ?? `${CATEGORY_LABELS[category]} ${n}`,
    }
  }),
)

export const INSPIRATION_PHOTOS = [
  { src: '/inspo/inspo-1.png', alt: 'पार्क में गाल पर हाथ रखकर बैठी लड़की' },
  { src: '/inspo/inspo-2.png', alt: 'फूलों के ताज के साथ रेलिंग पर झुकी लड़की' },
  { src: '/inspo/inspo-3.png', alt: 'कैमरा पकड़े सफेद ड्रेस में लड़की' },
  { src: '/inspo/inspo-4.png', alt: 'झील के पास बाहें फैलाए लड़की' },
  { src: '/inspo/inspo-5.png', alt: 'सूर्यास्त में पिकनिक पर बैठी लड़की' },
  { src: '/inspo/inspo-6.png', alt: 'घास पर हेडफोन लगाकर बैठी लड़की' },
]
