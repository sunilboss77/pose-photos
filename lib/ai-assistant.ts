import { Type, type FunctionDeclaration } from '@google/genai'
import { POSES, POSE_CATEGORIES } from '@/lib/poses'
import { CAMERA_FILTERS } from '@/lib/filters'

// Full pose catalog for the system prompt so the AI can pick poses itself
function buildPoseCatalog(): string {
  return POSE_CATEGORIES.map((cat) => {
    const poses = POSES.filter((p) => p.category === cat.id)
      .map((p) => `  - ${p.id}: ${p.alt}`)
      .join('\n')
    return `${cat.label} (category: ${cat.id}):\n${poses}`
  }).join('\n\n')
}

const filterList = CAMERA_FILTERS.map((f) => `${f.id} (${f.label})`).join(', ')

export const AI_SYSTEM_INSTRUCTION = `तुम "पोज़ फोटो" नाम की एक कैमरा ऐप के अंदर एक AI फोटोग्राफी असिस्टेंट हो। तुम यूज़र के दोस्त की तरह हो — हमेशा हिंदी (आसान हिंग्लिश) में, प्यार से, polite और encouraging तरीके से बात करो। कभी rude मत बनो। छोटे-छोटे वाक्य बोलो, लंबे भाषण नहीं।

तुम्हारा काम:
1. यूज़र का कैमरा तुम live देख रहे हो (हर सेकंड एक फ्रेम आता है)। फ्रेम देखकर realtime में guide करो:
   - Framing: "कैमरा थोड़ा दूर रखो", "थोड़ा पास आओ", "थोड़ा left/right हो जाओ", "कैमरा थोड़ा ऊपर करो"
   - Background: अगर पीछे का background अच्छा नहीं है तो politely बोलो — जैसे "यार, पीछे का background थोड़ा boring लग रहा है, थोड़ा right side हो जाओ, वहाँ अच्छा लगेगा"
   - Lighting: अगर अंधेरा दिखे तो turnOnLight function से खुद light चालू कर दो और बता दो
   - Pose: यूज़र का pose reference से match हो रहा है या नहीं — "हाथ थोड़ा ऊपर करो", "चेहरा थोड़ा tilt करो"
2. Occasion/जगह के हिसाब से pose suggest करो। यूज़र से पूछो "कहाँ हो? क्या occasion है?" और फिर selectPose function से खुद सही pose लगा दो।
3. जब pose perfect हो जाए तो बोलो "Perfect! अब हिलना मत... 3, 2, 1!" और capturePhoto function से खुद photo खींच लो।
4. ऐप के सारे controls तुम्हारे पास हैं — zoom, timer, flash, exposure, filter, background blur, camera switch, light, aspect ratio, grid, pose category, pose हटाना, reference photo दिखाना/छुपाना, गैलरी खोलना/बंद करना, photo download करना। यूज़र जो भी बोले, सही function से खुद कर दो और हर बार बोलकर बताओ कि क्या किया ("Zoom थोड़ा कम कर दिया, अब पूरा pose frame में आ रहा है!")।
5. अगर तुम्हें camera की current setting पता करनी हो (कौन सा pose/filter लगा है, कितनी photos खींची हैं), तो getCameraStatus function call करो — अंदाज़ा मत लगाओ।

ऐप में उपलब्ध poses (selectPose में poseId के रूप में id use करो):

${buildPoseCatalog()}

उपलब्ध filters (applyFilter में filterId use करो): ${filterList}

नियम:
- हमेशा हिंदी में बोलो, दोस्ताना lehja रखो
- कोई function call करने के बाद हमेशा एक छोटी सी line बोलकर बताओ
- Photo खींचने से पहले हमेशा countdown बोलो
- अगर screen में कुछ न दिखे या अंधेरा हो, तो पहले light ठीक करो
- Feedback हमेशा positive तरीके से दो — पहले तारीफ, फिर suggestion`

export const AI_TOOL_DECLARATIONS: FunctionDeclaration[] = [
  {
    name: 'selectPose',
    description: 'ऐप की pose list में से एक pose select करता है। Pose overlay और reference photo बदल जाती है।',
    parameters: {
      type: Type.OBJECT,
      properties: {
        poseId: {
          type: Type.STRING,
          description: 'Pose की id, जैसे trending-1, couple-5, aesthetic-12',
        },
      },
      required: ['poseId'],
    },
  },
  {
    name: 'setZoom',
    description: 'कैमरा zoom set करता है (1, 2 या 3)।',
    parameters: {
      type: Type.OBJECT,
      properties: {
        level: { type: Type.NUMBER, description: 'Zoom level: 1, 2 या 3' },
      },
      required: ['level'],
    },
  },
  {
    name: 'setTimer',
    description: 'Photo timer set करता है (0, 3 या 10 seconds)।',
    parameters: {
      type: Type.OBJECT,
      properties: {
        seconds: { type: Type.NUMBER, description: 'Timer seconds: 0, 3 या 10' },
      },
      required: ['seconds'],
    },
  },
  {
    name: 'capturePhoto',
    description: 'Photo खींचता है। अगर timer set है तो countdown के बाद खींचेगा।',
    parameters: { type: Type.OBJECT, properties: {} },
  },
  {
    name: 'setFlash',
    description: 'Flash mode set करता है।',
    parameters: {
      type: Type.OBJECT,
      properties: {
        mode: { type: Type.STRING, description: 'Flash mode: off, on या auto' },
      },
      required: ['mode'],
    },
  },
  {
    name: 'setExposure',
    description: 'Brightness/exposure adjust करता है (-2 से +2 तक, 0.5 के steps में)।',
    parameters: {
      type: Type.OBJECT,
      properties: {
        value: { type: Type.NUMBER, description: 'Exposure value: -2 से +2' },
      },
      required: ['value'],
    },
  },
  {
    name: 'applyFilter',
    description: 'Camera पर premium filter/LUT लगाता है।',
    parameters: {
      type: Type.OBJECT,
      properties: {
        filterId: {
          type: Type.STRING,
          description: `Filter id: ${CAMERA_FILTERS.map((f) => f.id).join(', ')}`,
        },
      },
      required: ['filterId'],
    },
  },
  {
    name: 'setBackgroundBlur',
    description: 'Background blur (portrait mode) on/off करता है। Person sharp रहता है, पीछे का background blur हो जाता है।',
    parameters: {
      type: Type.OBJECT,
      properties: {
        enabled: { type: Type.BOOLEAN, description: 'true = blur on, false = blur off' },
      },
      required: ['enabled'],
    },
  },
  {
    name: 'switchCamera',
    description: 'Front और back camera के बीच switch करता है।',
    parameters: { type: Type.OBJECT, properties: {} },
  },
  {
    name: 'turnOnLight',
    description: 'अंधेरे में light चालू/बंद करता है — back camera पर torch, front camera पर screen light।',
    parameters: {
      type: Type.OBJECT,
      properties: {
        on: { type: Type.BOOLEAN, description: 'true = light on, false = light off' },
      },
      required: ['on'],
    },
  },
  {
    name: 'setAspectRatio',
    description: 'Photo का aspect ratio set करता है: full (पूरी स्क्रीन), 4:3 या 16:9।',
    parameters: {
      type: Type.OBJECT,
      properties: {
        ratio: { type: Type.STRING, description: 'Aspect ratio: "full", "4:3" या "16:9"' },
      },
      required: ['ratio'],
    },
  },
  {
    name: 'setGrid',
    description: 'Composition grid (rule of thirds की lines) on/off करता है।',
    parameters: {
      type: Type.OBJECT,
      properties: {
        enabled: { type: Type.BOOLEAN, description: 'true = grid on, false = grid off' },
      },
      required: ['enabled'],
    },
  },
  {
    name: 'selectCategory',
    description: `Pose category बदलता है — नीचे की pose strip उस category के poses दिखाने लगती है। Category ids: ${POSE_CATEGORIES.map((c) => c.id).join(', ')}`,
    parameters: {
      type: Type.OBJECT,
      properties: {
        categoryId: { type: Type.STRING, description: 'Category की id, जैसे trending, couple, aesthetic' },
      },
      required: ['categoryId'],
    },
  },
  {
    name: 'clearPose',
    description: 'Pose overlay पूरी तरह हटा देता है (बिना pose के normal camera)।',
    parameters: { type: Type.OBJECT, properties: {} },
  },
  {
    name: 'showPoseReference',
    description: 'Pose की reference photo (छोटा card ऊपर-बाएँ) दिखाता या छुपाता है। Pose overlay बना रहता है।',
    parameters: {
      type: Type.OBJECT,
      properties: {
        visible: { type: Type.BOOLEAN, description: 'true = reference photo दिखाओ, false = छुपाओ' },
      },
      required: ['visible'],
    },
  },
  {
    name: 'openGallery',
    description: 'गैलरी खोलता या बंद करता है, जहाँ खींची गई photos दिखती हैं।',
    parameters: {
      type: Type.OBJECT,
      properties: {
        open: { type: Type.BOOLEAN, description: 'true = गैलरी खोलो, false = बंद करो' },
      },
      required: ['open'],
    },
  },
  {
    name: 'downloadLastPhoto',
    description: 'सबसे नई (आखिरी खींची गई) photo phone में download/save करता है।',
    parameters: { type: Type.OBJECT, properties: {} },
  },
  {
    name: 'getCameraStatus',
    description: 'Camera की मौजूदा settings बताता है — कौन सा pose, filter, zoom, timer, flash, exposure, aspect ratio, कितनी photos खींची गई हैं वगैरह। यूज़र कुछ पूछे या तुम्हें current state चाहिए तो इसे call करो।',
    parameters: { type: Type.OBJECT, properties: {} },
  },
]

// The client-side action handlers the camera provides to the AI hook
export type AiCameraActions = {
  selectPose: (poseId: string) => string
  setZoom: (level: number) => string
  setTimer: (seconds: number) => string
  capturePhoto: () => string
  setFlash: (mode: string) => string
  setExposure: (value: number) => string
  applyFilter: (filterId: string) => string
  setBackgroundBlur: (enabled: boolean) => string
  switchCamera: () => string
  turnOnLight: (on: boolean) => string
  setAspectRatio: (ratio: string) => string
  setGrid: (enabled: boolean) => string
  selectCategory: (categoryId: string) => string
  clearPose: () => string
  showPoseReference: (visible: boolean) => string
  openGallery: (open: boolean) => string
  downloadLastPhoto: () => string
  getCameraStatus: () => string
}
