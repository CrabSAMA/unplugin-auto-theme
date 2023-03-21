// import axios from 'axios'
import fs from 'fs'
import path from 'path'

import { createUnplugin } from 'unplugin'
import type { Options } from './types'

export default createUnplugin<Options | undefined>((options) => {
  // 拉取数据
  // const response = await axios.get('https://static.huolala.cn/schema/ffba3a0a04de40d4a6d9e5725ccda28b_data.json')
  // const data = response?.data?.data?.apiDocMap

  let newFilePath: string

  const data = `body {
  background-color: black;
}`
  return {
    name: 'unplugin-auto-theme',
    buildStart() {
      // 创建一个新文件，并将内容写入文件中
      if (!fs.existsSync('.temp'))
        fs.mkdirSync('.temp')

      newFilePath = path.resolve('./.temp/test.less')
      if (!fs.existsSync(newFilePath))
        fs.writeFileSync(newFilePath, data)
    },
    transformInclude(id) {
      return options && id.includes(options.entry)
    },
    transform(code) {
      // 在代码开头添加一段自定义代码
      code = `import '../.temp/test.less';\n${code}`

      return {
        code,
        map: null,
      }
    },
    vite: {
      buildEnd() {
        fs.rmSync(newFilePath)
        if (fs.existsSync('.temp'))
          fs.rmdirSync('.temp')
      },
    },
    webpack(compiler) {
      // FIXME 不知道为什么 webpack不会触发 shutdown hook
      compiler.hooks.shutdown.tap('unplugin-auto-theme', () => {
        fs.rmSync(newFilePath)
        if (fs.existsSync('.temp'))
          fs.rmdirSync('.temp')
      })
    },
  }
})
