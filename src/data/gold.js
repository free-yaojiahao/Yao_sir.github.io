export const zones = [
  { label: '加工区', value: 'workshop' },
  { label: '成品区', value: 'finished' },
]

export const categories = [
  { label: '手镯', value: 'bracelet' },
  { label: '项链', value: 'necklace' },
  { label: '戒指', value: 'ring' },
]

// 示例图片可替换为你的真实CDN/相对路径
const img = (n) => `https://picsum.photos/seed/gold-${n}/800/800`

export const goldItems = [
  { id: 1, zone: 'workshop', category: 'bracelet', title: '工艺手镯A', weight: 18.2, images: [img(1), img(2), img(3)] },
  { id: 2, zone: 'workshop', category: 'necklace', title: '工艺项链A', weight: 22.5, images: [img(4), img(5)] },
  { id: 3, zone: 'workshop', category: 'ring',     title: '工艺戒指A', weight: 5.8,  images: [img(6), img(7), img(8)] },
  { id: 4, zone: 'finished', category: 'bracelet', title: '成品手镯B', weight: 16.7, images: [img(9), img(10)] },
  { id: 5, zone: 'finished', category: 'necklace', title: '成品项链B', weight: 24.1, images: [img(11), img(12)] },
  { id: 6, zone: 'finished', category: 'ring',     title: '成品戒指B', weight: 6.3,  images: [img(13), img(14)] },
]


