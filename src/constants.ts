import { StagingConfig } from "./types";

export const STAGING_CONFIG: StagingConfig[] = [
  {
    id: 'lung',
    title: '肺癌 TNM 分期',
    description: '非小细胞肺癌 (NSCLC) AJCC 第八版临床分期。',
    params: {
      T: [
        { id: 't_size', text: '肿瘤最大径 (cm)', type: 'number', placeholder: '如 2.5', category: 'T' },
        { id: 't_invasion', text: '侵犯范围 (T 分级)', type: 'select', options: [
          'T1: 肿瘤最大径 ≤ 3cm，局限于肺内',
          'T2: 3cm < 最大径 ≤ 5cm，或侵犯主支气管/脏层胸膜',
          'T3: 5cm < 最大径 ≤ 7cm，或侵犯胸壁/膈神经/心包',
          'T4: 最大径 > 7cm，或侵犯纵隔/心脏/大血管/食管/椎体'
        ], category: 'T' }
      ],
      N: [
        { id: 'n_status', text: '淋巴结转移 (N 分级)', type: 'select', options: [
          'N0: 无区域淋巴结转移',
          'N1: 同侧支气管旁或肺门淋巴结转移',
          'N2: 同侧纵隔或隆突下淋巴结转移',
          'N3: 对侧纵隔/肺门，或同/对侧锁骨上淋巴结转移'
        ], category: 'N' }
      ],
      M: [
        { id: 'm_status', text: '远处转移 (M 分级)', type: 'select', options: [
          'M0: 无远处转移',
          'M1a: 胸膜结节/恶性胸水，或对侧肺叶出现癌结节',
          'M1b: 单一肺外器官的单病灶转移 (如单个脑/骨转移)',
          'M1c: 单一肺外器官多处转移或多个器官转移'
        ], category: 'M' }
      ]
    }
  },
  {
    id: 'esophageal',
    title: '食管癌 TNM 分期',
    description: '食管癌 AJCC 第八版临床/病理分期。',
    params: {
      T: [
        { id: 't_invasion', text: '侵犯深度 (T 分级)', type: 'select', options: [
          'T1a: 肿瘤侵犯粘膜固有层或粘膜肌层',
          'T1b: 肿瘤侵犯粘膜下层',
          'T2: 肿瘤侵犯食管肌层',
          'T3: 肿瘤侵犯食管纤维外膜',
          'T4a: 肿瘤侵犯邻近结构 (如胸膜、心包、膈肌、奇静脉、腹膜)，可切除',
          'T4b: 肿瘤侵犯主要邻近器官 (如主动脉、椎体、气管)，不可切除'
        ], category: 'T' }
      ],
      N: [
        { id: 'n_count', text: '区域淋巴结转移 (N 分级)', type: 'select', options: [
          'N0: 无区域淋巴结转移',
          'N1: 1-2 枚区域淋巴结转移 (涵盖颈部、胸部至腹腔干区域)',
          'N2: 3-6 枚区域淋巴结转移',
          'N3: 7 枚及以上区域淋巴结转移'
        ], category: 'N' }
      ],
      M: [
        { id: 'm_status', text: '远处转移 (M 分级)', type: 'select', options: [
          'M0: 无远处转移',
          'M1: 存在远处转移 (如非区域淋巴结、肝、肺、骨或其他远隔器官)'
        ], category: 'M' }
      ]
    }
  },
  {
    id: 'thymic',
    title: '胸腺肿瘤 TNM 分期',
    description: '适用于胸腺癌及胸腺瘤 (AJCC 第八版)。',
    params: {
      T: [
        { id: 't_invasion', text: '侵犯结构 (T 分级)', type: 'select', options: [
          'T1a: 肿瘤局限于胸腺，未侵犯纵隔胸膜',
          'T1b: 肿瘤侵犯纵隔胸膜',
          'T2: 肿瘤侵犯心包',
          'T3: 肿瘤侵犯肺、无名静脉、上腔静脉、膈神经、胸壁等',
          'T4: 肿瘤侵犯心脏、大血管、气管、食管等'
        ], category: 'T' }
      ],
      N: [
        { id: 'n_status', text: '淋巴结转移 (N 分级)', type: 'select', options: [
          'N0: 无区域淋巴结转移',
          'N1: 前纵隔 (胸腺) 淋巴结转移',
          'N2: 深部纵隔或锁骨上淋巴结转移'
        ], category: 'N' }
      ],
      M: [
        { id: 'm_status', text: '远处转移 (M 分级)', type: 'select', options: [
          'M0: 无远程转移证据',
          'M1a: 胸膜或心包播散/结节',
          'M1b: 肺内结节或远隔器官转移'
        ], category: 'M' }
      ]
    }
  }
];
