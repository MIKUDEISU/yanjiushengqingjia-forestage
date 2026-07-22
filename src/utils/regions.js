function buildRegionTree() {
  try {
    const areaData = require('china-area-data/v5/data.json')
    return buildOptions(areaData)
  } catch (e) {
    console.warn('无法加载china-area-data，使用降级数据:', e.message)
    return getFallbackRegions()
  }
}

function buildOptions(data) {
  const options = []
  for (const [code, name] of Object.entries(data)) {
    if (code.endsWith('0000') && code.length === 6) {
      const cities = []
      for (const [cityCode, cityName] of Object.entries(data)) {
        if (cityCode.startsWith(code.substring(0, 2)) && cityCode.endsWith('00') && cityCode.length === 6 && cityCode !== code) {
          const districts = []
          for (const [distCode, distName] of Object.entries(data)) {
            if (distCode.startsWith(cityCode.substring(0, 4)) && distCode.length === 6 && distCode !== cityCode && !distCode.endsWith('00')) {
              districts.push({ text: distName, value: distCode })
            }
          }
          cities.push({
            text: cityName,
            value: cityCode,
            children: districts.length > 0 ? districts : undefined
          })
        }
      }
      options.push({
        text: name,
        value: code,
        children: cities.length > 0 ? cities : undefined
      })
    }
  }
  return options
}

function getFallbackRegions() {
  return [
    { text: '北京市', value: '110000', children: [
      { text: '北京市', value: '110100', children: [
        { text: '海淀区', value: '110108' }, { text: '朝阳区', value: '110105' },
        { text: '东城区', value: '110101' }, { text: '西城区', value: '110102' }
      ]}
    ]},
    { text: '湖北省', value: '420000', children: [
      { text: '武汉市', value: '420100', children: [
        { text: '洪山区', value: '420111' }, { text: '武昌区', value: '420106' },
        { text: '江岸区', value: '420102' }, { text: '江汉区', value: '420103' }
      ]}
    ]},
    { text: '广东省', value: '440000', children: [
      { text: '深圳市', value: '440300', children: [
        { text: '南山区', value: '440305' }, { text: '福田区', value: '440304' }
      ]},
      { text: '广州市', value: '440100', children: [
        { text: '天河区', value: '440106' }, { text: '越秀区', value: '440104' }
      ]}
    ]},
    { text: '湖南省', value: '430000', children: [
      { text: '长沙市', value: '430100', children: [
        { text: '岳麓区', value: '430104' }, { text: '芙蓉区', value: '430102' }
      ]}
    ]},
    { text: '四川省', value: '510000', children: [
      { text: '成都市', value: '510100', children: [
        { text: '武侯区', value: '510107' }, { text: '锦江区', value: '510104' }
      ]}
    ]},
    { text: '上海市', value: '310000', children: [
      { text: '上海市', value: '310100', children: [
        { text: '浦东新区', value: '310115' }, { text: '徐汇区', value: '310104' }
      ]}
    ]},
    { text: '浙江省', value: '330000', children: [
      { text: '杭州市', value: '330100', children: [
        { text: '西湖区', value: '330106' }, { text: '余杭区', value: '330110' }
      ]}
    ]},
    { text: '江苏省', value: '320000', children: [
      { text: '南京市', value: '320100', children: [
        { text: '鼓楼区', value: '320106' }, { text: '玄武区', value: '320102' }
      ]}
    ]},
    { text: '陕西省', value: '610000', children: [
      { text: '西安市', value: '610100', children: [
        { text: '雁塔区', value: '610113' }, { text: '碑林区', value: '610103' }
      ]}
    ]},
    { text: '山东省', value: '370000', children: [
      { text: '济南市', value: '370100', children: [
        { text: '历下区', value: '370102' }, { text: '市中区', value: '370103' }
      ]}
    ]}
  ]
}

let cachedOptions = null
export const regionOptions = (() => {
  if (!cachedOptions) {
    cachedOptions = buildRegionTree()
  }
  return cachedOptions
})()
