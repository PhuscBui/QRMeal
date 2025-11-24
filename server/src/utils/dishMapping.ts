export const DISH_MAPPING: Record<string, string[]> = {
  // Phở
  'noodle soup': ['phở', 'phở bò', 'phở gà', 'bún bò', 'bún riêu', 'hủ tiếu'],
  'beef noodle': ['phở bò', 'bún bò', 'bún bò huế'],
  'chicken noodle': ['phở gà', 'mì gà'],
  pho: ['phở', 'phở bò', 'phở gà'],

  // Bánh mì
  sandwich: ['bánh mì', 'bánh mì thịt', 'bánh mì pate'],
  bread: ['bánh mì', 'bánh bao'],
  baguette: ['bánh mì'],

  // Cơm
  rice: ['cơm', 'cơm tấm', 'cơm chiên', 'xôi'],
  'fried rice': ['cơm chiên', 'cơm rang'],
  'broken rice': ['cơm tấm'],
  'sticky rice': ['xôi', 'xôi xéo'],

  // Bún
  vermicelli: ['bún', 'bún chả', 'bún thịt nướng', 'bún đậu'],
  noodles: ['bún', 'mì', 'miến', 'bánh canh'],

  // Nem/Chả giò
  'spring roll': ['nem rán', 'chả giò', 'nem chua rán'],
  'summer roll': ['gỏi cuốn', 'nem cuốn'],
  roll: ['nem', 'chả giò', 'gỏi cuốn', 'cuốn'],

  // Món nướng
  grilled: ['nướng', 'thịt nướng', 'gà nướng', 'cá nướng'],
  barbecue: ['nướng', 'thịt nướng', 'xiên nướng'],
  skewer: ['xiên nướng', 'thịt xiên'],

  // Món khác
  soup: ['canh', 'súp', 'lẩu', 'phở', 'bún'],
  hotpot: ['lẩu'],
  coffee: ['cà phê', 'cafe'],
  dessert: ['chè', 'bánh flan', 'bánh ngọt'],
  cake: ['bánh', 'bánh ngọt', 'bánh bông lan'],
  salad: ['gỏi', 'nộm'],

  // Nguyên liệu
  meat: ['thịt', 'thịt bò', 'thịt heo', 'thịt gà'],
  beef: ['bò', 'thịt bò'],
  pork: ['heo', 'thịt heo', 'thịt lợn'],
  chicken: ['gà', 'thịt gà'],
  fish: ['cá'],
  seafood: ['hải sản', 'tôm', 'cua', 'mực'],
  vegetable: ['rau', 'rau củ'],
  egg: ['trứng', 'trứng gà']
}

// Thêm từ đồng nghĩa tiếng Anh
export const ENGLISH_SYNONYMS: Record<string, string[]> = {
  pho: ['vietnamese noodle soup', 'beef noodle soup'],
  'banh mi': ['vietnamese sandwich', 'sandwich'],
  'spring roll': ['fried spring roll', 'egg roll', 'imperial roll'],
  'summer roll': ['fresh spring roll', 'salad roll'],
  coffee: ['vietnamese coffee', 'ca phe']
}
