import fs from 'fs-extra'
import * as path from 'node:path'
import process from "node:process";
import { Api } from '@vitejs/plugin-vue'
import { Plugin } from 'vite'

const iconsDir = path.join(process.cwd(), './node_modules/@vkontakte/icons/src/svg')

// Глобальные декларации (web-types, GlobalComponents) намеренно не генерируются: библиотека ничего не регистрирует глобально,
// а с ними IDE считает иконки доступными без импорта и не предупреждает о пропущенном импорте.
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
            const iconSizes = (await fs.readdir(iconsDir, {withFileTypes: true})).filter(x => x.isDirectory()).map(x => x.name).sort()
            // index.ts
            let imports = ''
            let exports = ''

            for (const size of iconSizes) {
                const iconsDirFromSize = path.join(iconsDir, size)
                // Сортируем, чтобы порядок не зависел от ОС и генерация не давала лишних диффов.
                const iconFiles = fs.readdirSync(iconsDirFromSize).filter((file) => file.endsWith('.svg')).sort()

                for (const file of iconFiles) {
                    const iconName = file.replace('.svg', '')
                    const componentName = transformIconName(iconName.slice(0, iconName.length - size.length), size)
                    const importPath = `@vkontakte/icons/src/svg/${size}/${file}?component`
                    imports += `import _${componentName} from '${importPath}';\n`
                    // Явный тип нужен, чтобы в .d.ts не попал импорт ?component: у потребителя он не резолвится и превращается в any.
                    exports += `export const ${componentName}: IconComponent = _${componentName};\n`
                }

                imports += '\n'
                exports += '\n'
            }


            const content = `// Auto generated component declarations
import type { FunctionalComponent, SVGAttributes } from 'vue';

${imports}
export type IconComponent = FunctionalComponent<SVGAttributes>;

${exports}`

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
