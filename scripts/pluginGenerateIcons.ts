import * as fs from 'node:fs'
import * as path from 'node:path'

import {Api} from '@vitejs/plugin-vue'
import {Plugin} from 'vite'

const iconsDir = path.join(process.cwd(), './src/assets/svg')

/** Генерирует иконки и завершает процесс. */
export default function generateIcons(): Plugin<Api> {
    return {
        name: 'run-icons-script',
        apply: 'build',
        async buildStart() {
            if (process.env.GENERATE_ICONS !== 'true') {
                return
            }

            console.log('Старт генерации иконок...')
            const iconsComponentsIndexPath = path.join(process.cwd(), './src/index.ts')
            const iconSizes = fs.readdirSync(iconsDir, {withFileTypes: true}).filter(x => x.isDirectory()).map(x => x.name)
            // index.ts
            let imports = ''
            let exports = ''

            for (const size of iconSizes) {
                const iconsDirFromSize = path.join(iconsDir, size)
                const iconFiles = fs.readdirSync(iconsDirFromSize).filter((file) => file.endsWith('.svg'))

                for (const file of iconFiles) {
                    const iconName = file.replace('.svg', '')
                    const componentName = transformIconName(iconName.slice(0, iconName.length - size.length), size)
                    const importPath = `@/assets/svg/${size}/${file}?component`
                    imports += `import ${componentName} from '${importPath}';\n`
                    exports += `  ${componentName},\n`
                }

                imports += '\n'
                exports += '\n'
            }


            const content = `${imports}\nexport {\n${exports}};\n`

            // Записываем содержимое в файл index.ts
            fs.writeFileSync(iconsComponentsIndexPath, content, 'utf8')

            console.log('Компоненты успешно созданы.')
            process.exit(0)
        },
    }
}


// 18_circle_outline_32.svg -> Icon3218CircleOutline
function transformIconName(iconName: string, size: string) {
    const parts = iconName.split('_')
    const formattedName = parts.map(part =>
        part.charAt(0).toUpperCase() + part.slice(1)
    ).join('');
    return `Icon${size}${formattedName}`;
}
