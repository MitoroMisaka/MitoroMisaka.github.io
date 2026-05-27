export interface Quote {
  text: string;
  source: string;
}

export const quotes: Quote[] = [
  { text: '行到水穷处，坐看云起时。', source: '王维《终南别业》' },
  { text: '人生如逆旅，我亦是行人。', source: '苏轼《临江仙》' },
  { text: '君子之交淡如水，小人之交甘若醴。', source: '《庄子·山木》' },
  { text: '此心安处是吾乡。', source: '苏轼《定风波》' },
  { text: '世事一场大梦，人生几度秋凉。', source: '苏轼《西江月》' },
  { text: '大鹏一日同风起，扶摇直上九万里。', source: '李白《上李邕》' },
  { text: '长风破浪会有时，直挂云帆济沧海。', source: '李白《行路难》' },
  { text: '人间有味是清欢。', source: '苏轼《浣溪沙》' },
  { text: '醉后不知天在水，满船清梦压星河。', source: '唐温如《题龙阳县青草湖》' },
  { text: '山重水复疑无路，柳暗花明又一村。', source: '陆游《游山西村》' },
  { text: '不畏浮云遮望眼，自缘身在最高层。', source: '王安石《登飞来峰》' },
  { text: '纸上得来终觉浅，绝知此事要躬行。', source: '陆游《冬夜读书示子聿》' },
  { text: '问渠那得清如许，为有源头活水来。', source: '朱熹《观书有感》' },
  { text: '海内存知己，天涯若比邻。', source: '王勃《送杜少府之任蜀州》' },
  { text: '落霞与孤鹜齐飞，秋水共长天一色。', source: '王勃《滕王阁序》' },
];

export function getRandomQuote(): Quote {
  return quotes[Math.floor(Math.random() * quotes.length)];
}
